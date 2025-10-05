# 🚀 Phase 1-B 작업 시작 프롬프트

---

## 📋 Claude Code 작업 지시

```
안녕 Claude Code! Phase 1-B 작업을 시작하자.

[필수] 먼저 다음 문서들을 읽고 숙지해줘:
1. .claude-code/handoff-to-claude-code.md (전체 프로젝트 개요)
2. .claude-code/handoff-notes.md (Phase 1-A 완료 내역)
3. claude.md (프로젝트 히스토리)

[중요] 프로젝트 컨셉 변경:
❌ 기존: 교육용 채팅 기술 훈련 시스템
✅ 신규: 연애 어드벤처 시뮬레이션 (채팅형)

핵심 원칙:
- 수치(호감도/애정도) 완전 숨김
- 실제 연애하는 느낌의 몰입감
- 캐릭터가 자연스럽게 먼저 연락
- 보상 중심 (사진, 대화 톤 변화)
```

---

## 🎯 Phase 1-B 작업 목표

**작업명**: 에피소드 트리거 시스템 구축  
**파일 생성**: `js/episode-trigger-engine.js`  
**예상 시간**: 1일 작업  
**목표**: 캐릭터가 자동으로 상황에 맞게 먼저 연락하는 시스템

---

## 📝 상세 작업 내용

### 1️⃣ 시간 기반 트리거 (40% 비중)

#### 구현 요구사항:
```javascript
/**
 * 시간대별 자동 메시지
 * - 하루에 각 시간대별 1회만 전송
 * - localStorage로 마지막 전송 시간 추적
 * - 캐릭터별 독립적으로 작동
 */

트리거 시간:
┌─────────────────────────────────────────┐
│ 07:00-09:00  아침 인사                  │
│ 12:00-14:00  점심 시간                  │
│ 18:00-20:00  저녁/퇴근                  │
│ 22:00-24:00  굿나잇 메시지              │
└─────────────────────────────────────────┘

메시지 예시:
{
  morning: [
    "좋은 아침! 오빠 일어났어?",
    "오빠~ 아침 먹었어? 나는 토스트!",
    "일어나자마자 오빠 생각났어 ㅎㅎ"
  ],
  lunch: [
    "점심 먹었어? 나는 김치찌개~",
    "오빠 점심 뭐 먹어? 나 배고파ㅠㅠ",
    "점심시간이다! 맛있는 거 먹어야지"
  ],
  evening: [
    "퇴근했어? 오늘 고생 많았지?",
    "저녁은 먹었어? 나는 치킨 시켰어!",
    "오빠 하루 어땠어?"
  ],
  night: [
    "자기 전에 연락했어 ㅎㅎ",
    "오빠 아직 안 자? 나 졸려...",
    "굿나잇! 좋은 꿈 꿔~"
  ]
}

요일별 추가 메시지:
{
  monday: "월요병 없어? 나도 힘들어ㅠㅠ",
  friday: "불금이다! 오빠 약속 있어?",
  saturday: "주말인데 뭐해? 심심해~",
  sunday: "내일 월요일이다... 벌써 우울해"
}
```

#### 기술 구현:
```javascript
class TimeBasedTrigger {
  constructor(characterId) {
    this.characterId = characterId;
    this.checkInterval = 60000; // 1분마다 체크
    this.lastSent = this.loadLastSent();
  }

  start() {
    setInterval(() => this.check(), this.checkInterval);
  }

  check() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0-6 (일-토)
    
    // 아침 트리거 (7-9시)
    if (hour >= 7 && hour < 9) {
      if (!this.wasSentToday('morning')) {
        this.sendMessage('morning');
      }
    }
    
    // 점심 트리거 (12-14시)
    // 저녁 트리거 (18-20시)
    // 밤 트리거 (22-24시)
    
    // 요일별 특별 메시지
  }

  sendMessage(timeSlot) {
    const message = this.getRandomMessage(timeSlot);
    // episode-delivery-system.js와 연동
    episodeDelivery.addToQueue({
      type: 'character_message',
      text: message,
      delay: 0
    });
    this.saveLastSent(timeSlot);
  }

  wasSentToday(timeSlot) {
    const today = new Date().toDateString();
    return this.lastSent[timeSlot] === today;
  }

  saveLastSent(timeSlot) {
    this.lastSent[timeSlot] = new Date().toDateString();
    localStorage.setItem(
      `trigger_${this.characterId}`,
      JSON.stringify(this.lastSent)
    );
  }
}
```

