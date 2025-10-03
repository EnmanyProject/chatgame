# Scenario Schema Guide

## 📋 Overview

This guide explains the template-based scenario system for romantic messenger chat scenarios. The system uses dynamic variable substitution to create personalized dialogue experiences based on character data.

**Version**: 1.0.0
**Last Updated**: 2025-10-03

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────┐
│          Scenario Schema                │
│    (data/scenario-schema.json)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       Sample Scenarios (3)              │
│  - Late Night Confession (sexy: 6)      │
│  - Morning After Chat (sexy: 7)         │
│  - Date Planning (sexy: 4)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       Scenario Engine                   │
│  - Template Rendering                   │
│  - Variable Mapping                     │
│  - Compatibility Check                  │
│  - Affection Calculation                │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       Scenario Validator                │
│  - Metadata Validation                  │
│  - Structure Validation                 │
│  - Beat/Choice Validation               │
└─────────────────────────────────────────┘
```

---

## 📊 Data Structure

### Scenario Object

```json
{
  "id": "scenario_id_v1",
  "metadata": { ... },
  "structure": {
    "acts": [ ... ]
  },
  "compatibility": { ... }
}
```

### Hierarchy

```
Scenario
└── Acts (1-N)
    └── Beats (1-N)
        └── Choices (2-4)
```

---

## 🔤 Template Variables

### Available Variables

| Variable | Source | Example |
|----------|--------|---------|
| `${char_name}` | character.basic_info.name | "윤아" |
| `${char_age}` | character.basic_info.age | 22 |
| `${char_mbti}` | character.basic_info.mbti | "INFP" |
| `${char_occupation}` | character.basic_info.occupation | "대학생" |
| `${char_style}` | character.physical_allure.appearance.style | "캐주얼" |
| `${char_hair}` | character.physical_allure.appearance.hair_color | "갈색" |
| `${char_eye}` | character.physical_allure.appearance.eye_color | "갈색" |
| `${char_height}` | character.physical_allure.body_profile.height | "165cm" |
| `${char_bust}` | character.physical_allure.body_profile.bust_size | "C컵" |
| `${char_hobby}` | character.appeal_profile.hobbies[0] | "그림 그리기" |
| `${char_charm_point}` | character.appeal_profile.charm_point | "미소" |
| `${char_personality}` | character.appeal_profile.personality_traits[0] | "따뜻함" |
| `${char_speech_style}` | character.conversation_dynamics.speech_style | "부드러운" |
| `${char_emoji_usage}` | character.conversation_dynamics.emoji_usage | "moderate" |
| `${user_name}` | gameState.userName | "오빠" |
| `${affection}` | gameState.affection | 15 |
| `${time_of_day}` | context.timeOfDay | "낮" |

### Usage Example

**Template**:
```json
{
  "npc_dialogue_template": "${char_name}: 오빠... ${char_hobby} 하고 싶어 😊"
}
```

**Character Data**:
```json
{
  "basic_info": { "name": "윤아" },
  "appeal_profile": { "hobbies": ["그림 그리기"] }
}
```

**Rendered Output**:
```
윤아: 오빠... 그림 그리기 하고 싶어 😊
```

---

## 📝 Metadata Fields

### Required Fields

```json
{
  "title": "시나리오 제목",
  "genre": "sensual_romance",
  "sexy_level": 6,
  "tags": ["태그1", "태그2"]
}
```

### Genre Types

| Genre | Description |
|-------|-------------|
| `sensual_romance` | 감각적이고 로맨틱한 분위기 |
| `sweet_romance` | 달콤하고 순수한 로맨스 |
| `passionate_love` | 열정적이고 강렬한 사랑 |
| `playful_flirt` | 장난스럽고 가벼운 썸 |
| `emotional_connection` | 감정적 교감과 깊은 대화 |

### Sexy Level Scale

| Level | Description | Example |
|-------|-------------|---------|
| 1-3 | 순수하고 건전한 대화 | 친구처럼 편안한 대화 |
| 4-6 | 가벼운 스킨십과 설렘 | 손 잡기, 볼 터치 |
| 7-8 | 감각적이고 로맨틱한 분위기 | 포옹, 키스 암시 |
| 9-10 | 매우 야하고 대담한 표현 | 직접적인 성적 표현 |

---

## 🎭 Beat Types

### Beat Type Classification

| Type | Purpose | Example |
|------|---------|---------|
| `introduction` | 대화 시작, 상황 소개 | 첫 메시지, 인사 |
| `flirtation` | 가벼운 작업, 설렘 유발 | 칭찬, 장난스러운 대화 |
| `confession` | 감정 고백, 진심 표현 | 좋아한다는 고백 |
| `response` | 반응, 응답 | 고백에 대한 답변 |
| `escalation` | 관계 진전, 감정 고조 | 더 깊은 감정 표현 |
| `resolution` | 마무리, 다음 약속 | 데이트 약속, 좋은 밤 인사 |

### Beat Structure

```json
{
  "beat_number": 1,
  "beat_type": "introduction",
  "template": {
    "npc_dialogue_template": "NPC 대사",
    "narration_template": "상황 설명",
    "choice_templates": [
      {
        "text_template": "선택지 텍스트",
        "affection_range": "medium",
        "tone": "gentle"
      }
    ],
    "emotion_hint": "감정 힌트"
  }
}
```

---

## 💕 Affection System

### Affection Ranges

| Range | Impact | Example Situation |
|-------|--------|-------------------|
| `negative` | -5 ~ -1 | 무례한 대답, 거절, 무시 |
| `neutral` | 0 | 평범한 반응, 사실 전달 |
| `low` | 1 ~ 3 | 예의 있는 답변, 기본적 관심 |
| `medium` | 4 ~ 6 | 친근한 대화, 적극적 반응 |
| `high` | 7 ~ 10 | 애정 표현, 깊은 관심 |
| `critical` | 11 ~ 15 | 고백, 스킨십, 사랑 표현 |

### Affection Impact Calculation

```javascript
// Example: calculateAffectionImpact("high")
// Returns: 7-10 사이의 랜덤 정수

