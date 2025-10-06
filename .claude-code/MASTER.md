# 📌 현재 작업 가이드 (MASTER)

**최종 업데이트**: 2025-10-06
**현재 Phase**: Phase 4 - 메신저 UI 및 에피소드 시스템 🆕

---

## 🎯 현재 상태

**Phase**: Phase 4 진행 중 🚀
**상태**: Milestone 1 완료 (메신저 UI)
**진행률**: 25% ■■■□□□□□□□
**다음**: 에피소드 생성기 API 개발

---

## ✅ 최근 완료 작업

### Phase 4 - Milestone 1: 메신저 UI 구현 ✅ (2025-10-06)
- **messenger-ui.html 생성** (488줄)
  * 카카오톡 스타일 대화방 리스트
  * 7명 캐릭터 대화방 자동 생성
  * MBTI별 프로필 색상 구분 (6가지)
  * 읽지 않음 뱃지 시스템
  * 최근 메시지 미리보기
  * 마지막 활동 시간 표시
  * LocalStorage 기반 대화방 상태 관리
- **chat-room.html 생성** (691줄)
  * 카카오톡 스타일 채팅 UI
  * 메시지 버블 시스템 (보낸/받은 메시지)
  * 선택지 버튼 시스템 (긍정/부정/중립 색상)
  * Phase 3 시스템 완전 연동:
    - MultiCharacterState 초기화
    - 캐릭터별 상태 관리
    - 메시지 기록 자동화
    - 호감도 변화 추적
  * 실시간 메시지 입력/전송
  * LocalStorage 기반 대화 저장

**Git**: 커밋 495bf8e, 73e290e, 푸시 완료
**상태**: Milestone 1 완전 완료! ✅

### Phase 4 - 프로젝트 구조 재정의 ✅ (2025-10-06)
- **프로젝트 컨셉 재정립**
  * 기존: 선택지 기반 훈련 게임
  * 신규: 메신저 기반 9명 멀티 대화방 시스템
- **시스템 아키텍처 재설계**
  * 에피소드 생성 & 푸쉬 레이어 추가
  * 대화방 리스트 + 개별 채팅방 UI
  * 어드민 에피소드 생성기 (캐릭터+시나리오→대화)
- **PROJECT.md 완전 재작성**
  * 메신저 UI 시스템 문서화
  * 에피소드 워크플로우 정의
  * Phase 4 로드맵 추가

**Git**: 커밋 예정
**상태**: 문서화 완료, 구현 시작 준비

### Phase 3 - Milestone 4: 관계 엔딩 + 최종 통합 시스템 ✅ (2025-10-05)
- `data/endings.json` 생성 (7개 엔딩)
  * 5가지 레벨 엔딩 (Bad/Normal/Friend/Romantic/True)
  * 2개 히든 엔딩 (집념/스피드런)
  * 호감도/메시지/이벤트/연속플레이/약속 조건
  * 엔딩별 스토리/보상/업적 시스템
- `js/ending-system.js` 생성 (400+ 줄)
  * EndingManager 클래스
  * 다중 조건 체크 시스템
  * 엔딩 히스토리 관리
  * 엔딩 달성률 추적
  * 엔딩 도감 시스템
- `js/game-integration-manager.js` 생성 (500+ 줄)
  * GameIntegrationManager 클래스
  * 모든 Phase 3 시스템 통합 이벤트 처리
  * onAffectionChange/onMessage/onChoice 통합 핸들러
  * AI 컨텍스트 통합 생성
  * 성능 메트릭 및 이벤트 로깅
- `js/multi-character-state.js` 최종 통합
  * EndingManager 통합
  * GameIntegrationManager 통합
  * checkEndingConditions/triggerEnding 함수
  * generateAIContext/getFullGameState 함수
  * changeAffection 통합 관리자 연동

**Git**: 커밋 예정
**상태**: Phase 3 완전 완료! 🎉

### Phase 3 - Milestone 3: 대화 기억 시스템 ✅ (2025-10-05)
- `js/conversation-memory-system.js` 생성 (600+ 줄)
  * 3계층 메모리 구조 (작업/단기/장기)
  * 자동 중요도 점수 시스템 (0-100점)
  * 메모리 라우팅 (점수별 저장 위치 자동 결정)
  * 키워드 기반 검색 시스템
  * AI 컨텍스트 생성 (장기사실/최근대화/관련기억)
