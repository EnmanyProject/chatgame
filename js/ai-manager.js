// AI 서버 통신 관리 시스템
class AIManager {
    constructor() {
        // Vercel API Routes 설정
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/chat'
            : '/api/chat';
        
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

    // 로컬 AI 시뮬레이션 연결
    async testConnection() {
        try {
            // 하드코딩된 응답으로 항상 연결 성공
            this.isConnected = true;
            console.log('✅ Local AI Simulation ready - No server required');
        } catch (error) {
            console.error('❌ Connection setup error:', error);
            this.isConnected = false;
        }
    }

    // 사용자 입력을 기반으로 AI 응답 생성 (하드코딩된 응답)
    async generateResponse(userInput, currentAffection, conversationContext, affectionLevel) {
        if (this.isProcessing) {
            return this.getFallbackResponse(userInput, currentAffection);
        }

        this.isProcessing = true;

        try {
            // 시뮬레이션을 위한 약간의 지연
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            
            const aiResponse = this.getSmartResponse(userInput, currentAffection);
            
            // 대화 히스토리에 추가
            this.addToHistory(userInput, aiResponse);
            
            // 친밀도 변화 시뮬레이션
            const intimacyChange = this.calculateIntimacyChange(userInput);
            this.intimacyLevel = Math.min(100, Math.max(0, this.intimacyLevel + intimacyChange));
            
            console.log('🤖 AI Response:', aiResponse);
            console.log('💕 Intimacy Level:', this.intimacyLevel);
            
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

    // 키워드 기반 스마트 응답 생성
    getSmartResponse(userInput, affection) {
        const input = userInput.toLowerCase();
        
        // 키워드별 응답 패턴
        const responsePatterns = {
            greetings: {
                keywords: ['안녕', '하이', '헬로', '좋은', '아침', '저녁'],
                responses: [
                    '안녕하세요! 창용 오빠 ㅎㅎ 오늘 하루 어떠셨어요?',
                    '오빠! 안녕하세요~ 보고 싶었어요 💕',
                    '헤이~ 창용 오빠! 오늘도 멋있으시네요 ㅋㅋ'
                ]
            },
            compliments: {
                keywords: ['예쁘', '좋아', '사랑', '최고', '멋있', '잘생'],
                responses: [
                    '오빠가 그렇게 말해주시니까 너무 기뻐요! ㅜㅜ 정말이에요?',
                    'ㅋㅋㅋ 창용 오빠도 정말 멋있어요! 💕',
                    '에헤헤~ 오빠 때문에 기분이 너무 좋아져요 ㅎㅎ',
                    '오빠만 그렇게 생각해주시면 돼요 💕 고마워요!'
                ]
            },
            questions: {
                keywords: ['뭐해', '뭐하', '어떻', '어디', '언제', '왜', '누구'],
                responses: [
                    '지금은 오빠 생각하면서 공부하고 있었어요 ㅎㅎ',
                    '오빠랑 얘기하는 게 제일 재밌어요! ㅋㅋ',
                    '음... 비밀이에요~ 궁금하면 더 자주 연락해요 💕',
                    '오빠는 지금 뭐하고 계세요? 저도 궁금해요!'
                ]
            },
            memory: {
                keywords: ['기억', '어제', '전에', '그때', '예전'],
                responses: [
                    '어제 오빠랑 있었던 일 정말 기억에 남아요! ㅎㅎ',
                    '오빠는 기억 안 나세요? ㅜㅜ 저는 다 기억하고 있는데...',
                    '그때 정말 재밌었잖아요~ 또 그런 시간 가져요! 💕',
                    '오빠랑의 추억들은 다 소중해요 ㅋㅋ'
                ]
            },
            food: {
                keywords: ['먹', '배고', '음식', '밥', '커피', '카페'],
                responses: [
                    '오빠 배고프세요? 맛있는 거 같이 먹어요! ㅎㅎ',
                    '저도 배고파요~ 오빠가 사주시는 거죠? ㅋㅋ',
                    '카페 가고 싶어요! 오빠랑 같이 가면 더 맛있을 것 같아요 💕',
                    '오빠는 뭘 좋아하세요? 저도 그거 좋아해요! ㅎㅎ'
                ]
            },
            negative: {
                keywords: ['싫어', '안해', '그만', '귀찮', '화나', '짜증'],
                responses: [
                    'ㅜㅜ 왜요... 제가 뭔가 잘못했나요?',
                    '오빠... 화내지 마세요 ㅠㅠ',
                    '미안해요... 앞으로 더 잘할게요!',
                    '오빠 기분이 안 좋으신가봐요? 괜찮아질 거예요!'
                ]
            }
        };

        // 키워드 매칭으로 카테고리 찾기
        for (const [category, data] of Object.entries(responsePatterns)) {
            if (data.keywords.some(keyword => input.includes(keyword))) {
                const responses = data.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // 호감도에 따른 기본 응답
        return this.getFallbackResponse(userInput, affection);
    }

    // 친밀도 변화 계산
    calculateIntimacyChange(userInput) {
        const input = userInput.toLowerCase();
        const positiveWords = ['좋아', '예쁘', '사랑', '고마워', '최고', '멋있'];
        const negativeWords = ['싫어', '귀찮', '그만', '화나'];
        
        let change = 0;
        positiveWords.forEach(word => {
            if (input.includes(word)) change += 2;
        });
        negativeWords.forEach(word => {
            if (input.includes(word)) change -= 3;
        });
        
        return change;
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

    // 기본 응답 (호감도별)
    getFallbackResponse(userInput, affection) {
        const responses = {
            high: [
                '오빠~ 저랑 더 많은 얘기해요! 너무 좋아요 💕',
                'ㅋㅋㅋ 창용 오빠 정말! 항상 재밌는 말씀을 하시네요~',
                '오빠와 함께 있으면 시간 가는 줄 모르겠어요 ㅎㅎ',
                '진짜요?? 저도 오빠 생각을 항상 하고 있어요 💕💕',
                '오빠만 있으면 뭐든 다 좋아요! ㅎㅎ'
            ],
            medium: [
                'ㅎㅎ 그렇게 생각해주시는군요~',
                '오빠 말씀 듣고 있으면 재밌어요 😊',
                '그런 말 들으니까 기분 좋네요 ㅎㅎ',
                '오빠는 항상 특별한 말씀을 하시네요!',
                '음... 더 얘기해주세요! 궁금해요 ㅋㅋ'
            ],
            low: [
                'ㅜㅜ 그렇게 생각하시는군요...',
                '아... 그런가요? 😅 제가 부족한가봐요',
                '음... 알겠어요 ㅠㅠ',
                '오빠가 그렇게 말씀하시니까... 그런 것 같아요',
                '다음에는 더 잘할게요... ㅜㅜ'
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
        console.log('🔧 Using Vercel API Routes - URL setting not needed');
    }

    // 디버그 정보
    getDebugInfo() {
        return {
            connected: this.isConnected,
            processing: this.isProcessing,
            intimacy: this.intimacyLevel,
            historyLength: this.conversationHistory.length,
            apiUrl: this.apiUrl
        };
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.AIManager = AIManager;
}