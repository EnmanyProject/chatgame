/**
 * Memory Keywords System
 * @description 메모리 추출 및 키워드 사전 시스템 (Phase 3 Milestone 3)
 * @version 3.3.0
 */

class MemoryExtractor {
    constructor() {
        // 키워드 사전
        this.keywords = {
            // 선호도 관련
            preferences: {
                likes: [
                    '좋아', '좋아해', '좋아하는', '좋아함', '취향', '최애',
                    '애정', '선호', '마음에 들어', '좋다', '멋지다', '예쁘다',
                    '맛있다', '재미있다', '신나', '행복', '즐겁', '사랑'
                ],
                dislikes: [
                    '싫어', '싫어해', '싫어하는', '별로', '안 좋아', '비호감',
                    '싫다', '짜증', '귀찮', '화나', '불편', '안 맞아',
                    '질색', '꺼려', '못 참', '못 견디', '싫증'
                ]
            },

            // 약속 관련
            promises: {
                arrangement: [
                    '만나자', '보자', '가자', '하자', '같이', '함께',
                    '약속', '다음에', '주말', '언제', '시간 있어',
                    '놀러', '먹으러', '보러', '즉석', '데이트'
                ],
                commitment: [
                    '꼭', '반드시', '절대', '진짜', '정말',
                    '약속해', '약속할게', '보장', '확실히', '틀림없이'
                ],
                future: [
                    '나중에', '앞으로', '다음', '미래', '계획',
                    '언젠가', '조만간', '곧', '이따', '내일'
                ]
            },

            // 개인 정보 관련
            personal_info: {
                basic: [
                    '이름은', '나이는', '나이가', '몇 살', '직업은',
                    '사는 곳', '거주지', '학교', '전공', '학과',
                    '출신', '고향', '생일', '별자리', '혈액형'
                ],
                interests: [
                    '취미', '특기', '관심', '좋아하는 것', '즐기는',
                    '자주 하는', '평소에', '보통', '주로', '습관'
                ],
                relationships: [
                    '가족', '부모님', '형제', '자매', '친구',
                    '지인', '동료', '선배', '후배', '애인'
                ],
                pets: [
                    '반려동물', '강아지', '고양이', '애완동물', '키우는',
                    '펫', '멍멍이', '냥이', '반려묘', '반려견'
                ]
            },

            // 경험 관련
            experiences: {
                recent: [
                    '어제', '오늘', '방금', '아까', '조금 전',
                    '최근', '요즘', '며칠 전', '얼마 전', '지난번'
                ],
                past: [
                    '예전에', '전에', '옛날에', '과거', '어렸을 때',
                    '학창시절', '기억나', '추억', '생각나', '그때'
                ],
                special: [
                    '처음', '첫', '특별', '인상적', '잊지 못할',
                    '기억에 남는', '소중한', '중요한', '의미있는', '뜻깊은'
                ]
            },

            // 감정 관련
            emotions: {
                positive: [
                    '좋아', '사랑', '행복', '기뻐', '즐거',
                    '설레', '두근', '감동', '고마', '고맙',
                    '감사', '만족', '뿌듯', '재미', '신나'
                ],
                negative: [
                    '슬프', '우울', '화났', '짜증', '속상',
                    '실망', '억울', '서운', '외로', '쓸쓸',
                    '답답', '불안', '걱정', '무서', '두려'
                ],
                care: [
                    '미안', '미안해', '죄송', '걱정', '괜찮',
                    '힘들', '아파', '보고싶', '그리워', '그립'
                ]
            },

            // 시간 및 빈도
            temporal: {
                frequency: [
                    '항상', '자주', '가끔', '종종', '때때로',
                    '매일', '매번', '늘', '평소', '보통',
                    '드물게', '간혹', '이따금', '가끔씩', '종종'
                ],
                duration: [
                    '오래', '오랫동안', '한참', '계속', '지속',
                    '잠깐', '순간', '짧게', '잠시', '금방'
                ]
            }
        };

        console.log('🔍 MemoryExtractor 초기화 완료');
    }

