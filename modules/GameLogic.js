/**
 * 🎮 GameLogic.js - 메신저형 어드벤처 게임 핵심 로직 모듈
 * 버전: v3.0.0 (프로젝트 통합용)
 * 
 * 통합 기능:
 * - 선택지 처리 및 고도화된 호감도 계산
 * - 자유입력 감정 분석 시스템
 * - 시간/연속 보너스 계산
 * - 친밀도 및 특별 이벤트 관리
 */

export class GameLogic {
    constructor() {
        this.version = 'v3.0.0';
        
        // 호감도 계산 가중치
        this.affectionWeights = {
            choice: 1.0,        // 선택지 기본 가중치
            freeInput: 1.5,     // 자유입력 가중치 (더 큰 영향)
            timeBonus: 0.1,     // 시간별 보너스
            streakBonus: 0.2,   // 연속 긍정 선택 보너스
            phaseMultiplier: {  // 게임 단계별 가중치
                introduction: 0.8,  // 초기 단계 - 조금 낮은 영향
                development: 1.0,   // 발전 단계 - 기본 영향
                deepening: 1.2,     // 심화 단계 - 높은 영향
                conclusion: 1.5     // 결말 단계 - 매우 높은 영향
            }
        };
        
        // 감정 분석 키워드 데이터베이스
        this.emotionKeywords = {
            positive: ['좋아', '사랑', '예쁘', '멋져', '완벽', '최고', '행복', '기뻐', '감동', '고마워', '훌륭', '대단'],
            romantic: ['설레', '두근', '사랑해', '좋아해', '예쁘다', '귀여워', '매력적', '운명', '소중해', '특별해'],
            caring: ['걱정', '챙겨', '보살펴', '도와줄게', '함께', '곁에', '지켜줄게', '응원', '힘내', '괜찮'],
            negative: ['싫어', '짜증', '화나', '별로', '귀찮', '피곤', '스트레스', '실망', '속상', '화가'],
            neutral: ['그래', '알겠어', '음', '그냥', '모르겠어', '상관없어', '괜찮아', '뭐', '아무래도']
        };
        
        // 내부 상태 관리
        this.streakCount = 0;
        this.lastChoiceTime = null;
        this.totalInteractions = 0;
        this.specialEventCooldown = new Set(); // 특별 이벤트 재발생 방지
        
        console.log('🎮 GameLogic 모듈 v3.0.0 초기화 완료');
    }