const ranges = {
  'negative': { min: -5, max: -1 },
  'neutral': { min: 0, max: 0 },
  'low': { min: 1, max: 3 },
  'medium': { min: 4, max: 6 },
  'high': { min: 7, max: 10 },
  'critical': { min: 11, max: 15 }
};
```

---

## 🎨 Choice Tones

### Tone Types

| Tone | Characteristic | Example |
|------|---------------|---------|
| `caring` | 배려심 있고 다정함 | "괜찮아? 힘들면 말해" |
| `playful` | 장난스럽고 가벼움 | "ㅋㅋㅋ 귀엽네~" |
| `passionate` | 열정적이고 진지함 | "너 정말 좋아해..." |
| `respectful` | 예의 바르고 정중함 | "네 의견이 중요해요" |
| `bold` | 대담하고 직설적 | "지금 만나. 보고 싶어" |
| `gentle` | 부드럽고 온화함 | "천천히 얘기해봐" |

### Choice Structure

```json
{
  "text_template": "\"안녕\" 밝게 인사한다",
  "affection_range": "medium",
  "tone": "playful",
  "next_beat_hint": "friendly_response"
}
```

---

## 🔍 Compatibility System

### Compatibility Check

```json
{
  "compatibility": {
    "mbti_best_fit": ["INFP", "ENFP", "ISFJ"],
    "personality_requirements": {
      "min_sexual_comfort": 5,
      "min_confidence": 3,
      "required_hobbies": ["예술", "음악"]
    }
  }
}
```

### MBTI Compatibility

**Example**: Scenario optimized for INFP
- ✅ INFP character → Perfect match
- ✅ ENFP character → Compatible
- ❌ ESTJ character → Incompatible (not in best_fit list)

### Personality Requirements

| Field | Description | Range |
|-------|-------------|-------|
| `min_sexual_comfort` | 최소 성적 편안함 수준 | 1-10 |
| `min_confidence` | 최소 자신감 수준 | 1-10 |
| `required_hobbies` | 필수 취미 (옵션) | 문자열 배열 |

---

## 🔧 Engine Functions

### 1. renderTemplate

**Purpose**: Replace template variables with actual values

```javascript
import { renderTemplate } from './lib/scenario-engine.js';