    /**
     * 메시지에서 선호도 추출
     * @param {string} text - 메시지 내용
     */
    extractPreferences(text) {
        const preferences = [];
        const lowerText = text.toLowerCase();

        // 좋아하는 것 추출
        for (const likeWord of this.keywords.preferences.likes) {
            if (lowerText.includes(likeWord)) {
                // 앞뒤 맥락 추출 (최대 30자)
                const index = lowerText.indexOf(likeWord);
                const start = Math.max(0, index - 15);
                const end = Math.min(text.length, index + 15);
                const context = text.substring(start, end).trim();

                preferences.push({
                    type: 'like',
                    keyword: likeWord,
                    context: context,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 싫어하는 것 추출
        for (const dislikeWord of this.keywords.preferences.dislikes) {
            if (lowerText.includes(dislikeWord)) {
                const index = lowerText.indexOf(dislikeWord);
                const start = Math.max(0, index - 15);
                const end = Math.min(text.length, index + 15);
                const context = text.substring(start, end).trim();

                preferences.push({
                    type: 'dislike',
                    keyword: dislikeWord,
                    context: context,
                    timestamp: Date.now()
                });
                break;
            }
        }

        return preferences;
    }

    /**
     * 메시지에서 약속 추출
     * @param {string} text - 메시지 내용
     */
    extractPromises(text) {
        const promises = [];
        const lowerText = text.toLowerCase();

        // 약속 관련 키워드 탐지
        let hasArrangement = false;
        let hasCommitment = false;
        let hasFuture = false;

        for (const word of this.keywords.promises.arrangement) {
            if (lowerText.includes(word)) {
                hasArrangement = true;
                break;
            }
        }

        for (const word of this.keywords.promises.commitment) {
            if (lowerText.includes(word)) {
                hasCommitment = true;
                break;
            }
        }

        for (const word of this.keywords.promises.future) {
            if (lowerText.includes(word)) {
                hasFuture = true;
                break;
            }
        }

        // 약속으로 판단되는 경우 추출
        if (hasArrangement || (hasCommitment && hasFuture)) {
            promises.push({
                type: hasCommitment ? 'strong_commitment' : 'casual_arrangement',
                content: text,
                timestamp: Date.now(),
                completed: false
            });
        }

        return promises;
    }

    /**
     * 메시지에서 개인 정보 추출
     * @param {string} text - 메시지 내용
     */
    extractPersonalInfo(text) {
        const personalInfo = [];
        const lowerText = text.toLowerCase();

        // 기본 정보
        for (const keyword of this.keywords.personal_info.basic) {
            if (lowerText.includes(keyword)) {
                personalInfo.push({
                    category: 'basic',
                    keyword: keyword,
                    content: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 관심사
        for (const keyword of this.keywords.personal_info.interests) {
            if (lowerText.includes(keyword)) {
                personalInfo.push({
                    category: 'interests',
                    keyword: keyword,
                    content: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 관계
        for (const keyword of this.keywords.personal_info.relationships) {
            if (lowerText.includes(keyword)) {
                personalInfo.push({
                    category: 'relationships',
                    keyword: keyword,
                    content: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 반려동물
        for (const keyword of this.keywords.personal_info.pets) {
            if (lowerText.includes(keyword)) {
                personalInfo.push({
                    category: 'pets',
                    keyword: keyword,
                    content: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        return personalInfo;
    }

    /**
     * 메시지에서 경험 추출
     * @param {string} text - 메시지 내용
     */
    extractExperiences(text) {
        const experiences = [];
        const lowerText = text.toLowerCase();

        // 최근 경험
        for (const keyword of this.keywords.experiences.recent) {
            if (lowerText.includes(keyword)) {
                experiences.push({
                    timeframe: 'recent',
                    keyword: keyword,
                    content: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 과거 경험
        for (const keyword of this.keywords.experiences.past) {
            if (lowerText.includes(keyword)) {
                experiences.push({
                    timeframe: 'past',
                    keyword: keyword,
                    content: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 특별한 경험
        for (const keyword of this.keywords.experiences.special) {
            if (lowerText.includes(keyword)) {
                experiences.push({
                    timeframe: 'special',
                    keyword: keyword,
                    content: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        return experiences;
    }

    /**
     * 메시지에서 감정 추출
     * @param {string} text - 메시지 내용
     */
    extractEmotions(text) {
        const emotions = [];
        const lowerText = text.toLowerCase();

        // 긍정 감정
        for (const keyword of this.keywords.emotions.positive) {
            if (lowerText.includes(keyword)) {
                emotions.push({
                    valence: 'positive',
                    keyword: keyword,
                    context: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 부정 감정
        for (const keyword of this.keywords.emotions.negative) {
            if (lowerText.includes(keyword)) {
                emotions.push({
                    valence: 'negative',
                    keyword: keyword,
                    context: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        // 배려/관심 감정
        for (const keyword of this.keywords.emotions.care) {
            if (lowerText.includes(keyword)) {
                emotions.push({
                    valence: 'care',
                    keyword: keyword,
                    context: text,
                    timestamp: Date.now()
                });
                break;
            }
        }

        return emotions;
    }

    /**
     * 통합 메모리 추출
     * @param {string} text - 메시지 내용
     * @param {object} context - 추가 컨텍스트
     */
    extractAll(text, context = {}) {
        const extracted = {
            preferences: this.extractPreferences(text),
            promises: this.extractPromises(text),
            personalInfo: this.extractPersonalInfo(text),
            experiences: this.extractExperiences(text),
            emotions: this.extractEmotions(text),
            metadata: {
                hasQuestion: text.includes('?'),
                length: text.length,
                wordCount: text.split(/\s+/).length,
                affectionChange: context.affectionChange || 0,
                eventTriggered: context.eventTriggered || null
            }
        };

        console.log(`🔍 메모리 추출 완료: ${text.substring(0, 30)}...`, {
            preferences: extracted.preferences.length,
            promises: extracted.promises.length,
            personalInfo: extracted.personalInfo.length,
            experiences: extracted.experiences.length,
            emotions: extracted.emotions.length
        });

        return extracted;
    }

    /**
     * 메모리 요약 생성
     * @param {array} memories - 메모리 배열
     * @param {number} maxLength - 최대 길이
     */
    generateSummary(memories, maxLength = 100) {
        if (!memories || memories.length === 0) {
            return '';
        }

        // 가장 최근 메모리 선택
        const sortedMemories = memories.sort((a, b) => b.timestamp - a.timestamp);
        const recentMemories = sortedMemories.slice(0, 5);

        // 요약 생성
        let summary = '';
        for (const memory of recentMemories) {
            const content = memory.content || memory.context || '';
            if (content.length > 0) {
                summary += content + ' ';
                if (summary.length >= maxLength) {
                    break;
                }
            }
        }

        // 최대 길이로 자르기
        if (summary.length > maxLength) {
            summary = summary.substring(0, maxLength) + '...';
        }

        return summary.trim();
    }

    /**
     * 키워드 점수 계산
     * @param {string} text - 메시지 내용
     */
    calculateKeywordScore(text) {
        let score = 0;
        const lowerText = text.toLowerCase();

        // 각 카테고리별 점수 계산
        const categories = [
            { keywords: this.keywords.preferences.likes, weight: 2 },
            { keywords: this.keywords.preferences.dislikes, weight: 2 },
            { keywords: this.keywords.promises.arrangement, weight: 3 },
            { keywords: this.keywords.promises.commitment, weight: 4 },
            { keywords: this.keywords.personal_info.basic, weight: 3 },
            { keywords: this.keywords.personal_info.interests, weight: 2 },
            { keywords: this.keywords.experiences.special, weight: 3 },
            { keywords: this.keywords.emotions.positive, weight: 1 },
            { keywords: this.keywords.emotions.negative, weight: 1 }
        ];

        for (const category of categories) {
            for (const keyword of category.keywords) {
                if (lowerText.includes(keyword)) {
                    score += category.weight;
                    break; // 카테고리당 1번만 점수 추가
                }
            }
        }

        return score;
    }

    /**
     * 디버깅용 출력
     */
    debug() {
        console.log('=== 🔍 메모리 키워드 시스템 ===');
        console.log('선호도 키워드:', this.keywords.preferences.likes.length + this.keywords.preferences.dislikes.length);
        console.log('약속 키워드:', this.keywords.promises.arrangement.length + this.keywords.promises.commitment.length);
        console.log('개인정보 키워드:', this.keywords.personal_info.basic.length);
        console.log('경험 키워드:', this.keywords.experiences.recent.length + this.keywords.experiences.past.length);
        console.log('감정 키워드:', this.keywords.emotions.positive.length + this.keywords.emotions.negative.length);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryExtractor;
}
