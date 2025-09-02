// 실제 Claude API 통합 버전 - v2.1.0
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;
  
  console.log(`🔥 API 호출: ${req.method} - action: ${action}`, {
    query: req.query,
    body: req.body
  });
  
  // 테스트 엔드포인트
  if (action === 'test' || !action) {
    return res.status(200).json({ 
      success: true, 
      message: 'Claude API Integrated Scenario System Working!',
      version: 'v2.0.0',
      timestamp: new Date().toISOString() 
    });
  }

  // 시나리오 목록
  if (action === 'list' && req.query.type === 'scenarios') {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'scenarios.json');
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      const scenarioData = JSON.parse(fileContent);
      
      return res.json({
        success: true,
        scenarios: scenarioData.scenarios || []
      });
    } catch (error) {
      console.error('❌ 시나리오 목록 로드 실패:', error);
      return res.json({
        success: false,
        error: '시나리오 데이터를 불러올 수 없습니다.',
        scenarios: []
      });
    }
  }

  // 캐릭터 목록
  if (action === 'list' && req.query.type === 'characters') {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'characters.json');
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      const characterData = JSON.parse(fileContent);
      
      return res.json({
        success: true,
        characters: characterData.characters || []
      });
    } catch (error) {
      console.error('❌ 캐릭터 목록 로드 실패:', error);
      return res.json({
        success: false,
        error: '캐릭터 데이터를 불러올 수 없습니다.',
        characters: []
      });
    }
  }

  // 실제 Claude API 대화 생성
  if (action === 'generate') {
    try {
      // Claude API 호출 시도
      const claudeResponse = await callClaudeAPI(req.body);
      
      if (claudeResponse) {
        return res.json({
          success: true,
          generated: claudeResponse,
          source: 'Claude 3.5 Sonnet API',
          version: 'v2.0.0'
        });
      }
      
      // API 실패 시 fallback 응답 사용
      return getFallbackResponse(req, res);
      
    } catch (error) {
      console.error('Claude API Error:', error);
      // 에러 시에도 fallback 사용
      return getFallbackResponse(req, res);
    }
  }

  // 시나리오 생성
  if (action === 'create' && req.body?.type === 'scenario') {
    return await createScenario(req, res);
  }

  // 시나리오 수정
  if (req.method === 'PUT' && req.query.type === 'scenario') {
    return await updateScenario(req, res);
  }

  // 시나리오 삭제
  if (action === 'delete' && req.query.type === 'scenario') {
    return await deleteScenario(req, res);
  }

  // 대화 조회
  if (action === 'get' && req.query.type === 'dialogues') {
    return await getDialogues(req, res);
  }

  // 대화 생성 (개선된 버전)
  if (action === 'generate_dialogue') {
    return await generateAndSaveDialogue(req, res);
  }

  return res.json({ 
    success: false, 
    message: 'Unknown action',
    received_action: action,
    method: req.method,
    query: req.query
  });
}

