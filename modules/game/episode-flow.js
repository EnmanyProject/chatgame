/**
 * 📚 36개 에피소드 흐름 관리 모듈 (v2.1.0)
 * - 에피소드 진행 관리
 * - 퀘스트 상태 추적
 * - 분기점 처리
 * - 엔딩 조건 체크
 */

import gameArch from '../core/architecture.js';
import DataSchema from '../core/schema.js';

export class EpisodeFlow {
    constructor() {
        this.currentEpisode = 1;
        this.episodeMap = new Map();
        this.questProgress = [];
        this.storyBranches = [];
        this.endingFlags = new Set();
        this.initialized = false;
    }

    // 모듈 초기화
    async initialize() {
        try {
            console.log('📚 EpisodeFlow 모듈 초기화 중...');
            
            // 에피소드 맵 생성
            this.createEpisodeMap();
            
            // 분기점 설정
            this.setupStoryBranches();
            
            // 엔딩 조건 설정
            this.setupEndingConditions();
            
            // 이벤트 리스너 등록
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ EpisodeFlow 모듈 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ EpisodeFlow 초기화 실패:', error);
            return false;
        }
    }

    // 에피소드 맵 생성
    createEpisodeMap() {
        // 36개 에피소드를 9개 챕터로 구성
        const chapters = [
            { name: '첫 만남', episodes: [1, 2, 3, 4], theme: 'introduction' },
            { name: '서로 알아가기', episodes: [5, 6, 7, 8], theme: 'getting_to_know' },
            { name: '친밀감 형성', episodes: [9, 10, 11, 12], theme: 'building_closeness' },
            { name: '갈등과 이해', episodes: [13, 14, 15, 16], theme: 'conflict_resolution' },
            { name: '깊어지는 관계', episodes: [17, 18, 19, 20], theme: 'deepening_bond' },
            { name: '마음 확인', episodes: [21, 22, 23, 24], theme: 'heart_confirmation' },
            { name: '시련 극복', episodes: [25, 26, 27, 28], theme: 'overcoming_trials' },
            { name: '진심 표현', episodes: [29, 30, 31, 32], theme: 'true_feelings' },
            { name: '결말', episodes: [33, 34, 35, 36], theme: 'conclusion' }
        ];

        for (let i = 0; i < chapters.length; i++) {
            const chapter = chapters[i];
            for (const episodeNum of chapter.episodes) {
                this.episodeMap.set(episodeNum, {
                    number: episodeNum,
                    chapter: i + 1,
                    chapterName: chapter.name,
                    theme: chapter.theme,
                    isChapterStart: episodeNum === chapter.episodes[0],
                    isChapterEnd: episodeNum === chapter.episodes[chapter.episodes.length - 1],
                    requiredAffection: this.getRequiredAffection(episodeNum),
                    specialEvents: this.getSpecialEvents(episodeNum)
                });
            }
        }
    }

    // 필요 호감도 계산
    getRequiredAffection(episodeNum) {
        // 에피소드별 최소 요구 호감도
        if (episodeNum <= 8) return 0;           // 1-2챕터: 제한 없음
        if (episodeNum <= 16) return 30;         // 3-4챕터: 30 이상
        if (episodeNum <= 24) return 50;         // 5-6챕터: 50 이상
        if (episodeNum <= 32) return 70;         // 7-8챕터: 70 이상
        return 80;                               // 9챕터: 80 이상
    }

    // 특별 이벤트 정의
    getSpecialEvents(episodeNum) {
        const specialEvents = {
            4: ['주관식_질문_1'], // 첫 번째 주관식 질문
            8: ['주관식_질문_2'], // 두 번째 주관식 질문
            12: ['주관식_질문_3', '친밀도_체크'], // 세 번째 + 친밀도 체크
            16: ['갈등_해결'], // 갈등 해결 이벤트
            20: ['관계_발전'], // 관계 발전 체크
            24: ['마음_고백_기회'], // 마음 고백 기회
            28: ['시련_극복'], // 시련 극복
            32: ['진심_확인'], // 진심 확인
            36: ['엔딩_결정'] // 최종 엔딩 결정
        };
        
        return specialEvents[episodeNum] || [];
    }

