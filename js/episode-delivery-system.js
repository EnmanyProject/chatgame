/**
 * Episode Delivery System
 * @description 에피소드 전달 및 타이밍 관리 시스템
 * @version 2.0.0
 */

class EpisodeDeliverySystem {
    constructor(characterId) {
        this.characterId = characterId;
        this.queue = [];
        this.isDelivering = false;
    }

    /**
     * 에피소드 큐에 추가
     * @param {Object} episode - 에피소드 데이터
     */
    addToQueue(episode) {
        this.queue.push(episode);
        console.log(`[에피소드 큐] 추가됨 - 타입: ${episode.type}, 대기: ${this.queue.length}개`);
        
        // 자동 전달 시작
        if (!this.isDelivering) {
            this.processQueue();
        }
    }

    /**
     * 큐 처리
     */
    async processQueue() {
        if (this.queue.length === 0) {
            this.isDelivering = false;
            return;
        }

        this.isDelivering = true;
        const episode = this.queue.shift();

        await this.deliverEpisode(episode);

        // 다음 에피소드 처리
        setTimeout(() => this.processQueue(), 1000);
    }

    /**
     * 에피소드 전달
     * @param {Object} episode - 에피소드 데이터
     */
    async deliverEpisode(episode) {
        console.log(`[에피소드 전달] 타입: ${episode.type}`);

        switch (episode.type) {
            case 'character_message':
                await this.deliverMessage(episode);
                break;

            case 'choice_question':
                await this.deliverChoiceQuestion(episode);
                break;

            case 'text_quiz':
                await this.deliverTextQuiz(episode);
                break;

            default:
                console.warn('알 수 없는 에피소드 타입:', episode.type);
        }
    }

    /**
     * Type 1: 캐릭터 대사 전달
     */
    async deliverMessage(episode) {
        // 답장 딜레이 계산
        const delay = this.calculateDelay();
        
        console.log(`[대사 전달] ${delay}ms 후 전달 예정`);
        await this.wait(delay);

        // 메시지 표시
        if (typeof displayMessage === 'function') {
            const message = {
                type: 'character',
                text: episode.text,
                photo: episode.photo,
                timestamp: new Date().toISOString()
            };

            displayMessage(message);

            // 저장
            if (typeof saveMessage === 'function') {
                saveMessage(this.characterId, message);
            }
        }
    }

    /**
     * Type 2: 선택지 질문 전달
     */
    async deliverChoiceQuestion(episode) {
        // 답장 딜레이
        const delay = this.calculateDelay();
        
        console.log(`[선택지 질문] ${delay}ms 후 전달 예정`);
        await this.wait(delay);

        // 메시지 표시
        if (typeof displayMessage === 'function') {
            const message = {
                type: 'character',
                text: episode.text,
                photo: episode.photo,
                timestamp: new Date().toISOString()
            };

            displayMessage(message);

            if (typeof saveMessage === 'function') {
                saveMessage(this.characterId, message);
            }
        }

        // 선택지 표시
        await this.wait(500);
        
        if (typeof showChoices === 'function') {
            showChoices(episode.choices);
        }
    }

    /**
     * Type 3: 직접 입력 퀴즈 전달
     */
    async deliverTextQuiz(episode) {
        // 답장 딜레이
        const delay = this.calculateDelay();
        
        console.log(`[직접 입력 퀴즈] ${delay}ms 후 전달 예정`);
        await this.wait(delay);

        // 메시지 표시
        if (typeof displayMessage === 'function') {
            const message = {
                type: 'character',
                text: episode.text,
                photo: episode.photo,
                timestamp: new Date().toISOString()
            };

            displayMessage(message);

            if (typeof saveMessage === 'function') {
                saveMessage(this.characterId, message);
            }
        }

        // 입력 필드 활성화
        await this.wait(500);
        
        if (typeof enableTextInput === 'function') {
            enableTextInput();
        }
    }

    /**
     * 답장 딜레이 계산
     * @returns {number} 딜레이 시간 (밀리초)
     */
    calculateDelay() {
        // CharacterStateManager 사용 가능하면 실제 계산
        if (typeof CharacterStateManager !== 'undefined') {
            try {
                const stateManager = new CharacterStateManager(this.characterId);
                return stateManager.getReplyDelay();
            } catch (e) {
                console.warn('상태 관리자 사용 불가, 기본 딜레이 사용');
            }
        }

        // 기본: 1-3초
        return 1000 + Math.random() * 2000;
    }

    /**
     * 대기 함수
     * @param {number} ms - 대기 시간 (밀리초)
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 큐 초기화
     */
    clearQueue() {
        this.queue = [];
        this.isDelivering = false;
        console.log('[에피소드 큐] 초기화됨');
    }

    /**
     * 큐 상태 조회
     */
    getQueueStatus() {
        return {
            waiting: this.queue.length,
            isDelivering: this.isDelivering,
            nextEpisode: this.queue[0] || null
        };
    }
}

/**
 * 에피소드 생성 헬퍼 함수들
 */

/**
 * 캐릭터 대사 에피소드 생성
 */
function createMessageEpisode(text, photo = null) {
    return {
        type: 'character_message',
        text,
        photo,
        requires_response: false
    };
}

/**
 * 선택지 질문 에피소드 생성
 */
function createChoiceEpisode(text, choices, photo = null) {
    return {
        type: 'choice_question',
        text,
        photo,
        choices: choices.map(choice => ({
            text: choice.text,
            value: choice.value || choice.text,
            affection_change: choice.affection_change || 0,
            tone: choice.tone || 'normal'
        }))
    };
}

/**
 * 직접 입력 퀴즈 에피소드 생성
 */
function createTextQuizEpisode(text, context = {}, photo = null) {
    return {
        type: 'text_quiz',
        text,
        photo,
        character_context: context,
        ai_judge: true
    };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EpisodeDeliverySystem,
        createMessageEpisode,
        createChoiceEpisode,
        createTextQuizEpisode
    };
}
