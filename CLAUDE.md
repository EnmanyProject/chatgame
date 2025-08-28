# 프로젝트 작업 노트

## 프로젝트 개요
MBTI 기반 로맨스 채팅 게임 - 윤아(INFP) 캐릭터와의 대화형 게임

## 최근 해결한 주요 문제들

### 1. 게임 UI/UX 문제 (2025-08-28 해결)
- **문제**: 채팅 메시지가 자동으로 스크롤되지 않고 스크롤바 생성
- **해결**: `scrollToBottom()` 함수 구현 및 모든 메시지 표시 지점에 적용
- **위치**: `multi-scenario-game.html` 전반

### 2. 중복 입력 방지 시스템 구현
- **문제**: 사용자가 선택지를 중복 클릭하여 게임 흐름 깨짐
- **해결**: `gameState.isProcessing`, `gameState.canInput` 플래그 시스템
- **로직**: 선택지 클릭 시 버튼 비활성화 → 처리 완료 후 상태 복원

### 3. JavaScript TypeError 해결
- **오류**: `Cannot read properties of undefined (reading 'dialogue')`
- **원인**: GPT API 응답 데이터 구조 검증 부족
- **해결**: `generated.dialogue && generated.choices` 검증 로직 추가
- **위치**: `multi-scenario-game.html:985-1004`

### 4. 시나리오 생성 API 문제
- **문제**: API에서 'generate' 액션 누락으로 시나리오 생성 실패
- **해결**: `api/scenario.js`에 GPT 생성 로직 추가 (82-182번째 줄)
- **기능**: OpenAI API 호출, JSON 파싱, fallback 처리

## 현재 시스템 구조

### 핵심 파일들
- `multi-scenario-game.html`: 메인 게임 인터페이스
- `api/scenario.js`: 시나리오/캐릭터 데이터 및 GPT 생성 API
- `api/test.js`: API 테스트 엔드포인트
- `scenario-admin.html`: 관리자 인터페이스

### 게임 상태 관리
```javascript
let gameState = {
    currentScenario: null,
    currentCharacter: null,
    choiceNumber: 0,
    affection: 0,
    messageCount: 0,
    previousChoices: [],
    waitingForInput: false,
    isFreeChatMode: false,
    isSubjectiveMode: false,
    isProcessing: false,  // 처리 중 플래그 (중복 입력 방지)
    canInput: true        // 입력 가능 여부
};
```

### API 엔드포인트
- `GET /api/scenario?action=test`: API 상태 테스트
- `GET /api/scenario?action=list&type=scenarios`: 시나리오 목록
- `GET /api/scenario?action=list&type=characters`: 캐릭터 목록  
- `POST /api/scenario` (action=generate): GPT 대화 생성

## 이전 해결된 문제들

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

## 개발 워크플로우
1. 로컬에서 파일 수정
2. `git add -A && git commit -m "메시지"`  
3. `git push origin main`
4. Vercel에서 자동 배포

## 다음 작업 고려사항
- 캐릭터 사진 서버 업로드 기능
- 대화 메모리 관리 시스템
- 추가 시나리오/캐릭터 확장
- 성능 최적화

## 주의사항
- 모든 메시지 표시 후 `scrollToBottom()` 호출 필수
- 선택지 처리 시 상태 플래그 관리 중요
- GPT API 응답 데이터 항상 검증 후 사용
- 한글 텍스트 인코딩 시 UTF-8 처리 필요

---
*마지막 업데이트: 2025-08-28*
*작업자: dosik + Claude Code*