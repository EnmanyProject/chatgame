/**
 * Emotion State System
 * @description 캐릭터 감정 상태 추적 및 관리 시스템 (Phase 3 Milestone 2)
 * @version 3.2.0
 */

class EmotionStateSystem {
    constructor(characterId, mbtiType = 'ENFP') {
        this.characterId = characterId;
        this.mbtiType = mbtiType;
        this.STORAGE_KEY = `emotion_state_${characterId}`;

        // 감정 상태 로드
        this.state = this.loadState();

        console.log(`😊 EmotionStateSystem 초기화: ${characterId} (${mbtiType})`);
    }

    /**
     * 감정 상태 로드
     */
    loadState() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('❌ 감정 상태 로드 실패:', error);
        }

        // 기본 감정 상태
        return {
            currentEmotion: 'calm',        // 현재 감정
            emotionIntensity: 0.5,         // 감정 강도 (0-1)
            emotionStartTime: Date.now(),  // 감정 시작 시간
            emotionDuration: 3600000,      // 지속 시간 (1시간)
            previousEmotion: null,         // 이전 감정
            emotionHistory: []             // 감정 히스토리 (최근 20개)
        };
    }

    /**
     * 감정 상태 저장
     */
    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('❌ 감정 상태 저장 실패:', error);
        }
    }

    /**
     * 감정 타입 정의
     */
    static EMOTIONS = {
        happy: {
            name: '기쁨',
            icon: '😊',
            modifiers: {
                proactiveContactFrequency: 1.5,  // 먼저 연락 빈도 +50%
                photoSendChance: 1.3,             // 사진 전송 확률 +30%
                responseSpeed: 1.4,               // 응답 속도 +40%
                affectionGain: 1.2                // 호감도 획득 +20%
            }
        },
        excited: {
            name: '설렘',
            icon: '🥰',
            modifiers: {
                proactiveContactFrequency: 2.0,  // 먼저 연락 빈도 +100%
                photoSendChance: 1.5,             // 사진 전송 확률 +50%
                responseSpeed: 1.8,               // 응답 속도 +80%
                affectionGain: 1.5                // 호감도 획득 +50%
            }
        },
        calm: {
            name: '평온',
            icon: '😌',
            modifiers: {
                proactiveContactFrequency: 1.0,  // 기본값
                photoSendChance: 1.0,
                responseSpeed: 1.0,
                affectionGain: 1.0
            }
        },
        sad: {
            name: '슬픔',
            icon: '😢',
            modifiers: {
                proactiveContactFrequency: 0.5,  // 먼저 연락 빈도 -50%
                photoSendChance: 0.3,             // 사진 전송 확률 -70%
                responseSpeed: 0.6,               // 응답 속도 -40%
                affectionGain: 0.7                // 호감도 획득 -30%
            }
        },
        anxious: {
            name: '불안',
            icon: '😰',
            modifiers: {
                proactiveContactFrequency: 0.7,  // 먼저 연락 빈도 -30%
                photoSendChance: 0.5,
                responseSpeed: 0.8,
                affectionGain: 0.8
            }
        },
        angry: {
            name: '화남',
            icon: '😠',
            modifiers: {
                proactiveContactFrequency: 0.2,  // 먼저 연락 거의 중단
                photoSendChance: 0.1,
                responseSpeed: 0.4,               // 응답 매우 느림
                affectionGain: 0.5                // 호감도 획득 -50%
            }
        }
    };

    /**
     * MBTI별 감정 특성
     */
    static MBTI_EMOTION_TRAITS = {
        ENFP: {
            emotionChangeDuration: 1800000,      // 30분 (빠른 변화)
            defaultIntensity: 0.8,               // 감정 표현 강함
            emotionalVolatility: 0.9             // 감정 변동성 높음
        },
        INFP: {
            emotionChangeDuration: 7200000,      // 2시간 (느린 변화)
            defaultIntensity: 0.9,               // 감정 표현 매우 강함
            emotionalVolatility: 0.6             // 감정 변동성 중간
        },
        INTJ: {
            emotionChangeDuration: 10800000,     // 3시간 (매우 느린 변화)
            defaultIntensity: 0.3,               // 감정 표현 절제됨
            emotionalVolatility: 0.3             // 감정 변동성 낮음
        },
        ESFJ: {
            emotionChangeDuration: 3600000,      // 1시간 (중간 변화)
            defaultIntensity: 0.7,
            emotionalVolatility: 0.7
        },
        ISTP: {
            emotionChangeDuration: 5400000,      // 1.5시간
            defaultIntensity: 0.4,               // 쿨한 표현
            emotionalVolatility: 0.4
        },
        ESTJ: {
            emotionChangeDuration: 3600000,      // 1시간
            defaultIntensity: 0.5,
            emotionalVolatility: 0.5
        },
        INTP: {
            emotionChangeDuration: 7200000,      // 2시간
            defaultIntensity: 0.3,
            emotionalVolatility: 0.4
        }
    };

    /**
     * 감정 변경
     * @param {string} emotion - 새로운 감정 타입
     * @param {number} intensity - 감정 강도 (0-1)
     * @param {string} reason - 감정 변화 이유
     */
    changeEmotion(emotion, intensity = null, reason = '') {
        if (!EmotionStateSystem.EMOTIONS[emotion]) {
            console.error(`❌ 알 수 없는 감정: ${emotion}`);
            return;
        }

        const traits = EmotionStateSystem.MBTI_EMOTION_TRAITS[this.mbtiType] ||
                      EmotionStateSystem.MBTI_EMOTION_TRAITS.ENFP;

        // 이전 감정 저장
        this.state.previousEmotion = this.state.currentEmotion;

        // 새 감정 설정
        this.state.currentEmotion = emotion;
        this.state.emotionIntensity = intensity || traits.defaultIntensity;
        this.state.emotionStartTime = Date.now();
        this.state.emotionDuration = traits.emotionChangeDuration;

        // 히스토리 추가
        this.state.emotionHistory.push({
            emotion,
            intensity: this.state.emotionIntensity,
            timestamp: Date.now(),
            reason
        });

        // 최근 20개만 유지
        if (this.state.emotionHistory.length > 20) {
            this.state.emotionHistory = this.state.emotionHistory.slice(-20);
        }

        this.saveState();

        const emotionData = EmotionStateSystem.EMOTIONS[emotion];
        console.log(`😊 ${this.characterId} 감정 변화: ${emotionData.icon} ${emotionData.name} (강도: ${this.state.emotionIntensity.toFixed(2)}) - ${reason}`);
    }

    /**
     * 현재 감정 가져오기
     */
    getCurrentEmotion() {
        // 감정 지속 시간 체크
        const elapsed = Date.now() - this.state.emotionStartTime;

        if (elapsed > this.state.emotionDuration) {
            // 감정이 만료되면 calm으로 복귀
            if (this.state.currentEmotion !== 'calm') {
                this.changeEmotion('calm', 0.5, '시간 경과로 평온 상태로 복귀');
            }
        }

        return {
            emotion: this.state.currentEmotion,
            intensity: this.state.emotionIntensity,
            icon: EmotionStateSystem.EMOTIONS[this.state.currentEmotion].icon,
            name: EmotionStateSystem.EMOTIONS[this.state.currentEmotion].name,
            timeRemaining: Math.max(0, this.state.emotionDuration - elapsed)
        };
    }

    /**
     * 감정 수정자(modifier) 가져오기
     * @param {string} modifierType - 수정자 타입
     */
    getModifier(modifierType) {
        const current = this.getCurrentEmotion();
        const emotionData = EmotionStateSystem.EMOTIONS[current.emotion];

        if (!emotionData.modifiers[modifierType]) {
            return 1.0; // 기본값
        }

        // 감정 강도에 따라 수정자 조정
        const baseModifier = emotionData.modifiers[modifierType];
        const intensity = current.intensity;

        // 강도가 낮으면 수정자 효과도 감소
        if (baseModifier > 1.0) {
            return 1.0 + (baseModifier - 1.0) * intensity;
        } else if (baseModifier < 1.0) {
            return 1.0 - (1.0 - baseModifier) * intensity;
        }

        return 1.0;
    }

    /**
     * 호감도 변화에 따른 감정 업데이트
     * @param {number} affectionChange - 호감도 변화량
     */
    onAffectionChange(affectionChange) {
        if (affectionChange >= 5) {
            this.changeEmotion('excited', 0.8, `호감도 +${affectionChange} 상승!`);
        } else if (affectionChange >= 2) {
            this.changeEmotion('happy', 0.6, `호감도 +${affectionChange} 상승`);
        } else if (affectionChange <= -5) {
            this.changeEmotion('angry', 0.7, `호감도 ${affectionChange} 하락!`);
        } else if (affectionChange <= -2) {
            this.changeEmotion('sad', 0.6, `호감도 ${affectionChange} 하락`);
        }
    }

    /**
     * 무응답에 따른 감정 업데이트
     * @param {number} hoursWithoutResponse - 무응답 시간(시간)
     */
    onNoResponse(hoursWithoutResponse) {
        const traits = EmotionStateSystem.MBTI_EMOTION_TRAITS[this.mbtiType] ||
                      EmotionStateSystem.MBTI_EMOTION_TRAITS.ENFP;

        // MBTI별 인내심 차이
        const patienceThreshold = {
            ENFP: 2,   // 2시간
            INFP: 6,   // 6시간
            INTJ: 12,  // 12시간
            ESFJ: 3,   // 3시간
            ISTP: 8,   // 8시간
            ESTJ: 4,
            INTP: 10
        };

        const threshold = patienceThreshold[this.mbtiType] || 4;

        if (hoursWithoutResponse > threshold * 2) {
            this.changeEmotion('angry', 0.6, `${hoursWithoutResponse}시간 무응답`);
        } else if (hoursWithoutResponse > threshold) {
            this.changeEmotion('anxious', 0.7, `${hoursWithoutResponse}시간 무응답`);
        }
    }

    /**
     * 특별 이벤트에 따른 감정 업데이트
     * @param {string} eventType - 이벤트 타입
     */
    onSpecialEvent(eventType) {
        const eventEmotions = {
            'first_date': { emotion: 'excited', intensity: 0.9, reason: '첫 데이트!' },
            'confession': { emotion: 'excited', intensity: 1.0, reason: '고백받음!' },
            'birthday': { emotion: 'happy', intensity: 0.8, reason: '생일 축하!' },
            'anniversary': { emotion: 'happy', intensity: 0.9, reason: '기념일!' },
            'gift_received': { emotion: 'happy', intensity: 0.7, reason: '선물 받음' },
            'fight': { emotion: 'angry', intensity: 0.8, reason: '싸움' },
            'apology': { emotion: 'sad', intensity: 0.6, reason: '사과 받음' },
            'surprise': { emotion: 'excited', intensity: 0.8, reason: '깜짝 이벤트!' }
        };

        const eventEmotion = eventEmotions[eventType];
        if (eventEmotion) {
            this.changeEmotion(eventEmotion.emotion, eventEmotion.intensity, eventEmotion.reason);
        }
    }

    /**
     * 감정 히스토리 조회
     * @param {number} limit - 최근 n개
     */
    getEmotionHistory(limit = 10) {
        return this.state.emotionHistory.slice(-limit);
    }

    /**
     * 감정 통계
     */
    getEmotionStats() {
        const history = this.state.emotionHistory;
        const stats = {};

        Object.keys(EmotionStateSystem.EMOTIONS).forEach(emotion => {
            stats[emotion] = history.filter(h => h.emotion === emotion).length;
        });

        return stats;
    }

    /**
     * 감정 상태 리셋 (개발/테스트용)
     */
    reset() {
        this.state = {
            currentEmotion: 'calm',
            emotionIntensity: 0.5,
            emotionStartTime: Date.now(),
            emotionDuration: 3600000,
            previousEmotion: null,
            emotionHistory: []
        };
        this.saveState();
        console.log('🔄 감정 상태 리셋 완료');
    }

    /**
     * 디버깅용 출력
     */
    debug() {
        const current = this.getCurrentEmotion();
        console.log('=== 😊 감정 상태 ===');
        console.log(`캐릭터: ${this.characterId} (${this.mbtiType})`);
        console.log(`현재 감정: ${current.icon} ${current.name}`);
        console.log(`강도: ${current.intensity.toFixed(2)}`);
        console.log(`남은 시간: ${Math.round(current.timeRemaining / 60000)}분`);
        console.log('Modifiers:', {
            proactiveContact: this.getModifier('proactiveContactFrequency').toFixed(2),
            photoSend: this.getModifier('photoSendChance').toFixed(2),
            responseSpeed: this.getModifier('responseSpeed').toFixed(2),
            affectionGain: this.getModifier('affectionGain').toFixed(2)
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionStateSystem;
}
