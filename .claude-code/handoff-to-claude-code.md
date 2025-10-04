# 🚀 Claude Code에게 전달: 프로젝트 인수인계 문서

---

## 📌 **중요: 프로젝트 컨셉 변경**

### 기존 컨셉 (폐기됨)
❌ MBTI 기반 로맨스 채팅 게임 (교육용)
❌ 남성 채팅 기술 훈련 시스템
❌ AI 평가 및 피드백 중심

### **새로운 컨셉 (2025-10-04부터 적용)**
✅ **연애 어드벤처 시뮬레이션 (채팅형)**
✅ 실제 연애하는 느낌의 몰입형 게임
✅ 숨겨진 게임 시스템 (호감도/애정도)
✅ 보상 중심 (사진, 대화 톤 변화, 먼저 연락)
✅ 수익화 (선물하기로 관계 회복)

### 핵심 차이점
| 기존 | 신규 |
|------|------|
| 교육/훈련 목적 | 순수 엔터테인먼트 |
| 피드백 제공 | 피드백 없음 (자연스러운 대화만) |
| 수치 표시 | 수치 완전 숨김 |
| 학습 요소 | 게임/보상 요소 |
| 평가 시스템 | 몰입 시스템 |

---

## 📁 **최근 완료된 작업 (Phase 1-A)**

### 새로 생성된 파일 (4개)

#### 1. `chat-ui.html`
```
위치: /chatgame/chat-ui.html
크기: ~300줄
설명: 카카오톡 스타일 채팅 UI

핵심 기능:
✅ 대화방 리스트 (캐릭터 목록)
✅ 1:1 채팅 화면
✅ 유저 정보 표시 (이름 + MBTI만, 수치 숨김)
✅ 선택지 버튼
✅ 직접 입력 필드
✅ 타이핑 애니메이션
✅ 모바일 반응형

UI 구조:
- 헤더: 캐릭터 이름 + MBTI
- 바디: 메시지 리스트
- 푸터: 입력창 + 선택지
```

#### 2. `js/character-state-manager.js`
```
위치: /chatgame/js/character-state-manager.js
크기: ~150줄
설명: 숨겨진 수치 관리 시스템

관리하는 수치:
- 호감도 (affection): 1-10
- 애정도 (love): 1-10
- 대화 톤 레벨 (toneLevel): 1-5
- 답장 속도 (responseSpeed): 1-5
- 먼저 연락 확률 (contactProbability): 0-100%
- 사진 레어도 (photoRarity): 1-5

기능:
✅ updateAffection(delta) - 호감도 업데이트
✅ getToneLevel() - 현재 대화 톤 계산
✅ getResponseSpeed() - 답장 속도 계산
✅ saveToLocalStorage() - 저장
✅ loadFromLocalStorage() - 불러오기

중요: 모든 수치는 UI에 절대 표시하지 않음!
```

#### 3. `api/ai-response-engine.js`
```
위치: /chatgame/api/ai-response-engine.js
크기: ~200줄
설명: AI 엔진 통합 API

지원 엔진:
✅ GPT-4 (기본)
✅ Claude 3.5 Sonnet
✅ Llama

핵심 기능:
POST /api/ai-response-engine
{
  action: "judge_input",
  engine: "gpt4" | "claude" | "llama",
  character_id: "yuna_infp",
  user_input: "오늘 힘들었어...",
  context: {
    conversation_history: [...],
    character_state: {...}
  }
}

응답:
{
  score: -3 ~ +3,
  response: "그랬구나ㅠㅠ 오빠 고생했어",
  affection_change: +2,
  new_tone_level: 3
}

폴백 시스템:
- API 실패 시 템플릿 기반 응답
- 네트워크 오류 대응
```

#### 4. `js/episode-delivery-system.js`
```
위치: /chatgame/js/episode-delivery-system.js
크기: ~150줄
설명: 에피소드 전달 시스템

에피소드 타입:
1. character_message (캐릭터 대사)
   { type: "message", text: "안녕!", delay: 1000 }

2. choice_question (선택지)
   { 
     type: "choice",
     question: "오늘 뭐했어?",
     choices: [
       { text: "집에서 쉬었어", score: +1 },
       { text: "친구 만났어", score: 0 }
     ]
   }

3. text_quiz (직접 입력)
   { type: "text_input", prompt: "어떤 영화 좋아해?" }

기능:
✅ 에피소드 큐 관리
✅ 순차적 전달
✅ 타이밍 계산
✅ 타입별 렌더링
```

