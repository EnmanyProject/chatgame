# 🎓 Claude Code 에이전트 명령어 완전 가이드

> **학습 목적**: Claude Code 에이전트를 실전에서 어떻게 활용하는지 명령어 예시를 통해 완전히 이해하기

**작성일**: 2025-10-11  
**대상**: 메신저형 어드벤처 게임 프로젝트 개발자  
**난이도**: 초급 → 고급

---

## 📚 목차

1. [에이전트 개요](#에이전트-개요)
2. [명령어 작성 기본 원칙](#명령어-작성-기본-원칙)
3. [Architect 명령어 모음](#-architect-명령어-20개)
4. [Coder 명령어 모음](#-coder-명령어-25개)
5. [Reviewer 명령어 모음](#-reviewer-명령어-20개)
6. [Documenter 명령어 모음](#-documenter-명령어-20개)
7. [에이전트 체이닝 패턴](#-에이전트-체이닝-10개-패턴)
8. [학습 로드맵](#-학습-로드맵)

---

## 에이전트 개요

### 4가지 에이전트 역할

| 에이전트 | 역할 | Temperature | 주요 작업 | 문서 책임 |
|---------|------|-------------|----------|-----------|
| **🏗️ Architect** | 설계자 | 0.3 (낮음) | 시스템 구조, Phase 계획 | PROJECT.md |
| **💻 Coder** | 개발자 | 0.4 (중간) | 기능 구현, 버그 수정 | MASTER.md 갱신 |
| **🔍 Reviewer** | 검증자 | 0.2 (최저) | 코드 리뷰, 품질 검증 | TODO 대조 |
| **📝 Documenter** | 문서화 | 0.5 (높음) | 버전 기록, Git 커밋 | CLAUDE.md 기록 |

### 기본 사용법

```bash
# 기본 명령어
claude-code --agent <에이전트명> "<작업 지시>"

# 계획 모드 (권장)
claude-code --agent <에이전트명> --plan "<작업 지시>"

# 자동 커밋
claude-code --agent <에이전트명> --commit "<커밋 메시지>"
```

---

## 명령어 작성 기본 원칙

### ✅ 좋은 명령어의 5가지 특징

#### 1. **구체적이고 명확함**
```bash
❌ "고쳐줘"
✅ "room-list-manager.js Line 45에 null 체크 추가"
```

#### 2. **맥락 포함**
```bash
❌ "버그 수정"
✅ "Reviewer가 지적한 null 체크, 메모리 누수, XSS 방어 3가지 수정"
```

#### 3. **범위 제한**
```bash
❌ "전체 리뷰"
✅ "room-list-manager.js만 리뷰. 버그와 성능 중점"
```

#### 4. **목표 명시**
```bash
❌ "코드 작성"
✅ "messenger-ui에 검색 기능 추가. 실시간 필터링"
```

#### 5. **문서 연동**
```bash
❌ "기능 추가"
✅ "MASTER.md의 TODO 체크하고 기능 구현"
```

---

## 🏗️ Architect 명령어 (20개)

> **사용 시점**: 새 기능 시작, 리팩토링 계획, Phase 설계

### 설계 및 계획 (10개)

**1. 프로젝트 초기 설계**
```bash
claude-code --agent architect --plan "메신저형 어드벤처 게임 전체 아키텍처 설계"
```

**2. 새 Phase 계획**
```bash
claude-code --agent architect --plan "Phase 5: 메신저 UI 시스템 상세 설계"
```

**3. 데이터 스키마 설계**
```bash
claude-code --agent architect "대화 메모리 3계층 구조 데이터베이스 스키마 설계"
```

**4. 모듈 분리 계획**
```bash
claude-code --agent architect --plan "chat-ui.html 800줄을 100-150줄 단위로 분리하는 계획"
```

**5. API 구조 설계**
```bash
claude-code --agent architect "에피소드 관리 RESTful API 설계. CRUD + AI 생성 포함"
```

**6. 폴더 구조 재구성**
```bash
claude-code --agent architect "js/ 폴더를 core/, ui/, utils/ 하위 폴더로 재구성 계획"
```

**7. 성능 최적화 전략**
```bash
claude-code --agent architect --plan "LocalStorage 용량 관리 및 메모리 최적화 전략"
```

**8. 확장성 검토**
```bash
claude-code --agent architect "9개 캐릭터를 50개로 확장할 때 필요한 구조 변경 분석"
```

**9. 보안 아키텍처**
```bash
claude-code --agent architect "GitHub API 토큰 관리 및 사용자 인증 시스템 설계"
```

**10. 통합 시스템 설계**
```bash
claude-code --agent architect "Phase 3의 7개 시스템을 EventBus 패턴으로 통합 설계"
```

### 리팩토링 계획 (5개)

**11. 대규모 코드 정리**
```bash
claude-code --agent architect --plan "scenario-admin.html 20,000줄을 모듈화하는 단계별 계획"
```

**12. 의존성 분석**
```bash
claude-code --agent architect "프로젝트 순환 의존성 문제 분석 및 해결 방안"
```

**13. 마이그레이션 전략**
```bash
claude-code --agent architect "LocalStorage → IndexedDB 마이그레이션 3단계 전략"
```

**14. 테스트 전략**
```bash
claude-code --agent architect --plan "통합 테스트 시스템 구축. 10개 시나리오 자동화"
```

**15. 배포 파이프라인**
```bash
claude-code --agent architect "Vercel 배포 개선 및 스테이징 환경 추가 계획"
```

### 문서 및 가이드 (5개)

**16. 개발 가이드**
```bash
claude-code --agent architect "새 개발자 온보딩 가이드 작성"
```

**17. 컨벤션 정의**
```bash
claude-code --agent architect "JavaScript 코딩 컨벤션 및 네이밍 규칙 문서화"
```

**18. PROJECT.md 갱신**
```bash
claude-code --agent architect "PROJECT.md에 Phase 5 추가 및 아키텍처 다이어그램 업데이트"
```

**19. 기술 스택 검토**
```bash
claude-code --agent architect "Vanilla JS vs React, GitHub API vs Firebase 비교 분석"
```

**20. 확장 포인트 문서화**
```bash
claude-code --agent architect "각 시스템의 확장 포인트 및 플러그인 구조 문서 작성"
```

---

## 💻 Coder 명령어 (25개)

> **사용 시점**: 기능 구현, 버그 수정, 통합 작업

### 기능 구현 (10개)

**1. 새 모듈 생성**
```bash
claude-code --agent coder "js/notification-system.js 생성. 브라우저 알림 + 소리 재생"
```

**2. API 엔드포인트 추가**
```bash
claude-code --agent coder "api/episode-manager.js에 duplicate 액션 추가"
```

**3. UI 컴포넌트**
```bash
claude-code --agent coder "messenger-ui.html에 검색 기능 추가. 실시간 필터링"
```

**4. 데이터 처리**
```bash
claude-code --agent coder "MultiCharacterState에 getTop3Characters() 메서드 추가"
```

**5. 이벤트 핸들러**
```bash
claude-code --agent coder "chat-room.html에 더블클릭 시 메시지 복사 기능"
```

**6. 유틸리티 함수**
```bash
claude-code --agent coder "js/utils/time-formatter.js 생성. 한국어 시간 포맷"
```

**7. LocalStorage 관리**
```bash
claude-code --agent coder "LocalStorage 용량 관리. 50개 초과 시 자동 삭제"
```

**8. 애니메이션**
```bash
claude-code --agent coder "대화방 카드 hover 시 확대 애니메이션 CSS"
```

**9. 폼 검증**
```bash
claude-code --agent coder "에피소드 생성 폼 입력값 검증. 빈 값 체크 + 길이 제한"
```

**10. 에러 핸들링**
```bash
claude-code --agent coder "모든 fetch()에 try-catch 추가. 사용자 친화적 에러 메시지"
```

### 버그 수정 (5개)

**11. 특정 버그 수정**
```bash
claude-code --agent coder "RoomListManager.openChatRoom() undefined 에러 수정"
```

**12. 메모리 누수**
```bash
claude-code --agent coder "chat-room.html setInterval 정리 안 되는 메모리 누수 수정"
```

**13. UI 버그**
```bash
claude-code --agent coder "모바일에서 대화방 카드 깨지는 CSS 버그 수정"
```

**14. 동기화 문제**
```bash
claude-code --agent coder "GitHub API 응답과 LocalStorage 불일치 문제 해결"
```

**15. 성능 개선**
```bash
claude-code --agent coder "displayScenarios() 최적화. 100개 시나리오 1초 이내"
```

### MASTER.md 연동 (3개)

**16. TODO 완료**
```bash
claude-code --agent coder "MASTER.md TODO '검색 기능' 체크하고 구현"
```

**17. 진행 상황 갱신**
```bash
claude-code --agent coder "Phase 5-A 완료. MASTER.md 완료 표시 및 다음 작업 추가"
```

**18. 작업 기록**
```bash
claude-code --agent coder "notification-system.js 완료. MASTER.md에 기록"
```

### 통합 작업 (4개)

**19. 시스템 연동**
```bash
claude-code --agent coder "messenger-ui와 MultiCharacterState 완전 연동"
```

**20. API 통합**
```bash
claude-code --agent coder "에피소드 생성 후 자동으로 대화방에 푸쉬"
```

**21. 이벤트 연결**
```bash
claude-code --agent coder "대화방 진입 시 StatisticsManager 자동 기록"
```

**22. 데이터 마이그레이션**
```bash
claude-code --agent coder "캐릭터 데이터에 새 필드 5개 추가. 기본값 설정"
```

### 테스트 코드 (3개)

**23. 단위 테스트**
```bash
claude-code --agent coder "formatTime() 함수 단위 테스트 10개 케이스"
```

**24. 통합 테스트**
```bash
claude-code --agent coder "messenger-ui → chat-room 전환 통합 테스트"
```

**25. 샘플 데이터**
```bash
claude-code --agent coder "테스트용 더미 에피소드 10개 생성 스크립트"
```

---

## 🔍 Reviewer 명령어 (20개)

> **사용 시점**: 코드 완성 후, 버그 발견 시, 배포 전

### 코드 리뷰 (5개)

**1. 전체 파일 리뷰**
```bash
claude-code --agent reviewer "room-list-manager.js 전체 리뷰. 버그/성능/보안"
```

**2. 특정 함수 리뷰**
```bash
claude-code --agent reviewer "getCharacterState() 함수 리뷰. 에러 처리 중점"
```

**3. API 검증**
```bash
claude-code --agent reviewer "episode-manager.js generate_dialogue 액션 검증"
```

**4. UI 검토**
```bash
claude-code --agent reviewer "messenger-ui.html 렌더링 로직. XSS 취약점 체크"
```

**5. 성능 분석**
```bash
claude-code --agent reviewer "displayScenarios() 성능 분석. 1000개 처리 가능성"
```

### 요구사항 대조 (3개)

**6. MASTER.md 대조**
```bash
claude-code --agent reviewer "MASTER.md Phase 5-A TODO와 실제 코드 비교"
```

**7. 설계 문서 대조**
```bash
claude-code --agent reviewer "Architect 설계서와 실제 구현 비교"
```

**8. 스펙 충족 검증**
```bash
claude-code --agent reviewer "dialogue_flow 4가지 타입 모두 지원 확인"
```

### 버그 찾기 (4개)

**9. 잠재적 버그**
```bash
claude-code --agent reviewer "chat-room.html에서 null/undefined 에러 모두 찾기"
```

**10. 메모리 누수**
```bash
claude-code --agent reviewer "모든 setInterval/setTimeout 정리 확인"
```

**11. 경쟁 조건**
```bash
claude-code --agent reviewer "여러 대화방 동시 접속 시 상태 충돌 분석"
```

**12. 에지 케이스**
```bash
claude-code --agent reviewer "빈 배열, null, undefined, 0 에지 케이스 처리 확인"
```

### 보안 검토 (3개)

**13. XSS 취약점**
```bash
claude-code --agent reviewer "innerHTML 사용하는 모든 곳 XSS 체크"
```

**14. API 토큰**
```bash
claude-code --agent reviewer "GitHub API 토큰 클라이언트 노출 확인"
```

**15. 입력값 검증**
```bash
claude-code --agent reviewer "모든 사용자 입력값 검증 여부 확인"
```

### 코드 품질 (5개)

**16. 컨벤션 준수**
```bash
claude-code --agent reviewer "js/ 폴더 전체 네이밍 컨벤션 체크"
```

**17. 중복 코드**
```bash
claude-code --agent reviewer "scenario-admin.html 중복 코드 찾아서 리팩토링 제안"
```

**18. 복잡도 분석**
```bash
claude-code --agent reviewer "20줄 이상 함수 찾아서 분리 제안"
```

**19. 주석 품질**
```bash
claude-code --agent reviewer "복잡한 로직 주석 여부 확인. 필요 위치 제안"
```

**20. 테스트 커버리지**
```bash
claude-code --agent reviewer "핵심 함수 테스트 코드 존재 여부"
```

---

## 📝 Documenter 명령어 (20개)

> **사용 시점**: 작업 완료 후, 버전 릴리스 시

### 버전 히스토리 (4개)

**1. 버전 기록**
```bash
claude-code --agent documenter "CLAUDE.md에 v2.3.0 버전 히스토리 추가"
```

**2. 패치 노트**
```bash
claude-code --agent documenter "v2.3.1 패치 노트. 버그 수정 내용"
```

**3. 마일스톤 기록**
```bash
claude-code --agent documenter "Phase 5-A 완료 기록. 주요 성과 및 커밋 해시"
```

**4. 백업 생성**
```bash
claude-code --agent documenter "v2.3.0 시점 3대 문서 백업"
```

### MASTER.md 갱신 (4개)

**5. TODO 체크**
```bash
claude-code --agent documenter "MASTER.md Phase 5-A TODO 체크 표시"
```

**6. 현재 상태**
```bash
claude-code --agent documenter "MASTER.md 현재 작업 섹션 최신 상태로"
```

**7. 완료 작업 이동**
```bash
claude-code --agent documenter "완료된 Phase 5-A를 최근 완료 작업으로 이동"
```

**8. 다음 작업**
```bash
claude-code --agent documenter "MASTER.md에 Phase 5-B TODO 추가"
```

### claude.md 생성 (4개)

**9. 폴더 문서**
```bash
claude-code --agent documenter "js/claude.md 생성. 역할/규칙/예시"
```

**10. API 문서**
```bash
claude-code --agent documenter "api/claude.md 작성. 모든 엔드포인트"
```

**11. 데이터 스키마**
```bash
claude-code --agent documenter "data/claude.md 생성. JSON 구조 설명"
```

**12. 컴포넌트 문서**
```bash
claude-code --agent documenter "js/phase3/claude.md. 7개 시스템 관계도"
```

### README 및 가이드 (4개)

**13. README**
```bash
claude-code --agent documenter "루트 README.md 업데이트. 최신 기능 반영"
```

**14. 설치 가이드**
```bash
claude-code --agent documenter "INSTALL.md 작성. 로컬 환경 세팅"
```

**15. API 문서**
```bash
claude-code --agent documenter "API.md 생성. 요청/응답 예시"
```

**16. 기여 가이드**
```bash
claude-code --agent documenter "CONTRIBUTING.md. 브랜치 전략 및 PR 규칙"
```

### 예시 및 튜토리얼 (3개)

**17. 사용 예시**
```bash
claude-code --agent documenter "MultiCharacterState 사용 예시 10개"
```

**18. 튜토리얼**
```bash
claude-code --agent documenter "새 시나리오 추가 튜토리얼. 스크린샷 포함"
```

**19. 트러블슈팅**
```bash
claude-code --agent documenter "자주 발생하는 에러 10개와 해결법"
```

### Git 연동 (1개)

**20. 자동 커밋**
```bash
claude-code --agent documenter --commit "v2.3.0: Phase 5-A 메신저 UI 완성"
```

---

## 🔄 에이전트 체이닝 (10개 패턴)

### 1️⃣ 표준 개발 플로우 (5단계)
```bash
claude-code --agent architect --plan "알림 시스템 설계"
claude-code --agent coder "알림 시스템 구현"
claude-code --agent reviewer "알림 시스템 리뷰"
claude-code --agent coder "리뷰 지적사항 수정"
claude-code --agent documenter --commit "v2.4.0: 알림 시스템"
```

### 2️⃣ 빠른 버그 수정 (3단계)
```bash
claude-code --agent reviewer "읽지 않음 카운터 버그 분석"
claude-code --agent coder "버그 수정"
claude-code --agent documenter --commit "v2.3.1: 버그 수정"
```

### 3️⃣ 대규모 리팩토링 (반복)
```bash
claude-code --agent architect --plan "모듈화 계획"
# 모듈별 반복
claude-code --agent coder "모듈 1 분리"
claude-code --agent reviewer "모듈 1 리뷰"
# ...
claude-code --agent documenter --commit "v2.5.0: 완전 모듈화"
```

### 4️⃣ 새 API 엔드포인트 (4단계)
```bash
claude-code --agent architect "API 스펙 설계"
claude-code --agent coder "API 구현 + 테스트"
claude-code --agent reviewer "API 검증"
claude-code --agent documenter "API.md 업데이트"
```

### 5️⃣ 성능 최적화 (5단계)
```bash
claude-code --agent reviewer "성능 분석"
claude-code --agent architect "최적화 전략"
claude-code --agent coder "최적화 구현"
claude-code --agent reviewer "성능 비교"
claude-code --agent documenter "v2.3.2: 650% 성능 개선"
```

### 6️⃣ 보안 강화 (6단계)
```bash
claude-code --agent reviewer "보안 취약점 스캔"
claude-code --agent architect "보안 로드맵"
claude-code --agent coder "XSS 방어"
claude-code --agent coder "API 토큰 보안"
claude-code --agent reviewer "보안 재검증"
claude-code --agent documenter "SECURITY.md + 패치"
```

### 7️⃣ 문서 정비 (6단계)
```bash
claude-code --agent reviewer "claude.md 존재 확인"
claude-code --agent documenter "js/claude.md"
claude-code --agent documenter "api/claude.md"
# ... 각 폴더
claude-code --agent reviewer "품질 검토"
claude-code --agent documenter --commit "docs: 완성"
```

### 8️⃣ 새 캐릭터 추가 (4단계)
```bash
claude-code --agent architect "영향 분석"
claude-code --agent coder "캐릭터 추가"
claude-code --agent coder "UI 수정"
claude-code --agent documenter "v2.4.0: 캐릭터 추가"
```

### 9️⃣ 긴급 핫픽스 (3단계)
```bash
claude-code --agent reviewer "크래시 분석"
claude-code --agent coder "즉시 수정"
claude-code --agent documenter --commit "hotfix: 크래시 수정"
```

### 🔟 Phase 완료 (6단계)
```bash
claude-code --agent reviewer "TODO 완료 검증"
claude-code --agent coder "통합 테스트"
claude-code --agent documenter "문서 백업"
claude-code --agent documenter "히스토리 기록"
claude-code --agent documenter "MASTER.md 갱신"
claude-code --agent documenter --commit "Phase 완성 🎉"
```

---

## 📚 학습 로드맵

### 🥉 초급 (1주차): 단일 에이전트
**목표**: 각 에이전트의 역할 이해

**실습**:
1. Coder로 간단한 함수 구현 (3회)
2. Reviewer로 코드 리뷰 (3회)
3. Documenter로 버전 기록 (3회)
4. Architect로 간단한 설계 (1회)

**예시 명령어**:
```bash
claude-code --agent coder "utils.js에 formatDate() 함수 추가"
claude-code --agent reviewer "utils.js 리뷰"
claude-code --agent documenter "CLAUDE.md에 작업 기록"
```

### 🥈 중급 (2주차): 2-3개 체이닝
**목표**: 에이전트 조합 이해

**실습**:
1. Coder → Reviewer (5회)
2. Architect → Coder (3회)
3. Coder → Documenter (5회)

**예시 플로우**:
```bash
claude-code --agent coder "검색 기능 구현"
claude-code --agent reviewer "검색 기능 리뷰"
claude-code --agent coder "리뷰 반영"
```

### 🥇 고급 (3-4주차): 전체 워크플로우
**목표**: 실전 프로젝트 적용

**실습**:
1. 새 기능 완전 개발 (설계→구현→리뷰→문서)
2. 버그 수정 전체 과정
3. 리팩토링 프로젝트
4. Phase 완료 프로세스

**예시 프로젝트**:
```bash
# Phase 5-A: 메신저 UI (완전한 개발 사이클)
claude-code --agent architect --plan "메신저 UI 설계"
# ... 전체 워크플로우
claude-code --agent documenter --commit "Phase 5-A 완성"
```

---

## 🎯 실전 팁 모음

### 💡 명령어 작성 체크리스트

**작성 전 체크**:
- [ ] 어느 파일/함수인가?
- [ ] 무엇을 하는가?
- [ ] 왜 필요한가?
- [ ] 어떻게 할 것인가?

**작성 후 체크**:
- [ ] 구체적인가?
- [ ] 맥락이 있는가?
- [ ] 범위가 명확한가?
- [ ] 목표가 있는가?

### 🚀 효율성 극대화

**시간 절약**:
- `--plan` 먼저 사용 → 검토 → 실행
- 비슷한 작업은 한 번에
- MASTER.md 자동 갱신 활용

**품질 보장**:
- 항상 Reviewer 거치기
- 중요한 작업은 Architect 먼저
- 완료 후 Documenter 필수

**문서 동기화**:
- Coder가 MASTER.md 자동 갱신
- Documenter가 CLAUDE.md 자동 기록
- Git 커밋 자동화

### ⚠️ 주의사항

**하지 말아야 할 것**:
- ❌ 계획 없이 큰 작업 시작
- ❌ 리뷰 없이 바로 배포
- ❌ 문서화 미루기
- ❌ 여러 작업 동시 진행

**꼭 해야 할 것**:
- ✅ Phase별 순차 진행
- ✅ 작업 완료 시 문서 갱신
- ✅ 버그 수정 후 재검증
- ✅ 주기적인 백업

---

## 📖 추가 학습 자료

### 관련 문서
- `CLAUDE_CODE_AGENTS_SETUP.md`: 에이전트 설정 방법
- `PROJECT.md`: 프로젝트 전체 구조
- `MASTER.md`: 현재 작업 상태
- `CLAUDE.md`: 버전 히스토리

### 실전 예시 참고
- Phase 1-5 작업 히스토리 (CLAUDE.md)
- 각 폴더의 claude.md
- Git 커밋 로그

---

## 🎓 마무리

### 핵심 요약

**에이전트 역할**:
- 🏗️ Architect: 큰 그림
- 💻 Coder: 실제 작업
- 🔍 Reviewer: 품질 보장
- 📝 Documenter: 기록 유지

**기본 패턴**:
1. 설계 (Architect)
2. 구현 (Coder)
3. 검증 (Reviewer)
4. 기록 (Documenter)

**성공 비결**:
- 명확하고 구체적인 명령어
- 단계별 순차 진행
- 문서 자동 동기화 활용
- 지속적인 리뷰와 개선

---

**작성일**: 2025-10-11  
**버전**: 1.0  
**작성자**: Claude Sonnet 4  
**프로젝트**: 메신저형 어드벤처 게임

**다음 학습**: 실제 프로젝트에 적용해보기! 🚀