const template = "${char_name}는 ${char_age}살입니다.";
const variables = { char_name: "윤아", char_age: 22 };
const result = renderTemplate(template, variables);
// Output: "윤아는 22살입니다."
```

### 2. validateScenario

**Purpose**: Validate entire scenario structure

```javascript
import { validateScenario } from './lib/scenario-engine.js';

const scenario = { /* scenario object */ };
const result = validateScenario(scenario);

if (!result.valid) {
  console.error('Errors:', result.errors);
}
```

### 3. mapCharacterToVariables

**Purpose**: Convert character object to template variables

```javascript
import { mapCharacterToVariables } from './lib/scenario-engine.js';

const character = {
  basic_info: { name: "윤아", age: 22, mbti: "INFP" },
  appeal_profile: { hobbies: ["그림 그리기"] }
};

const variables = mapCharacterToVariables(character);
// Output: { char_name: "윤아", char_age: 22, ... }
```

### 4. checkCompatibility

**Purpose**: Check scenario-character compatibility

```javascript
import { checkCompatibility } from './lib/scenario-engine.js';

const scenario = {
  compatibility: {
    mbti_best_fit: ["INFP"],
    personality_requirements: {
      min_sexual_comfort: 5,
      min_confidence: 3
    }
  }
};

const character = {
  basic_info: { mbti: "INFP" },
  appeal_profile: {
    sexual_comfort: 7,
    confidence_level: 5
  }
};

const result = checkCompatibility(scenario, character);
// Output: { compatible: true, reasons: [...] }
```

### 5. calculateAffectionImpact

**Purpose**: Convert affection range to numeric value

```javascript
import { calculateAffectionImpact } from './lib/scenario-engine.js';

const impact = calculateAffectionImpact("high");
// Output: Random integer between 7-10
```

---

## ✅ Validator Functions

### 1. validateMetadata

**Purpose**: Validate scenario metadata

```javascript
import { validateMetadata } from './lib/scenario-validator.js';

const metadata = {
  title: "늦은 밤의 고백",
  genre: "sensual_romance",
  sexy_level: 6,
  tags: ["술", "고백"]
};

const result = validateMetadata(metadata);
// Output: { valid: true, errors: [] }
```

### 2. validateStructure

**Purpose**: Validate scenario structure (Acts)

```javascript
import { validateStructure } from './lib/scenario-validator.js';

const structure = {
  acts: [
    { act_number: 1, beats: [...] }
  ]
};

const result = validateStructure(structure);
```

### 3. validateBeat

**Purpose**: Validate individual Beat

```javascript
import { validateBeat } from './lib/scenario-validator.js';

const beat = {
  beat_number: 1,
  beat_type: "introduction",
  template: { /* template data */ }
};

const result = validateBeat(beat, "Act 1, Beat 1");
```

### 4. validateChoice

**Purpose**: Validate individual choice

```javascript
import { validateChoice } from './lib/scenario-validator.js';

const choice = {
  text_template: "\"안녕\" 인사한다",
  affection_range: "medium",
  tone: "gentle"
};

const result = validateChoice(choice, "Choice 1");
```

---

## 📖 Sample Scenarios

### 1. Late Night Confession (sexy: 6)

**Genre**: sensual_romance
**Acts**: 3
**Target MBTI**: INFP, ENFP, ISFJ, INFJ

**Story Flow**:
1. Act 1: 어색한 아침 인사 (부끄러움)
2. Act 2: 깊어지는 감정 (설렘, 그리움)
3. Act 3: 달콤한 마무리 (행복)

**File**: `/data/scenarios/sample-late-night-confession.json`

### 2. Morning After Chat (sexy: 7)

**Genre**: passionate_love
**Acts**: 2
**Target MBTI**: ENFP, ESFP, ENFJ, ESTP

**Story Flow**:
1. Act 1: 잠에서 깬 첫 메시지 (대담함)
2. Act 2: 더 깊어지는 관계 (사랑 고백)

**File**: `/data/scenarios/sample-morning-after.json`

### 3. Date Planning (sexy: 4)

**Genre**: sweet_romance
**Acts**: 2
**Target MBTI**: All MBTI types

**Story Flow**:
1. Act 1: 데이트 제안하기 (설렘)
2. Act 2: 구체적인 계획 세우기 (기대)

**File**: `/data/scenarios/sample-date-planning.json`

---

## 🚀 Usage Example

### Complete Workflow

```javascript
// 1. Load scenario and character
const scenario = await loadScenario("late_night_confession_v1");
const character = await loadCharacter("yuna_infp");

