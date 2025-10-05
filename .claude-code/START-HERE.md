# 🚀 Claude Code 작업 시작 프롬프트

---

## 📋 **즉시 실행 명령어**

```
안녕 Claude Code!

다음 문서들을 순서대로 읽고 현재 작업을 파악한 후, 진행해줘:

1. .claude-code/PROJECT-OVERVIEW.md (전체 프로젝트 개요)
2. .claude-code/current-work.md (현재 진행 상황)
3. CLAUDE.md (프로젝트 히스토리)

읽기 완료 후 다음 작업을 진행:
- 현재 Phase와 진행률 확인
- 다음 단계 작업 시작
- 각 단계마다 current-work.md 업데이트
- 작업 완료 시 completion 보고서 생성
```

---

## 📁 **필수 확인 파일 목록**

### 1순위: 현재 작업 확인
- `.claude-code/current-work.md` - 진행 중인 작업과 진행률
- `.claude-code/PROJECT-OVERVIEW.md` - 전체 작업 계획

### 2순위: 상세 지침
- `.claude-code/phase-2a-start-prompt.md` - Phase 2-A 상세 지침
- `.claude-code/phase-2b-start-prompt.md` - Phase 2-B 상세 지침

### 3순위: 프로젝트 히스토리
- `CLAUDE.md` - 전체 작업 히스토리
- `PHASE-1-COMPLETION-REPORT.md` - Phase 1 완료 내역

---

## 🎯 **작업 우선순위**

### ⏳ 현재 작업
**Phase 2-A: 톤 변화 시스템 기존 환경 통합**
- 상태: 코드 완성, 통합 대기
- 소요 시간: 약 1.5시간
- 다음: `.claude-code/phase-2a-start-prompt.md` 참조

### 📋 다음 작업
**Phase 2-B: 사진 전송 시스템**
- 상태: 계획 완료, 구현 대기
- 소요 시간: 약 2.5시간
- 다음: `.claude-code/phase-2b-start-prompt.md` 참조

---

## 🚨 **필수 규칙**

### 1. MD 파일 업데이트 (매 단계마다)
```
단계 완료 시:
✅ .claude-code/current-work.md 진행률 업데이트

작업 완료 시:
✅ .claude-code/phase-X-completion.md 생성
✅ CLAUDE.md 버전 히스토리 추가
```

### 2. Git 작업
```bash
# 각 주요 단계마다 커밋
git add [수정 파일들]
git commit -m "Step X: [내용]"

# 최종 완료 후 푸시
git push origin main
```

### 3. 테스트
```
- 자동화 테스트 HTML 생성
- 수동 체크리스트 완료
- 모든 검증 후 배포
```

---

## 📂 **프로젝트 정보**

**경로**: `C:\Users\dosik\chatgame`  
**배포**: https://chatgame-seven.vercel.app  
**어드민**: https://chatgame-seven.vercel.app/scenario-admin.html (비밀번호: a6979)  
**Git**: https://github.com/EnmanyProject/chatgame  

---

## ✅ **작업 플로우**

```
1. 문서 읽기
   └→ PROJECT-OVERVIEW.md
   └→ current-work.md
   └→ phase-X-start-prompt.md

2. 작업 실행
   └→ 단계별 코드 구현
   └→ 각 단계마다 Git 커밋
   └→ current-work.md 진행률 업데이트

3. 테스트
   └→ 자동화 테스트 실행
   └→ 수동 체크리스트 완료

4. 배포
   └→ git push origin main
   └→ Vercel 자동 배포 확인

5. 문서화
   └→ phase-X-completion.md 생성
   └→ CLAUDE.md 히스토리 추가
   └→ current-work.md 다음 작업으로 전환
```

---

## 🎯 **즉시 시작 명령어 (복사해서 사용)**

```
안녕 Claude Code!

C:\Users\dosik\chatgame 프로젝트 작업을 시작할게.

먼저 다음 파일들을 읽어줘:
1. .claude-code/PROJECT-OVERVIEW.md
2. .claude-code/current-work.md
3. .claude-code/phase-2a-start-prompt.md

읽은 후 현재 진행 중인 Phase 2-A 작업을 이어서 진행해줘.

각 단계마다:
- current-work.md 진행률 업데이트
- Git 커밋
- 테스트 실행

작업 완료 시:
- phase-2a-completion.md 생성
- CLAUDE.md 히스토리 추가
- Git push

시작하자!
```

---

**작성일**: 2025-10-05  
**용도**: Claude Code 빠른 시작용  
**문서 위치**: `.claude-code/START-HERE.md`
