/**
 * Conversation Memory System
 * @description 대화 기억 및 맥락 관리 시스템 (Phase 3 Milestone 3)
 * @version 3.3.0
 */

class ConversationMemorySystem {
    constructor(characterId) {
        this.characterId = characterId;
        this.STORAGE_KEY = `conversation_memory_${characterId}`;

        // 메모리 로드
        this.memory = this.loadMemory();

        console.log('🧠 ConversationMemorySystem 초기화 완료');
    }

    /**
     * 메모리 로드
     */
    loadMemory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('❌ 메모리 로드 실패:', error);
        }

        // 기본 메모리 구조
        return {
            // 작업 메모리 (현재 세션)
            workingMemory: [],

            // 단기 기억 (최근 100개)
            shortTermMemory: [],

            // 장기 기억 (중요한 정보)
            longTermMemory: {
                preferences: [],      // 선호도
                promises: [],         // 약속
                personal_info: [],    // 개인 정보
                shared_experiences: [] // 공유된 경험
            },

            // 메타 정보
            totalMessages: 0,
            lastCleanup: Date.now()
        };
    }

    /**
     * 메모리 저장
     */
    saveMemory() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memory));
        } catch (error) {
            console.error('❌ 메모리 저장 실패:', error);
        }
    }

    /**
     * 메시지 추가
     * @param {string} role - 'user' 또는 'character'
     * @param {string} content - 메시지 내용
     * @param {object} context - 추가 컨텍스트 (호감도 변화 등)
     */
    addMessage(role, content, context = {}) {
        const message = {
            role,
            content,
            timestamp: Date.now(),
            importance: 0,
            keywords: [],
            affectionChange: context.affectionChange || 0,
            emotionChange: context.emotionChange || null,
            eventTriggered: context.eventTriggered || null
        };

        // 중요도 계산
        message.importance = this.calculateImportance(message);

        // 키워드 추출
        message.keywords = this.extractKeywords(content);

        // 작업 메모리에 추가
        this.memory.workingMemory.push(message);

        // 작업 메모리 크기 제한 (최근 20개)
        if (this.memory.workingMemory.length > 20) {
            const removed = this.memory.workingMemory.shift();

            // 중요도에 따라 단기/장기 메모리로 이동
            if (removed.importance >= 70) {
                this.addToLongTermMemory(removed);
            } else if (removed.importance >= 40) {
                this.addToShortTermMemory(removed);
            }
        }

        this.memory.totalMessages++;
        this.saveMemory();

        console.log(`🧠 메시지 기록: ${role} - 중요도 ${message.importance}`);
    }

    /**
     * 중요도 계산
     * @param {object} message - 메시지 객체
     */
    calculateImportance(message) {
        let score = 5; // 기본값

        const content = message.content.toLowerCase();

        // 1. 내용 기반 (최대 50점)
        if (this.containsPersonalInfo(content)) {
            score += 20;
        }

        if (this.containsPromise(content)) {
            score += 25;
        }

        if (this.containsEmotion(content)) {
            score += 15;
        }

        if (content.includes('?')) {
            score += 10;
        }

        // 2. 호감도 변화 (최대 30점)
        const affectionChange = Math.abs(message.affectionChange || 0);
        if (affectionChange >= 5) {
            score += 30;
        } else if (affectionChange >= 2) {
            score += 20;
        }

        // 3. 특수 이벤트 (최대 20점)
        if (message.eventTriggered) {
            score += 20;
        }

        if (message.emotionChange) {
            score += 10;
        }

        return Math.min(100, score);
    }

    /**
     * 개인 정보 포함 여부
     */
    containsPersonalInfo(text) {
        const keywords = ['이름은', '나이는', '직업은', '사는 곳', '취미', '좋아하는',
                         '싫어하는', '가족', '친구', '반려동물', '학교', '전공'];
        return keywords.some(k => text.includes(k));
    }

    /**
     * 약속 포함 여부
     */
    containsPromise(text) {
        const keywords = ['만나자', '가자', '하자', '약속', '다음에', '주말', '언제',
                         '같이', '함께', '보러', '먹으러', '놀러'];
        return keywords.some(k => text.includes(k));
    }

    /**
     * 감정 표현 포함 여부
     */
    containsEmotion(text) {
        const keywords = ['좋아', '사랑', '미안', '고마', '행복', '슬프', '화났',
                         '기뻐', '설레', '보고싶', '그리워', '걱정'];
        return keywords.some(k => text.includes(k));
    }

    /**
     * 키워드 추출
     * @param {string} text - 텍스트
     */
    extractKeywords(text) {
        const keywords = [];

        // 간단한 키워드 추출 (단어 길이 2자 이상)
        const words = text.split(/\s+/);
        words.forEach(word => {
            const clean = word.replace(/[^\w가-힣]/g, '');
            if (clean.length >= 2) {
                keywords.push(clean);
            }
        });

        return keywords.slice(0, 10); // 최대 10개
    }

    /**
     * 단기 메모리에 추가
     */
    addToShortTermMemory(message) {
        this.memory.shortTermMemory.push(message);

        // 최근 100개만 유지
        if (this.memory.shortTermMemory.length > 100) {
            this.memory.shortTermMemory.shift();
        }

        this.saveMemory();
    }

    /**
     * 장기 메모리에 추가
     */
    addToLongTermMemory(message) {
        const content = message.content;
        const summary = this.summarizeMessage(content);

        // 카테고리 분류
        if (this.containsPersonalInfo(content)) {
            this.memory.longTermMemory.personal_info.push({
                content: summary,
                timestamp: message.timestamp,
                keywords: message.keywords
            });

            // 최대 50개
            if (this.memory.longTermMemory.personal_info.length > 50) {
                this.memory.longTermMemory.personal_info.shift();
            }
        }

        if (this.containsPromise(content)) {
            this.memory.longTermMemory.promises.push({
                content: summary,
                timestamp: message.timestamp,
                keywords: message.keywords,
                completed: false
            });

            // 최대 30개
            if (this.memory.longTermMemory.promises.length > 30) {
                this.memory.longTermMemory.promises.shift();
            }
        }

        // 선호도 추출
        if (content.includes('좋아') || content.includes('싫어')) {
            this.memory.longTermMemory.preferences.push({
                content: summary,
                timestamp: message.timestamp,
                type: content.includes('좋아') ? 'like' : 'dislike'
            });

            // 최대 50개
            if (this.memory.longTermMemory.preferences.length > 50) {
                this.memory.longTermMemory.preferences.shift();
            }
        }

        // 특별 이벤트는 자동으로 공유된 경험
        if (message.eventTriggered) {
            this.memory.longTermMemory.shared_experiences.push({
                content: summary,
                timestamp: message.timestamp,
                eventId: message.eventTriggered
            });

            // 최대 50개
            if (this.memory.longTermMemory.shared_experiences.length > 50) {
                this.memory.longTermMemory.shared_experiences.shift();
            }
        }

        this.saveMemory();
    }

    /**
     * 메시지 요약
     */
    summarizeMessage(text) {
        // 간단한 요약 (첫 100자)
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }

    /**
     * 관련 메모리 검색
     * @param {string} query - 검색 쿼리
     * @param {number} limit - 최대 결과 수
     */
    searchMemory(query, limit = 5) {
        const queryKeywords = this.extractKeywords(query.toLowerCase());
        const results = [];

        // 장기 메모리 검색
        ['preferences', 'promises', 'personal_info', 'shared_experiences'].forEach(category => {
            this.memory.longTermMemory[category].forEach(item => {
                const score = this.calculateRelevance(queryKeywords, item.keywords || []);
                if (score > 0) {
                    results.push({
                        category,
                        content: item.content,
                        score,
                        timestamp: item.timestamp
                    });
                }
            });
        });

        // 단기 메모리 검색
        this.memory.shortTermMemory.forEach(msg => {
            const score = this.calculateRelevance(queryKeywords, msg.keywords);
            if (score > 0) {
                results.push({
                    category: 'recent',
                    content: msg.content,
                    score,
                    timestamp: msg.timestamp
                });
            }
        });

        // 점수 순 정렬 후 최신순
        results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.timestamp - a.timestamp;
        });

        return results.slice(0, limit);
    }

    /**
     * 관련성 계산
     */
    calculateRelevance(queryKeywords, itemKeywords) {
        let matches = 0;
        queryKeywords.forEach(qk => {
            if (itemKeywords.some(ik => ik.includes(qk) || qk.includes(ik))) {
                matches++;
            }
        });
        return matches;
    }

    /**
     * AI 프롬프트 컨텍스트 생성
     * @param {string} currentMessage - 현재 유저 메시지
     */
    generateContext(currentMessage = '') {
        const context = {
            longTermFacts: [],
            recentContext: [],
            relevantMemories: []
        };

        // 1. 장기 기억 (최대 10개 중요 사실)
        const allLongTerm = [];

        // 약속 우선
        this.memory.longTermMemory.promises.forEach(p => {
            if (!p.completed) {
                allLongTerm.push({ content: p.content, priority: 3, timestamp: p.timestamp });
            }
        });

        // 개인 정보
        this.memory.longTermMemory.personal_info.slice(-5).forEach(p => {
            allLongTerm.push({ content: p.content, priority: 2, timestamp: p.timestamp });
        });

        // 선호도
        this.memory.longTermMemory.preferences.slice(-5).forEach(p => {
            allLongTerm.push({ content: p.content, priority: 1, timestamp: p.timestamp });
        });

        // 우선순위 정렬
        allLongTerm.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return b.timestamp - a.timestamp;
        });

        context.longTermFacts = allLongTerm.slice(0, 10).map(item => item.content);

        // 2. 최근 대화 맥락 (작업 메모리 최근 5개)
        context.recentContext = this.memory.workingMemory
            .slice(-5)
            .map(msg => `${msg.role}: ${msg.content}`);

        // 3. 현재 메시지 관련 메모리
        if (currentMessage) {
            const relevant = this.searchMemory(currentMessage, 3);
            context.relevantMemories = relevant.map(r => r.content);
        }

        return context;
    }

    /**
     * 약속 완료 처리
     * @param {number} index - 약속 인덱스
     */
    completePromise(index) {
        if (this.memory.longTermMemory.promises[index]) {
            this.memory.longTermMemory.promises[index].completed = true;
            this.saveMemory();
            console.log('✅ 약속 완료 처리');
        }
    }

    /**
     * 세션 정리
     */
    cleanupSession() {
        // 작업 메모리의 모든 항목을 중요도에 따라 분류
        this.memory.workingMemory.forEach(msg => {
            if (msg.importance >= 70) {
                this.addToLongTermMemory(msg);
            } else if (msg.importance >= 40) {
                this.addToShortTermMemory(msg);
            }
        });

        // 작업 메모리 초기화
        this.memory.workingMemory = [];

        this.saveMemory();
        console.log('🧹 세션 메모리 정리 완료');
    }

    /**
     * 메모리 통계
     */
    getStats() {
        return {
            totalMessages: this.memory.totalMessages,
            workingMemory: this.memory.workingMemory.length,
            shortTermMemory: this.memory.shortTermMemory.length,
            longTermMemory: {
                preferences: this.memory.longTermMemory.preferences.length,
                promises: this.memory.longTermMemory.promises.length,
                personal_info: this.memory.longTermMemory.personal_info.length,
                shared_experiences: this.memory.longTermMemory.shared_experiences.length
            }
        };
    }

    /**
     * 메모리 리셋 (개발/테스트용)
     */
    reset() {
        this.memory = {
            workingMemory: [],
            shortTermMemory: [],
            longTermMemory: {
                preferences: [],
                promises: [],
                personal_info: [],
                shared_experiences: []
            },
            totalMessages: 0,
            lastCleanup: Date.now()
        };
        this.saveMemory();
        console.log('🔄 메모리 리셋 완료');
    }

    /**
     * 디버깅용 출력
     */
    debug() {
        console.log('=== 🧠 대화 메모리 시스템 ===');
        console.log('통계:', this.getStats());
        console.log('작업 메모리:', this.memory.workingMemory.slice(-3));
        console.log('장기 기억 (약속):', this.memory.longTermMemory.promises.slice(-3));
        console.log('장기 기억 (선호도):', this.memory.longTermMemory.preferences.slice(-3));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConversationMemorySystem;
}
