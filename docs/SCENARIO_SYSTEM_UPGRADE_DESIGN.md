# 시나리오 시스템 업그레이드 설계서

## 📋 Executive Summary

본 문서는 기존 소설형 시나리오 시스템을 메신저 대화 스크립트 기반 시스템으로 전환하기 위한 상세 아키텍처 설계를 제공합니다.

**주요 변경사항:**
- 소설형 콘텐츠(`ai_generated_context`) → 메신저 대화 스크립트(`dialogue_script`)
- 기승전결 구조(`story_structure`) 제거
- 선택지 개수 기반 시나리오 길이 관리 (4~36개)
- 대화 블록 편집기 UI 구현 (메시지/선택지/주관식)
- AI 자동 생성 시스템 v2.0

**예상 작업 시간:** 5시간 (6개 Step)
**예상 완료일:** 2025-10-12

---

## 1. 현재 시스템 분석

### 1.1 기존 데이터 구조

**현재 scenario-database.json 구조:**
```javascript
{
  "metadata": {
    "version": "1.0.0",
    "total_scenarios": 4,
    "ai_context_engine": "gpt-4o-mini"
  },
  "scenarios": {
    "scenario_제목_timestamp": {
      "id": "scenario_제목_timestamp",
      "title": "시나리오 제목",
      "description": "한 줄 설명",
      "ai_generated_context": "600-900자 소설형 텍스트", // ❌ 제거 예정
      "metadata": {
        "genre": "temptation",
        "sexy_level": 8,
        "ai_model": "openai",
        "estimated_duration": "short"
      },
      "structure": {} // ❌ 기승전결 구조 (빈 객체, 제거 예정)
    }
  }
}
```

**문제점:**
1. `ai_generated_context`: 소설형 텍스트로 에피소드 생성이 어려움
2. `story_structure`: 기승전결 구조가 실제로 사용되지 않음 (빈 객체)
3. 에피소드 생성 시 `dialogue_flow`를 실시간으로 AI 생성해야 하므로 비효율적
4. 시나리오 길이 관리가 추상적 (short/medium/long)

### 1.2 현재 에피소드 생성 흐름

**episode-manager.js 분석:**
```
1. 시나리오 ID 선택
2. 캐릭터 정보 로드 (characters.json)
3. 시나리오 정보 로드 (scenario-database.json)
   → ai_generated_context 활용
4. AI 호출 (generateDialogueFlowWithAI)
   → dialogue_flow 실시간 생성 (15-25개 대화 블록)
5. 에피소드 저장 (character_episodes.json)
```

**비효율성:**
- 매 에피소드 생성마다 AI 호출 (시간 소요, 비용 발생)
- `ai_generated_context` 소설 텍스트를 dialogue_flow로 변환하는 과정에서 일관성 부족
- 관리자가 에피소드 콘텐츠를 직접 제어할 수 없음

### 1.3 현재 UI 구조

**scenario-admin.html 분석:**
- **시나리오 생성 모달:** 기본 정보만 입력 (제목, 설명, 장르, 섹시 레벨, 분위기)
- **AI 자동 생성:** `ai_generated_context` 소설 텍스트 생성
- **시나리오 카드:** AI 스토리 미리보기 표시 (노란색 박스)
- **에피소드 연결:** 시나리오 → 에피소드 생성 시 AI가 dialogue_flow 생성

**부족한 점:**
- 대화 스크립트를 직접 편집할 수 있는 UI 없음
- 시나리오 자체가 대화 구조를 포함하지 않음
- 에피소드 생성 시 매번 AI 호출 필요

---

## 2. 새 시스템 요구사항

### 2.1 핵심 요구사항

**Phase 1 목표:**
1. 시나리오에 `dialogue_script` 필드 추가 (메신저 대화 블록 배열)
2. 기존 `ai_generated_context`, `story_structure` 필드 제거
3. 선택지 개수 기반 길이 관리 (4/8/12/16/20/24/28/32/36개)
4. 대화 블록 편집기 UI 구현 (드래그 정렬, 추가/삭제)
5. AI 자동 생성 v2.0 (dialogue_script 직접 생성)
6. 미리보기 기능 (메신저 스타일 렌더링)

### 2.2 dialogue_script 구조

```javascript
"dialogue_script": [
  // 1. 메시지 블록 (캐릭터 대사)
  {
    "id": 1,
    "type": "message",
    "speaker": "소라",
    "text": "집에 왔는데 갑자기 네 생각나서 톡해.",
    "emotion": "neutral", // neutral/shy/excited/sad/angry/longing/playful/serious
    "timestamp": "19:23" // 선택적
  },

  // 2. 연속 메시지 (시간 없이)
  {
    "id": 2,
    "type": "message",
    "speaker": "소라",
    "text": "오늘도 하루종일 정신없었는데, 이상하게 네 목소리 듣고 싶더라.",
    "emotion": "longing"
  },

  // 3. 주관식 입력 (AI 평가)
  {
    "id": 3,
    "type": "user_input",
    "placeholder": "답장을 입력하세요...",
    "evaluation_keywords": ["무슨일", "괜찮아", "피곤해"]
  },

  // 4. 선택지 (객관식)
  {
    "id": 4,
    "type": "choice",
    "question": "솔직히 말해봐. 그날 무슨 생각했어?", // 선택적
    "options": [
      {
        "id": "A",
        "text": "너도 나 생각했어? (적극적)",
        "affection_change": 3
      },
      {
        "id": "B",
        "text": "뭐 먹었어? (중립적)",
        "affection_change": 0
      },
      {
        "id": "C",
        "text": "그냥 좀 피곤했어 (소극적)",
        "affection_change": 1
      }
    ]
  }
]
```

### 2.3 선택지 개수와 예상 시간

| 선택지 개수 | 예상 시간 | 총 블록 수 | 대사:선택지 비율 |
|------------|----------|-----------|----------------|
| 4개 | 5-10분 | 15-20개 | 3:1 |
| 8개 | 10-15분 | 30-40개 | 3:1 |
| 12개 | 15-20분 | 45-55개 | 3:1 |
| 16개 | 20-25분 | 60-70개 | 3:1 |
| 20개 | 25-30분 | 75-85개 | 3:1 |
| 24개 | 30-35분 | 90-100개 | 3:1 |
| 28개 | 35-40분 | 105-115개 | 3:1 |
| 32개 | 40-45분 | 120-130개 | 3:1 |
| 36개 | 45-60분 | 135-150개 | 3:1 |