- `js/memory-keywords.js` 생성 (300+ 줄)
  * MemoryExtractor 클래스
  * 선호도/약속/개인정보/경험/감정 키워드 사전
  * 통합 메모리 추출 시스템
  * 메모리 요약 생성
  * 키워드 점수 계산
- `js/multi-character-state.js` 메모리 시스템 통합
  * ConversationMemorySystem 캐릭터별 동적 생성
  * MemoryExtractor 공통 인스턴스
  * notifyUserResponse/notifyCharacterMessage 메모리 기록
  * generateMemoryContext() AI 프롬프트 컨텍스트 생성
  * getMemoryStats() 메모리 통계 조회

**Git**: 커밋 예정
**상태**: Milestone 3 완전 완료 ✅

### Phase 3 - Milestone 2: 특별 이벤트 + 감정 상태 시스템 ✅ (2025-10-05)
- `js/emotion-state-system.js` 생성 (400+ 줄)
  * 6가지 기본 감정 (happy, excited, calm, sad, anxious, angry)
  * MBTI별 감정 변화 속도 (30분~3시간)
  * 감정별 modifier 시스템 (연락빈도/사진확률/응답속도/호감도획득)
  * 호감도/무응답/특별이벤트 기반 감정 변화
- `js/special-event-system.js` 생성 (500+ 줄)
  * 이벤트 조건 체크 엔진 (호감도/날짜/시간/행동/랜덤/복합)
  * 이벤트 발생 히스토리 관리
  * 다음 이벤트 예측 시스템
- `data/special-events.json` 생성
  * 25개 특별 이벤트 정의
  * 8개 카테고리 (relationship, anniversary, holiday, concern, positive, random, activity, intimate)
  * 호감도 마일스톤/기념일/날짜 기반 이벤트
- `js/multi-character-state.js` 통합
  * EmotionStateSystem/SpecialEventSystem 연동
  * 호감도 변경 시 자동 감정 업데이트
  * 캐릭터별 동적 시스템 생성

**Git**: 커밋 예정
**상태**: Milestone 2 완전 완료 ✅

### Phase 3 - Milestone 1: 통계 대시보드 시스템 ✅ (2025-10-05)
- `js/statistics-manager.js` 생성 (400+ 줄)
  * 전역/캐릭터별 통계 수집
  * 호감도 히스토리 그래프 데이터
  * 선택 패턴 분석 (긍정/중립/부정)
  * 연속 플레이 일수 추적
  * 세션 관리 (시작/종료)
- `js/achievement-system.js` 생성 (300+ 줄)
  * 20개 업적 조건 체크 시스템
  * 10가지 조건 타입 지원
  * 비주얼 알림 시스템 (CSS 애니메이션)
  * 카테고리별 업적 관리
- `data/achievements.json` 생성
  * 20개 업적 정의 (4개 카테고리)
  * Basic, Relationship, Activity, Master
- `statistics-dashboard.html` 생성
  * 전역 통계 카드 6개
  * 캐릭터별 상세 통계
  * 선택 패턴 시각화
  * 업적 진행도 및 목록
- `js/multi-character-state.js` 통계 연동
  * StatisticsManager/AchievementSystem 통합
  * 호감도/선택지/메시지 자동 기록
  * 사진/먼저 연락 이벤트 추적
- `character-list-ui.html` 통계 링크 추가
  * 헤더에 📊 통계 대시보드 버튼

**Git**: 커밋 예정
**상태**: Milestone 1 완전 완료 ✅

### Phase 2-D: 통합 테스트 및 안정화 ✅ (2025-10-05)
- 모든 Phase 2 시스템 검증 완료
  * Phase 2-A: 톤 변화 시스템 ✅
  * Phase 2-B: 사진 전송 시스템 ✅
  * Phase 2-C: 먼저 연락 시스템 ✅
- `test-phase2-integration.html` 생성 (통합 테스트 도구)
- 전체 워크플로우 검증 완료
- UI/UX 최종 점검 완료
- 49개 에러 핸들링 확인

**Git**: 커밋 `6d9b181`, 푸시 완료
**상태**: Phase 2 완전 완료 ✅

### Phase 2-C: 먼저 연락 시스템 ✅ (2025-10-05)
- `js/proactive-contact-system.js` 생성 (540줄)
  * 호감도별 연락 주기 (10분 ~ 1시간)
  * 16개 MBTI별 인내심 패턴
  * 무응답 반응 메시지 시스템
  * 시간대별 메시지 템플릿
