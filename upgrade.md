# 🚀 **Claude Code 작업 프롬프트 - 대화형 메신저 시나리오 시스템 구축**

```markdown
# Phase 1: 대화형 메신저 시나리오 시스템 구축

## 📋 작업 개요
기존 소설형 시나리오 시스템을 메신저 대화 스크립트 기반으로 전환합니다.

---

## 🎯 Step 1: 데이터 스키마 재정의

### 작업 파일
- `data/scenario-database.json`

### 변경 사항
1. **기존 필드 제거**:
   - `story_structure` (기승전결) 완전 삭제
   - `ai_generated_context` (소설 텍스트) 완전 삭제

2. **새 필드 추가**:
```javascript
{
  "id": "scenario_제목_timestamp",
  "title": "시나리오 제목",
  "description": "한 줄 설명 (50자 이내)",
  "genre": "anger/jealousy/crush/temptation/longing/reconciliation/flutter/anxiety/obsession/resignation/courage/bond/guilt/rejection/avoidance",
  "sexy_level": 1-10,
  "mood": "light/balanced/serious",
  
  // ✨ 새로운 핵심 필드
  "total_choices": 4,  // 관리자가 설정 (4/8/12/16/20/24/28/32/36)
  "estimated_duration": "short/medium/long",
  
  "dialogue_script": [
    {
      "id": 1,
      "type": "message",  // message, user_input, choice
      "speaker": "캐릭터명",
      "text": "대사 내용",
      "emotion": "neutral",  // neutral/shy/excited/sad/angry/longing/playful/serious
      "timestamp": "19:23"  // 선택적, 없으면 null
    },
    {
      "id": 2,
      "type": "message",
      "speaker": "캐릭터명",
      "text": "연속 대사",
      "emotion": "shy"
    },
    {
      "id": 3,
      "type": "user_input",
      "placeholder": "답장을 입력하세요...",  // 주관식 입력창 힌트
      "evaluation_keywords": ["궁금", "걱정", "관심"]  // AI 평가용 키워드
    },
    {
      "id": 4,
      "type": "choice",
      "question": "캐릭터가 물어보는 질문 (선택적)",
      "options": [
        {
          "id": "A",
          "text": "선택지 1 (적극적)",
          "affection_change": +3
        },
        {
          "id": "B",
          "text": "선택지 2 (중립적)",
          "affection_change": 0
        },
        {
          "id": "C",
          "text": "선택지 3 (소극적)",
          "affection_change": +1
        }
      ]
    }
  ],
  
  "metadata": {
    "ai_model": "claude/openai/llama",
    "created_at": "timestamp",
    "last_modified": "timestamp"
  },
  "tags": ["태그1", "태그2"],
  "active": true
}
```

3. **예시 시나리오 1개 생성**:
   - 제목: "늦은 밤의 톡"
   - 장르: crush (짝사랑)
   - total_choices: 4
   - dialogue_script: 20~30개 블록 (메시지 + 선택지 4개)
   - 위에서 제공한 소라 예시 참고

---

## 🎯 Step 2: 관리자 UI - 대화 스크립트 편집기

### 작업 파일
- `scenario-admin.html`

### 2-1. 모달 구조 변경
**시나리오 생성/편집 모달**:

1. **기본 정보 탭** (기존 유지, 일부 수정):
   ```html
   - 제목 (input)
   - 설명 (textarea, 1줄)
   - 장르 선택 (select, 15개 감정 장르)
   - 섹시 레벨 (range, 1-10)
   - 분위기 (select, light/balanced/serious)
   - 선택지 개수 (select): 
     <option value="4">4개 (초짧음, 5-10분)</option>
     <option value="8">8개 (짧음, 10-15분)</option>
     <option value="12">12개 (보통, 15-20분)</option>
     <option value="16">16개 (보통, 20-25분)</option>
     <option value="20">20개 (길게, 25-30분)</option>
     <option value="24">24개 (길게, 30-35분)</option>
     <option value="28">28개 (매우 길게, 35-40분)</option>
     <option value="32">32개 (매우 길게, 40-45분)</option>
     <option value="36">36개 (최대, 45-60분)</option>
   ```

2. **📝 대화 스크립트 탭** (신규 추가):
   ```html
   <div id="scenario-tab-dialogue" class="scenario-tab-content">
     <!-- 컨트롤 패널 -->
     <div class="dialogue-controls">
       <button class="btn btn-primary" onclick="addMessageBlock()">
         💬 대사 추가
       </button>
       <button class="btn btn-success" onclick="addChoiceBlock()">
         🎯 선택지 추가 (3개 옵션)
       </button>
       <button class="btn btn-info" onclick="addUserInputBlock()">
         ⌨️ 주관식 추가
       </button>
       <button class="btn btn-warning" onclick="previewDialogue()">
         👁️ 미리보기
       </button>
     </div>

     <!-- 대화 블록 컨테이너 (드래그 정렬 가능) -->
     <div id="dialogue-blocks-container" class="dialogue-timeline">
       <!-- 동적 생성 -->
     </div>
   </div>
   ```

### 2-2. 대화 블록 UI 컴포넌트

**A. 메시지 블록**:
```html
<div class="dialogue-block message-block" data-id="1">
  <div class="block-header">
    <span class="block-number">#1</span>
    <span class="block-type">💬 대사</span>
    <button class="btn-delete" onclick="deleteBlock(1)">🗑️</button>
  </div>
  <div class="block-content">
    <input type="text" placeholder="화자 (예: 소라)" class="block-speaker" value="소라">
    <textarea placeholder="대사 내용" class="block-text" rows="2">집에 왔는데 갑자기 네 생각나서 톡해.</textarea>
    <div class="block-meta">
      <label>감정:</label>
      <select class="block-emotion">
        <option value="neutral">😐 평범</option>
        <option value="shy">😳 부끄러움</option>
        <option value="excited">😆 흥분</option>
        <option value="sad">😢 슬픔</option>
        <option value="angry">😠 화남</option>
        <option value="longing">🥺 그리움</option>
        <option value="playful">😏 장난스러움</option>
        <option value="serious">😤 진지함</option>
      </select>
      <label>시간:</label>
      <input type="text" placeholder="19:23 (선택사항)" class="block-timestamp" style="width: 80px;">
    </div>
  </div>