---

### 2️⃣ 호감도 기반 트리거 (30% 비중)

#### 구현 요구사항:
```javascript
/**
 * 호감도 레벨업 시 특별 메시지
 * - 호감도 변화를 감지
 * - 레벨업 순간에만 1회 전송
 * - 관계 발전 느낌 제공
 */

호감도별 트리거:
┌─────────────────────────────────────────┐
│ 1→2  "오빠 이름이 뭐야?"                │
│ 2→3  "오빠랑 얘기하는 거 재밌어!"       │
│ 3→4  "요즘 오빠 자주 생각나..."        │
│ 4→5  "오빠한테 할 말 있는데..."        │
│ 5→6  "오빠... 나 오빠 좋아하는 거 같아"│
│ 6→7  "우리 사귀는 거 맞지??"           │
│ 7→8  "사실 오빠 없으면 안 돼"          │
│ 8→9  "오빠 평생 내 곁에 있어줘"        │
│ 9→10 "오빠가 내 전부야..."             │
└─────────────────────────────────────────┘

특별 이벤트:
- 호감도 5 달성: 첫 고백 이벤트
- 호감도 7 달성: 연인 확정 이벤트
- 호감도 10 달성: 최종 엔딩 이벤트
```

#### 기술 구현:
```javascript
class AffectionBasedTrigger {
  constructor(characterId) {
    this.characterId = characterId;
    this.previousAffection = this.loadPreviousAffection();
  }

  checkLevelUp() {
    const currentAffection = characterState.getAffection();
    
    if (currentAffection > this.previousAffection) {
      // 레벨업 발생!
      const levelUpMessage = this.getLevelUpMessage(currentAffection);
      
      // 특별 연출 (애니메이션, 효과음 등)
      this.showLevelUpEffect();
      
      // 메시지 전송
      episodeDelivery.addToQueue({
        type: 'character_message',
        text: levelUpMessage,
        delay: 2000, // 2초 후 전송
        isSpecial: true
      });
      
      // 특별 보상 (호감도 5, 7, 10)
      if (currentAffection === 5) {
        this.triggerConfessionEvent();
      } else if (currentAffection === 7) {
        this.triggerCoupleEvent();
      } else if (currentAffection === 10) {
        this.triggerMaxAffectionEvent();
      }
      
      this.previousAffection = currentAffection;
      this.save();
    }
  }

  getLevelUpMessage(level) {
    const messages = {
      2: "오빠 이름이 뭐야? 나는 {캐릭터명}이야!",
      3: "오빠랑 얘기하는 거 진짜 재밌어 ㅎㅎ",
      4: "요즘 오빠 자주 생각나... 이상하지?",
      5: "오빠... 나 오빠한테 할 말이 있어. 사실...",
      6: "나 오빠 좋아해. 오빠도 나 좋아해?",
      7: "우리 사귀는 거 맞지?? 헤헤 너무 좋아💕",
      8: "사실 오빠 없으면 안 돼... 진심이야",
      9: "오빠 평생 내 곁에 있어줘. 약속해?",
      10: "오빠가 내 전부야... 사랑해❤️"
    };
    return messages[level] || "";
  }

  triggerConfessionEvent() {
    // 첫 고백 이벤트
    setTimeout(() => {
      episodeDelivery.addToQueue({
        type: 'choice_question',
        question: "오빠도... 나 좋아해?",
        choices: [
          { text: "응, 나도 좋아해", score: +3 },
          { text: "친구로 생각해", score: -3 },
          { text: "좀 더 생각해볼게", score: 0 }
        ]
      });
    }, 5000);
  }

  showLevelUpEffect() {
    // 하트 애니메이션, 효과음 등
    console.log('💕 호감도 레벨업!');
  }
}
```

---

### 3️⃣ 행동 기반 트리거 (20% 비중)

