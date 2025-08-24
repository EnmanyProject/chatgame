// 채팅 UI 매니저
class ChatUI {
    constructor() {
        this.messagesContainer = null;
        this.choicesContainer = null;
        this.choicesOverlay = null;
        this.currentTypingIndicator = null;
        this.settingsModal = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    // DOM 요소 초기화
    initializeElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.choicesContainer = document.getElementById('choicesContainer');
        this.choicesOverlay = document.getElementById('choicesOverlay');
        this.settingsModal = document.getElementById('settingsModal');
        this.affectionElement = document.getElementById('affectionLevel');
        
        // 요소 확인 로그
        console.log('UI Elements initialized:');
        console.log('- messagesContainer:', !!this.messagesContainer);
        console.log('- choicesContainer:', !!this.choicesContainer);
        console.log('- choicesOverlay:', !!this.choicesOverlay);
        console.log('- settingsModal:', !!this.settingsModal);
        console.log('- affectionElement:', !!this.affectionElement);
    }

    // 이벤트 바인딩
    bindEvents() {
        // 설정 버튼
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
                this.addApiKeyUI(); // API 키 UI 추가
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

        // 설정 값 변경 이벤트
        const typingSpeed = document.getElementById('typingSpeed');
        if (typingSpeed) {
            typingSpeed.addEventListener('input', (e) => {
                if (window.chatEngine) {
                    window.chatEngine.setTypingSpeed(parseInt(e.target.value));
                }
            });
        }

        const autoMode = document.getElementById('autoMode');
        if (autoMode) {
            autoMode.addEventListener('change', (e) => {
                if (window.chatEngine) {
                    window.chatEngine.setAutoMode(e.target.checked);
                }
            });
        }

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            // ESC로 설정 모달 닫기
            if (e.key === 'Escape' && !this.settingsModal.classList.contains('hidden')) {
                this.hideSettings();
            }
            
            // 숫자 키로 선택지 선택
            if (e.key >= '1' && e.key <= '9' && !this.choicesOverlay.classList.contains('hidden')) {
                const choiceIndex = parseInt(e.key) - 1;
                const choices = this.choicesContainer.querySelectorAll('.choice-btn');
                if (choices[choiceIndex]) {
                    choices[choiceIndex].click();
                }
            }
        });
    }

    // 지문 추가
    async addStageDirection(text) {
        const stageElement = document.createElement('div');
        stageElement.className = 'stage-direction fade-in';
        stageElement.textContent = text;
        
        this.messagesContainer.appendChild(stageElement);
        this.scrollToBottom();
        
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    // 받은 메시지 추가
    async addReceivedMessage(message) {
        const messageElement = this.createMessageElement('received', message);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
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

    // 선택지 표시
    async showChoices(message) {
        console.log('UI: showChoices called with message:', message.id, 'options:', message.options?.length);
        
        if (!message.options) {
            console.error('No options found in message:', message);
            return;
        }

        // 선택지 컨테이너 초기화
        this.choicesContainer.innerHTML = '';
        console.log('UI: Choices container cleared');

        // 선택지 버튼 생성
        message.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.innerHTML = `<span class="choice-number">${index + 1}</span> ${option.text}`;
            
            button.addEventListener('click', () => {
                if (window.chatEngine) {
                    window.chatEngine.handleChoice(index, message);
                }
            });

            this.choicesContainer.appendChild(button);
        });

        // 선택지 오버레이 표시
        console.log('UI: Showing choices overlay');
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

    // 입력창 표시
    async showInput(message) {
        console.log('UI: showInput called with message:', message.id);
        
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
            }
        };
        
        // 이벤트 리스너
        sendButton.addEventListener('click', handleSend);
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
        
        inputWrapper.appendChild(textInput);
        inputWrapper.appendChild(sendButton);
        inputContainer.appendChild(inputWrapper);
        
        this.choicesContainer.appendChild(inputContainer);
        
        // 입력창 표시
        console.log('UI: Showing input overlay');
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

    // 호감도 업데이트
    updateAffection(affection) {
        if (this.affectionElement) {
            this.affectionElement.textContent = affection;
            
            // 호감도에 따른 색상 변경
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
            // 날짜 라벨은 유지하고 나머지만 제거
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
        
        // 5초 후 자동 제거
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
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // API 키 설정 UI를 동적으로 추가
    addApiKeyUI() {
        console.log('🔧 Adding API Key UI dynamically...');
        
        // 이미 추가되었는지 확인
        if (document.getElementById('saveApiKeyBtn')) {
            console.log('✅ API Key UI already exists');
            return;
        }

        // AI 설정 그룹 찾기
        const settingGroups = document.querySelectorAll('.setting-group');
        let aiSettingGroup = null;
        
        settingGroups.forEach(group => {
            const h3 = group.querySelector('h3');
            if (h3 && h3.textContent.includes('AI 설정')) {
                aiSettingGroup = group;
            }
        });

        if (!aiSettingGroup) {
            console.error('❌ AI 설정 그룹을 찾을 수 없습니다');
            return;
        }

        // 기존 API 키 입력 요소 찾기
        const apiKeyInput = aiSettingGroup.querySelector('#openaiApiKey');
        if (!apiKeyInput) {
            console.error('❌ API 키 입력창을 찾을 수 없습니다');
            return;
        }

        // 기존 label 요소를 새로운 구조로 교체
        const parentLabel = apiKeyInput.closest('.setting-item');
        
        // 새로운 API 키 섹션 HTML 생성
        const newApiSection = document.createElement('div');
        newApiSection.innerHTML = `
            <div class="api-key-section" style="
                background: #1a1a1a;
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #333;
                margin: 15px 0;
            ">
                <div class="api-key-header">
                    <h4 style="color: #fff; font-size: 16px; margin: 0 0 8px 0;">OpenAI API 키 설정</h4>
                    <p style="color: #aaa; font-size: 13px; margin: 0 0 20px 0;">새로운 API 키를 입력하고 저장 버튼을 눌러주세요</p>
                </div>
                
                <div class="api-key-input-group" style="margin-bottom: 20px;">
                    <input type="password" id="newApiKeyInput" placeholder="sk-proj-... 또는 sk-... 형태의 키를 입력하세요" style="
                        width: 100%;
                        background: #222;
                        border: 2px solid #444;
                        border-radius: 10px;
                        padding: 12px 16px;
                        color: #fff;
                        font-size: 14px;
                        font-family: 'Courier New', monospace;
                        margin-bottom: 15px;
                        box-sizing: border-box;
                    ">
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button type="button" id="saveApiKeyBtn" style="
                            background: linear-gradient(135deg, #ff69b4, #ff1493);
                            border: none;
                            color: white;
                            padding: 16px 32px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            min-width: 120px;
                            justify-content: center;
                            box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
                            transition: all 0.2s ease;
                        ">
                            💾 저장하기
                        </button>
                        <button type="button" id="clearApiKeyBtn" style="
                            background: linear-gradient(135deg, #666, #555);
                            border: none;
                            color: white;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            min-width: 120px;
                            justify-content: center;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                        ">
                            🗑️ 키 삭제
                        </button>
                    </div>
                </div>
                
                <div id="apiStatus" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #222;
                    border-radius: 10px;
                    border: 1px solid #444;
                    margin-bottom: 20px;
                ">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #666;"></div>
                    <span id="apiStatusText" style="color: #ccc; font-size: 13px;">API 키 상태: 미설정</span>
                </div>
                
                <div style="
                    background: rgba(255, 105, 180, 0.05);
                    border: 1px solid rgba(255, 105, 180, 0.2);
                    border-radius: 8px;
                    padding: 15px;
                ">
                    <p style="color: #ff69b4; font-size: 13px; font-weight: 600; margin: 0 0 10px 0;"><strong>💡 도움말:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 12px; line-height: 1.5;">
                        <li>OpenAI 계정에서 새 API 키를 발급받아 입력해주세요</li>
                        <li>API 키는 브라우저에만 안전하게 저장됩니다</li>
                        <li>키 발급: <a href="https://platform.openai.com/api-keys" target="_blank" style="color: #ff69b4; text-decoration: none; font-weight: 600;">platform.openai.com/api-keys</a></li>
                    </ul>
                </div>
            </div>
        `;

        // 기존 요소를 새 요소로 교체
        parentLabel.parentNode.replaceChild(newApiSection, parentLabel);

        // 이벤트 리스너 추가
        this.bindApiKeyEvents();
        
        console.log('✅ API 키 UI가 성공적으로 추가되었습니다!');
    }

    // API 키 관련 이벤트 바인딩
    bindApiKeyEvents() {
        const saveBtn = document.getElementById('saveApiKeyBtn');
        const clearBtn = document.getElementById('clearApiKeyBtn');
        const apiKeyInput = document.getElementById('newApiKeyInput');

        if (saveBtn && apiKeyInput) {
            saveBtn.addEventListener('click', () => {
                const apiKey = apiKeyInput.value.trim();
                if (apiKey && apiKey.startsWith('sk-')) {
                    // 로컬 스토리지에 저장
                    localStorage.setItem('openai_api_key', apiKey);
                    this.showNotification('API 키가 저장되었습니다! 🤖', 'success');
                    apiKeyInput.value = '';
                    
                    // 페이지 새로고침하여 재연결
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    this.showNotification('올바른 API 키를 입력해주세요 (sk-로 시작)', 'error');
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
                    localStorage.removeItem('openai_api_key');
                    this.showNotification('API 키가 삭제되었습니다.', 'info');
                }
            });
        }
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.ChatUI = ChatUI;
}