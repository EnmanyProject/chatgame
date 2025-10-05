/**
 * Special Event System
 * @description 특별 이벤트 트리거 및 관리 시스템 (Phase 3 Milestone 2)
 * @version 3.2.0
 */

class SpecialEventSystem {
    constructor(characterId, multiCharacterState) {
        this.characterId = characterId;
        this.multiCharacterState = multiCharacterState;
        this.STORAGE_KEY = `special_events_${characterId}`;

        // 이벤트 데이터베이스 로드
        this.events = null;
        this.loadEvents();

        // 이벤트 히스토리 로드
        this.history = this.loadHistory();

        console.log('🎉 SpecialEventSystem 초기화 완료');
    }

    /**
     * 이벤트 데이터베이스 로드
     */
    async loadEvents() {
        try {
            const response = await fetch('/data/special-events.json');
            this.events = await response.json();
            console.log(`✅ ${this.events.events.length}개 특별 이벤트 로드 완료`);
        } catch (error) {
            console.error('❌ 이벤트 로드 실패:', error);
            this.events = { events: [] };
        }
    }

    /**
     * 이벤트 히스토리 로드
     */
    loadHistory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('❌ 이벤트 히스토리 로드 실패:', error);
        }

        return {
            triggeredEvents: [],         // 발생한 이벤트 ID들
            eventHistory: [],             // 이벤트 발생 히스토리
            lastEventCheck: Date.now(),   // 마지막 체크 시간
            eventCount: 0                 // 총 이벤트 발생 수
        };
    }

    /**
     * 이벤트 히스토리 저장
     */
    saveHistory() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
        } catch (error) {
            console.error('❌ 이벤트 히스토리 저장 실패:', error);
        }
    }

    /**
     * 모든 이벤트 조건 체크
     */
    checkAllEvents() {
        if (!this.events || !this.events.events) {
            console.warn('⚠️ 이벤트 데이터가 로드되지 않음');
            return null;
        }

        const state = this.multiCharacterState.getState(this.characterId);
        const now = Date.now();

        for (const event of this.events.events) {
            // 이미 발생한 일회성 이벤트는 스킵
            if (event.once && this.history.triggeredEvents.includes(event.id)) {
                continue;
            }

            // 조건 체크
            if (this.checkEventCondition(event, state, now)) {
                return this.triggerEvent(event);
            }
        }

        return null;
    }

    /**
     * 이벤트 조건 체크
     * @param {object} event - 이벤트 객체
     * @param {object} state - 캐릭터 상태
     * @param {number} now - 현재 시간
     */
    checkEventCondition(event, state, now) {
        const condition = event.condition;

        switch (condition.type) {
            case 'affection':
                return this.checkAffectionCondition(condition, state);

            case 'date':
                return this.checkDateCondition(condition, now);

            case 'time':
                return this.checkTimeCondition(condition, now);

            case 'behavior':
                return this.checkBehaviorCondition(condition, state);

            case 'random':
                return this.checkRandomCondition(condition);

            case 'combo':
                return this.checkComboCondition(condition, state, now);

            default:
                return false;
        }
    }

    /**
     * 호감도 조건 체크
     */
    checkAffectionCondition(condition, state) {
        const affection = state.affection;

        if (condition.min !== undefined && affection < condition.min) {
            return false;
        }

        if (condition.max !== undefined && affection > condition.max) {
            return false;
        }

        if (condition.exact !== undefined && affection !== condition.exact) {
            return false;
        }

        return true;
    }

    /**
     * 날짜 조건 체크
     */
    checkDateCondition(condition, now) {
        const today = new Date(now);

        // 특정 날짜 체크 (MM-DD 형식)
        if (condition.date) {
            const [month, day] = condition.date.split('-').map(Number);
            return today.getMonth() + 1 === month && today.getDate() === day;
        }

        // 캐릭터 생성 후 N일 경과
        if (condition.daysAfterMeet) {
            const state = this.multiCharacterState.getState(this.characterId);
            const daysSinceMeet = Math.floor((now - state.createdAt) / (1000 * 60 * 60 * 24));
            return daysSinceMeet === condition.daysAfterMeet;
        }

        return false;
    }

    /**
     * 시간 조건 체크
     */
    checkTimeCondition(condition, now) {
        const hour = new Date(now).getHours();

        if (condition.hourMin !== undefined && hour < condition.hourMin) {
            return false;
        }

        if (condition.hourMax !== undefined && hour > condition.hourMax) {
            return false;
        }

        return true;
    }

    /**
     * 행동 조건 체크
     */
    checkBehaviorCondition(condition, state) {
        // 무응답 시간 체크
        if (condition.noResponseHours) {
            const lastResponse = state.lastPlayedAt;
            const hoursSinceResponse = (Date.now() - lastResponse) / (1000 * 60 * 60);
            return hoursSinceResponse >= condition.noResponseHours;
        }

        // 연속 긍정 선택 체크
        if (condition.consecutivePositive) {
            const recentChoices = state.choicesMade.slice(-condition.consecutivePositive);
            return recentChoices.every(c => c.affectionImpact > 0);
        }

        // 총 메시지 수 체크
        if (condition.totalMessages) {
            return state.messageCount >= condition.totalMessages;
        }

        return false;
    }

    /**
     * 랜덤 조건 체크
     */
    checkRandomCondition(condition) {
        const chance = condition.chance || 0.1; // 기본 10% 확률
        return Math.random() < chance;
    }

    /**
     * 복합 조건 체크
     */
    checkComboCondition(condition, state, now) {
        const conditions = condition.conditions || [];

        for (const subCondition of conditions) {
            const tempEvent = { condition: subCondition };
            if (!this.checkEventCondition(tempEvent, state, now)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 이벤트 발생
     * @param {object} event - 발생시킬 이벤트
     */
    triggerEvent(event) {
        // 히스토리에 추가
        this.history.triggeredEvents.push(event.id);
        this.history.eventHistory.push({
            eventId: event.id,
            timestamp: Date.now(),
            affection: this.multiCharacterState.getState(this.characterId).affection
        });
        this.history.eventCount++;

        // 최근 50개만 유지
        if (this.history.eventHistory.length > 50) {
            this.history.eventHistory = this.history.eventHistory.slice(-50);
        }

        this.saveHistory();

        console.log(`🎉 특별 이벤트 발생: ${event.name} (${event.id})`);

        return {
            id: event.id,
            name: event.name,
            category: event.category,
            message: event.message,
            choices: event.choices || [],
            emotionChange: event.emotionChange || null,
            affectionChange: event.affectionChange || 0
        };
    }

    /**
     * 특정 이벤트 강제 발생
     * @param {string} eventId - 이벤트 ID
     */
    forceTriggerEvent(eventId) {
        if (!this.events || !this.events.events) {
            console.error('❌ 이벤트 데이터가 없음');
            return null;
        }

        const event = this.events.events.find(e => e.id === eventId);
        if (!event) {
            console.error(`❌ 이벤트를 찾을 수 없음: ${eventId}`);
            return null;
        }

        return this.triggerEvent(event);
    }

    /**
     * 이벤트 발생 여부 체크
     * @param {string} eventId - 이벤트 ID
     */
    hasTriggered(eventId) {
        return this.history.triggeredEvents.includes(eventId);
    }

    /**
     * 카테고리별 이벤트 조회
     * @param {string} category - 카테고리
     */
    getEventsByCategory(category) {
        if (!this.events) return [];
        return this.events.events.filter(e => e.category === category);
    }

    /**
     * 발생한 이벤트 통계
     */
    getEventStats() {
        const stats = {
            total: this.history.eventCount,
            unique: this.history.triggeredEvents.length,
            recent: this.history.eventHistory.slice(-10)
        };

        // 카테고리별 통계
        const categories = {};
        this.history.eventHistory.forEach(h => {
            const event = this.events?.events.find(e => e.id === h.eventId);
            if (event) {
                categories[event.category] = (categories[event.category] || 0) + 1;
            }
        });
        stats.byCategory = categories;

        return stats;
    }

    /**
     * 다음 이벤트 예측
     */
    predictNextEvents() {
        if (!this.events) return [];

        const state = this.multiCharacterState.getState(this.characterId);
        const predictions = [];

        for (const event of this.events.events) {
            // 이미 발생한 일회성 이벤트는 제외
            if (event.once && this.hasTriggered(event.id)) {
                continue;
            }

            // 조건에 가까운 이벤트 찾기
            const distance = this.calculateConditionDistance(event, state);
            if (distance !== null && distance < 100) {
                predictions.push({
                    event,
                    distance,
                    description: this.getDistanceDescription(event, state, distance)
                });
            }
        }

        // 거리 순으로 정렬
        predictions.sort((a, b) => a.distance - b.distance);

        return predictions.slice(0, 5); // 상위 5개
    }

    /**
     * 조건까지의 거리 계산
     */
    calculateConditionDistance(event, state) {
        const condition = event.condition;

        switch (condition.type) {
            case 'affection':
                if (condition.min && state.affection < condition.min) {
                    return condition.min - state.affection;
                }
                return 0;

            case 'behavior':
                if (condition.totalMessages && state.messageCount < condition.totalMessages) {
                    return condition.totalMessages - state.messageCount;
                }
                return 0;

            default:
                return null;
        }
    }

    /**
     * 거리 설명 생성
     */
    getDistanceDescription(event, state, distance) {
        const condition = event.condition;

        if (condition.type === 'affection') {
            return `호감도 ${distance}만큼 더 필요`;
        }

        if (condition.type === 'behavior' && condition.totalMessages) {
            return `메시지 ${distance}개 더 필요`;
        }

        return '곧 발생 가능';
    }

    /**
     * 이벤트 히스토리 리셋 (개발/테스트용)
     */
    reset() {
        this.history = {
            triggeredEvents: [],
            eventHistory: [],
            lastEventCheck: Date.now(),
            eventCount: 0
        };
        this.saveHistory();
        console.log('🔄 이벤트 히스토리 리셋 완료');
    }

    /**
     * 디버깅용 출력
     */
    debug() {
        console.log('=== 🎉 특별 이벤트 시스템 ===');
        console.log(`총 이벤트: ${this.events?.events.length || 0}`);
        console.log(`발생한 이벤트: ${this.history.triggeredEvents.length}`);
        console.log('이벤트 통계:', this.getEventStats());
        console.log('다음 이벤트 예측:', this.predictNextEvents());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpecialEventSystem;
}
