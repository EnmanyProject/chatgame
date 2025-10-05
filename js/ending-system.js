/**
 * Ending System
 * @description 관계 엔딩 시스템 (Phase 3 Milestone 4)
 * @version 3.4.0
 */

class EndingManager {
    constructor() {
        this.STORAGE_KEY = 'chatgame_ending_history';

        // 엔딩 데이터베이스
        this.endings = null;
        this.loadEndings();

        // 엔딩 히스토리
        this.history = this.loadHistory();

        console.log('🏁 EndingManager 초기화 완료');
    }

    /**
     * 엔딩 데이터베이스 로드
     */
    async loadEndings() {
        try {
            const response = await fetch('/data/endings.json');
            this.endings = await response.json();
            console.log(`✅ ${this.endings.endings.length}개 엔딩 로드 완료`);
        } catch (error) {
            console.error('❌ 엔딩 로드 실패:', error);
            this.endings = { endings: [], endingLevels: {} };
        }
    }

    /**
     * 엔딩 히스토리 로드
     */
    loadHistory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('❌ 엔딩 히스토리 로드 실패:', error);
        }

        return {
            achievedEndings: {},    // { characterId: [endingId1, endingId2, ...] }
            endingRecords: [],      // 엔딩 달성 기록
            totalEndings: 0,        // 총 엔딩 달성 수
            uniqueEndings: 0        // 고유 엔딩 수
        };
    }

    /**
     * 엔딩 히스토리 저장
     */
    saveHistory() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
        } catch (error) {
            console.error('❌ 엔딩 히스토리 저장 실패:', error);
        }
    }

    /**
     * 엔딩 조건 체크
     * @param {string} characterId - 캐릭터 ID
     * @param {object} state - 캐릭터 상태
     * @param {object} stats - 통계 정보
     * @param {object} memoryStats - 메모리 통계
     */
    checkEndingConditions(characterId, state, stats, memoryStats) {
        if (!this.endings || !this.endings.endings) {
            console.warn('⚠️ 엔딩 데이터가 로드되지 않음');
            return null;
        }

        const eligibleEndings = [];

        for (const ending of this.endings.endings) {
            // 호감도 체크
            if (!this.checkAffectionRequirement(ending, state.affection)) {
                continue;
            }

            // 메시지 수 체크
            if (!this.checkMessageRequirement(ending, state.messageCount)) {
                continue;
            }

            // 이벤트 체크
            if (!this.checkEventRequirement(ending, state.triggeredEvents || [])) {
                continue;
            }

            // 연속 플레이 일수 체크
            if (!this.checkConsecutiveDaysRequirement(ending, stats)) {
                continue;
            }

            // 최대 일수 체크 (스피드런용)
            if (!this.checkMaxDaysRequirement(ending, state)) {
                continue;
            }

            // 약속 이행 체크
            if (!this.checkPromisesKeptRequirement(ending, memoryStats)) {
                continue;
            }

            // 모든 조건을 만족하는 엔딩
            eligibleEndings.push({
                ending: ending,
                priority: this.calculateEndingPriority(ending)
            });
        }

        // 우선순위 정렬 (레벨 높은 순)
        eligibleEndings.sort((a, b) => b.priority - a.priority);

        return eligibleEndings.length > 0 ? eligibleEndings[0].ending : null;
    }

    /**
     * 호감도 조건 체크
     */
    checkAffectionRequirement(ending, affection) {
        if (!ending.requiredAffection) return true;

        const { min, max } = ending.requiredAffection;
        return affection >= min && affection <= max;
    }

    /**
     * 메시지 수 조건 체크
     */
    checkMessageRequirement(ending, messageCount) {
        if (!ending.requiredMessages) return true;
        return messageCount >= ending.requiredMessages;
    }

    /**
     * 이벤트 조건 체크
     */
    checkEventRequirement(ending, triggeredEvents) {
        if (!ending.requiredEvents || ending.requiredEvents.length === 0) {
            return true;
        }

        // 모든 필수 이벤트가 달성되었는지 체크
        return ending.requiredEvents.every(eventId =>
            triggeredEvents.includes(eventId)
        );
    }

    /**
     * 연속 플레이 일수 조건 체크
     */
    checkConsecutiveDaysRequirement(ending, stats) {
        if (!ending.requiredConsecutiveDays) return true;

        const consecutiveDays = stats?.consecutiveDays || 0;
        return consecutiveDays >= ending.requiredConsecutiveDays;
    }

    /**
     * 최대 일수 조건 체크 (스피드런용)
     */
    checkMaxDaysRequirement(ending, state) {
        if (!ending.requiredMaxDays) return true;

        const daysSinceCreation = Math.floor(
            (Date.now() - state.createdAt) / (1000 * 60 * 60 * 24)
        );
        return daysSinceCreation <= ending.requiredMaxDays;
    }

    /**
     * 약속 이행 조건 체크
     */
    checkPromisesKeptRequirement(ending, memoryStats) {
        if (!ending.requiredPromisesKept) return true;

        if (!memoryStats || !memoryStats.longTermMemory) return false;

        const promises = memoryStats.longTermMemory.promises || 0;
        return promises >= ending.requiredPromisesKept;
    }

    /**
     * 엔딩 우선순위 계산
     */
    calculateEndingPriority(ending) {
        let priority = ending.level * 100;

        // 히든 엔딩은 우선순위 높음
        if (ending.isHidden) {
            priority += 1000;
        }

        // 특별 엔딩도 우선순위 높음
        if (ending.isSpecial) {
            priority += 500;
        }

        return priority;
    }

    /**
     * 엔딩 트리거
     * @param {string} characterId - 캐릭터 ID
     * @param {object} ending - 엔딩 데이터
     */
    triggerEnding(characterId, ending) {
        // 엔딩 히스토리 기록
        if (!this.history.achievedEndings[characterId]) {
            this.history.achievedEndings[characterId] = [];
        }

        // 중복 체크
        if (!this.history.achievedEndings[characterId].includes(ending.id)) {
            this.history.achievedEndings[characterId].push(ending.id);
            this.history.uniqueEndings++;
        }

        // 엔딩 기록 추가
        this.history.endingRecords.push({
            characterId: characterId,
            endingId: ending.id,
            endingName: ending.name,
            endingLevel: ending.level,
            timestamp: Date.now(),
            isHidden: ending.isHidden || false,
            isSpecial: ending.isSpecial || false
        });

        // 최근 50개만 유지
        if (this.history.endingRecords.length > 50) {
            this.history.endingRecords = this.history.endingRecords.slice(-50);
        }

        this.history.totalEndings++;
        this.saveHistory();

        console.log(`🏁 엔딩 달성: ${ending.name} (${ending.id})`);

        return {
            endingId: ending.id,
            endingName: ending.name,
            level: ending.level,
            storyTitle: ending.storyTitle,
            story: ending.story,
            epilogue: ending.epilogue,
            rewards: ending.rewards,
            isFirstTime: this.isFirstTimeEnding(characterId, ending.id)
        };
    }

    /**
     * 처음 달성한 엔딩인지 체크
     */
    isFirstTimeEnding(characterId, endingId) {
        if (!this.history.achievedEndings[characterId]) {
            return true;
        }

        const achievements = this.history.achievedEndings[characterId];
        // 이번에 추가된 것이므로 개수가 1이면 처음
        return achievements.filter(id => id === endingId).length === 1;
    }

    /**
     * 캐릭터별 달성한 엔딩 목록
     */
    getAchievedEndings(characterId) {
        return this.history.achievedEndings[characterId] || [];
    }

    /**
     * 모든 엔딩 목록 (도감용)
     */
    getAllEndings() {
        if (!this.endings) return [];
        return this.endings.endings.map(ending => ({
            id: ending.id,
            name: ending.name,
            level: ending.level,
            description: ending.description,
            isHidden: ending.isHidden || false,
            isSpecial: ending.isSpecial || false,
            achieved: this.isEndingAchieved(ending.id)
        }));
    }

    /**
     * 엔딩 달성 여부
     */
    isEndingAchieved(endingId) {
        for (const characterId in this.history.achievedEndings) {
            if (this.history.achievedEndings[characterId].includes(endingId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 엔딩 달성률
     */
    getCompletionRate() {
        if (!this.endings || this.endings.endings.length === 0) {
            return 0;
        }

        const totalEndings = this.endings.endings.length;
        const achievedCount = this.history.uniqueEndings;

        return Math.floor((achievedCount / totalEndings) * 100);
    }

    /**
     * 엔딩 통계
     */
    getEndingStats() {
        return {
            totalEndings: this.history.totalEndings,
            uniqueEndings: this.history.uniqueEndings,
            completionRate: this.getCompletionRate(),
            recentEndings: this.history.endingRecords.slice(-10),
            endingsByLevel: this.getEndingsByLevel()
        };
    }

    /**
     * 레벨별 엔딩 통계
     */
    getEndingsByLevel() {
        const levelStats = {
            1: 0, // Bad
            2: 0, // Normal
            3: 0, // Friend
            4: 0, // Romantic
            5: 0, // True
            6: 0, // Hidden
            7: 0  // Hidden
        };

        this.history.endingRecords.forEach(record => {
            if (levelStats[record.endingLevel] !== undefined) {
                levelStats[record.endingLevel]++;
            }
        });

        return levelStats;
    }

    /**
     * 엔딩 UI 데이터 생성
     */
    generateEndingUI(endingResult) {
        if (!endingResult) return null;

        const ending = endingResult;
        const levelInfo = this.endings.endingLevels[ending.level] || {};

        return {
            title: ending.storyTitle,
            icon: levelInfo.icon || '🏁',
            color: levelInfo.color || '#808080',
            story: ending.story,
            epilogue: ending.epilogue,
            isFirstTime: ending.isFirstTime,
            rewards: ending.rewards,
            replayable: ending.canReplay
        };
    }

    /**
     * 엔딩 리셋 (개발/테스트용)
     */
    reset() {
        this.history = {
            achievedEndings: {},
            endingRecords: [],
            totalEndings: 0,
            uniqueEndings: 0
        };
        this.saveHistory();
        console.log('🔄 엔딩 히스토리 리셋 완료');
    }

    /**
     * 디버깅용 출력
     */
    debug() {
        console.log('=== 🏁 엔딩 시스템 ===');
        console.log('총 엔딩:', this.endings?.endings.length || 0);
        console.log('달성한 엔딩:', this.history.uniqueEndings);
        console.log('달성률:', this.getCompletionRate() + '%');
        console.log('엔딩 통계:', this.getEndingStats());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EndingManager;
}