**계산 로직:**
- 각 선택지 전후로 평균 3-4개의 메시지 블록
- 1개 선택지 = 약 4-5개 블록 (메시지 2-3개 + 선택지 + 메시지 1-2개)

---

## 3. 아키텍처 설계

### 3.1 시스템 구조 비교

**기존 구조:**
```
scenario-database.json
  ├─ metadata
  └─ scenarios
      └─ scenario_ID
          ├─ ai_generated_context (소설 텍스트)
          ├─ story_structure (기승전결, 빈 객체)
          └─ metadata

                ↓ 에피소드 생성 시

episode-manager.js
  ├─ loadScenarioInfo() → ai_generated_context
  ├─ generateDialogueFlowWithAI() → AI 실시간 생성
  └─ saveCharacterEpisodes() → dialogue_flow 저장
```

**새 구조:**
```
scenario-database.json (v2.0)
  ├─ metadata (version: 2.0.0)
  └─ scenarios
      └─ scenario_ID
          ├─ dialogue_script [배열] ✨ 신규
          │   ├─ message 블록 (캐릭터 대사)
          │   ├─ user_input 블록 (주관식)
          │   └─ choice 블록 (객관식 선택지)
          ├─ total_choices (4~36) ✨ 신규
          └─ metadata

                ↓ 에피소드 생성 시

episode-manager.js (개선)
  ├─ loadScenarioInfo() → dialogue_script
  ├─ 캐릭터별 톤/감정 적용 (호감도/애정도 기반)
  └─ saveCharacterEpisodes() → dialogue_script 재사용
```

### 3.2 데이터 흐름 다이어그램

```
[관리자]
   ↓
   1. 시나리오 생성 모달 열기
   ↓
   2. 기본 정보 입력
      - 제목, 설명
      - 장르, 섹시 레벨, 분위기
      - 선택지 개수 (4~36)
   ↓
   3-A. AI 자동 생성 클릭 (추천)
      → AI가 dialogue_script 생성
      → 대화 스크립트 탭에 자동 로드

   3-B. 수동 작성
      → 대화 스크립트 탭 이동
      → 블록 추가 (메시지/선택지/주관식)
   ↓
   4. 미리보기 확인
      → 메신저 스타일 렌더링
   ↓
   5. 저장 (GitHub API)
      → scenario-database.json 업데이트

[게임 플레이어]
   ↓
   1. 캐릭터 선택
   ↓
   2. 시나리오 선택
   ↓
   3. 에피소드 생성 (Episode Manager)
      - dialogue_script 로드
      - 캐릭터 특성 적용 (호감도/애정도)
      - 톤 변환 (ToneVariationEngine)
   ↓
   4. 대화 플레이
      - 선택지 선택 → 호감도/애정도 변화
      - 주관식 입력 → AI 평가
   ↓
   5. 에피소드 완료
      - 통계 저장
      - 호감도/애정도 누적
```

### 3.3 컴포넌트 의존성 맵

```
┌────────────────────────────────────────────┐
│      scenario-admin.html (Frontend)        │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │    DialogueBlockEditor             │   │
│  │  - addMessageBlock()               │   │
│  │  - addChoiceBlock()                │   │
│  │  - addUserInputBlock()             │   │
│  │  - deleteBlock()                   │   │
│  │  - collectDialogueScript()         │   │
│  └────────────────────────────────────┘   │
│                ↓                           │
│  ┌────────────────────────────────────┐   │
│  │    PreviewRenderer                 │   │
│  │  - previewDialogue()               │   │
│  │  - renderMessengerStyle()          │   │
│  └────────────────────────────────────┘   │
│                ↓                           │
│  ┌────────────────────────────────────┐   │
│  │    ScenarioDataManager             │   │
│  │  - saveScenario()                  │   │
│  │  - loadScenario()                  │   │
│  │  - displayScenarios()              │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
                 ↓ API 호출
┌────────────────────────────────────────────┐
│     api/scenario-manager.js (Backend)      │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │    DialogueGeneratorV2             │   │
│  │  - generateDialogueScript()        │   │
│  │  - buildMessengerPrompt()          │   │
│  │  - parseDialogueJSON()             │   │
│  └────────────────────────────────────┘   │
│                ↓                           │
│  ┌────────────────────────────────────┐   │
│  │    GitHubAPIManager                │   │
│  │  - loadFromGitHub()                │   │
│  │  - saveToGitHub()                  │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
                 ↓ 저장
┌────────────────────────────────────────────┐
│  data/scenarios/scenario-database.json     │
│    - dialogue_script 배열 포함            │
└────────────────────────────────────────────┘
```

---

## 4. 컴포넌트 상세 설계

### 4.1 DialogueBlockEditor (프론트엔드)

**책임:**
- 대화 블록 추가/삭제/편집
- 드래그앤드롭 정렬 (선택적, Phase 2)
- 블록 데이터를 JSON으로 변환

**인터페이스:**
```javascript
class DialogueBlockEditor {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.blockIdCounter = 1;
  }

  // 메시지 블록 추가
  addMessageBlock(data = null) {
    const blockId = this.blockIdCounter++;
    const html = this.createMessageBlockHTML(blockId, data);
    this.container.insertAdjacentHTML('beforeend', html);
  }

  // 선택지 블록 추가
  addChoiceBlock(data = null) {
    const blockId = this.blockIdCounter++;
    const html = this.createChoiceBlockHTML(blockId, data);
    this.container.insertAdjacentHTML('beforeend', html);
  }

  // 주관식 블록 추가
  addUserInputBlock(data = null) {
    const blockId = this.blockIdCounter++;
    const html = this.createUserInputBlockHTML(blockId, data);
    this.container.insertAdjacentHTML('beforeend', html);
  }

  // 블록 삭제
  deleteBlock(blockId) {
    const block = this.container.querySelector(`[data-id="${blockId}"]`);
    if (block) {
      block.remove();
    }
  }

  // 모든 블록 데이터 수집
  collectDialogueScript() {
    const blocks = this.container.querySelectorAll('.dialogue-block');
    const script = [];

    blocks.forEach((block, index) => {
      const type = this.getBlockType(block);
      const data = this.extractBlockData(block, type, index + 1);
      script.push(data);
    });

    return script;
  }

  // 블록 데이터 로드 (수정 시)
  loadDialogueScript(dialogueScript) {
    this.container.innerHTML = '';
    this.blockIdCounter = 1;

    dialogueScript.forEach(block => {
      if (block.type === 'message') {
        this.addMessageBlock(block);
      } else if (block.type === 'choice') {
        this.addChoiceBlock(block);
      } else if (block.type === 'user_input') {
        this.addUserInputBlock(block);
      }
    });
  }

  // 헬퍼 메서드들
  createMessageBlockHTML(blockId, data) { /* HTML 생성 */ }
  createChoiceBlockHTML(blockId, data) { /* HTML 생성 */ }
  createUserInputBlockHTML(blockId, data) { /* HTML 생성 */ }
  getBlockType(blockElement) { /* 타입 판별 */ }
  extractBlockData(blockElement, type, id) { /* 데이터 추출 */ }
}
```

