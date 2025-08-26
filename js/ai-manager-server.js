// 서버 기반 AI 대화 관리 시스템
class AIManagerServer {
    constructor() {
        // API 엔드포인트 설정
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/dialogue'
            : '/api/dialogue';
        
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
        console.log('🤖 Server-based AI Manager initializing...');
        
        // 서버 연결 테스트
        await this.testConnection();
        return true;
    }

    // 서버 연결 테스트
    async testConnection() {
        try {
            const response = await fetch(`${this.apiUrl}?action=stats`);
            
            if (response.ok) {
                const data = await response.json();
                this.isConnected = true;
                console.log('✅ Server-based AI connection established');
                console.log(`📊 Stats: ${data.statistics.total_responses} responses in ${data.statistics.categories} categories`);
            } else {
                console.error('❌ Server connection failed:', response.status);
                this.isConnected = false;
            }
        } catch (error) {
            console.error('❌ Server connection error:', error);
            this.isConnected = false;
        }
    }

    // 사용자 입력을 기반으로 AI 응답 생성 (서버 기반)
    async generateResponse(userInput, currentAffection, conversationContext, affectionLevel) {
        if (!this.isConnected || this.isProcessing) {
            return this.getFallbackResponse(userInput, currentAffection);
        }

        this.isProcessing = true;

        try {
            // 서버에 대사 생성 요청
            const url = `${this.apiUrl}?action=generate&message=${encodeURIComponent(userInput)}&affection=${currentAffection}&intimacy=${this.intimacyLevel}`;
            const response = await fetch(url);

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
            
            // 서버에서 받은 감정과 호감도 변화 적용
            const intimacyChange = data.affection_change || 0;
            this.intimacyLevel = Math.min(100, Math.max(0, this.intimacyLevel + intimacyChange));
            
            console.log('🤖 Server AI Response:', aiResponse);
            console.log('💕 Intimacy Level:', this.intimacyLevel);
            console.log('😊 Emotion:', data.emotion);
            console.log('📂 Category:', data.category);
            
            return aiResponse;

        } catch (error) {
            console.error('❌ Server AI generation error:', error);
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

    // 서버 연결 실패시 폴백 응답 (간단한 로컬 백업)
    getFallbackResponse(userInput, affection) {
        const responses = {
            high: [
                '서버 연결에 문제가 있어요 ㅜㅜ 잠시만 기다려주세요!',
                '오빠~ 지금 제 마음이 좀 복잡해요... 다시 말씀해주세요 💕'
            ],
            medium: [
                '음... 지금 제가 좀 혼란스러워요 😅',
                '서버와 연결이 끊어진 것 같아요. 다시 시도해보세요!'
            ],
            low: [
                '죄송해요... 지금 응답하기 어려워요 ㅠㅠ',
                '기술적인 문제가 있는 것 같아요...'
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

    // 서버 통계 가져오기
    async getServerStats() {
        try {
            const response = await fetch(`${this.apiUrl}?action=stats`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Failed to get server stats:', error);
        }
        return null;
    }

    // 디버그 정보
    getDebugInfo() {
        return {
            connected: this.isConnected,
            processing: this.isProcessing,
            intimacy: this.intimacyLevel,
            historyLength: this.conversationHistory.length,
            apiUrl: this.apiUrl,
            mode: 'server-based'
        };
    }

    // 어드민 패널 링크
    getAdminUrl() {
        return window.location.origin + '/admin.html';
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.AIManagerServer = AIManagerServer;
}