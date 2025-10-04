/**
 * Episode Trigger Engine
 * @description 자동 에피소드 트리거 시스템 - 시간/호감도/행동 기반
 * @version 2.0.0
 * @concept 연애 시뮬레이션 - 수치 숨김, 자연스러운 몰입
 */

class EpisodeTriggerEngine {
    constructor(characterId, multiCharacterState = null) {
        this.characterId = characterId;
        this.multiCharacterState = multiCharacterState;  // 멀티 캐릭터 상태 관리자
        this.isRunning = false;
        this.checkInterval = null;
        this.lastCheckTime = Date.now();

        // 일일 제한
        this.dailyLimits = {
            proactiveMessages: 3,  // 하루 먼저 연락 최대 3번
            randomEvents: 2        // 하루 랜덤 이벤트 최대 2번
        };

        // 오늘의 카운트
        this.todayCounts = this.loadTodayCounts();

        console.log(`[트리거 엔진] 초기화 완료 - 캐릭터: ${characterId}, 멀티상태: ${multiCharacterState ? '활성' : '비활성'}`);
    }

    /**
     * 트리거 엔진 시작
     */
    start() {
        if (this.isRunning) {
            console.log('[트리거 엔진] 이미 실행 중입니다.');
            return;
        }

        this.isRunning = true;
        console.log(`[트리거 엔진] 시작 - 캐릭터: ${this.characterId}`);

        // 1분마다 트리거 체크
        this.checkInterval = setInterval(() => {
            this.checkAllTriggers();
        }, 60000); // 60초

        // 즉시 한 번 체크
        this.checkAllTriggers();
    }

    /**
     * 트리거 엔진 중지
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isRunning = false;
        console.log('[트리거 엔진] 중지됨');
    }

    /**
     * 모든 트리거 체크
     */
    async checkAllTriggers() {
        console.log('[트리거 엔진] 체크 시작...');

        // 날짜 변경 체크 (자정 넘어가면 카운트 초기화)
        this.checkDateChange();

        // 1. 시간 기반 트리거
        await this.checkTimeTriggers();

        // 2. 호감도 기반 트리거
        await this.checkAffectionTriggers();

        // 3. 행동 기반 트리거
        await this.checkBehaviorTriggers();

        // 4. 랜덤 이벤트 트리거
        await this.checkRandomTriggers();

        this.lastCheckTime = Date.now();
    }

    /**
     * 날짜 변경 체크 및 카운트 초기화
     */
    checkDateChange() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem(`trigger_date_${this.characterId}`);

