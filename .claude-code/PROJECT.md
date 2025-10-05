# 📘 프로젝트 전체 이해 문서

**프로젝트명**: 로맨스 어드벤처 채팅 시뮬레이션
**목적**: MBTI 기반 여성 캐릭터와의 대화를 통한 남성 채팅 기술 향상 훈련
**버전**: v2.1.0 (Phase 2-B 완료)
**최종 업데이트**: 2025-10-05

---

## 🎯 프로젝트 비전

### 핵심 목표
- **실전 채팅 교육**: 여성과의 대화에서 실제로 사용할 수 있는 채팅 기술 훈련
- **MBTI 기반 맞춤 훈련**: 16가지 성격 유형별 차별화된 대화 전략 학습
- **실시간 AI 피드백**: GPT-4 기반 메시지 분석 및 개선점 제시
- **관계 발전 시뮬레이션**: 호감도 시스템을 통한 자연스러운 관계 진행

### 차별화 포인트
- ❌ 단순 채팅 게임이 아님
- ✅ **실용적인 채팅 교육 시스템**
- ✅ AI 평가 + MBTI 심리학 결합
- ✅ 단계별 레포 구축 테크닉 제공

---

## 🏗️ 시스템 아키텍처

### 전체 구조
```
┌─────────────────────────────────────┐
│         사용자 인터페이스            │
│  (chat-ui.html, character-list)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        핵심 엔진 레이어              │
│  - MultiCharacterState (상태 관리)  │
│  - EpisodeTriggerEngine (트리거)    │
│  - EpisodeDeliverySystem (전달)    │
│  - ToneVariationEngine (톤 변화)    │
│  - PhotoSendingSystem (사진 전송)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          데이터 레이어              │
│  - characters.json (캐릭터)         │
│  - tone-templates.json (톤)         │
│  - character-photos.json (사진)     │
│  - scenarios (시나리오)             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         외부 API 레이어             │
│  - OpenAI GPT-4 (메시지 분석)       │
│  - GitHub API (데이터 저장)         │
│  - Vercel (배포)                    │
└─────────────────────────────────────┘
```

---

## 📁 프로젝트 구조

```
chatgame/
├── 📄 chat-ui.html                    # 메인 채팅 UI
├── 📄 character-list-ui.html          # 대화방 리스트
├── 📄 scenario-admin.html             # 관리자 패널 (비번: a6979)
├── 📄 CLAUDE.md                       # 작업 노트 및 버전 히스토리
│
├── 📂 api/                            # 서버리스 API
│   ├── character-ai-generator.js     # 캐릭터 AI 생성
│   ├── scenario-manager.js           # 시나리오 관리
│   └── episode-manager.js            # 에피소드 관리
│
├── 📂 data/                           # 데이터베이스
│   ├── characters.json               # 캐릭터 DB
│   ├── tone-templates.json           # 톤 템플릿 (Phase 2-A)
│   ├── character-photos.json         # 사진 DB (Phase 2-B)
│   ├── photos/                       # 실제 사진 파일들
│   └── scenarios/
│       └── scenario-database.json    # 시나리오 DB
│
├── 📂 js/                             # 핵심 엔진
│   ├── character-state-manager.js    # 단일 캐릭터 상태
│   ├── multi-character-state.js      # 멀티 캐릭터 상태 ⭐
│   ├── chat-room-manager.js          # 대화방 관리
│   ├── episode-trigger-engine.js     # 자동 트리거 ⭐
│   ├── episode-delivery-system.js    # 에피소드 전달 ⭐
│   ├── tone-variation-engine.js      # 톤 변화 (Phase 2-A) ⭐
│   └── photo-sending-system.js       # 사진 전송 (Phase 2-B) ⭐
│
└── 📂 .claude-code/                   # Claude Code 전용
    ├── PROJECT.md                    # 👈 이 파일
    ├── MASTER.md                     # 현재 작업 가이드
    └── archive/                      # 완료된 Phase 보관
```

---

## 🔧 핵심 기술 스택

### 프론트엔드
- **Vanilla JavaScript (ES6+)**: 순수 자바스크립트 기반
- **HTML5 + CSS3**: 반응형 UI
- **localStorage**: 클라이언트 데이터 저장

### 백엔드
- **Vercel Serverless Functions**: Node.js 기반 API
- **GitHub API**: 데이터 저장소 역할
- **OpenAI GPT-4**: AI 메시지 분석 및 피드백

### 배포
- **Git**: 버전 관리
- **Vercel**: 자동 배포
- **GitHub**: 코드 저장소 + 데이터 저장소

---

## 💡 핵심 개념 및 용어

### 1. 호감도 시스템
- **범위**: -100 ~ +100
- **레벨**: 10단계 (0-10)
- **영향**: 톤 변화, 사진 전송, 먼저 연락 등 모든 시스템

