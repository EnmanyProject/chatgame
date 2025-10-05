/**
 * Proactive Contact System
 * @description 캐릭터가 먼저 연락하는 시스템 (Phase 2-C)
 * @version 2.2.0
 */

class ProactiveContactSystem {
    constructor(characterId) {
        this.characterId = characterId;
        this.storageKey = `proactive_contact_${characterId}`;
        this.loadState();
    }

    /**
     * 상태 로드
     */
    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.state = JSON.parse(saved);
        } else {
            this.state = {
                lastContactTime: null,
                lastUserResponseTime: null,
                contactCount: 0,
                lastReactionMessageTime: null
            };
        }
    }

    /**
     * 상태 저장
     */
    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    /**
     * 호감도별 연락 주기 계산 (분 단위)
     * @param {number} affection - 호감도 (1-10)
     * @returns {number} 연락 주기 (분)
     */
    getContactInterval(affection) {
        if (affection === 0) return Infinity; // 연락 중지

        const intervals = {
            1: 60,  // 1시간
            2: 60,
            3: 45,  // 45분
            4: 45,
            5: 30,  // 30분
            6: 30,
            7: 20,  // 20분
            8: 20,
            9: 10,  // 10분
            10: 10
        };

        return intervals[affection] || 60;
    }

    /**
     * MBTI별 인내심 패턴
     * @param {string} mbti - MBTI 타입
     * @returns {Object} 인내심 설정
     */
    getPatiencePattern(mbti) {
        const patterns = {
            'INFP': {
                name: '감성형',
                reactions: [
                    { hours: 6, message: '오빤 바쁜가봐... ㅠㅠ', affectionChange: 0 },
                    { hours: 12, message: '내가 뭔가 잘못한 걸까...', affectionChange: 0 },
                    { hours: 24, message: '많이 서운해... 😢', affectionChange: -1 }
                ]
            },
            'ENFP': {
                name: '활발형',
                reactions: [
                    { hours: 3, message: '오빠!! 왜 답 없어?? 😢', affectionChange: 0 },
                    { hours: 6, message: '서운해... 나한테 관심 없는 거야?', affectionChange: -1 },
                    { hours: 12, message: '진짜 섭섭하다... 💔', affectionChange: -2 }
                ]
            },
            'INTJ': {
                name: '논리형',
                reactions: [
                    { hours: 12, message: '바쁜 것 같네요', affectionChange: 0 },
                    { hours: 24, message: '그럼 저도 제 일 하겠습니다', affectionChange: -1 }
                ]
            },
            'ESTJ': {
                name: '실용형',
                reactions: [
                    { hours: 8, message: '답장 없네? 바쁜가 보지', affectionChange: 0 },
                    { hours: 16, message: '연락이 없으니 섭섭하네', affectionChange: -1 }
                ]
            },
            'ESFJ': {
                name: '사교형',
                reactions: [
                    { hours: 4, message: '오빠 괜찮아? 무슨 일 있어?', affectionChange: 0 },
                    { hours: 8, message: '걱정돼... 연락 줘 ㅠㅠ', affectionChange: -1 },
                    { hours: 12, message: '정말 걱정했어... 😭', affectionChange: -2 }
                ]
            },
            'ISTP': {
                name: '자유형',
                reactions: [
                    { hours: 24, message: '바쁘구나', affectionChange: 0 },
                    { hours: 48, message: '뭐 할 일 많았나 보네', affectionChange: -1 }
                ]
            },
            'ISFP': {
                name: '예술형',
                reactions: [
                    { hours: 8, message: '오빠... 답장 없네 ㅠ', affectionChange: 0 },
                    { hours: 16, message: '혼자 있으니까 외로워...', affectionChange: -1 }
                ]
            },
            'ESFP': {
                name: '자유로운 영혼',
                reactions: [
                    { hours: 5, message: '오빠!! 어디갔어?? 😭', affectionChange: 0 },
                    { hours: 10, message: '심심해... 나랑 놀아줘', affectionChange: -1 }
                ]
            },
            'INTP': {
                name: '사색형',
                reactions: [
                    { hours: 12, message: '바쁜가 보네', affectionChange: 0 },
                    { hours: 24, message: '뭐... 할 일 있겠지', affectionChange: -1 }
                ]
            },
            'ISFJ': {
                name: '수호자형',
                reactions: [
                    { hours: 6, message: '오빠... 괜찮아?', affectionChange: 0 },
                    { hours: 12, message: '걱정돼서 연락했어', affectionChange: -1 }
                ]
            },
            'ISTJ': {
                name: '현실주의자',
                reactions: [
                    { hours: 12, message: '바쁜가 보네요', affectionChange: 0 },
                    { hours: 24, message: '일이 많은 모양이네', affectionChange: -1 }
                ]
            },
            'ENTJ': {
                name: '지도자형',
                reactions: [
                    { hours: 8, message: '답장 없네', affectionChange: 0 },
                    { hours: 16, message: '연락 주면 좋겠어', affectionChange: -1 }
                ]
            },
            'ENTP': {
                name: '발명가형',
                reactions: [
                    { hours: 6, message: '왜 답 안 해? ㅋㅋ', affectionChange: 0 },
                    { hours: 12, message: '바쁜 거 알지만 그래도 섭섭', affectionChange: -1 }
                ]
            },
            'INFJ': {
                name: '옹호자형',
                reactions: [
                    { hours: 8, message: '괜찮은 거 맞아...?', affectionChange: 0 },
                    { hours: 16, message: '너무 걱정돼... 연락 줘', affectionChange: -1 }
                ]
            },
            'ENFJ': {
                name: '선도자형',
                reactions: [
                    { hours: 5, message: '오빠 괜찮아? 무슨 일 있어?', affectionChange: 0 },
                    { hours: 10, message: '연락 주면 좋겠어 ㅠㅠ', affectionChange: -1 }
                ]
            }
        };

        return patterns[mbti] || patterns['INFP']; // 기본값: INFP
    }

    /**
     * 먼저 연락해야 하는지 체크
     * @param {number} affection - 호감도
     * @param {string} mbti - MBTI 타입
     * @returns {Object|null} 연락 메시지 또는 null
     */
    shouldContact(affection, mbti) {
        // 호감도 0이면 연락 중지
        if (affection === 0) {
            console.log(`[먼저 연락] 호감도 0 - 연락 중지`);
            return null;
        }

        const now = Date.now();
        const interval = this.getContactInterval(affection);

        // 마지막 연락 시간 체크
        if (this.state.lastContactTime) {
            const elapsed = (now - this.state.lastContactTime) / (1000 * 60); // 분 단위
            if (elapsed < interval) {
                return null; // 아직 시간 안 됨
            }
        }

        // 연락 메시지 생성
        const message = this.generateProactiveMessage(mbti, affection);

        // 상태 업데이트
        this.state.lastContactTime = now;
        this.state.contactCount++;
        this.saveState();

        console.log(`[먼저 연락] 호감도 ${affection}, 주기 ${interval}분, 메시지 전송`);
        return message;
    }

    /**
     * 무응답 시 반응 메시지 체크
     * @param {number} affection - 호감도
     * @param {string} mbti - MBTI 타입
     * @returns {Object|null} 반응 메시지 및 호감도 변화
     */
    checkReactionMessage(affection, mbti) {
        // 유저가 응답한 적이 있으면 무응답 시간 계산
        if (!this.state.lastUserResponseTime) {
            return null; // 아직 대화 시작 안 함
        }

        const now = Date.now();
        const noResponseHours = (now - this.state.lastUserResponseTime) / (1000 * 60 * 60);

        const pattern = this.getPatiencePattern(mbti);

        // 각 반응 단계 체크
        for (const reaction of pattern.reactions) {
            // 이미 보낸 반응 메시지는 스킵
            if (this.state.lastReactionMessageTime) {
                const lastReactionHours = (now - this.state.lastReactionMessageTime) / (1000 * 60 * 60);
                if (lastReactionHours < reaction.hours) {
                    continue;
                }
            }

            if (noResponseHours >= reaction.hours) {
                console.log(`[반응 메시지] MBTI ${mbti}, ${reaction.hours}시간 무응답 - 반응 발동`);

                // 반응 메시지 전송 시간 기록
                this.state.lastReactionMessageTime = now;
                this.saveState();

                return {
                    message: reaction.message,
                    affectionChange: reaction.affectionChange,
                    isReaction: true
                };
            }
        }

        return null;
    }

    /**
     * 먼저 연락 메시지 생성
     * @param {string} mbti - MBTI 타입
     * @param {number} affection - 호감도
     * @returns {Object} 메시지 객체
     */
    generateProactiveMessage(mbti, affection) {
        const hour = new Date().getHours();
        const timeSlot = this.getTimeSlot(hour);

        const messages = this.getMessageTemplates(mbti, affection, timeSlot);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        return {
            type: 'character_message',
            text: randomMessage,
            timestamp: new Date().toISOString(),
            isProactive: true
        };
    }

    /**
     * 시간대 구분
     * @param {number} hour - 시간 (0-23)
     * @returns {string} 시간대
     */
    getTimeSlot(hour) {
        if (hour >= 6 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 14) return 'lunch';
        if (hour >= 14 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    /**
     * MBTI × 시간대 × 호감도별 메시지 템플릿
     * @param {string} mbti - MBTI 타입
     * @param {number} affection - 호감도
     * @param {string} timeSlot - 시간대
     * @returns {Array} 메시지 배열
     */
    getMessageTemplates(mbti, affection, timeSlot) {
        // 기본 메시지 풀
        const baseMessages = {
            morning: [
                '좋은 아침! 잘 잤어?',
                '아침이야~ 일어났어?',
                '오늘 아침 기분 어때?',
                '일찍 일어났네! 나도 막 일어났어'
            ],
            lunch: [
                '점심 뭐 먹어?',
                '배고프다... 뭐 먹을까?',
                '점심시간이야! 밥 먹었어?',
                '나 지금 점심 먹는 중~'
            ],
            afternoon: [
                '오늘 하루 어때?',
                '뭐하고 있어?',
                '오후에는 뭐 할 거야?',
                '심심해... 뭐해?'
            ],
            evening: [
                '저녁 먹었어?',
                '오늘 저녁 뭐 먹어?',
                '하루 어땠어?',
                '저녁이다~ 피곤하지?'
            ],
            night: [
                '아직 안 자?',
                '자기 전에 인사하고 싶었어',
                '오늘 하루 수고했어!',
                '늦었다... 빨리 자야지'
            ]
        };

        // MBTI별 특색 메시지 추가
        const mbtiMessages = this.getMBTISpecificMessages(mbti, affection, timeSlot);

        return [...baseMessages[timeSlot], ...mbtiMessages];
    }

    /**
     * MBTI별 특색 메시지
     * @param {string} mbti - MBTI 타입
     * @param {number} affection - 호감도
     * @param {string} timeSlot - 시간대
     * @returns {Array} MBTI 특색 메시지
     */
    getMBTISpecificMessages(mbti, affection, timeSlot) {
        const mbtiStyles = {
            'INFP': [
                '오늘 하늘이 예뻐서 사진 찍었어',
                '오빠 생각하면서 음악 듣는 중...',
                '지금 카페에 있는데 분위기 너무 좋아'
            ],
            'ENFP': [
                '오빠!! 나 오늘 재밌는 일 있었어!!',
                '우리 어디 놀러 갈까? ㅎㅎ',
                '오빠 보고싶다!! 😆'
            ],
            'INTJ': [
                '오늘 새로운 걸 배웠어',
                '요즘 생각 중인 게 있어',
                '효율적인 방법을 찾았어'
            ],
            'ESFJ': [
                '오빠 오늘 밥 잘 챙겨 먹었어?',
                '날씨 추운데 따뜻하게 입고 다녀',
                '오빠 건강은 괜찮아?'
            ]
        };

        const messages = mbtiStyles[mbti] || mbtiStyles['INFP'];

        // 호감도 높으면 애정 표현 추가
        if (affection >= 7) {
            messages.push(
                '보고싶어...',
                '오빠 생각 중 ❤️',
                '오빠 목소리 듣고 싶다'
            );
        }

        return messages;
    }

    /**
     * 유저 응답 시 호출
     */
    onUserResponse() {
        this.state.lastUserResponseTime = Date.now();
        this.state.lastReactionMessageTime = null; // 반응 메시지 리셋
        this.saveState();
        console.log('[먼저 연락] 유저 응답 - 타이머 리셋');
    }

    /**
     * 호감도 0 도달 시 초기화
     */
    resetOnZeroAffection() {
        console.log('[먼저 연락] 호감도 0 - 시스템 초기화');
        this.state = {
            lastContactTime: null,
            lastUserResponseTime: null,
            contactCount: 0,
            lastReactionMessageTime: null
        };
        this.saveState();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProactiveContactSystem;
}