### 4.2 DialogueGeneratorV2 (백엔드)

**책임:**
- AI를 사용하여 dialogue_script 생성
- 선택지 개수에 맞는 대화 블록 생성
- JSON 안정성 보장

**인터페이스:**
```javascript
// api/scenario-manager.js
async function generateDialogueScript(
  title,
  description,
  genre,
  sexyLevel,
  mood,
  totalChoices
) {
  // 총 메시지 수 계산
  const totalMessages = totalChoices * 6; // 선택지 1개당 평균 6개 블록

  // AI 프롬프트 구성
  const prompt = buildDialogueScriptPrompt({
    title,
    description,
    genre,
    sexyLevel,
    mood,
    totalChoices,
    totalMessages
  });

  // OpenAI API 호출 (JSON Mode)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" }, // ✨ JSON Mode
      temperature: 0.8,
      max_tokens: totalChoices * 200 // 선택지당 200토큰
    })
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  // JSON 파싱
  const parsed = JSON.parse(content);

  // 검증
  validateDialogueScript(parsed.dialogue_script, totalChoices);

  return parsed.dialogue_script;
}

// 프롬프트 구성
function buildDialogueScriptPrompt(params) {
  return `당신은 한국 로맨스 메신저 대화 시나리오 작가입니다.

다음 조건으로 메신저 대화 시나리오를 작성하세요:

제목: ${params.title}
설명: ${params.description}
장르: ${params.genre}
섹시 레벨: ${params.sexyLevel}/10
분위기: ${params.mood}
선택지 개수: ${params.totalChoices}개

# 작성 규칙
1. 메신저 대화 형식 (연속 메시지 허용)
2. 캐릭터가 2~4개 메시지 연속 전송 후 사용자 반응
3. 약 5~7개 메시지마다 선택지 1개 배치
4. 선택지는 항상 3개 옵션 (적극적/중립적/소극적)
5. 감정 태그: neutral, shy, excited, sad, angry, longing, playful, serious
6. 말줄임(...), 이모티콘 표현 자주 사용
7. 시간: 저녁~밤 (19:00~23:00)

# 출력 형식 (JSON)
{
  "dialogue_script": [
    {
      "id": 1,
      "type": "message",
      "speaker": "캐릭터명",
      "text": "대사",
      "emotion": "neutral",
      "timestamp": "19:23"
    },
    {
      "id": 4,
      "type": "choice",
      "question": "질문?",
      "options": [
        { "id": "A", "text": "선택지1", "affection_change": 3 },
        { "id": "B", "text": "선택지2", "affection_change": 0 },
        { "id": "C", "text": "선택지3", "affection_change": 1 }
      ]
    }
  ]
}

총 ${params.totalMessages}개 블록과 ${params.totalChoices}개 선택지를 생성하세요.`;
}

// 검증
function validateDialogueScript(script, expectedChoices) {
  const choiceCount = script.filter(b => b.type === 'choice').length;

  if (choiceCount < expectedChoices) {
    console.warn(`⚠️ 선택지 부족: ${choiceCount}/${expectedChoices}`);
  }

  // speaker 필드 검증
  script.forEach(block => {
    if (block.type === 'message' && !block.speaker) {
      throw new Error('speaker 필드 누락');
    }
  });
}
```

### 4.3 PreviewRenderer (프론트엔드)

**책임:**
- dialogue_script를 메신저 스타일로 렌더링
- 감정 이모티콘 표시
- 선택지 호감도 변화 시각화

**인터페이스:**
```javascript
function previewDialogue() {
  const dialogueScript = collectDialogueScript();

  if (dialogueScript.length === 0) {
    alert('대화가 비어있습니다.');
    return;
  }

  const container = document.getElementById('preview-chat-container');
  container.innerHTML = '';

  dialogueScript.forEach(block => {
    if (block.type === 'message') {
      renderMessage(container, block);
    } else if (block.type === 'choice') {
      renderChoice(container, block);
    } else if (block.type === 'user_input') {
      renderUserInput(container, block);
    }
  });

  document.getElementById('dialoguePreviewModal').style.display = 'block';
}

function renderMessage(container, block) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'preview-message character';
  msgDiv.innerHTML = `
    <div><strong>${block.speaker}</strong></div>
    <div>${block.text}</div>
    ${block.timestamp ? `<div class="preview-timestamp">${block.timestamp}</div>` : ''}
    <div style="font-size: 0.8em; opacity: 0.8;">${getEmotionEmoji(block.emotion)}</div>
  `;
  container.appendChild(msgDiv);
}

function renderChoice(container, block) {
  const choiceDiv = document.createElement('div');
  choiceDiv.className = 'preview-choice-block';
  choiceDiv.innerHTML = `
    ${block.question ? `<div style="font-weight: bold; margin-bottom: 10px;">${block.question}</div>` : ''}
    ${block.options.map(opt => `
      <div class="preview-choice-option">
        ${opt.id}) ${opt.text}
        <span style="color: #667eea;">(${opt.affection_change > 0 ? '+' : ''}${opt.affection_change})</span>
      </div>
    `).join('')}
  `;
  container.appendChild(choiceDiv);
}

function renderUserInput(container, block) {
  const inputDiv = document.createElement('div');
  inputDiv.className = 'preview-message';
  inputDiv.style.background = '#e3f2fd';
  inputDiv.innerHTML = `
    <div>⌨️ 주관식 입력</div>
    <div style="font-size: 0.85em; color: #666;">${block.placeholder}</div>
  `;
  container.appendChild(inputDiv);
}

function getEmotionEmoji(emotion) {
  const map = {
    neutral: '😐', shy: '😳', excited: '😆',
    sad: '😢', angry: '😠', longing: '🥺',
    playful: '😏', serious: '😤'
  };
  return map[emotion] || '😐';
}
```

### 4.4 ScenarioDataManager (프론트엔드/백엔드 공통)

**책임:**
- scenario-database.json CRUD
- 데이터 구조 검증
- GitHub API 통신