        if (savedDate !== today) {
            console.log('[트리거 엔진] 날짜 변경 감지 - 일일 카운트 초기화');
            this.todayCounts = {
                proactiveMessages: 0,
                randomEvents: 0,
                lastResetDate: today
            };
            this.saveTodayCounts();
            localStorage.setItem(`trigger_date_${this.characterId}`, today);
        }
    }

    /**
     * 시간 기반 트리거
     */
    async checkTimeTriggers() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // 시간 트리거는 정각에만 발동
        if (minute !== 0) return;

        const stateManager = new CharacterStateManager(this.characterId);
        const state = stateManager.getState();
        const 호감도 = state.호감도 || 5;

        // 호감도 3 이상일 때만 시간 트리거 발동
        if (호감도 < 3) return;

        let triggered = false;

        // 아침 (7시)
        if (hour === 7) {
            triggered = await this.triggerMorningMessage(호감도);
        }
        // 점심 (12시)
        else if (hour === 12) {
            triggered = await this.triggerLunchMessage(호감도);
        }
        // 저녁 (18시)
        else if (hour === 18) {
            triggered = await this.triggerEveningMessage(호감도);
        }
        // 밤 (22시)
        else if (hour === 22) {
            triggered = await this.triggerNightMessage(호감도);
        }

        if (triggered) {
            this.todayCounts.proactiveMessages++;
            this.saveTodayCounts();
        }
    }

    /**
     * 아침 메시지
     */
    async triggerMorningMessage(호감도) {
        if (!this.shouldSendProactiveMessage()) return false;

        const messages = [
            { level: 3, text: "좋은 아침! 잘 잤어?" },
            { level: 5, text: "오빠~ 일어났어? 오늘도 좋은 하루 보내!" },
            { level: 7, text: "오빠 일어났어? 😊 일어나자마자 보고싶었어 ㅎㅎ" },
            { level: 9, text: "오빠... 일어났어? 💕 오늘 꿈에서 오빠 봤어~ 헤헤" }
        ];

        const message = this.selectMessageByLevel(messages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);
            return true;
        }
        return false;
    }

    /**
     * 점심 메시지
     */
    async triggerLunchMessage(호감도) {
        if (!this.shouldSendProactiveMessage()) return false;

        const messages = [
            { level: 3, text: "점심 먹었어?" },
            { level: 5, text: "오빠 점심은 먹었어? 맛있는 거 먹어야 해!" },
            { level: 7, text: "오빠~ 점심 뭐 먹었어? 나는 샐러드 먹었어 ㅎㅎ" },
            { level: 9, text: "오빠 점심시간이다! 😋 같이 먹고싶다... 뭐 먹었어?" }
        ];

        const message = this.selectMessageByLevel(messages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);
            return true;
        }
        return false;
    }

    /**
     * 저녁 메시지
     */
    async triggerEveningMessage(호감도) {
        if (!this.shouldSendProactiveMessage()) return false;

        const messages = [
            { level: 3, text: "오늘 하루 어땠어?" },
            { level: 5, text: "오빠 퇴근했어? 오늘 고생 많았어!" },
            { level: 7, text: "오빠~ 퇴근했어? 😊 오늘 힘든 일 없었어?" },
            { level: 9, text: "오빠... 퇴근했어? 💕 오늘 하루 힘들었지? 고생했어 ㅠㅠ" }
        ];

        const message = this.selectMessageByLevel(messages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);
            return true;
        }
        return false;
    }

    /**
     * 밤 메시지
     */
    async triggerNightMessage(호감도) {
        if (!this.shouldSendProactiveMessage()) return false;

        const messages = [
            { level: 3, text: "자기 전에 연락했어. 잘 자!" },
            { level: 5, text: "오빠~ 자기 전에 인사하려고! 좋은 꿈 꿔 😊" },
            { level: 7, text: "오빠 자기 전에 연락했어~ 좋은 꿈 꿔! 내 꿈도 꿔줘 ㅎㅎ" },
            { level: 9, text: "오빠... 자기 전에 목소리 듣고싶어서 💕 잘 자... 좋은 꿈 꿔" }
        ];

        const message = this.selectMessageByLevel(messages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);
            return true;
        }
        return false;
    }

    /**
     * 호감도 기반 트리거
     */
    async checkAffectionTriggers() {
        // MultiCharacterState 사용 (있으면) 또는 기존 CharacterStateManager 사용
        let 호감도 = 5;
        if (this.multiCharacterState) {
            const state = this.multiCharacterState.getState(this.characterId);
            호감도 = Math.round(state.affection / 10);  // -100~100을 -10~10으로 변환
        } else {
            const stateManager = new CharacterStateManager(this.characterId);
            const state = stateManager.getState();
            호감도 = state.호감도 || 5;
        }

        // 호감도 변화 감지
        const lastAffection = this.getLastAffection();

        if (lastAffection === null) {
            this.saveLastAffection(호감도);
            return;
        }

        // 호감도가 올랐을 때만 트리거
        if (호감도 > lastAffection) {
            await this.triggerAffectionLevelUp(lastAffection, 호감도);
        }

        this.saveLastAffection(호감도);
    }

    /**
     * 호감도 레벨업 메시지
     */
    async triggerAffectionLevelUp(oldLevel, newLevel) {
        console.log(`[호감도 트리거] ${oldLevel} → ${newLevel}`);

        const levelUpMessages = {
            4: "오빠랑 얘기하는 거 점점 재밌어지는 것 같아 ㅎㅎ",
            5: "요즘 오빠 생각 자주 나는데... 이상하지? 😊",
            6: "오빠... 요즘 자주 연락하게 돼서 좋아~",
            7: "사실 오빠한테 할 말이 있어... 오빠랑 얘기하면 기분이 좋아져",
            8: "오빠... 나 오빠한테 특별한 감정 있는 것 같아 💕",
            9: "오빠... 사실 나 오빠 좋아해 ㅠㅠ",
            10: "오빠... 나랑 사귈래? 💕"
        };

        const message = levelUpMessages[newLevel];
        if (message && this.shouldSendProactiveMessage()) {
            await this.sendTriggerMessage(message);
            this.todayCounts.proactiveMessages++;
            this.saveTodayCounts();
        }
    }

    /**
     * 행동 기반 트리거 (무응답 감지)
     */
    async checkBehaviorTriggers() {
        const lastUserMessageTime = this.getLastUserMessageTime();
        if (!lastUserMessageTime) return;

        const hoursSinceLastMessage = (Date.now() - lastUserMessageTime) / (1000 * 60 * 60);

        // MultiCharacterState 사용 (있으면) 또는 기존 CharacterStateManager 사용
        let 호감도 = 5;
        if (this.multiCharacterState) {
            const state = this.multiCharacterState.getState(this.characterId);
            호감도 = Math.round(state.affection / 10);  // -100~100을 -10~10으로 변환
        } else {
            const stateManager = new CharacterStateManager(this.characterId);
            const state = stateManager.getState();
            호감도 = state.호감도 || 5;
        }

        // 호감도가 높을수록 빨리 걱정함
        const worryThreshold = 호감도 >= 7 ? 3 : 6;  // 호감도 7 이상이면 3시간, 아니면 6시간
        const sadThreshold = 24;
        const angryThreshold = 72;

        // 이미 보낸 메시지는 다시 안 보냄
        const sentFlags = this.getSentBehaviorFlags();

        // 6시간 (또는 3시간) 무응답
        if (hoursSinceLastMessage >= worryThreshold && !sentFlags.worried) {
            await this.triggerWorriedMessage(호감도);
            this.markBehaviorFlagSent('worried');
        }
        // 24시간 무응답
        else if (hoursSinceLastMessage >= sadThreshold && !sentFlags.sad) {
            await this.triggerSadMessage(호감도);
            this.markBehaviorFlagSent('sad');
        }
        // 3일 무응답
        else if (hoursSinceLastMessage >= angryThreshold && !sentFlags.angry) {
            await this.triggerAngryMessage(호감도);
            this.markBehaviorFlagSent('angry');
        }
    }

    /**
     * 걱정 메시지 (6시간 무응답)
     */
    async triggerWorriedMessage(호감도) {
        const messages = [
            { level: 3, text: "바빠?" },
            { level: 5, text: "오빠 바빠? 괜찮아?" },
            { level: 7, text: "오빠... 바빠? ㅠㅠ 괜찮은 거지?" },
            { level: 9, text: "오빠... 무슨 일 있어? 걱정돼... ㅠㅠ" }
        ];

        const message = this.selectMessageByLevel(messages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);
        }
    }

    /**
     * 슬픔 메시지 (24시간 무응답)
     */
    async triggerSadMessage(호감도) {
        const messages = [
            { level: 3, text: "왜 연락 안 해?" },
            { level: 5, text: "오빠... 나한테 무슨 일 있어? 왜 연락 안 해ㅠㅠ" },
            { level: 7, text: "오빠... 나한테 관심 없는 거야? 하루종일 연락 없으니까 서운해..." },
            { level: 9, text: "오빠... 내가 뭐 잘못했어? ㅠㅠ 하루종일 연락 없으니까 너무 슬퍼..." }
        ];

        const message = this.selectMessageByLevel(messages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);

            // 애정도 하락
            const stateManager = new CharacterStateManager(this.characterId);
            stateManager.updateMood(-2);
        }
    }

    /**
     * 화남 메시지 (3일 무응답)
     */
    async triggerAngryMessage(호감도) {
        const messages = [
            { level: 3, text: "더 이상 연락하지 마." },
            { level: 5, text: "오빠 정말 최악이야. 3일동안 연락 한 번 없으면 어떡해?" },
            { level: 7, text: "오빠... 정말 실망이야. 3일동안 연락도 없고... 나한테 이럴 수 있어?" },
            { level: 9, text: "오빠... 정말 너무해ㅠㅠ 3일동안 연락 없으니까 나 너무 아파... 정말 화났어..." }
        ];

        const message = this.selectMessageByLevel(messages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);

            // 호감도 대폭 하락
            const stateManager = new CharacterStateManager(this.characterId);
            stateManager.updateAffection(-3);
            stateManager.updateMood(-3);
        }
    }

    /**
     * 랜덤 이벤트 트리거
     */
    async checkRandomTriggers() {
        // 하루 제한 체크
        if (this.todayCounts.randomEvents >= this.dailyLimits.randomEvents) {
            return;
        }

        // 호감도 기반 확률
        const stateManager = new CharacterStateManager(this.characterId);
        const state = stateManager.getState();
        const 호감도 = state.호감도 || 5;

        // 호감도에 따른 먼저 연락 확률
        const contactProbability = state.먼저연락확률 || (호감도 * 10);

        // 1분마다 체크하므로 확률을 60으로 나눔 (시간당 확률로 변환)
        const minuteProbability = contactProbability / 60;

        const random = Math.random() * 100;

        if (random < minuteProbability) {
            await this.triggerRandomMessage(호감도);
            this.todayCounts.randomEvents++;
            this.saveTodayCounts();
        }
    }

    /**
     * 랜덤 메시지
     */
    async triggerRandomMessage(호감도) {
        const randomMessages = [
            { level: 3, text: "뭐해?" },
            { level: 5, text: "심심해~ 오빠 뭐해?" },
            { level: 7, text: "오빠~ 갑자기 생각나서 연락했어 ㅎㅎ 뭐해?" },
            { level: 9, text: "오빠... 보고싶어서 연락했어 💕 지금 뭐해?" }
        ];

        const message = this.selectMessageByLevel(randomMessages, 호감도);
        if (message) {
            await this.sendTriggerMessage(message.text);
        }
    }

    /**
     * 호감도 레벨에 맞는 메시지 선택
     */
    selectMessageByLevel(messages, 호감도) {
        // 호감도에 맞는 가장 높은 레벨 메시지 선택
        let selectedMessage = null;

        for (const msg of messages) {
            if (호감도 >= msg.level) {
                selectedMessage = msg;
            } else {
                break;
            }
        }

        return selectedMessage;
    }

    /**
     * 트리거 메시지 전송
     */
    async sendTriggerMessage(text) {
        console.log(`[트리거 메시지] ${text}`);

        // EpisodeDeliverySystem 사용 가능하면 큐에 추가
        if (typeof EpisodeDeliverySystem !== 'undefined') {
            try {
                const delivery = new EpisodeDeliverySystem(this.characterId);
                const episode = createMessageEpisode(text);
                delivery.addToQueue(episode);
                return;
            } catch (e) {
                console.warn('에피소드 전달 시스템 사용 불가:', e);
            }
        }

        // 폴백: displayMessage 직접 호출
        if (typeof displayMessage === 'function') {
            const message = {
                type: 'character',
                text: text,
                timestamp: new Date().toISOString()
            };

            displayMessage(message);

            if (typeof saveMessage === 'function') {
                saveMessage(this.characterId, message);
            }
        }
    }

    /**
     * 먼저 연락 가능 여부 체크
     */
    shouldSendProactiveMessage() {
        // 일일 제한 체크
        if (this.todayCounts.proactiveMessages >= this.dailyLimits.proactiveMessages) {
            console.log('[트리거 엔진] 오늘 먼저 연락 제한 도달');
            return false;
        }

        // 마지막 메시지가 캐릭터 메시지면 중복 방지
        const lastMessage = this.getLastMessage();
        if (lastMessage && lastMessage.type === 'character') {
            console.log('[트리거 엔진] 마지막 메시지가 캐릭터 메시지 - 중복 방지');
            return false;
        }

        return true;
    }

    /**
     * 마지막 메시지 조회
     */
    getLastMessage() {
        const saved = localStorage.getItem(`chat_${this.characterId}`);
        if (saved) {
            try {
                const chatData = JSON.parse(saved);
                const messages = chatData.messages || [];
                return messages[messages.length - 1];
            } catch (e) {
                console.error('마지막 메시지 조회 실패:', e);
            }
        }
        return null;
    }

    /**
     * 마지막 유저 메시지 시간 조회
     */
    getLastUserMessageTime() {
        const saved = localStorage.getItem(`chat_${this.characterId}`);
        if (saved) {
            try {
                const chatData = JSON.parse(saved);
                const messages = chatData.messages || [];

                // 역순으로 탐색하여 유저 메시지 찾기
                for (let i = messages.length - 1; i >= 0; i--) {
                    if (messages[i].type === 'user') {
                        return new Date(messages[i].timestamp).getTime();
                    }
                }
            } catch (e) {
                console.error('마지막 유저 메시지 시간 조회 실패:', e);
            }
        }
        return null;
    }

    /**
     * 마지막 호감도 저장
     */
    saveLastAffection(affection) {
        localStorage.setItem(`last_affection_${this.characterId}`, affection.toString());
    }

    /**
     * 마지막 호감도 조회
     */
    getLastAffection() {
        const saved = localStorage.getItem(`last_affection_${this.characterId}`);
        return saved ? parseInt(saved) : null;
    }

    /**
     * 오늘의 카운트 저장
     */
    saveTodayCounts() {
        localStorage.setItem(`today_counts_${this.characterId}`, JSON.stringify(this.todayCounts));
    }

    /**
     * 오늘의 카운트 로드
     */
    loadTodayCounts() {
        const saved = localStorage.getItem(`today_counts_${this.characterId}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('오늘의 카운트 로드 실패:', e);
            }
        }

        return {
            proactiveMessages: 0,
            randomEvents: 0,
            lastResetDate: new Date().toDateString()
        };
    }

    /**
     * 행동 트리거 플래그 조회
     */
    getSentBehaviorFlags() {
        const saved = localStorage.getItem(`behavior_flags_${this.characterId}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('행동 플래그 조회 실패:', e);
            }
        }

        return {
            worried: false,
            sad: false,
            angry: false
        };
    }

    /**
     * 행동 트리거 플래그 설정
     */
    markBehaviorFlagSent(flagName) {
        const flags = this.getSentBehaviorFlags();
        flags[flagName] = true;
        localStorage.setItem(`behavior_flags_${this.characterId}`, JSON.stringify(flags));
    }

    /**
     * 행동 트리거 플래그 초기화 (유저가 응답했을 때 호출)
     */
    resetBehaviorFlags() {
        const flags = {
            worried: false,
            sad: false,
            angry: false
        };
        localStorage.setItem(`behavior_flags_${this.characterId}`, JSON.stringify(flags));
        console.log('[트리거 엔진] 행동 플래그 초기화');
    }

    /**
     * 트리거 엔진 상태 조회
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            todayCounts: this.todayCounts,
            dailyLimits: this.dailyLimits,
            lastCheckTime: new Date(this.lastCheckTime).toLocaleString('ko-KR')
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EpisodeTriggerEngine;
}