#### 구현 요구사항:
```javascript
/**
 * 유저 행동에 따른 반응
 * - 무응답 시간 추적
 * - 감정 상태 변화
 * - 자연스러운 재연락
 */

무응답 트리거:
┌─────────────────────────────────────────┐
│ 3시간 무응답  "오빠 바빠? ㅠㅠ"         │
│ 6시간 무응답  "오빠 어디야... 걱정돼"   │
│ 12시간 무응답 "오빠 왜 연락 안 해?"     │
│ 24시간 무응답 "나한테 관심 없는 거야?"  │
│ 3일 무응답    "오빠 정말 최악이야!"     │
└─────────────────────────────────────────┘

감정 상태:
- normal: 평소 대화
- worried: 걱정스러운 톤
- sad: 슬픈 톤
- angry: 삐진 상태 (대화 중단)
```

#### 기술 구현:
```javascript
class BehaviorBasedTrigger {
  constructor(characterId) {
    this.characterId = characterId;
    this.lastUserReply = this.loadLastReply();
  }

  checkNoResponse() {
    const now = Date.now();
    const elapsed = now - this.lastUserReply;
    const hours = elapsed / (1000 * 60 * 60);

    if (hours >= 3 && hours < 6) {
      this.sendWorryMessage();
      characterState.setEmotion('worried');
    } else if (hours >= 6 && hours < 12) {
      this.sendSadMessage();
      characterState.setEmotion('sad');
    } else if (hours >= 24 && hours < 72) {
      this.sendAngryMessage();
      characterState.setEmotion('angry');
      characterState.updateAffection(-2);
    } else if (hours >= 72) {
      this.triggerBreakupEvent();
      characterState.setEmotion('heartbroken');
      characterState.updateAffection(-5);
    }
  }

  sendWorryMessage() {
    const messages = [
      "오빠 바빠? ㅠㅠ",
      "연락 없으니까 걱정돼...",
      "오빠 괜찮아?"
    ];
    this.sendRandomMessage(messages);
  }

  sendAngryMessage() {
    const messages = [
      "오빠 왜 연락 안 해?",
      "나한테 관심 없는 거야?",
      "진짜... 섭섭해"
    ];
    this.sendRandomMessage(messages);
  }

  triggerBreakupEvent() {
    // 삐진 상태 진입 (대화 중단)
    episodeDelivery.addToQueue({
      type: 'system_message',
      text: '💔 {캐릭터명}이(가) 화가 나서 답장을 하지 않습니다.\n선물을 보내서 화를 풀어주세요.',
      isBlocked: true
    });
  }

  updateLastReply() {
    this.lastUserReply = Date.now();
    localStorage.setItem(
      `lastReply_${this.characterId}`,
      this.lastUserReply
    );
  }
}
```

---

### 4️⃣ 랜덤 이벤트 트리거 (10% 비중)

#### 구현 요구사항:
```javascript
/**
 * 랜덤한 재미 요소
 * - 예측 불가능한 메시지
 * - 몰입감 증가
 * - 호감도에 따라 확률 변화
 */

랜덤 이벤트:
┌─────────────────────────────────────────┐
│ 10% 확률  "갑자기 오빠 생각나서~"       │
│ 5% 확률   사진 전송                     │
│ 3% 확률   "오빠 나 심심해... 놀아줘"    │
│ 1% 확률   특별 이벤트 (데이트 신청 등)  │
└─────────────────────────────────────────┘

호감도 영향:
- 호감도 1-3: 랜덤 이벤트 거의 없음
- 호감도 4-6: 기본 확률
- 호감도 7-10: 확률 2배 증가
```