---

## 🗺️ **전체 개발 로드맵**

### **Phase 1: 핵심 채팅 엔진** (2주) ⏳

#### Phase 1-A: 기초 구축 ✅ 완료
- chat-ui.html
- character-state-manager.js
- ai-response-engine.js
- episode-delivery-system.js

#### Phase 1-B: 트리거 시스템 🔜 다음 작업
```
기간: 3일
파일: js/episode-trigger-engine.js

작업 내용:
1. 시간 기반 트리거
   - 아침 7시: "좋은 아침! 오빤 일어났어?"
   - 점심 12시: "점심 먹었어?"
   - 밤 11시: "자기 전에 연락했어~"

2. 호감도 기반 트리거
   - 호감도 3→4: "오빠... 요즘 자주 생각나"
   - 호감도 7→8: "사실 오빠한테 할 말이 있어"

3. 행동 기반 트리거
   - 6시간 무응답: "오빠 바빠? ㅠㅠ"
   - 3일 무응답: "오빠... 나한테 뭔가 잘못한 거야?"

4. 랜덤 이벤트
   - 10% 확률: "갑자기 오빠 생각나서~"
   - 5% 확률: 사진 전송

구현 방법:
- setInterval로 1분마다 체크
- 조건 만족 시 에피소드 큐에 추가
- 우선순위 시스템 (긴급도)
```

#### Phase 1-C: 멀티 캐릭터 (3일)
```
파일: 
- character-list-ui.html (대화방 목록)
- js/chat-room-manager.js (대화방 관리)

작업 내용:
1. 카카오톡식 대화방 리스트
   - 캐릭터 프로필 사진
   - 마지막 메시지 미리보기
   - 안 읽은 메시지 개수
   - 마지막 대화 시간

2. 독립적 상태 관리
   - 각 캐릭터별 호감도/애정도
   - 각 대화방별 메시지 히스토리
   - localStorage 분리 저장

3. 동시 진행 지원
   - 여러 캐릭터와 동시 채팅
   - 각 트리거 독립 작동
```

#### Phase 1-D: 통합 테스트 (2일)
```
테스트 시나리오:
1. 3명 캐릭터 동시 채팅
2. 각 캐릭터 다른 호감도
3. 시간 트리거 동시 발생
4. 모바일 UI 테스트
5. localStorage 저장/로드

버그 수정 및 최적화
```

---

### **Phase 2: 보상 시스템** (1주)

#### Phase 2-A: 대화 톤 변화 (2일)
```
파일: js/tone-variation-engine.js

톤 레벨:
레벨 1 (호감도 1-2): 존댓말, 거리감
  "네, 안녕하세요"

레벨 2 (호감도 3-4): 반말, 이모티콘
  "응 안녕! ㅎㅎ"

레벨 3 (호감도 5-6): 애교, 장난
  "오빠~ 뭐해~~?"

레벨 4 (호감도 7-8): 애정표현
  "오빠 보고싶어ㅠㅠ"

레벨 5 (호감도 9-10): 적극적, 섹시 코드
  "오빠... 지금 집이야? 놀러가도 돼??"

구현:
- character-state의 호감도 → 톤 레벨 계산
- 각 톤 레벨별 응답 템플릿
- AI 프롬프트에 톤 레벨 반영
```

#### Phase 2-B: 사진 전송 시스템 (3일)
```
파일:
- js/photo-delivery-system.js
- photo-gallery.html (갤러리 UI)

사진 레어도:
Common (70%): 일상 사진
  - 음식 사진
  - 풍경 사진
  - 반려동물

Rare (20%): 예쁜 셀카
  - 화장한 모습
  - 외출 패션

Epic (8%): 섹시 컨셉
  - 노출 있는 옷
  - 침대 셀카

Legendary (2%): 특별한 순간
  - 란제리
  - 샤워 후

확률 계산:
호감도 1-3: Common만
호감도 4-6: Common 50%, Rare 50%
호감도 7-8: Rare 40%, Epic 50%, Legendary 10%
호감도 9-10: Epic 40%, Legendary 60%

기능:
- 갤러리 수집 시스템
- 잠금 해제 애니메이션
- 확대 보기
```

