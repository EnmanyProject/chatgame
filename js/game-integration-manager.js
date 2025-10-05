/**
 * Game Integration Manager
 * @description 모든 Phase 3 시스템 통합 관리 (Phase 3 Milestone 4)
 * @version 3.4.0
 */

class GameIntegrationManager {
    constructor(multiCharacterState) {
        this.multiCharacterState = multiCharacterState;
        this.performanceMetrics = {};
        this.eventLog = [];

        console.log('🎮 GameIntegrationManager 초기화 완료');
    }

    /**
     * 호감도 변경 이벤트 통합 처리
     * @param {string} characterId - 캐릭터 ID
     * @param {number} delta - 호감도 변화량
     * @param {string} mbtiType - MBTI 타입
     * @param {object} context - 추가 컨텍스트
     */
    onAffectionChange(characterId, delta, mbtiType = 'ENFP', context = {}) {
        const startTime = performance.now();

        try {
            // 1. EmotionStateSystem 알림
            const emotionSystem = this.multiCharacterState.getEmotionSystem(characterId, mbtiType);
            if (emotionSystem) {
                emotionSystem.onAffectionChange(delta);
                this.logEvent('emotion_updated', characterId, { delta });
            }

            // 2. SpecialEventSystem 체크
            const eventSystem = this.multiCharacterState.getEventSystem(characterId);
            if (eventSystem) {
                const specialEvent = eventSystem.checkAllEvents();
                if (specialEvent) {
                    this.logEvent('special_event_triggered', characterId, specialEvent);

                    // 이벤트로 인한 추가 감정 변화
                    if (specialEvent.emotionChange && emotionSystem) {
                        emotionSystem.changeEmotion(
                            specialEvent.emotionChange.emotion,
                            specialEvent.emotionChange.intensity,
                            'special_event'
                        );
                    }

                    // 컨텍스트에 이벤트 정보 추가
                    context.eventTriggered = specialEvent.id;
                }
            }

            // 3. AchievementSystem 체크
            if (this.multiCharacterState.achievementSystem) {
                this.multiCharacterState.achievementSystem.checkAllAchievements();
                this.logEvent('achievements_checked', characterId);
            }

            // 4. EndingManager 조건 체크 (중요 마일스톤에서만)
            if (Math.abs(delta) >= 5 || context.checkEnding) {
                this.checkEndingConditions(characterId);
            }

            this.recordPerformance('affection_change', performance.now() - startTime);

        } catch (error) {
            console.error('❌ 호감도 변경 통합 처리 오류:', error);
        }

        return context;
    }

    /**
     * 메시지 전송 이벤트 통합 처리
     * @param {string} characterId - 캐릭터 ID
     * @param {string} role - 'user' 또는 'character'
     * @param {string} message - 메시지 내용
     * @param {object} context - 추가 컨텍스트
     */
    onMessage(characterId, role, message, context = {}) {
        const startTime = performance.now();

        try {
            // 1. ConversationMemorySystem 기록
            const memorySystem = this.multiCharacterState.getMemorySystem(characterId);
            if (memorySystem && message) {
                memorySystem.addMessage(role, message, context);
                this.logEvent('message_recorded', characterId, { role, length: message.length });
            }

            // 2. StatisticsManager 기록
            if (this.multiCharacterState.statisticsManager) {
                const isUser = role === 'user';
                this.multiCharacterState.statisticsManager.recordMessage(characterId, isUser);
            }

            // 3. 메모리 기반 이벤트 체크
            if (memorySystem && role === 'user') {
                // 약속 관련 키워드가 있으면 특별 처리
                const extracted = memorySystem.memoryExtractor
                    ? memorySystem.memoryExtractor.extractAll(message, context)
                    : null;

                if (extracted && extracted.promises.length > 0) {
                    this.logEvent('promise_detected', characterId, extracted.promises);
                }
            }

            this.recordPerformance('message', performance.now() - startTime);

        } catch (error) {
            console.error('❌ 메시지 통합 처리 오류:', error);
        }
    }

    /**
     * 선택지 선택 이벤트 통합 처리
     * @param {string} characterId - 캐릭터 ID
     * @param {object} choice - 선택지 정보
     * @param {object} context - 추가 컨텍스트
     */
    onChoice(characterId, choice, context = {}) {
        const startTime = performance.now();

        try {
            // 1. 호감도 변경
            const affectionDelta = choice.affection_impact || 0;
            if (affectionDelta !== 0) {
                context.affectionChange = affectionDelta;
                this.onAffectionChange(characterId, affectionDelta, context.mbtiType, context);
            }

            // 2. 통계 기록
            if (this.multiCharacterState.statisticsManager) {
                this.multiCharacterState.statisticsManager.recordChoice(
                    characterId,
                    affectionDelta
                );
            }

            // 3. 선택지 히스토리 기록 (메모리 시스템)
            const choiceText = choice.text || '선택';
            this.onMessage(characterId, 'user', choiceText, {
                ...context,
                isChoice: true,
                affectionChange: affectionDelta
            });

            this.logEvent('choice_made', characterId, choice);
            this.recordPerformance('choice', performance.now() - startTime);

        } catch (error) {
            console.error('❌ 선택지 통합 처리 오류:', error);
        }
    }