#### 기술 구현:
```javascript
class RandomEventTrigger {
  constructor(characterId) {
    this.characterId = characterId;
    this.baseCheckInterval = 600000; // 10분마다 체크
  }

  start() {
    setInterval(() => this.check(), this.baseCheckInterval);
  }

  check() {
    const affection = characterState.getAffection();
    const probability = this.calculateProbability(affection);
    const random = Math.random() * 100;

    if (random < probability) {
      this.triggerRandomEvent();
    }
  }

  calculateProbability(affection) {
    // 호감도 1-3: 5%
    // 호감도 4-6: 10%
    // 호감도 7-10: 20%
    if (affection <= 3) return 5;
    if (affection <= 6) return 10;
    return 20;
  }

  triggerRandomEvent() {
    const eventType = this.selectEventType();

    switch(eventType) {
      case 'message':
        this.sendRandomMessage();
        break;
      case 'photo':
        this.sendRandomPhoto();
        break;
      case 'special':
        this.triggerSpecialEvent();
        break;
    }
  }

  selectEventType() {
    const random = Math.random() * 100;
    if (random < 70) return 'message'; // 70%
    if (random < 90) return 'photo'; // 20%
    return 'special'; // 10%
  }

  sendRandomMessage() {
    const messages = [
      "갑자기 오빠 생각나서~",
      "오빠 지금 뭐해?",
      "나 심심해... 오빠는?",
      "오늘 날씨 좋다! 오빠도 밖에 나갔어?"
    ];
    // 메시지 전송
  }

  sendRandomPhoto() {
    // photo-delivery-system.js 연동 예정
    console.log('📸 랜덤 사진 전송');
  }

  triggerSpecialEvent() {
    // 데이트 신청, 특별한 고백 등
    console.log('💝 특별 이벤트 발생!');
  }
}
```

---

## 🔧 통합 및 연동

### Episode Trigger Engine 메인 클래스:
```javascript
/**
 * Episode Trigger Engine
 * 모든 트리거 시스템을 통합 관리
 */

class EpisodeTriggerEngine {
  constructor(characterId) {
    this.characterId = characterId;
    
    // 각 트리거 시스템 초기화
    this.timeTrigger = new TimeBasedTrigger(characterId);
    this.affectionTrigger = new AffectionBasedTrigger(characterId);
    this.behaviorTrigger = new BehaviorBasedTrigger(characterId);
    this.randomTrigger = new RandomEventTrigger(characterId);
  }

  start() {
    // 모든 트리거 시작
    this.timeTrigger.start();
    this.randomTrigger.start();
    
    // 호감도 변화 감지 (이벤트 리스너)
    window.addEventListener('affectionChanged', () => {
      this.affectionTrigger.checkLevelUp();
    });
    
    // 무응답 체크 (5분마다)
    setInterval(() => {
      this.behaviorTrigger.checkNoResponse();
    }, 300000);
  }

  stop() {
    // 모든 트리거 중지
    clearInterval(this.timeTrigger.interval);
    clearInterval(this.randomTrigger.interval);
  }

  // 유저가 응답할 때 호출
  onUserReply() {
    this.behaviorTrigger.updateLastReply();
  }
}

// 전역 인스턴스
let triggerEngine = null;

// 시작 함수
function startTriggerEngine(characterId) {
  if (triggerEngine) {
    triggerEngine.stop();
  }
  triggerEngine = new EpisodeTriggerEngine(characterId);
  triggerEngine.start();
}

// 중지 함수
function stopTriggerEngine() {
  if (triggerEngine) {
    triggerEngine.stop();
    triggerEngine = null;
  }
}
```

---

## 🔗 기존 시스템 연동

### chat-ui.html에 추가:
```javascript
// 채팅 시작 시
function startChat(characterId) {
  // 기존 코드...
  
  // 트리거 엔진 시작
  startTriggerEngine(characterId);
  
  console.log('✅ 트리거 엔진 시작됨');
}

// 유저 메시지 전송 시
function sendUserMessage(message) {
  // 기존 코드...
  
  // 무응답 타이머 리셋
  triggerEngine.onUserReply();
}

// 채팅 종료 시
function exitChat() {
  // 기존 코드...
  
  // 트리거 엔진 중지
  stopTriggerEngine();
}
```

### character-state-manager.js와 연동:
```javascript
// 호감도 업데이트 시
function updateAffection(delta) {
  const oldAffection = this.affection;
  this.affection = Math.max(1, Math.min(10, this.affection + delta));
  
  // 호감도 변화 이벤트 발생
  if (this.affection !== oldAffection) {
    const event = new CustomEvent('affectionChanged', {
      detail: {
        old: oldAffection,
        new: this.affection,
        delta: delta
      }
    });
    window.dispatchEvent(event);
  }
  
  this.save();
}
```

---