    /**
     * 선택지 처리 및 호감도 계산 (기존 프로젝트와 호환)
     * @param {Object} choice - 선택된 옵션 {text: string, affection_impact: number}
     * @param {Object} gameState - 현재 게임 상태
     * @returns {Object} 업데이트된 게임 상태와 결과
     */
    processChoice(choice, gameState) {
        const result = {
            success: true,
            affectionChange: 0,
            intimacyChange: 0,
            specialEvent: null,
            message: '',
            bonusDetails: {},
            gameState: { ...gameState }
        };

        try {
            const oldAffection = gameState.affection;
            
            // 1. 기본 호감도 변화
            let baseAffectionChange = choice.affection_impact || 0;
            
            // 2. 게임 단계별 가중치 적용
            const currentPhase = this.getCurrentPhase(gameState.choiceNumber || 0);
            const phaseMultiplier = this.affectionWeights.phaseMultiplier[currentPhase];
            
            // 3. 시간 보너스 계산
            const timeBonus = this.calculateTimeBonus();
            
            // 4. 연속 선택 보너스 계산
            const streakBonus = this.calculateStreakBonus(baseAffectionChange);
            
            // 5. 최종 호감도 변화 계산
            const adjustedBase = Math.round(baseAffectionChange * phaseMultiplier);
            const totalAffectionChange = Math.round(
                (adjustedBase * this.affectionWeights.choice) + 
                timeBonus + 
                streakBonus
            );
            
            // 6. 친밀도 계산 (긍정적 선택 시 확률적 증가)
            let intimacyChange = 0;
            if (baseAffectionChange > 0) {
                const intimacyChance = Math.min(0.5, 0.2 + (gameState.intimacy / 200));
                intimacyChange = Math.random() < intimacyChance ? Math.floor(Math.random() * 2) + 1 : 0;
            }
            
            // 7. 게임 상태 업데이트
            result.gameState.affection = Math.max(-100, Math.min(100, 
                gameState.affection + totalAffectionChange));
            result.gameState.intimacy = Math.max(0, Math.min(100, 
                gameState.intimacy + intimacyChange));
            result.gameState.choiceNumber = (gameState.choiceNumber || 0) + 1;
            
            // 선택 히스토리 업데이트 (기존 프로젝트 구조 유지)
            if (!result.gameState.choiceHistory) result.gameState.choiceHistory = [];
            if (!result.gameState.previousChoices) result.gameState.previousChoices = [];
            
            const choiceRecord = {
                choice: choice.text,
                baseImpact: choice.affection_impact,
                finalChange: totalAffectionChange,
                intimacyChange: intimacyChange,
                bonuses: { time: timeBonus, streak: streakBonus, phase: phaseMultiplier },
                phase: currentPhase,
                timestamp: new Date().toISOString()
            };
            
            result.gameState.choiceHistory.push(choiceRecord);
            result.gameState.previousChoices.push(choice); // 기존 프로젝트 호환
            
            // 결과 설정
            result.affectionChange = totalAffectionChange;
            result.intimacyChange = intimacyChange;
            result.bonusDetails = {
                base: adjustedBase,
                time: timeBonus,
                streak: streakBonus,
                phase: currentPhase,
                multiplier: phaseMultiplier
            };
            result.message = this.generateChoiceResultMessage(totalAffectionChange, intimacyChange);
            
            // 8. 특별 이벤트 체크
            result.specialEvent = this.checkSpecialEvents(result.gameState);
            
            this.totalInteractions++;
            
            console.log(`[GameLogic] 선택지 처리: ${oldAffection} → ${result.gameState.affection} (${totalAffectionChange > 0 ? '+' : ''}${totalAffectionChange}) | 보너스: 시간${timeBonus}, 연속${streakBonus}`);
            
        } catch (error) {
            console.error('[GameLogic] 선택지 처리 오류:', error);
            result.success = false;
            result.message = '선택 처리 중 오류가 발생했습니다.';
        }
        
        return result;
    }

    /**
     * 자유 입력 텍스트 분석 및 호감도 계산
     * @param {string} input - 사용자 입력 텍스트
     * @param {Object} gameState - 현재 게임 상태
     * @returns {Object} 분석 결과 및 호감도 변화
     */
    analyzeFreeInput(input, gameState) {
        const result = {
            success: true,
            affectionChange: 0,
            intimacyChange: 0,
            emotionType: 'neutral',
            confidence: 0,
            keywords: [],
            detailedAnalysis: {},
            message: '',
            gameState: { ...gameState }
        };

        try {
            const cleanInput = input.trim().toLowerCase();
            
            // 1. 감정 분석 실행
            const emotionAnalysis = this.analyzeEmotion(cleanInput);
            result.emotionType = emotionAnalysis.type;
            result.confidence = emotionAnalysis.confidence;
            result.keywords = emotionAnalysis.keywords;
            result.detailedAnalysis = emotionAnalysis.scores;
            
            // 2. 호감도 변화 계산
            let affectionChange = this.calculateFreeInputAffection(emotionAnalysis);
            
            // 3. 게임 단계별 가중치 적용
            const currentPhase = this.getCurrentPhase(gameState.choiceNumber || 0);
            const phaseMultiplier = this.affectionWeights.phaseMultiplier[currentPhase];
            
            // 4. 최종 가중치 적용
            affectionChange = Math.round(affectionChange * this.affectionWeights.freeInput * phaseMultiplier);
            
            // 5. 친밀도 계산 (진솔한 감정 표현 시 증가)
            let intimacyChange = 0;
            if (emotionAnalysis.confidence > 0.6) {
                if (emotionAnalysis.type === 'romantic' || emotionAnalysis.type === 'caring') {
                    intimacyChange = Math.floor(Math.random() * 4) + 2; // 2-5 증가
                } else if (emotionAnalysis.type === 'positive') {
                    intimacyChange = Math.floor(Math.random() * 2) + 1; // 1-2 증가
                }
            }
            
            // 6. 게임 상태 업데이트
            result.gameState.affection = Math.max(-100, Math.min(100, 
                gameState.affection + affectionChange));
            result.gameState.intimacy = Math.max(0, Math.min(100, 
                gameState.intimacy + intimacyChange));
            
            // 자유입력 히스토리 업데이트
            if (!result.gameState.freeInputHistory) result.gameState.freeInputHistory = [];
            result.gameState.freeInputHistory.push({
                input: input,
                emotionType: emotionAnalysis.type,
                confidence: emotionAnalysis.confidence,
                affectionChange: affectionChange,
                intimacyChange: intimacyChange,
                phase: currentPhase,
                timestamp: new Date().toISOString()
            });
            
            result.affectionChange = affectionChange;
            result.intimacyChange = intimacyChange;
            result.message = this.generateInputResultMessage(emotionAnalysis, affectionChange, intimacyChange);
            
            console.log(`[GameLogic] 자유입력 분석: ${emotionAnalysis.type} (${(emotionAnalysis.confidence * 100).toFixed(1)}%) → 호감도 ${affectionChange > 0 ? '+' : ''}${affectionChange}, 친밀도 +${intimacyChange}`);
            
        } catch (error) {
            console.error('[GameLogic] 자유입력 분석 오류:', error);
            result.success = false;
            result.message = '입력 분석 중 오류가 발생했습니다.';
        }
        
        return result;
    }