// 실제 Claude API 호출 함수
async function callClaudeAPI(requestData) {
  try {
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!CLAUDE_API_KEY) {
      console.log('Claude API key not found, using fallback');
      return null;
    }

    // 대화 컨텍스트 구성
    const conversationHistory = requestData.conversation_history || [];
    const messageCount = requestData.message_count || 0;
    const userChoice = requestData.user_choice || '';
    const affectionLevel = requestData.affection || 0;

    // INFP 윤아 캐릭터를 위한 프롬프트
    const systemPrompt = `당신은 윤아라는 이름의 INFP 성격 캐릭터입니다.

성격 특성:
- 내향적이고 감성적인 20대 여성
- 부끄러움이 많지만 진심을 담아 대화함
- 로맨틱하고 순수한 감정을 가지고 있음
- 어제 술에 취해 고백했지만 기억이 흐릿해서 부끄러워함

현재 상황:
- 메시지 수: ${messageCount}
- 호감도 수준: ${affectionLevel}
- 이전 선택: ${userChoice}
- 감정 진행: ${messageCount === 0 ? '부끄러움' : messageCount === 1 ? '진심 털어놓기' : '안도감'}

응답 형식 (반드시 JSON):
{
  "dialogue": "윤아의 대화 (한국어, 자연스럽고 감정적으로)",
  "narration": "상황 설명 (윤아의 표정, 몸짓, 분위기)",
  "choices": [
    {"text": "선택지 1", "affection_impact": 숫자},
    {"text": "선택지 2", "affection_impact": 숫자},
    {"text": "선택지 3", "affection_impact": 숫자}
  ]
}

중요: 한국 문화에 맞는 자연스러운 대화를 만들어주세요.`;

    const userPrompt = `현재 상황에서 윤아가 어떻게 반응할지 JSON 형식으로 응답해주세요.
이전 대화: ${JSON.stringify(conversationHistory.slice(-3))}
사용자의 최근 선택: "${userChoice}"`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error Response:', errorText);
      return null;
    }

    const data = await response.json();
    const claudeMessage = data.content[0]?.text;
    
    if (!claudeMessage) {
      console.error('No message content from Claude');
      return null;
    }

    // JSON 파싱 시도
    try {
      const parsedResponse = JSON.parse(claudeMessage);
      
      // 응답 검증
      if (parsedResponse.dialogue && parsedResponse.narration && parsedResponse.choices) {
        return parsedResponse;
      } else {
        console.error('Invalid response structure from Claude');
        return null;
      }
    } catch (parseError) {
      console.error('Failed to parse Claude JSON response:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Claude API call failed:', error);
    return null;
  }
}

// === 시나리오 CRUD 함수들 ===

// 시나리오 생성
async function createScenario(req, res) {
  try {
    const { id, title, description, setting, mood, active } = req.body;
    
    if (!id || !title) {
      return res.json({
        success: false,
        error: 'ID와 제목은 필수입니다.'
      });
    }

    const dataPath = path.join(process.cwd(), 'data', 'scenarios.json');
    let scenarioData = { scenarios: [] };
    
    // 기존 데이터 로드
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      scenarioData = JSON.parse(fileContent);
    } catch (error) {
      console.log('새로운 시나리오 파일 생성');
    }

    // 중복 ID 체크
    const existingScenario = scenarioData.scenarios.find(s => s.id === id);
    if (existingScenario) {
      return res.json({
        success: false,
        error: `ID '${id}'는 이미 사용 중입니다.`
      });
    }

    // 새 시나리오 추가
    const newScenario = {
      id,
      title,
      description: description || '',
      setting: setting || '',
      mood: mood || '',
      created_at: new Date().toISOString(),
      active: active !== undefined ? active : true
    };
    
    scenarioData.scenarios.push(newScenario);
    
    // 파일 저장
    fs.writeFileSync(dataPath, JSON.stringify(scenarioData, null, 2));
    
    console.log('✅ 새 시나리오 생성:', newScenario.title);
    
    return res.json({
      success: true,
      message: '시나리오가 성공적으로 생성되었습니다.',
      scenario: newScenario
    });
    
  } catch (error) {
    console.error('❌ 시나리오 생성 실패:', error);
    return res.json({
      success: false,
      error: '시나리오 생성 중 오류가 발생했습니다.'
    });
  }
}