    /**
     * 사진 수신 이벤트 통합 처리
     * @param {string} characterId - 캐릭터 ID
     * @param {object} photoData - 사진 정보
     */
    onPhotoReceived(characterId, photoData) {
        const startTime = performance.now();

        try {
            // 1. 통계 기록
            if (this.multiCharacterState.statisticsManager) {
                this.multiCharacterState.statisticsManager.recordPhotoReceived(characterId);
            }

            // 2. 업적 체크
            if (this.multiCharacterState.achievementSystem) {
                this.multiCharacterState.achievementSystem.checkAllAchievements();
            }

            // 3. 메모리 기록
            const memorySystem = this.multiCharacterState.getMemorySystem(characterId);
            if (memorySystem) {
                memorySystem.addMessage('character', '사진을 보냈습니다 📷', {
                    photoData: photoData,
                    eventTriggered: 'photo_sent'
                });
            }

            this.logEvent('photo_received', characterId, photoData);
            this.recordPerformance('photo', performance.now() - startTime);

        } catch (error) {
            console.error('❌ 사진 수신 통합 처리 오류:', error);
        }
    }

    /**
     * 먼저 연락 이벤트 통합 처리
     * @param {string} characterId - 캐릭터 ID
     * @param {object} contactData - 연락 정보
     */
    onProactiveContact(characterId, contactData) {
        const startTime = performance.now();

        try {
            // 1. 통계 기록
            if (this.multiCharacterState.statisticsManager) {
                this.multiCharacterState.statisticsManager.recordProactiveContact(characterId);
            }

            // 2. 감정 상태에 따른 메시지 톤 조정
            const emotionSystem = this.multiCharacterState.getEmotionSystem(characterId);
            if (emotionSystem) {
                const emotionState = emotionSystem.getState();
                contactData.emotionContext = emotionState;
            }

            // 3. 메모리 기록
            const memorySystem = this.multiCharacterState.getMemorySystem(characterId);
            if (memorySystem && contactData.message) {
                memorySystem.addMessage('character', contactData.message, {
                    eventTriggered: 'proactive_contact'
                });
            }

            this.logEvent('proactive_contact', characterId, contactData);
            this.recordPerformance('proactive_contact', performance.now() - startTime);

        } catch (error) {
            console.error('❌ 먼저 연락 통합 처리 오류:', error);
        }
    }

    /**
     * 엔딩 조건 체크
     * @param {string} characterId - 캐릭터 ID
     */
    checkEndingConditions(characterId) {
        try {
            const endingManager = this.multiCharacterState.endingManager;
            if (!endingManager) return null;

            // 필요한 데이터 수집
            const state = this.multiCharacterState.getState(characterId);
            const stats = this.multiCharacterState.statisticsManager
                ? this.multiCharacterState.statisticsManager.getCharacterStats(characterId)
                : {};
            const memoryStats = this.multiCharacterState.getMemoryStats(characterId);

            // 특별 이벤트 목록 추가
            const eventSystem = this.multiCharacterState.getEventSystem(characterId);
            if (eventSystem) {
                state.triggeredEvents = eventSystem.history.triggeredEvents;
            }

            // 엔딩 조건 체크
            const eligibleEnding = endingManager.checkEndingConditions(
                characterId,
                state,
                stats,
                memoryStats
            );

            if (eligibleEnding) {
                this.logEvent('ending_available', characterId, eligibleEnding);
                return eligibleEnding;
            }

            return null;

        } catch (error) {
            console.error('❌ 엔딩 조건 체크 오류:', error);
            return null;
        }
    }

    /**
     * 엔딩 트리거
     * @param {string} characterId - 캐릭터 ID
     * @param {object} ending - 엔딩 데이터
     */
    triggerEnding(characterId, ending) {
        try {
            const endingManager = this.multiCharacterState.endingManager;
            if (!endingManager) return null;

            // 엔딩 발동
            const endingResult = endingManager.triggerEnding(characterId, ending);

            // 보상 처리
            if (endingResult.rewards && endingResult.rewards.achievements) {
                for (const achievementId of endingResult.rewards.achievements) {
                    // 업적 강제 해제 (엔딩 보상)
                    if (this.multiCharacterState.achievementSystem) {
                        // TODO: 업적 강제 해제 기능 추가 필요
                        this.logEvent('achievement_unlocked', characterId, { achievementId });
                    }
                }
            }

            this.logEvent('ending_triggered', characterId, endingResult);

            return endingResult;

        } catch (error) {
            console.error('❌ 엔딩 트리거 오류:', error);
            return null;
        }
    }

