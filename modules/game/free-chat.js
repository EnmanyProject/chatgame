/**
 * 💬 직접 입력 & 자유 채팅 모듈 (v2.1.0)
 * - 사용자 직접 입력 처리
 * - 자유 채팅 모드 관리
 * - AI 응답 생성 요청
 * - 채팅 기록 관리
 */

import gameArch from '../core/architecture.js';
import DataSchema from '../core/schema.js';

export class FreeChat {
    constructor() {
        this.chatHistory = [];
        this.isFreeChatMode = false;
        this.inputFilters = [];
        this.responsePattens = new Map();
        this.initialized = false;
    }

    // 모듈 초기화
    async initialize() {
        try {
            console.log('💬 FreeChat 모듈 초기화 중...');
            
            // 입력 필터 설정
            this.setupInputFilters();
            
            // 응답 패턴 설정
            this.setupResponsePatterns();
            
            // 이벤트 리스너 등록
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ FreeChat 모듈 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ FreeChat 초기화 실패:', error);
            return false;
        }
    }

    // 입력 필터 설정
    setupInputFilters() {
        this.inputFilters = [
            // 욕설 및 부적절한 표현 필터
            {
                name: 'profanity',
                pattern: /[욕설|비속어|부적절한표현]/gi,
                action: 'block',
                message: '적절하지 않은 표현입니다. 다른 말로 표현해주세요.'
            },
            
            // 너무 긴 입력 제한
            {
                name: 'length',
                check: (text) => text.length > 200,
                action: 'truncate',
                message: '메시지가 너무 길어서 200자로 줄였습니다.'
            },
            
            // 빈 입력 체크
            {
                name: 'empty',
                check: (text) => text.trim().length === 0,
                action: 'block',
                message: '메시지를 입력해주세요.'
            }
        ];
    }

    // 응답 패턴 설정
    setupResponsePatterns() {
        // 일반적인 응답 패턴들
        this.responsePattens.set('greeting', [
            '안녕하세요! 😊',
            '반가워요~ 🌟',
            '안녕! 어떻게 지내고 있어요?'
        ]);

        this.responsePattens.set('question_about_character', [
            '저에 대해 궁금한 게 있으신가요? 😳',
            '무엇이든 물어보세요~ 💭',
            '어떤 이야기가 듣고 싶으신지 말씀해주세요!'
        ]);

        this.responsePattens.set('compliment', [
            '고마워요... 부끄럽네요 😊💕',
            '정말요? 기뻐요! 😄',
            '그런 말 들으니까 너무 좋아요 ㅎㅎ'
        ]);

        this.responsePattens.set('concern', [
            '걱정해주셔서 고마워요 🥺',
            '괜찮아요, 신경 써주셔서 감사해요',
            '이렇게 생각해주시니까 마음이 따뜻해져요'
        ]);
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        gameArch.on('freeChatModeToggled', (event) => {
            this.toggleFreeChatMode(event.detail.enabled);
        });

        gameArch.on('userMessageSent', (event) => {
            if (this.isFreeChatMode) {
                this.handleUserMessage(event.detail);
            }
        });
    }

    // 자유 채팅 모드 토글
    toggleFreeChatMode(enabled) {
        this.isFreeChatMode = enabled;
        
        if (enabled) {
            console.log('💬 자유 채팅 모드 활성화');
            gameArch.emit('systemMessage', {
                text: '자유롭게 대화해보세요! 💭',
                type: 'info'
            });
        } else {
            console.log('🎮 선택지 모드로 전환');
        }
        
        gameArch.emit('freeChatModeChanged', { enabled });
    }

    // 사용자 메시지 처리
    async handleUserMessage(messageData) {
        try {
            const { text, gameState } = messageData;
            
            // 1. 입력 검증 및 필터링
            const filteredResult = this.filterUserInput(text);
            if (!filteredResult.valid) {
                return {
                    success: false,
                    error: filteredResult.message,
                    action: filteredResult.action
                };
            }

            // 2. 채팅 기록에 추가
            this.addChatRecord('user', filteredResult.text, gameState);

            // 3. 응답 생성
            const response = await this.generateResponse(
                filteredResult.text, 
                gameState
            );

            // 4. 호감도 변화 계산 (자유 채팅의 경우)
            const affectionChange = this.calculateFreeChatAffection(
                filteredResult.text,
                gameState
            );

            // 5. 응답 기록 추가
            if (response.success) {
                this.addChatRecord('character', response.text, gameState);
            }

            return {
                success: true,
                userMessage: filteredResult.text,
                characterResponse: response.text,
                affectionChange: affectionChange,
                chatRecord: this.getRecentChatHistory(5)
            };

        } catch (error) {
            console.error('❌ 자유 채팅 처리 실패:', error);
            return {
                success: false,
                error: '메시지 처리 중 오류가 발생했습니다.',
                fallbackResponse: '죄송해요, 잠시 후 다시 말씀해주세요 😅'
            };
        }
    }