**프론트엔드 인터페이스:**
```javascript
// scenario-admin.html
async function saveScenarioWithDialogue() {
  try {
    // 기본 정보 수집
    const basicInfo = {
      id: document.getElementById('scenarioId').value || `scenario_${Date.now()}`,
      title: document.getElementById('scenarioTitle').value,
      description: document.getElementById('scenarioDescription').value,
      genre: document.getElementById('scenarioGenre').value,
      sexy_level: parseInt(document.getElementById('scenarioSexyLevel').value),
      mood: document.getElementById('scenarioMood').value,
      total_choices: parseInt(document.getElementById('scenarioTotalChoices').value)
    };

    // 대화 스크립트 수집
    const dialogueScript = window.dialogueEditor.collectDialogueScript();

    // 검증
    if (!basicInfo.title || !basicInfo.description) {
      alert('제목과 설명을 입력하세요.');
      return;
    }

    if (dialogueScript.length === 0) {
      alert('대화 스크립트를 작성하세요.');
      return;
    }

    // 예상 시간 계산
    const estimatedDuration = calculateDuration(basicInfo.total_choices);

    // 시나리오 객체 생성
    const scenario = {
      ...basicInfo,
      dialogue_script: dialogueScript,
      estimated_duration: estimatedDuration,
      metadata: {
        ai_model: 'openai',
        genre: basicInfo.genre,
        sexy_level: basicInfo.sexy_level,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString()
      },
      tags: [],
      active: true
    };

    // API 호출
    const response = await fetch('/api/scenario-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        scenario: scenario
      })
    });

    const result = await response.json();

    if (result.success) {
      alert('✅ 시나리오 저장 완료!');
      closeScenarioModal();
      loadScenarios(); // 목록 새로고침
    }

  } catch (error) {
    console.error('❌ 저장 실패:', error);
    alert('저장 실패: ' + error.message);
  }
}

function calculateDuration(totalChoices) {
  if (totalChoices <= 8) return 'short';
  if (totalChoices <= 20) return 'medium';
  return 'long';
}
```

---

## 5. API 설계

### 5.1 신규 API 엔드포인트

**scenario-manager.js:**
```javascript
// 1. 대화 스크립트 자동 생성
POST /api/scenario-manager
{
  "action": "generate_dialogue_script",
  "title": "늦은 밤의 톡",
  "description": "...",
  "genre": "flutter",
  "sexy_level": 5,
  "mood": "balanced",
  "total_choices": 8
}

Response:
{
  "success": true,
  "dialogue_script": [ /* 배열 */ ]
}

// 2. 시나리오 저장 (dialogue_script 포함)
POST /api/scenario-manager
{
  "action": "save",
  "scenario": {
    "id": "scenario_늦은밤의톡_1760000000000",
    "title": "늦은 밤의 톡",
    "dialogue_script": [ /* 배열 */ ],
    "total_choices": 8,
    "metadata": { ... }
  }
}

Response:
{
  "success": true,
  "scenario": { /* 저장된 객체 */ }
}

// 3. 시나리오 로드 (기존 호환)
GET /api/scenario-manager?action=list

Response:
{
  "success": true,
  "scenarios": {
    "scenario_ID": {
      "dialogue_script": [ /* 배열 */ ],
      ...
    }
  }
}
```

### 5.2 에러 처리 전략

**에러 케이스:**
1. AI 생성 실패 (content policy violation)
2. JSON 파싱 실패
3. GitHub API 저장 실패
4. 필수 필드 누락

**처리 방법:**
```javascript
try {
  // AI 생성
  const dialogueScript = await generateDialogueScript(...);

} catch (error) {
  // content policy violation 감지
  if (error.message.includes('content policy')) {
    return res.status(400).json({
      success: false,
      message: 'AI가 콘텐츠 정책 위반으로 생성을 거부했습니다',
      suggestion: '더 완곡한 표현으로 수정하거나 섹시 레벨을 낮춰보세요'
    });
  }

  // JSON 파싱 실패
  if (error.message.includes('JSON')) {
    return res.status(500).json({
      success: false,
      message: 'AI 응답 파싱 실패',
      suggestion: 'AI 모델을 변경하거나 시나리오 길이를 줄여보세요'
    });
  }

  // 기타 오류
  return res.status(500).json({
    success: false,
    message: '서버 오류 발생',
    error: error.message
  });
}
```

---

## 6. 데이터 모델

### 6.1 새 시나리오 스키마 (v2.0)

```javascript
{
  "id": "scenario_제목_timestamp",
  "title": "시나리오 제목",
  "description": "한 줄 설명 (50자 이내)",

  // ✨ 신규 필드
  "total_choices": 8, // 4/8/12/16/20/24/28/32/36
  "estimated_duration": "short/medium/long",

  "dialogue_script": [
    // 메시지 블록
    {
      "id": 1,
      "type": "message",
      "speaker": "캐릭터명",
      "text": "대사 내용",
      "emotion": "neutral",
      "timestamp": "19:23" // nullable
    },

    // 선택지 블록
    {
      "id": 4,
      "type": "choice",
      "question": "질문 (선택적)",
      "options": [
        {
          "id": "A",
          "text": "선택지 텍스트",
          "affection_change": 3
        },
        { "id": "B", "text": "...", "affection_change": 0 },
        { "id": "C", "text": "...", "affection_change": 1 }
      ]
    },

    // 주관식 블록
    {
      "id": 8,
      "type": "user_input",
      "placeholder": "답장을 입력하세요...",
      "evaluation_keywords": ["궁금", "걱정", "관심"]
    }
  ],

  "metadata": {
    "ai_model": "claude/openai/llama",
    "genre": "flutter",
    "sexy_level": 5,
    "created_at": "2025-10-12T00:00:00.000Z",
    "last_modified": "2025-10-12T00:00:00.000Z"
  },

  "tags": ["태그1", "태그2"],
  "active": true

  // ❌ 제거된 필드
  // "ai_generated_context": "...", (소설 텍스트)
  // "story_structure": { ... } (기승전결)
}
```

### 6.2 하위 호환성 전략

**기존 시나리오 처리:**
```javascript
// 로드 시 자동 변환
function loadScenario(scenarioId) {
  const scenario = scenariosData[scenarioId];

  // dialogue_script가 없으면 빈 배열
  if (!scenario.dialogue_script) {
    scenario.dialogue_script = [];
  }

  // total_choices가 없으면 기본값
  if (!scenario.total_choices) {
    scenario.total_choices = 4;
  }

  // ai_generated_context는 무시 (표시하지 않음)
  // story_structure는 무시 (표시하지 않음)

  return scenario;
}
```

