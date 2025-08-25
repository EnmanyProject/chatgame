// AI 서버 통신 관리 시스템
class AIManager {
    constructor() {
        // 서버 API 설정
        this.serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://chatgame-5oznul8c3-enmanys-projects.vercel.app';
        this.apiUrl = `${this.serverUrl}/api/chat`;
        
        // AI 연결 상태
        this.isConnected = false;
        this.isProcessing = false;
        
        // 친밀도 관리
        this.intimacyLevel = 0; // 0-100
        this.conversationHistory = [];
        
        this.init();
    }

    // AI 매니저 초기화
    async init() {
        console.log('🤖 AI Manager initializing...');
        
        // 서버 연결 테스트
        await this.testConnection();
        return true;
    }

    // 서버 연결 테스트
    async testConnection() {
        try {
            const response = await fetch(`${this.serverUrl}/health`);
            
            if (response.ok) {
                this.isConnected = true;
                console.log('✅ Server connection established');
            } else {
                console.error('❌ Server connection failed:', response.status);
                this.isConnected = false;
            }
        } catch (error) {
            console.error('❌ Server connection error:', error);
            this.isConnected = false;
        }
    }

    // 사용자 입력을 기반으로 AI 응답 생성 (호감도 고려)
    async generateResponse(userInput, currentAffection, conversationContext, affectionLevel) {
        if (!this.isConnected || this.isProcessing) {
            return this.getFallbackResponse(userInput, currentAffection);
        }

        this.isProcessing = true;

        try {
            // 서버에 전송할 데이터 구성
            const requestData = {
                message: userInput,
                conversationHistory: this.getRecentConversation(),
                userStats: {
                    affection: currentAffection,
                    intimacy: this.intimacyLevel,
                    context: conversationContext,
                    affectionLevel: affectionLevel
                }
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            const aiResponse = data.response.trim();
            
            // 대화 히스토리에 추가
            this.addToHistory(userInput, aiResponse);
            
            // 서버에서 받은 스탯 변화 적용
            if (data.statChanges) {
                this.applyStatChanges(data.statChanges);
            }
            
            console.log('🤖 AI Response:', aiResponse);
            return aiResponse;

        } catch (error) {
            console.error('❌ AI generation error:', error);
            return this.getFallbackResponse(userInput, currentAffection);
        } finally {
            this.isProcessing = false;
        }
    }

    // 최근 대화 히스토리 가져오기
    getRecentConversation() {
        return this.conversationHistory.slice(-6); // 최근 3번의 주고받기
    }

    // 대화 히스토리에 추가
    addToHistory(userInput, aiResponse) {
        this.conversationHistory.push(
            { role: 'user', content: userInput },
            { role: 'assistant', content: aiResponse }
        );

        // 히스토리가 너무 길어지면 정리
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-12);
        }
    }

    // 서버에서 받은 스탯 변화 적용
    applyStatChanges(statChanges) {
        if (statChanges.intimacy) {
            this.intimacyLevel = Math.min(100, Math.max(0, this.intimacyLevel + statChanges.intimacy));
        }
        console.log(`💕 Stats updated - Intimacy: ${this.intimacyLevel}%`);
    }

    // 호감도 레벨 텍스트
    getAffectionLevel(affection) {
        if (affection >= 90) return '매우 높음';
        if (affection >= 80) return '높음';
        if (affection >= 60) return '보통';
        if (affection >= 40) return '낮음';
        return '매우 낮음';
    }

    // 친밀도 레벨 텍스트
    getIntimacyLevel() {
        if (this.intimacyLevel >= 80) return '매우 친밀';
        if (this.intimacyLevel >= 60) return '친밀';
        if (this.intimacyLevel >= 40) return '보통';
        if (this.intimacyLevel >= 20) return '어색';
        return '매우 어색';
    }

    // 서버 연결 실패시 폴백 응답
    getFallbackResponse(userInput, affection) {
        const responses = {
            high: [
                'ㅋㅋㅋㅋㅋ 창용 오빠 정말 💕',
                '오빠가 그렇게 말해주니까 너무 기뻐요 ㅎㅎ',
                '진짜요?? 저도 오빠가 너무 좋아요 💕💕'
            ],
            medium: [
                'ㅎㅎ 그렇게 생각해주시는군요',
                '오빠 말씀 감사해요 😊',
                '그런 말 들으니까 기분 좋네요 ㅎㅎ'
            ],
            low: [
                'ㅜㅜ 그렇게 생각하시는군요',
                '아... 그런가요? 😅',
                '음... 알겠어요 ㅠㅠ'
            ]
        };

        let level = 'medium';
        if (affection >= 80) level = 'high';
        else if (affection < 50) level = 'low';

        const responseList = responses[level];
        return responseList[Math.floor(Math.random() * responseList.length)];
    }

    // 연결 상태 확인
    isAIConnected() {
        return this.isConnected;
    }

    // 서버 상태 확인
    getConnectionStatus() {
        if (this.isConnected) return 'connected';
        return 'not_connected';
    }

    // 친밀도 가져오기
    getIntimacyScore() {
        return this.intimacyLevel;
    }

    // 대화 히스토리 초기화
    clearHistory() {
        this.conversationHistory = [];
        this.intimacyLevel = 0;
        console.log('🔄 Conversation history cleared');
    }

    // 서버 URL 설정 (개발/배포 환경에 따라)
    setServerUrl(url) {
        this.serverUrl = url;
        this.apiUrl = `${this.serverUrl}/api/chat`;
        console.log('🔧 Server URL updated:', this.serverUrl);
    }

    // 디버그 정보
    getDebugInfo() {
        return {
            connected: this.isConnected,
            processing: this.isProcessing,
            intimacy: this.intimacyLevel,
            historyLength: this.conversationHistory.length,
            serverUrl: this.serverUrl
        };
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.AIManager = AIManager;
}