// 2. Check compatibility
const compatResult = checkCompatibility(scenario, character);
if (!compatResult.compatible) {
  console.warn('Compatibility issues:', compatResult.reasons);
}

// 3. Map character to variables
const variables = mapCharacterToVariables(character);

// 4. Render first beat
const firstBeat = scenario.structure.acts[0].beats[0];
const npcDialogue = renderTemplate(
  firstBeat.template.npc_dialogue_template,
  variables
);
const narration = renderTemplate(
  firstBeat.template.narration_template,
  variables
);

// 5. Render choices
const choices = firstBeat.template.choice_templates.map(choice => ({
  text: renderTemplate(choice.text_template, variables),
  affection: calculateAffectionImpact(choice.affection_range),
  tone: choice.tone
}));

// 6. Display to user
displayMessage(npcDialogue);
displayNarration(narration);
displayChoices(choices);
```

---

## 🔒 Validation Best Practices

### Before Saving Scenario

```javascript
// 1. Validate metadata
const metaResult = validateMetadata(scenario.metadata);
if (!metaResult.valid) {
  throw new Error('Metadata errors: ' + metaResult.errors.join(', '));
}

// 2. Validate structure
const structResult = validateStructure(scenario.structure);
if (!structResult.valid) {
  throw new Error('Structure errors: ' + structResult.errors.join(', '));
}

// 3. Validate all beats and choices
scenario.structure.acts.forEach((act, actIndex) => {
  act.beats.forEach((beat, beatIndex) => {
    const beatResult = validateBeat(beat, `Act ${actIndex + 1}, Beat ${beatIndex + 1}`);
    if (!beatResult.valid) {
      throw new Error(beatResult.errors.join(', '));
    }

    beat.template.choice_templates.forEach((choice, choiceIndex) => {
      const choiceResult = validateChoice(
        choice,
        `Act ${actIndex + 1}, Beat ${beatIndex + 1}, Choice ${choiceIndex + 1}`
      );
      if (!choiceResult.valid) {
        throw new Error(choiceResult.errors.join(', '));
      }
    });
  });
});

// 4. Full scenario validation
const fullResult = validateScenario(scenario);
if (!fullResult.valid) {
  throw new Error('Scenario validation failed: ' + fullResult.errors.join(', '));
}

// Safe to save
await saveScenario(scenario);
```

---

## 📚 Additional Resources

### Related Files

- **Schema Definition**: `/data/scenario-schema.json`
- **Sample Scenarios**: `/data/scenarios/sample-*.json`
- **Engine Module**: `/lib/scenario-engine.js`
- **Validator Module**: `/lib/scenario-validator.js`

### Testing

```bash
# Test scenario engine
node lib/scenario-engine.js

# Test scenario validator
node lib/scenario-validator.js
```

---

## 🐛 Common Issues

### Issue: Variables not replaced

**Problem**: `${char_name}` appears as-is in output

**Solution**: Ensure character data is properly mapped
```javascript
const variables = mapCharacterToVariables(character);
const result = renderTemplate(template, variables);
```

### Issue: Validation fails

**Problem**: Scenario validation returns errors

**Solution**: Check error messages for specific field issues
```javascript
const result = validateScenario(scenario);
console.log(result.errors);  // See specific issues
```

### Issue: Incompatible character

**Problem**: Character doesn't match scenario requirements

**Solution**: Check compatibility first
```javascript
const result = checkCompatibility(scenario, character);
if (!result.compatible) {
  console.log('Reasons:', result.reasons);
  // Choose different scenario or character
}
```

---

## 📝 Version History

- **v1.0.0** (2025-10-03): Initial schema and engine implementation
  - Created scenario schema with template variable system
  - Implemented 5 engine functions
  - Implemented 4 validator functions
  - Created 3 sample scenarios
  - Complete documentation

---

**End of Guide**
