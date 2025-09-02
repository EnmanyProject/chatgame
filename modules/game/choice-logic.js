/**
 * 🎮 선택지 & 호감도 계산 모듈 (v2.1.0)
 * - 선택지 처리 로직
 * - 호감도 계산 및 관리
 * - 선택 기록 추적
 * - 호감도 변화 애니메이션
 */

import gameArch from '../core/architecture.js';
import DataSchema from '../core/schema.js';

export class ChoiceLogic {
    constructor() {
        this.currentChoices = [];
        this.affectionHistory = [];
        this.choiceEffects = new Map();
        this.initialized = false;
    }

    // 모듈 초기화
    async initialize() {
        try {
            console.log('🎮 ChoiceLogic 모듈 초기화 중...');
            
            // 호감도 계산 공식 설정
            this.setupAffectionFormulas();
            
            // 이벤트 리스너 등록
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ ChoiceLogic 모듈 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ ChoiceLogic 초기화 실패:', error);
            return false;
        }
    }

    // 호감도 계산 공식 설정
    setupAffectionFormulas() {
        this.affectionRules = {
            // 기본 호감도 변화
            basic: (impact) => Math.round(impact),
            
            // MBTI별 호감도 가중치
            mbti_weights: {
                'INFP': { romantic: 1.2, friendly: 1.0, distant: 0.8 },
                'ENFP': { romantic: 1.1, friendly: 1.3, distant: 0.9 },
                'ISFP': { romantic: 1.3, friendly: 0.9, distant: 0.7 },
                'ESFP': { romantic: 1.1, friendly: 1.2, distant: 1.0 }
            },
            
            // 상황별 보너스/패널티
            context_modifiers: {
                first_meeting: 0.8,
                intimate_moment: 1.5,
                conflict_resolution: 1.3,
                casual_chat: 1.0
            }
        };
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        gameArch.on('choiceSelected', (event) => {
            this.handleChoiceSelection(event.detail);
        });

        gameArch.on('affectionChanged', (event) => {
            this.trackAffectionHistory(event.detail);
        });
    }

    // 선택지 처리 메인 함수
    async processChoice(choiceData, gameState) {
        try {
            const { choiceIndex, choiceText, affectionImpact } = choiceData;
            const { currentCharacter, choiceNumber } = gameState;

            // 1. 기본 호감도 계산
            let calculatedImpact = this.calculateAffectionImpact(
                affectionImpact,
                currentCharacter.mbti,
                choiceNumber,
                gameState.affection
            );

            // 2. 호감도 적용
            const newAffection = this.applyAffectionChange(
                gameState.affection,
                calculatedImpact
            );

            // 3. 선택 기록 저장
            const choiceRecord = this.createChoiceRecord(
                choiceIndex,
                choiceText,
                affectionImpact,
                calculatedImpact,
                gameState.affection,
                newAffection,
                choiceNumber
            );

            // 4. 결과 반환
            const result = {
                success: true,
                oldAffection: gameState.affection,
                newAffection: newAffection,
                affectionChange: calculatedImpact,
                choiceRecord: choiceRecord,
                specialEvents: this.checkSpecialEvents(newAffection, gameState)
            };

            // 5. 이벤트 발생
            gameArch.emit('choiceProcessed', result);
            
            return result;

        } catch (error) {
            console.error('❌ 선택지 처리 실패:', error);
            return {
                success: false,
                error: error.message,
                fallbackAffection: gameState.affection
            };
        }
    }

