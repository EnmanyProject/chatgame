# Episode System v2.1 - Dialogue Content & Affection System

## 🎮 에피소드의 본질
에피소드는 **캐릭터의 대화 콘텐츠**로, 채팅방에 전송되어 유저가 게임처럼 플레이하는 대화들입니다.

### 핵심 구성요소
- **캐릭터 대사**: 감정과 상황이 담긴 대화
- **객관식 선택지**: 유저가 선택하여 호감도/애정도 변화
- **주관식 입력**: AI가 판정하여 호감도/애정도 부여

## 💕 호감도 vs 애정도

### 호감도 (Affection)
- **영향**: 대화의 **톤과 표현**
- **범위**: 0~100
- **예시**:
  - 0-20: 차갑고 무뚝뚝한 톤
  - 21-40: 정중하고 예의바른 톤
  - 41-60: 친근하고 편안한 톤
  - 61-80: 따뜻하고 다정한 톤
  - 81-100: 애교 섞인 밝은 톤

### 애정도 (Intimacy)
- **영향**: **호칭과 허용되는 답변 내용**
- **범위**: 0~100
- **예시**:
  - 0-20: "~님", "~씨" (존칭)
  - 21-40: 이름 호칭
  - 41-60: "오빠", "언니" 등 친밀한 호칭
  - 61-80: 애칭 사용
  - 81-100: 특별한 애칭, 스킨십 허용

## 📊 에피소드 데이터 구조

```json
{
  "id": "ep_시은_첫만남_abc123",
  "character_id": "시은_istp_1759986928556",
  "scenario_template_id": "첫_만남",
  "title": "시은과의 첫 만남",
  "description": "카페에서 우연히 마주친 시은과의 대화",

  // ===== 트리거 조건 (전송 기준) =====
  "trigger_conditions": {
    "affection_min": 0,
    "affection_max": 10,
    "intimacy_min": 0,
    "intimacy_max": 5,
    "time_based": null,
    "event_based": null,
    "priority": 5
  },

  // ===== AI 생성 시 기준값 =====
  "generation_context": {
    "base_affection": 5,        // 생성 시 호감도 (톤 결정)
    "base_intimacy": 2,          // 생성 시 애정도 (호칭 결정)
    "tone_style": "friendly",    // cold/friendly/warm/intimate
    "formality": "polite",       // formal/polite/casual/intimate
    "scenario_length": "medium"  // short/medium/long
  },

  "status": "pending",
  "difficulty": "Easy",
  "estimated_duration": "5-10분",
  "created_at": "2025-10-09T...",
  "last_edited_at": null,

  // ===== 대화 플로우 (순차 진행) =====
  "dialogue_flow": [
    {
      "sequence": 1,
      "type": "narration",
      "content": "카페에서 책을 읽고 있던 시은이 우연히 눈이 마주쳤다."
    },
    {
      "sequence": 2,
      "type": "character_dialogue",
      "speaker": "시은",
      "text": "어? 여기서 만나다니... 우연이네요.",
      "emotion": "surprised",
      "narration": "시은이 놀란 표정으로 당신을 바라본다."
    },
    {
      "sequence": 3,
      "type": "multiple_choice",
      "question": "시은에게 어떻게 답할까?",
      "choices": [
        {
          "id": "choice_1",
          "text": "정말 반갑네요! 여기 자주 오세요?",
          "affection_change": 2,
          "intimacy_change": 1,
          "consequence": "시은이 미소를 지으며 대화가 이어진다.",
          "next_dialogue_id": "response_1"
        },
        {
          "id": "choice_2",
          "text": "네, 우연이네요. (무덤덤하게)",
          "affection_change": 0,
          "intimacy_change": 0,
          "consequence": "시은이 약간 어색한 표정을 짓는다.",
          "next_dialogue_id": "response_2"
        },
        {
          "id": "choice_3",
          "text": "시은씨도 여기 자주 와요? (관심있게)",
          "affection_change": 3,
          "intimacy_change": 2,
          "consequence": "시은이 활짝 웃으며 자리를 권한다.",
          "next_dialogue_id": "response_3"
        }
      ]
    },
    {
      "sequence": 4,
      "type": "character_dialogue",
      "speaker": "시은",
      "text": "[선택지에 따른 분기 반응]",
      "conditional_responses": {
        "response_1": {
          "text": "네! 저 여기 단골이에요. 조용해서 그림 그리기 좋거든요.",
          "emotion": "happy",
          "narration": "시은이 환하게 웃으며 자신의 스케치북을 보여준다."
        },
        "response_2": {
          "text": "네... 그러게요.",
          "emotion": "awkward",
          "narration": "시은이 어색하게 미소 짓고는 다시 책에 시선을 돌린다."
        },
        "response_3": {
          "text": "네, 거의 매일 와요! 앉으시지 않을래요?",
          "emotion": "excited",
          "narration": "시은이 기쁜 표정으로 맞은편 자리를 가리킨다."
        }
      }
    },
    {
      "sequence": 5,
      "type": "free_input",
      "question": "시은에게 무슨 말을 해볼까?",
      "prompt_hint": "시은과 자연스럽게 대화를 이어가보세요.",
      "context": "카페에서 시은과 대화 중",
      "ai_evaluation": {
        "model": "gpt-4o-mini",
        "criteria": [
          "적절한 호칭 사용 (현재 애정도 기준)",
          "대화 맥락에 맞는 내용",
          "예의 바른 표현",
          "시은의 관심사(그림, 예술) 반영"
        ],
        "scoring": {
          "excellent": { "affection": 5, "intimacy": 3 },
          "good": { "affection": 3, "intimacy": 2 },
          "normal": { "affection": 1, "intimacy": 1 },
          "poor": { "affection": -1, "intimacy": 0 },
          "inappropriate": { "affection": -3, "intimacy": -2 }
        }
      }
    },
    {
      "sequence": 6,
      "type": "character_dialogue",
      "speaker": "시은",
      "text": "[AI가 유저 입력에 대한 반응 생성]",
      "ai_generated": true,
      "generation_params": {
        "model": "gpt-4o-mini",
        "consider_previous_choices": true,
        "consider_current_affection": true,
        "consider_current_intimacy": true
      }
    }
  ],

  // ===== 통계 =====
  "statistics": {
    "total_dialogues": 6,
    "choice_points": 1,
    "free_input_points": 1,
    "max_affection_gain": 10,
    "max_intimacy_gain": 6,
    "average_play_time": "8분"
  },

  "play_stats": {
    "played_count": 0,
    "best_affection_gain": 0,
    "best_intimacy_gain": 0,
    "completion_rate": 0
  }
}
```

