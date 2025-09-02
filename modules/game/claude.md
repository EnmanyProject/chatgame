# Game 모듈 - 게임 로직

## 담당 범위
- 메인 게임 인터페이스 (`multi-scenario-game.html`)
- 게임 플레이 로직
- 캐릭터 상호작용 시스템
- 시나리오 진행 관리
- MBTI 기반 대화 생성

## 주요 파일
- `multi-scenario-game.html`: 메인 게임 페이지
- `modules/GameLogic.js`: 게임 로직 모듈
- `modules/game/`: 새로운 모듈화된 게임 시스템 (예정)

## 핵심 기능
### 캐릭터 시스템
- **윤아 (INFP)**: 감정적, 내향적 성격
- MBTI 기반 반응 패턴
- 호감도 시스템 (affection)

### 시나리오 시스템
- **어제 밤의 기억**: 로맨스 시나리오
- 선택지 기반 진행
- 감정 단계별 진행 (부끄러움 → 진심 → 안도감)

### 대화 생성
```javascript
// Claude 3.5 Sonnet 스타일 대화 구조
{
    dialogue: "오빠... 어제는 정말 미안해 😳",
    narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다.",
    choices: [
        {"text": "괜찮다고 다정하게 말해준다", "affection_impact": 2},
        {"text": "어떤 말을 했는지 궁금하다고 한다", "affection_impact": 0}
    ]
}
```

## UI/UX 개선사항
- 자동 스크롤 기능 (`scrollToBottom()`)
- 중복 입력 방지 시스템
- 실시간 상태 업데이트

## 최근 해결된 이슈
- 채팅 스크롤 문제 해결
- JavaScript TypeError 수정
- API 응답 검증 로직 추가

## Phase 2-2 계획 (다음 구현 예정)

### 선택지 로직 모듈
```javascript
// modules/game/choiceLogic.js (예정)
class ChoiceLogic {
    calculateAffectionChange(choice, characterState) {
        // 호감도 변화 계산
    }
    
    determineBranching(choices, currentState) {
        // 스토리 분기 결정
    }
}
```

### 직접 입력 시스템
```javascript
// modules/game/freeChat.js (예정)  
class FreeChatMode {
    analyzeUserInput(message) {
        // 사용자 입력 감정 분석
    }
    
    generateResponse(input, character, context) {
        // 자유 대화 응답 생성
    }
}
```

### 에피소드 흐름 관리
```javascript
// modules/game/episodeFlow.js (예정)
class EpisodeFlow {
    initializeEpisode(episodeId, character) {
        // 36개 에피소드 초기화
    }
    
    checkProgressConditions(currentState) {
        // 진행 조건 확인
    }
}
```

## 다음 작업 계획
- **Phase 2-2**: 게임 로직 모듈 구현
  - 선택지 & 호감도 계산 로직
  - 직접 입력 & 자유 채팅 모드  
  - 에피소드(36퀘스트) 흐름 관리
- 다른 MBTI 캐릭터 추가
- 시나리오 확장
- 대화 메모리 시스템

---
*업데이트: 2025-09-02*
*상태: Phase 2-1 완료, Phase 2-2 준비 중*