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
- `modules/core/schema.js`: 데이터 스키마 정의 모듈 (v2.1.0)
- DataSchemaModule: 스키마 검증 클래스 (레거시)

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

## 새로운 DataSchema 시스템 (v2.1.0)

### 스키마 정의
```javascript
static CHARACTER_SCHEMA = {
    id: 'string', name: 'string', age: 'number',
    mbti: 'string', personality: 'string',
    relationship: 'string', background: 'string',
    dialogue_style: { casual: 'array', romantic: 'array', shy: 'array' }
};

static EPISODE_SCHEMA = {
    id: 'string', title: 'string', description: 'string',
    character_id: 'string', max_choices: 'number',
    dialogues: 'array', active: 'boolean'
};

static SAVE_DATA_SCHEMA = {
    save_meta: { version: 'string', slot_number: 'number' },
    game_progress: { current_episode_id: 'string', affection: 'number' },
    relationship_status: { character_id: 'string', relationship_level: 'string' }
};
```

### 핵심 기능들
- **데이터 검증**: `validate(data, schema)` - 타입, 필수필드, 특수규칙 검증
- **기본값 생성**: `createDefault(type, overrides)` - 게임상태, 캐릭터, 저장데이터 
- **관계 시스템**: `getRelationshipLevel(affection)` - 호감도별 관계단계
- **무결성 검증**: `generateChecksum(data)` - 저장데이터 체크섬

### 검증 시스템
```javascript
const validation = DataSchema.validate(characterData, DataSchema.CHARACTER_SCHEMA);
if (!validation.valid) {
    console.error('검증 실패:', validation.errors);
}
```

### 관계 레벨 시스템
- **모르는 사이** (0-20): 첫 만남 단계
- **아는 사이** (21-40): 기본적인 대화
- **친구** (41-60): 편안한 관계  
- **절친** (61-75): 깊은 신뢰
- **연인 가능성** (76-90): 로맨스 발전
- **연인** (91-100): 완전한 사랑

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