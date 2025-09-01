// 채팅 UI 매니저 - 개선된 버전
class ChatUI {
    constructor() {
        this.messagesContainer = null;
        this.choicesContainer = null;
        this.choicesOverlay = null;
        this.currentTypingIndicator = null;
        this.settingsModal = null;
        this.currentAffection = 0;
        this.currentIntimacy = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeStatDisplay();
    }

    // DOM 요소 초기화
    initializeElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.choicesContainer = document.getElementById('choicesContainer');
        this.choicesOverlay = document.getElementById('choicesOverlay');
        this.settingsModal = document.getElementById('settingsModal');
        this.affectionElement = document.getElementById('affectionLevel');
        this.intimacyElement = document.getElementById('intimacyLevel');
        
        console.log('UI Elements initialized');
    }

    // 스탯 표시 초기화
    initializeStatDisplay() {
        // 스탯 표시 영역 생성 (없으면)
        if (!document.getElementById('statsDisplay')) {
            const statsDiv = document.createElement('div');
            statsDiv.id = 'statsDisplay';
            statsDiv.className = 'stats-display';
            statsDiv.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">💕</span>
                    <span id="affectionValue" class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🤝</span>
                    <span id="intimacyValue" class="stat-value">0</span>
                </div>
            `;
            
            const header = document.querySelector('.chat-header');
            if (header) {
                header.appendChild(statsDiv);
            }
        }
    }

    // 이벤트 바인딩
    bindEvents() {
        // 설정 버튼
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // 설정 모달 닫기
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => this.hideSettings());
        }

        // 모달 바깥 클릭시 닫기
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.hideSettings();
                }
            });
        }

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            // ESC로 설정 모달 닫기
            if (e.key === 'Escape' && this.settingsModal && !this.settingsModal.classList.contains('hidden')) {
                this.hideSettings();
            }
            
            // 숫자 키로 선택지 선택
            if (e.key >= '1' && e.key <= '9' && this.choicesOverlay && !this.choicesOverlay.classList.contains('hidden')) {
                const choiceIndex = parseInt(e.key) - 1;
                const choices = this.choicesContainer.querySelectorAll('.choice-btn');
                if (choices[choiceIndex]) {
                    choices[choiceIndex].click();
                }
            }
        });
    }

    // 지문 추가 (대화 사이에 괄호로)
    async addStageDirection(text) {
        const stageElement = document.createElement('div');
        stageElement.className = 'stage-direction fade-in';
        stageElement.textContent = text.startsWith('(') ? text : `(${text})`;
        
        this.messagesContainer.appendChild(stageElement);
        this.scrollToBottom();
        
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    // 받은 메시지 추가 (지문 포함 가능)
    async addReceivedMessage(message) {
        // 메시지에 지문이 포함되어 있는지 확인
        const messageText = message.text;
        const hasStageDirection = messageText.includes('(') && messageText.includes(')');
        
        if (hasStageDirection) {
            // 지문과 대사 분리
            const parts = this.parseMessageWithStageDirection(messageText);
            
            for (const part of parts) {
                if (part.type === 'stage') {
                    await this.addStageDirection(part.text);
                } else {
                    const messageElement = this.createMessageElement('received', {
                        text: part.text,
                        timestamp: message.timestamp
                    });
                    this.messagesContainer.appendChild(messageElement);
                }
            }
        } else {
            const messageElement = this.createMessageElement('received', message);
            this.messagesContainer.appendChild(messageElement);
        }
        
        this.scrollToBottom();
        
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    // 메시지에서 지문 분리
    parseMessageWithStageDirection(text) {
        const parts = [];
        const regex = /(\([^)]+\))/g;
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            // 대사 부분
            if (match.index > lastIndex) {
                const dialogue = text.substring(lastIndex, match.index).trim();
                if (dialogue) {
                    parts.push({ type: 'dialogue', text: dialogue });
                }
            }
            
            // 지문 부분
            parts.push({ type: 'stage', text: match[1] });
            lastIndex = match.index + match[0].length;
        }
        
        // 남은 대사 부분
        if (lastIndex < text.length) {
            const dialogue = text.substring(lastIndex).trim();
            if (dialogue) {
                parts.push({ type: 'dialogue', text: dialogue });
            }
        }
        
        return parts;
    }

    // 보낸 메시지 추가
    async addSentMessage(text) {
        const messageData = {
            text: text,
            timestamp: this.getCurrentTime()
        };
        
        const messageElement = this.createMessageElement('sent', messageData);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    // 메시지 요소 생성
    createMessageElement(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = message.text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = message.timestamp || this.getCurrentTime();

        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timeDiv);

        return messageDiv;
    }

    // 타이핑 인디케이터 표시
    async showTypingIndicator() {
        if (this.currentTypingIndicator) {
            this.hideTypingIndicator();
        }

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message received';
        
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'typing-indicator';
        
        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dotsDiv.appendChild(dot);
        }
        
        indicatorDiv.appendChild(dotsDiv);
        typingDiv.appendChild(indicatorDiv);
        
        this.messagesContainer.appendChild(typingDiv);
        this.currentTypingIndicator = typingDiv;
        this.scrollToBottom();

        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    // 타이핑 인디케이터 숨김
    hideTypingIndicator() {
        if (this.currentTypingIndicator) {
            this.currentTypingIndicator.remove();
            this.currentTypingIndicator = null;
        }
    }

    // 선택지 표시 (수치 증감 표시 제거)
    async showChoices(message) {
        console.log('UI: showChoices called');
        
        if (!message.options) {
            console.error('No options found in message:', message);
            return;
        }

        // 선택지 컨테이너 초기화
        this.choicesContainer.innerHTML = '';

        // 선택지 버튼 생성 (대화체로 변환)
        message.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            
            // 대화체로 변환
            let displayText = option.text;
            if (!displayText.includes('"') && !displayText.includes('...')) {
                displayText = `"${displayText}"`;
            }
            
            button.innerHTML = `<span class="choice-number">${index + 1}</span> ${displayText}`;
            
            button.addEventListener('click', () => {
                if (window.chatEngine) {
                    window.chatEngine.handleChoice(index, message);
                }
            });

            this.choicesContainer.appendChild(button);
        });

        // 선택지 오버레이 표시
        this.choicesOverlay.classList.add('show');

        return new Promise(resolve => {
            setTimeout(resolve, 300);
        });
    }

    // 선택지 숨김
    hideChoices() {
        this.choicesOverlay.classList.remove('show');
        setTimeout(() => {
            this.choicesContainer.innerHTML = '';
        }, 300);
    }

    // 입력창 표시 (개선된 버전)
    async showInput(message) {
        console.log('UI: showInput called');
        
        // 선택지 컨테이너 초기화
        this.choicesContainer.innerHTML = '';
        
        // 입력창 생성
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-choice-container';
        
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-choice-wrapper';
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'input-choice-text';
        textInput.placeholder = message.placeholder || '메시지를 입력하세요...';
        textInput.maxLength = 100;
        
        const sendButton = document.createElement('button');
        sendButton.className = 'input-choice-send';
        sendButton.innerHTML = '전송';
        
        // 입력 처리 함수
        const handleSend = () => {
            const inputText = textInput.value.trim();
            if (inputText && window.chatEngine) {
                window.chatEngine.handleInput(inputText, message);
                textInput.value = ''; // 전송 후 입력창 비우기
            }
        };
        
        // 이벤트 리스너 (전송 버튼과 엔터키 모두 작동)
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleSend();
        });
        
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }
        });
        
        // 취소 버튼 제거 (요청사항)
        
        inputWrapper.appendChild(textInput);
        inputWrapper.appendChild(sendButton);
        inputContainer.appendChild(inputWrapper);
        
        this.choicesContainer.appendChild(inputContainer);
        
        // 입력창 표시
        this.choicesOverlay.classList.add('show');
        
        // 입력창에 포커스
        setTimeout(() => {
            textInput.focus();
        }, 300);

        return new Promise(resolve => {
            setTimeout(resolve, 300);
        });
    }

    // 입력창 숨김
    hideInput() {
        this.choicesOverlay.classList.remove('show');
        setTimeout(() => {
            this.choicesContainer.innerHTML = '';
        }, 300);
    }

    // 호감도 업데이트 (애니메이션 포함)
    updateAffection(newValue, animated = true) {
        const targetElement = document.getElementById('affectionValue');
        if (!targetElement) return;
        
        if (animated && this.currentAffection !== newValue) {
            this.animateValue(targetElement, this.currentAffection, newValue, 1000);
        } else {
            targetElement.textContent = newValue;
        }
        
        this.currentAffection = newValue;
        
        // 호감도에 따른 색상 변경
        this.updateHeaderColor(newValue);
    }

    // 친밀도 업데이트 (애니메이션 포함)
    updateIntimacy(newValue, animated = true) {
        const targetElement = document.getElementById('intimacyValue');
        if (!targetElement) return;
        
        if (animated && this.currentIntimacy !== newValue) {
            this.animateValue(targetElement, this.currentIntimacy, newValue, 1000);
        } else {
            targetElement.textContent = newValue;
        }
        
        this.currentIntimacy = newValue;
    }

    // 숫자 애니메이션 효과
    animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;
        
        // 깜박임 효과 추가
        element.classList.add('stat-changing');
        
        const timer = setInterval(() => {
            current += increment;
            
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
                
                // 깜박임 효과 제거
                setTimeout(() => {
                    element.classList.remove('stat-changing');
                }, 500);
            }
            
            element.textContent = Math.round(current);
            
            // 변화 방향에 따른 색상 효과
            if (increment > 0) {
                element.style.color = '#4ade80'; // 녹색
            } else if (increment < 0) {
                element.style.color = '#ff4444'; // 빨간색
            }
            
            // 원래 색상으로 복귀
            if (current === end) {
                setTimeout(() => {
                    element.style.color = '';
                }, 500);
            }
        }, 16);
    }

    // 헤더 색상 업데이트
    updateHeaderColor(affection) {
        const header = document.querySelector('.contact-name');
        if (header) {
            if (affection >= 80) {
                header.style.color = '#ff69b4';
            } else if (affection >= 60) {
                header.style.color = '#ff8fa3';
            } else if (affection >= 40) {
                header.style.color = '#ffb3c1';
            } else {
                header.style.color = '#fff';
            }
        }
    }

    // 스탯 변화 표시 (애니메이션 데이터 기반)
    showStatChanges(animationData) {
        if (animationData) {
            if (animationData.affection) {
                this.updateAffection(animationData.affection.to, true);
            }
            if (animationData.intimacy) {
                this.updateIntimacy(animationData.intimacy.to, true);
            }
        }
    }

    // 설정 모달 표시
    showSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('hidden');
        }
    }

    // 설정 모달 숨김
    hideSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.add('hidden');
        }
    }

    // 메시지 초기화
    clearMessages() {
        if (this.messagesContainer) {
            const dayLabel = this.messagesContainer.querySelector('.message-day');
            this.messagesContainer.innerHTML = '';
            if (dayLabel) {
                this.messagesContainer.appendChild(dayLabel);
            }
        }
        
        this.hideChoices();
        this.hideTypingIndicator();
    }

    // 스크롤을 맨 아래로
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    // 현재 시간 가져오기
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // 로딩 화면 표시
    showLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    // 로딩 화면 숨김
    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    // 오류 메시지 표시
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'stage-direction';
        errorDiv.style.color = '#ff4444';
        errorDiv.style.borderColor = '#ff4444';
        errorDiv.textContent = `오류: ${message}`;
        
        this.messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // 알림 메시지 표시
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'stage-direction';
        notification.textContent = message;
        
        switch (type) {
            case 'success':
                notification.style.color = '#4ade80';
                notification.style.borderColor = '#4ade80';
                break;
            case 'warning':
                notification.style.color = '#fbbf24';
                notification.style.borderColor = '#fbbf24';
                break;
            case 'error':
                notification.style.color = '#ff4444';
                notification.style.borderColor = '#ff4444';
                break;
        }
        
        this.messagesContainer.appendChild(notification);
        this.scrollToBottom();
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.ChatUI = ChatUI;
}