    /**
     * 텍스트 감정 분석 (향상된 알고리즘)
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
                    emotions[emotionType] += keywordCount;
                    totalScore += keywordCount;
                    foundKeywords.push({ word: keyword, type: emotionType, count: keywordCount });
                }
            }
        }
        
        // 가장 높은 점수의 감정 타입 결정
        const maxEmotion = Object.keys(emotions).reduce((a, b) => 
            emotions[a] > emotions[b] ? a : b
        );
        
        // 신뢰도 계산 (키워드 밀도 기반)
        const textLength = text.length;
        const keywordDensity = totalScore / Math.max(textLength / 10, 1);
        const confidence = Math.min(1.0, keywordDensity + (foundKeywords.length * 0.2));
        
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
     * 자유입력 기반 호감도 변화 계산
     */
    calculateFreeInputAffection(emotionAnalysis) {
        const baseValues = {
            romantic: 12,   // 로맨틱 표현 - 높은 영향
            caring: 8,      // 배려 표현 - 중간 영향  
            positive: 5,    // 긍정 표현 - 기본 영향
            neutral: 0,     // 중립 표현 - 영향 없음
            negative: -4    // 부정 표현 - 마이너스 영향
        };
        
        const baseValue = baseValues[emotionAnalysis.type] || 0;
        const confidenceMultiplier = Math.max(0.3, emotionAnalysis.confidence);
        const densityBonus = emotionAnalysis.keywordDensity > 0.5 ? 1.2 : 1.0;
        
        return Math.round(baseValue * confidenceMultiplier * densityBonus);
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
        
        // 반응 속도에 따른 차등 보너스
        if (timeDiff < 3000) return 2;      // 3초 이내 - 큰 보너스
        if (timeDiff < 5000) return 1;      // 5초 이내 - 작은 보너스
        if (timeDiff > 30000) return -1;    // 30초 이상 - 소폭 페널티
        
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
        
        // 연속 선택 단계별 보너스
        if (this.streakCount >= 5) return 3;      // 5연속 - 큰 보너스
        if (this.streakCount >= 3) return 2;      // 3연속 - 중간 보너스  
        if (this.streakCount >= 2) return 1;      // 2연속 - 작은 보너스
        
        return 0;
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
                message: '💖 완벽한 케미스트리! 마음이 완전히 통했어요!',
                bonus: { affection: 5, intimacy: 15 }
            };
        } else if (gameState.affection >= 80 && !this.specialEventCooldown.has('high_affection')) {
            this.specialEventCooldown.add('high_affection');
            gameState.specialEvents.push('high_affection');
            return {
                type: 'high_affection',
                message: '💕 특별한 순간이 시작됩니다...',
                bonus: { affection: 3, intimacy: 8 }
            };
        }
        
        // 친밀도 기반 이벤트
        if (gameState.intimacy >= 95 && !this.specialEventCooldown.has('soul_connection')) {
            this.specialEventCooldown.add('soul_connection');
            gameState.specialEvents.push('soul_connection');
            return {
                type: 'soul_connection',
                message: '✨ 영혼의 교감! 서로를 완전히 이해하게 되었어요!',
                bonus: { affection: 8, intimacy: 5 }
            };
        } else if (gameState.intimacy >= 85 && !this.specialEventCooldown.has('deep_bond')) {
            this.specialEventCooldown.add('deep_bond');
            gameState.specialEvents.push('deep_bond');
            return {
                type: 'deep_bond',
                message: '🤗 깊은 유대감이 형성되었습니다!',
                bonus: { affection: 5, intimacy: 10 }
            };
        }
        
        return null;
    }

    /**
     * 게임 단계 결정
     */
    getCurrentPhase(choiceNumber) {
        if (choiceNumber <= 9) return 'introduction';    // 1-9: 소개/첫만남
        if (choiceNumber <= 18) return 'development';    // 10-18: 관계 발전
        if (choiceNumber <= 27) return 'deepening';      // 19-27: 감정 심화
        return 'conclusion';                             // 28-36: 결말
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
     * 결과 메시지 생성
     */
    generateChoiceResultMessage(affectionChange, intimacyChange) {
        if (affectionChange >= 8) return '💝 마음이 완전히 녹았어요!';
        if (affectionChange >= 5) return '💗 마음이 많이 따뜻해졌어요!';
        if (affectionChange >= 3) return '😊 정말 좋은 반응이에요!';
        if (affectionChange >= 1) return '😌 호감도가 올랐어요.';
        if (affectionChange === 0) return '😐 평범한 반응이에요.';
        if (affectionChange >= -2) return '😅 조금 아쉬운 선택이었어요.';
        return '😔 마음이 좀 멀어진 것 같아요...';
    }

    generateInputResultMessage(emotionAnalysis, affectionChange, intimacyChange) {
        const messages = {
            romantic: [
                '💕 로맨틱한 말에 마음이 완전히 설레네요!',
                '💖 그런 말 들으니까 정말 행복해요!',
                '🥰 오빠의 그런 모습이 너무 좋아요!'
            ],
            caring: [
                '🤗 따뜻한 마음이 정말 감동이에요!',
                '😊 오빠의 배려가 느껴져서 고마워요!',
                '💝 이런 마음씨가 정말 매력적이에요!'
            ],
            positive: [
                '😊 긍정적인 에너지가 전해져요!',
                '✨ 밝은 마음이 좋아요!',
                '😄 함께 있으면 기분이 좋아져요!'
            ],
            neutral: [
                '😌 차분한 대화가 편안해요.',
                '🙂 진솔한 마음이 느껴져요.',
                '☺️ 이런 대화도 좋네요.'
            ],
            negative: [
                '😔 조금 아쉬운 기분이에요...',
                '😕 무언가 서운한 느낌이 들어요.',
                '🙁 마음이 좀 복잡해지네요.'
            ]
        };
        
        const emotionMessages = messages[emotionAnalysis.type] || messages.neutral;
        const randomMessage = emotionMessages[Math.floor(Math.random() * emotionMessages.length)];
        
        return randomMessage;
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
            expectedEnding: this.determineEnding(gameState),
            nextMilestone: this.getNextMilestone(gameState.choiceNumber || 0)
        };
    }

    /**
     * 다음 마일스톤 계산
     */
    getNextMilestone(currentChoice) {
        const milestones = [9, 18, 27, 36];
        return milestones.find(m => m > currentChoice) || 36;
    }
}

// 🌐 기존 프로젝트 호환성을 위한 전역 접근 (브라우저 환경)
if (typeof window !== 'undefined') {
    window.GameLogic = GameLogic;
    
    // 즉시 사용 가능한 인스턴스 (기존 코드와 호환)
    window.gameLogicInstance = new GameLogic();
    
    console.log('🎮 GameLogic 모듈 v3.0.0 로드 완료 - 프로젝트 통합용');
}