**마이그레이션 전략:**
- 기존 시나리오: 그대로 유지 (읽기 전용)
- 새 시나리오: dialogue_script 필수
- 점진적 전환: 관리자가 수동으로 dialogue_script 추가 가능

---

## 7. UI/UX 설계

### 7.1 시나리오 생성 모달 구조

**탭 구조:**
```
┌──────────────────────────────────────────────────────┐
│  [📋 기본 정보]  [📝 대화 스크립트]                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  기본 정보 탭:                                        │
│  - 제목 (input)                                      │
│  - 설명 (textarea, 1줄)                              │
│  - 장르 (select, 15개 감정 장르)                     │
│  - 섹시 레벨 (range, 1-10)                          │
│  - 분위기 (select, light/balanced/serious)           │
│  - 선택지 개수 (select, 4~36)                        │
│                                                      │
│  [🤖 AI 자동 생성]                                   │
│                                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  대화 스크립트 탭:                                    │
│                                                      │
│  [💬 대사 추가]  [🎯 선택지 추가]  [⌨️ 주관식 추가]  │
│  [👁️ 미리보기]                                       │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  #1 💬 대사                    [🗑️]        │     │
│  │  화자: 소라                                 │     │
│  │  내용: [textarea]                          │     │
│  │  감정: [select] 시간: [input]              │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  #4 🎯 선택지                  [🗑️]        │     │
│  │  질문: [textarea]                          │     │
│  │  A) [input] 호감도: [number]               │     │
│  │  B) [input] 호감도: [number]               │     │
│  │  C) [input] 호감도: [number]               │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 7.2 사용자 워크플로우

**워크플로우 1: AI 자동 생성 (추천)**
```
1. "새 시나리오 만들기" 클릭
   ↓
2. 기본 정보 입력
   - 제목: "늦은 밤의 톡"
   - 설명: "집에 와서 갑자기 생각나서..."
   - 장르: flutter (짝사랑)
   - 섹시 레벨: 5
   - 분위기: balanced
   - 선택지 개수: 8개
   ↓
3. "🤖 AI 자동 생성" 클릭
   - 로딩 표시 (5-10초)
   - dialogue_script 생성 완료
   ↓
4. "대화 스크립트" 탭으로 자동 전환
   - 생성된 20-30개 블록 표시
   ↓
5. (선택) 수정
   - 대사 수정
   - 선택지 호감도 조정
   - 블록 삭제/추가
   ↓
6. "👁️ 미리보기" 클릭
   - 메신저 스타일 렌더링 확인
   ↓
7. "저장" 클릭
   - GitHub API 저장
   - 시나리오 목록에 추가
```

**워크플로우 2: 수동 작성**
```
1. "새 시나리오 만들기" 클릭
   ↓
2. 기본 정보 입력
   ↓
3. "대화 스크립트" 탭 이동
   ↓
4. 블록 추가
   - "💬 대사 추가" 클릭 → 캐릭터 대사 입력
   - "💬 대사 추가" 클릭 → 연속 대사 입력
   - "🎯 선택지 추가" 클릭 → 3개 옵션 입력
   - (반복)
   ↓
5. 미리보기 → 저장
```

### 7.3 접근성 고려사항

**키보드 단축키:**
- `Ctrl+M`: 메시지 블록 추가
- `Ctrl+C`: 선택지 블록 추가
- `Ctrl+U`: 주관식 블록 추가
- `Delete`: 선택된 블록 삭제
- `Ctrl+P`: 미리보기
- `Ctrl+S`: 저장

**시각적 피드백:**
- 블록 hover 시 테두리 강조
- 드래그 가능 영역 커서 변경
- 저장 중 로딩 스피너
- 에러 시 빨간색 테두리

**ARIA 속성:**
```html
<div class="dialogue-block" role="article" aria-label="메시지 블록">
  <button aria-label="블록 삭제" onclick="deleteBlock(1)">🗑️</button>
</div>
```

---

## 8. 구현 계획

### 8.1 Phase 분할

**Phase 1: 데이터 스키마 및 API (Step 1-3)**
- Step 1: 데이터 스키마 재정의 (30분)
- Step 2: 관리자 UI - 대화 스크립트 편집기 (2시간)
- Step 3: AI 자동 생성 시스템 v2 (1시간)

**Phase 2: 저장/로드 및 미리보기 (Step 4-5)**
- Step 4: 저장/로드 함수 수정 (1시간)
- Step 5: 미리보기 기능 (30분)

**Phase 3: 초기화 및 테스트 (Step 6)**
- Step 6: 기존 데이터 제거 (10분)
- 통합 테스트 및 버그 수정

### 8.2 Step별 상세 계획

**Step 1: 데이터 스키마 재정의 (30분)**
```
작업 내용:
1. data/scenario-database.json 백업
2. 새 스키마 적용
3. 예시 시나리오 1개 생성 ("늦은 밤의 톡")
   - total_choices: 4
   - dialogue_script: 20개 블록 (수동 작성)
   - 메시지 15개 + 선택지 4개 + 주관식 1개

파일:
- data/scenarios/scenario-database.json

검수:
- dialogue_script 배열 존재
- 메시지/선택지/주관식 블록 정상 표시
- 기존 필드 제거 확인 (ai_generated_context, story_structure)
```

**Step 2: 관리자 UI - 대화 스크립트 편집기 (2시간)**
```
작업 내용:
1. 시나리오 모달에 탭 추가
   - "📋 기본 정보" 탭
   - "📝 대화 스크립트" 탭
2. 대화 스크립트 탭 UI 구현
   - 컨트롤 패널 (버튼 4개)
   - dialogue-blocks-container
3. 블록 컴포넌트 HTML 구현
   - createMessageBlockHTML()
   - createChoiceBlockHTML()
   - createUserInputBlockHTML()
4. JavaScript 함수 구현
   - addMessageBlock()
   - addChoiceBlock()
   - addUserInputBlock()
   - deleteBlock()
   - collectDialogueScript()
5. CSS 스타일 추가
   - 블록 스타일
   - 색상 구분 (메시지/선택지/주관식)

파일:
- scenario-admin.html (500줄 추가)

검수:
- 블록 추가 버튼 작동
- 블록 삭제 기능 작동
- collectDialogueScript() 정상 반환
- CSS 스타일 적용 확인
```

**Step 3: AI 자동 생성 시스템 v2 (1시간)**
```
작업 내용:
1. data/ai-prompts.json 업데이트 (v2.0.0)
   - dialogue_generation 섹션 추가
   - system_prompt, user_prompt_template