    // 호감도 영향 계산
    calculateAffectionImpact(baseImpact, mbti, choiceNumber, currentAffection) {
        let impact = baseImpact;

        // MBTI별 가중치 적용
        const mbtiWeight = this.affectionRules.mbti_weights[mbti] || 
            this.affectionRules.mbti_weights['INFP'];
        
        if (baseImpact > 0) {
            impact *= mbtiWeight.romantic;
        } else if (baseImpact === 0) {
            impact = mbtiWeight.friendly * 0.5;
        } else {
            impact *= mbtiWeight.distant;
        }

        // 진행도별 보너스
        if (choiceNumber <= 5) {
            impact *= this.affectionRules.context_modifiers.first_meeting;
        } else if (choiceNumber >= 30) {
            impact *= this.affectionRules.context_modifiers.intimate_moment;
        }

        // 현재 호감도에 따른 조정
        if (currentAffection >= 90 && baseImpact > 0) {
            impact *= 0.7; // 높은 호감도에서는 상승 폭 감소
        } else if (currentAffection <= 20 && baseImpact < 0) {
            impact *= 0.8; // 낮은 호감도에서는 하락 폭 감소
        }

        return Math.round(impact * 10) / 10; // 소수점 첫째자리까지
    }

    // 호감도 변화 적용
    applyAffectionChange(currentAffection, impact) {
        const newAffection = currentAffection + impact;
        
        // 범위 제한 (0-100)
        return Math.max(0, Math.min(100, Math.round(newAffection)));
    }

    // 선택 기록 생성
    createChoiceRecord(index, text, originalImpact, calculatedImpact, oldAffection, newAffection, choiceNumber) {
        return {
            id: `choice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            choiceNumber: choiceNumber,
            selectedIndex: index,
            selectedText: text,
            originalImpact: originalImpact,
            calculatedImpact: calculatedImpact,
            affectionBefore: oldAffection,
            affectionAfter: newAffection,
            affectionDelta: newAffection - oldAffection
        };
    }

    // 특별 이벤트 확인
    checkSpecialEvents(newAffection, gameState) {
        const events = [];

        // 호감도 마일스톤 이벤트
        const milestones = [25, 50, 75, 90, 95];
        for (const milestone of milestones) {
            if (newAffection >= milestone && gameState.affection < milestone) {
                events.push({
                    type: 'affection_milestone',
                    milestone: milestone,
                    message: this.getAffectionMilestoneMessage(milestone)
                });
            }
        }

        // 호감도 급락 이벤트
        if (newAffection < gameState.affection - 10) {
            events.push({
                type: 'affection_drop',
                drop: gameState.affection - newAffection,
                message: '관계에 변화가 생겼습니다...'
            });
        }

        return events;
    }

    // 호감도 마일스톤 메시지
    getAffectionMilestoneMessage(milestone) {
        const messages = {
            25: '조금씩 마음을 열기 시작했습니다 💭',
            50: '친근한 관계가 되었습니다 😊',
            75: '특별한 감정이 싹트고 있습니다 💕',
            90: '깊은 유대감을 느끼고 있습니다 💖',
            95: '서로에게 특별한 존재가 되었습니다 ✨'
        };
        return messages[milestone] || '관계가 발전했습니다!';
    }

    // 호감도 이력 추적
    trackAffectionHistory(data) {
        this.affectionHistory.push({
            timestamp: Date.now(),
            affection: data.affection,
            change: data.change,
            reason: data.reason
        });

        // 최근 50개만 유지
        if (this.affectionHistory.length > 50) {
            this.affectionHistory = this.affectionHistory.slice(-50);
        }
    }

    // 호감도 통계 조회
    getAffectionStats() {
        if (this.affectionHistory.length === 0) return null;

        const recent = this.affectionHistory.slice(-10);
        const changes = recent.map(h => h.change).filter(c => c !== undefined);
        
        return {
            currentLevel: this.affectionHistory[this.affectionHistory.length - 1].affection,
            totalChanges: this.affectionHistory.length,
            averageChange: changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0,
            recentTrend: changes.length >= 3 ? this.calculateTrend(changes.slice(-3)) : 'stable'
        };
    }

    // 트렌드 계산
    calculateTrend(recentChanges) {
        const sum = recentChanges.reduce((a, b) => a + b, 0);
        if (sum > 2) return 'increasing';
        if (sum < -2) return 'decreasing';
        return 'stable';
    }
}

// 모듈 인스턴스 생성 및 등록
const choiceLogic = new ChoiceLogic();
gameArch.registerModule('choiceLogic', choiceLogic);

export default choiceLogic;