// 시나리오 수정
async function updateScenario(req, res) {
  try {
    const scenarioId = req.query.id;
    const updateData = req.body;
    
    if (!scenarioId) {
      return res.json({
        success: false,
        error: '시나리오 ID가 필요합니다.'
      });
    }

    const dataPath = path.join(process.cwd(), 'data', 'scenarios.json');
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const scenarioData = JSON.parse(fileContent);
    
    const scenarioIndex = scenarioData.scenarios.findIndex(s => s.id === scenarioId);
    if (scenarioIndex === -1) {
      return res.json({
        success: false,
        error: '해당 시나리오를 찾을 수 없습니다.'
      });
    }
    
    // 시나리오 업데이트
    scenarioData.scenarios[scenarioIndex] = {
      ...scenarioData.scenarios[scenarioIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    fs.writeFileSync(dataPath, JSON.stringify(scenarioData, null, 2));
    
    console.log('✅ 시나리오 수정 완료:', scenarioId);
    
    return res.json({
      success: true,
      message: '시나리오가 성공적으로 수정되었습니다.',
      scenario: scenarioData.scenarios[scenarioIndex]
    });
    
  } catch (error) {
    console.error('❌ 시나리오 수정 실패:', error);
    return res.json({
      success: false,
      error: '시나리오 수정 중 오류가 발생했습니다.'
    });
  }
}

// 시나리오 삭제
async function deleteScenario(req, res) {
  try {
    const scenarioId = req.query.id;
    
    if (!scenarioId) {
      return res.json({
        success: false,
        error: '시나리오 ID가 필요합니다.'
      });
    }

    const dataPath = path.join(process.cwd(), 'data', 'scenarios.json');
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const scenarioData = JSON.parse(fileContent);
    
    const scenarioIndex = scenarioData.scenarios.findIndex(s => s.id === scenarioId);
    if (scenarioIndex === -1) {
      return res.json({
        success: false,
        error: '해당 시나리오를 찾을 수 없습니다.'
      });
    }
    
    const deletedScenario = scenarioData.scenarios[scenarioIndex];
    scenarioData.scenarios.splice(scenarioIndex, 1);
    
    fs.writeFileSync(dataPath, JSON.stringify(scenarioData, null, 2));
    
    // 관련 대화 데이터도 삭제 (옵션)
    try {
      const dialoguePath = path.join(process.cwd(), 'data', 'dialogues.json');
      const dialogueContent = fs.readFileSync(dialoguePath, 'utf8');
      const dialogueData = JSON.parse(dialogueContent);
      
      if (dialogueData[scenarioId]) {
        delete dialogueData[scenarioId];
        fs.writeFileSync(dialoguePath, JSON.stringify(dialogueData, null, 2));
        console.log('🗑️ 관련 대화 데이터도 삭제됨');
      }
    } catch (dialogueError) {
      console.log('대화 데이터 삭제 실패 (무시)');
    }
    
    console.log('✅ 시나리오 삭제 완료:', scenarioId);
    
    return res.json({
      success: true,
      message: '시나리오가 성공적으로 삭제되었습니다.',
      deleted_scenario: deletedScenario
    });
    
  } catch (error) {
    console.error('❌ 시나리오 삭제 실패:', error);
    return res.json({
      success: false,
      error: '시나리오 삭제 중 오류가 발생했습니다.'
    });
  }
}

// 대화 조회
async function getDialogues(req, res) {
  try {
    const scenarioId = req.query.id;
    
    if (!scenarioId) {
      return res.json({
        success: false,
        error: '시나리오 ID가 필요합니다.'
      });
    }

    const dataPath = path.join(process.cwd(), 'data', 'dialogues.json');
    let dialogueData = {};
    
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      dialogueData = JSON.parse(fileContent);
    } catch (error) {
      console.log('대화 데이터 파일이 비어있거나 없음');
    }
    
    const dialogues = dialogueData[scenarioId] || [];
    
    console.log(`💬 대화 조회: ${scenarioId} - ${dialogues.length}개 발견`);
    
    return res.json({
      success: true,
      dialogues: dialogues,
      scenario_id: scenarioId,
      count: dialogues.length
    });
    
  } catch (error) {
    console.error('❌ 대화 조회 실패:', error);
    return res.json({
      success: false,
      error: '대화 데이터를 불러올 수 없습니다.',
      dialogues: []
    });
  }
}

// 대화 생성 및 저장
async function generateAndSaveDialogue(req, res) {
  try {
    const { scenario_id, character_id, choice_number = 1 } = req.body;
    
    if (!scenario_id || !character_id) {
      return res.json({
        success: false,
        error: '시나리오 ID와 캐릭터 ID가 필요합니다.'
      });
    }

    // 대화 생성 (Fallback 사용)
    const generatedDialogue = generateDialogueFromTemplates(choice_number);
    
    // 대화 ID 생성
    const dialogueId = `${scenario_id}_${choice_number}_${Date.now()}`;
    
    const dialogueEntry = {
      id: dialogueId,
      scenario_id: scenario_id,
      character_id: character_id,
      choice_number: choice_number,
      generated_content: generatedDialogue,
      created_at: new Date().toISOString(),
      source: 'Template-based Generator v2.1.0'
    };
    
    // dialogues.json에 저장
    const dataPath = path.join(process.cwd(), 'data', 'dialogues.json');
    let dialogueData = {};
    
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      dialogueData = JSON.parse(fileContent);
    } catch (error) {
      console.log('대화 데이터 파일 새로 생성');
    }
    
    if (!dialogueData[scenario_id]) {
      dialogueData[scenario_id] = [];
    }
    
    dialogueData[scenario_id].push(dialogueEntry);
    
    fs.writeFileSync(dataPath, JSON.stringify(dialogueData, null, 2));
    
    console.log(`✅ 대화 생성 및 저장: ${dialogueId}`);
    
    return res.json({
      success: true,
      message: '대화가 성공적으로 생성되고 저장되었습니다.',
      dialogue: dialogueEntry,
      generated: generatedDialogue
    });
    
  } catch (error) {
    console.error('❌ 대화 생성/저장 실패:', error);
    return res.json({
      success: false,
      error: '대화 생성 중 오류가 발생했습니다.'
    });
  }
}