</div>
```

**B. 선택지 블록**:
```html
<div class="dialogue-block choice-block" data-id="4">
  <div class="block-header">
    <span class="block-number">#4</span>
    <span class="block-type">🎯 선택지</span>
    <button class="btn-delete" onclick="deleteBlock(4)">🗑️</button>
  </div>
  <div class="block-content">
    <textarea placeholder="질문 (선택사항)" class="choice-question" rows="1">솔직히 말해봐. 그날 무슨 생각했어?</textarea>
    <div class="choice-options">
      <div class="choice-option">
        <span class="option-label">A)</span>
        <input type="text" placeholder="선택지 1 (적극적)" class="option-text">
        <label>호감도:</label>
        <input type="number" min="-5" max="10" value="3" class="option-affection" style="width: 50px;">
      </div>
      <div class="choice-option">
        <span class="option-label">B)</span>
        <input type="text" placeholder="선택지 2 (중립적)" class="option-text">
        <label>호감도:</label>
        <input type="number" min="-5" max="10" value="0" class="option-affection" style="width: 50px;">
      </div>
      <div class="choice-option">
        <span class="option-label">C)</span>
        <input type="text" placeholder="선택지 3 (소극적)" class="option-text">
        <label>호감도:</label>
        <input type="number" min="-5" max="10" value="1" class="option-affection" style="width: 50px;">
      </div>
    </div>
  </div>
</div>
```

**C. 주관식 블록**:
```html
<div class="dialogue-block input-block" data-id="3">
  <div class="block-header">
    <span class="block-number">#3</span>
    <span class="block-type">⌨️ 주관식</span>
    <button class="btn-delete" onclick="deleteBlock(3)">🗑️</button>
  </div>
  <div class="block-content">
    <input type="text" placeholder="입력창 힌트 (예: 답장을 입력하세요...)" class="input-placeholder">
    <label>AI 평가 키워드 (쉼표 구분):</label>
    <input type="text" placeholder="예: 궁금, 걱정, 관심" class="input-keywords">
  </div>
