/**
 * Photo Sending System v2.1.0
 * 호감도 기반 캐릭터 사진 전송 시스템
 *
 * 기능:
 * - character-photos.json에서 사진 로드
 * - 호감도 레벨에 따른 사진 전송 확률 계산
 * - MBTI별 메시지 스타일 적용
 * - 시간/상황 기반 트리거
 */

class PhotoSendingSystem {
    constructor() {
        this.photoDB = null;
        this.sendHistory = [];
        this.init();
    }

    /**
     * 시스템 초기화
     */
    async init() {
        try {
            await this.loadPhotoDB();
            this.loadSendHistory();
            console.log('[PhotoSystem] 초기화 완료:', {
                characters: Object.keys(this.photoDB.photos || {}).length,
                total_photos: this.photoDB.metadata?.total_photos || 0
            });
        } catch (error) {
            console.error('[PhotoSystem] 초기화 실패:', error);
            this.photoDB = { photos: {}, metadata: {} };
        }
    }

    /**
     * 사진 데이터베이스 로드
     */
    async loadPhotoDB() {
        const response = await fetch('/data/character-photos.json');
        if (!response.ok) {
            throw new Error(`사진 DB 로드 실패: ${response.status}`);
        }
        this.photoDB = await response.json();
    }

    /**
     * 전송 이력 로드
     */
    loadSendHistory() {
        const saved = localStorage.getItem('photo_send_history');
        this.sendHistory = saved ? JSON.parse(saved) : [];
    }

    /**
     * 전송 이력 저장
     */
    saveSendHistory() {
        localStorage.setItem('photo_send_history', JSON.stringify(this.sendHistory));
    }

    /**
     * 캐릭터 사진 가져오기
     * @param {string} characterId - 캐릭터 ID
     * @param {string} category - 사진 카테고리 (선택사항)
     * @returns {Array} 사진 목록
     */
    getCharacterPhotos(characterId, category = null) {
        if (!this.photoDB || !this.photoDB.photos) {
            console.warn('[PhotoSystem] 사진 DB가 로드되지 않음');
            return [];
        }

        const characterPhotos = this.photoDB.photos[characterId] || [];

        if (category) {
            return characterPhotos.filter(p => p.category === category);
        }

        return characterPhotos;
    }

    /**
     * 호감도 기반 사진 전송 확률 계산
     * @param {number} affection - 현재 호감도
     * @returns {number} 전송 확률 (0-100)
     */
    calculateSendProbability(affection) {
        if (affection < 3) return 0;
        if (affection < 5) return 15;   // 3-4: 15%
        if (affection < 7) return 35;   // 5-6: 35%
        if (affection < 9) return 60;   // 7-8: 60%
        return 85;                       // 9-10: 85%
    }

    /**
     * 호감도 기반 카테고리 선택
     * @param {number} affection - 현재 호감도
     * @param {Array} availablePhotos - 사용 가능한 사진 목록
     * @returns {string|null} 선택된 카테고리
     */
    selectCategoryByAffection(affection, availablePhotos) {
        // 사용 가능한 카테고리 추출
        const categories = [...new Set(availablePhotos.map(p => p.category))];

        // 호감도별 카테고리 가중치
        const weights = {
            'profile': affection >= 3 ? 30 : 0,
            'casual': affection >= 5 ? 25 : 0,
            'romantic': affection >= 7 ? 20 : 0,
            'emotional': affection >= 7 ? 15 : 0,
            'special': affection >= 9 ? 10 : 0
        };

        // 가중치 기반 랜덤 선택
        const availableCategories = categories.filter(cat => weights[cat] > 0);
        if (availableCategories.length === 0) return null;

        const totalWeight = availableCategories.reduce((sum, cat) => sum + weights[cat], 0);
        let random = Math.random() * totalWeight;

        for (const category of availableCategories) {
            random -= weights[category];
            if (random <= 0) return category;
        }

        return availableCategories[0];
    }

