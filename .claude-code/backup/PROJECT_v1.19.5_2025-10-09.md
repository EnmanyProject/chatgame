# 📘 프로젝트 전체 이해 문서

**프로젝트명**: MBTI 메신저 로맨스 시뮬레이션
**타겟**: 남성 전용 (섹시 코드 합법적 범위 허용)
**목적**: 9명의 MBTI 캐릭터와의 동시 메신저 대화 시뮬레이션
**버전**: v1.19.5 (시나리오 + 에피소드 시스템 완성)
**최종 업데이트**: 2025-10-09

## 🌐 테스트 주소 (항상 확인)

**배포 URL**: https://chatgame-seven.vercel.app

**주요 페이지**:
- 메신저 UI: https://chatgame-seven.vercel.app/messenger-ui.html
- 채팅방: https://chatgame-seven.vercel.app/chat-room.html
- 어드민: https://chatgame-seven.vercel.app/scenario-admin.html (비밀번호: a6979)

**⚠️ 작업 완료 시 항상 테스트 주소 제공 필수**

---

## 🎯 게임 컨셉 (핵심 설계)

### 메신저 기반 멀티 대화방 시스템

```
📱 메신저 앱 (카카오톡 스타일)
┌─────────────────────────┐
│  💬 채팅 목록           │
├─────────────────────────┤
│ 😊 미화 (ENFP)         │ ← 대화방 1
│ 최근: 오늘 뭐해? 🤗    │
├─────────────────────────┤
│ 😎 미진 (ESTJ)         │ ← 대화방 2
│ 최근: 잘 지내?         │
├─────────────────────────┤
│ 🤔 소운 (INTP)         │ ← 대화방 3
│ 최근: 재미있는 거...   │
├─────────────────────────┤
│ ... (총 9개 대화방)     │
└─────────────────────────┘
```

### 핵심 철학
- **유저 경험**: "진짜 카카오톡으로 대화하는 것처럼"
- **수치 관리**: 있지만 유저에게 **완전 숨김** (Phase 3 시스템)
- **게임 시스템**: 백그라운드에서 작동
- **자연스러움**: 메신저 대화처럼
- **멀티 대화방**: 9명과 동시 진행

### 타겟 및 방향성
- **타겟**: 남성 only
- **섹시 코드**: 합법적 선에서 허용 (노골적 표현 제외)
- **엔딩**: 7가지 레벨 엔딩 시스템 (Phase 3)
- **진행 방식**: 에피소드 푸쉬를 통한 대화 진행

---

## 🏗️ 시스템 아키텍처

### 전체 구조
```
┌──────────────────────────────────────────────────┐
│              사용자 인터페이스                    │
│  - messenger-ui.html (대화방 리스트) 🆕           │
│  - chat-room.html (개별 채팅방) 🆕                │
│  - scenario-admin.html (관리자)                  │
└───────────────┬──────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────┐
│           에피소드 생성 & 푸쉬 레이어 🆕           │
│  - EpisodeGenerator (캐릭터+시나리오→대화)       │
│  - EpisodePushSystem (대화방에 푸쉬)             │
│  - EpisodeTriggerEngine (자동 트리거)            │
└───────────────┬──────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────┐
│              핵심 엔진 레이어                     │
│  - MultiCharacterState (9명 상태 관리) ⭐        │
│  - GameIntegrationManager (Phase 3 통합) ⭐      │
│  - ToneVariationEngine (톤 변화)                │
│  - PhotoSendingSystem (사진 전송)               │
│  - ProactiveContactSystem (먼저 연락)           │
└───────────────┬──────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────┐
│             Phase 3 시스템 레이어 ⭐              │
│  - StatisticsManager (통계)                     │
│  - AchievementSystem (업적)                     │
│  - EmotionStateSystem (감정)                    │
│  - SpecialEventSystem (이벤트)                  │
│  - ConversationMemorySystem (메모리)            │
│  - EndingManager (엔딩)                         │
└───────────────┬──────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────┐
│              데이터 레이어                        │
│  - characters.json (9명 캐릭터)                  │
│  - scenarios/ (시나리오)                         │
│  - episodes/ (생성된 에피소드) 🆕                 │
│  - tone-templates.json (톤)                     │
│  - character-photos.json (사진)                 │
│  - endings.json (엔딩)                          │
└───────────────┬──────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────┐
│           외부 API 레이어                         │
│  - OpenAI GPT-4 (메시지 분석)                    │
│  - Claude/Llama (시나리오 생성) 🆕                │
│  - GitHub API (데이터 저장)                      │
│  - Vercel (배포)                                 │
└──────────────────────────────────────────────────┘
```