</div>
```

### 2-3. JavaScript 함수 구현

**필수 함수 목록**:
```javascript
// 블록 추가
function addMessageBlock() { /* 메시지 블록 HTML 생성 및 추가 */ }
function addChoiceBlock() { /* 선택지 블록 HTML 생성 및 추가 */ }
function addUserInputBlock() { /* 주관식 블록 HTML 생성 및 추가 */ }

// 블록 관리
function deleteBlock(blockId) { /* 블록 삭제 */ }
function moveBlockUp(blockId) { /* 블록 위로 이동 */ }
function moveBlockDown(blockId) { /* 블록 아래로 이동 */ }

// 데이터 수집
function collectDialogueScript() {
  // DOM에서 모든 블록 읽어서 배열로 변환
  // return [ { id, type, speaker, text, ... }, ... ]
}

// 미리보기
function previewDialogue() {
  // 메신저 스타일 미리보기 모달 표시
}

// 저장/로드
function saveScenarioWithDialogue() {
  const basicInfo = collectBasicInfo();
  const dialogueScript = collectDialogueScript();
  // GitHub API로 저장
}

function loadDialogueScript(scenario) {
  // scenario.dialogue_script 배열을 블록 UI로 렌더링
}
```

### 2-4. CSS 스타일
```css
/* 대화 블록 공통 */
.dialogue-block {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.dialogue-block:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* 메시지 블록 */
.message-block {
  border-left: 4px solid #667eea;
}

/* 선택지 블록 */
.choice-block {
  border-left: 4px solid #f093fb;
  background: linear-gradient(135deg, #fff9fc 0%, #ffffff 100%);
}

/* 주관식 블록 */
.input-block {
  border-left: 4px solid #4ade80;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

/* 블록 헤더 */
.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.block-number {
  background: #667eea;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.9em;
}

.block-type {
  font-weight: 600;
  color: #666;
}

/* 선택지 옵션 */
.choice-option {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.option-label {
  font-weight: bold;
  color: #667eea;
  min-width: 30px;
}

.option-text {
  flex: 1;
}
```

---

## 🎯 Step 3: AI 자동 생성 시스템 v2

### 작업 파일
- `data/ai-prompts.json`
- `api/scenario-manager.js`

### 3-1. AI 프롬프트 재작성

**파일**: `data/ai-prompts.json`

```json
{
  "version": "2.0.0",
  "dialogue_generation": {
    "system_prompt": "당신은 한국 로맨스 메신저 대화 시나리오 작가입니다. 실제 카카오톡 대화처럼 자연스럽고 감정적인 메신저 대화를 작성합니다.",
    
    "user_prompt_template": "다음 조건으로 메신저 대화 시나리오를 작성하세요:\n\n제목: {title}\n설명: {description}\n장르: {genre}\n섹시 레벨: {sexy_level}/10\n분위기: {mood}\n선택지 개수: {total_choices}개\n\n# 작성 규칙\n1. 메신저 대화 형식으로 작성 (연속 메시지 허용)\n2. 캐릭터가 2~4개 메시지를 연속으로 보낸 후 사용자 반응\n3. 약 5~7개 메시지마다 선택지 1개 배치\n4. 선택지는 항상 3개 옵션 (적극적/중립적/소극적)\n5. 감정 태그 사용: neutral, shy, excited, sad, angry, longing, playful, serious\n6. 말줄임(...) 자주 사용\n7. 이모티콘 표현: (///), (웃음), (조용히) 등\n8. 시간은 저녁~밤 시간대 (19:00~23:00)\n\n# 출력 형식 (JSON)\n{\n  \"dialogue_script\": [\n    {\n      \"id\": 1,\n      \"type\": \"message\",\n      \"speaker\": \"캐릭터명\",\n      \"text\": \"대사\",\n      \"emotion\": \"neutral\",\n      \"timestamp\": \"19:23\"\n    },\n    ...\n    {\n      \"id\": 8,\n      \"type\": \"choice\",\n      \"question\": \"질문?\",\n      \"options\": [\n        { \"id\": \"A\", \"text\": \"선택지1\", \"affection_change\": 3 },\n        { \"id\": \"B\", \"text\": \"선택지2\", \"affection_change\": 0 },\n        { \"id\": \"C\", \"text\": \"선택지3\", \"affection_change\": 1 }\n      ]\n    }\n  ]\n}\n\n예시를 참고하여 총 {total_messages}개 정도의 메시지 블록과 {total_choices}개의 선택지를 생성하세요.",
    
    "example": {
      "title": "늦은 밤의 톡",
      "dialogue_script": [
        {
          "id": 1,
          "type": "message",
          "speaker": "소라",
          "text": "집에 왔는데 갑자기 네 생각나서 톡해.",
          "emotion": "neutral",
          "timestamp": "19:23"
        },
        {
          "id": 2,
          "type": "message",
          "speaker": "소라",
          "text": "오늘도 하루종일 정신없었는데, 이상하게 네 목소리 듣고 싶더라.",
          "emotion": "longing"
        },
        {
          "id": 3,
          "type": "user_input",
          "placeholder": "답장을 입력하세요...",
          "evaluation_keywords": ["무슨일", "괜찮아", "피곤해"]
        }
      ]
    }
  },
  
  "tone_settings": {
    "light": {
      "instruction": "밝고 경쾌하게, 이모티콘 많이 사용",
      "temperature": 0.9
    },
    "balanced": {
      "instruction": "진솔하고 따뜻하게",
      "temperature": 0.8
    },
    "serious": {
      "instruction": "진지하고 깊이 있게",
      "temperature": 0.7
    }
  }
}
```

### 3-2. API 함수 구현

**파일**: `api/scenario-manager.js`

```javascript
// 새 함수 추가
async function generateDialogueScript(title, description, genre, sexyLevel, mood, totalChoices) {
  // 메시지 개수 계산: 선택지 개수 × 6 (선택지 사이 평균 대사)
  const totalMessages = totalChoices * 6;
  
  // 프롬프트 로드
  const prompts = await loadAIPrompts();
  const template = prompts.dialogue_generation.user_prompt_template;
  
  // 변수 치환
  const userPrompt = template
    .replace('{title}', title)
    .replace('{description}', description)
    .replace('{genre}', genre)
    .replace('{sexy_level}', sexyLevel)
    .replace('{mood}', mood)
    .replace('{total_choices}', totalChoices)
    .replace('{total_messages}', totalMessages);
  
  // OpenAI API 호출
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompts.dialogue_generation.system_prompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: prompts.tone_settings[mood].temperature,
      max_tokens: totalChoices * 200  // 선택지당 200토큰
    })
  });
  
  const result = await response.json();
  const generatedText = result.choices[0].message.content;
  
  // JSON 파싱
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.dialogue_script;
  }
  
  throw new Error('AI 생성 실패');
}

