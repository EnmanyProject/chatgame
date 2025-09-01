/**
 * 🎮 GameLogic.js - 메신저형 어드벤처 게임 핵심 로직 모듈
 * 버전: v3.1.0 (개선된 버전)
 * 
 * 개선사항:
 * - AI 응답을 캐릭터 대사로 변환
 * - 호감도 변경 애니메이션 지원
 * - 선택지 대화체 변환
 * - 지문 처리 개선
 */

export class GameLogic {
    constructor() {
        this.version = 'v3.1.0';
        
        // 호감도 계산 가중치
        this.affectionWeights = {
            choice: 1.0,        
            freeInput: 1.5,     
            timeBonus: 0.1,     
            streakBonus: 0.2,   
            phaseMultiplier: {  
                introduction: 0.8,  
                development: 1.0,   
                deepening: 1.2,     
                conclusion: 1.5     
            }
        };
        
        // 감정 분석 키워드 데이터베이스 (확장)
        this.emotionKeywords = {
            positive: ['좋아', '사랑', '예쁘', '멋져', '완벽', '최고', '행복', '기뻐', '감동', '고마워', '훌륭', '대단', '즐거워', '재밌어'],
            romantic: ['설레', '두근', '사랑해', '좋아해', '예쁘다', '귀여워', '매력적', '운명', '소중해', '특별해', '보고싶어', '만나고싶어'],
            caring: ['걱정', '챙겨', '보살펴', '도와줄게', '함께', '곁에', '지켜줄게', '응원', '힘내', '괜찮', '위로', '토닥'],
            negative: ['싫어', '짜증', '화나', '별로', '귀찮', '피곤', '스트레스', '실망', '속상', '화가', '미안', '죄송'],
            neutral: ['그래', '알겠어', '음', '그냥', '모르겠어', '상관없어', '괜찮아', '뭐', '아무래도', '네', '응']
        };
        
        // 캐릭터 정보 (대사 생성용)
        this.characterInfo = {
            name: '윤아',
            personality: 'cheerful', // cheerful, shy, tsundere, cool
            speechStyle: 'casual' // formal, casual, cute
        };
        
        // 내부 상태 관리
        this.streakCount = 0;
        this.lastChoiceTime = null;
        this.totalInteractions = 0;
        this.specialEventCooldown = new Set();
        
        console.log('🎮 GameLogic 모듈 v3.1.0 초기화 완료');
    }

    /**
     * 선택지 처리 (대화체 변환 포함)
     */
    processChoice(choice, gameState) {
        const result = {
            success: true,
            affectionChange: 0,
            intimacyChange: 0,
            specialEvent: null,
            message: '',
            characterResponse: '',  // 캐릭터 반응 대사
            animationData: null,    // 애니메이션 데이터
            gameState: { ...gameState }
        };

        try {
            const oldAffection = gameState.affection;
            const oldIntimacy = gameState.intimacy || 0;
            
            // 기본 호감도 변화 (표시하지 않음)
            let baseAffectionChange = choice.affection_impact || 0;
            
            // 게임 단계별 가중치 적용
            const currentPhase = this.getCurrentPhase(gameState.choiceNumber || 0);
            const phaseMultiplier = this.affectionWeights.phaseMultiplier[currentPhase];
            
            // 시간 보너스 계산
            const timeBonus = this.calculateTimeBonus();
            
            // 연속 선택 보너스 계산
            const streakBonus = this.calculateStreakBonus(baseAffectionChange);
            
            // 최종 호감도 변화 계산
            const adjustedBase = Math.round(baseAffectionChange * phaseMultiplier);
            const totalAffectionChange = Math.round(
                (adjustedBase * this.affectionWeights.choice) + 
                timeBonus + 
                streakBonus
            );
            
            // 친밀도 계산
            let intimacyChange = 0;
            if (baseAffectionChange > 0) {
                const intimacyChance = Math.min(0.5, 0.2 + (gameState.intimacy / 200));
                intimacyChange = Math.random() < intimacyChance ? Math.floor(Math.random() * 2) + 1 : 0;
            }
            
            // 게임 상태 업데이트
            result.gameState.affection = Math.max(-100, Math.min(100, 
                gameState.affection + totalAffectionChange));
            result.gameState.intimacy = Math.max(0, Math.min(100, 
                (gameState.intimacy || 0) + intimacyChange));
            result.gameState.choiceNumber = (gameState.choiceNumber || 0) + 1;
            
            // 애니메이션 데이터 생성
            result.animationData = {
                affection: {
                    from: oldAffection,
                    to: result.gameState.affection,
                    change: totalAffectionChange
                },
                intimacy: {
                    from: oldIntimacy,
                    to: result.gameState.intimacy,
                    change: intimacyChange
                }
            };
            
            // 선택 히스토리 업데이트
            if (!result.gameState.choiceHistory) result.gameState.choiceHistory = [];
            if (!result.gameState.previousChoices) result.gameState.previousChoices = [];
            
            const choiceRecord = {
                choice: choice.text,
                baseImpact: choice.affection_impact,
                finalChange: totalAffectionChange,
                intimacyChange: intimacyChange,
                phase: currentPhase,
                timestamp: new Date().toISOString()
            };
            
            result.gameState.choiceHistory.push(choiceRecord);
            result.gameState.previousChoices.push(choice);
            
            result.affectionChange = totalAffectionChange;
            result.intimacyChange = intimacyChange;
            
            // 특별 이벤트 체크
            result.specialEvent = this.checkSpecialEvents(result.gameState);
            
            this.totalInteractions++;
            
            console.log(`[GameLogic] 선택 처리 완료: 호감도 ${oldAffection} → ${result.gameState.affection}, 친밀도 ${oldIntimacy} → ${result.gameState.intimacy}`);
            
        } catch (error) {
            console.error('[GameLogic] 선택지 처리 오류:', error);
            result.success = false;
            result.message = '선택 처리 중 오류가 발생했습니다.';
        }
        
        return result;
    }