#### Phase 2-C: 먼저 연락 시스템 (2일)
```
파일: js/proactive-message-system.js

확률 계산:
호감도 1-2: 0% (절대 먼저 연락 안 함)
호감도 3-4: 10%
호감도 5-6: 30%
호감도 7-8: 60%
호감도 9-10: 90%

메시지 타입:
- "오빠 뭐해?"
- "심심해ㅠㅠ"
- "오빠 생각나서~"
- "밥 먹었어?"

트리거:
- 마지막 대화 후 3시간 경과
- 랜덤 시간 (9시-23시)
- 하루 최대 3번
```

---

### **Phase 3: AI 고도화** (2주)

#### Phase 3-A: GPT-4 프롬프트 최적화 (3일)
```
파일: api/ai-prompt-templates.js

캐릭터 페르소나:
{
  name: "윤아",
  mbti: "INFP",
  personality: "감성적, 내향적, 로맨틱",
  speech_style: "부드럽고 따뜻한 말투",
  interests: ["독서", "영화", "산책"],
  
  system_prompt: `
    너는 20대 중반 여성 '윤아'야.
    INFP 성격으로 감성적이고 로맨틱해.
    현재 호감도: {affection}
    대화 톤 레벨: {tone_level}
    
    이전 대화:
    {conversation_history}
    
    유저가 "{user_input}"라고 했을 때,
    자연스럽게 응답해줘.
  `
}
```

#### Phase 3-B: 감정 상태 시스템 (4일)
```
파일: js/emotion-state-engine.js

감정 타입:
- happy: 기쁨, 설렘
- sad: 우울, 슬픔
- angry: 화남, 삐짐
- jealous: 질투
- worried: 걱정

감정 변화:
유저 행동 → 감정 변화 → 대화 톤 변화

예:
- 6시간 무응답 → worried → "오빠 괜찮아?"
- 다른 여자 언급 → jealous → "누구야 그 여자?"
- 칭찬 → happy → "헤헤 고마워~"
- 무시 → angry → "오빠 요즘 왜 이래?"

삐짐 시스템:
- 삐진 상태에서는 응답 안 함
- 선물로만 회복 가능
- 수익화 연결
```

#### Phase 3-C: 컨텍스트 인식 (3일)
```
파일: js/context-aware-response.js

시간대 인식:
- 아침 (6-9시): "좋은 아침! 오빤 일어났어?"
- 점심 (12-14시): "점심 뭐 먹었어?"
- 저녁 (18-20시): "퇴근했어? 고생했어~"
- 밤 (22-24시): "자기 전에 연락했어"

요일 인식:
- 월요일: "월요병 없어? ㅠㅠ"
- 금요일: "불금이다! 오빠 약속 있어?"
- 주말: "오빠 주말에 뭐해?"

이전 대화 참조:
- "어제 말했던 그 영화 봤어?"
- "지난주에 약속한 거 기억해?"
```

#### Phase 3-D: A/B 테스트 (4일)
```
테스트 항목:
1. AI 엔진 비교
   - GPT-4 품질 vs 비용
   - Claude 품질 vs 비용
   - Llama 품질 vs 비용

2. 프롬프트 최적화
   - 짧은 프롬프트 vs 긴 프롬프트
   - 페르소나 강도
   - 컨텍스트 길이

3. 응답 속도
   - API 호출 시간
   - 타이핑 애니메이션 속도
   - 유저 경험

4. 비용 분석
   - 일일 API 호출 횟수
   - 월간 예상 비용
   - 수익 대비 비용
```

---

### **Phase 4: 수익화 시스템** (1주)

