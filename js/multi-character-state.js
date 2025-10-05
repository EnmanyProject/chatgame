/**
 * MultiCharacterState - 다중 캐릭터 독립 상태 관리 시스템
 *
 * 주요 기능:
 * - 캐릭터별 완전히 독립적인 게임 상태 관리
 * - 각 캐릭터마다 별도의 호감도, 관계, 대화 히스토리
 * - LocalStorage 기반 영구 저장
 * - 기존 CharacterStateManager와 호환
 */

class MultiCharacterState {
    constructor() {
        this.STORAGE_KEY = 'chatgame_multi_character_states';
        this.states = this.loadStates();

        // Phase 3 Milestone 1: 통계 시스템 통합
        this.statisticsManager = null;
        this.achievementSystem = null;
        this.initializeStatsSystems();

        // Phase 3 Milestone 2: 감정/이벤트 시스템 통합
        this.emotionSystems = {};      // 캐릭터별 EmotionStateSystem
        this.eventSystems = {};         // 캐릭터별 SpecialEventSystem
        this.initializeEmotionEventSystems();

        // Phase 3 Milestone 3: 대화 기억 시스템 통합
        this.memorySystems = {};        // 캐릭터별 ConversationMemorySystem
        this.memoryExtractor = null;    // 공통 MemoryExtractor
        this.initializeMemorySystems();

        console.log('🎮 MultiCharacterState 초기화 완료');
    }

    /**
     * Phase 3 Milestone 1: 통계 시스템 초기화
     */
    initializeStatsSystems() {
        if (typeof StatisticsManager !== 'undefined') {
            this.statisticsManager = new StatisticsManager();
            console.log('✅ StatisticsManager 통합 완료');
        }

        if (typeof AchievementSystem !== 'undefined' && this.statisticsManager) {
            this.achievementSystem = new AchievementSystem(this.statisticsManager);
            console.log('✅ AchievementSystem 통합 완료');
        }
    }

    /**
     * Phase 3 Milestone 2: 감정/이벤트 시스템 초기화
     */
    initializeEmotionEventSystems() {
        // 감정/이벤트 시스템은 캐릭터별로 동적 생성됨
        console.log('✅ 감정/이벤트 시스템 준비 완료');
    }

    /**
     * Phase 3 Milestone 3: 대화 기억 시스템 초기화
     */
    initializeMemorySystems() {
        // 공통 MemoryExtractor 생성
        if (typeof MemoryExtractor !== 'undefined') {
            this.memoryExtractor = new MemoryExtractor();
            console.log('✅ MemoryExtractor 통합 완료');
        }

        // 메모리 시스템은 캐릭터별로 동적 생성됨
        console.log('✅ 대화 기억 시스템 준비 완료');
    }

    /**
     * Phase 3 Milestone 2: 캐릭터별 감정 시스템 가져오기
     * @param {string} characterId - 캐릭터 ID
     * @param {string} mbtiType - MBTI 타입
     */
    getEmotionSystem(characterId, mbtiType = 'ENFP') {
        if (!this.emotionSystems[characterId]) {
            if (typeof EmotionStateSystem !== 'undefined') {
                this.emotionSystems[characterId] = new EmotionStateSystem(characterId, mbtiType);
                console.log(`😊 ${characterId} 감정 시스템 생성 (${mbtiType})`);
            }
        }
        return this.emotionSystems[characterId];
    }

    /**
     * Phase 3 Milestone 2: 캐릭터별 이벤트 시스템 가져오기
     * @param {string} characterId - 캐릭터 ID
     */
    getEventSystem(characterId) {
        if (!this.eventSystems[characterId]) {
            if (typeof SpecialEventSystem !== 'undefined') {
                this.eventSystems[characterId] = new SpecialEventSystem(characterId, this);
                console.log(`🎉 ${characterId} 이벤트 시스템 생성`);
            }
        }
        return this.eventSystems[characterId];
    }

    /**
     * Phase 3 Milestone 3: 캐릭터별 메모리 시스템 가져오기
     * @param {string} characterId - 캐릭터 ID
     */
    getMemorySystem(characterId) {
        if (!this.memorySystems[characterId]) {
            if (typeof ConversationMemorySystem !== 'undefined') {
                this.memorySystems[characterId] = new ConversationMemorySystem(characterId);
                console.log(`🧠 ${characterId} 메모리 시스템 생성`);
            }
        }
        return this.memorySystems[characterId];
    }

