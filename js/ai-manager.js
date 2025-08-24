// AI 연결 관리 시스템
class AIManager {
    constructor() {
        // OpenAI API 설정 - 로컬 스토리지에서 불러오기
        this.apiKey = this.getStoredApiKey();
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-3.5-turbo';
        this.maxTokens = 150;
        
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
        
        // API 키 검증
        if (!this.apiKey) {
            console.warn('⚠️ OpenAI API key not found. Please enter in settings.');
            this.promptForApiKey();
            return false;
        }
        
        // 연결 테스트
        await this.testConnection();
        return true;
    }

    // API 연결 테스트
    async testConnection() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'user', content: 'test' }
                    ],
                    max_tokens: 10
                })
            });

            if (response.ok) {
                this.isConnected = true;
                console.log('✅ AI connection established');
            } else {
                console.error('❌ AI connection failed:', response.status);
                this.isConnected = false;
            }
        } catch (error) {
            console.error('❌ AI connection error:', error);
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
            // 시스템 프롬프트 생성 (호감도 레벨 포함)
            const systemPrompt = this.createSystemPrompt(currentAffection, conversationContext, affectionLevel);
            
            // 대화 히스토리 준비
            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.getRecentConversation(),
                { role: 'user', content: userInput }
            ];

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: this.maxTokens,
                    temperature: 0.8,
                    frequency_penalty: 0.3,
                    presence_penalty: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content.trim();
            
            // 대화 히스토리에 추가
            this.addToHistory(userInput, aiResponse);
            
            // 친밀도 업데이트
            this.updateIntimacy(userInput, aiResponse);
            
            console.log('🤖 AI Response:', aiResponse);
            return aiResponse;

        } catch (error) {
            console.error('❌ AI generation error:', error);
            return this.getFallbackResponse(userInput, currentAffection);
        } finally {
            this.isProcessing = false;
        }
    }

    // 시스템 프롬프트 생성 (호감도 상세 레벨 포함)
    createSystemPrompt(affection, context, affectionLevel) {
        const intimacyLevel = this.getIntimacyLevel();
        
        return `당신은 20세 대학생 후배 "윤아"입니다. 창용 오빠를 1년 넘게 좋아해왔고, 어제 고백했습니다.

현재 감정 상태:
- 호감도: ${affection}% - ${affectionLevel || this.getAffectionLevel(affection)}
- 친밀도: ${this.intimacyLevel}% (${intimacyLevel})
- 대화 상황: ${context}

성격과 말투:
- 밝고 적극적이며 솔직한 성격
- 창용 오빠를 진심으로 사랑함
- 감정 표현이 풍부하고 자연스러움
- 상황에 맞는 이모티콘 적극 사용

호감도별 반응 가이드:
${this.getResponseGuideByAffection(affection)}

응답 제약:
1. 30-60자 이내의 자연스러운 한 문장
2. 현재 호감도 레벨에 맞는 감정 표현
3. 상황에 맞는 적절한 이모티콘 1-2개 사용
4. 창용 오빠에 대한 일관된 애정 표현 유지
5. 대화를 자연스럽게 이어갈 수 있는 응답

중요: 호감도 ${affection}%에 맞게 ${affectionLevel}의 감정으로 반응하세요.`;
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

    // 친밀도 업데이트
    updateIntimacy(userInput, aiResponse) {
        // 긍정적 키워드 체크
        const positiveWords = ['좋아', '사랑', '예뻐', '고마워', '행복', '기뻐'];
        const negativeWords = ['싫어', '별로', '화나', '짜증'];

        const hasPositive = positiveWords.some(word => userInput.includes(word));
        const hasNegative = negativeWords.some(word => userInput.includes(word));

        if (hasPositive && !hasNegative) {
            this.intimacyLevel = Math.min(100, this.intimacyLevel + 3);
        } else if (hasNegative && !hasPositive) {
            this.intimacyLevel = Math.max(0, this.intimacyLevel - 2);
        } else {
            this.intimacyLevel = Math.min(100, this.intimacyLevel + 1);
        }

        console.log(`💕 Intimacy updated: ${this.intimacyLevel}%`);
    }

    // 호감도 레벨 텍스트
    getAffectionLevel(affection) {
        if (affection >= 90) return '매우 높음';
        if (affection >= 80) return '높음';
        if (affection >= 60) return '보통';
        if (affection >= 40) return '낮음';
        return '매우 낮음';
    }

    // 호감도별 상세 반응 가이드
    getResponseGuideByAffection(affection) {
        if (affection >= 90) {
            return `- 매우 열정적이고 적극적으로 반응
- "ㅋㅋㅋㅋㅋ", "와아아", "정말?!" 등 강한 감정 표현
- 💕💕, 🥰, 😍 등 사랑 이모티콘 적극 사용
- 창용 오빠에 대한 직접적인 애정 표현
- 예시: "ㅋㅋㅋㅋㅋ 창용 오빠 정말 최고예요! 💕💕"`;
        } else if (affection >= 80) {
            return `- 기쁘고 애정적으로 반응
- "ㅎㅎㅎ", "그렇구나", "기뻐요" 등 긍정적 표현
- 💕, 😊, 😘 등 기쁜 이모티콘 사용
- 자연스러운 애정 표현
- 예시: "ㅎㅎㅎ 그렇게 말해주시니 너무 기뻐요 💕"`;
        } else if (affection >= 60) {
            return `- 친근하고 밝게 반응
- "ㅎㅎ", "그래요", "맞아요" 등 친근한 표현
- 😊, ㅎㅎ, 🙂 등 밝은 이모티콘 사용
- 적당한 거리감 유지
- 예시: "ㅎㅎ 창용 오빠 말씀이 맞네요 😊"`;
        } else if (affection >= 40) {
            return `- 조금 어색하지만 예의바르게 반응
- "음..", "그렇네요", "아.." 등 중성적 표현
- 😅, 🤔, 😐 등 어색한 이모티콘 사용
- 거리감을 두는 느낌
- 예시: "음.. 그렇게 생각하시는군요 😅"`;
        } else {
            return `- 실망하거나 서운해하며 반응
- "ㅜㅜ", "아..", "그런가요.." 등 아쉬운 표현
- 😢, ㅜㅜ, 😞 등 슬픈 이모티콘 사용
- 상처받은 느낌 표현
- 예시: "ㅜㅜ 그렇게 생각하시는 거였군요..."`;
        }
    }

    // 친밀도 레벨 텍스트
    getIntimacyLevel() {
        if (this.intimacyLevel >= 80) return '매우 친밀';
        if (this.intimacyLevel >= 60) return '친밀';
        if (this.intimacyLevel >= 40) return '보통';
        if (this.intimacyLevel >= 20) return '어색';
        return '매우 어색';
    }

    // AI 연결 실패시 폴백 응답
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

    // 로컬 스토리지에서 API 키 가져오기
    getStoredApiKey() {
        try {
            const storedKey = localStorage.getItem('openai_api_key');
            if (storedKey && storedKey !== 'null' && storedKey !== '') {
                console.log('✅ API key loaded from storage');
                return storedKey;
            }
        } catch (error) {
            console.error('❌ Failed to load API key from storage:', error);
        }
        return null;
    }

    // API 키 저장
    saveApiKey(apiKey) {
        try {
            if (apiKey && apiKey.trim() !== '') {
                localStorage.setItem('openai_api_key', apiKey.trim());
                this.apiKey = apiKey.trim();
                console.log('✅ API key saved to storage');
                this.testConnection();
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to save API key:', error);
        }
        return false;
    }

    // API 키 입력 프롬프트
    promptForApiKey() {
        setTimeout(() => {
            const apiKey = prompt('OpenAI API 키를 입력해주세요 (sk-로 시작):', '');
            if (apiKey && apiKey.startsWith('sk-')) {
                if (this.saveApiKey(apiKey)) {
                    if (window.chatUI) {
                        window.chatUI.showNotification('API 키가 저장되었습니다! 🤖', 'success');
                    }
                    // 페이지 새로고침하여 재연결
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            } else if (apiKey !== null) {
                alert('올바른 OpenAI API 키를 입력해주세요.');
            }
        }, 1000);
    }

    // API 키 설정 (설정창에서 호출)
    setApiKey(apiKey) {
        return this.saveApiKey(apiKey);
    }

    // API 키 삭제
    clearApiKey() {
        try {
            localStorage.removeItem('openai_api_key');
            this.apiKey = null;
            this.isConnected = false;
            console.log('🗑️ API key cleared from storage');
        } catch (error) {
            console.error('❌ Failed to clear API key:', error);
        }
    }

    // 연결 상태 확인
    isAIConnected() {
        return this.isConnected && this.apiKey && this.apiKey.startsWith('sk-');
    }

    // 현재 API 키 상태 확인
    getApiKeyStatus() {
        if (!this.apiKey) return 'no_key';
        if (!this.apiKey.startsWith('sk-')) return 'invalid_key';
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

    // 디버그 정보
    getDebugInfo() {
        return {
            connected: this.isConnected,
            processing: this.isProcessing,
            intimacy: this.intimacyLevel,
            historyLength: this.conversationHistory.length,
            model: this.model
        };
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.AIManager = AIManager;
}