---

## 📁 프로젝트 구조

```
chatgame/
├── 📄 messenger-ui.html              # 🆕 메신저 대화방 리스트
├── 📄 chat-room.html                 # 🆕 개별 채팅방 UI
├── 📄 scenario-admin.html            # 관리자 패널 (비번: a6979)
├── 📄 CLAUDE.md                      # 작업 노트 및 버전 히스토리
│
├── 📂 api/                           # 서버리스 API
│   ├── character-ai-generator.js    # 캐릭터 AI 생성
│   ├── scenario-manager.js          # 시나리오 관리
│   └── episode-manager.js           # ✅ 에피소드 관리 (v2.1.0)
│
├── 📂 data/                          # 데이터베이스
│   ├── characters.json              # 캐릭터 DB (9명)
│   ├── tone-templates.json          # 톤 템플릿 (Phase 2-A)
│   ├── character-photos.json        # 사진 DB (Phase 2-B)
│   ├── endings.json                 # 엔딩 DB (Phase 3)
│   ├── achievements.json            # 업적 DB (Phase 3)
│   ├── special-events.json          # 이벤트 DB (Phase 3)
│   ├── scenarios/                   # 시나리오 DB
│   │   └── scenario-database.json
│   └── episodes/                    # ✅ 에피소드 DB (캐릭터별)
│       ├── 미화_enfp_episodes.json
│       ├── 미진_estj_episodes.json
│       └── ... (캐릭터별 파일)
│
├── 📂 js/                            # 핵심 엔진
│   ├── multi-character-state.js     # 🌟 멀티 캐릭터 상태 (Phase 3 통합)
│   ├── game-integration-manager.js  # 🌟 Phase 3 통합 관리자
│   ├── episode-generator.js         # 🆕 에피소드 생성 엔진
│   ├── episode-push-system.js       # 🆕 대화방 푸쉬 시스템
│   ├── episode-trigger-engine.js    # 자동 트리거
│   ├── tone-variation-engine.js     # 톤 변화 (Phase 2-A)
│   ├── photo-sending-system.js      # 사진 전송 (Phase 2-B)
│   ├── proactive-contact-system.js  # 먼저 연락 (Phase 2-C)
│   │
│   └── 📂 phase3/                   # Phase 3 시스템들
│       ├── statistics-manager.js
│       ├── achievement-system.js
│       ├── emotion-state-system.js
│       ├── special-event-system.js
│       ├── memory-keywords.js
│       ├── conversation-memory-system.js
│       └── ending-system.js
│
└── 📂 .claude-code/                  # Claude Code 전용
    ├── PROJECT.md                   # 👈 이 파일
    ├── MASTER.md                    # 현재 작업 가이드
    └── archive/                     # 완료된 Phase 보관
```

---

## 🎮 게임 시스템 상세

### 1. 메신저 UI 시스템 🆕

#### 대화방 리스트 (messenger-ui.html)
```
┌─────────────────────────┐
│  💬 채팅 (9)            │
├─────────────────────────┤
│ 🔴 미화 (ENFP)         │ ← 읽지 않은 메시지
│ 오늘 뭐해? 🤗          │   2분 전
├─────────────────────────┤
│ 😊 미진 (ESTJ)         │
│ 잘 지내?               │   1시간 전
├─────────────────────────┤
│ ... 총 9개              │
└─────────────────────────┘
```

**기능**:
- 9명 캐릭터 리스트
- 최근 메시지 미리보기
- 읽지 않은 메시지 개수
- 마지막 활동 시간
- Phase 3 통계 요약 (숨김)