    // 사용자 입력 필터링
    filterUserInput(text) {
        for (const filter of this.inputFilters) {
            if (filter.pattern && filter.pattern.test(text)) {
                return {
                    valid: filter.action !== 'block',
                    text: filter.action === 'block' ? text : text.replace(filter.pattern, '***'),
                    action: filter.action,
                    message: filter.message
                };
            }
            
            if (filter.check && filter.check(text)) {
                if (filter.action === 'block') {
                    return {
                        valid: false,
                        text: text,
                        action: filter.action,
                        message: filter.message
                    };
                } else if (filter.action === 'truncate') {
                    return {
                        valid: true,
                        text: text.substring(0, 200),
                        action: filter.action,
                        message: filter.message
                    };
                }
            }
        }

        return {
            valid: true,
            text: text.trim(),
            action: 'pass',
            message: null
        };
    }

    // AI 응답 생성
    async generateResponse(userText, gameState) {
        try {
            // 1. 패턴 매칭을 통한 빠른 응답
            const patternResponse = this.tryPatternResponse(userText);
            if (patternResponse) {
                return {
                    success: true,
                    text: patternResponse,
                    source: 'pattern',
                    timestamp: Date.now()
                };
            }

            // 2. API를 통한 동적 응답 생성
            const apiResponse = await this.requestAIResponse(userText, gameState);
            if (apiResponse.success) {
                return apiResponse;
            }

            // 3. Fallback 응답
            return {
                success: true,
                text: this.getFallbackResponse(userText),
                source: 'fallback',
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('❌ 응답 생성 실패:', error);
            return {
                success: false,
                error: error.message,
                text: '잠시 후 다시 말씀해주세요 😅'
            };
        }
    }

    // 패턴 응답 시도
    tryPatternResponse(userText) {
        const lowerText = userText.toLowerCase();
        
        // 인사 패턴
        if (/안녕|hello|hi|하이/.test(lowerText)) {
            const responses = this.responsePattens.get('greeting');
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // 칭찬 패턴
        if (/예쁘다|이쁘다|귀엽다|좋다|멋지다/.test(lowerText)) {
            const responses = this.responsePattens.get('compliment');
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // 질문 패턴
        if (/어떻게|왜|뭐|무엇|언제/.test(lowerText)) {
            const responses = this.responsePattens.get('question_about_character');
            return responses[Math.floor(Math.random() * responses.length)];
        }

        return null;
    }

    // API 응답 요청
    async requestAIResponse(userText, gameState) {
        try {
            const response = await fetch('/api/scenario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'free_chat',
                    user_message: userText,
                    character_id: gameState.currentCharacter?.id,
                    affection: gameState.affection,
                    chat_history: this.getRecentChatHistory(3)
                })
            });

            const data = await response.json();
            
            if (data.success && data.response) {
                return {
                    success: true,
                    text: data.response,
                    source: 'ai',
                    timestamp: Date.now()
                };
            }

            throw new Error(data.error || 'AI 응답 생성 실패');

        } catch (error) {
            console.error('❌ AI API 호출 실패:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 폴백 응답 생성
    getFallbackResponse(userText) {
        const fallbacks = [
            '그런 생각을 하셨군요! 😊',
            '흥미로운 이야기네요~ 💭',
            '더 자세히 말씀해주시겠어요?',
            '그렇게 생각하시는군요! ㅎㅎ',
            '아, 정말요? 신기해요! ✨'
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // 자유 채팅 호감도 계산
    calculateFreeChatAffection(userText) {
        // 간단한 호감도 계산 로직
        let affectionChange = 0;
        
        // 긍정적인 표현
        if (/좋다|사랑|예쁘다|귀엽다|멋지다|훌륭하다/.test(userText)) {
            affectionChange += 1;
        }
        
        // 관심 표현
        if (/궁금하다|알고싶다|더|자세히/.test(userText)) {
            affectionChange += 0.5;
        }
        
        // 부정적 표현
        if (/싫다|별로|그만|안돼/.test(userText)) {
            affectionChange -= 0.5;
        }

        return Math.round(affectionChange * 10) / 10;
    }

    // 채팅 기록 추가
    addChatRecord(sender, text, gameState) {
        this.chatHistory.push({
            id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            sender: sender, // 'user' or 'character'
            text: text,
            choiceNumber: gameState.choiceNumber,
            affection: gameState.affection
        });

        // 최근 100개만 유지
        if (this.chatHistory.length > 100) {
            this.chatHistory = this.chatHistory.slice(-100);
        }
    }

    // 최근 채팅 기록 조회
    getRecentChatHistory(count = 10) {
        return this.chatHistory.slice(-count);
    }

    // 채팅 기록 통계
    getChatStats() {
        const userMessages = this.chatHistory.filter(chat => chat.sender === 'user');
        const characterMessages = this.chatHistory.filter(chat => chat.sender === 'character');
        
        return {
            totalMessages: this.chatHistory.length,
            userMessages: userMessages.length,
            characterMessages: characterMessages.length,
            averageMessageLength: this.chatHistory.length > 0 ? 
                this.chatHistory.reduce((sum, chat) => sum + chat.text.length, 0) / this.chatHistory.length : 0
        };
    }
}

// 모듈 인스턴스 생성 및 등록
const freeChat = new FreeChat();
gameArch.registerModule('freeChat', freeChat);

export default freeChat;