// API 엔드포인트 추가
if (action === 'generate_dialogue_script') {
  const { title, description, genre, sexy_level, mood, total_choices } = JSON.parse(body);
  const dialogueScript = await generateDialogueScript(
    title, description, genre, sexy_level, mood, total_choices
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, dialogue_script: dialogueScript })
  };
}
```

### 3-3. 프론트엔드 연결

**scenario-admin.html에 추가**:
```javascript
async function generateAIDialogue() {
  const title = document.getElementById('scenarioTitle').value;
  const description = document.getElementById('scenarioDescription').value;
  const genre = document.getElementById('scenarioGenre').value;
  const sexyLevel = document.getElementById('scenarioSexyLevel').value;
  const mood = document.getElementById('scenarioMood').value;
  const totalChoices = document.getElementById('scenarioTotalChoices').value;
  
  if (!title || !description) {
    alert('제목과 설명을 먼저 입력하세요.');
    return;
  }
  
  // 로딩 표시
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = '🤖 AI 생성 중...';
  
  try {
    const response = await fetch('/api/scenario-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_dialogue_script',
        title, description, genre,
        sexy_level: sexyLevel,
        mood, total_choices: totalChoices
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 대화 스크립트 탭으로 이동
      switchScenarioTab('dialogue');
      
      // 생성된 대화 블록 렌더링
      renderDialogueBlocks(result.dialogue_script);
      
      alert('✅ AI 대화 생성 완료!');
    }
  } catch (error) {
    alert('❌ 생성 실패: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🤖 AI 자동 생성';
  }
}
```

---

## 🎯 Step 4: 저장/로드 함수 수정

### 4-1. 데이터 수집 함수

```javascript
function collectScenarioData() {
  return {
    id: document.getElementById('scenarioId').value || `scenario_${Date.now()}`,
    title: document.getElementById('scenarioTitle').value,
    description: document.getElementById('scenarioDescription').value,
    genre: document.getElementById('scenarioGenre').value,
    sexy_level: parseInt(document.getElementById('scenarioSexyLevel').value),
    mood: document.getElementById('scenarioMood').value,
    total_choices: parseInt(document.getElementById('scenarioTotalChoices').value),
    estimated_duration: calculateDuration(parseInt(document.getElementById('scenarioTotalChoices').value)),
    dialogue_script: collectDialogueScript(),  // 새 함수
    metadata: {
      ai_model: 'openai',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString()
    },
    tags: [],
    active: true
  };
}

function collectDialogueScript() {
  const blocks = document.querySelectorAll('#dialogue-blocks-container .dialogue-block');
  const script = [];
  
  blocks.forEach((block, index) => {
    const type = block.classList.contains('message-block') ? 'message' :
                 block.classList.contains('choice-block') ? 'choice' : 'user_input';
    
    if (type === 'message') {
      script.push({
        id: index + 1,
        type: 'message',
        speaker: block.querySelector('.block-speaker').value,
        text: block.querySelector('.block-text').value,
        emotion: block.querySelector('.block-emotion').value,
        timestamp: block.querySelector('.block-timestamp').value || null
      });
    } else if (type === 'choice') {
      const options = [];
      block.querySelectorAll('.choice-option').forEach((opt, i) => {
        options.push({
          id: String.fromCharCode(65 + i),  // A, B, C
          text: opt.querySelector('.option-text').value,
          affection_change: parseInt(opt.querySelector('.option-affection').value)
        });
      });
      script.push({
        id: index + 1,
        type: 'choice',
        question: block.querySelector('.choice-question').value || null,
        options: options
      });
    } else if (type === 'user_input') {
      script.push({
        id: index + 1,
        type: 'user_input',
        placeholder: block.querySelector('.input-placeholder').value,
        evaluation_keywords: block.querySelector('.input-keywords').value.split(',').map(k => k.trim())
      });
    }
  });
  
  return script;
}

function calculateDuration(totalChoices) {
  if (totalChoices <= 8) return 'short';
  if (totalChoices <= 20) return 'medium';
  return 'long';
}
```

### 4-2. 로드 함수

```javascript
function fillScenarioForm(scenario) {
  // 기본 정보
  document.getElementById('scenarioId').value = scenario.id;
  document.getElementById('scenarioTitle').value = scenario.title;
  document.getElementById('scenarioDescription').value = scenario.description;
  document.getElementById('scenarioGenre').value = scenario.genre;
  document.getElementById('scenarioSexyLevel').value = scenario.sexy_level;
  document.getElementById('scenarioMood').value = scenario.mood;
  document.getElementById('scenarioTotalChoices').value = scenario.total_choices;
  
  // 대화 스크립트 렌더링
  if (scenario.dialogue_script && scenario.dialogue_script.length > 0) {
    renderDialogueBlocks(scenario.dialogue_script);
  }
}

function renderDialogueBlocks(dialogueScript) {
  const container = document.getElementById('dialogue-blocks-container');
  container.innerHTML = '';
  
  dialogueScript.forEach(block => {
    if (block.type === 'message') {
      const html = createMessageBlockHTML(block);
      container.insertAdjacentHTML('beforeend', html);
    } else if (block.type === 'choice') {
      const html = createChoiceBlockHTML(block);
      container.insertAdjacentHTML('beforeend', html);
    } else if (block.type === 'user_input') {
      const html = createUserInputBlockHTML(block);
      container.insertAdjacentHTML('beforeend', html);
    }
  });
}
```

### 4-3. 카드 표시 함수 수정

```javascript
function displayScenarios(scenarios) {
  const grid = document.getElementById('scenarios-grid');
  grid.innerHTML = '';
  
  scenarios.forEach(scenario => {
    // 대화 미리보기 (첫 3개 메시지)
    let preview = '';
    if (scenario.dialogue_script && scenario.dialogue_script.length > 0) {
      const firstMessages = scenario.dialogue_script
        .filter(b => b.type === 'message')
        .slice(0, 3);
      preview = firstMessages.map(m => `${m.speaker}: ${m.text.substring(0, 30)}...`).join('<br>');
    }
    
    const card = document.createElement('div');
    card.className = 'scenario-card';
    card.innerHTML = `
      <h3>${scenario.title}</h3>
      <p class="description">${scenario.description}</p>
      
      <div class="dialogue-preview" style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 0.85em; color: #666;">
        ${preview || '대화 없음'}
      </div>
      
      <div class="metadata">
        <span class="tag">🎭 ${getGenreName(scenario.genre)}</span>
        <span class="tag">🔥 레벨 ${scenario.sexy_level}</span>
        <span class="tag">💬 ${scenario.total_choices}개 선택지</span>
        <span class="tag">⏱️ ${getDurationText(scenario.estimated_duration)}</span>
      </div>
      
      <div class="actions">
        <button onclick="editScenario('${scenario.id}')" class="btn btn-secondary">✏️ 수정</button>
        <button onclick="deleteScenario('${scenario.id}')" class="btn btn-danger">🗑️ 삭제</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function getDurationText(duration) {
  const map = {
    'short': '짧음 (5-15분)',
    'medium': '보통 (15-30분)',
    'long': '길게 (30-60분)'
  };
  return map[duration] || duration;
}
```

---

## 🎯 Step 5: 미리보기 기능

### 5-1. 미리보기 모달

```html
<!-- scenario-admin.html에 추가 -->
<div id="dialoguePreviewModal" class="modal">
  <div class="modal-content" style="max-width: 600px;">
    <div class="modal-header">
      <h2>💬 대화 미리보기</h2>
      <span class="close" onclick="closePreviewModal()">&times;</span>
    </div>
    <div class="modal-body">
      <div id="preview-chat-container" class="messenger-preview">
        <!-- 메신저 스타일 렌더링 -->
      </div>
    </div>
  </div>
</div>

<style>
.messenger-preview {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.preview-message {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 8px;
  max-width: 80%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.preview-message.character {
  align-self: flex-start;
  background: #667eea;
  color: white;
}

.preview-timestamp {
  font-size: 0.75em;
  color: #999;
  margin-top: 4px;
}

.preview-choice-block {
  margin: 20px 0;
  padding: 15px;
  background: #fff3cd;
  border-radius: 12px;
  border: 2px solid #ffc107;
}

.preview-choice-option {
  background: white;
  padding: 10px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #e0e0e0;
}

.preview-choice-option:hover {
  border-color: #667eea;
}
</style>
```

### 5-2. 미리보기 함수

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
      const msgDiv = document.createElement('div');
      msgDiv.className = 'preview-message character';
      msgDiv.innerHTML = `
        <div><strong>${block.speaker}</strong></div>
        <div>${block.text}</div>
        ${block.timestamp ? `<div class="preview-timestamp">${block.timestamp}</div>` : ''}
        <div style="font-size: 0.8em; opacity: 0.8;">${getEmotionEmoji(block.emotion)}</div>
      `;
      container.appendChild(msgDiv);
    } else if (block.type === 'choice') {
      const choiceDiv = document.createElement('div');
      choiceDiv.className = 'preview-choice-block';
      choiceDiv.innerHTML = `
        ${block.question ? `<div style="font-weight: bold; margin-bottom: 10px;">${block.question}</div>` : ''}
        ${block.options.map(opt => `
          <div class="preview-choice-option">
            ${opt.id}) ${opt.text} <span style="color: #667eea;">(${opt.affection_change > 0 ? '+' : ''}${opt.affection_change})</span>
          </div>
        `).join('')}
      `;
      container.appendChild(choiceDiv);
    } else if (block.type === 'user_input') {
      const inputDiv = document.createElement('div');
      inputDiv.className = 'preview-message';
      inputDiv.style.background = '#e3f2fd';
      inputDiv.innerHTML = `
        <div>⌨️ 주관식 입력</div>
        <div style="font-size: 0.85em; color: #666;">${block.placeholder}</div>
      `;
      container.appendChild(inputDiv);
    }
  });
  
  document.getElementById('dialoguePreviewModal').style.display = 'block';
}