#### 개별 채팅방 (chat-room.html)
```
┌─────────────────────────┐
│ ← 미화 (ENFP)      ⚙️  │
├─────────────────────────┤
│                         │
│  안녕! 오늘 뭐해? 🤗    │ ← AI
│                         │
│         나도 심심해 😊 │ ← User
│                         │
│  그럼 같이 뭐 할까? 💕 │ ← AI
│                         │
├─────────────────────────┤
│ [선택지 1]              │
│ [선택지 2]              │
│ [선택지 3]              │
└─────────────────────────┘
```

**기능**:
- 카카오톡 스타일 채팅 UI
- 선택지 표시
- 사진 전송 표시
- Phase 3 시스템 자동 작동

### 2. 에피소드 관리 시스템 (v1.19.5) ✅

#### 시스템 구조
```
scenario-admin.html 통합 관리
├── 🎬 에피소드 관리 탭
│   ├── 에피소드 생성 폼
│   ├── AI 자동 생성 (OpenAI)
│   ├── 에피소드 목록 (카드 뷰)
│   └── 상세보기 모달 (dialogue_flow 표시)
│
├── api/episode-manager.js (v2.1.0)
│   ├── create: 에피소드 생성
│   ├── get: 에피소드 조회
│   ├── delete: 에피소드 삭제
│   └── generate_dialogue: AI 대화 생성
│
└── data/episodes/
    └── {character_id}_episodes.json
```

#### 에피소드 생성 워크플로우
```
1️⃣ 캐릭터 선택
   - 9명 중 선택 (미화_enfp, 미진_estj 등)

2️⃣ 시나리오 템플릿 선택
   - 시나리오 상세 정보 미리보기
   - 제목, 설명, 배경설정, 분위기

3️⃣ 생성 컨텍스트 설정
   - 기본 호감도/친밀도 (0-100)
   - 시나리오 길이 (짧음/보통/김)
   - AI 모델 선택 (gpt-4o-mini/gpt-4o/gpt-4-turbo)

4️⃣ 🤖 AI 자동 생성 클릭
   → OpenAI API 호출
   → dialogue_flow 생성 (3-5개 대화)
   → 4가지 타입: narration, character_dialogue,
                 multiple_choice, free_input

5️⃣ 저장 → GitHub API
   → {character_id}_episodes.json에 저장
```

#### dialogue_flow 구조 (4가지 타입)

**1. narration** (노란색 🟡)
```json
{
  "type": "narration",
  "text": "다음날 아침, 메신저에 메시지가 왔다."
}
```

**2. character_dialogue** (파란색 🔵)
```json
{
  "type": "character_dialogue",
  "dialogue": "어제는... 정말 미안해 😳",
  "emotion": "부끄러움",
  "narration": "미화가 얼굴을 붉히며 말한다."
}
```

**3. multiple_choice** (보라색 🟣)
```json
{
  "type": "multiple_choice",
  "dialogue": "진심이었어?",
  "choices": [
    {
      "text": "진심이었어",
      "affection_impact": 5,
      "intimacy_impact": 3
    }
  ]
}
```

**4. free_input** (초록색 🟢)
```json
{
  "type": "free_input",
  "dialogue": "뭐라고 대답할까?",
  "evaluation_criteria": {
    "affection_keywords": ["좋아해", "사랑해"],
    "intimacy_keywords": ["함께", "같이"],
    "negative_keywords": ["미안", "싫어"]
  }
}
```

#### 완료된 기능 ✅
1. **에피소드 AI 생성**: OpenAI 기반 dialogue_flow 자동 생성
2. **에피소드 CRUD**: 생성/수정/삭제/조회 완전 구현
3. **dialogue_flow 표시**: 4가지 대화 타입 색상 구분 시스템
4. **시나리오 연동**: 시나리오 선택 시 상세 정보 미리보기
5. **상세보기 모달**: 에피소드 전체 내용 및 통계 표시
6. **호감도/친밀도 시스템**: 선택지별 변화량 표시
7. **AI 평가 기준**: 주관식 입력 평가 기준 상세 표시
8. **GitHub API 통합**: 캐릭터별 에피소드 파일 관리

### 3. Phase 3 시스템 (백그라운드)

