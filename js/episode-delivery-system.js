/**
 * Episode Delivery System
 * @description 에피소드 전달 및 타이밍 관리 시스템
 * @version 2.1.0 - Phase 2-B: 사진 전송 시스템 추가
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

/**
 * 사진 메시지 에피소드 생성
 * @param {string} photoData - base64 사진 데이터
 * @param {string} message - 사진과 함께 보낼 메시지
 * @param {string} category - 사진 카테고리
 * @returns {Object} 사진 에피소드
 */
function createPhotoEpisode(photoData, message, category = 'casual') {
    return {
        type: 'character_message',
        text: message,
        photo: {
            data: photoData,
            category: category
        },
        requires_response: false
    };
}

/**
 * 사진 표시 함수
 * @param {Object} photoInfo - 사진 정보 객체
 * @param {HTMLElement} messageElement - 메시지 요소
 */
function displayPhoto(photoInfo, messageElement) {
    if (!photoInfo || !photoInfo.data) {
        console.warn('[사진 표시] 사진 데이터 없음');
        return;
    }

    // 사진 컨테이너 생성
    const photoContainer = document.createElement('div');
    photoContainer.className = 'photo-container';
    photoContainer.style.cssText = `
        margin: 10px 0;
        border-radius: 12px;
        overflow: hidden;
        max-width: 300px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    // 사진 이미지 생성
    const img = document.createElement('img');
    img.src = photoInfo.data;
    img.alt = `사진 (${photoInfo.category || 'unknown'})`;
    img.style.cssText = `
        width: 100%;
        height: auto;
        display: block;
    `;

    // 클릭 시 모달 열기
    img.addEventListener('click', () => {
        if (typeof openPhotoModal === 'function') {
            openPhotoModal(photoInfo.data, photoInfo.category);
        } else {
            // Fallback: 새 창으로 열기
            window.open(photoInfo.data, '_blank');
        }
    });

    photoContainer.appendChild(img);
    messageElement.appendChild(photoContainer);

    console.log('[사진 표시] 성공:', photoInfo.category);
}

/**
 * 사진 전송 에피소드 생성 (PhotoSendingSystem 연동)
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mbti - MBTI 타입
 * @param {number} affection - 호감도
 * @returns {Promise<Object|null>} 사진 에피소드
 */
async function createPhotoSendingEpisode(characterId, mbti, affection) {
    // PhotoSendingSystem 확인
    if (typeof window.photoSendingSystem === 'undefined') {
        console.warn('[사진 전송] PhotoSendingSystem 미초기화');
        return null;
    }

    // 사진 전송 시도
    const result = await window.photoSendingSystem.attemptPhotoSend(characterId, mbti, affection);

    if (!result) {
        return null;
    }

    // 사진 에피소드 생성
    return createPhotoEpisode(result.photo.photo_data, result.message, result.category);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EpisodeDeliverySystem,
        createMessageEpisode,
        createChoiceEpisode,
        createTextQuizEpisode,
        createPhotoEpisode,
        displayPhoto,
        createPhotoSendingEpisode
    };
}
