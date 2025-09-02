# Core 모듈 - 핵심 아키텍처

## 담당 범위
- 기본 아키텍처 설계 (`architecture.js`)
- 데이터 스키마 관리
- 공통 유틸리티 함수
- 게임 상태 관리
- 메모리 최적화

## 주요 파일
- `architecture.js`: 메인 아키텍처 모듈 (149줄) - 루트 레벨
- `modules/core/architecture.js`: 새로운 코어 아키텍처 모듈 (v2.1.0) 
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

## 최신 작업 (2025-09-02)

### 새로운 GameArchitecture 클래스 (v2.1.0)
```javascript
class GameArchitecture {
    constructor() {
        this.modules = new Map();      // 모듈 저장소
        this.events = new EventTarget(); // 이벤트 시스템
        this.config = this.getDefaultConfig();
    }
}
```

### 핵심 기능들
- **모듈 시스템**: `registerModule()`, `getModule()`, `callModule()`
- **이벤트 시스템**: `emit()`, `on()`, `off()` - 모듈 간 통신
- **초기화 관리**: 순차적 모듈 초기화 (`schema → choiceLogic → episodeFlow → saveSystem → adminPanel`)
- **상태 관리**: `getStatus()`, `cleanup()`, 메모리 최적화
- **디버그 지원**: `toggleDebug()`, 상세 로깅

### 설정 시스템
```javascript
config: {
    version: '2.1.0',
    maxChoices: 36,
    maxAffection: 100,
    saveSlots: 10,
    cacheTTL: 300000,
    apiEndpoint: '/api/scenario',
    memoryLimit: 50,
    autoSave: true,
    debugMode: false
}
```

### 환경 호환성
- Node.js: `module.exports = gameArch`
- Browser: `window.gameArch = gameArch`  
- ES6: `export default gameArch`

## 이전 작업
- 메모리 제한 기능 추가 (최대 50개 항목)
- DataSchemaModule 클래스 구현
- 에러 핸들링 강화

## 다음 작업 계획
- 다른 코어 모듈들 구현 (schema, choiceLogic 등)
- 기존 architecture.js와 통합
- 모듈 간 의존성 관리 시스템

---
*업데이트: 2025-09-02*
*상태: GameArchitecture v2.1.0 구현 완료*