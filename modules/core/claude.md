# Core 모듈 - 핵심 아키텍처

## 담당 범위
- 기본 아키텍처 설계 (`architecture.js`)
- 데이터 스키마 관리
- 공통 유틸리티 함수
- 게임 상태 관리
- 메모리 최적화

## 주요 파일
- `architecture.js`: 메인 아키텍처 모듈 (149줄)
- DataSchemaModule: 스키마 검증 클래스

## 핵심 기능
```javascript
// 게임 상태 구조
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
    isProcessing: false,
    canInput: true
};
```

## 최근 작업
- 메모리 제한 기능 추가 (최대 50개 항목)
- DataSchemaModule 클래스 구현
- 에러 핸들링 강화

## 다음 작업 계획
- 상태 영속성 기능
- 성능 모니터링
- 메모리 사용량 최적화

---
*업데이트: 2025-09-02*