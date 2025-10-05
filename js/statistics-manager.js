/**
 * Statistics Manager
 * @description 게임 통계 수집 및 관리 시스템 (Phase 3 Milestone 1)
 * @version 3.1.0
 */

class StatisticsManager {
    constructor() {
        this.STORAGE_KEY = 'chatgame_statistics';
        this.stats = this.loadStats();
        console.log('📊 StatisticsManager 초기화 완료');
    }

    /**
     * 통계 데이터 로드
     */
    loadStats() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const stats = JSON.parse(data);
                console.log('📥 통계 데이터 로드:', stats);
                return stats;
            }
        } catch (error) {
            console.error('❌ 통계 데이터 로드 실패:', error);
        }

        // 기본 통계 구조
        return {
            global: {
                firstPlayDate: Date.now(),
                totalPlayTime: 0,
                lastPlayDate: Date.now(),
                totalSessions: 0
            },
            characters: {},
            achievements: {
                unlocked: [],
                progress: {}
            }
        };
    }

    /**
     * 통계 데이터 저장
     */
    saveStats() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
            console.log('💾 통계 데이터 저장 완료');
        } catch (error) {
            console.error('❌ 통계 데이터 저장 실패:', error);
        }
    }

    /**
     * 캐릭터 통계 초기화
     */
    initCharacterStats(characterId) {
        if (this.stats.characters[characterId]) {
            return this.stats.characters[characterId];
        }

        this.stats.characters[characterId] = {
            characterId,
            firstMeetDate: Date.now(),
            lastChatDate: Date.now(),

            // 대화 통계
            totalMessages: 0,
            userMessages: 0,
            characterMessages: 0,

            // 선택지 통계
            totalChoices: 0,
            positiveChoices: 0,
            negativeChoices: 0,
            neutralChoices: 0,

            // 호감도 통계
            affectionHistory: [{ date: Date.now(), value: 0 }],
            maxAffection: 0,
            minAffection: 0,
            avgAffection: 0,

            // 관계 마일스톤
            relationshipMilestones: [],

            // 상호작용 통계
            photosReceived: 0,
            proactiveContactsReceived: 0,
            eventsExperienced: 0,

            // 플레이 시간
            totalPlayTime: 0,
            sessionCount: 0,
            longestSession: 0,

            // 연속 플레이
            consecutiveDays: 0,
            lastPlayDay: null
        };

        this.saveStats();
        console.log(`✅ ${characterId} 통계 초기화`);
        return this.stats.characters[characterId];
    }

    /**
     * 전역 통계 업데이트
     */
    updateGlobalStats(updates) {
        this.stats.global = {
            ...this.stats.global,
            ...updates,
            lastPlayDate: Date.now()
        };
        this.saveStats();
    }

    /**
     * 세션 시작 기록
     */
    startSession() {
        this.sessionStartTime = Date.now();
        this.stats.global.totalSessions = (this.stats.global.totalSessions || 0) + 1;
        this.saveStats();
        console.log('🎮 세션 시작:', this.stats.global.totalSessions);
    }

    /**
     * 세션 종료 기록
     */
    endSession(characterId = null) {
        if (!this.sessionStartTime) return;

        const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        this.stats.global.totalPlayTime += duration;

        if (characterId && this.stats.characters[characterId]) {
            const charStats = this.stats.characters[characterId];
            charStats.totalPlayTime += duration;
            charStats.sessionCount++;
            charStats.longestSession = Math.max(charStats.longestSession, duration);
            charStats.lastChatDate = Date.now();

            // 연속 플레이 계산
            this.updateConsecutiveDays(characterId);
        }

        this.saveStats();
        console.log(`⏱️ 세션 종료: ${duration}초`);
        this.sessionStartTime = null;
    }

    /**
     * 연속 플레이 일수 업데이트
     */
    updateConsecutiveDays(characterId) {
        const charStats = this.stats.characters[characterId];
        const today = new Date().toDateString();
        const lastDay = charStats.lastPlayDay;

        if (!lastDay) {
            charStats.consecutiveDays = 1;
        } else {
            const lastDate = new Date(lastDay);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // 연속
                charStats.consecutiveDays++;
            } else if (diffDays === 0) {
                // 같은 날
                // 변화 없음
            } else {
                // 연속 끊김
                charStats.consecutiveDays = 1;
            }
        }

        charStats.lastPlayDay = today;
        this.saveStats();
    }

    /**
     * 메시지 기록
     */
    recordMessage(characterId, isUserMessage = true) {
        const charStats = this.initCharacterStats(characterId);

        charStats.totalMessages++;
        if (isUserMessage) {
            charStats.userMessages++;
        } else {
            charStats.characterMessages++;
        }

        this.saveStats();
    }

    /**
     * 선택지 기록
     */
    recordChoice(characterId, affectionImpact) {
        const charStats = this.initCharacterStats(characterId);

        charStats.totalChoices++;

        if (affectionImpact > 0) {
            charStats.positiveChoices++;
        } else if (affectionImpact < 0) {
            charStats.negativeChoices++;
        } else {
            charStats.neutralChoices++;
        }

        this.saveStats();
    }

    /**
     * 호감도 변화 기록
     */
    recordAffectionChange(characterId, newAffection) {
        const charStats = this.initCharacterStats(characterId);

        // 히스토리 추가
        charStats.affectionHistory.push({
            date: Date.now(),
            value: newAffection
        });

        // 최근 100개만 유지
        if (charStats.affectionHistory.length > 100) {
            charStats.affectionHistory = charStats.affectionHistory.slice(-100);
        }

        // 최대/최소 업데이트
        charStats.maxAffection = Math.max(charStats.maxAffection, newAffection);
        charStats.minAffection = Math.min(charStats.minAffection, newAffection);

        // 평균 계산
        const sum = charStats.affectionHistory.reduce((acc, item) => acc + item.value, 0);
        charStats.avgAffection = Math.round(sum / charStats.affectionHistory.length);

        // 마일스톤 체크
        this.checkAffectionMilestone(characterId, newAffection);

        this.saveStats();
    }

    /**
     * 호감도 마일스톤 체크
     */
    checkAffectionMilestone(characterId, affection) {
        const charStats = this.stats.characters[characterId];
        const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

        milestones.forEach(milestone => {
            const key = `affection_${milestone}`;
            if (affection >= milestone && !charStats.relationshipMilestones.includes(key)) {
                charStats.relationshipMilestones.push(key);
                console.log(`🎉 마일스톤 달성: 호감도 ${milestone}`);

                // 업적 체크
                if (typeof window.achievementSystem !== 'undefined') {
                    window.achievementSystem.checkAchievement(`affection_${milestone}`);
                }
            }
        });
    }

    /**
     * 사진 수신 기록
     */
    recordPhotoReceived(characterId) {
        const charStats = this.initCharacterStats(characterId);
        charStats.photosReceived++;
        this.saveStats();
        console.log(`📸 사진 수신: ${charStats.photosReceived}개`);
    }

    /**
     * 먼저 연락 수신 기록
     */
    recordProactiveContact(characterId) {
        const charStats = this.initCharacterStats(characterId);
        charStats.proactiveContactsReceived++;
        this.saveStats();
        console.log(`💌 먼저 연락: ${charStats.proactiveContactsReceived}회`);
    }

    /**
     * 이벤트 경험 기록
     */
    recordEventExperienced(characterId, eventType) {
        const charStats = this.initCharacterStats(characterId);
        charStats.eventsExperienced++;
        this.saveStats();
        console.log(`🎉 이벤트 경험: ${eventType}`);
    }

    /**
     * 캐릭터 통계 조회
     */
    getCharacterStats(characterId) {
        return this.stats.characters[characterId] || this.initCharacterStats(characterId);
    }

    /**
     * 전역 통계 조회
     */
    getGlobalStats() {
        return this.stats.global;
    }

    /**
     * 전체 통계 요약
     */
    getSummary() {
        const characterCount = Object.keys(this.stats.characters).length;
        const totalMessages = Object.values(this.stats.characters).reduce(
            (sum, char) => sum + char.totalMessages, 0
        );
        const totalChoices = Object.values(this.stats.characters).reduce(
            (sum, char) => sum + char.totalChoices, 0
        );

        return {
            global: this.stats.global,
            characterCount,
            totalMessages,
            totalChoices,
            unlockedAchievements: this.stats.achievements.unlocked.length
        };
    }

    /**
     * 호감도 그래프 데이터 생성
     */
    getAffectionGraphData(characterId) {
        const charStats = this.stats.characters[characterId];
        if (!charStats) return [];

        return charStats.affectionHistory.map(item => ({
            timestamp: item.date,
            date: new Date(item.date).toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit'
            }),
            affection: item.value
        }));
    }

    /**
     * 선택 패턴 분석
     */
    getChoicePattern(characterId) {
        const charStats = this.stats.characters[characterId];
        if (!charStats || charStats.totalChoices === 0) {
            return { positive: 0, negative: 0, neutral: 0 };
        }

        const total = charStats.totalChoices;
        return {
            positive: Math.round((charStats.positiveChoices / total) * 100),
            negative: Math.round((charStats.negativeChoices / total) * 100),
            neutral: Math.round((charStats.neutralChoices / total) * 100)
        };
    }

    /**
     * 플레이 시간 포맷팅
     */
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        } else if (minutes > 0) {
            return `${minutes}분 ${secs}초`;
        } else {
            return `${secs}초`;
        }
    }

    /**
     * 통계 리셋 (개발/테스트용)
     */
    resetStats() {
        if (confirm('정말로 모든 통계를 초기화하시겠습니까?')) {
            this.stats = {
                global: {
                    firstPlayDate: Date.now(),
                    totalPlayTime: 0,
                    lastPlayDate: Date.now(),
                    totalSessions: 0
                },
                characters: {},
                achievements: {
                    unlocked: [],
                    progress: {}
                }
            };
            this.saveStats();
            console.log('🗑️ 통계 초기화 완료');
            return true;
        }
        return false;
    }

    /**
     * 디버깅용 통계 출력
     */
    debugStats() {
        console.log('=== 📊 통계 현황 ===');
        console.log('전역:', this.stats.global);
        console.log('캐릭터:', this.stats.characters);
        console.log('업적:', this.stats.achievements);
        console.log('요약:', this.getSummary());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsManager;
}
