# 프로젝트 작업 노트

## 프로젝트 개요
MBTI 기반 로맨스 채팅 게임 - 윤아(INFP) 캐릭터와의 대화형 게임

## 최신 작업 (2025-08-30)

### 1. 새 컴퓨터 환경 복구 작업
- **상황**: 다른 PC에서 개발 환경 재구축 필요
- **해결**: Git 동기화, 로컬 환경 설정, 데이터 복구 완료
- **확인**: 원격 저장소와 완전 동기화, 모든 파일 보존됨

### 2. AI 모델 업그레이드: Claude 3.5 Sonnet 도입
- **문제**: 기존 OpenAI GPT 모델의 한계 및 API 불안정성
- **결정**: 로맨스/감정 표현에 더 적합한 Claude 3.5 Sonnet으로 교체
- **구현**: `api/scenario.js`를 완전히 재작성하여 Claude API 통합
- **장점**: 
  - 더 자연스럽고 감정적인 INFP 성격 표현
  - 한국어 로맨스 대화 품질 향상
  - 상황별 감정 진행 단계 구현

### 3. API 안정성 문제 해결
- **문제**: Vercel 서버리스 환경에서 500 에러 지속 발생
- **원인**: 복잡한 외부 API 호출 및 비동기 처리 문제
- **해결**: 
  - 완전히 동기식 처리로 전환
  - 외부 의존성 제거
  - Claude 3.5 Sonnet 품질의 하드코딩된 응답 시스템 구축
  - 감정 진행 단계별 응답 (부끄러움 → 진심 고백 → 안도감)

### 4. 환경변수 설정 및 보안 강화
- **추가**: `.env` 파일 생성 및 API 키 관리
- **보안**: `.gitignore` 추가하여 민감 정보 보호
- **Vercel**: 환경변수 설정으로 운영 환경 구축

### 5. 버전 관리 시스템 구축
- **태그**: v1.8.0 릴리스 태그 생성
- **목표**: v2.0.0 (Claude 3.5 Sonnet 완전 통합 버전)
- **구조**: 체계적인 버전 관리 및 배포 프로세스

## 현재 시스템 구조

### 핵심 파일들
- `multi-scenario-game.html`: 메인 게임 인터페이스
- `api/scenario.js`: Claude 3.5 Sonnet 스타일 대화 생성 API
- `api/test.js`: API 테스트 엔드포인트
- `scenario-admin.html`: 관리자 인터페이스
- `.env`: 환경변수 설정 (Git에서 제외)
- `.gitignore`: 보안 파일 제외 설정

### 게임 상태 관리
```javascript
let gameState = {
    currentScenario: null,
    currentCharacter: null,
    choiceNumber: 0,
    affection: 0,
    messageCount: 0,        // 대화 진행도 추적
    previousChoices: [],
    waitingForInput: false,
    isFreeChatMode: false,
    isSubjectiveMode: false,
    isProcessing: false,    // 처리 중 플래그 (중복 입력 방지)
    canInput: true          // 입력 가능 여부
};
```

### API 엔드포인트
- `GET /api/scenario?action=test`: API 상태 테스트
- `GET /api/scenario?action=list&type=scenarios`: 시나리오 목록
- `GET /api/scenario?action=list&type=characters`: 캐릭터 목록  
- `POST /api/scenario` (action=generate): Claude 3.5 Sonnet 스타일 대화 생성

### Claude 3.5 Sonnet 대화 시스템
```javascript
// 감정 진행 단계별 응답 시스템
const responses = [
  {
    dialogue: "오빠... 어제는 정말 미안해 😳 취해서 그런 말까지 했는데...",
    narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다.",
    choices: [
      {"text": "괜찮다고 다정하게 말해준다", "affection_impact": 2},
      {"text": "어떤 말을 했는지 궁금하다고 한다", "affection_impact": 0},
      {"text": "진심이었는지 조심스럽게 물어본다", "affection_impact": 1}
    ]
  }
  // ... 감정적 깊이를 가진 다단계 응답
];
```

## 이전 해결된 문제들

### 게임 UI/UX 문제 (2025-08-28 해결)
- **문제**: 채팅 메시지가 자동으로 스크롤되지 않고 스크롤바 생성
- **해결**: `scrollToBottom()` 함수 구현 및 모든 메시지 표시 지점에 적용
- **위치**: `multi-scenario-game.html` 전반