function getEmotionEmoji(emotion) {
  const map = {
    neutral: '😐',
    shy: '😳',
    excited: '😆',
    sad: '😢',
    angry: '😠',
    longing: '🥺',
    playful: '😏',
    serious: '😤'
  };
  return map[emotion] || '😐';
}

function closePreviewModal() {
  document.getElementById('dialoguePreviewModal').style.display = 'none';
}
```

---

## 🎯 Step 6: 기존 데이터 제거

### 6-1. 기존 시나리오 완전 삭제
```javascript
// scenario-admin.html에 임시 함수 추가 (초기화용)
async function clearAllScenarios() {
  if (!confirm('⚠️ 모든 기존 시나리오를 삭제하시겠습니까? (복구 불가)')) {
    return;
  }
  
  const emptyData = {
    version: "2.0.0",
    scenarios: []
  };
  
  // GitHub API로 빈 데이터 저장
  await saveToGitHub('data/scenario-database.json', JSON.stringify(emptyData, null, 2));
  
  alert('✅ 모든 시나리오가 삭제되었습니다.');
  await loadScenarios();
}
```

### 6-2. 관리자 UI에 초기화 버튼 추가 (임시)
```html
<!-- 시나리오 관리 탭 상단에 추가 -->
<div class="action-buttons">
  <button class="btn btn-success" onclick="openScenarioModal()">+ 새 시나리오 만들기</button>
  <button class="btn btn-danger" onclick="clearAllScenarios()" style="margin-left: auto;">
    🗑️ 모든 시나리오 삭제 (v2.0 전환)
  </button>