#### 7개 시스템 자동 작동
1. **StatisticsManager**: 모든 행동 통계 수집
2. **AchievementSystem**: 조건 충족 시 업적 해제
3. **EmotionStateSystem**: MBTI별 감정 자동 변화
4. **SpecialEventSystem**: 특별 이벤트 트리거
5. **ConversationMemorySystem**: 대화 자동 기록 (3계층)
6. **EndingManager**: 엔딩 조건 평가
7. **GameIntegrationManager**: 모든 시스템 통합 관리

#### 사용자는 모름
- 호감도 수치 숨김
- 통계 숨김
- 감정 상태 숨김
- 단, **결과**로 느낌:
  - 말투 변화 (톤 시스템)
  - 사진 전송 (호감도 높을수록 자주)
  - 먼저 연락 (호감도 높을수록 자주)
  - 엔딩 (조건 충족 시)

### 4. 2축 수치 관리 (유저에게 숨김)

#### 1. 호감도 (Affection) -100 ~ +100
- **의미**: 전반적인 친밀도, 호의
- **영향**: 톤 변화, 답장 빈도, 먼저 연락
- **변화**: 대화 선택지로 증감
- **표시**: 절대 보이지 않음

#### 2. 애정도 (Love) -100 ~ +100
- **의미**: 로맨틱한 감정 깊이
- **영향**: 애정 표현 강도, 사진 섹시도
- **변화**: 호감도 기반 + 특정 에피소드
- **표시**: 절대 보이지 않음

---

## 🔄 시나리오 & 에피소드 워크플로우 (v1.19.5)

### 현재 구현 상태 (Phase 4 완료)

```
1️⃣ 캐릭터 생성 (scenario-admin.html - 캐릭터 관리 탭)
   ├─ 기본 정보 입력 (이름, MBTI, 나이 등)
   ├─ 성격 특성 및 외모 설정
   ├─ AI 사진 분석 (OpenAI Vision API)
   └─ GitHub API 저장 (data/characters.json)

2️⃣ 시나리오 생성 (scenario-admin.html - 시나리오 관리 탭)
   ├─ 제목/설명 입력
   ├─ 분위기 선택 (가벼움/보통/진지함)
   ├─ 섹시 레벨 선택 (1-10)
   ├─ 🤖 AI 자동 생성 (기승전결 구조 + 장문 스토리)
   │  ├─ OpenAI GPT-4o-mini 호출
   │  └─ 400-600자 메신저 배경 스토리
   └─ GitHub API 저장 (data/scenarios/)

3️⃣ 에피소드 생성 (scenario-admin.html - 에피소드 관리 탭) ✅
   ├─ 캐릭터 선택 (9명 중)
   ├─ 시나리오 선택 (템플릿)
   ├─ 생성 컨텍스트 설정
   │  ├─ 기본 호감도/친밀도
   │  ├─ 시나리오 길이
   │  └─ AI 모델 선택
   ├─ 🤖 AI 자동 생성
   │  ├─ API (api/episode-manager.js)
   │  ├─ OpenAI API 호출
   │  ├─ dialogue_flow 생성 (3-5개)
   │  └─ 4가지 타입 자동 생성
   ├─ 상세보기 모달 (dialogue_flow 확인)
   │  ├─ 메타데이터 표시
   │  ├─ 4가지 타입 색상 구분
   │  ├─ 호감도/친밀도 변화량
   │  └─ AI 평가 기준
   └─ GitHub API 저장 (data/episodes/{character_id}_episodes.json)

4️⃣ 에피소드 카드 뷰
   ├─ 에피소드 목록 표시
   ├─ 📋 상세보기 버튼 → 모달 표시
   ├─ 🗑️ 삭제 버튼 → GitHub API 삭제
   └─ 실시간 통계 (대화 개수, 선택지 개수 등)
```

### 다음 단계 (Phase 5 - 예정)

