# Claude Code 에이전트 설정 가이드

## 📖 목차
1. [에이전트 개요](#에이전트-개요)
2. [빠른 시작](#빠른-시작)
3. [에이전트 상세 설명](#에이전트-상세-설명)
4. [사용법](#사용법)
5. [작업 플로우](#작업-플로우)
6. [문서 관리 시스템](#문서-관리-시스템)

---

## 에이전트 개요

**메신저형 어드벤처 게임 프로젝트**에 최적화된 4가지 Claude Code 에이전트:

| 에이전트 | 역할 | 주요 작업 | 문서 관리 |
|---------|------|----------|-----------|
| **Architect** | 설계자 | 시스템 구조, 모듈 분리, 스키마 설계 | PROJECT.md 관리 |
| **Coder** | 개발자 | 비즈니스 로직, 기능 구현 | MASTER.md 갱신 |
| **Reviewer** | 검증자 | 코드 리뷰, 버그 탐지, 컨벤션 확인 | 품질 검증 |
| **Documenter** | 문서화 | README, claude.md 작성/갱신 | CLAUDE.md 기록 |

---

## 🎯 프로젝트 3대 문서 시스템

### 📂 문서 역할 분담
```
.claude-code/
├── PROJECT.md   (프로젝트 전체 계획) - 거의 변경 안 함
├── MASTER.md    (개발 진행 상황)    - 자주 업데이트
└── CLAUDE.md    (작업 히스토리)      - 추가만 (Append Only)
```

### 📋 각 문서의 역할

#### 1. **PROJECT.md** (프로젝트 전체 계획)
- **역할**: 프로젝트 전체 이해를 위한 불변 문서
- **내용**:
  - 프로젝트 목적 및 배경
  - 전체 아키텍처 개요
  - Phase 구조 (Phase 1~7)
  - 기술 스택 및 도구
- **갱신 시점**: 프로젝트 방향 전환 시에만
- **관리 에이전트**: Architect

#### 2. **MASTER.md** (개발 진행 상황)
- **역할**: 현재 작업 가이드 (가장 자주 참조)
- **내용**:
  - 현재 Phase 진행 상황
  - TODO 리스트
  - 현재 작업 중인 모듈
  - 다음 작업 계획
- **갱신 시점**: 매일 작업 시작/종료 시
- **관리 에이전트**: Coder, Architect

#### 3. **CLAUDE.md** (작업 히스토리)
- **역할**: 버전별 작업 기록 (Append Only)
- **내용**:
  - 버전 번호별 작업 내용
  - Git 커밋 해시
  - 문제 해결 과정
  - 테스트 URL
- **갱신 시점**: 작업 완료 후 항상
- **관리 에이전트**: Documenter

---

## 빠른 시작

### 1단계: 폴더 생성
```bash
mkdir -p .claudecode/agents
```

### 2단계: 에이전트 파일 생성

#### `.claudecode/agents/architect.json`
```json
{
  "name": "architect",
  "description": "시스템 아키텍처 설계 및 구조 최적화",
  "instructions": "프로젝트 루트의 PROJECT.md, MASTER.md, CLAUDE.md를 참고합니다. 100-150줄 단위로 코드를 분할하며, 확장 가능하고 유지보수가 쉬운 구조를 우선합니다. PROJECT.md는 큰 변화가 있을 때만 수정하고, MASTER.md를 자주 업데이트합니다.",
  "temperature": 0.3
}
```

#### `.claudecode/agents/coder.json`
```json
{
  "name": "coder",
  "description": "비즈니스 로직 및 기능 구현",
  "instructions": "MASTER.md의 TODO 리스트를 따릅니다. 각 함수는 단일 책임 원칙을 따르며, 주석은 필요한 곳에만 간결하게 작성합니다. 작업 완료 후 MASTER.md를 즉시 갱신하고, CLAUDE.md에 버전 히스토리를 추가합니다. 각 폴더의 claude.md 컨벤션을 엄격히 준수합니다.",
  "temperature": 0.4
}
```

#### `.claudecode/agents/reviewer.json`
```json
{
  "name": "reviewer",
  "description": "코드 품질 검증 및 버그 탐지",
  "instructions": "claude.md 규칙 준수, 보안 취약점, 성능 이슈, 에지 케이스를 중점적으로 검토합니다. MASTER.md의 TODO와 비교하여 요구사항 충족 여부를 확인합니다. 구체적인 개선 제안과 함께 우선순위를 제시합니다.",
  "temperature": 0.2
}
```

#### `.claudecode/agents/documenter.json`
```json
{
  "name": "documenter",
  "description": "문서 작성 및 업데이트",
  "instructions": "CLAUDE.md에 작업 히스토리를 추가할 때는 반드시 상단에 추가합니다(Append to Top). 버전 번호, Git 커밋 해시, 테스트 URL을 필수로 포함합니다. MASTER.md는 현재 상태를 명확히 반영하도록 갱신합니다. 각 폴더의 claude.md는 역할/규칙/확장방법/예시 구조를 따릅니다.",
  "temperature": 0.5
}
```

### 3단계: 프로젝트 설정 파일 생성

#### `.claudecode/config.json`
```json
{
  "defaultAgent": "coder",
  "contextFiles": [
    ".claude-code/PROJECT.md",
    ".claude-code/MASTER.md",
    ".claude-code/CLAUDE.md",
    "**/claude.md"
  ],
  "autoCommit": false,
  "planFirst": true
}
```

---

## 에이전트 상세 설명

### 🏗️ Architect (설계자)
- **Temperature**: 0.3 (낮음 - 일관성 우선)
- **사용 시점**:
  - 프로젝트 초기 구조 설계
  - 새로운 모듈 추가 계획
  - 데이터베이스 스키마 설계
  - 폴더 구조 재구성
- **문서 책임**:
  - PROJECT.md 관리 (큰 변화 시에만)
  - Phase별 계획 수립
- **출력물**: 구조도, 인터페이스 정의, 파일 목록

### 💻 Coder (개발자)
- **Temperature**: 0.4 (중간 - 균형)
- **사용 시점**:
  - 실제 기능 구현
  - 비즈니스 로직 작성
  - API 엔드포인트 개발
  - 유틸리티 함수 작성
- **문서 책임**:
  - MASTER.md 즉시 갱신 (TODO 체크)
  - 작업 완료 후 CLAUDE.md에 버전 기록
- **출력물**: 실행 가능한 코드, 테스트 코드

### 🔍 Reviewer (검증자)
- **Temperature**: 0.2 (가장 낮음 - 정확성 우선)
- **사용 시점**:
  - 각 모듈 완성 후
  - PR 전 최종 검증
  - 버그 의심 시
  - 성능 최적화 필요 시
- **문서 책임**:
  - MASTER.md의 TODO와 요구사항 대조
  - 개선 제안 기록
- **출력물**: 문제점 목록, 개선 제안, 우선순위

### 📝 Documenter (문서화)
- **Temperature**: 0.5 (높음 - 창의성)
- **사용 시점**:
  - 새 모듈 완성 후
  - 버전 릴리스 시
  - README 업데이트
  - API 문서 작성
- **문서 책임**:
  - CLAUDE.md에 버전 히스토리 추가 (맨 위에)
  - 각 폴더 claude.md 생성/갱신
- **출력물**: Markdown 문서, 주석, 예시 코드

---

## 사용법

### 기본 명령어
```bash
# 특정 에이전트로 작업
claude-code --agent <에이전트명> "<작업 지시>"

# 계획 모드 (권장)
claude-code --agent <에이전트명> --plan "<작업 지시>"

# 자동 커밋
claude-code --agent <에이전트명> --commit "<커밋 메시지>"
```

### 실전 예시

#### 1. 프로젝트 구조 설계
```bash
claude-code --agent architect --plan "데이터 스키마와 폴더 구조 설계"
```

#### 2. 호감도 시스템 구현
```bash
claude-code --agent coder "src/logic/affinity.js에 호감도 계산 로직 구현하고 MASTER.md 갱신"
```

#### 3. 코드 리뷰
```bash
claude-code --agent reviewer "src/logic/affinity.js 리뷰하고 MASTER.md TODO 체크"
```

#### 4. 버전 히스토리 기록
```bash
claude-code --agent documenter "CLAUDE.md에 v1.8.0 버전 히스토리 추가"
```

---

## 작업 플로우

### 표준 워크플로우
```
┌─────────────┐
│  Architect  │  → 구조 설계 (PROJECT.md)
└──────┬──────┘
       ↓
┌─────────────┐
│    Coder    │  → 기능 구현 (MASTER.md 갱신)
└──────┬──────┘
       ↓
┌─────────────┐
│  Reviewer   │  → 코드 검증 (MASTER.md 대조)
└──────┬──────┘
       ↓
┌─────────────┐
│ Documenter  │  → 버전 기록 (CLAUDE.md 추가)
└─────────────┘
```

### Phase별 작업 예시

#### Phase 1: 아키텍처 설계
```bash
# 1. Architect: 계획 수립
claude-code --agent architect --plan "Phase 1: 전체 시스템 아키텍처 설계"

# 2. Architect: 계획 실행 (PROJECT.md 업데이트)
claude-code --agent architect "계획 실행하고 PROJECT.md에 반영"

# 3. Documenter: 커밋
git add .claude-code/PROJECT.md
git commit -m "Phase 1: 아키텍처 설계 완료"
git push
```

#### Phase 2: 데이터 스키마 구현
```bash
# 1. Coder: 구현 + MASTER.md 갱신
claude-code --agent coder "데이터 스키마 구현하고 MASTER.md TODO 체크"

# 2. Reviewer: 리뷰
claude-code --agent reviewer "데이터 스키마 코드 리뷰"

# 3. Documenter: 버전 히스토리 + 커밋
claude-code --agent documenter "CLAUDE.md에 v1.1.0 기록하고 커밋"
```

---

## 문서 관리 시스템

### 📋 문서 갱신 플로우

#### 작업 시작 시
```bash
# 1. 최신 문서 동기화
git pull

# 2. MASTER.md 확인
cat .claude-code/MASTER.md

# 3. 현재 TODO 파악
grep "TODO" .claude-code/MASTER.md
```

#### 작업 진행 중
```bash
# 1. Coder가 기능 구현
claude-code --agent coder "기능 구현"

# 2. MASTER.md 즉시 갱신
claude-code --agent documenter "MASTER.md의 TODO 체크 및 진행 상황 업데이트"
```

#### 작업 완료 시
```bash
# 1. Reviewer로 검증
claude-code --agent reviewer "코드 검증 및 MASTER.md 요구사항 대조"

# 2. CLAUDE.md에 버전 히스토리 추가
claude-code --agent documenter "CLAUDE.md 상단에 v1.x.x 버전 히스토리 추가"

# 3. Git 커밋 (3대 문서 포함)
git add .claude-code/PROJECT.md .claude-code/MASTER.md .claude-code/CLAUDE.md
git add [작업한 파일들]
git commit -m "v1.x.x: [작업 내용]"
git push
```

### 🔄 문서 동기화 체크리스트

✅ **매일 작업 시작 시**:
- [ ] `git pull` 실행
- [ ] MASTER.md 현재 TODO 확인
- [ ] CLAUDE.md 최근 버전 확인

✅ **작업 완료 시**:
- [ ] MASTER.md TODO 체크 갱신
- [ ] CLAUDE.md 버전 히스토리 추가 (맨 위)
- [ ] Git 커밋 (3대 문서 포함)

✅ **큰 변화 시**:
- [ ] PROJECT.md 업데이트 (Architect 승인 필요)

---

## Git 커밋 방법

### 방법 1: 수동 커밋 (권장)
```bash
git add .
git commit -m "Phase N: [작업 내용]"
git push
```

### 방법 2: 에이전트 자동 커밋
```bash
claude-code --agent documenter --commit "v1.x.x: 작업 내용"
```

---

## 팁과 모범 사례

### ✅ 권장사항
- 항상 `--plan` 옵션으로 계획 먼저 수립
- **MASTER.md를 가장 자주 참조**
- 각 Phase는 별도 세션에서 실행
- 100-150줄 단위로 모듈 분할
- 작업 완료 시 반드시 CLAUDE.md 갱신

### ❌ 주의사항
- 계획 없이 바로 구현하지 않기
- **MASTER.md 갱신 잊지 않기**
- PROJECT.md를 너무 자주 수정하지 않기
- CLAUDE.md를 중간에 삭제하지 않기
- 리뷰 없이 바로 다음 단계 진행하지 않기

---

## 문제 해결

### Q: 에이전트가 문서를 찾지 못함
```bash
# contextFiles 확인
cat .claudecode/config.json

# 문서 경로 확인
ls -la .claude-code/
```

### Q: MASTER.md와 실제 작업이 불일치
```bash
# Documenter로 동기화
claude-code --agent documenter "MASTER.md를 현재 코드 상태에 맞게 갱신"
```

### Q: CLAUDE.md가 너무 길어짐
```bash
# 백업 후 아카이브 섹션으로 이동
claude-code --agent documenter "오래된 버전 히스토리를 아카이브 섹션으로 이동"
```

---

## 다음 단계

1. ✅ `.claudecode` 폴더 및 설정 파일 생성
2. ✅ 3대 문서 (PROJECT.md, MASTER.md, CLAUDE.md) 확인
3. 🔄 Phase 1 계획 수립
4. 🔄 Architect로 프로젝트 구조 설계

**지금 시작하기:**
```bash
mkdir -p .claudecode/agents
# 위 JSON 파일들을 생성한 후
claude-code --agent architect --plan "메신저형 어드벤처 게임 프로젝트 초기 설정"
```

---

## 🚨 중요 알림

### 버전 관리 필수 체크리스트
✅ **scenario-admin.html 수정 시**:
1. 버전 번호 업데이트 (Line 4784)
2. Git 커밋 및 푸시
3. 테스트 URL 확인
4. CLAUDE.md에 버전 히스토리 추가

✅ **문서 동기화**:
- MASTER.md: 매일 갱신
- CLAUDE.md: 작업 완료 시마다 추가
- PROJECT.md: 큰 변화 시에만

---

*작성일: 2025-10-11*  
*버전: 1.0*  
*작성자: Claude Sonnet 4*