- `character-list-ui.html` 자동 업데이트 (1분마다)
- `js/episode-trigger-engine.js` v2.2.0 - 먼저 연락 트리거
- `js/multi-character-state.js` 유저 응답 추적
- `chat-ui.html` ProactiveContactSystem 통합

**Git**: 커밋 `9d3fa97`, 푸시 완료

### 문서 구조 재정비 ✅ (2025-10-05)
- `.claude-code/` 폴더 정리 (15개 → 3개 핵심 문서)
- `PROJECT.md` 생성 및 게임 컨셉 업데이트
- `MASTER.md` 생성 (현재 작업 가이드)
- `CLAUDE.md` 역할 재정의 (버전 히스토리 전용)
- `.claude-code/archive/` 생성 및 5개 Phase 문서 보관
- 11개 구버전 문서 삭제

**Git**: 커밋 `302617f`, `1a923c4`, 푸시 완료

### Phase 2-B: 사진 전송 시스템 ✅ (2025-10-05)
- `js/photo-sending-system.js` 생성 (500줄)
- `js/episode-delivery-system.js` 사진 표시 기능 추가
- `js/episode-trigger-engine.js` 사진 트리거 연동
- `chat-ui.html` 사진 모달 UI 추가
- `data/character-photos.json` 재구축 (15 캐릭터, 20 사진)

**Git**: 커밋 `6f23415`, 푸시 완료

---

## 📋 다음 작업: Phase 4 계획

### Phase 4: 메신저 UI 및 에피소드 시스템 (진행 중) 🆕

**목표**: 카카오톡 스타일 메신저 앱으로 완전한 전환

#### Milestone 1: 메신저 UI 구현 ✅ **완료**
- [x] `messenger-ui.html` 생성 (대화방 리스트)
  * 7명 캐릭터 대화방 리스트
  * 최근 메시지 미리보기
  * 읽지 않음 뱃지
  * 마지막 활동 시간
- [x] `chat-room.html` 생성 (개별 채팅방)
  * 카카오톡 스타일 채팅 UI
  * 선택지 버튼
  * 사진 전송 표시
  * Phase 3 시스템 연동

#### Milestone 2: 에피소드 생성기 📋
- [ ] `api/episode-generator.js` 생성
  * 캐릭터 정보 로드
  * 시나리오 정보 로드
  * AI 프롬프트 생성
  * LLM 호출 (Claude/OpenAI/Llama)
  * 에피소드 JSON 생성 및 저장
- [ ] `data/episodes/episode-database.json` 구조 설계

#### Milestone 3: 에피소드 푸쉬 시스템 📋
- [ ] `js/episode-push-system.js` 생성
  * 대화방 ID별 에피소드 큐 관리
  * 읽지 않음 상태 관리
  * LocalStorage 동기화
  * 알림 시스템

#### Milestone 4: 어드민 통합 📋
- [ ] `scenario-admin.html` 에피소드 생성 탭 추가
  * 캐릭터 선택 UI
  * 시나리오 선택 UI
  * AI 모델 선택 (Claude/OpenAI/Llama)
  * 에피소드 미리보기
  * 대화방 푸쉬 버튼

---

## 🚨 작업 규칙

### 1. 문서 업데이트 (필수)
```bash
# 작업 시작 전
git pull origin main

# 작업 중
- MASTER.md 진행률 업데이트

# 작업 완료 후
- PROJECT.md 업데이트 (필요 시)
- MASTER.md 완료 표시
- CLAUDE.md 히스토리 추가
- Git 커밋 및 푸시
```

### 2. Git 워크플로우
```bash
# 매 작업 완료 시
git add .claude-code/PROJECT.md .claude-code/MASTER.md CLAUDE.md
git add [작업한 파일들]
git commit -m "Phase X-X: [작업 내용]"
git push origin main
```

### 3. 문서 동기화
- **PROJECT.md**: 큰 변화 시에만 수정
- **MASTER.md**: 매 작업마다 업데이트
- **CLAUDE.md**: 버전 히스토리 추가 (append only)

---

## 📂 참고 문서

- `.claude-code/PROJECT.md` - 프로젝트 전체 이해
- `CLAUDE.md` - 작업 히스토리
- `.claude-code/archive/phase-*.md` - 완료된 Phase 상세

---

## 🔗 중요 링크

- **배포**: https://chatgame-seven.vercel.app
- **어드민**: https://chatgame-seven.vercel.app/scenario-admin.html (비번: a6979)
- **Git**: https://github.com/EnmanyProject/chatgame

---

**작성일**: 2025-10-05
**용도**: 현재 작업 가이드 및 진행 상황 추적