    /**
     * 자유 입력 텍스트 분석 (캐릭터 대사 응답)
     */
    async analyzeFreeInput(input, gameState) {
        const result = {
            success: true,
            affectionChange: 0,
            intimacyChange: 0,
            emotionType: 'neutral',
            confidence: 0,
            keywords: [],
            characterResponse: '',  // 캐릭터의 대사 응답
            animationData: null,
            gameState: { ...gameState }
        };

        try {
            const cleanInput = input.trim().toLowerCase();
            
            // 감정 분석 실행
            const emotionAnalysis = this.analyzeEmotion(cleanInput);
            result.emotionType = emotionAnalysis.type;
            result.confidence = emotionAnalysis.confidence;
            result.keywords = emotionAnalysis.keywords;
            
            // 호감도 변화 계산
            let affectionChange = this.calculateFreeInputAffection(emotionAnalysis);
            
            // 게임 단계별 가중치 적용
            const currentPhase = this.getCurrentPhase(gameState.choiceNumber || 0);
            const phaseMultiplier = this.affectionWeights.phaseMultiplier[currentPhase];
            
            // 최종 가중치 적용
            affectionChange = Math.round(affectionChange * this.affectionWeights.freeInput * phaseMultiplier);
            
            // 친밀도 계산
            let intimacyChange = 0;
            if (emotionAnalysis.confidence > 0.6) {
                if (emotionAnalysis.type === 'romantic' || emotionAnalysis.type === 'caring') {
                    intimacyChange = Math.floor(Math.random() * 4) + 2;
                } else if (emotionAnalysis.type === 'positive') {
                    intimacyChange = Math.floor(Math.random() * 2) + 1;
                }
            }
            
            const oldAffection = gameState.affection;
            const oldIntimacy = gameState.intimacy || 0;
            
            // 게임 상태 업데이트
            result.gameState.affection = Math.max(-100, Math.min(100, 
                gameState.affection + affectionChange));
            result.gameState.intimacy = Math.max(0, Math.min(100, 
                (gameState.intimacy || 0) + intimacyChange));
            
            // 애니메이션 데이터
            result.animationData = {
                affection: {
                    from: oldAffection,
                    to: result.gameState.affection,
                    change: affectionChange
                },
                intimacy: {
                    from: oldIntimacy,
                    to: result.gameState.intimacy,
                    change: intimacyChange
                }
            };
            
            // 캐릭터 대사 생성 (AI 판정 결과를 대사로 변환)
            result.characterResponse = await this.generateCharacterResponse(
                emotionAnalysis, 
                affectionChange, 
                intimacyChange,
                input
            );
            
            // 자유입력 히스토리 업데이트
            if (!result.gameState.freeInputHistory) result.gameState.freeInputHistory = [];
            result.gameState.freeInputHistory.push({
                input: input,
                emotionType: emotionAnalysis.type,
                confidence: emotionAnalysis.confidence,
                affectionChange: affectionChange,
                intimacyChange: intimacyChange,
                characterResponse: result.characterResponse,
                phase: currentPhase,
                timestamp: new Date().toISOString()
            });
            
            result.affectionChange = affectionChange;
            result.intimacyChange = intimacyChange;
            
            console.log(`[GameLogic] 자유입력 분석 완료: ${emotionAnalysis.type} → 호감도 ${affectionChange}, 친밀도 ${intimacyChange}`);
            
        } catch (error) {
            console.error('[GameLogic] 자유입력 분석 오류:', error);
            result.success = false;
            result.characterResponse = "어... 잘 못 들었어요. 다시 말해주실래요?";
        }
        
        return result;
    }