    // 스토리 분기점 설정
    setupStoryBranches() {
        this.storyBranches = [
            {
                episode: 12,
                condition: (gameState) => gameState.affection >= 60,
                trueRoute: 'romantic_path',
                falseRoute: 'friendship_path',
                description: '로맨틱 루트 vs 친구 루트 분기점'
            },
            {
                episode: 20,
                condition: (gameState) => gameState.affection >= 80,
                trueRoute: 'deep_love',
                falseRoute: 'casual_dating',
                description: '깊은 사랑 vs 연인 관계 분기점'
            },
            {
                episode: 28,
                condition: (gameState) => this.endingFlags.has('overcome_trial'),
                trueRoute: 'happy_ending',
                falseRoute: 'bittersweet_ending',
                description: '해피엔딩 vs 씁쓸한 엔딩 분기점'
            }
        ];
    }

    // 엔딩 조건 설정
    setupEndingConditions() {
        this.endingConditions = {
            'perfect_ending': {
                requiredAffection: 95,
                requiredFlags: ['overcome_trial', 'true_love', 'mutual_understanding'],
                description: '완벽한 사랑 엔딩'
            },
            'happy_ending': {
                requiredAffection: 85,
                requiredFlags: ['romantic_path', 'heart_confirmed'],
                description: '행복한 연인 엔딩'
            },
            'sweet_ending': {
                requiredAffection: 70,
                requiredFlags: ['romantic_path'],
                description: '달콤한 시작 엔딩'
            },
            'friendship_ending': {
                requiredAffection: 50,
                requiredFlags: ['friendship_path'],
                description: '소중한 친구 엔딩'
            },
            'distant_ending': {
                requiredAffection: 30,
                requiredFlags: [],
                description: '아쉬운 이별 엔딩'
            }
        };
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        gameArch.on('choiceCompleted', (event) => {
            this.handleEpisodeProgress(event.detail);
        });

        gameArch.on('specialEventTriggered', (event) => {
            this.handleSpecialEvent(event.detail);
        });
    }

    // 에피소드 진행 처리
    async handleEpisodeProgress(data) {
        try {
            const { choiceNumber, gameState } = data;
            
            // 현재 에피소드 업데이트
            this.currentEpisode = Math.ceil(choiceNumber / 3);
            
            // 진행률 계산
            const progressPercent = (choiceNumber / 36) * 100;
            
            // 에피소드 정보 가져오기
            const episodeInfo = this.episodeMap.get(this.currentEpisode);
            
            if (!episodeInfo) {
                console.warn('⚠️ 알 수 없는 에피소드:', this.currentEpisode);
                return;
            }

            // 호감도 체크
            const canProceed = this.checkAffectionRequirement(episodeInfo, gameState);
            if (!canProceed) {
                gameArch.emit('episodeBlocked', {
                    episode: this.currentEpisode,
                    required: episodeInfo.requiredAffection,
                    current: gameState.affection
                });
                return;
            }

            // 분기점 체크
            const branchResult = this.checkStoryBranches(gameState);
            if (branchResult) {
                gameArch.emit('storyBranchTriggered', branchResult);
            }

            // 특별 이벤트 체크
            if (episodeInfo.specialEvents.length > 0) {
                for (const eventType of episodeInfo.specialEvents) {
                    await this.triggerSpecialEvent(eventType, gameState);
                }
            }

            // 엔딩 체크 (마지막 에피소드)
            if (this.currentEpisode >= 36) {
                const ending = this.determineEnding(gameState);
                gameArch.emit('gameEnding', ending);
            }

            // 진행 상황 업데이트
            gameArch.emit('episodeProgress', {
                currentEpisode: this.currentEpisode,
                episodeInfo: episodeInfo,
                progressPercent: progressPercent,
                canProceed: canProceed
            });

        } catch (error) {
            console.error('❌ 에피소드 진행 처리 실패:', error);
        }
    }

    // 호감도 요구사항 체크
    checkAffectionRequirement(episodeInfo, gameState) {
        return gameState.affection >= episodeInfo.requiredAffection;
    }