    /**
     * MBTI별 사진 전송 메시지 생성
     * @param {string} mbti - MBTI 타입
     * @param {string} category - 사진 카테고리
     * @returns {string} 메시지
     */
    generatePhotoMessage(mbti, category) {
        const messages = {
            'enfp': {
                'profile': ['오빠~ 이 사진 어때? 😊', '방금 찍은 건데 보여줄게!'],
                'casual': ['오늘 뭐 했는지 보여줄게 ㅎㅎ', '이거 보면 생각날 거야!'],
                'romantic': ['오빠한테만 보여주는 거야 💕', '이 사진... 오빠 생각하면서 찍었어'],
                'emotional': ['지금 기분이 이래... 🥺', '오빠한테는 다 보여주고 싶어'],
                'special': ['특별한 순간이라서 공유하고 싶었어! ✨']
            },
            'infp': {
                'profile': ['이 사진... 괜찮을까? 😳', '용기내서 보내봐...'],
                'casual': ['오늘 하루는 이랬어...', '오빠한테 보여주고 싶었어'],
                'romantic': ['너무 부끄럽지만... 보여줄게 💗', '오빠만 볼 수 있는 사진'],
                'emotional': ['지금 느낌을 담아봤어...', '이 사진이 나를 표현하는 것 같아'],
                'special': ['정말 특별한 순간이었어... ✨']
            },
            'intj': {
                'profile': ['사진 보내줄게', '오늘 모습이야'],
                'casual': ['일상 공유', '최근 상황이야'],
                'romantic': ['너한테만 보여주는 거야', '특별히 보내는 사진'],
                'emotional': ['지금 상태', '이런 느낌이야'],
                'special': ['기록하고 싶었어']
            },
            'estj': {
                'profile': ['사진 보내! 😊', '오늘의 나!'],
                'casual': ['요즘 이렇게 지내', '일상 업데이트!'],
                'romantic': ['오빠한테 보내는 특별 사진 💕', '오빠 보고 싶어서'],
                'emotional': ['지금 기분 공유!', '이런 상태야'],
                'special': ['기념일이라 사진 보내!']
            },
            'isfp': {
                'profile': ['사진 찍어봤어...', '이거 괜찮아?'],
                'casual': ['오늘은 이랬어', '일상 사진이야'],
                'romantic': ['오빠만 보는 사진... 💗', '부끄럽지만 보여줄게'],
                'emotional': ['지금 느낌...', '이 순간을 담았어'],
                'special': ['특별해서 보내봐...']
            },
            'esfp': {
                'profile': ['야호~ 사진 봐봐! 😄', '어때어때? 이쁘지?'],
                'casual': ['오늘 완전 재밌었어! 보여줄게!', '이거 봐바~'],
                'romantic': ['오빠한테만 특별히 보여주는 거야 💖', '오빠 좋아하는 스타일로 찍었어!'],
                'emotional': ['지금 이 기분 느껴져? ㅎㅎ', '기분 완전 좋아~!'],
                'special': ['대박 사건 있었어! 보여줄게! ✨']
            },
            'intp': {
                'profile': ['사진', '최근 모습'],
                'casual': ['일상', '오늘'],
                'romantic': ['너한테만', '특별히'],
                'emotional': ['지금', '느낌'],
                'special': ['기록']
            },
            'istp': {
                'profile': ['사진 보냄', '오늘'],
                'casual': ['일상', '최근'],
                'romantic': ['너만', '특별'],
                'emotional': ['지금', '상태'],
                'special': ['특이사항']
            },
            'isfj': {
                'profile': ['사진 보내도 될까? 😊', '괜찮으면 봐줘'],
                'casual': ['오늘 하루 보여줄게', '이렇게 지냈어'],
                'romantic': ['오빠한테만 보여주고 싶어서 💗', '부끄럽지만...'],
                'emotional': ['지금 기분이 이래...', '오빠한테만 얘기해'],
                'special': ['특별한 날이라서 공유하고 싶었어']
            },
            'esfj': {
                'profile': ['사진 봐줘! 어때? 😊', '오늘 모습이야~'],
                'casual': ['오늘 이렇게 보냈어! 보여줄게!', '오빠도 궁금하지?'],
                'romantic': ['오빠한테만 보여주는 특별한 사진이야 💕', '오빠 생각하면서 찍었어'],
                'emotional': ['오빠한테 기분 공유하고 싶어', '지금 마음 이래...'],
                'special': ['정말 특별한 순간이라 공유하고 싶었어! ✨']
            },
            'istj': {
                'profile': ['사진 보내', '오늘 모습'],
                'casual': ['일상 공유', '최근 상황'],
                'romantic': ['너한테만 보내는 거야', '특별한 사진'],
                'emotional': ['지금 상태', '느낌'],
                'special': ['기록용']
            },
            'entj': {
                'profile': ['사진 보내줄게', '오늘의 나'],
                'casual': ['업데이트', '최근'],
                'romantic': ['너한테만', '특별히 보냄'],
                'emotional': ['현재 상태', '지금'],
                'special': ['중요한 순간']
            },
            'entp': {
                'profile': ['사진 봐봐! 😄', '어때?'],
                'casual': ['오늘 이랬어 ㅋㅋ', '보여줄게'],
                'romantic': ['오빠한테만 특별 서비스! 💖', '독점 사진이야'],
                'emotional': ['지금 기분 ㅋㅋ', '느껴져?'],
                'special': ['이거 완전 대박! ✨']
            },
            'infj': {
                'profile': ['사진... 보여줄게', '괜찮을까?'],
                'casual': ['오늘 하루...', '이렇게 지냈어'],
                'romantic': ['오빠만 볼 수 있는 사진... 💗', '부끄럽지만'],
                'emotional': ['지금 마음...', '이 느낌'],
                'special': ['의미있는 순간이었어...']
            },
            'enfj': {
                'profile': ['사진 봐줘! 😊', '오늘의 나야'],
                'casual': ['오늘 이렇게 보냈어! 보여줄게', '오빠한테 공유하고 싶었어'],
                'romantic': ['오빠한테만 특별히 보내는 거야 💕', '오빠 생각하며 찍었어'],
                'emotional': ['지금 기분... 오빠한테 말하고 싶어', '마음을 담아봤어'],
                'special': ['정말 특별한 순간이라 공유하고 싶었어! ✨']
            },
            'intj': {
                'profile': ['사진 전송', '현재 모습'],
                'casual': ['일상 기록', '최근'],
                'romantic': ['너한테만', '특별 전송'],
                'emotional': ['현재 상태', '지금'],
                'special': ['중요 기록']
            }
        };

        const mbtiMessages = messages[mbti.toLowerCase()] || messages['infp'];
        const categoryMessages = mbtiMessages[category] || mbtiMessages['profile'];

        return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
    }

