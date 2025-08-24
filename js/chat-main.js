// 채팅 앱 메인 애플리케이션
class ChatApp {
    constructor() {
        this.chatEngine = null;
        this.chatUI = null;
        this.profileManager = null;
        this.isInitialized = false;
        
        this.init();
    }

    // 앱 초기화
    async init() {
        try {
            console.log('🎮 Chat Adventure Game Starting...');
            
            // DOM 로드 대기
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // UI 매니저 초기화
            this.chatUI = new ChatUI();
            window.chatUI = this.chatUI;

            // 프로필 매니저 초기화
            console.log('🔍 Checking ProfileManager availability...');
            console.log('- window.ProfileManager exists:', !!window.ProfileManager);
            
            if (window.ProfileManager) {
                try {
                    console.log('🚀 Creating ProfileManager instance...');
                    this.profileManager = new window.ProfileManager();
                    window.profileManager = this.profileManager;
                    console.log('✅ Profile Manager initialized successfully');
                } catch (error) {
                    console.error('❌ Profile Manager initialization failed:', error);
                }
            } else {
                console.error('❌ ProfileManager class not found! Check if profile-manager.js is loaded.');
            }

            // 엔진 초기화
            this.chatEngine = new ChatEngine();
            window.chatEngine = this.chatEngine;

            // API 키 설정 이벤트 바인딩
            this.setupApiKeyEvents();

            // 로딩 표시
            this.chatUI.showLoading();

            // 잠시 대기 (로딩 애니메이션 표시)
            await this.delay(1000);

            // 게임 시작
            const success = await this.chatEngine.startGame();
            
            if (success) {
                console.log('✅ Game initialized successfully');
                this.isInitialized = true;
                
                // 로딩 숨김
                this.chatUI.hideLoading();
                
                // 성공 알림
                setTimeout(() => {
                    this.chatUI.showNotification('채팅이 연결되었습니다 💕', 'success');
                }, 500);
            } else {
                throw new Error('Failed to start game');
            }

        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            console.error('Error details:', error);
            this.showError('앱을 시작할 수 없습니다: ' + error.message);
        }
    }

