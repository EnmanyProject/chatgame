# 📚 전체 프로젝트 개요

**프로젝트명**: 로맨스 어드벤처 채팅 시뮬레이션  
**경로**: C:\Users\dosik\chatgame  
**환경**: 로컬-GitHub-Vercel  
**현재**: Phase 1 완료 → Phase 2 진행 중  

---

## 📊 전체 Phase 로드맵

```
Phase 1: 핵심 채팅 엔진 구축 ✅ (완료)
├── Phase 1-A: 채팅 UI 및 기초 시스템 ✅
├── Phase 1-B: 에피소드 트리거 시스템 ✅
├── Phase 1-C: 멀티 캐릭터 동시 채팅 ✅
└── Phase 1-D: 통합 테스트 및 마무리 ✅

Phase 2: 보상 시스템 구축 🚧 (진행 중)
├── Phase 2-A: 대화 톤 변화 시스템 ✅ (코드 완성, 통합 대기)
├── Phase 2-B: 사진 전송 시스템 ⏳ (다음 작업)
├── Phase 2-C: 먼저 연락 시스템 📋 (예정)
└── Phase 2-D: 통합 테스트 및 Phase 2 완료 📋 (예정)

Phase 3: 고급 인터랙션 시스템 📋 (계획 단계)
```

---

## 📁 프로젝트 구조

```
C:\Users\dosik\chatgame/
├── chat-ui.html                    # 메인 채팅 UI
├── character-list-ui.html          # 대화방 리스트
├── scenario-admin.html             # 관리자 (비번: a6979)
├── api/
│   ├── character-ai-generator.js   # 캐릭터 AI 생성
│   ├── scenario-manager.js         # 시나리오 관리
│   └── episode-manager.js          # 에피소드 관리
├── data/
│   ├── characters.json             # 캐릭터 DB
│   ├── tone-templates.json         # 톤 템플릿 (Phase 2-A)
│   └── scenarios/scenario-database.json
├── js/
│   ├── character-state-manager.js
│   ├── multi-character-state.js
│   ├── episode-trigger-engine.js
│   ├── episode-delivery-system.js
│   └── tone-variation-engine.js    # Phase 2-A
└── .claude-code/
    ├── START-HERE.md               # 👈 시작 가이드
    ├── PROJECT-OVERVIEW.md         # 👈 이 파일
    ├── current-work.md             # 현재 작업 상태
    ├── phase-2a-start-prompt.md    # Phase 2-A 상세
    └── phase-2b-start-prompt.md    # Phase 2-B 상세
```

---

## 🔥 Phase 2-A: 톤 변화 시스템 ✅

**상태**: 코드 완성, 통합 대기  
**목표**: 호감도에 따라 말투 5단계 자동 변화

### 톤 레벨
| 호감도 | 레벨 | 설명 |
|--------|------|------|
| 1-2 | 1 | 존댓말 |
| 3-4 | 2 | 반말 |
| 5-6 | 3 | 애교 |
| 7-8 | 4 | 애정표현 |
| 9-10 | 5 | 적극적 |

### 완성된 파일
- `js/tone-variation-engine.js` (457줄)
- `data/tone-templates.json` (433줄)

### 통합 필요 작업
1. chat-ui.html 수정
2. episode-trigger-engine.js 수정
3. character-state-manager.js 수정

**상세**: `.claude-code/phase-2a-start-prompt.md` 참조

---

## 📸 Phase 2-B: 사진 전송 시스템 ⏳

**상태**: 계획 완료, 구현 대기  
**목표**: 호감도/상황에 따라 사진 자발적 전송

### 사진 카테고리 (7가지)
- daily (일상) - 호감도 3+
- selfie (셀카) - 호감도 3+
- fashion (패션) - 호감도 5+
- mood (분위기) - 호감도 5+
- intimate (친밀) - 호감도 7+
- sexy (섹시) - 호감도 9+
- special (특별) - 호감도 5+

### 생성할 파일
- `js/photo-sending-system.js` (~700줄)
- `data/photo-database.json` (~600줄)
- `assets/photos/` 폴더 구조

**상세**: `.claude-code/phase-2b-start-prompt.md` 참조

---

## 💬 Phase 2-C: 먼저 연락 시스템 📋

**상태**: 계획 예정  
**목표**: 일정 시간 후 캐릭터가 먼저 연락

---

## 🧪 Phase 2-D: 통합 테스트 📋

**상태**: 계획 예정  
**목표**: Phase 2 전체 통합 및 안정화

---

## 🚨 필수 규칙

### 1. MD 파일 업데이트
```
매 단계: .claude-code/current-work.md 진행률 갱신
작업 완료: phase-X-completion.md 생성
          CLAUDE.md 버전 히스토리 추가
```

### 2. Git 작업
```bash
각 단계: git commit -m "Step X: [내용]"
최종: git push origin main
```

### 3. 표준 작업 프로세스
```
1. 계획 수립
2. 환경 준비 (Git 백업)
3. 코드 구현 (단계별 커밋)
4. 테스트
5. 배포
6. 문서화
```

---

## 📊 Phase 2 작업량

| Phase | 신규 | 수정 | 코드량 | 시간 |
|-------|------|------|--------|------|
| 2-A 통합 | 0 | 3 | +200 | 1.5h |
| 2-B | 3 | 3 | +1400 | 2.5h |
| 2-C | 2 | 2 | +800 | 2h |
| 2-D | 2 | 0 | +600 | 4h |
| 합계 | 7 | 8 | +3000 | 10h |

---

## 🔍 참고 정보

**배포**: https://chatgame-seven.vercel.app  
**어드민**: https://chatgame-seven.vercel.app/scenario-admin.html  
**비밀번호**: a6979  
**Git**: https://github.com/EnmanyProject/chatgame  

**작성일**: 2025-10-05  
**작성자**: Claude Sonnet 4
