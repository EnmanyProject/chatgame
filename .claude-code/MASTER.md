# 📌 현재 작업 가이드 (MASTER)

**최종 업데이트**: 2025-10-05
**현재 Phase**: Phase 2-B 완료 → Phase 2-C 준비

---

## 🎯 현재 상태

**Phase**: Phase 2-B
**작업**: 사진 전송 시스템
**진행률**: 100% ✅ 완료
**다음**: Phase 2-C (먼저 연락 시스템)

---

## ✅ 최근 완료 작업

### 문서 구조 재정비 ✅ (2025-10-05)
- `.claude-code/` 폴더 정리 (15개 → 3개 핵심 문서)
- `PROJECT.md` 생성 및 게임 컨셉 업데이트
- `MASTER.md` 생성 (현재 작업 가이드)
- `CLAUDE.md` 역할 재정의 (버전 히스토리 전용)
- `.claude-code/archive/` 생성 및 5개 Phase 문서 보관
- 11개 구버전 문서 삭제

### Phase 2-B: 사진 전송 시스템 ✅ (2025-10-05)
- `js/photo-sending-system.js` 생성 (500줄)
- `js/episode-delivery-system.js` 사진 표시 기능 추가
- `js/episode-trigger-engine.js` 사진 트리거 연동
- `chat-ui.html` 사진 모달 UI 추가
- `data/character-photos.json` 재구축 (15 캐릭터, 20 사진)

**Git**: 커밋 `6f23415`, 푸시 완료

---

## 📋 다음 작업: Phase 2-C

### 먼저 연락 시스템
**목표**: 일정 시간 후 캐릭터가 먼저 메시지 전송

**생성할 파일**:
- (TBD - 계획 수립 필요)

**수정할 파일**:
- (TBD - 계획 수립 필요)

**예상 시간**: 2시간

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