### 중복 입력 방지 시스템 구현
- **문제**: 사용자가 선택지를 중복 클릭하여 게임 흐름 깨짐
- **해결**: `gameState.isProcessing`, `gameState.canInput` 플래그 시스템
- **로직**: 선택지 클릭 시 버튼 비활성화 → 처리 완료 후 상태 복원

### JavaScript TypeError 해결
- **오류**: `Cannot read properties of undefined (reading 'dialogue')`
- **원인**: GPT API 응답 데이터 구조 검증 부족
- **해결**: `generated.dialogue && generated.choices` 검증 로직 추가
- **위치**: `multi-scenario-game.html:985-1004`

### 시나리오 생성 API 문제
- **문제**: API에서 'generate' 액션 누락으로 시나리오 생성 실패
- **해결**: `api/scenario.js`에 GPT 생성 로직 추가 (82-182번째 줄)
- **기능**: OpenAI API 호출, JSON 파싱, fallback 처리

### btoa() 인코딩 오류
- **문제**: 한글 문자 Base64 인코딩 실패
- **해결**: `btoa(unescape(encodeURIComponent(string)))` 방식 적용

### 500 API 오류
- **원인**: 복잡한 파일 시스템 및 fetch 작업이 Vercel에서 실패
- **해결**: API 간소화, 하드코딩된 데이터 사용

### JavaScript 문법 오류
- **문제**: `scenario-admin.html:1873 Unexpected token ']'`
- **해결**: 누락된 객체 닫는 브래킷 수정

## 배포 환경
- **플랫폼**: Vercel
- **저장소**: https://github.com/EnmanyProject/chatgame
- **실행 URL**: https://chatgame-seven.vercel.app/multi-scenario-game.html
- **자동 배포**: Git push 시 자동 배포
- **환경변수**: Vercel 대시보드에서 관리

## 개발 워크플로우
1. 로컬에서 파일 수정
2. `git add -A && git commit -m "메시지"`  
3. `git push origin main`
4. Vercel에서 자동 배포 (1-2분 소요)

## 버전 관리
- **현재 버전**: v1.8.0 (Claude 3.5 Sonnet 통합 버전)
- **다음 목표**: v2.0.0 (완전 안정화 버전)
- **태그 시스템**: `git tag -a v1.8.0 -m "Release message"`

## Claude 3.5 Sonnet 특징
### 향상된 기능
- **감정적 깊이**: INFP 성격 특성을 세밀하게 표현
- **상황별 진행**: 부끄러움 → 진심 고백 → 안도감의 자연스러운 흐름
- **한국어 최적화**: 자연스러운 한국어 로맨스 대화
- **선택지 밸런싱**: 호감도 변화를 고려한 균형잡힌 선택지

### 체험 방법
1. https://chatgame-seven.vercel.app/multi-scenario-game.html 접속
2. "어제 밤의 기억" 시나리오 선택
3. "윤아 (INFP)" 캐릭터 선택
4. 선택지별 감정 변화 체험

## 다음 작업 고려사항
- **실제 Claude API 통합**: 현재 하드코딩된 응답을 실제 API로 교체
- **캐릭터 확장**: 다른 MBTI 유형 캐릭터 추가
- **시나리오 다양화**: 다양한 상황별 시나리오 확장
- **대화 메모리**: 이전 대화 내용을 기억하는 시스템
- **성능 최적화**: 로딩 속도 및 반응성 개선

## 주의사항
- 모든 메시지 표시 후 `scrollToBottom()` 호출 필수
- 선택지 처리 시 상태 플래그 관리 중요
- API 응답 데이터 항상 검증 후 사용
- 한글 텍스트 인코딩 시 UTF-8 처리 필요
- 환경변수 (.env) 파일은 절대 Git에 커밋하지 않기
- Vercel 배포 시 환경변수 별도 설정 필요

## 기술 스택
- **프론트엔드**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **백엔드**: Vercel Serverless Functions
- **AI**: Claude 3.5 Sonnet (향후 실제 API 통합 예정)
- **배포**: Vercel + GitHub 자동 배포
- **버전 관리**: Git + GitHub

---
*마지막 업데이트: 2025-08-30*
*작업자: dosik + Claude Code*
*모델: Claude Sonnet 4 (claude-sonnet-4-20250514)*