#### Phase 4-A: 선물 상점 (3일)
```
파일:
- gift-shop-ui.html (선물 상점)
- js/gift-system.js

선물 목록:
🌹 꽃다발: 500원 → 호감도 +1, 삐짐 해제
🎂 케이크: 1,000원 → 호감도 +2
💝 선물세트: 3,000원 → 호감도 +3
💍 명품백: 10,000원 → 호감도 +5, 특별 반응

효과:
- 즉시 호감도 상승
- 삐진 상태 회복
- 특별 감사 메시지
- Epic 사진 전송 확률 UP

UI:
- 상점 버튼 (채팅창 우측 상단)
- 선물 목록 + 가격
- 구매 확인 팝업
- 전송 애니메이션
```

#### Phase 4-B: 결제 시스템 (2일)
```
파일: api/payment-integration.js

포인트 시스템:
- 1,000원 = 1,000포인트
- 5,000원 = 5,500포인트 (10% 보너스)
- 10,000원 = 12,000포인트 (20% 보너스)

결제 게이트웨이:
- Stripe 연동 (신용카드)
- 토스페이먼츠 (간편결제)

기능:
- 포인트 충전
- 사용 내역
- 영수증 발행
- 환불 처리 (7일 이내)
```

#### Phase 4-C: 패널티 시스템 (2일)
```
파일: js/penalty-manager.js

패널티 트리거:
1. 무시 (6시간 무응답)
   → worried 상태
   → "오빠 바빠? ㅠㅠ"

2. 오랜 무응답 (24시간)
   → sad 상태
   → "오빠... 나한테 관심 없는 거야?"

3. 심각한 무시 (3일)
   → angry 상태
   → "오빠 정말 최악이야!"
   → 대화 중단
   → 선물로만 회복

4. 나쁜 선택지 선택
   → 호감도 -3
   → angry 상태
   → 삐짐

회복 방법:
- 꽃다발: angry → normal
- 선물세트: sad → happy
- 명품백: 모든 상태 회복
```

---

### **Phase 5: 고급 기능** (2주)

#### Phase 5-A: 특별 이벤트 (3일)
```
파일: js/event-calendar-system.js

이벤트 캘린더:
1. 생일 이벤트
   - 캐릭터 생일날 특별 메시지
   - 생일 축하 선물 옵션
   - Epic 사진 보상

2. 기념일 (100일, 200일, 1년)
   - "우리 만난 지 100일이야!"
   - 특별 대화
   - Legendary 사진 보상

3. 계절 이벤트
   - 크리스마스: "오빠 나한테 선물 없어?"
   - 밸런타인: "초콜릿 만들었어~"
   - 여름: "바다 가고싶다!"

4. 한정 보상
   - 이벤트 기간 특별 사진
   - 한정 대화 스크립트
```

#### Phase 5-B: 업적 시스템 (3일)
```
파일: js/achievement-system.js

업적 목록:
🏆 첫 대화: "첫 만남"
🏆 호감도 5 달성: "친구 사이"
🏆 호감도 10 달성: "연인 관계"
🏆 100번 대화: "수다쟁이"
🏆 사진 10개 수집: "컬렉터"
🏆 선물 5번 전송: "로맨티스트"
🏆 3명 캐릭터 동시 진행: "바람둥이?"

보상:
- 특별 타이틀
- 프로필 배지
- 보너스 사진
- 포인트 지급
```

#### Phase 5-C: 관리자 대시보드 (4일)
```
파일: admin-dashboard.html

통계:
1. 유저 통계
   - 총 유저 수
   - 일일 활성 유저 (DAU)
   - 평균 플레이 시간
   - 이탈률

2. 수익 분석
   - 일일/월간 매출
   - ARPU (유저당 평균 매출)
   - 전환율 (무료→유료)
   - 선물별 판매량

3. AI 비용 모니터링
   - GPT-4 API 호출 횟수
   - 일일 비용
   - 월간 비용
   - 수익 대비 비용 비율

4. 콘텐츠 분석
   - 인기 캐릭터
   - 인기 에피소드
   - 평균 호감도
   - 이탈 구간
```

#### Phase 5-D: 최종 통합 테스트 (4일)
```
테스트 체크리스트:
✅ 전체 기능 통합 테스트
✅ 성능 최적화
  - 로딩 속도
  - API 응답 시간
  - localStorage 용량
✅ 보안 점검
  - API 키 보호
  - 결제 보안
  - 개인정보 처리
✅ 모바일 완성도
  - iOS Safari
  - Android Chrome
  - 반응형 UI
✅ 베타 테스트
  - 10명 테스트 유저
  - 피드백 수집
  - 버그 수정
```