2. api/scenario-manager.js 함수 추가
   - generateDialogueScript()
   - buildDialogueScriptPrompt()
   - validateDialogueScript()
3. API 엔드포인트 추가
   - action: 'generate_dialogue_script'
4. 프론트엔드 연결
   - generateAIDialogue() 함수
   - 버튼 이벤트 리스너

파일:
- data/ai-prompts.json
- api/scenario-manager.js (200줄 추가)
- scenario-admin.html (100줄 추가)

검수:
- AI 생성 버튼 클릭 → 대화 스크립트 생성
- 선택지 개수 정확히 생성
- speaker 필드 정상 입력
- JSON 파싱 오류 없음
```

**Step 4: 저장/로드 함수 수정 (1시간)**
```
작업 내용:
1. collectScenarioData() 함수 수정
   - dialogue_script 포함
   - total_choices 포함
   - estimated_duration 계산
2. fillScenarioForm() 함수 수정
   - dialogue_script 로드
   - renderDialogueBlocks() 호출
3. displayScenarios() 함수 수정
   - 대화 미리보기 표시 (첫 3개 메시지)
   - total_choices, estimated_duration 표시

파일:
- scenario-admin.html (200줄 수정)

검수:
- 저장 → 로드 → 편집 → 재저장 플로우 정상
- 시나리오 카드에 대화 미리보기 표시
- 메타데이터 정확히 표시
```

**Step 5: 미리보기 기능 (30분)**
```
작업 내용:
1. dialoguePreviewModal HTML 추가
2. previewDialogue() 함수 구현
3. renderMessage(), renderChoice(), renderUserInput() 함수
4. getEmotionEmoji() 헬퍼 함수
5. CSS 스타일 (메신저 스타일)

파일:
- scenario-admin.html (150줄 추가)

검수:
- 미리보기 버튼 클릭 → 모달 표시
- 메신저 스타일 렌더링 정상
- 감정 이모티콘 표시
- 선택지 호감도 변화 표시
```

**Step 6: 기존 데이터 제거 (10분)**
```
작업 내용:
1. clearAllScenarios() 임시 함수 추가
2. "모든 시나리오 삭제" 버튼 추가 (임시)
3. 빈 데이터로 초기화
4. v2.0.0 시작

파일:
- scenario-admin.html (50줄 추가)

검수:
- 기존 시나리오 완전 삭제 확인
- 새 시나리오 생성 정상 작동
```

### 8.3 예상 작업 시간 및 리소스

| Step | 작업 내용 | 예상 시간 | 담당 | 의존성 |
|------|----------|----------|------|--------|
| Step 1 | 데이터 스키마 재정의 | 30분 | Claude Code | 없음 |
| Step 2 | 대화 스크립트 편집기 UI | 2시간 | Claude Code | Step 1 |
| Step 3 | AI 자동 생성 v2 | 1시간 | Claude Code | Step 1, 2 |
| Step 4 | 저장/로드 함수 수정 | 1시간 | Claude Code | Step 2 |
| Step 5 | 미리보기 기능 | 30분 | Claude Code | Step 2 |
| Step 6 | 기존 데이터 제거 | 10분 | Claude Code | 없음 |
| **총계** | | **5시간** | | |

### 8.4 리스크 및 완화 전략

**리스크 1: AI 생성 불안정성**
- **문제:** AI가 유효한 JSON을 생성하지 못할 수 있음
- **영향:** 시나리오 생성 실패
- **완화:**
  - OpenAI JSON Mode 사용 (`response_format: { type: "json_object" }`)
  - speaker 필드 후처리 (undefined → 캐릭터 이름)
  - 선택지 개수 검증 로직
  - Fallback: 수동 작성 가능

**리스크 2: 대용량 dialogue_script**
- **문제:** 36개 선택지 = 150개 블록 = 큰 JSON
- **영향:** 로딩/저장 속도 저하
- **완화:**
  - 선택지 개수 제한 (최대 36개)
  - 블록 지연 렌더링 (첫 20개만 표시, 스크롤 시 추가)
  - GitHub API 파일 크기 제한 확인 (1MB 이하)

**리스크 3: 하위 호환성 문제**
- **문제:** 기존 시나리오가 dialogue_script 없음
- **영향:** 에피소드 생성 실패
- **완화:**
  - 로드 시 dialogue_script 자동 초기화 (빈 배열)
  - 기존 시나리오는 읽기 전용 표시
  - 마이그레이션 안내 메시지

**리스크 4: UI 복잡성 증가**
- **문제:** 대화 블록 편집기가 복잡함
- **영향:** 사용자 혼란
- **완화:**
  - AI 자동 생성을 기본 워크플로우로 강조
  - 튜토리얼 메시지 추가
  - 예시 시나리오 제공

### 8.5 롤백 계획

**롤백 트리거:**
- 치명적 버그 발견 (저장/로드 실패)
- AI 생성 완전 실패 (50% 이상)
- 사용자 피드백 부정적 (기능 복잡도)

**롤백 절차:**
```
1. scenario-database.json 백업 복원
   - backup/scenario-database_v1.0.json
2. scenario-admin.html 이전 버전 복원
   - git checkout v1.19.6 scenario-admin.html
3. API 엔드포인트 복원
   - api/scenario-manager.js 이전 버전
4. 공지
   - "시스템 유지보수로 이전 버전으로 복구"
```

**데이터 보존:**
- 새 버전에서 생성된 dialogue_script는 별도 파일로 백업
- 향후 재시도 시 복원 가능

---

## 9. 테스트 전략

### 9.1 단위 테스트 계획

**프론트엔드 함수 테스트:**
```javascript
// test/dialogue-editor-test.js
describe('DialogueBlockEditor', () => {
  test('addMessageBlock() 정상 작동', () => {
    const editor = new DialogueBlockEditor('dialogue-blocks-container');
    editor.addMessageBlock();
    const blocks = document.querySelectorAll('.dialogue-block.message-block');
    expect(blocks.length).toBe(1);
  });

  test('collectDialogueScript() 정확한 데이터 반환', () => {
    const editor = new DialogueBlockEditor('dialogue-blocks-container');
    editor.addMessageBlock({ speaker: '소라', text: '안녕', emotion: 'neutral' });
    editor.addChoiceBlock({ options: [{}, {}, {}] });

    const script = editor.collectDialogueScript();
    expect(script.length).toBe(2);
    expect(script[0].type).toBe('message');
    expect(script[1].type).toBe('choice');
  });
});
```

**백엔드 함수 테스트:**
```javascript
// test/scenario-manager-test.js
describe('generateDialogueScript', () => {
  test('정확한 선택지 개수 생성', async () => {
    const script = await generateDialogueScript(
      '늦은 밤의 톡', '...', 'flutter', 5, 'balanced', 8
    );

    const choiceCount = script.filter(b => b.type === 'choice').length;
    expect(choiceCount).toBeGreaterThanOrEqual(8);
  });

  test('speaker 필드 누락 없음', async () => {
    const script = await generateDialogueScript(...);

    const messages = script.filter(b => b.type === 'message');
    messages.forEach(msg => {
      expect(msg.speaker).toBeDefined();
      expect(msg.speaker).not.toBe('undefined');
    });
  });
});
```

### 9.2 통합 테스트 시나리오

**시나리오 1: AI 자동 생성 플로우**
```
1. 시나리오 생성 모달 열기
2. 기본 정보 입력
   - 제목: "테스트 시나리오"
   - 설명: "통합 테스트용"
   - 선택지 개수: 4개