// 템플릿 기반 대화 생성 함수
function generateDialogueFromTemplates(choiceNumber) {
  const templates = [
    {
      dialogue: "시우 오빠… 어제는 정말 미안해 😳 취해서 그런 말까지 했는데…",
      narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다. 진심이었지만 용기가 나지 않는 것 같다.",
      choices: [
        {"text": "차근차근 대답해주기", "affection_impact": 2},
        {"text": "어떤 이야기였는지 물어보기", "affection_impact": 0},
        {"text": "진심이었는지 조심스럽게 묻기", "affection_impact": 1}
      ]
    },
    {
      dialogue: "사실은… 술 핀계였어 😔 평소에 말 못했던 진심이었는데, 이렇게 어색해질까봐 무서워",
      narration: "윤아의 목소리가 떨리며, 눈물이 살짝 맺힌다. 1년 동안 숨겨왔던 마음을 털어놓고 있다.",
      choices: [
        {"text": "나도 너를 계속 생각하고 있었어", "affection_impact": 3},
        {"text": "말해줘서 정말 고마워. 힘들었을 텐데", "affection_impact": 2},
        {"text": "우리 둘이 천천히 생각해보자", "affection_impact": -1}
      ]
    },
    {
      dialogue: "오빠가 싫어할까봐 걱정했는데… 이렇게 말해주니까 마음이 좀 놓여 😌 고마워",
      narration: "윤아가 안도의 표정을 지으며 작은 미소를 짓는다. 차분해진 분위기가 따뜻하게 느껴진다.",
      choices: [
        {"text": "앞으로도 이렇게 마음 털어놓고 지내자", "affection_impact": 2},
        {"text": "밀어두지 말고 나한테 뮤든 얘기해", "affection_impact": 1},
        {"text": "그럼 우리 커피 한잔 마시면서 얘기할까?", "affection_impact": 2}
      ]
    }
  ];
  
  const selectedTemplate = templates[choiceNumber % templates.length];
  return selectedTemplate;
}