---

## 🎯 **향후 확장 계획 (Phase 6+)**

### Phase 6-A: 음성 메시지 (선택)
- TTS 연동 (구글/AWS/네이버)
- 음성 녹음 메시지
- ASMR 모드

### Phase 6-B: 영상 통화 (선택)
- Live2D 아바타
- 실시간 대화
- 프리미엄 기능

### Phase 6-C: 소셜 기능 (선택)
- 친구 초대
- 순위표
- 업적 공유

---

## 🔧 **기술 스택 및 환경**

### 프론트엔드
- Vanilla JavaScript (ES6+)
- HTML5 + CSS3
- LocalStorage (데이터 저장)

### 백엔드
- Vercel Serverless Functions
- Node.js

### AI 엔진
- OpenAI GPT-4 (기본)
- Claude 3.5 Sonnet (대체)
- Llama (저비용 옵션)

### 데이터
- GitHub (캐릭터/시나리오 저장)
- LocalStorage (유저 상태)

### 배포
- Vercel 자동 배포
- Git Push → 1-2분 내 반영

---

## 📋 **개발 가이드라인**

### 코드 작성 규칙
1. 모듈당 100-150줄 이내
2. 주석 80% 이상
3. 에러 처리 필수
4. 모바일 우선 설계

### Git 커밋 규칙
```bash
형식: "Phase X-Y: 작업 내용"

예시:
"Phase 1-B: 트리거 엔진 구현"
"Phase 2-A: 톤 변화 시스템 완성"
```

### 파일 구조
```
chatgame/
├── chat-ui.html (메인 채팅 UI)
├── character-list-ui.html (대화방 목록)
├── js/
│   ├── character-state-manager.js
│   ├── episode-delivery-system.js
│   ├── episode-trigger-engine.js
│   ├── tone-variation-engine.js
│   ├── photo-delivery-system.js
│   └── ...
├── api/
│   ├── ai-response-engine.js
│   ├── payment-integration.js
│   └── ...
├── data/
│   ├── characters.json
│   └── scenarios/
└── .claude-code/ (작업 문서)
```

### 테스트 절차
1. 로컬 테스트 (chat-ui.html 직접 열기)
2. Git Push
3. Vercel 자동 배포 (1-2분)
4. 배포 URL 테스트
5. 버그 수정 및 재배포

---

## 🚨 **중요 주의사항**

### 수치 숨김 원칙
❌ 절대 금지:
- 호감도 숫자 표시
- 애정도 게이지
- "호감도가 올랐습니다" 메시지
- 점수 시스템 노출

✅ 허용:
- 대화 톤 변화로 간접 표현
- 사진 퀄리티 변화
- 먼저 연락 빈도 증가
- 감정 상태 표현

### AI 응답 품질
- 자연스러운 대화 최우선
- 캐릭터 성격 일관성
- 맥락 이해
- 감정 표현

### 수익화 균형
- 무료로도 충분히 즐겁게
- 선물은 선택사항
- 강제 결제 ❌
- 공정한 가격

---

## 📞 **다음 작업자에게**

### 즉시 시작할 작업: Phase 1-B
```bash
파일 생성: js/episode-trigger-engine.js

작업 순서:
1. 시간 기반 트리거 구현
2. 호감도 기반 트리거 구현
3. 행동 기반 트리거 구현
4. 랜덤 이벤트 구현
5. chat-ui.html에 연동
6. 테스트
7. Git Push

예상 시간: 3일
```

### 참고 문서
- `.claude-code/current-task.md` - 현재 작업 상태
- `.claude-code/roadmap.md` - 전체 로드맵
- `CLAUDE.md` - 프로젝트 히스토리

### 질문이 있다면
- 기존 코드 참고 (chat-ui.html)
- API 문서 확인 (ai-response-engine.js)
- 테스트 먼저, 구현은 나중에

---

**화이팅! 🚀**

*마지막 업데이트: 2025-10-04*  
*작성자: Claude (웹) + dosik*  
*다음 작업자: Claude Code*