    /**
     * 캐릭터 대사 생성 (AI 판정 결과를 감탄사 포함 대사로)
     */
    async generateCharacterResponse(emotionAnalysis, affectionChange, intimacyChange, originalInput) {
        // 감정별 캐릭터 응답 템플릿
        const responseTemplates = {
            romantic: {
                high: [
                    "헉... (얼굴이 빨개지며) 오빠가 그런 말 하니까 진짜 설레요!",
                    "와아~ 오빠도 저한테 그런 마음이었구나! 너무 행복해요!",
                    "어머... (수줍게 웃으며) 오빠 때문에 심장이 너무 빨리 뛰어요!",
                    "히히... 오빠가 그렇게 말해주니까 날아갈 것 같아요!"
                ],
                medium: [
                    "앗... (놀라며) 오빠가 그런 말을 하다니... 좋아요!",
                    "오오~ 오빠도 저랑 같은 마음이네요? 기뻐요!",
                    "아... (볼을 만지며) 갑자기 그런 말 하면 부끄러워요..."
                ],
                low: [
                    "음... 오빠 진심이에요? (의심스럽게)",
                    "에? 갑자기 왜 그래요 오빠...?",
                    "아... 네... (어색하게 웃으며)"
                ]
            },
            caring: {
                high: [
                    "우와... 오빠가 이렇게 따뜻한 사람인 줄 몰랐어요! 감동이에요!",
                    "헉... (눈물이 글썽) 오빠 정말 최고예요! 고마워요!",
                    "아... 오빠가 이렇게 챙겨주니까 너무 든든해요!"
                ],
                medium: [
                    "오... 오빠가 걱정해주니까 기분 좋네요!",
                    "히히... 오빠 의외로 다정하시네요?",
                    "음... 고마워요 오빠! 마음이 따뜻해져요."
                ],
                low: [
                    "아... 네, 고마워요 오빠.",
                    "음... 걱정해주셔서 감사해요.",
                    "네네... 알겠어요 오빠."
                ]
            },
            positive: {
                high: [
                    "와~ 오빠랑 대화하니까 정말 즐거워요!",
                    "히히! 오빠 진짜 재밌어요! 최고!",
                    "우와! 오빠랑 있으면 시간 가는 줄 몰라요!"
                ],
                medium: [
                    "아하... 오빠도 그렇게 생각하시는구나!",
                    "오~ 좋아요! 오빠랑 잘 맞는 것 같아요.",
                    "히히... 재밌네요 오빠!"
                ],
                low: [
                    "음... 그렇군요 오빠.",
                    "아... 네, 알겠어요.",
                    "그래요? 음..."
                ]
            },
            negative: {
                high: [],
                medium: [],
                low: [
                    "아... (실망한 표정) 오빠가 그런 말 하니까 서운해요...",
                    "음... (시무룩) 왜 그러세요 오빠?",
                    "헉... (놀란 표정) 제가 뭐 잘못했나요...?",
                    "에... (당황) 갑자기 왜 그러세요?"
                ]
            },
            neutral: {
                high: [],
                medium: [
                    "음... 그렇구나~ 오빠 얘기 더 들려주세요!",
                    "아~ 네네, 알겠어요 오빠!",
                    "오호... 그런 뜻이었군요?"
                ],
                low: [
                    "음... 네, 그렇군요.",
                    "아... 알겠어요 오빠.",
                    "네... (고개를 끄덕이며)"
                ]
            }
        };

        // 신뢰도에 따른 강도 결정
        let intensity = 'low';
        if (emotionAnalysis.confidence > 0.7) intensity = 'high';
        else if (emotionAnalysis.confidence > 0.4) intensity = 'medium';

        // 해당 감정과 강도에 맞는 응답 선택
        const responses = responseTemplates[emotionAnalysis.type]?.[intensity] || 
                         responseTemplates.neutral.medium;
        
        if (responses.length === 0) {
            // 대체 응답
            return this.getFallbackResponse(emotionAnalysis.type);
        }

        // 랜덤하게 응답 선택
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        return response;
    }