## 🎯 에피소드 생성 프로세스

### 1. 관리자 입력
```
- 시나리오 템플릿 선택
- 호감도/애정도 기준값 설정
- 길이 설정 (short/medium/long)
```

### 2. AI 대화 생성
```
입력값:
- character_info (캐릭터 프로필)
- base_affection (호감도 → 톤 결정)
- base_intimacy (애정도 → 호칭 결정)
- scenario_template (상황 설정)
- length (대화 길이)

출력:
- dialogue_flow[] (순차적 대화 흐름)
  - 대사, 객관식, 주관식이 적절히 섞임
```

### 3. 관리자 편집
```
- 생성된 대화 수정/추가/삭제
- 선택지 호감도/애정도 조정
- 트리거 조건 설정
```

## 🔧 AI 판정 시스템

### 주관식 답변 평가 프로세스
```javascript
// 1. 유저 입력 받기
user_input = "시은씨 그림 정말 잘 그리시네요! 전공이세요?"

// 2. AI 평가 요청
evaluation = await evaluateUserInput({
  user_input: user_input,
  character: character_profile,
  current_affection: 15,
  current_intimacy: 8,
  context: dialogue_context,
  criteria: evaluation_criteria
})

// 3. 평가 결과
{
  "score": "good",
  "affection_change": 3,
  "intimacy_change": 2,
  "feedback": "적절한 관심 표현과 존중하는 태도",
  "character_response": "네! 전공은 아니고 취미예요. 관심 가져주셔서 고마워요!"
}
```

### 평가 기준
1. **호칭 적절성**: 현재 애정도에 맞는 호칭 사용
2. **맥락 일치**: 이전 대화 흐름과 자연스러운 연결
3. **예의**: 존중하고 배려하는 표현
4. **관심사 반영**: 캐릭터의 특성/취미/성격 고려

## 📡 API 엔드포인트

### 에피소드 생성 (AI 활용)
```javascript
POST /api/episode-manager
{
  "action": "generate_episode",
  "character_id": "시은_istp_1759986928556",
  "scenario_template_id": "첫_만남",
  "generation_context": {
    "base_affection": 10,
    "base_intimacy": 5,
    "scenario_length": "medium"
  },
  "trigger_conditions": {
    "affection_min": 0,
    "affection_max": 20,
    "intimacy_min": 0,
    "intimacy_max": 10
  }
}
```

### 유저 입력 평가 (게임 플레이 중)
```javascript
POST /api/episode-manager
{
  "action": "evaluate_user_input",
  "episode_id": "ep_xxx",
  "dialogue_sequence": 5,
  "user_input": "시은씨 그림 정말 잘 그리시네요!",
  "current_affection": 15,
  "current_intimacy": 8
}
```

## 🎮 게임 플레이 흐름

```
1. 트리거 체크
   └─ 호감도 15, 애정도 8 → "첫 만남" 에피소드 활성화

2. 에피소드 채팅방 전송
   └─ status: pending → sent

3. 유저 플레이
   ├─ 대사 읽기
   ├─ 객관식 선택 → 호감도+2, 애정도+1
   ├─ 대사 읽기
   ├─ 주관식 입력 → AI 판정 → 호감도+3, 애정도+2
   └─ 완료

4. 결과 저장
   └─ status: sent → completed
   └─ 호감도 15→20, 애정도 8→11 저장
```

## 🔄 버전 히스토리

- **v2.1** (2025-10-09): 호감도/애정도 시스템, 대화 플로우, AI 판정 추가
- **v2.0** (2025-10-09): 캐릭터 중심 구조로 전환
- **v1.0** (2025-09-29): 시나리오 기반 초기 구조 (deprecated)
