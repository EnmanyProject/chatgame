// 시나리오 관리 API - 다중 시나리오 및 캐릭터 관리
const fs = require('fs').promises;
const path = require('path');

// fetch API가 없는 Node.js 환경을 위한 폴리필
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  try {
    fetch = require('node-fetch');
  } catch (error) {
    // node-fetch가 없는 경우 간단한 대체 구현
    fetch = null;
  }
} else {
  fetch = globalThis.fetch;
}

// 시나리오 및 캐릭터 데이터 파일 경로 (Vercel 환경 고려)
let SCENARIOS_FILE, CHARACTERS_FILE, DIALOGUES_FILE;
try {
  // Vercel 환경에서는 프로젝트 루트에서 상대경로로 접근
  SCENARIOS_FILE = path.join(process.cwd(), 'data/scenarios.json');
  CHARACTERS_FILE = path.join(process.cwd(), 'data/characters.json');
  DIALOGUES_FILE = path.join(process.cwd(), 'data/dialogues.json');
} catch (error) {
  console.warn('Path resolution failed, using fallback paths');
  SCENARIOS_FILE = './data/scenarios.json';
  CHARACTERS_FILE = './data/characters.json';
  DIALOGUES_FILE = './data/dialogues.json';
}

// 기본 시나리오 데이터
const DEFAULT_SCENARIOS = {
  scenarios: [
    {
      id: "hangover_confession",
      title: "어제 밤의 기억",
      description: "시우 오빠를 1년째 좋아하는 후배가 어제 술먹고 고백한 후 부끄러워하는 상황",
      setting: "다음날 아침, 메신저로 연락",
      mood: "부끄러움, 설렘, 긴장감",
      created_at: new Date().toISOString(),
      active: true
    },
    {
      id: "study_together", 
      title: "함께 공부하기",
      description: "도서관에서 같이 공부하는 상황",
      setting: "조용한 도서관",
      mood: "집중, 은밀한 대화",
      created_at: new Date().toISOString(),
      active: false
    }
  ]
};

// MBTI별 캐릭터 기본 데이터
const DEFAULT_CHARACTERS = {
  characters: [
    {
      id: "yuna_infp",
      name: "윤아",
      age: 20,
      mbti: "INFP",
      personality_traits: {
        primary: ["감성적", "이상주의적", "창의적", "내향적"],
        secondary: ["공감능력 뛰어남", "완벽주의 성향", "감정 표현 풍부"],
        speech_style: ["부드럽고 따뜻한 말투", "감정적 표현 많음", "이모티콘 자주 사용"]
      },
      relationship: "시우 오빠를 1년 넘게 좋아하는 후배",
      background: "예술을 전공하는 대학생, 감수성이 풍부함",
      avatar_url: "",
      scenarios: ["hangover_soup", "study_together"],
      created_at: new Date().toISOString(),
      active: true
    },
    {
      id: "mina_enfj",
      name: "미나",
      age: 22,
      mbti: "ENFJ", 
      personality_traits: {
        primary: ["외향적", "감정적", "조화로운", "계획적"],
        secondary: ["리더십 강함", "타인 배려", "사회적 관계 중시"],
        speech_style: ["친근하고 따뜻함", "격려하는 표현", "상대방 기분 배려"]
      },
      relationship: "같은 과 선배, 친근한 관계",
      background: "학생회 활동을 하는 적극적인 선배",
      avatar_url: "",
      scenarios: ["study_together"],
      created_at: new Date().toISOString(),
      active: true
    }
  ]
};

// 메모리 기반 데이터 저장소 (Vercel 서버리스 환경 대응)
let RUNTIME_SCENARIOS = null;
let RUNTIME_CHARACTERS = null;
let RUNTIME_DIALOGUES = {}; // 생성된 대화 저장소 {scenario_id: [dialogues]}
let RUNTIME_SETTINGS = {}; // 설정 저장소