    /**
     * 대체 응답 생성
     */
    getFallbackResponse(emotionType) {
        const fallbacks = {
            romantic: "오... (얼굴을 붉히며) 오빠... 그런 말 하면 부끄러워요...",
            caring: "음... 오빠 마음이 느껴져요. 고마워요!",
            positive: "히히! 오빠랑 대화하는 거 재밌어요!",
            negative: "아... (시무룩) 조금 서운하네요...",
            neutral: "음... 그렇군요! 오빠 말 더 들려주세요!"
        };
        return fallbacks[emotionType] || "네... 알겠어요 오빠!";
    }

    /**
     * 텍스트 감정 분석 (개선된 버전)
     */
    analyzeEmotion(text) {
        const emotions = {
            positive: 0,
            romantic: 0,
            caring: 0,
            negative: 0,
            neutral: 0
        };
        
        const foundKeywords = [];
        let totalScore = 0;
        
        // 키워드 매칭 및 점수 계산
        for (const [emotionType, keywords] of Object.entries(this.emotionKeywords)) {
            for (const keyword of keywords) {
                const keywordCount = (text.match(new RegExp(keyword, 'g')) || []).length;
                if (keywordCount > 0) {
                    emotions[emotionType] += keywordCount * 1.5; // 가중치 증가
                    totalScore += keywordCount;
                    foundKeywords.push({ word: keyword, type: emotionType, count: keywordCount });
                }
            }
        }
        
        // 문장 패턴 분석 (추가 점수)
        if (text.includes('?') && (text.includes('괜찮') || text.includes('어때'))) {
            emotions.caring += 1;
        }
        if (text.includes('!') && emotions.positive > 0) {
            emotions.positive += 0.5;
        }
        if (text.includes('♥') || text.includes('💕') || text.includes('❤')) {
            emotions.romantic += 2;
        }
        
        // 가장 높은 점수의 감정 타입 결정
        const maxEmotion = Object.keys(emotions).reduce((a, b) => 
            emotions[a] > emotions[b] ? a : b
        );
        
        // 신뢰도 계산
        const textLength = text.length;
        const keywordDensity = totalScore / Math.max(textLength / 10, 1);
        const confidence = Math.min(1.0, keywordDensity * 0.3 + (foundKeywords.length * 0.15) + 0.2);
        
        return {
            type: maxEmotion,
            confidence: confidence,
            keywords: foundKeywords,
            scores: emotions,
            textLength: textLength,
            keywordDensity: keywordDensity
        };
    }

    /**
     * 선택지 텍스트를 대화체로 변환
     */
    convertToDialogue(text) {
        // 이미 대화체인지 확인
        if (text.includes('"') || text.includes('...') || text.includes('!') || text.includes('?')) {
            return text;
        }
        
        // 대화체 변환 규칙
        const conversions = {
            '무시한다': '"아... 음... (머리를 긁적이며)"',
            '모른 척한다': '"어... 뭐였더라? 기억이 잘..."',
            '기억난다고 한다': '"아! 맞아, 어제 일 기억나!"',
            '걱정한다': '"괜찮아? 많이 힘들었지?"',
            '사과한다': '"미안... 내가 실수한 게 있었나?"',
            '감사를 표한다': '"아, 그래! 고마워!"',
            '웃으며 넘긴다': '"하하... 재밌었지?"',
            '진지하게 대답한다': '"응, 진지하게 말할게."',
            '장난친다': '"히히, 농담이야~"',
            '칭찬한다': '"너 정말 대단해!"',
            '위로한다': '"괜찮아, 다 잘될 거야."',
            '격려한다': '"힘내! 넌 할 수 있어!"'
        };
        
        // 변환 규칙에 매칭되는 경우
        for (const [key, value] of Object.entries(conversions)) {
            if (text.includes(key)) {
                return text.replace(key, value);
            }
        }
        
        // 기본 대화체 변환
        return `"${text}"`;
    }

    /**
     * 시간 보너스 계산
     */
    calculateTimeBonus() {
        if (!this.lastChoiceTime) {
            this.lastChoiceTime = Date.now();
            return 0;
        }
        
        const timeDiff = Date.now() - this.lastChoiceTime;
        this.lastChoiceTime = Date.now();
        
        if (timeDiff < 3000) return 2;
        if (timeDiff < 5000) return 1;
        if (timeDiff > 30000) return -1;
        
        return 0;
    }