    /**
     * LocalStorage에서 모든 캐릭터 상태 로드
     */
    loadStates() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const states = JSON.parse(data);
                console.log(`📥 ${Object.keys(states).length}개 캐릭터 상태 로드 완료`);
                return states;
            }
        } catch (error) {
            console.error('❌ 캐릭터 상태 로드 실패:', error);
        }
        return {};
    }

    /**
     * LocalStorage에 모든 캐릭터 상태 저장
     */
    saveStates() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.states));
            console.log('💾 모든 캐릭터 상태 저장 완료');
        } catch (error) {
            console.error('❌ 캐릭터 상태 저장 실패:', error);
        }
    }

    /**
     * 특정 캐릭터의 상태 초기화
     * @param {string} characterId - 캐릭터 ID
     */
    initializeCharacter(characterId) {
        if (this.states[characterId]) {
            console.log(`⚠️ 이미 존재하는 캐릭터 상태: ${characterId}`);
            return this.states[characterId];
        }

        this.states[characterId] = {
            characterId,
            createdAt: Date.now(),
            lastPlayedAt: Date.now(),

            // 관계 상태
            affection: 0,           // 호감도 (-100 ~ 100)
            loveLevel: 0,           // 사랑 레벨 (0 ~ 10)
            relationshipStage: 'stranger', // stranger, acquaintance, friend, close_friend, romantic, lover

            // 대화 진행
            messageCount: 0,        // 총 대화 수
            choicesMade: [],        // 선택 히스토리
            episodesCompleted: [],  // 완료한 에피소드 ID들

            // 트리거 상태
            triggers: {
                lastTimeCheck: Date.now(),
                lastAffectionCheck: 0,
                lastBehaviorCheck: null,
                lastRandomCheck: Date.now(),
                triggeredEpisodes: []
            },

            // 게임 진행
            currentEpisode: null,   // 현재 진행 중 에피소드
            gamePhase: 'initial',   // initial, developing, climax, ending

            // 통계
            stats: {
                totalPlayTime: 0,   // 총 플레이 시간 (초)
                positiveChoices: 0, // 긍정적 선택 수
                negativeChoices: 0, // 부정적 선택 수
                neutralChoices: 0   // 중립적 선택 수
            }
        };

        this.saveStates();
        console.log(`✅ 새 캐릭터 상태 초기화: ${characterId}`);
        return this.states[characterId];
    }

    /**
     * 특정 캐릭터의 상태 가져오기
     * @param {string} characterId - 캐릭터 ID
     */
    getState(characterId) {
        if (!this.states[characterId]) {
            return this.initializeCharacter(characterId);
        }
        return this.states[characterId];
    }

    /**
     * 특정 캐릭터의 상태 업데이트
     * @param {string} characterId - 캐릭터 ID
     * @param {object} updates - 업데이트할 필드들
     */
    updateState(characterId, updates) {
        if (!this.states[characterId]) {
            this.initializeCharacter(characterId);
        }

        // Deep merge
        this.states[characterId] = {
            ...this.states[characterId],
            ...updates,
            lastPlayedAt: Date.now()
        };

        this.saveStates();
        console.log(`🔄 ${characterId} 상태 업데이트:`, updates);
    }

    /**
     * 호감도 변경
     * @param {string} characterId - 캐릭터 ID
     * @param {number} delta - 변경량 (-100 ~ 100)
     */
    changeAffection(characterId, delta, mbtiType = 'ENFP') {
        const state = this.getState(characterId);
        const oldAffection = state.affection;
        state.affection = Math.max(-100, Math.min(100, state.affection + delta));

        // 관계 단계 자동 업데이트
        this.updateRelationshipStage(characterId);

        // Phase 3 Milestone 1: 통계 시스템 연동
        if (this.statisticsManager) {
            this.statisticsManager.recordAffectionChange(characterId, state.affection);
        }

        // Phase 3 Milestone 1: 업적 체크
        if (this.achievementSystem) {
            this.achievementSystem.checkAllAchievements();
        }

        // Phase 3 Milestone 2: 감정 시스템 연동
        const emotionSystem = this.getEmotionSystem(characterId, mbtiType);
        if (emotionSystem) {
            emotionSystem.onAffectionChange(delta);
        }

        this.saveStates();
        console.log(`💕 ${characterId} 호감도: ${oldAffection} → ${state.affection} (${delta > 0 ? '+' : ''}${delta})`);

        return state.affection;
    }

    /**
     * 관계 단계 자동 업데이트
     * @param {string} characterId - 캐릭터 ID
     */
    updateRelationshipStage(characterId) {
        const state = this.getState(characterId);
        const affection = state.affection;
        const oldStage = state.relationshipStage;

        let newStage = 'stranger';
        if (affection >= 80) newStage = 'lover';
        else if (affection >= 60) newStage = 'romantic';
        else if (affection >= 40) newStage = 'close_friend';
        else if (affection >= 20) newStage = 'friend';
        else if (affection >= 0) newStage = 'acquaintance';
        else newStage = 'stranger';

        if (oldStage !== newStage) {
            state.relationshipStage = newStage;
            this.saveStates();
            console.log(`💫 ${characterId} 관계 단계: ${oldStage} → ${newStage}`);
        }
    }

    /**
     * 선택지 기록
     * @param {string} characterId - 캐릭터 ID
     * @param {object} choice - 선택지 정보
     */
    recordChoice(characterId, choice) {
        const state = this.getState(characterId);

        state.choicesMade.push({
            timestamp: Date.now(),
            episodeId: state.currentEpisode,
            choiceText: choice.text,
            affectionImpact: choice.affection_impact || 0
        });

        // 최근 50개만 유지 (localStorage 용량 절약)
        if (state.choicesMade.length > 50) {
            state.choicesMade = state.choicesMade.slice(-50);
        }

        state.messageCount++;

        // 통계 업데이트
        if (choice.affection_impact > 0) {
            state.stats.positiveChoices++;
        } else if (choice.affection_impact < 0) {
            state.stats.negativeChoices++;
        } else {
            state.stats.neutralChoices++;
        }

        // Phase 3: 통계 시스템 연동
        if (this.statisticsManager) {
            this.statisticsManager.recordChoice(characterId, choice.affection_impact || 0);
        }

        // Phase 3: 업적 체크
        if (this.achievementSystem) {
            this.achievementSystem.checkAllAchievements();
        }

        this.saveStates();
        console.log(`📝 ${characterId} 선택 기록: "${choice.text}"`);
    }

    /**
     * 에피소드 완료 기록
     * @param {string} characterId - 캐릭터 ID
     * @param {string} episodeId - 에피소드 ID
     */
    completeEpisode(characterId, episodeId) {
        const state = this.getState(characterId);

        if (!state.episodesCompleted.includes(episodeId)) {
            state.episodesCompleted.push(episodeId);
            this.saveStates();
            console.log(`✅ ${characterId} 에피소드 완료: ${episodeId}`);
        }
    }

    /**
     * 현재 진행 중 에피소드 설정
     * @param {string} characterId - 캐릭터 ID
     * @param {string} episodeId - 에피소드 ID
     */
    setCurrentEpisode(characterId, episodeId) {
        const state = this.getState(characterId);
        state.currentEpisode = episodeId;
        this.saveStates();
        console.log(`🎬 ${characterId} 현재 에피소드: ${episodeId}`);
    }

    /**
     * 트리거 상태 업데이트
     * @param {string} characterId - 캐릭터 ID
     * @param {object} triggerUpdates - 트리거 업데이트 정보
     */
    updateTriggers(characterId, triggerUpdates) {
        const state = this.getState(characterId);
        state.triggers = {
            ...state.triggers,
            ...triggerUpdates
        };
        this.saveStates();
        console.log(`⚡ ${characterId} 트리거 상태 업데이트`);
    }

    /**
     * 플레이 시간 기록
     * @param {string} characterId - 캐릭터 ID
     * @param {number} seconds - 플레이 시간 (초)
     */
    addPlayTime(characterId, seconds) {
        const state = this.getState(characterId);
        state.stats.totalPlayTime += seconds;
        this.saveStates();
    }

    /**
     * 캐릭터 상태 완전 삭제
     * @param {string} characterId - 캐릭터 ID
     */
    deleteCharacter(characterId) {
        if (this.states[characterId]) {
            delete this.states[characterId];
            this.saveStates();
            console.log(`🗑️ ${characterId} 상태 삭제 완료`);
            return true;
        }
        return false;
    }

    /**
     * 모든 캐릭터 목록
     */
    getAllCharacters() {
        return Object.keys(this.states);
    }

    /**
     * 전체 통계
     */
    getGlobalStats() {
        const characters = Object.values(this.states);

        return {
            totalCharacters: characters.length,
            totalPlayTime: characters.reduce((sum, s) => sum + s.stats.totalPlayTime, 0),
            totalMessages: characters.reduce((sum, s) => sum + s.messageCount, 0),
            totalEpisodes: characters.reduce((sum, s) => sum + s.episodesCompleted.length, 0),
            avgAffection: characters.reduce((sum, s) => sum + s.affection, 0) / (characters.length || 1)
        };
    }

    /**
     * 특정 캐릭터 상태 요약
     * @param {string} characterId - 캐릭터 ID
     */
    getSummary(characterId) {
        const state = this.getState(characterId);

        return {
            characterId: state.characterId,
            affection: state.affection,
            relationshipStage: state.relationshipStage,
            messageCount: state.messageCount,
            episodesCompleted: state.episodesCompleted.length,
            totalPlayTime: state.stats.totalPlayTime,
            lastPlayed: new Date(state.lastPlayedAt).toLocaleString()
        };
    }

    /**
     * 모든 상태 초기화 (개발/테스트용)
     */
    clearAll() {
        this.states = {};
        this.saveStates();
        console.log('🗑️ 모든 캐릭터 상태 초기화 완료');
    }

    /**
     * Phase 2-C: 유저 응답 시 호출 (먼저 연락 시스템 알림)
     * @param {string} characterId - 캐릭터 ID
     * @param {string} message - 유저 메시지 내용 (Phase 3 Milestone 3)
     * @param {object} context - 추가 컨텍스트 (Phase 3 Milestone 3)
     */
    notifyUserResponse(characterId, message = '', context = {}) {
        // ProactiveContactSystem이 있다면 응답 기록
        if (typeof ProactiveContactSystem !== 'undefined') {
            try {
                const system = new ProactiveContactSystem(characterId);
                system.onUserResponse();
                console.log(`[무응답 추적] ${characterId} - 유저 응답 기록`);
            } catch (error) {
                console.error('[무응답 추적] 오류:', error);
            }
        }

        // Phase 3 Milestone 1: 메시지 기록
        if (this.statisticsManager) {
            this.statisticsManager.recordMessage(characterId, true); // true = 유저 메시지
        }

        // Phase 3 Milestone 3: 메모리 시스템에 유저 메시지 기록
        const memorySystem = this.getMemorySystem(characterId);
        if (memorySystem && message) {
            memorySystem.addMessage('user', message, context);
        }
    }

    /**
     * Phase 3: 캐릭터 메시지 수신 기록
     * @param {string} characterId - 캐릭터 ID
     * @param {string} message - 캐릭터 메시지 내용 (Phase 3 Milestone 3)
     * @param {object} context - 추가 컨텍스트 (Phase 3 Milestone 3)
     */
    notifyCharacterMessage(characterId, message = '', context = {}) {
        // Phase 3 Milestone 1: 메시지 기록
        if (this.statisticsManager) {
            this.statisticsManager.recordMessage(characterId, false); // false = 캐릭터 메시지
        }

        // Phase 3 Milestone 3: 메모리 시스템에 캐릭터 메시지 기록
        const memorySystem = this.getMemorySystem(characterId);
        if (memorySystem && message) {
            memorySystem.addMessage('character', message, context);
        }
    }

    /**
     * Phase 3: 사진 수신 기록
     * @param {string} characterId - 캐릭터 ID
     */
    notifyPhotoReceived(characterId) {
        if (this.statisticsManager) {
            this.statisticsManager.recordPhotoReceived(characterId);
        }

        // 업적 체크
        if (this.achievementSystem) {
            this.achievementSystem.checkAllAchievements();
        }
    }

    /**
     * Phase 3: 먼저 연락 수신 기록
     * @param {string} characterId - 캐릭터 ID
     */
    notifyProactiveContact(characterId) {
        if (this.statisticsManager) {
            this.statisticsManager.recordProactiveContact(characterId);
        }

        // 업적 체크
        if (this.achievementSystem) {
            this.achievementSystem.checkAllAchievements();
        }
    }

    /**
     * Phase 3: 세션 시작
     */
    startSession() {
        if (this.statisticsManager) {
            this.statisticsManager.startSession();
        }
    }

    /**
     * Phase 3: 세션 종료
     * @param {string} characterId - 캐릭터 ID (optional)
     */
    endSession(characterId = null) {
        if (this.statisticsManager) {
            this.statisticsManager.endSession(characterId);
        }

        // Phase 3 Milestone 3: 메모리 세션 정리
        if (characterId) {
            const memorySystem = this.getMemorySystem(characterId);
            if (memorySystem) {
                memorySystem.cleanupSession();
            }
        }
    }

    /**
     * Phase 3 Milestone 3: AI 프롬프트용 메모리 컨텍스트 생성
     * @param {string} characterId - 캐릭터 ID
     * @param {string} currentMessage - 현재 유저 메시지
     */
    generateMemoryContext(characterId, currentMessage = '') {
        const memorySystem = this.getMemorySystem(characterId);
        if (!memorySystem) {
            return {
                longTermFacts: [],
                recentContext: [],
                relevantMemories: []
            };
        }

        return memorySystem.generateContext(currentMessage);
    }

    /**
     * Phase 3 Milestone 3: 메모리 통계 조회
     * @param {string} characterId - 캐릭터 ID
     */
    getMemoryStats(characterId) {
        const memorySystem = this.getMemorySystem(characterId);
        if (!memorySystem) {
            return null;
        }

        return memorySystem.getStats();
    }

    /**
     * 상태 정보 출력 (디버깅용)
     */
    debugStates() {
        console.log('=== 캐릭터 상태 목록 ===');
        Object.values(this.states).forEach(state => {
            console.log(`${state.characterId}:`, {
                호감도: state.affection,
                관계: state.relationshipStage,
                대화수: state.messageCount,
                완료에피소드: state.episodesCompleted.length
            });
        });
        console.log('전체 통계:', this.getGlobalStats());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiCharacterState;
}