    /**
     * AI 프롬프트용 통합 컨텍스트 생성
     * @param {string} characterId - 캐릭터 ID
     * @param {string} currentMessage - 현재 유저 메시지
     */
    generateAIContext(characterId, currentMessage = '') {
        const startTime = performance.now();

        const context = {
            // 기본 정보
            characterState: this.multiCharacterState.getState(characterId),

            // 메모리 컨텍스트
            memory: this.multiCharacterState.generateMemoryContext(characterId, currentMessage),

            // 감정 상태
            emotion: null,

            // 최근 이벤트
            recentEvents: [],

            // 통계
            stats: null
        };

        try {
            // 감정 시스템
            const emotionSystem = this.multiCharacterState.getEmotionSystem(characterId);
            if (emotionSystem) {
                context.emotion = emotionSystem.getState();
            }

            // 이벤트 시스템
            const eventSystem = this.multiCharacterState.getEventSystem(characterId);
            if (eventSystem) {
                context.recentEvents = eventSystem.history.eventHistory.slice(-5);
            }

            // 통계
            if (this.multiCharacterState.statisticsManager) {
                context.stats = this.multiCharacterState.statisticsManager
                    .getCharacterStats(characterId);
            }

            this.recordPerformance('ai_context', performance.now() - startTime);

        } catch (error) {
            console.error('❌ AI 컨텍스트 생성 오류:', error);
        }

        return context;
    }

    /**
     * 전체 게임 상태 조회
     */
    getFullGameState(characterId) {
        return {
            character: this.multiCharacterState.getState(characterId),
            statistics: this.multiCharacterState.statisticsManager
                ? this.multiCharacterState.statisticsManager.getCharacterStats(characterId)
                : null,
            emotion: this.multiCharacterState.getEmotionSystem(characterId)?.getState(),
            memory: this.multiCharacterState.getMemoryStats(characterId),
            events: this.multiCharacterState.getEventSystem(characterId)?.getEventStats(),
            achievements: this.multiCharacterState.achievementSystem?.getAchievementStats(),
            endings: this.multiCharacterState.endingManager?.getAchievedEndings(characterId)
        };
    }

    /**
     * 이벤트 로깅
     */
    logEvent(eventType, characterId, data = {}) {
        const event = {
            type: eventType,
            characterId: characterId,
            timestamp: Date.now(),
            data: data
        };

        this.eventLog.push(event);

        // 최근 100개만 유지
        if (this.eventLog.length > 100) {
            this.eventLog = this.eventLog.slice(-100);
        }

        console.log(`📊 [${eventType}] ${characterId}`, data);
    }

    /**
     * 성능 메트릭 기록
     */
    recordPerformance(operation, duration) {
        if (!this.performanceMetrics[operation]) {
            this.performanceMetrics[operation] = {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                maxTime: 0
            };
        }

        const metric = this.performanceMetrics[operation];
        metric.count++;
        metric.totalTime += duration;
        metric.avgTime = metric.totalTime / metric.count;
        metric.maxTime = Math.max(metric.maxTime, duration);
    }

    /**
     * 시스템 상태 체크
     */
    checkSystemHealth() {
        const health = {
            statistics: !!this.multiCharacterState.statisticsManager,
            achievements: !!this.multiCharacterState.achievementSystem,
            emotions: Object.keys(this.multiCharacterState.emotionSystems).length > 0,
            events: Object.keys(this.multiCharacterState.eventSystems).length > 0,
            memory: Object.keys(this.multiCharacterState.memorySystems).length > 0,
            endings: !!this.multiCharacterState.endingManager
        };

        const allHealthy = Object.values(health).every(v => v === true);

        return {
            healthy: allHealthy,
            systems: health,
            warnings: this.getSystemWarnings(health)
        };
    }

    /**
     * 시스템 경고 생성
     */
    getSystemWarnings(health) {
        const warnings = [];

        if (!health.statistics) warnings.push('StatisticsManager가 초기화되지 않음');
        if (!health.achievements) warnings.push('AchievementSystem이 초기화되지 않음');
        if (!health.endings) warnings.push('EndingManager가 초기화되지 않음');

        return warnings;
    }

    /**
     * 성능 리포트
     */
    getPerformanceReport() {
        return {
            metrics: this.performanceMetrics,
            eventLogSize: this.eventLog.length,
            recentEvents: this.eventLog.slice(-10)
        };
    }

    /**
     * 디버깅용 덤프
     */
    debug(characterId) {
        console.log('=== 🎮 게임 통합 상태 ===');
        console.log('시스템 상태:', this.checkSystemHealth());
        console.log('전체 게임 상태:', this.getFullGameState(characterId));
        console.log('성능 메트릭:', this.performanceMetrics);
        console.log('최근 이벤트:', this.eventLog.slice(-10));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameIntegrationManager;
}