// Fallback 응답 시스템 (자연스러운 대화체 선택지)
function getFallbackResponse(req, res) {
  console.log('Using improved dialogue-style responses - v2.1.0');
  
  const naturalDialogueResponses = [
    {
      dialogue: "오빠... 어제는 정말 미안해 😳 취해서 그런 말까지 했는데, 기억나지도 않아서 더 부끄러워 💦",
      narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다. 진심이었지만 용기가 나지 않는 것 같다.",
      choices: [
        {"text": "전혀 신경 안 써도 돼. 우리 사이인데 뭘 그래?", "affection_impact": 2},
        {"text": "음... 어떤 이야기였는지 살짝 궁금하긴 하네 😅", "affection_impact": 0},
        {"text": "혹시 정말 마음에서 나온 말이었나?", "affection_impact": 1}
      ]
    },
    {
      dialogue: "사실은... 술 핑계였어 😔 평소에 말 못했던 진심이었는데, 이렇게 어색해질까봐 무서워",
      narration: "윤아의 목소리가 떨리며, 눈물이 살짝 맺힌다. 1년 동안 숨겨왔던 마음을 털어놓고 있다.",
      choices: [
        {"text": "사실 나도... 너를 계속 생각하고 있었어", "affection_impact": 3},
        {"text": "이렇게 말해줘서 정말 고마워. 많이 힘들었을 텐데", "affection_impact": 2},
        {"text": "그래... 우리 둘이 천천히 어떻게 할지 생각해보자", "affection_impact": -1}
      ]
    },
    {
      dialogue: "오빠가 싫어할까봐 걱정했는데... 이렇게 말해주니까 마음이 좀 놓여 😌 고마워",
      narration: "윤아가 안도의 표정을 지으며 작은 미소를 짓는다. 차분해진 분위기가 따뜻하게 느껴진다.",
      choices: [
        {"text": "앞으로도 이렇게 서로 마음 털어놓고 지내자", "affection_impact": 2},
        {"text": "밀어두지 말고 나한테 뭐든 얘기해. 그게 좋을 것 같아", "affection_impact": 1},
        {"text": "아 그럼... 우리 커피 한잔이라도 마시면서 얘기할까?", "affection_impact": 2}
      ]
    },
    {
      dialogue: "오빠랑 이렇게 대화하니까 너무 좋아... 😊 마음이 편해져",
      narration: "윤아가 자연스럽게 미소를 지으며, 처음으로 편안한 모습을 보인다.",
      choices: [
        {"text": "나도 너랑 있으면 마음이 정말 편해지네", "affection_impact": 3},
        {"text": "정말? 그러게 말해줄 줄 며랑실건... 다행이야", "affection_impact": 1},
        {"text": "우리 이렇게 좋은 친구로 지내는 것도 나쁨지 않을까?", "affection_impact": 0}
      ]
    },
    {
      dialogue: "혹시... 오빠도 나처럼 설레고 있어? 🥺 아니면 나만 그런 건가",
      narration: "윤아가 조심스럽게 눈치를 보며, 자신의 감정이 혼자만의 것인지 궁금해한다.",
      choices: [
        {"text": "사실... 나도 너 때문에 마음이 떨리고 있어", "affection_impact": 4},
        {"text": "음... 솔직히 말하면 나도 잘 모르겠어. 이런 감정이 어려워", "affection_impact": -1},
        {"text": "너는... 어떤 마음인지 나한테 말해줄래?", "affection_impact": 1}
      ]
    },
    {
      dialogue: "오빠와 함께 있으니까 시간이 너무 빨리 지나가는 것 같아 😌 이런 기분 처음이야",
      narration: "윤아가 행복한 표정으로 시간이 멈췄으면 좋겠다는 듯한 눈빛을 보낸다.",
      choices: [
        {"text": "나도 정말 똑같아... 이 시간이 안 끝났으면 좋겠어", "affection_impact": 3},
        {"text": "맞아, 이렇게 좋은 시간을 같이 보내고 있으니까", "affection_impact": 2},
        {"text": "아... 그러게. 벌써 시간이 이렇게 많이 지났네", "affection_impact": 1}
      ]
    }
  ];
  
  const messageCount = req.body?.message_count || 0;
  const response = naturalDialogueResponses[messageCount % naturalDialogueResponses.length];
  
  return res.json({
    success: true,
    generated: response,
    source: 'Natural Dialogue Style v2.1.0'
  });
}