3. "AI 자동 생성" 클릭
4. 검증:
   - dialogue_script 배열 존재
   - 선택지 4개 이상
   - speaker 필드 모두 존재
5. "저장" 클릭
6. 검증:
   - GitHub API 저장 성공
   - 시나리오 목록에 표시
```

**시나리오 2: 수동 작성 플로우**
```
1. 시나리오 생성 모달 열기
2. 기본 정보 입력
3. "대화 스크립트" 탭 이동
4. 메시지 블록 3개 추가
5. 선택지 블록 1개 추가 (3개 옵션)
6. "미리보기" 클릭
7. 검증:
   - 메신저 스타일 렌더링 정상
8. "저장" 클릭
9. 검증:
   - 저장 성공
```

**시나리오 3: 수정 플로우**
```
1. 기존 시나리오 선택
2. "수정" 버튼 클릭
3. 대화 스크립트 탭 이동
4. 블록 1개 삭제
5. 블록 1개 추가
6. "저장" 클릭
7. 검증:
   - 변경사항 정확히 저장
   - 시나리오 카드 업데이트
```

**시나리오 4: 에피소드 생성 연동**
```
1. dialogue_script 포함 시나리오 생성
2. 에피소드 탭 이동
3. 시나리오 선택
4. "AI 에피소드 생성" 클릭
5. 검증:
   - dialogue_script 정상 로드
   - 캐릭터 톤 적용 정상
   - 에피소드 저장 성공
```

### 9.3 사용자 수용 테스트 기준

**UAT 체크리스트:**
- [ ] 시나리오 생성이 이전보다 쉬워졌는가?
- [ ] AI 자동 생성 품질이 만족스러운가?
- [ ] 대화 블록 편집이 직관적인가?
- [ ] 미리보기 기능이 유용한가?
- [ ] 선택지 개수 설정이 적절한가?
- [ ] 에피소드 생성이 정상 작동하는가?
- [ ] 기존 기능 (캐릭터, 에피소드)이 영향받지 않았는가?

**피드백 수집:**
- 사용성 설문조사 (10문항)
- 버그 리포트 채널 (GitHub Issues)
- 개선 제안 수집

---

## 10. 마이그레이션 전략

### 10.1 기존 데이터 처리 방법

**전략: 완전 초기화 (Step 6)**
- 기존 시나리오는 모두 삭제 (백업 후)
- 새 시스템으로 완전 전환
- 이유: 기존 시나리오가 4개뿐이고, 구조가 완전히 다름

**백업 절차:**
```bash
# 1. 현재 scenario-database.json 백업
cp data/scenarios/scenario-database.json \
   data/scenarios/backup/scenario-database_v1.0_2025-10-11.json

# 2. Git 커밋
git add data/scenarios/backup/
git commit -m "Backup: scenario-database v1.0 before v2.0 migration"
git push origin main
```

### 10.2 점진적 마이그레이션 vs 한 번에 전환

**선택: 한 번에 전환 (Big Bang Migration)**

**이유:**
1. 기존 시나리오가 매우 적음 (4개)
2. 구조가 완전히 다름 (소설 텍스트 → 대화 블록)
3. 수동 변환이 불가능 (일대일 매핑 불가)
4. 새 시스템이 훨씬 우수

**장점:**
- 개발 복잡도 감소 (하위 호환성 코드 불필요)
- 테스트 간소화
- 빠른 전환

**단점:**
- 기존 시나리오 손실 (→ 백업으로 완화)
- 롤백 시 복잡 (→ Git으로 완화)

### 10.3 마이그레이션 타임라인

```
[2025-10-11 09:00] Phase 1 시작
  └─ Step 1: 데이터 스키마 재정의 (30분)
  └─ Step 2: UI 구현 (2시간)

[2025-10-11 11:30] 중간 점검
  └─ UI 동작 테스트
  └─ 문제 발견 시 수정

[2025-10-11 12:30] Phase 2 시작
  └─ Step 3: AI 생성 v2 (1시간)
  └─ Step 4: 저장/로드 (1시간)

[2025-10-11 14:30] 통합 테스트
  └─ 전체 플로우 테스트 (30분)

[2025-10-11 15:00] Phase 3 시작
  └─ Step 5: 미리보기 (30분)
  └─ Step 6: 초기화 (10분)

[2025-10-11 15:40] 최종 검수
  └─ UAT 체크리스트 확인
  └─ Git 커밋 및 배포

[2025-10-11 16:00] 배포 완료 ✅
```

---

## 11. 리스크 관리

### 11.1 기술적 리스크

| 리스크 | 확률 | 영향 | 심각도 | 완화 전략 |
|--------|------|------|--------|----------|
| AI JSON 생성 실패 | 중간 | 높음 | 높음 | JSON Mode, 후처리, Fallback |
| GitHub API 저장 실패 | 낮음 | 높음 | 중간 | 재시도 로직, 에러 알림 |
| 대용량 dialogue_script | 중간 | 중간 | 중간 | 선택지 개수 제한, 지연 렌더링 |
| 브라우저 호환성 문제 | 낮음 | 낮음 | 낮음 | 크롬/엣지 기준, 폴리필 |
| 에피소드 생성 호환성 | 중간 | 높음 | 높음 | episode-manager.js 테스트 강화 |

### 11.2 일정 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|----------|
| Step 2 예상 시간 초과 | 높음 | 중간 | UI 단순화, 드래그 기능 Phase 2로 이동 |
| AI 생성 디버깅 시간 | 중간 | 중간 | 로그 강화, 프롬프트 미리 준비 |
| 통합 테스트 버그 | 중간 | 높음 | 각 Step마다 단위 테스트 |

### 11.3 운영 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|----------|
| 사용자 혼란 | 중간 | 중간 | 튜토리얼 메시지, AI 자동 생성 강조 |
| 기존 에피소드 호환성 | 낮음 | 높음 | 기존 에피소드는 유지 (character_episodes.json) |
| 롤백 필요 | 낮음 | 높음 | 백업 완전, Git 커밋 세분화 |

---

## 12. 타임라인

### 12.1 전체 일정

```
2025-10-11 (금)
├─ 09:00-09:30: Step 1 (데이터 스키마)
├─ 09:30-11:30: Step 2 (UI 편집기)
├─ 11:30-12:00: 중간 점검
├─ 12:00-13:00: Step 3 (AI 생성 v2)
├─ 13:00-14:00: Step 4 (저장/로드)
├─ 14:00-14:30: 통합 테스트
├─ 14:30-15:00: Step 5 (미리보기)
├─ 15:00-15:10: Step 6 (초기화)
├─ 15:10-15:40: 최종 검수
└─ 15:40-16:00: 배포 및 모니터링

