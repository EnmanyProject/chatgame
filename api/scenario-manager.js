// 시나리오 관리 API - v1.0.0
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  try {
    // 시나리오 목록 조회
    if (action === 'list') {
      const scenarios = await loadScenarioDatabase();
      return res.json({
        success: true,
        scenarios: scenarios.scenarios,
        metadata: scenarios.metadata
      });
    }

    // 새 시나리오 생성 (AI 컨텍스트 자동 생성)
    if (action === 'create') {
      const newScenario = await createNewScenario(req.body);
      return res.json({
        success: true,
        scenario: newScenario,
        message: 'AI 컨텍스트가 자동 생성된 시나리오가 생성되었습니다'
      });
    }

    // 시나리오 상세 조회
    if (action === 'get' && req.query.scenario_id) {
      const scenarios = await loadScenarioDatabase();
      const scenario = scenarios.scenarios[req.query.scenario_id];
      
      if (scenario) {
        return res.json({ success: true, scenario });
      } else {
        return res.status(404).json({ success: false, message: 'Scenario not found' });
      }
    }

    // 시나리오 편집/업데이트
    if (action === 'update') {
      const updatedScenario = await updateScenario(req.body);
      return res.json({
        success: true,
        scenario: updatedScenario,
        message: 'Scenario updated successfully'
      });
    }

    // AI 컨텍스트 재생성
    if (action === 'regenerate_context') {
      const scenario = await regenerateAIContext(req.body);
      return res.json({
        success: true,
        scenario,
        message: 'AI 컨텍스트가 재생성되었습니다'
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (error) {
    console.error('Scenario Manager API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// 새 시나리오 생성 함수
async function createNewScenario(data) {
  const { scenario_id, title, description, background_setting, mood, available_characters } = data;
  
  // AI를 이용한 소설풍 컨텍스트 생성
  const aiContext = await generateAIContext({
    title, 
    description, 
    background_setting, 
    mood
  });
  
  const newScenario = {
    id: scenario_id,
    title,
    description,
    background_setting,
    mood,
    active_status: true,
    created_date: new Date().toISOString().split('T')[0],
    ai_generated_context: aiContext,
    custom_context: "",
    available_characters: available_characters || [],
    episode_count: 0,
    tags: extractTags(description, mood)
  };

  // 데이터베이스에 저장 (실제로는 파일 시스템 사용)
  await saveScenarioToDatabase(newScenario);
  
  return newScenario;
}

// AI 컨텍스트 생성 함수
async function generateAIContext(scenarioData) {
  try {
    // Claude API 호출을 통한 소설풍 시놉시스 생성
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!CLAUDE_API_KEY) {
      return generateFallbackContext(scenarioData);
    }

    const prompt = `다음 정보를 바탕으로 로맨스 게임의 시나리오 컨텍스트를 소설풍으로 작성해주세요:

제목: ${scenarioData.title}
설명: ${scenarioData.description} 
배경: ${scenarioData.background_setting}
분위기: ${scenarioData.mood}

요구사항:
1. 200-300자 분량의 소설풍 시놉시스
2. 등장인물의 감정과 상황을 생생하게 묘사
3. 로맨틱하고 몰입감 있는 문체
4. 한국 문화에 맞는 자연스러운 표현

시나리오 컨텍스트:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.content[0]?.text || generateFallbackContext(scenarioData);
    } else {
      return generateFallbackContext(scenarioData);
    }

  } catch (error) {
    console.error('AI Context Generation Error:', error);
    return generateFallbackContext(scenarioData);
  }
}

// Fallback 컨텍스트 생성
function generateFallbackContext(scenarioData) {
  return `${scenarioData.background_setting}에서 펼쳐지는 ${scenarioData.mood} 가득한 이야기. ${scenarioData.description}의 상황 속에서 두 사람의 마음이 조금씩 가까워져 간다. 설레는 마음과 조심스러운 감정이 교차하는 특별한 순간들이 기다리고 있다.`;
}

// 시나리오 데이터베이스 로드
async function loadScenarioDatabase() {
  try {
    const scenarioPath = path.join(process.cwd(), 'data', 'scenarios', 'scenario-database.json');
    const scenarioData = fs.readFileSync(scenarioPath, 'utf8');
    return JSON.parse(scenarioData);
  } catch (error) {
    console.error('Failed to load scenario database:', error);
    return { metadata: {}, scenarios: {} };
  }
}

// 시나리오 데이터베이스에 저장
async function saveScenarioToDatabase(scenario) {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'scenarios', 'scenario-database.json');
    const db = await loadScenarioDatabase();
    
    db.scenarios[scenario.id] = scenario;
    db.metadata.total_scenarios = Object.keys(db.scenarios).length;
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save scenario:', error);
    return false;
  }
}

// 시나리오 업데이트
async function updateScenario(data) {
  const db = await loadScenarioDatabase();
  const scenario = db.scenarios[data.scenario_id];
  
  if (!scenario) {
    throw new Error('Scenario not found');
  }
  
  Object.assign(scenario, data);
  scenario.last_modified = new Date().toISOString().split('T')[0];
  
  await saveScenarioToDatabase(scenario);
  return scenario;
}

// AI 컨텍스트 재생성
async function regenerateAIContext(data) {
  const scenario = await loadScenarioDatabase().then(db => db.scenarios[data.scenario_id]);
  
  if (!scenario) {
    throw new Error('Scenario not found');
  }
  
  const newContext = await generateAIContext({
    title: data.title || scenario.title,
    description: data.description || scenario.description,
    background_setting: data.background_setting || scenario.background_setting,
    mood: data.mood || scenario.mood
  });
  
  scenario.ai_generated_context = newContext;
  await saveScenarioToDatabase(scenario);
  
  return scenario;
}

// 태그 추출 함수
function extractTags(description, mood) {
  const keywords = [...description.split(' '), ...mood.split(', ')];
  return keywords.map(word => word.toLowerCase().replace(/[^a-zA-Z가-힣]/g, '')).filter(tag => tag.length > 1);
}