    // 스토리 분기점 체크
    checkStoryBranches(gameState) {
        for (const branch of this.storyBranches) {
            if (this.currentEpisode === branch.episode) {
                const result = branch.condition(gameState);
                const selectedRoute = result ? branch.trueRoute : branch.falseRoute;
                
                // 분기 기록
                this.recordBranch(branch.episode, selectedRoute, result);
                
                return {
                    episode: branch.episode,
                    route: selectedRoute,
                    condition: result,
                    description: branch.description
                };
            }
        }
        return null;
    }

    // 분기 기록
    recordBranch(episode, route, conditionResult) {
        this.storyBranches.push({
            episode: episode,
            route: route,
            condition: conditionResult,
            timestamp: Date.now()
        });
        
        // 플래그 설정
        this.endingFlags.add(route);
    }

    // 특별 이벤트 트리거
    async triggerSpecialEvent(eventType, gameState) {
        const eventHandlers = {
            '주관식_질문_1': () => this.triggerSubjectiveQuestion(1, gameState),
            '주관식_질문_2': () => this.triggerSubjectiveQuestion(2, gameState),
            '주관식_질문_3': () => this.triggerSubjectiveQuestion(3, gameState),
            '친밀도_체크': () => this.checkIntimacyLevel(gameState),
            '갈등_해결': () => this.triggerConflictResolution(gameState),
            '관계_발전': () => this.checkRelationshipDevelopment(gameState),
            '마음_고백_기회': () => this.triggerConfessionOpportunity(gameState),
            '시련_극복': () => this.triggerTrialOvercoming(gameState),
            '진심_확인': () => this.confirmTrueFeelings(gameState),
            '엔딩_결정': () => this.finalizeEnding(gameState)
        };

        const handler = eventHandlers[eventType];
        if (handler) {
            await handler();
        }
    }

    // 주관식 질문 트리거
    triggerSubjectiveQuestion(questionNumber, gameState) {
        const questions = {
            1: `${gameState.currentCharacter?.name}와 함께 있을 때 어떤 기분이 드시나요?`,
            2: `지금까지의 대화에서 가장 기억에 남는 순간은 무엇인가요?`,
            3: `앞으로 ${gameState.currentCharacter?.name}와 어떤 관계가 되고 싶으신가요?`
        };

        gameArch.emit('subjectiveQuestion', {
            questionNumber: questionNumber,
            question: questions[questionNumber],
            episode: this.currentEpisode
        });
    }

    // 엔딩 결정
    determineEnding(gameState) {
        for (const [endingType, condition] of Object.entries(this.endingConditions)) {
            if (gameState.affection >= condition.requiredAffection) {
                const hasRequiredFlags = condition.requiredFlags.every(flag => 
                    this.endingFlags.has(flag)
                );
                
                if (hasRequiredFlags) {
                    return {
                        type: endingType,
                        description: condition.description,
                        affection: gameState.affection,
                        flags: Array.from(this.endingFlags)
                    };
                }
            }
        }

        // 기본 엔딩
        return {
            type: 'normal_ending',
            description: '평범한 엔딩',
            affection: gameState.affection,
            flags: Array.from(this.endingFlags)
        };
    }

    // 현재 진행 상황 조회
    getCurrentProgress() {
        return {
            currentEpisode: this.currentEpisode,
            totalEpisodes: 36,
            progressPercent: (this.currentEpisode / 36) * 100,
            currentChapter: Math.ceil(this.currentEpisode / 4),
            totalChapters: 9,
            storyBranches: this.storyBranches.slice(),
            endingFlags: Array.from(this.endingFlags)
        };
    }

    // 다음 에피소드 정보 조회
    getNextEpisodeInfo() {
        const nextEpisode = this.currentEpisode + 1;
        if (nextEpisode > 36) return null;
        
        return this.episodeMap.get(nextEpisode);
    }
}

// 모듈 인스턴스 생성 및 등록
const episodeFlow = new EpisodeFlow();
gameArch.registerModule('episodeFlow', episodeFlow);

export default episodeFlow;