    /**
     * 연속 긍정 선택 보너스 계산
     */
    calculateStreakBonus(affectionChange) {
        if (affectionChange > 0) {
            this.streakCount += 1;
        } else if (affectionChange < 0) {
            this.streakCount = 0;
        }
        
        if (this.streakCount >= 5) return 3;
        if (this.streakCount >= 3) return 2;
        if (this.streakCount >= 2) return 1;
        
        return 0;
    }

    /**
     * 자유입력 기반 호감도 변화 계산
     */
    calculateFreeInputAffection(emotionAnalysis) {
        const baseValues = {
            romantic: 12,
            caring: 8,
            positive: 5,
            neutral: 0,
            negative: -4
        };
        
        const baseValue = baseValues[emotionAnalysis.type] || 0;
        const confidenceMultiplier = Math.max(0.3, emotionAnalysis.confidence);
        const densityBonus = emotionAnalysis.keywordDensity > 0.5 ? 1.2 : 1.0;
        
        return Math.round(baseValue * confidenceMultiplier * densityBonus);
    }

    /**
     * 특별 이벤트 체크
     */
    checkSpecialEvents(gameState) {
        if (!gameState.specialEvents) {
            gameState.specialEvents = [];
        }
        
        // 호감도 기반 이벤트
        if (gameState.affection >= 90 && !this.specialEventCooldown.has('perfect_chemistry')) {
            this.specialEventCooldown.add('perfect_chemistry');
            gameState.specialEvents.push('perfect_chemistry');
            return {
                type: 'perfect_chemistry',
                message: '(마음이 완전히 통한 순간! 💖)',
                bonus: { affection: 5, intimacy: 15 }
            };
        } else if (gameState.affection >= 80 && !this.specialEventCooldown.has('high_affection')) {
            this.specialEventCooldown.add('high_affection');
            gameState.specialEvents.push('high_affection');
            return {
                type: 'high_affection',
                message: '(특별한 순간이 시작되는 중... 💕)',
                bonus: { affection: 3, intimacy: 8 }
            };
        }
        
        // 친밀도 기반 이벤트
        if (gameState.intimacy >= 95 && !this.specialEventCooldown.has('soul_connection')) {
            this.specialEventCooldown.add('soul_connection');
            gameState.specialEvents.push('soul_connection');
            return {
                type: 'soul_connection',
                message: '(영혼이 교감하는 순간! ✨)',
                bonus: { affection: 8, intimacy: 5 }
            };
        }
        
        return null;
    }

    /**
     * 게임 단계 결정
     */
    getCurrentPhase(choiceNumber) {
        if (choiceNumber <= 9) return 'introduction';
        if (choiceNumber <= 18) return 'development';
        if (choiceNumber <= 27) return 'deepening';
        return 'conclusion';
    }

    /**
     * 엔딩 타입 결정
     */
    determineEnding(gameState) {
        const { affection, intimacy } = gameState;
        
        if (affection >= 90 && intimacy >= 85) return 'perfect_ending';
        if (affection >= 80 && intimacy >= 70) return 'romantic_ending';
        if (affection >= 70 && intimacy >= 50) return 'good_ending';
        if (affection >= 50) return 'normal_ending';
        if (affection >= 20) return 'friend_ending';
        return 'bad_ending';
    }

    /**
     * 입력 검증
     */
    validateInput(input) {
        if (!input || typeof input !== 'string') {
            return { valid: false, reason: '올바른 입력이 아닙니다.' };
        }
        
        const trimmedInput = input.trim();
        
        if (trimmedInput.length === 0) {
            return { valid: false, reason: '내용을 입력해주세요.' };
        }
        
        if (trimmedInput.length > 500) {
            return { valid: false, reason: '입력이 너무 깁니다. (최대 500자)' };
        }
        
        if (trimmedInput.length < 2) {
            return { valid: false, reason: '좀 더 자세히 말해주세요.' };
        }
        
        return { valid: true };
    }

    /**
     * 디버그 정보 생성
     */
    getDebugInfo(gameState) {
        return {
            version: this.version,
            affection: gameState.affection || 0,
            intimacy: gameState.intimacy || 0,
            choiceNumber: gameState.choiceNumber || 0,
            streakCount: this.streakCount,
            currentPhase: this.getCurrentPhase(gameState.choiceNumber || 0),
            totalInteractions: this.totalInteractions,
            specialEvents: gameState.specialEvents || [],
            expectedEnding: this.determineEnding(gameState)
        };
    }
}

// 🌐 브라우저 환경 지원
if (typeof window !== 'undefined') {
    window.GameLogic = GameLogic;
    window.gameLogicInstance = new GameLogic();
    console.log('🎮 GameLogic 모듈 v3.1.0 로드 완료 - 개선된 버전');
}