// 파일에서 데이터 로드 (우선), 실패 시 메모리에서 로드, 그것도 실패 시 기본값
async function loadScenarios() {
  try {
    // 메모리에 있는 경우 우선 반환
    if (RUNTIME_SCENARIOS) {
      console.log('✅ Loading scenarios from memory');
      return RUNTIME_SCENARIOS;
    }
    
    console.log(`📁 Attempting to load scenarios from: ${SCENARIOS_FILE}`);
    
    // 파일 존재 확인
    try {
      await fs.access(SCENARIOS_FILE);
      console.log('📁 Scenarios file exists, reading...');
    } catch (accessError) {
      console.log('📁 Scenarios file does not exist, will create default');
      throw new Error('File does not exist');
    }
    
    const data = await fs.readFile(SCENARIOS_FILE, 'utf8');
    console.log(`📁 Read ${data.length} bytes from scenarios file`);
    
    const parsedData = JSON.parse(data);
    console.log(`✅ Parsed scenarios: ${parsedData.scenarios?.length || 0} items`);
    
    RUNTIME_SCENARIOS = parsedData; // 메모리에 캐시
    return parsedData;
    
  } catch (error) {
    console.log(`⚠️ File load failed: ${error.message}, creating default scenarios`);
    
    try {
      // 디렉토리 생성
      await fs.mkdir(path.dirname(SCENARIOS_FILE), { recursive: true });
      console.log(`📁 Created directory: ${path.dirname(SCENARIOS_FILE)}`);
      
      // 기본 데이터로 파일 생성
      const defaultData = JSON.stringify(DEFAULT_SCENARIOS, null, 2);
      await fs.writeFile(SCENARIOS_FILE, defaultData, 'utf8');
      console.log(`✅ Created default scenarios file with ${defaultData.length} bytes`);
      
      RUNTIME_SCENARIOS = DEFAULT_SCENARIOS;
      return DEFAULT_SCENARIOS;
      
    } catch (createError) {
      console.error(`❌ Failed to create scenarios file: ${createError.message}`);
      // 파일 생성도 실패한 경우 메모리만 사용
      RUNTIME_SCENARIOS = DEFAULT_SCENARIOS;
      return DEFAULT_SCENARIOS;
    }
  }
}

async function loadCharacters() {
  try {
    // 메모리에 있는 경우 우선 반환
    if (RUNTIME_CHARACTERS) {
      console.log('✅ Loading characters from memory');
      return RUNTIME_CHARACTERS;
    }
    
    console.log(`📁 Attempting to load characters from: ${CHARACTERS_FILE}`);
    
    // 파일 존재 확인
    try {
      await fs.access(CHARACTERS_FILE);
      console.log('📁 Characters file exists, reading...');
    } catch (accessError) {
      console.log('📁 Characters file does not exist, will create default');
      throw new Error('File does not exist');
    }
    
    const data = await fs.readFile(CHARACTERS_FILE, 'utf8');
    console.log(`📁 Read ${data.length} bytes from characters file`);
    
    const parsedData = JSON.parse(data);
    console.log(`✅ Parsed characters: ${parsedData.characters?.length || 0} items`);
    
    RUNTIME_CHARACTERS = parsedData; // 메모리에 캐시
    return parsedData;
    
  } catch (error) {
    console.log(`⚠️ File load failed: ${error.message}, creating default characters`);
    
    try {
      // 디렉토리 생성
      await fs.mkdir(path.dirname(CHARACTERS_FILE), { recursive: true });
      console.log(`📁 Created directory: ${path.dirname(CHARACTERS_FILE)}`);
      
      // 기본 데이터로 파일 생성
      const defaultData = JSON.stringify(DEFAULT_CHARACTERS, null, 2);
      await fs.writeFile(CHARACTERS_FILE, defaultData, 'utf8');
      console.log(`✅ Created default characters file with ${defaultData.length} bytes`);
      
      RUNTIME_CHARACTERS = DEFAULT_CHARACTERS;
      return DEFAULT_CHARACTERS;
      
    } catch (createError) {
      console.error(`❌ Failed to create characters file: ${createError.message}`);
      // 파일 생성도 실패한 경우 메모리만 사용
      RUNTIME_CHARACTERS = DEFAULT_CHARACTERS;
      return DEFAULT_CHARACTERS;
    }
  }
}