    /**
     * 사진 전송 시도
     * @param {string} characterId - 캐릭터 ID
     * @param {string} mbti - MBTI 타입
     * @param {number} affection - 호감도
     * @returns {Object|null} 전송된 사진 정보
     */
    async attemptPhotoSend(characterId, mbti, affection) {
        // 확률 체크
        const probability = this.calculateSendProbability(affection);
        const random = Math.random() * 100;

        if (random > probability) {
            console.log('[PhotoSystem] 전송 확률 미달:', { probability, random });
            return null;
        }

        // 사진 가져오기
        const photos = this.getCharacterPhotos(characterId);
        if (photos.length === 0) {
            console.warn('[PhotoSystem] 사진 없음:', characterId);
            return null;
        }

        // 카테고리 선택
        const category = this.selectCategoryByAffection(affection, photos);
        if (!category) {
            console.log('[PhotoSystem] 선택 가능한 카테고리 없음');
            return null;
        }

        // 해당 카테고리 사진 선택
        const categoryPhotos = photos.filter(p => p.category === category);
        const selectedPhoto = categoryPhotos[Math.floor(Math.random() * categoryPhotos.length)];

        // 메시지 생성
        const message = this.generatePhotoMessage(mbti, category);

        // 전송 이력 저장
        const sendRecord = {
            timestamp: new Date().toISOString(),
            characterId,
            photoId: selectedPhoto.id,
            category,
            affection,
            message
        };
        this.sendHistory.push(sendRecord);
        this.saveSendHistory();

        console.log('[PhotoSystem] 사진 전송:', sendRecord);

        return {
            photo: selectedPhoto,
            message,
            category
        };
    }

    /**
     * 시간 기반 트리거 (아침, 점심, 저녁)
     * @param {string} characterId
     * @param {string} mbti
     * @param {number} affection
     * @returns {Object|null}
     */
    async triggerByTime(characterId, mbti, affection) {
        const hour = new Date().getHours();
        let timeBonus = 0;

        // 시간대별 보너스
        if (hour >= 7 && hour < 9) timeBonus = 10;      // 아침
        else if (hour >= 12 && hour < 14) timeBonus = 15; // 점심
        else if (hour >= 19 && hour < 22) timeBonus = 20; // 저녁

        // 보너스 적용
        const adjustedAffection = affection + (timeBonus / 10);

        return await this.attemptPhotoSend(characterId, mbti, adjustedAffection);
    }

    /**
     * 호감도 증가 트리거
     * @param {string} characterId
     * @param {string} mbti
     * @param {number} newAffection
     * @param {number} previousAffection
     * @returns {Object|null}
     */
    async triggerByAffectionIncrease(characterId, mbti, newAffection, previousAffection) {
        // 호감도가 크게 증가했을 때 (2 이상)
        if (newAffection - previousAffection >= 2) {
            // 50% 확률로 즉시 사진 전송
            if (Math.random() < 0.5) {
                return await this.attemptPhotoSend(characterId, mbti, newAffection);
            }
        }

        // 호감도 레벨업 시 (예: 6→7)
        const prevLevel = Math.floor(previousAffection);
        const newLevel = Math.floor(newAffection);

        if (newLevel > prevLevel && newLevel >= 7) {
            // 70% 확률로 축하 사진 전송
            if (Math.random() < 0.7) {
                return await this.attemptPhotoSend(characterId, mbti, newAffection);
            }
        }

        return null;
    }
}

// 전역 인스턴스 생성
const photoSendingSystem = new PhotoSendingSystem();

// 외부에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
    window.photoSendingSystem = photoSendingSystem;
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoSendingSystem;
}
