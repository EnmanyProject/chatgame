/**
 * Character State Manager
 * @description 캐릭터별 숨겨진 수치 관리 시스템
 * @version 2.0.0
 */

class CharacterStateManager {
    constructor(characterId) {
        this.characterId = characterId;
        this.state = this.loadState() || this.getDefaultState();
    }

    /**
     * 기본 상태 값
     */
    getDefaultState() {
        return {
            // 핵심 수치 (1-10)
            호감도: 5,
            애정도: 5,
            
            // 보상 레벨 (1-5)
            대화톤레벨: 2,
            답장속도: 3,
            사진레벨: 1,
            
            // 확률 (0-100)
            먼저연락확률: 20,
            
            // 감정 상태
            현재감정: '평온',
            
            // 통계
            총대화수: 0,
            긍정적응답수: 0,
            부정적응답수: 0,
            선물받은수: 0,
            
            // 마지막 업데이트
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * 호감도 업데이트
     * @param {number} change - 변화량 (-3 ~ +3)
     */
    updateAffection(change) {
        this.state.호감도 = Math.max(1, Math.min(10, this.state.호감도 + change));
        
        if (change > 0) {
            this.state.긍정적응답수++;
        } else if (change < 0) {
            this.state.부정적응답수++;
        }
        
        this.state.총대화수++;
        
        // 호감도에 따라 다른 레벨 자동 조정
        this.adjustDependentLevels();
        
        this.saveState();
        
        console.log(`[호감도 변화] ${change > 0 ? '+' : ''}${change} → 현재: ${this.state.호감도}`);
        
        return this.state.호감도;
    }

    /**
     * 애정도 업데이트 (현재 기분)
     * @param {number} change - 변화량 (-3 ~ +3)
     */
    updateMood(change) {
        this.state.애정도 = Math.max(1, Math.min(10, this.state.애정도 + change));
        
        // 애정도에 따라 감정 상태 변경
        this.updateEmotion();
        
        this.saveState();
        
        return this.state.애정도;
    }

    /**
     * 감정 상태 업데이트
     */
    updateEmotion() {
        if (this.state.애정도 >= 9) {
            this.state.현재감정 = '행복';
        } else if (this.state.애정도 >= 7) {
            this.state.현재감정 = '기쁨';
        } else if (this.state.애정도 >= 5) {
            this.state.현재감정 = '평온';
        } else if (this.state.애정도 >= 3) {
            this.state.현재감정 = '삐짐';
        } else {
            this.state.현재감정 = '화남';
        }
    }

    /**
     * 호감도에 따라 종속 레벨 자동 조정
     */
    adjustDependentLevels() {
        const affection = this.state.호감도;
        
        // 대화 톤 레벨 (1-5)
        if (affection >= 9) {
            this.state.대화톤레벨 = 5;
        } else if (affection >= 7) {
            this.state.대화톤레벨 = 4;
        } else if (affection >= 5) {
            this.state.대화톤레벨 = 3;
        } else if (affection >= 3) {
            this.state.대화톤레벨 = 2;
        } else {
            this.state.대화톤레벨 = 1;
        }
        
        // 답장 속도 (1-5, 높을수록 빠름)
        this.state.답장속도 = Math.min(5, Math.floor(affection / 2) + 1);
        
        // 사진 레벨 (1-5)
        this.state.사진레벨 = Math.min(5, Math.floor(affection / 2));
        
        // 먼저 연락 확률 (0-100%)
        this.state.먼저연락확률 = Math.min(100, affection * 10);
    }

    /**
     * 대화 톤 스타일 가져오기
     */
    getToneStyle() {
        const level = this.state.대화톤레벨;
        
        const toneStyles = {
            1: {
                name: '존댓말',
                suffix: '요',
                emoji: false,
                aegyo: false
            },
            2: {
                name: '반말',
                suffix: '',
                emoji: true,
                aegyo: false
            },
            3: {
                name: '친근',
                suffix: '',
                emoji: true,
                aegyo: true
            },
            4: {
                name: '애정',
                suffix: '~',
                emoji: true,
                aegyo: true,
                sweet: true
            },
            5: {
                name: '적극',
                suffix: '♥',
                emoji: true,
                aegyo: true,
                sweet: true,
                sexy: true
            }
        };
        
        return toneStyles[level] || toneStyles[2];
    }

    /**
     * 답장 딜레이 계산 (밀리초)
     */
    getReplyDelay() {
        const speed = this.state.답장속도;
        
        // 속도 1: 10-15분, 속도 5: 즉답
        const delays = {
            1: [10, 15], // 10-15분
            2: [5, 8],   // 5-8분
            3: [2, 4],   // 2-4분
            4: [0.5, 1], // 30초-1분
            5: [0, 0.2]  // 즉답-10초
        };
        
        const [min, max] = delays[speed] || delays[3];
        const minutes = min + Math.random() * (max - min);
        
        return Math.floor(minutes * 60 * 1000); // 밀리초로 변환
    }

    /**
     * 먼저 연락할지 판단
     */
    shouldInitiateContact() {
        const probability = this.state.먼저연락확률;
        const random = Math.random() * 100;
        
        return random < probability;
    }

    /**
     * 사진 레어도 가져오기
     */
    getPhotoRarity() {
        const level = this.state.사진레벨;
        
        const rarities = {
            1: 'common',     // 일상 사진
            2: 'uncommon',   // 예쁜 셀카
            3: 'rare',       // 섹시한 각도
            4: 'epic',       // 침대, 거울샷
            5: 'legendary'   // 특별한 순간
        };
        
        return rarities[level] || 'common';
    }

    /**
     * 선물 받음 처리
     * @param {string} giftType - 선물 종류
     */
    receiveGift(giftType) {
        this.state.선물받은수++;
        
        // 선물 종류에 따른 효과
        const giftEffects = {
            'flower': {호감도: +1, 애정도: +2},
            'cake': {호감도: +1, 애정도: +3},
            'luxury': {호감도: +2, 애정도: +3}
        };
        
        const effect = giftEffects[giftType] || {호감도: +1, 애정도: +1};
        
        this.updateAffection(effect.호감도);
        this.updateMood(effect.애정도);
        
        console.log(`[선물 받음] ${giftType} → 효과:`, effect);
    }

    /**
     * 상태 저장
     */
    saveState() {
        this.state.lastUpdated = new Date().toISOString();
        localStorage.setItem(`character_state_${this.characterId}`, JSON.stringify(this.state));
    }

    /**
     * 상태 로드
     */
    loadState() {
        const saved = localStorage.getItem(`character_state_${this.characterId}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('상태 로드 실패:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * 상태 초기화
     */
    resetState() {
        this.state = this.getDefaultState();
        this.saveState();
        console.log('[상태 초기화] 완료');
    }

    /**
     * 현재 상태 조회
     */
    getState() {
        return {...this.state};
    }

    /**
     * 통계 조회
     */
    getStats() {
        return {
            호감도: this.state.호감도,
            애정도: this.state.애정도,
            총대화수: this.state.총대화수,
            긍정비율: this.state.총대화수 > 0 
                ? Math.round((this.state.긍정적응답수 / this.state.총대화수) * 100) 
                : 0,
            선물받은수: this.state.선물받은수
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterStateManager;
}