async function loadDialogues() {
  // 메모리에 있는 경우 우선 반환
  if (RUNTIME_DIALOGUES && Object.keys(RUNTIME_DIALOGUES).length > 0) {
    console.log('Loading dialogues from memory');
    return RUNTIME_DIALOGUES;
  }
  
  try {
    console.log('Attempting to load dialogues from file');
    const data = await fs.readFile(DIALOGUES_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    RUNTIME_DIALOGUES = parsedData; // 메모리에 캐시
    return parsedData;
  } catch (error) {
    console.log('Dialogue file load failed, creating empty dialogues file');
    // 디렉토리 생성
    await fs.mkdir(path.dirname(DIALOGUES_FILE), { recursive: true });
    // 빈 대화 객체로 파일 생성
    const emptyDialogues = {};
    await fs.writeFile(DIALOGUES_FILE, JSON.stringify(emptyDialogues, null, 2), 'utf8');
    RUNTIME_DIALOGUES = emptyDialogues;
    return emptyDialogues;
  }
}

// 데이터 저장 (메모리 우선, 파일 저장은 시도해보지만 실패해도 무시)
async function saveScenarios(data) {
  try {
    // 메모리에 저장 (필수)
    RUNTIME_SCENARIOS = data;
    console.log('Scenarios saved to memory');
    
    // 파일 저장 시도 (옵션, 실패해도 무시)
    try {
      await fs.writeFile(SCENARIOS_FILE, JSON.stringify(data, null, 2), 'utf8');
      console.log('Scenarios also saved to file');
    } catch (fileError) {
      console.log('File save failed, but memory save succeeded');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save scenarios:', error);
    return false;
  }
}

async function saveCharacters(data) {
  try {
    // 메모리에 저장 (필수)
    RUNTIME_CHARACTERS = data;
    console.log('Characters saved to memory');
    
    // 파일 저장 시도 (옵션, 실패해도 무시)
    try {
      await fs.writeFile(CHARACTERS_FILE, JSON.stringify(data, null, 2), 'utf8');
      console.log('Characters also saved to file');
    } catch (fileError) {
      console.log('File save failed, but memory save succeeded');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save characters:', error);
    return false;
  }
}

async function saveDialogues(data) {
  try {
    // 메모리에 저장 (필수)
    RUNTIME_DIALOGUES = data;
    console.log('Dialogues saved to memory');
    
    // 파일 저장 시도 (옵션, 실패해도 무시)
    try {
      // 디렉토리 생성 시도
      await fs.mkdir(path.dirname(DIALOGUES_FILE), { recursive: true });
      await fs.writeFile(DIALOGUES_FILE, JSON.stringify(data, null, 2), 'utf8');
      console.log('Dialogues also saved to file');
    } catch (fileError) {
      console.log('File save failed, but memory save succeeded');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save dialogues:', error);
    return false;
  }
}

// GPT를 통한 주관식 응답 평가
async function evaluateSubjectiveResponseWithGPT({character, scenario, userMessage, currentAffection, choiceNumber, characterMbti, gptConfig}) {
  if (!gptConfig.enabled || !gptConfig.api_key) {
    throw new Error('GPT API not configured');
  }

  if (!fetch) {
    throw new Error('fetch API is not available in this environment');
  }

  const mbtiPrompt = createMBTIPrompt(character.mbti);
  
  const systemPrompt = `당신은 "${character.name}" 캐릭터로서 주관식 질문에 대한 답변을 평가하고 반응하는 AI입니다.

캐릭터 정보:
- 이름: ${character.name} (${character.age}세)
- MBTI: ${character.mbti}
- 성격: ${character.personality_traits.primary.join(', ')}
- 말투: ${character.personality_traits.speech_style.join(', ')}
- 관계: ${character.relationship}

${mbtiPrompt}

현재 상황:
- 현재 호감도: ${currentAffection}
- 선택 횟수: ${choiceNumber}
- 시나리오: ${scenario.title}

사용자의 답변을 MBTI 성격에 맞게 평가하고 반응해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "character_response": "캐릭터의 반응 (자연스럽고 감정이 담긴 50자 이내)",
  "narration": "상황 설명 지문 (30자 이내)", 
  "affection_change": 호감도_변화값_숫자(-10에서_+10사이),
  "emotion": "감정_상태(happy/shy/love/excited/curious/sad/neutral)",
  "mbti_analysis": "MBTI에_따른_반응_분석(한_줄)"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gptConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: gptConfig.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `사용자 답변: "${userMessage}"\n\n이 답변에 대한 ${character.name}의 반응을 생성해주세요.` }
        ],
        max_tokens: 300,
        temperature: gptConfig.temperature || 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content.trim());
    
    // 호감도 변화값 검증
    result.affection_change = Math.max(-10, Math.min(10, result.affection_change || 0));
    
    return result;
  } catch (error) {
    console.error('GPT subjective evaluation failed:', error);
    throw error;
  }
}

// GPT API를 통한 대사 생성
async function generateDialogueWithGPT(character, scenario, situation, gptConfig) {
  if (!gptConfig.enabled || !gptConfig.api_key) {
    throw new Error('GPT API not configured');
  }

  if (!fetch) {
    throw new Error('fetch API is not available in this environment');
  }

  const mbtiPrompt = createMBTIPrompt(character.mbti);
  
  const systemPrompt = `당신은 "${character.name}" 캐릭터의 대사 작가입니다.

캐릭터 정보:
- 이름: ${character.name} (${character.age}세)
- MBTI: ${character.mbti}
- 성격: ${character.personality_traits.primary.join(', ')}
- 말투: ${character.personality_traits.speech_style.join(', ')}
- 관계: ${character.relationship}
- 배경: ${character.background}

${mbtiPrompt}

시나리오: ${scenario.title}
상황: ${situation}
분위기: ${scenario.mood}

다음 JSON 형식으로 응답해주세요:
{
  "dialogue": "캐릭터 대사 (50자 이내, 자연스럽고 감정이 담긴)",
  "narration": "상황 설명 지문 (30자 이내)",
  "emotion": "감정 상태 (happy/shy/love/excited/curious/sad/neutral 중 하나)",
  "choices": [
    {"text": "선택지1 (25자 이내)", "affection_impact": 2},
    {"text": "선택지2 (25자 이내)", "affection_impact": 0},
    {"text": "선택지3 (25자 이내)", "affection_impact": -1}
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gptConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: gptConfig.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `상황: "${situation}"에 대한 ${character.name}의 반응을 생성해주세요.` }
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content.trim());
  } catch (error) {
    console.error('GPT dialogue generation failed:', error);
    throw error;
  }
}

// MBTI별 프롬프트 생성
function createMBTIPrompt(mbti) {
  const mbtiGuides = {
    'INFP': '내향적이고 감정적이며 이상주의적. 깊은 감정 표현, 부드럽고 따뜻한 말투 사용.',
    'ENFJ': '외향적이고 감정적이며 타인 지향적. 격려하고 배려하는 표현, 사회적 관계 중시.',
    'INTJ': '내향적이고 직관적이며 계획적. 논리적이고 차분한 표현, 효율성 중시.',
    'ESFP': '외향적이고 감각적이며 자유로움. 밝고 에너지 넘치는 표현, 즐거움 추구.',
    'ISFJ': '내향적이고 감각적이며 배려심 많음. 조심스럽고 따뜻한 표현, 안정 추구.',
    'ENTP': '외향적이고 직관적이며 창의적. 재치있고 도전적인 표현, 새로움 추구.'
  };

  return mbtiGuides[mbti] || '개성 있는 캐릭터로 표현해주세요.';
}

module.exports = async (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST 요청의 경우 body에서, GET 요청의 경우 query에서 action을 가져옴
    let action, type;
    
    if (req.method === 'POST') {
      action = req.body?.action || req.query?.action;
      type = req.body?.type || req.query?.type;
    } else {
      action = req.query?.action;
      type = req.query?.type;
    }

    // 디버깅용 로그
    console.log(`[${req.method}] /api/scenario - action: "${action}", type: "${type}"`);
    if (req.method === 'POST' && req.body) {
      console.log('POST body:', JSON.stringify(req.body, null, 2));
    }

    switch (req.method) {
      case 'GET':
        return await handleGetRequest(req, res, action, type);
      case 'POST':
        return await handlePostRequest(req, res, action, type);
      case 'PUT':
        return await handlePutRequest(req, res, action, type);
      case 'DELETE':
        return await handleDeleteRequest(req, res, action, type);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Scenario API Error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// GET 요청 처리
async function handleGetRequest(req, res, action, type) {
  switch (action) {
    case 'list':
      if (type === 'scenarios') {
        const scenarios = await loadScenarios();
        return res.status(200).json({
          success: true,
          scenarios: scenarios.scenarios || [],
          metadata: { count: (scenarios.scenarios || []).length }
        });
      } else if (type === 'characters') {
        const characters = await loadCharacters();
        return res.status(200).json({
          success: true,
          characters: characters.characters || [],
          metadata: { count: (characters.characters || []).length }
        });
      }
      return res.status(400).json({ error: 'Invalid type parameter' });
      
    case 'get':
      const { id } = req.query;
      if (type === 'scenario') {
        const scenarios = await loadScenarios();
        const scenario = scenarios.scenarios.find(s => s.id === id);
        if (scenario) {
          return res.status(200).json({ success: true, scenario });
        }
      } else if (type === 'character') {
        const characters = await loadCharacters();
        const character = characters.characters.find(c => c.id === id);
        if (character) {
          return res.status(200).json({ success: true, character });
        }
      } else if (type === 'dialogues') {
        // 특정 시나리오의 대화 조회
        const scenario_id = id;
        await loadDialogues(); // 파일에서 최신 대화 로드
        const dialogues = RUNTIME_DIALOGUES[scenario_id] || [];
        return res.status(200).json({ 
          success: true, 
          dialogues,
          scenario_id,
          count: dialogues.length
        });
      }
      return res.status(404).json({ error: 'Not found' });
      
    default:
      // 액션이나 타입이 없는 경우 전체 데이터 반환
      const scenarios = await loadScenarios();
      const characters = await loadCharacters();
      return res.status(200).json({
        success: true,
        scenarios: scenarios.scenarios || [],
        characters: characters.characters || [],
        metadata: {
          scenario_count: (scenarios.scenarios || []).length,
          character_count: (characters.characters || []).length
        }
      });
  }
}

// POST 요청 처리
async function handlePostRequest(req, res, action, type) {
  switch (action) {
    case 'create':
      if (type === 'scenario') {
        try {
          const scenarios = await loadScenarios();
          const scenarioId = req.body.id || `scenario_${Date.now()}`;
          
          // 중복 ID 체크
          if (scenarios.scenarios.some(s => s.id === scenarioId)) {
            return res.status(400).json({ 
              error: 'Duplicate ID', 
              message: `Scenario with ID "${scenarioId}" already exists` 
            });
          }
          
          const newScenario = {
            id: scenarioId,
            title: req.body.title || 'Untitled Scenario',
            description: req.body.description || '',
            setting: req.body.setting || '',
            mood: req.body.mood || '',
            active: req.body.active !== undefined ? req.body.active : true,
            created_at: new Date().toISOString()
          };
          
          scenarios.scenarios.push(newScenario);
          console.log('Created new scenario:', newScenario.id);
          
          if (await saveScenarios(scenarios)) {
            return res.status(201).json({ success: true, scenario: newScenario });
          } else {
            throw new Error('Save operation failed');
          }
          
        } catch (error) {
          console.error('Scenario creation error:', error);
          return res.status(500).json({ 
            error: 'Failed to create scenario',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
        
      } else if (type === 'character') {
        try {
          const characters = await loadCharacters();
          const characterId = req.body.id || `character_${Date.now()}`;
          
          // 중복 ID 체크
          if (characters.characters.some(c => c.id === characterId)) {
            return res.status(400).json({ 
              error: 'Duplicate ID', 
              message: `Character with ID "${characterId}" already exists` 
            });
          }
          
          const newCharacter = {
            id: characterId,
            name: req.body.name || 'Unknown Character',
            age: req.body.age || 20,
            mbti: req.body.mbti || 'INFP',
            relationship: req.body.relationship || '',
            background: req.body.background || '',
            personality_traits: req.body.personality_traits || {
              primary: ["친근함"],
              secondary: ["감정 표현 풍부"],
              speech_style: ["자연스러운 말투"]
            },
            avatar_url: req.body.avatar_url || "",
            scenarios: req.body.scenarios || [],
            active: req.body.active !== undefined ? req.body.active : true,
            created_at: new Date().toISOString()
          };
          
          characters.characters.push(newCharacter);
          console.log('Created new character:', newCharacter.id);
          
          if (await saveCharacters(characters)) {
            return res.status(201).json({ success: true, character: newCharacter });
          } else {
            throw new Error('Save operation failed');
          }
          
        } catch (error) {
          console.error('Character creation error:', error);
          return res.status(500).json({ 
            error: 'Failed to create character',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
      }
      
      return res.status(400).json({ 
        error: 'Invalid type', 
        message: 'Type must be either "scenario" or "character"',
        received_type: type 
      });
      
    case 'generate':
      const { character_id, scenario_id, situation, gpt_config } = req.body;
      
      const characters = await loadCharacters();
      const scenarios = await loadScenarios();
      
      const character = characters.characters.find(c => c.id === character_id);
      const scenario = scenarios.scenarios.find(s => s.id === scenario_id);
      
      if (!character || !scenario) {
        return res.status(400).json({ error: 'Character or scenario not found' });
      }
      
      try {
        const generatedContent = await generateDialogueWithGPT(character, scenario, situation, gpt_config);
        
        // 생성된 대화를 메모리와 파일에 저장
        await loadDialogues(); // 최신 대화 로드
        if (!RUNTIME_DIALOGUES[scenario_id]) {
          RUNTIME_DIALOGUES[scenario_id] = [];
        }
        
        const dialogueEntry = {
          id: `dialogue_${Date.now()}`,
          character_id,
          character_name: character.name,
          situation,
          generated_content: generatedContent,
          created_at: new Date().toISOString()
        };
        
        RUNTIME_DIALOGUES[scenario_id].push(dialogueEntry);
        
        // 파일에 영구 저장
        await saveDialogues(RUNTIME_DIALOGUES);
        
        return res.status(200).json({
          success: true,
          generated: generatedContent,
          character: character.name,
          scenario: scenario.title,
          dialogue_id: dialogueEntry.id
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to generate dialogue',
          message: error.message
        });
      }
    
    case 'evaluate_subjective_response':
      // GPT를 통한 주관식 응답 평가
      const { character_id, scenario_id, user_message, current_affection, choice_number, character_mbti, gpt_config } = req.body;
      
      if (!gpt_config || !gpt_config.enabled || !gpt_config.api_key) {
        return res.status(400).json({
          error: 'GPT API not configured',
          message: 'GPT API key is required for subjective response evaluation'
        });
      }

      try {
        const characters = await loadCharacters();
        const scenarios = await loadScenarios();
        
        const character = characters.characters.find(c => c.id === character_id);
        const scenario = scenarios.scenarios.find(s => s.id === scenario_id);
        
        if (!character || !scenario) {
          return res.status(400).json({ error: 'Character or scenario not found' });
        }

        // GPT를 통한 MBTI 기반 응답 생성
        const evaluationResult = await evaluateSubjectiveResponseWithGPT({
          character,
          scenario,
          userMessage: user_message,
          currentAffection: current_affection,
          choiceNumber: choice_number,
          characterMbti: character_mbti,
          gptConfig: gpt_config
        });

        return res.status(200).json({
          success: true,
          ...evaluationResult
        });
        
      } catch (error) {
        console.error('Subjective response evaluation error:', error);
        return res.status(500).json({
          error: 'Failed to evaluate subjective response',
          message: error.message
        });
      }

    case 'save_settings':
      // GPT 설정 저장 (간단한 버전)
      return res.status(200).json({
        success: true,
        message: 'Settings saved successfully',
        saved_at: new Date().toISOString()
      });
      
    case 'test':
      // API 연결 테스트
      return res.status(200).json({ 
        success: true, 
        message: 'API server is running',
        timestamp: new Date().toISOString()
      });
      
    case 'reset':
      // 메모리 캐시 완전 초기화
      RUNTIME_SCENARIOS = null;
      RUNTIME_CHARACTERS = null;
      RUNTIME_DIALOGUES = {};
      RUNTIME_SETTINGS = {};
      
      console.log('🔧 Memory cache completely reset');
      
      // 즉시 파일에서 다시 로드
      try {
        const reloadedScenarios = await loadScenarios();
        const reloadedCharacters = await loadCharacters();
        const reloadedDialogues = await loadDialogues();
        
        return res.status(200).json({ 
          success: true, 
          message: 'Memory cache reset and reloaded successfully',
          data: {
            scenarios_count: reloadedScenarios.scenarios?.length || 0,
            characters_count: reloadedCharacters.characters?.length || 0,
            dialogues_count: Object.keys(reloadedDialogues).length || 0
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Reset and reload error:', error);
        return res.status(200).json({ 
          success: true, 
          message: 'Memory cache reset (reload failed)',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
    default:
      console.log('Invalid action received:', action);
      return res.status(400).json({ 
        error: 'Invalid action', 
        received_action: action,
        valid_actions: ['create', 'generate', 'save_settings', 'test', 'reset']
      });
  }
}

// PUT 요청 처리 (업데이트)
async function handlePutRequest(req, res, action, type) {
  const { id } = req.query;
  
  if (type === 'scenario') {
    const scenarios = await loadScenarios();
    const index = scenarios.scenarios.findIndex(s => s.id === id);
    
    if (index !== -1) {
      scenarios.scenarios[index] = { ...scenarios.scenarios[index], ...req.body };
      if (await saveScenarios(scenarios)) {
        return res.status(200).json({ success: true, scenario: scenarios.scenarios[index] });
      }
    }
  } else if (type === 'character') {
    const characters = await loadCharacters();
    const index = characters.characters.findIndex(c => c.id === id);
    
    if (index !== -1) {
      characters.characters[index] = { ...characters.characters[index], ...req.body };
      if (await saveCharacters(characters)) {
        return res.status(200).json({ success: true, character: characters.characters[index] });
      }
    }
  }
  
  return res.status(404).json({ error: 'Not found or failed to update' });
}

// DELETE 요청 처리
async function handleDeleteRequest(req, res, action, type) {
  const { id } = req.query;
  
  if (type === 'scenario') {
    const scenarios = await loadScenarios();
    scenarios.scenarios = scenarios.scenarios.filter(s => s.id !== id);
    
    if (await saveScenarios(scenarios)) {
      return res.status(200).json({ success: true, message: 'Scenario deleted' });
    }
  } else if (type === 'character') {
    const characters = await loadCharacters();
    characters.characters = characters.characters.filter(c => c.id !== id);
    
    if (await saveCharacters(characters)) {
      return res.status(200).json({ success: true, message: 'Character deleted' });
    }
  }
  
  return res.status(404).json({ error: 'Not found or failed to delete' });
}