    // 오류 화면 표시
    showError(message) {
        if (this.chatUI) {
            this.chatUI.hideLoading();
            this.chatUI.showError(message);
        } else {
            // UI가 없는 경우 기본 오류 표시
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: #000;
                    color: #fff;
                    font-family: system-ui;
                    text-align: center;
                    padding: 20px;
                ">
                    <div>
                        <h2 style="color: #ff4444; margin-bottom: 20px;">오류 발생</h2>
                        <p>${message}</p>
                        <button onclick="location.reload()" style="
                            margin-top: 20px;
                            padding: 10px 20px;
                            background: #333;
                            color: #fff;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">다시 시도</button>
                    </div>
                </div>
            `;
        }
    }

    // 게임 상태 가져오기
    getGameState() {
        if (!this.isInitialized || !this.chatEngine) {
            return null;
        }
        
        return {
            ...this.chatEngine.getGameState(),
            initialized: this.isInitialized,
            timestamp: new Date().toISOString()
        };
    }

    // 게임 재시작
    async restartGame() {
        if (!this.isInitialized || !this.chatEngine) {
            console.error('Game not initialized');
            return;
        }

        try {
            console.log('Restarting game...');
            
            if (this.chatUI) {
                this.chatUI.showLoading();
                this.chatUI.showNotification('게임을 재시작합니다...', 'info');
            }

            await this.delay(1000);
            await this.chatEngine.restartGame();

            if (this.chatUI) {
                this.chatUI.hideLoading();
                setTimeout(() => {
                    this.chatUI.showNotification('게임이 재시작되었습니다 🎮', 'success');
                }, 500);
            }

            console.log('Game restarted successfully');
            
        } catch (error) {
            console.error('Failed to restart game:', error);
            if (this.chatUI) {
                this.chatUI.hideLoading();
                this.chatUI.showError('게임 재시작에 실패했습니다');
            }
        }
    }

    // 설정 저장
    saveSettings() {
        const settings = {
            typingSpeed: document.getElementById('typingSpeed')?.value || 5,
            autoMode: document.getElementById('autoMode')?.checked || false,
            openaiApiKey: document.getElementById('openaiApiKey')?.value || '',
            aiMode: document.getElementById('aiMode')?.checked || false
        };

        localStorage.setItem('chatGameSettings', JSON.stringify(settings));
        console.log('Settings saved:', settings);
        
        if (this.chatUI) {
            this.chatUI.showNotification('설정이 저장되었습니다', 'success');
        }
    }

    // 설정 불러오기
    loadSettings() {
        try {
            const saved = localStorage.getItem('chatGameSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // UI에 설정 적용
                const typingSpeed = document.getElementById('typingSpeed');
                const autoMode = document.getElementById('autoMode');
                const openaiApiKey = document.getElementById('openaiApiKey');
                const aiMode = document.getElementById('aiMode');

                if (typingSpeed) typingSpeed.value = settings.typingSpeed || 5;
                if (autoMode) autoMode.checked = settings.autoMode || false;
                if (openaiApiKey) openaiApiKey.value = settings.openaiApiKey || '';
                if (aiMode) aiMode.checked = settings.aiMode || false;

                // 엔진에 설정 적용
                if (this.chatEngine) {
                    this.chatEngine.setTypingSpeed(settings.typingSpeed || 5);
                    this.chatEngine.setAutoMode(settings.autoMode || false);
                }

                console.log('Settings loaded:', settings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // API 키 설정 이벤트 바인딩
    setupApiKeyEvents() {
        const saveBtn = document.getElementById('saveApiKeyBtn');
        const clearBtn = document.getElementById('clearApiKeyBtn');
        const apiKeyInput = document.getElementById('openaiApiKey');
        const apiStatus = document.getElementById('apiStatus');
        const apiStatusText = document.getElementById('apiStatusText');

        // 저장 버튼 이벤트
        if (saveBtn && apiKeyInput) {
            saveBtn.addEventListener('click', () => {
                const apiKey = apiKeyInput.value.trim();
                if (apiKey && apiKey.startsWith('sk-')) {
                    if (this.chatEngine?.aiManager?.saveApiKey(apiKey)) {
                        this.chatUI?.showNotification('API 키가 저장되었습니다! 🤖', 'success');
                        this.updateApiKeyStatus();
                        apiKeyInput.value = '';
                    } else {
                        this.chatUI?.showNotification('API 키 저장에 실패했습니다.', 'error');
                    }
                } else {
                    this.chatUI?.showNotification('올바른 API 키를 입력해주세요 (sk-로 시작)', 'error');
                }
            });
        }

        // 삭제 버튼 이벤트
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
                    this.chatEngine?.aiManager?.clearApiKey();
                    this.chatUI?.showNotification('API 키가 삭제되었습니다.', 'info');
                    this.updateApiKeyStatus();
                }
            });
        }

        // 초기 상태 업데이트
        setTimeout(() => {
            this.updateApiKeyStatus();
        }, 2000);
    }

    // API 키 상태 업데이트
    updateApiKeyStatus() {
        const apiStatus = document.getElementById('apiStatus');
        const apiStatusText = document.getElementById('apiStatusText');

        if (apiStatus && apiStatusText && this.chatEngine?.aiManager) {
            const status = this.chatEngine.aiManager.getApiKeyStatus();
            
            apiStatus.className = 'api-status';
            
            switch (status) {
                case 'connected':
                    apiStatus.classList.add('connected');
                    apiStatusText.textContent = 'API 키 상태: 연결됨 ✅';
                    break;
                case 'not_connected':
                    apiStatus.classList.add('error');
                    apiStatusText.textContent = 'API 키 상태: 연결 실패 ❌';
                    break;
                case 'invalid_key':
                    apiStatus.classList.add('error');
                    apiStatusText.textContent = 'API 키 상태: 잘못된 키 형식 ⚠️';
                    break;
                default:
                    apiStatusText.textContent = 'API 키 상태: 미설정 ⚪';
            }
        }
    }

    // 유틸리티: 지연
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 디버그 정보 출력
    debug() {
        console.log('=== Chat App Debug Info ===');
        console.log('Initialized:', this.isInitialized);
        console.log('Game State:', this.getGameState());
        console.log('Message History Length:', this.chatEngine?.getMessageHistory().length || 0);
        console.log('Current Affection:', this.chatEngine?.getAffection() || 0);
        console.log('==========================');
    }
}

// 전역 함수들
window.restartGame = function() {
    if (window.chatApp) {
        window.chatApp.restartGame();
    }
};

window.saveSettings = function() {
    if (window.chatApp) {
        window.chatApp.saveSettings();
    }
};

window.debugGame = function() {
    if (window.chatApp) {
        window.chatApp.debug();
    }
};

// 앱 시작
let chatApp;

if (typeof window !== 'undefined') {
    // 페이지 로드시 앱 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            chatApp = new ChatApp();
            window.chatApp = chatApp;
            
            // 설정 불러오기
            setTimeout(() => {
                chatApp.loadSettings();
            }, 1000);
        });
    } else {
        chatApp = new ChatApp();
        window.chatApp = chatApp;
        
        // 설정 불러오기
        setTimeout(() => {
            chatApp.loadSettings();
        }, 1000);
    }
}

// 디버그를 위한 전역 객체 등록
if (typeof window !== 'undefined') {
    window.ChatApp = ChatApp;
}