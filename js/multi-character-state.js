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
        console.log('🎮 MultiCharacterState 초기화 완료');
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
    changeAffection(characterId, delta) {
        const state = this.getState(characterId);
        const oldAffection = state.affection;
        state.affection = Math.max(-100, Math.min(100, state.affection + delta));

        // 관계 단계 자동 업데이트
        this.updateRelationshipStage(characterId);

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

        state.messageCount++;

        // 통계 업데이트
        if (choice.affection_impact > 0) {
            state.stats.positiveChoices++;
        } else if (choice.affection_impact < 0) {
            state.stats.negativeChoices++;
        } else {
            state.stats.neutralChoices++;
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