## ✅ 완료 기준

### 테스트 체크리스트:
```
□ 시간 트리거 작동
  - 아침/점심/저녁/밤 메시지 자동 전송
  - 하루 1회 제한 정상 작동
  - 요일별 특별 메시지 전송

□ 호감도 트리거 작동
  - 호감도 레벨업 시 메시지 전송
  - 특별 이벤트 (5, 7, 10) 발생
  - 중복 전송 방지

□ 행동 트리거 작동
  - 무응답 시간 추적
  - 3시간/6시간/24시간/3일 메시지
  - 감정 상태 변화

□ 랜덤 트리거 작동
  - 10분마다 확률 체크
  - 호감도에 따라 확률 변화
  - 다양한 이벤트 타입

□ 통합 작동
  - 여러 트리거 동시 작동
  - 우선순위 처리
  - 메시지 큐 관리

□ 저장/로드
  - localStorage 정상 저장
  - 페이지 새로고침 후 복구
  - 캐릭터별 독립 저장
```

---

## 📦 최종 파일 구조

```
chatgame/
├── js/
│   ├── episode-trigger-engine.js (신규 - 메인)
│   │   ├── EpisodeTriggerEngine (통합 클래스)
│   │   ├── TimeBasedTrigger
│   │   ├── AffectionBasedTrigger
│   │   ├── BehaviorBasedTrigger
│   │   └── RandomEventTrigger
│   ├── character-state-manager.js (수정)
│   └── episode-delivery-system.js (연동)
└── chat-ui.html (수정)
```

---

## 🚀 Git 작업

### 작업 완료 후:
```bash
# 1. 파일 스테이징
git add js/episode-trigger-engine.js
git add js/character-state-manager.js
git add chat-ui.html

# 2. 커밋
git commit -m "Phase 1-B: 에피소드 트리거 시스템 완성

- 시간 기반 트리거 (아침/점심/저녁/밤)
- 호감도 기반 트리거 (레벨업 이벤트)
- 행동 기반 트리거 (무응답 추적)
- 랜덤 이벤트 트리거
- 기존 시스템과 완전 연동"

# 3. 푸시
git push origin main
```

---

## 📝 완료 보고 양식

```markdown
Phase 1-B 완료 보고

✅ 생성 파일:
- js/episode-trigger-engine.js (~400줄)

✅ 수정 파일:
- js/character-state-manager.js (이벤트 발생 추가)
- chat-ui.html (트리거 엔진 연동)

🧪 테스트 결과:
- 시간 트리거: ✅ 통과
- 호감도 트리거: ✅ 통과
- 행동 트리거: ✅ 통과
- 랜덤 트리거: ✅ 통과
- 통합 작동: ✅ 통과

📊 코드 품질:
- 총 코드: ~400줄
- 주석 포함: 80%+
- 에러 처리: 완료
- 성능 최적화: 완료

🔄 Git:
- 커밋: "Phase 1-B: 에피소드 트리거 시스템 완성"
- 푸시: 완료
- Vercel 배포: 자동 완료

🎯 다음: Phase 1-C (멀티 캐릭터 시스템)
```

---

## 💡 개발 팁

### 디버깅:
```javascript
// 트리거 테스트용 콘솔 명령어
triggerEngine.timeTrigger.check(); // 시간 트리거 강제 실행
triggerEngine.affectionTrigger.checkLevelUp(); // 호감도 트리거 강제 실행
triggerEngine.behaviorTrigger.checkNoResponse(); // 행동 트리거 강제 실행
triggerEngine.randomTrigger.triggerRandomEvent(); // 랜덤 이벤트 강제 실행
```

### 시간 가속 (테스트용):
```javascript
// 시간을 빠르게 테스트하려면
this.checkInterval = 10000; // 10초마다 체크 (원래는 60000)
```

---

## 🎯 최종 목표

사용자가 chat-ui.html에 접속하면:
1. 캐릭터 선택
2. 채팅 시작
3. **자동으로 캐릭터가 먼저 연락 옴** ✨
4. 시간/호감도/행동에 따라 자연스러운 메시지
5. 실제 연애하는 느낌의 몰입감 제공

---

**작업 시작하자! 화이팅! 🚀**