</div>
```

---

## ✅ 검수 체크리스트

작업 완료 후 다음 항목을 확인하세요:

- [ ] `data/scenario-database.json` 스키마 변경 완료
- [ ] 예시 시나리오 1개 생성 (소라 예시 기반)
- [ ] 관리자 모달에 "대화 스크립트" 탭 추가
- [ ] 메시지/선택지/주관식 블록 추가 버튼 작동
- [ ] 블록 삭제 기능 작동
- [ ] `collectDialogueScript()` 함수 정상 작동
- [ ] AI 자동 생성 버튼 작동 (API 연동)
- [ ] 저장 → 로드 → 편집 → 재저장 플로우 정상
- [ ] 시나리오 카드에 대화 미리보기 표시
- [ ] 미리보기 모달 메신저 스타일 렌더링
- [ ] 선택지 개수 드롭다운 (4~36개) 작동
- [ ] 감정 태그 선택 드롭다운 작동

---

## 📌 주의사항

1. **Git 커밋**: 각 Step 완료 시 커밋
   ```bash
   git add -A
   git commit -m "Step 1: 대화형 시나리오 스키마 추가"
   git push origin main
   ```

2. **모듈 크기**: 각 함수는 100~150줄 이내
3. **에러 처리**: 모든 async 함수에 try-catch
4. **콘솔 로그**: 디버깅용 로그 충분히 추가
5. **하위 호환성**: 기존 `story_structure` 필드는 무시 (읽지 않음)

---

## 🚀 예상 작업 시간
- Step 1: 30분 (스키마 + 예시 데이터)
- Step 2: 2시간 (UI 편집기)
- Step 3: 1시간 (AI 생성)
- Step 4: 1시간 (저장/로드)
- Step 5: 30분 (미리보기)
- Step 6: 10분 (초기화)

**총 예상**: 5시간
```