2025-10-12 (토)
└─ 사용자 피드백 수집 및 버그 수정

2025-10-13 (일)
└─ 문서 업데이트 (CLAUDE.md 버전 히스토리)
```

### 12.2 마일스톤

| 마일스톤 | 날짜 | 달성 조건 |
|----------|------|-----------|
| Phase 1 완료 | 2025-10-11 12:00 | AI 생성 v2 작동 |
| Phase 2 완료 | 2025-10-11 14:30 | 저장/로드 플로우 정상 |
| Phase 3 완료 | 2025-10-11 15:10 | 미리보기 작동 |
| **전체 완료** | **2025-10-11 16:00** | **배포 성공** |

### 12.3 체크포인트

**09:30 체크포인트:**
- [ ] scenario-database.json 새 스키마 적용
- [ ] 예시 시나리오 1개 생성
- [ ] Git 커밋: "Step 1: 데이터 스키마 v2.0"

**11:30 체크포인트:**
- [ ] 대화 스크립트 편집기 UI 표시
- [ ] 블록 추가 버튼 작동
- [ ] collectDialogueScript() 정상 반환
- [ ] Git 커밋: "Step 2: 대화 스크립트 편집기 UI"

**13:00 체크포인트:**
- [ ] AI 생성 버튼 클릭 → dialogue_script 생성
- [ ] 선택지 개수 정확
- [ ] Git 커밋: "Step 3: AI 생성 v2"

**14:30 체크포인트:**
- [ ] 저장 → 로드 → 편집 → 재저장 플로우 정상
- [ ] 시나리오 카드 대화 미리보기 표시
- [ ] Git 커밋: "Step 4-5: 저장/로드/미리보기"

**15:40 체크포인트:**
- [ ] 모든 UAT 체크리스트 통과
- [ ] 에피소드 생성 연동 테스트 완료
- [ ] Git 커밋: "v2.0.0: 시나리오 시스템 완전 개편"

---

## 13. 부록

### 13.1 참고 파일 목록

**주요 파일:**
- `upgrade.md`: 요구사항 정의서
- `data/scenarios/scenario-database.json`: 시나리오 데이터
- `scenario-admin.html`: 관리자 UI (Lines 8000-10000)
- `api/scenario-manager.js`: 시나리오 API
- `api/episode-manager.js`: 에피소드 API (Lines 1169-1674, AI 생성 참고)
- `data/ai-prompts.json`: AI 프롬프트 설정

**참고 파일:**
- `CLAUDE.md`: 프로젝트 히스토리
- `.claude-code/PROJECT.md`: 프로젝트 개요
- `.claude-code/MASTER.md`: 현재 작업 상태

### 13.2 용어 정리

| 용어 | 설명 |
|------|------|
| dialogue_script | 메신저 대화 블록 배열 (메시지/선택지/주관식) |
| dialogue_flow | 에피소드의 대화 콘텐츠 (episode-manager.js) |
| total_choices | 시나리오의 선택지 개수 (4~36) |
| ai_generated_context | (제거 예정) 기존 소설형 텍스트 |
| story_structure | (제거 예정) 기존 기승전결 구조 |
| message 블록 | 캐릭터 대사 블록 |
| choice 블록 | 객관식 선택지 블록 (3개 옵션) |
| user_input 블록 | 주관식 입력 블록 (AI 평가) |

### 13.3 AI 프롬프트 예시

**시스템 프롬프트:**
```
당신은 한국 로맨스 메신저 대화 시나리오 작가입니다.
실제 카카오톡 대화처럼 자연스럽고 감정적인 메신저 대화를 작성합니다.
```

**사용자 프롬프트 (요약):**
```
제목: {title}
설명: {description}
장르: {genre}
섹시 레벨: {sexy_level}/10
분위기: {mood}
선택지 개수: {total_choices}개

작성 규칙:
1. 메신저 대화 형식 (연속 메시지 허용)
2. 5~7개 메시지마다 선택지 1개
3. 선택지는 3개 옵션 (적극적/중립적/소극적)
4. 감정 태그 사용
5. 말줄임(...), 이모티콘 자주 사용
6. 시간: 19:00~23:00

출력: JSON 배열 (총 {total_messages}개 블록, {total_choices}개 선택지)
```

---

## 14. 결론

본 설계서는 시나리오 시스템을 소설형에서 대화 스크립트 기반으로 전환하기 위한 완전한 아키텍처를 제공합니다.

**핵심 성과 목표:**
1. ✅ 시나리오 생성 시간 50% 단축 (AI 자동 생성)
2. ✅ 에피소드 생성 비용 90% 절감 (dialogue_script 재사용)
3. ✅ 관리자 제어력 향상 (직접 편집 가능)
4. ✅ 일관된 품질 (선택지 개수 기반 관리)

**다음 단계:**
- 설계 승인 후 구현 시작
- Git 브랜치 생성: `feature/dialogue-script-system`
- 작업 진행 시 이 문서를 참조 가이드로 사용
- 완료 후 CLAUDE.md에 버전 히스토리 추가

**문의 사항:**
- 설계 관련 질문은 이 문서의 해당 섹션 참조
- 구현 중 문제 발생 시 리스크 관리 섹션 확인
- 추가 논의 필요 시 dosik에게 문의

---

**문서 버전:** 1.0.0
**작성일:** 2025-10-11
**작성자:** Claude Code (Sonnet 4.5)
**승인:** 대기 중
**다음 리뷰:** 구현 완료 후