```
5️⃣ 메신저 UI 구현 (예정)
   ├─ messenger-ui.html (대화방 리스트)
   ├─ chat-room.html (개별 채팅방)
   └─ 카카오톡 스타일 인터페이스

6️⃣ 에피소드 푸쉬 시스템 (예정)
   ├─ 대화방에 에피소드 실시간 전송
   ├─ 읽지 않음 상태 관리
   └─ 알림 시스템

7️⃣ 게임 플레이 통합 (예정)
   ├─ 에피소드 표시 및 선택
   ├─ Phase 3 시스템 자동 작동
   │  ├─ 호감도/애정도 변경
   │  ├─ 감정 상태 업데이트
   │  ├─ 대화 메모리 기록
   │  └─ 통계 수집
   └─ 엔딩 조건 평가
```

---

## 📊 Phase 로드맵

### ✅ Phase 1: 핵심 채팅 엔진 (완료)
- 1-A: 채팅 UI 및 기초 시스템
- 1-B: 에피소드 트리거 시스템
- 1-C: 멀티 캐릭터 동시 채팅
- 1-D: 통합 테스트 및 마무리

### ✅ Phase 2-A: 톤 변화 시스템 (완료)
- `js/tone-variation-engine.js`
- `data/tone-templates.json`
- 호감도 기반 5단계 말투 변화

### ✅ Phase 2-B: 사진 전송 시스템 (완료)
- `js/photo-sending-system.js`
- `data/character-photos.json`
- 호감도/시간 기반 사진 전송

### ✅ Phase 2-C: 먼저 연락 시스템 (완료)
- `js/proactive-contact-system.js`
- MBTI별 연락 패턴

### ✅ Phase 2-D: 통합 테스트 (완료)
- Phase 2 전체 통합 및 안정화

### ✅ Phase 3: 고급 상호작용 시스템 (완료)
- **Milestone 1**: 통계 대시보드 + 업적
- **Milestone 2**: 감정 상태 + 특별 이벤트
- **Milestone 3**: 대화 기억 시스템 (3계층 메모리)
- **Milestone 4**: 엔딩 시스템 + 통합 관리자

### ✅ Phase 4: 시나리오 & 에피소드 관리 시스템 (v1.19.5 완료)
- **Milestone 1**: 시나리오 관리 시스템 완성
  - AI 생성 (기승전결 구조 + 장문 스토리)
  - 분위기 조절 (가벼움/보통/진지함)
  - 섹시 레벨 반영 (1-10 단계)
  - GitHub API 영구 저장
- **Milestone 2**: 에피소드 관리 시스템 완성 ✅
  - OpenAI 기반 dialogue_flow 자동 생성
  - 4가지 대화 타입 (narration/dialogue/choice/input)
  - 시나리오 연동 및 상세보기
  - 호감도/친밀도 시스템 통합
- **Milestone 3**: AI 프롬프트 어드민 편집
  - 실시간 프롬프트 수정 및 저장
  - ai-prompts.json 즉시 반영
- **Milestone 4**: 504 타임아웃 에러 해결
  - 명확한 에러 메시지 표시
  - JSON 파싱 에러 방지

### 🔄 Phase 5: 메신저 UI 및 실시간 플레이 (예정)
- **Milestone 1**: 메신저 UI (대화방 리스트 + 개별 채팅방)
- **Milestone 2**: 에피소드 푸쉬 시스템 (대화방에 실시간 전송)
- **Milestone 3**: Phase 3 시스템 통합 (게임 플레이)
- **Milestone 4**: 전체 시스템 통합 테스트

---

## 🔗 중요 링크

- **배포 URL**: https://chatgame-seven.vercel.app
- **메신저 UI**: https://chatgame-seven.vercel.app/messenger-ui.html 🆕
- **어드민**: https://chatgame-seven.vercel.app/scenario-admin.html (비번: a6979)
- **Git 저장소**: https://github.com/EnmanyProject/chatgame

---

## 🚨 주의사항

### 데이터 저장
- **LocalStorage**: 대화 내역, 읽음 상태
- **GitHub API**: 캐릭터, 시나리오, 에피소드 (영구)
- **동기화**: 두 저장소 간 일관성 유지

### 버전 관리
- **형식**: vX.Y.Z
- **X**: Major (대규모 구조 변경)
- **Y**: Minor (Phase 완료)
- **Z**: Patch (버그 수정)

---

**작성일**: 2025-10-06
**작성자**: Claude Code
**용도**: 프로젝트 전체 이해 (외부 LLM 포함)
