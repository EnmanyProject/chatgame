// 채팅 게임 엔진
class ChatEngine {
    constructor() {
        this.messages = [];
        this.currentMessageId = 1;
        this.affection = ChatConfig.CHARACTER.initialAffection;
        this.isProcessing = false;
        this.storyData = null;
        this.messageHistory = [];
        this.aiManager = null;
    }

    // 스토리 데이터 로드
    async loadStory() {
        try {
            console.log('Loading story from:', 'assets/scenarios/chat_story.json');
            const response = await fetch('assets/scenarios/chat_story.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.storyData = await response.json();
            console.log('Story loaded successfully, messages count:', this.storyData.messages?.length || 0);
            
            // 첫 번째 메시지 확인
            const firstMessage = this.getMessage(1);
            console.log('First message:', firstMessage);
            
            return true;
        } catch (error) {
            console.error('Failed to load story:', error);
            console.error('Error details:', error.message);
            return false;
        }
    }

    // 메시지 찾기
    getMessage(id) {
        if (!this.storyData || !this.storyData.messages) return null;
        return this.storyData.messages.find(msg => msg.id === id);
    }

    // 다음 메시지 처리
    async processNextMessage(messageId = null) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const targetId = messageId || this.currentMessageId;
            const message = this.getMessage(targetId);
            
            if (!message) {
                console.log('No more messages');
                this.isProcessing = false;
                return;
            }

            await this.handleMessage(message);
            
        } catch (error) {
            console.error('Error processing message:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    // 메시지 처리
    async handleMessage(message) {
        this.messageHistory.push(message);

        switch (message.type) {
            case 'stage_direction':
                await this.showStageDirection(message);
                this.currentMessageId++;
                // 자동으로 다음 메시지 처리
                setTimeout(() => this.processNextMessage(), ChatConfig.TIMING.messageDelay);
                break;

            case 'received':
                await this.showReceivedMessage(message);
                // 다음 메시지가 choice가 아니면 자동 진행
                const nextMessage = this.getMessage(this.currentMessageId + 1);
                this.currentMessageId++;
                
                console.log(`Message ${message.id} processed. Next message:`, nextMessage?.id, nextMessage?.type);
                
                if (nextMessage && nextMessage.type !== 'choice' && nextMessage.type !== 'input') {
                    setTimeout(() => this.processNextMessage(), ChatConfig.TIMING.messageDelay);
                } else if (nextMessage && (nextMessage.type === 'choice' || nextMessage.type === 'input')) {
                    // 선택지나 입력이 다음에 있으면 바로 처리
                    setTimeout(() => this.processNextMessage(), ChatConfig.TIMING.messageDelay);
                }
                break;

            case 'choice':
                console.log(`Showing choices for message ${message.id}:`, message.options?.length, 'options');
                await this.showChoices(message);
                // 선택지는 사용자 입력을 기다림
                break;

            case 'input':
                console.log(`Showing input for message ${message.id}`);
                await this.showInput(message);
                // 텍스트 입력을 기다림
                break;

            default:
                console.log('Unknown message type:', message.type);
                this.currentMessageId++;
                break;
        }
    }

    // 지문 표시
    async showStageDirection(message) {
        if (window.chatUI) {
            await window.chatUI.addStageDirection(message.text);
        }
    }

    // 받은 메시지 표시
    async showReceivedMessage(message) {
        if (window.chatUI) {
            // 타이핑 인디케이터 표시
            await window.chatUI.showTypingIndicator();
            
            // 타이핑 지연
            await this.delay(ChatConfig.TIMING.typingDelay);
            
            // 메시지 표시
            await window.chatUI.addReceivedMessage(message);
            
            // 타이핑 인디케이터 숨김
            window.chatUI.hideTypingIndicator();
        }
    }

    // 선택지 표시
    async showChoices(message) {
        if (window.chatUI) {
            // 선택지 표시 전 지연
            await this.delay(ChatConfig.TIMING.choiceDelay);
            await window.chatUI.showChoices(message);
        }
    }

    // 입력창 표시
    async showInput(message) {
        if (window.chatUI) {
            // 입력창 표시 전 지연
            await this.delay(ChatConfig.TIMING.choiceDelay);
            await window.chatUI.showInput(message);
        }
    }

    // 선택지 선택 처리
    async handleChoice(choiceIndex, message) {
        if (!message.options || !message.options[choiceIndex]) return;

        const choice = message.options[choiceIndex];
        
        // 선택한 메시지를 보낸 메시지로 표시
        if (window.chatUI) {
            await window.chatUI.addSentMessage(choice.text);
            window.chatUI.hideChoices();
        }

        // 호감도 업데이트
        if (choice.affection_delta) {
            this.affection += choice.affection_delta;
            this.affection = Math.max(0, Math.min(100, this.affection));
            
            // UI에 호감도 업데이트
            if (window.chatUI) {
                window.chatUI.updateAffection(this.affection);
            }
        }

        // 다음 메시지로 이동
        this.currentMessageId = choice.next;
        
        // 짧은 지연 후 다음 메시지 처리
        setTimeout(() => this.processNextMessage(), ChatConfig.TIMING.messageDelay);
    }

    // 텍스트 입력 처리 (AI 연동)
    async handleInput(inputText, message) {
        console.log(`Handling input: "${inputText}" for message ${message.id}`);
        
        // 입력한 텍스트를 보낸 메시지로 표시
        if (window.chatUI) {
            await window.chatUI.addSentMessage(inputText);
            window.chatUI.hideInput();
        }

        // AI가 연결되어 있다면 항상 AI 응답 우선 사용
        if (this.aiManager && this.aiManager.isAIConnected()) {
            // AI 응답 생성 (호감도 기반)
            await this.generateAIResponseWithAffection(inputText, message);
        } else {
            // AI 미연결시 폴백: 호감도 기반 반응
            await this.addAffectionReaction(inputText);
        }

        // 다음 메시지로 이동
        this.currentMessageId = message.next;
        
        // 짧은 지연 후 다음 메시지 처리
        setTimeout(() => this.processNextMessage(), ChatConfig.TIMING.messageDelay);
    }

    // AI 응답 생성 (호감도 고려)
    async generateAIResponseWithAffection(inputText, message) {
        // 타이핑 인디케이터 표시
        if (window.chatUI) {
            await window.chatUI.showTypingIndicator();
        }

        try {
            // 먼저 호감도 계산 (입력 텍스트 분석)
            const affectionChange = this.calculateAffectionChange(inputText);
            this.affection += affectionChange;
            this.affection = Math.max(0, Math.min(100, this.affection));

            console.log(`💕 호감도 변화: ${affectionChange > 0 ? '+' : ''}${affectionChange} → 현재: ${this.affection}`);

            // UI에 호감도 업데이트
            if (window.chatUI) {
                window.chatUI.updateAffection(this.affection);
            }

            // 현재 대화 컨텍스트와 호감도 상태 준비
            const context = this.getCurrentContext(message);
            const affectionLevel = this.getAffectionLevel();
            
            // AI로부터 호감도 기반 응답 생성
            const aiResponse = await this.aiManager.generateResponse(
                inputText, 
                this.affection, 
                context,
                affectionLevel
            );

            // 타이핑 지연 (호감도에 따라 조절)
            const typingDelay = this.affection >= 80 ? 1200 : this.affection >= 60 ? 1500 : 1800;
            await this.delay(typingDelay);

            // AI 응답을 윤아의 메시지로 표시
            const aiMessage = {
                text: aiResponse,
                timestamp: this.getCurrentTime(),
                emotion: this.getEmotionFromAffection()
            };

            if (window.chatUI) {
                await window.chatUI.addReceivedMessage(aiMessage);
                window.chatUI.hideTypingIndicator();
            }

            // 친밀도 업데이트
            const intimacy = this.aiManager.getIntimacyScore();
            this.updateIntimacyDisplay(intimacy);

            console.log(`🤖 AI 응답 생성 완료 - 호감도: ${this.affection}%, 친밀도: ${intimacy}%`);

        } catch (error) {
            console.error('AI 응답 생성 실패:', error);
            
            // AI 실패시 폴백: 호감도 기반 간단 반응
            await this.addAffectionReactionFallback(inputText);
        }
    }

    // 호감도 변화 계산 (더 정교한 분석)
    calculateAffectionChange(inputText) {
        const text = inputText.toLowerCase();
        
        // 강한 긍정적 표현
        const veryPositive = ['사랑해', '너무 좋아', '최고야', '완벽해', '정말 예뻐', '감동이야'];
        // 긍정적 표현  
        const positive = ['좋아', '고마워', '예뻐', '멋져', '기뻐', '행복', '감사', '좋다', '괜찮아', '맞아'];
        // 부정적 표현
        const negative = ['싫어', '별로', '안좋아', '짜증', '화나', '나빠', '귀찮', '몰라', '관심없어'];
        // 강한 부정적 표현
        const veryNegative = ['정말 싫어', '최악', '너무 별로', '화가 나', '실망'];

        if (veryPositive.some(word => text.includes(word))) return 8;
        if (positive.some(word => text.includes(word))) return 5;
        if (veryNegative.some(word => text.includes(word))) return -8;
        if (negative.some(word => text.includes(word))) return -5;
        
        // 중성적이지만 대화에 참여하므로 약간의 호감도 상승
        return 2;
    }

    // 호감도 레벨 텍스트
    getAffectionLevel() {
        if (this.affection >= 90) return '매우 높음 (열정적)';
        if (this.affection >= 80) return '높음 (애정적)';
        if (this.affection >= 70) return '좋음 (호감적)';
        if (this.affection >= 60) return '보통 (친근)';
        if (this.affection >= 40) return '낮음 (어색)';
        return '매우 낮음 (실망)';
    }

    // 호감도에 따른 감정 상태
    getEmotionFromAffection() {
        if (this.affection >= 85) return 'very_happy';
        if (this.affection >= 70) return 'happy';
        if (this.affection >= 55) return 'content';
        if (this.affection >= 40) return 'neutral';
        return 'disappointed';
    }

    // AI 실패시 폴백 반응
    async addAffectionReactionFallback(inputText) {
        const affectionChange = this.calculateAffectionChange(inputText);
        this.affection += affectionChange;
        this.affection = Math.max(0, Math.min(100, this.affection));

        if (window.chatUI) {
            window.chatUI.updateAffection(this.affection);
        }

        let reactionText = '';
        if (this.affection >= 80) {
            reactionText = 'ㅋㅋㅋㅋㅋ 시우 오빠 너무 좋아요! 💕';
        } else if (this.affection >= 60) {
            reactionText = 'ㅎㅎ 그렇게 말해주시니 기분 좋아요 😊';
        } else if (this.affection >= 40) {
            reactionText = '음... 그렇군요 😅';
        } else {
            reactionText = 'ㅜㅜ 그렇게 생각하시는군요...';
        }

        const fallbackMessage = {
            text: reactionText,
            timestamp: this.getCurrentTime(),
            emotion: this.getEmotionFromAffection()
        };

        await this.delay(800);
        if (window.chatUI) {
            await window.chatUI.showTypingIndicator();
            await this.delay(1200);
            await window.chatUI.addReceivedMessage(fallbackMessage);
            window.chatUI.hideTypingIndicator();
        }
    }

    // 현재 대화 컨텍스트 생성
    getCurrentContext(message) {
        // 현재 진행 상황에 따른 컨텍스트
        if (message.id <= 20) {
            return '어제 카페에서의 고백 상황을 설명하는 중';
        } else if (message.id <= 36) {
            return '우산 속에서의 로맨틱한 순간과 뽀뽀에 대해 이야기하는 중';
        } else {
            return '집 앞에 와서 해장국을 끓여주며 대답을 기다리는 중';
        }
    }

    // AI 응답에 따른 호감도 조정
    adjustAffectionByAI(aiResponse) {
        // AI 응답의 감정 분석 (간단한 키워드 기반)
        const positiveIndicators = ['ㅋㅋ', '💕', '기뻐', '좋아', '행복'];
        const negativeIndicators = ['ㅜㅜ', '😢', '아쉬워', '실망'];

        const hasPositive = positiveIndicators.some(indicator => aiResponse.includes(indicator));
        const hasNegative = negativeIndicators.some(indicator => aiResponse.includes(indicator));

        if (hasPositive && !hasNegative) {
            this.affection = Math.min(100, this.affection + 2);
        } else if (hasNegative && !hasPositive) {
            this.affection = Math.max(0, this.affection - 1);
        }

        // UI 업데이트
        if (window.chatUI) {
            window.chatUI.updateAffection(this.affection);
        }
    }

    // 호감도 기반 이모티콘 반응
    async addAffectionReaction(inputText) {
        let reactionEmoji = '';
        let affectionChange = 0;

        // 간단한 키워드 기반 호감도 판정
        const positiveWords = ['좋아', '고마워', '사랑', '예뻐', '멋져', '최고', '좋다', '감사', '행복', '기뻐'];
        const negativeWords = ['싫어', '별로', '안좋아', '짜증', '화나', '최악', '나빠', '귀찮', '몰라'];

        const hasPositive = positiveWords.some(word => inputText.includes(word));
        const hasNegative = negativeWords.some(word => inputText.includes(word));

        if (hasPositive && !hasNegative) {
            // 긍정적 반응
            reactionEmoji = 'ㅋㅋㅋㅋㅋ';
            affectionChange = 5;
        } else if (hasNegative && !hasPositive) {
            // 부정적 반응
            reactionEmoji = 'ㅜㅜ';
            affectionChange = -5;
        } else {
            // 중성적 반응
            reactionEmoji = 'ㅎㅎ';
            affectionChange = 1;
        }

        // 호감도 업데이트
        this.affection += affectionChange;
        this.affection = Math.max(0, Math.min(100, this.affection));

        // UI에 호감도 업데이트
        if (window.chatUI) {
            window.chatUI.updateAffection(this.affection);
        }

        // 반응 메시지 생성
        const reactionMessage = {
            text: reactionEmoji,
            timestamp: this.getCurrentTime(),
            emotion: hasPositive ? 'happy' : hasNegative ? 'sad' : 'neutral'
        };

        // 타이핑 지연
        await this.delay(500);
        
        // 타이핑 인디케이터 표시
        if (window.chatUI) {
            await window.chatUI.showTypingIndicator();
            await this.delay(800);
            await window.chatUI.addReceivedMessage(reactionMessage);
            window.chatUI.hideTypingIndicator();
        }
    }

    // 현재 시간 가져오기
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // 게임 시작
    async startGame() {
        console.log('Starting chat game...');
        
        // AI 매니저 초기화
        if (window.AIManager) {
            this.aiManager = new window.AIManager();
            await this.aiManager.init();
            console.log('🤖 AI Manager initialized');
        }
        
        // 스토리 로드
        const loaded = await this.loadStory();
        if (!loaded) {
            console.error('Failed to start game - story not loaded');
            return false;
        }

        // 첫 메시지부터 시작
        this.currentMessageId = 1;
        this.affection = ChatConfig.CHARACTER.initialAffection;
        
        // UI 업데이트
        if (window.chatUI) {
            window.chatUI.updateAffection(this.affection);
        }

        // 첫 메시지 처리
        await this.processNextMessage();
        
        return true;
    }

    // 게임 재시작
    async restartGame() {
        this.messageHistory = [];
        this.currentMessageId = 1;
        this.affection = ChatConfig.CHARACTER.initialAffection;
        this.isProcessing = false;

        // UI 초기화
        if (window.chatUI) {
            window.chatUI.clearMessages();
            window.chatUI.updateAffection(this.affection);
        }

        // 게임 재시작
        await this.startGame();
    }

    // 현재 게임 상태 가져오기
    getGameState() {
        return {
            currentMessageId: this.currentMessageId,
            affection: this.affection,
            messageCount: this.messageHistory.length,
            isProcessing: this.isProcessing
        };
    }

    // 호감도 가져오기
    getAffection() {
        return this.affection;
    }

    // 친밀도 표시 업데이트
    updateIntimacyDisplay(intimacy) {
        // 설정 모달의 친밀도 표시 업데이트
        const intimacyElement = document.getElementById('intimacyLevel');
        if (intimacyElement) {
            intimacyElement.textContent = intimacy;
        }

        // 헤더 색상도 친밀도에 따라 변경
        const header = document.querySelector('.contact-name');
        if (header && intimacy >= 80) {
            header.style.textShadow = '0 0 10px rgba(255, 105, 180, 0.5)';
        }
    }

    // AI 연결 상태 확인
    isAIConnected() {
        return this.aiManager && this.aiManager.isAIConnected();
    }

    // AI 디버그 정보
    getAIDebugInfo() {
        if (this.aiManager) {
            return this.aiManager.getDebugInfo();
        }
        return { connected: false, message: 'AI Manager not initialized' };
    }

    // 메시지 히스토리 가져오기
    getMessageHistory() {
        return [...this.messageHistory];
    }

    // 지연 유틸리티
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 자동 진행 모드 토글
    setAutoMode(enabled) {
        this.autoMode = enabled;
        console.log(`Auto mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    // 타이핑 속도 설정
    setTypingSpeed(speed) {
        // 1-10 범위를 2000-200ms 범위로 변환
        ChatConfig.TIMING.typingDelay = 2200 - (speed * 200);
        console.log(`Typing speed set to: ${ChatConfig.TIMING.typingDelay}ms`);
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.ChatEngine = ChatEngine;
}