### 2. MBTI 성격 유형
- **16가지 타입**: INFP, ENFP, INTJ, ESTJ, ISFP, ESFP, INTP, ISTP, ISFJ, ESFJ, ISTJ, ENTJ, ENTP, INFJ, ENFJ
- **활용**: 대화 스타일, 선호 주제, 반응 패턴 차별화

### 3. 에피소드 시스템
- **에피소드**: 대화의 최소 단위 (메시지, 선택지, 입력 등)
- **트리거**: 시간/호감도/행동 기반 자동 발생
- **전달**: 딜레이 계산 및 자연스러운 타이밍

### 4. 톤 변화 (Phase 2-A)
- **5단계**: 존댓말 → 반말 → 애교 → 애정표현 → 적극적
- **자동 적용**: 호감도 증가 시 자연스러운 말투 변화
- **MBTI별**: 성격 유형에 맞는 톤 스타일

### 5. 사진 전송 (Phase 2-B)
- **5가지 카테고리**: profile, casual, romantic, emotional, special
- **호감도 기반**: 3+ ~ 9+ 레벨별 차등 전송
- **MBTI 메시지**: 80개 패턴 (16 MBTI × 5 카테고리)

---

## 📊 Phase 로드맵

### ✅ Phase 1: 핵심 채팅 엔진 (완료)
- **1-A**: 채팅 UI 및 기초 시스템
- **1-B**: 에피소드 트리거 시스템
- **1-C**: 멀티 캐릭터 동시 채팅
- **1-D**: 통합 테스트 및 마무리

### ✅ Phase 2-A: 톤 변화 시스템 (완료)
- `js/tone-variation-engine.js` (457줄)
- `data/tone-templates.json` (433줄)
- 호감도 기반 5단계 말투 자동 변화

### ✅ Phase 2-B: 사진 전송 시스템 (완료)
- `js/photo-sending-system.js` (500줄)
- `data/character-photos.json` (20개 사진)
- 호감도/시간 기반 사진 자발적 전송

### 📋 Phase 2-C: 먼저 연락 시스템 (예정)
- 일정 시간 후 캐릭터가 먼저 메시지
- 시간대/호감도/상황 기반 트리거

### 📋 Phase 2-D: 통합 테스트 (예정)
- Phase 2 전체 통합 및 안정화

### 📋 Phase 3: 고급 인터랙션 (계획)
- 음성 메시지
- 영상 통화
- 선물 시스템 등

---

## 🎮 사용자 플로우

### 1. 캐릭터 선택
```
character-list-ui.html
  ↓ 캐릭터 클릭
chat-ui.html (해당 캐릭터)
```

### 2. 대화 진행
```
사용자 입력
  ↓
multiCharacterState.sendMessage()
  ↓
호감도 계산 및 업데이트
  ↓
AI 응답 생성 (톤 적용)
  ↓
화면에 표시
```

### 3. 자동 트리거
```
1분마다 체크
  ↓
시간/호감도/행동 조건 확인
  ↓
에피소드 생성 (메시지/사진)
  ↓
자연스러운 딜레이 후 전달
```

---

## 🔗 중요 링크

- **배포 URL**: https://chatgame-seven.vercel.app
- **채팅 UI**: https://chatgame-seven.vercel.app/chat-ui.html
- **캐릭터 리스트**: https://chatgame-seven.vercel.app/character-list-ui.html
- **어드민**: https://chatgame-seven.vercel.app/scenario-admin.html (비번: a6979)
- **Git 저장소**: https://github.com/EnmanyProject/chatgame

---

## 📝 개발 철학

### 원칙
1. **실용성 우선**: 이론보다 실제 사용 가능한 채팅 기술
2. **자연스러움**: 게임처럼 느껴지지 않는 리얼한 대화
3. **개인화**: MBTI별 맞춤 훈련 및 피드백
4. **점진적 발전**: 호감도 단계별 자연스러운 관계 진행

### 코드 규칙
- ES6+ 모던 JavaScript
- 클래스 기반 모듈화
- localStorage 기반 상태 관리
- 비동기 처리 (async/await)

---

## 🚨 주의사항

### 호감도 시스템
- **범위**: -100 ~ +100 (내부)
- **표시**: 0 ~ 10 레벨 (사용자에게)
- **변환**: `Math.round(affection / 10)`

### 데이터 저장
- **LocalStorage**: 대화 내역, 상태
- **GitHub API**: 캐릭터, 시나리오, 사진 (영구)
- **동기화**: 두 저장소 간 일관성 유지

### 버전 관리
- **형식**: vX.Y.Z
- **X**: Major (대규모 기능)
- **Y**: Minor (Phase 완료)
- **Z**: Patch (버그 수정)

---

**작성일**: 2025-10-05
**작성자**: Claude Code
**용도**: 프로젝트 전체 이해 (외부 LLM 포함)
