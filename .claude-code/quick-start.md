# 🚀 Claude Code 빠른 시작 가이드

## ⚡ 1분 만에 시작하기

### 📂 프로젝트 위치
```bash
cd C:\Users\dosik\chatgame
```

### 🔍 현재 상황 파악 (30초)
```bash
# Git 상태 확인
git status

# 현재 작업 확인  
type .claude-code\current-task.md

# 프로젝트 정보 확인
npm run info
```

### 🎯 즉시 작업 가능한 명령어

#### Option 1: 아키텍처 개선 작업
```bash
claude-code "architecture.js 파일의 임시 모듈 클래스들을 실제 구현으로 교체하고 에러 처리를 강화해주세요. 기존 API 호환성은 유지해주세요."
```

#### Option 2: 데이터 스키마 개발  
```bash
claude-code "next-steps.md의 요구사항에 따라 dataSchema.js 모듈을 개발해주세요. 캐릭터/에피소드/선택지/저장 스키마를 포함해야 합니다."
```

#### Option 3: 테스트 자동화
```bash
claude-code "architecture.js에 대한 Jest 기반 단위 테스트 스위트를 작성해주세요."
```

## 🔧 유용한 개발 명령어

### 코드 검증
```bash
# 문법 체크
npm run test:architecture

# 기본 로드 테스트  
npm test
```

### 문서 관리
```bash
# Claude Code 컨텍스트 확인
npm run claude-context

# 문서 업데이트 준비
npm run docs:update
```

### 배포 관련
```bash  
# 현재 작업 배포
npm run deploy:current

# 아키텍처 모듈 배포
npm run deploy:architecture
```

## 🎮 현재 동작하는 게임 확인

### 로컬 테스트
1. Live Server로 `architecture-test.html` 열기
2. 브라우저 개발자 도구(F12) 열기
3. 모든 테스트 버튼 실행

### 온라인 테스트 (배포 후)
- **테스트 페이지**: https://chatgame-seven.vercel.app/architecture-test.html
- **기존 게임**: https://chatgame-seven.vercel.app/multi-scenario-game.html

## 🤝 웹 Claude와 협업 방법

### 작업 완료 후 보고 형식
웹 Claude에 다음과 같이 보고하세요:

```
"Claude Code에서 [작업명] 완료

✅ 완성 사항:
- [구체적인 구현 내용]

🧪 테스트 결과:  
- [테스트 통과 현황]

📊 코드 품질:
- 라인 수: XXX줄
- 에러 처리: 완료/부분
- 성능: 개선/유지

🔄 다음 단계:
- [웹 Claude에 요청할 다음 작업]

📁 생성/수정 파일:
- [파일 목록]
"
```

## 🚨 주의사항

### 기존 코드 호환성
- `multi-scenario-game.html`과 연동 가능하도록 유지
- `api/scenario.js` API 인터페이스 변경 금지
- `window.gameArchitecture` 전역 객체 유지

### Git 관리
- 의미 있는 커밋 메시지 작성
- 각 기능별로 개별 커밋 권장
- 태그는 주요 마일스톤에만 사용

### 문서 동기화
- 작업 완료 시 `.claude-code/handoff-notes.md` 필수 업데이트
- `docs/module-progress.md`에 진행률 반영
- README 스타일 문서는 웹 Claude가 관리

## 🎯 성공 기준

### Phase 1.1 완료 기준 (현재)
- ✅ 아키텍처 테스트 페이지 100% 통과
- ✅ 모든 모듈 정상 초기화
- ✅ 이벤트/상태/로깅 시스템 동작

### Claude Code 개선 목표  
- 🎯 실제 기능하는 모듈 시스템
- 🎯 자동화된 테스트 환경
- 🎯 성능 최적화 완료
- 🎯 확장 가능한 구조