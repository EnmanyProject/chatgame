# 🚀 Claude Code 에이전트 완전 설정 가이드

> **목적**: 어떤 프로젝트든 복사-붙여넣기만으로 Claude Code 에이전트 시스템을 즉시 구축

**소요 시간**: 5분  
**난이도**: 초급  
**준비물**: 프로젝트 폴더만 있으면 OK

---

## 📋 목차

1. [폴더 구조 만들기](#1-폴더-구조-만들기)
2. [에이전트 설정 파일 (4개)](#2-에이전트-설정-파일-4개)
3. [프로젝트 설정 파일](#3-프로젝트-설정-파일)
4. [3대 문서 시스템 초기화](#4-3대-문서-시스템-초기화)
5. [동작 확인](#5-동작-확인)
6. [프로젝트별 커스터마이징](#6-프로젝트별-커스터마이징)

---

## 1. 폴더 구조 만들기

### Windows (명령 프롬프트)
```cmd
cd your-project-folder
mkdir .claudecode
mkdir .claudecode\agents
mkdir .claude-code
mkdir .claude-code\backup
```

### Mac/Linux (터미널)
```bash
cd your-project-folder
mkdir -p .claudecode/agents
mkdir -p .claude-code/backup
```

**결과**:
```
your-project/
├── .claudecode/
│   └── agents/
├── .claude-code/
│   └── backup/
└── (기존 프로젝트 파일들)
```

---

## 2. 에이전트 설정 파일 (4개)

### 파일 1: `.claudecode/agents/architect.json`

**복사해서 붙여넣기**:
```json
{
  "name": "architect",
  "description": "시스템 아키텍처 설계 및 구조 최적화",
  "instructions": "프로젝트 루트의 .claude-code/PROJECT.md, .claude-code/MASTER.md, CLAUDE.md를 참고합니다. 100-150줄 단위로 코드를 분할하며, 확장 가능하고 유지보수가 쉬운 구조를 우선합니다. PROJECT.md는 큰 변화가 있을 때만 수정하고, MASTER.md를 자주 업데이트합니다. 각 폴더의 claude.md 컨벤션을 따릅니다.",
  "temperature": 0.3
}
```

**저장 위치**: `.claudecode/agents/architect.json`

---

### 파일 2: `.claudecode/agents/coder.json`

**복사해서 붙여넣기**:
```json
{
  "name": "coder",
  "description": "비즈니스 로직 및 기능 구현",
  "instructions": ".claude-code/MASTER.md의 TODO 리스트를 따릅니다. 각 함수는 단일 책임 원칙을 따르며, 주석은 필요한 곳에만 간결하게 작성합니다. 작업 완료 후 MASTER.md를 즉시 갱신하고, CLAUDE.md에 버전 히스토리를 추가합니다. 각 폴더의 claude.md 컨벤션을 엄격히 준수합니다. 테스트 가능한 코드를 작성합니다.",
  "temperature": 0.4
}
```

**저장 위치**: `.claudecode/agents/coder.json`

---

### 파일 3: `.claudecode/agents/reviewer.json`

**복사해서 붙여넣기**:
```json
{
  "name": "reviewer",
  "description": "코드 품질 검증 및 버그 탐지",
  "instructions": "각 폴더의 claude.md 규칙 준수, 보안 취약점, 성능 이슈, 에지 케이스를 중점적으로 검토합니다. .claude-code/MASTER.md의 TODO와 비교하여 요구사항 충족 여부를 확인합니다. 구체적인 개선 제안과 함께 우선순위(긴급/중요/개선)를 제시합니다.",
  "temperature": 0.2
}
```

**저장 위치**: `.claudecode/agents/reviewer.json`

---

### 파일 4: `.claudecode/agents/documenter.json`

**복사해서 붙여넣기**:
```json
{
  "name": "documenter",
  "description": "문서 작성 및 업데이트",
  "instructions": "CLAUDE.md에 작업 히스토리를 추가할 때는 반드시 상단에 추가합니다(Append to Top). 버전 번호, Git 커밋 해시, 테스트 URL을 필수로 포함합니다. .claude-code/MASTER.md는 현재 상태를 명확히 반영하도록 갱신합니다. 각 폴더의 claude.md는 역할/규칙/확장방법/예시 구조를 따릅니다. 코드 예시는 실제 작동하는 것만 포함합니다.",
  "temperature": 0.5
}
```

**저장 위치**: `.claudecode/agents/documenter.json`

---

## 3. 프로젝트 설정 파일

### 파일: `.claudecode/config.json`

**복사해서 붙여넣기**:
```json
{
  "defaultAgent": "coder",
  "contextFiles": [
    ".claude-code/PROJECT.md",
    ".claude-code/MASTER.md",
    "CLAUDE.md",
    "**/claude.md"
  ],
  "autoCommit": false,
  "planFirst": true
}
```

**저장 위치**: `.claudecode/config.json`

**설정 설명**:
- `defaultAgent`: 기본 에이전트 (보통 coder)
- `contextFiles`: 자동으로 참조할 문서들
- `autoCommit`: Git 자동 커밋 여부 (false 권장)
- `planFirst`: 항상 계획부터 수립 (true 권장)

---

## 4. 3대 문서 시스템 초기화

### 파일 1: `.claude-code/PROJECT.md`

**템플릿 복사**:
```markdown
# 📘 프로젝트 전체 이해 문서

**프로젝트명**: [여기에 프로젝트 이름]
**목적**: [프로젝트의 목적]
**버전**: v1.0.0
**최종 업데이트**: 2025-10-11

---

## 🌐 중요 링크

**배포 URL**: [배포 주소 또는 "로컬만"]
**Git 저장소**: [GitHub URL 또는 "비공개"]

---

## 🎯 프로젝트 개요

### 핵심 기능
1. [주요 기능 1]
2. [주요 기능 2]
3. [주요 기능 3]

### 타겟 사용자
[누가 사용하는가]

---

## 🏗️ 시스템 아키텍처

### 전체 구조
```
[프로젝트 구조 간단히]
```

### 기술 스택
- **언어**: 
- **프레임워크**: 
- **데이터베이스**: 
- **배포**: 

---

## 📁 폴더 구조

```
project/
├── src/           # 소스 코드
├── tests/         # 테스트
├── docs/          # 문서
└── ...
```

---

## 📊 개발 로드맵

### Phase 1: [제목]
- [ ] 작업 1
- [ ] 작업 2

### Phase 2: [제목]
- [ ] 작업 1
- [ ] 작업 2

---

**작성일**: 2025-10-11
**용도**: 프로젝트 전체 이해 (외부 개발자 포함)
```

**저장 위치**: `.claude-code/PROJECT.md`

---

### 파일 2: `.claude-code/MASTER.md`

**템플릿 복사**:
```markdown
# 📌 현재 작업 가이드 (MASTER)

**최종 업데이트**: 2025-10-11
**현재 Phase**: Phase 1 - 초기 설정
**현재 버전**: v1.0.0

---

## 🎯 현재 상태

**진행 중**: 프로젝트 초기 설정
**다음 작업**: 핵심 기능 구현

---

## ✅ TODO 리스트

### 긴급 (이번 주)
- [ ] 프로젝트 초기 구조 설정
- [ ] 핵심 모듈 스켈레톤 작성
- [ ] 기본 테스트 환경 구축

### 중요 (이번 달)
- [ ] 주요 기능 1 구현
- [ ] 주요 기능 2 구현
- [ ] 문서화 시작

### 개선 (언젠가)
- [ ] 성능 최적화
- [ ] UI/UX 개선
- [ ] 테스트 커버리지 향상

---

## 📋 최근 완료 작업

### 2025-10-11
- [x] Claude Code 에이전트 설정
- [x] 3대 문서 시스템 초기화

---

## 🚨 작업 규칙

### 버전 관리
- **Major (X.0.0)**: 대규모 구조 변경
- **Minor (0.X.0)**: 새 기능 추가
- **Patch (0.0.X)**: 버그 수정

### 문서 동기화
- **PROJECT.md**: 큰 변화 시에만
- **MASTER.md**: 매 작업마다 (이 파일!)
- **CLAUDE.md**: 작업 완료 시마다

---

**작성일**: 2025-10-11
**용도**: 현재 작업 상태 및 TODO 관리
```

**저장 위치**: `.claude-code/MASTER.md`

---

### 파일 3: `CLAUDE.md` (루트)

**템플릿 복사**:
```markdown
# 📜 프로젝트 작업 히스토리 (CLAUDE.md)

> 📚 **문서 역할**: 버전 히스토리 및 작업 일지 (Append Only - 추가만, 삭제 안 함)
>
> **다른 문서들**:
> - `.claude-code/PROJECT.md` - 프로젝트 전체 개요 (거의 변경 안 함)
> - `.claude-code/MASTER.md` - 현재 작업 상태 (자주 업데이트)
> - `CLAUDE.md` (이 파일) - 버전 히스토리 (추가만)

---

## 📊 버전 히스토리

> 🚨 **중요**: 새 버전 추가 시 항상 이 목록 **맨 위**에 추가하세요!

### v1.0.0 (2025-10-11) - 프로젝트 초기화 (Initial Release)
**작업 내용**:
- 🎯 **Claude Code 에이전트 시스템 구축**
  - 4개 에이전트 설정 (Architect, Coder, Reviewer, Documenter)
  - 3대 문서 시스템 초기화 (PROJECT, MASTER, CLAUDE)
  - 폴더 구조 생성

**시스템 구성**:
- `.claudecode/agents/`: 4개 에이전트 JSON
- `.claudecode/config.json`: 프로젝트 설정
- `.claude-code/`: 문서 및 백업 폴더

**Git**: 초기 커밋
**상태**: ✅ 에이전트 시스템 가동 준비 완료

---

## 📝 작업 일지

### 2025-10-11: 프로젝트 시작
**작업**:
- Claude Code 에이전트 설정
- 문서 시스템 초기화
- Git 저장소 설정

**다음 계획**:
- Phase 1 작업 시작
- 핵심 기능 구현

---

*마지막 업데이트: 2025-10-11*  
*작업자: [이름] + Claude Code*
```

**저장 위치**: `CLAUDE.md` (프로젝트 루트)

---

## 5. 동작 확인

### Step 1: 파일 확인

**체크리스트**:
```
✅ .claudecode/agents/architect.json
✅ .claudecode/agents/coder.json
✅ .claudecode/agents/reviewer.json
✅ .claudecode/agents/documenter.json
✅ .claudecode/config.json
✅ .claude-code/PROJECT.md
✅ .claude-code/MASTER.md
✅ CLAUDE.md
```

### Step 2: 테스트 명령어

**1. Architect 테스트**:
```bash
claude-code --agent architect "현재 프로젝트 구조 분석 및 개선점 제안"
```

**예상 출력**:
```
📋 프로젝트 구조 분석

현재 구조:
- .claudecode/ (에이전트 설정) ✅
- .claude-code/ (문서) ✅
- CLAUDE.md (히스토리) ✅

개선 제안:
1. src/ 폴더 생성
2. tests/ 폴더 생성
3. 각 폴더에 claude.md 추가
```

---

**2. Coder 테스트**:
```bash
claude-code --agent coder "README.md 파일 생성. 프로젝트 소개 포함"
```

**예상 결과**:
- README.md 파일 생성됨
- MASTER.md 자동 갱신됨

---

**3. Reviewer 테스트**:
```bash
claude-code --agent reviewer "현재 프로젝트 구조 검토. 누락된 파일 확인"
```

**예상 출력**:
```
🔍 프로젝트 검토

✅ 완료:
- 에이전트 설정 완료
- 3대 문서 시스템 완료

⚠️ 권장:
- .gitignore 파일 추가
- LICENSE 파일 추가
- 각 폴더에 claude.md 추가
```

---

**4. Documenter 테스트**:
```bash
claude-code --agent documenter "현재 상태를 CLAUDE.md에 기록"
```

**예상 결과**:
- CLAUDE.md 맨 위에 새 항목 추가됨

---

### Step 3: 에이전트 체이닝 테스트

```bash
# 1. 계획
claude-code --agent architect --plan "프로젝트 폴더 구조 설계"

# 2. 검토 (사람이 확인)

# 3. 구현
claude-code --agent coder "Architect 계획대로 폴더 구조 생성"

# 4. 검증
claude-code --agent reviewer "생성된 폴더 구조 검증"

# 5. 기록
claude-code --agent documenter "작업 완료 기록"
```

---

## 6. 프로젝트별 커스터마이징

### 옵션 1: 웹 프로젝트

**수정할 파일**: `.claudecode/agents/coder.json`

**추가 지시사항**:
```json
{
  "name": "coder",
  "description": "비즈니스 로직 및 기능 구현",
  "instructions": "MASTER.md의 TODO를 따릅니다. React 컴포넌트는 함수형으로 작성하고 hooks를 활용합니다. CSS는 Tailwind 유틸리티 클래스를 우선 사용합니다. API 호출은 async/await 패턴을 사용합니다. 작업 완료 후 MASTER.md 즉시 갱신합니다.",
  "temperature": 0.4
}
```

---

### 옵션 2: Python 프로젝트

**수정할 파일**: `.claudecode/agents/coder.json`

**추가 지시사항**:
```json
{
  "name": "coder",
  "description": "비즈니스 로직 및 기능 구현",
  "instructions": "MASTER.md의 TODO를 따릅니다. PEP 8 스타일 가이드를 준수합니다. Type hints를 모든 함수에 추가합니다. Docstring은 Google 스타일로 작성합니다. 테스트 코드는 pytest를 사용합니다. 작업 완료 후 MASTER.md 즉시 갱신합니다.",
  "temperature": 0.4
}
```

---

### 옵션 3: 모바일 앱 (React Native)

**수정할 파일**: `.claudecode/agents/coder.json`

**추가 지시사항**:
```json
{
  "name": "coder",
  "description": "비즈니스 로직 및 기능 구현",
  "instructions": "MASTER.md의 TODO를 따릅니다. React Native 컴포넌트는 함수형으로 작성합니다. iOS와 Android 모두 고려한 크로스 플랫폼 코드를 작성합니다. StyleSheet를 활용한 스타일링을 우선합니다. 작업 완료 후 MASTER.md 즉시 갱신합니다.",
  "temperature": 0.4
}
```

---

### 옵션 4: 데이터 분석 프로젝트

**수정할 파일**: `.claudecode/agents/coder.json`

**추가 지시사항**:
```json
{
  "name": "coder",
  "description": "데이터 분석 및 시각화",
  "instructions": "MASTER.md의 TODO를 따릅니다. Pandas와 NumPy를 활용한 효율적인 데이터 처리를 우선합니다. Matplotlib/Seaborn을 사용한 명확한 시각화를 작성합니다. Jupyter Notebook은 markdown 설명과 함께 작성합니다. 작업 완료 후 MASTER.md 즉시 갱신합니다.",
  "temperature": 0.4
}
```

---

## 🎯 즉시 사용 가능한 명령어 모음

### 프로젝트 시작 (Day 1)

```bash
# 1. 프로젝트 구조 설계
claude-code --agent architect --plan "프로젝트 전체 구조 설계 및 폴더 생성 계획"

# 2. 폴더 구조 생성
claude-code --agent coder "Architect 계획대로 폴더 및 초기 파일 생성"

# 3. 각 폴더에 claude.md 생성
claude-code --agent documenter "모든 폴더에 claude.md 생성. 역할/규칙/예시 포함"

# 4. README 작성
claude-code --agent documenter "README.md 작성. 설치 방법, 사용법, 기여 가이드 포함"

# 5. .gitignore 추가
claude-code --agent coder ".gitignore 파일 생성. 프로젝트 타입에 맞는 규칙"
```

---

### 기능 개발 (일반)

```bash
# 1. 기능 설계
claude-code --agent architect --plan "[기능명] 상세 설계"

# 2. 구현
claude-code --agent coder "[기능명] 구현. MASTER.md TODO 체크"

# 3. 리뷰
claude-code --agent reviewer "[기능명] 코드 리뷰. 버그/성능/보안 체크"

# 4. 수정
claude-code --agent coder "Reviewer 지적사항 수정"

# 5. 문서화
claude-code --agent documenter "v1.x.0: [기능명] 추가"
```

---

### 버그 수정 (긴급)

```bash
# 1. 원인 분석
claude-code --agent reviewer "[버그 설명] 원인 분석"

# 2. 수정
claude-code --agent coder "Reviewer 분석 결과대로 버그 수정"

# 3. 검증
claude-code --agent reviewer "버그 수정 검증. 사이드 이펙트 확인"

# 4. 문서화
claude-code --agent documenter --commit "v1.x.x: [버그] 수정"
```

---

### 리팩토링

```bash
# 1. 분석
claude-code --agent reviewer "[파일/모듈] 리팩토링 필요 부분 분석"

# 2. 계획
claude-code --agent architect "[파일/모듈] 리팩토링 전략 수립"

# 3. 단계별 실행
claude-code --agent coder "Step 1: [첫 번째 리팩토링]"
claude-code --agent reviewer "Step 1 검증"
# ... 반복

# 4. 최종 문서화
claude-code --agent documenter "v1.x.0: [모듈] 리팩토링 완료"
```

---

## 📚 다음 단계

### 1. 프로젝트 구조 설계
```bash
claude-code --agent architect --plan "프로젝트 초기 구조 설계"
```

### 2. 각 폴더에 claude.md 생성
```bash
claude-code --agent documenter "src/, tests/, docs/ 폴더에 claude.md 생성"
```

### 3. Phase 1 작업 시작
```bash
claude-code --agent coder "MASTER.md의 Phase 1 TODO 중 첫 번째 작업 시작"
```

---

## 🆘 문제 해결

### Q: 에이전트가 문서를 못 찾음
```bash
# contextFiles 경로 확인
cat .claudecode/config.json

# 문서 존재 확인
ls -la .claude-code/
ls -la CLAUDE.md
```

### Q: 명령어가 작동 안 함
```bash
# Claude Code 설치 확인
claude-code --version

# 에이전트 목록 확인
claude-code --list-agents
```

### Q: MASTER.md가 자동 갱신 안 됨
**해결**: Coder 에이전트에게 명시적으로 지시
```bash
claude-code --agent coder "[작업]. 완료 후 MASTER.md TODO 체크"
```

---

## ✅ 완료 체크리스트

설정 완료 후 확인:

- [ ] `.claudecode/agents/` 폴더에 4개 JSON 파일 존재
- [ ] `.claudecode/config.json` 파일 존재
- [ ] `.claude-code/PROJECT.md` 파일 존재 및 내용 작성
- [ ] `.claude-code/MASTER.md` 파일 존재 및 TODO 작성
- [ ] `CLAUDE.md` 파일 존재 (루트)
- [ ] Architect 테스트 명령어 실행 성공
- [ ] Coder 테스트 명령어 실행 성공
- [ ] Reviewer 테스트 명령어 실행 성공
- [ ] Documenter 테스트 명령어 실행 성공

---

## 🎉 축하합니다!

Claude Code 에이전트 시스템이 완전히 구축되었습니다!

### 이제 할 수 있는 것
- ✅ Architect로 시스템 설계
- ✅ Coder로 기능 구현
- ✅ Reviewer로 코드 검증
- ✅ Documenter로 자동 문서화
- ✅ 3대 문서 자동 동기화
- ✅ Git 커밋 자동화

### 다음 학습
- `CLAUDE_CODE_COMMAND_EXAMPLES.md`: 85개 명령어 예시
- `CLAUDE_CODE_AGENTS_SETUP.md`: 상세 가이드

---

**작성일**: 2025-10-11  
**버전**: 1.0  
**용도**: 모든 프로젝트에 복사-붙여넣기로 즉시 사용  
**소요 시간**: 5분

**Happy Coding with Claude Code! 🚀**
