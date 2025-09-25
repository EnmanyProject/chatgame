// 통합 시나리오 API v3.0.0 - 어드민 연동
import { getActiveApiKey } from './admin-auth.js';
      mbti: "INFP",
      personality_traits: {
        primary: ["감성적", "이상주의적", "창의적", "내향적"],
        secondary: ["공감능력 뛰어남", "완벽주의 성향", "감정 표현 풍부"],
        speech_style: ["부드럽고 따뜻한 말투", "감정적 표현 많음", "이모티콘 자주 사용"]
      },
      relationship: "시우 오빠를 1년 넘게 좋아하는 후배",
      background: "예술을 전공하는 대학생, 감수성이 풍부함",
      avatar_url: "photo/윤아.jpg",
      scenarios: ["hangover_confession", "test_scenario_001"],
      active: true
    },
    {
      id: "mina_enfp",
      name: "미나",
      age: 22,
      mbti: "ENFP",
      personality_traits: {
        primary: ["외향적", "감정적", "융통성", "인식형"],
        secondary: ["활발하고 열정적", "상상력 풍부", "사람들과의 관계 중시"],
        speech_style: ["친근하고 따뜻함", "격려하는 표현", "상대방 기분 배려"]
      },
      relationship: "같은 과 선배, 친근한 관계",
      background: "학생회 활동을 하는 적극적인 선배",
      avatar_url: "photo/미나.png",
      scenarios: ["test_scenario_001"],
      active: true
    }
  ],
  dialogues: {
    "test_scenario_001": [
      {
        id: "test_scenario_001_1_yuna",
        scenario_id: "test_scenario_001",
        character_id: "yuna_infp",
        choice_number: 1,
        generated_content: {
          dialogue: "오빠... 이 새로운 시스템 정말 잘 작동하는 것 같아요! 😊",
          narration: "윤아가 눈을 반짝이며 시스템 테스트 결과를 보고 있다.",
          choices: [
            {"text": "정말 잘 만들어졌네!", "affection_impact": 2},
            {"text": "아직 테스트가 더 필요할 것 같은데?", "affection_impact": 0},
            {"text": "너도 개발에 관심이 있구나", "affection_impact": 1}
          ]
        },
        created_at: "2025-09-02T15:30:00.000Z",
        source: "INFP Character Template"
      }
    ]
  }
};

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;
  
  console.log(`🔥 API 호출 v2.2.0: ${req.method} - action: ${action}`, {
    query: req.query,
    body: req.body
  });
  
  // 테스트 엔드포인트
  if (action === 'test' || !action) {
    return res.status(200).json({ 
      success: true, 
      message: 'Scenario Management API v2.2.0 - Memory Based Storage',
      version: 'v2.2.0',
      timestamp: new Date().toISOString(),
      storage_type: 'memory',
      scenarios_count: memoryStorage.scenarios.length,
      characters_count: memoryStorage.characters.length
    });
  }

  // 시나리오 목록
  if (action === 'list' && req.query.type === 'scenarios') {
    return res.json({
      success: true,
      scenarios: memoryStorage.scenarios
    });
  }

  // 캐릭터 목록
  if (action === 'list' && req.query.type === 'characters') {
    return res.json({
      success: true,
      characters: memoryStorage.characters
    });
  }

  // 시나리오 생성
  if (action === 'create' && req.body?.type === 'scenario') {
    return createScenario(req, res);
  }

  // 시나리오 수정
  if (req.method === 'PUT' && req.query.type === 'scenario') {
    return updateScenario(req, res);
  }

  // 시나리오 삭제
  if (action === 'delete' && req.query.type === 'scenario') {
    return deleteScenario(req, res);
  }

  // 대화 조회 (시나리오별)
  if (action === 'get' && req.query.type === 'dialogues') {
    return getDialogues(req, res);
  }

  // 캐릭터별 대화 조회 (새로운 기능)
  if (action === 'get' && req.query.type === 'character_dialogues') {
    return getCharacterDialogues(req, res);
  }

  // 캐릭터별 최적화 대화 생성 (새로운 기능)
  if (action === 'generate_character_dialogue') {
    return generateCharacterOptimizedDialogue(req, res);
  }

  // 대화 편집 (새로운 기능)
  if (action === 'edit_dialogue') {
    return editDialogue(req, res);
  }

  // 기존 대화 생성 (호환성 유지)
  if (action === 'generate') {
    return getFallbackResponse(req, res);
  }

  return res.json({ 
    success: false, 
    message: 'Unknown action',
    received_action: action,
    method: req.method,
    available_actions: [
      'test', 'list', 'create', 'delete', 'get', 'generate_character_dialogue', 'edit_dialogue'
    ]
  });
}

// === 시나리오 관리 함수들 ===

function createScenario(req, res) {
  try {
    const { id, title, description, setting, mood, active } = req.body;
    
    if (!id || !title) {
      return res.json({
        success: false,
        error: 'ID와 제목은 필수입니다.'
      });
    }

    // 중복 ID 체크
    const existingScenario = memoryStorage.scenarios.find(s => s.id === id);
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
    
    memoryStorage.scenarios.push(newScenario);
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
      error: '시나리오 생성 중 오류가 발생했습니다: ' + error.message
    });
  }
}

function updateScenario(req, res) {
  try {
    const scenarioId = req.query.id;
    const updateData = req.body;
    
    if (!scenarioId) {
      return res.json({
        success: false,
        error: '시나리오 ID가 필요합니다.'
      });
    }

    const scenarioIndex = memoryStorage.scenarios.findIndex(s => s.id === scenarioId);
    if (scenarioIndex === -1) {
      return res.json({
        success: false,
        error: '해당 시나리오를 찾을 수 없습니다.'
      });
    }
    
    // 시나리오 업데이트
    memoryStorage.scenarios[scenarioIndex] = {
      ...memoryStorage.scenarios[scenarioIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ 시나리오 수정 완료:', scenarioId);
    
    return res.json({
      success: true,
      message: '시나리오가 성공적으로 수정되었습니다.',
      scenario: memoryStorage.scenarios[scenarioIndex]
    });
    
  } catch (error) {
    console.error('❌ 시나리오 수정 실패:', error);
    return res.json({
      success: false,
      error: '시나리오 수정 중 오류가 발생했습니다: ' + error.message
    });
  }
}

function deleteScenario(req, res) {
  try {
    const scenarioId = req.query.id;
    
    if (!scenarioId) {
      return res.json({
        success: false,
        error: '시나리오 ID가 필요합니다.'
      });
    }

    const scenarioIndex = memoryStorage.scenarios.findIndex(s => s.id === scenarioId);
    if (scenarioIndex === -1) {
      return res.json({
        success: false,
        error: '해당 시나리오를 찾을 수 없습니다.'
      });
    }
    
    const deletedScenario = memoryStorage.scenarios[scenarioIndex];
    memoryStorage.scenarios.splice(scenarioIndex, 1);
    
    // 관련 대화 데이터도 삭제
    if (memoryStorage.dialogues[scenarioId]) {
      delete memoryStorage.dialogues[scenarioId];
      console.log('🗑️ 관련 대화 데이터도 삭제됨');
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
      error: '시나리오 삭제 중 오류가 발생했습니다: ' + error.message
    });
  }
}

// === 대화 관리 함수들 ===

function getDialogues(req, res) {
  try {
    const scenarioId = req.query.id;
    
    if (!scenarioId) {
      return res.json({
        success: false,
        error: '시나리오 ID가 필요합니다.'
      });
    }
    
    const dialogues = memoryStorage.dialogues[scenarioId] || [];
    
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
      error: '대화 데이터를 불러올 수 없습니다: ' + error.message,
      dialogues: []
    });
  }
}

// 새로운 기능: 캐릭터별 대화 조회
function getCharacterDialogues(req, res) {
  try {
    const characterId = req.query.id;
    
    if (!characterId) {
      return res.json({
        success: false,
        error: '캐릭터 ID가 필요합니다.'
      });
    }
    
    // 모든 시나리오에서 해당 캐릭터의 대화 찾기
    let characterDialogues = [];
    
    Object.entries(memoryStorage.dialogues).forEach(([scenarioId, dialogues]) => {
      const characterDialoguesInScenario = dialogues.filter(d => d.character_id === characterId);
      characterDialogues = characterDialogues.concat(characterDialoguesInScenario.map(d => ({
        ...d,
        scenario_title: memoryStorage.scenarios.find(s => s.id === scenarioId)?.title || 'Unknown'
      })));
    });
    
    console.log(`👤 캐릭터 대화 조회: ${characterId} - ${characterDialogues.length}개 발견`);
    
    return res.json({
      success: true,
      dialogues: characterDialogues,
      character_id: characterId,
      count: characterDialogues.length
    });
    
  } catch (error) {
    console.error('❌ 캐릭터 대화 조회 실패:', error);
    return res.json({
      success: false,
      error: '캐릭터 대화 데이터를 불러올 수 없습니다: ' + error.message,
      dialogues: []
    });
  }
}

// 새로운 기능: 캐릭터별 최적화 대화 생성
function generateCharacterOptimizedDialogue(req, res) {
  try {
    const { scenario_id, character_id, choice_number = 1 } = req.body;
    
    if (!scenario_id || !character_id) {
      return res.json({
        success: false,
        error: '시나리오 ID와 캐릭터 ID가 필요합니다.'
      });
    }

    // 캐릭터 정보 찾기
    const character = memoryStorage.characters.find(c => c.id === character_id);
    if (!character) {
      return res.json({
        success: false,
        error: '해당 캐릭터를 찾을 수 없습니다.'
      });
    }

    // 시나리오 정보 찾기
    const scenario = memoryStorage.scenarios.find(s => s.id === scenario_id);
    if (!scenario) {
      return res.json({
        success: false,
        error: '해당 시나리오를 찾을 수 없습니다.'
      });
    }

    // 캐릭터별 최적화 대화 생성
    const generatedDialogue = generateCharacterSpecificDialogue(character, scenario, choice_number);
    
    // 대화 ID 생성
    const dialogueId = `${scenario_id}_${choice_number}_${character_id}_${Date.now()}`;
    
    const dialogueEntry = {
      id: dialogueId,
      scenario_id: scenario_id,
      character_id: character_id,
      choice_number: choice_number,
      generated_content: generatedDialogue,
      created_at: new Date().toISOString(),
      source: `${character.mbti} Character Optimized Generator v2.2.0`
    };
    
    // 메모리에 저장
    if (!memoryStorage.dialogues[scenario_id]) {
      memoryStorage.dialogues[scenario_id] = [];
    }
    
    memoryStorage.dialogues[scenario_id].push(dialogueEntry);
    
    console.log(`✅ ${character.name}(${character.mbti}) 최적화 대화 생성: ${dialogueId}`);
    
    return res.json({
      success: true,
      message: `${character.name}(${character.mbti})의 캐릭터 특성에 맞는 대화가 생성되었습니다.`,
      dialogue: dialogueEntry,
      generated: generatedDialogue,
      character: {
        name: character.name,
        mbti: character.mbti,
        traits: character.personality_traits.primary
      }
    });
    
  } catch (error) {
    console.error('❌ 캐릭터 최적화 대화 생성 실패:', error);
    return res.json({
      success: false,
      error: '캐릭터 최적화 대화 생성 중 오류가 발생했습니다: ' + error.message
    });
  }
}

// 새로운 기능: 대화 편집
function editDialogue(req, res) {
  try {
    const { dialogue_id, field, new_value } = req.body;
    
    if (!dialogue_id || !field || new_value === undefined) {
      return res.json({
        success: false,
        error: '대화 ID, 필드명, 새 값이 모두 필요합니다.'
      });
    }

    // 대화 찾기
    let foundDialogue = null;
    let foundScenario = null;

    Object.entries(memoryStorage.dialogues).forEach(([scenarioId, dialogues]) => {
      const dialogue = dialogues.find(d => d.id === dialogue_id);
      if (dialogue) {
        foundDialogue = dialogue;
        foundScenario = scenarioId;
      }
    });

    if (!foundDialogue) {
      return res.json({
        success: false,
        error: '해당 대화를 찾을 수 없습니다.'
      });
    }

    // 필드별 편집 처리
    if (field === 'dialogue') {
      foundDialogue.generated_content.dialogue = new_value;
    } else if (field === 'narration') {
      foundDialogue.generated_content.narration = new_value;
    } else if (field.startsWith('choice_') && field.includes('_')) {
      const parts = field.split('_');
      const choiceIndex = parseInt(parts[1]);
      
      if (field.endsWith('_impact')) {
        foundDialogue.generated_content.choices[choiceIndex].affection_impact = parseInt(new_value);
      } else {
        foundDialogue.generated_content.choices[choiceIndex].text = new_value;
      }
    } else {
      return res.json({
        success: false,
        error: '지원하지 않는 필드입니다.'
      });
    }

    foundDialogue.updated_at = new Date().toISOString();
    
    console.log(`✅ 대화 편집 완료: ${dialogue_id} - ${field}`);
    
    return res.json({
      success: true,
      message: '대화가 성공적으로 편집되었습니다.',
      dialogue: foundDialogue
    });
    
  } catch (error) {
    console.error('❌ 대화 편집 실패:', error);
    return res.json({
      success: false,
      error: '대화 편집 중 오류가 발생했습니다: ' + error.message
    });
  }
}

// === 캐릭터별 최적화 대화 생성 로직 ===

function generateCharacterSpecificDialogue(character, scenario, choiceNumber) {
  const mbti = character.mbti;
  const traits = character.personality_traits;
  
  // MBTI별 대화 템플릿
  const mbtiTemplates = {
    'INFP': {
      dialogueStyle: '부드럽고 감성적인',
      emoticons: ['😊', '🥺', '😔', '💕', '🌸', '✨'],
      expressions: ['오빠...', '정말', '사실은', '음...', '어떻게 하지'],
      narrationStyle: '내성적이고 감정적인 반응'
    },
    'ENFP': {
      dialogueStyle: '활발하고 열정적인',
      emoticons: ['😄', '🤗', '💪', '🎉', '✊', '🌟'],
      expressions: ['와!', '정말요?', '대박!', '어떡해', '완전'],
      narrationStyle: '외향적이고 에너지 넘치는 반응'
    }
  };

  const template = mbtiTemplates[mbti] || mbtiTemplates['INFP'];
  
  // 캐릭터별 맞춤 대화 생성
  const dialogueTemplates = {
    'INFP': [
      {
        dialogue: `${character.name === '윤아' ? '오빠...' : ''} ${scenario.mood.includes('부끄러움') ? '정말 부끄럽네요' : '이런 상황은 처음이에요'} ${template.emoticons[0]}`,
        narration: `${character.name}가 ${template.narrationStyle}를 보이며 ${scenario.setting}에서 ${traits.primary[0]}인 모습을 드러낸다.`,
        choices: [
          {"text": "천천히 마음을 열어보자", "affection_impact": 2},
          {"text": "어떤 기분인지 궁금해", "affection_impact": 1}, 
          {"text": "편안하게 얘기해도 돼", "affection_impact": 3}
        ]
      },
      {
        dialogue: `사실... ${scenario.title.includes('테스트') ? '이런 시스템이 신기해요' : '말하고 싶었던 게 있어요'} ${template.emoticons[1]}`,
        narration: `${character.name}가 진솔한 마음을 털어놓으려 하며, ${traits.secondary[0]}인 면모를 보인다.`,
        choices: [
          {"text": "자세히 들어볼게", "affection_impact": 2},
          {"text": "마음 편하게 말해줘", "affection_impact": 3},
          {"text": "그런 마음이었구나", "affection_impact": 1}
        ]
      }
    ],
    'ENFP': [
      {
        dialogue: `${template.expressions[0]} 이런 ${scenario.title}는 처음인데... ${template.expressions[1]} ${template.emoticons[0]}`,
        narration: `${character.name}가 ${template.narrationStyle}을 보이며 적극적으로 상황에 반응한다.`,
        choices: [
          {"text": "같이 해보자!", "affection_impact": 3},
          {"text": "어떤 느낌이야?", "affection_impact": 1},
          {"text": "재미있을 것 같네", "affection_impact": 2}
        ]
      },
      {
        dialogue: `${template.expressions[2]} 정말 ${scenario.mood}한 분위기네요! ${template.emoticons[1]}`,
        narration: `${character.name}가 밝고 긍정적인 에너지로 분위기를 이끌어가려 한다.`,
        choices: [
          {"text": "네가 있어서 더 좋아", "affection_impact": 4},
          {"text": "분위기 메이커구나", "affection_impact": 2},
          {"text": "항상 밝은 모습이 좋아", "affection_impact": 1}
        ]
      }
    ]
  };

  const templates = dialogueTemplates[mbti] || dialogueTemplates['INFP'];
  const selectedTemplate = templates[choiceNumber % templates.length];
  
  return selectedTemplate;
}

// Fallback 응답 시스템 (호환성 유지)
function getFallbackResponse(req, res) {
  console.log('Using fallback response system v2.2.0');
  
  const naturalDialogueResponses = [
    {
      dialogue: "오빠... 어제는 정말 미안해 😳 취해서 그런 말까지 했는데...",
      narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다.",
      choices: [
        {"text": "괜찮다고 다정하게 말해준다", "affection_impact": 2},
        {"text": "어떤 말을 했는지 궁금하다고 한다", "affection_impact": 0},
        {"text": "진심이었는지 조심스럽게 물어본다", "affection_impact": 1}
      ]
    }
  ];
  
  const response = naturalDialogueResponses[0];
  
  return res.json({
    success: true,
    generated: response,
    source: 'Fallback Response System v2.2.0'
  });
}

// 멀티 캐릭터 지원 확장 - v2.3.0
// 캐릭터별 전용 대화 생성 함수들

async function generateDialogueForCharacter(characterId, requestData) {
  const characterTemplates = {
    'yuna_infp': generateYunaDialogue,
    'mina_enfp': generateMinaDialogue,
    'seoyeon_intj': generateSeoyeonDialogue,
    'jihye_esfj': generateJihyeDialogue,
    'hyejin_istp': generateHyejinDialogue
  };

  const generateFunction = characterTemplates[characterId] || generateYunaDialogue;
  return await generateFunction(requestData);
}

// 윤아 (INFP) 전용 대화 생성
async function generateYunaDialogue(requestData) {
  // 기존 템플릿 시스템 사용
  return {
    dialogue: "오빠... 어제 밤 얘기, 기억나? 😳 나 정말 진심이었어...",
    narration: "윤아가 수줍게 고개를 숙이며 손가락을 만지작거린다. INFP답게 감정이 얼굴에 그대로 드러난다.",
    choices: [
      {"text": "나도 너에게 마음이 있어", "affection_impact": 3},
      {"text": "천천히 생각해보자", "affection_impact": 1},
      {"text": "고마워, 진심이 전해졌어", "affection_impact": 2}
    ]
  };
}

// 미나 (ENFP) 전용 대화 생성  
async function generateMinaDialogue(requestData) {
  // ENFP 성격 특성 반영한 응답
  return {
    dialogue: "오빠! 어제 정말 재밌었어! 😊 나 그런 얘기 할 때 되게 진심이었거든? 어색해 하지 말고 편하게 지내자!",
    narration: "미나가 밝게 웃으며 적극적으로 대화를 이어나간다. ENFP답게 긍정적이고 외향적인 모습을 보인다.",
    choices: [
      {"text": "그래! 우리 편하게 지내자", "affection_impact": 2},
      {"text": "미나는 정말 긍정적이네", "affection_impact": 1}, 
      {"text": "진심이었다니... 나도 생각해볼게", "affection_impact": 0}
    ]
  };
}

// 서연 (INTJ) 전용 대화 생성
async function generateSeoyeonDialogue(requestData) {
  return {
    dialogue: "어제 그 이야기... 충동적인 감정이 아니라면 신중하게 생각해보는 것이 좋을 것 같습니다.",
    narration: "서연이 냉정하지만 배려심 있는 톤으로 조언한다. INTJ답게 논리적이면서도 상대방을 생각하는 모습이다.",
    choices: [
      {"text": "조언 고마워. 차근차근 생각해볼게", "affection_impact": 1},
      {"text": "서연이가 보기엔 어떻게 생각해?", "affection_impact": 2},
      {"text": "너무 복잡하게 생각할 필요 있나?", "affection_impact": -1}
    ]
  };
}

// 지혜 (ESFJ) 전용 대화 생성
async function generateJihyeDialogue(requestData) {
  return {
    dialogue: "걱정했어! 어제 많이 마셨던데 괜찮아? 그런 중요한 얘기는... 술 없이도 할 수 있을 텐데 💕",
    narration: "지혜가 걱정스러운 표정으로 상대방을 챙긴다. ESFJ답게 타인을 배려하고 따뜻하게 대한다.",
    choices: [
      {"text": "걱정해줘서 고마워. 정말 괜찮아", "affection_impact": 2},
      {"text": "다음엔 술 없이 얘기해보자", "affection_impact": 1},
      {"text": "지혜는 항상 날 챙겨주는구나", "affection_impact": 1}
    ]
  };
}

// 혜진 (ISTP) 전용 대화 생성  
async function generateHyejinDialogue(requestData) {
  return {
    dialogue: "음... 어제 얘기. 솔직히 예상했어. 그런 분위기였으니까.",
    narration: "혜진이 담담한 표정으로 현실적인 관점을 제시한다. ISTP답게 감정을 드러내지 않지만 상황을 정확히 파악하고 있다.",
    choices: [
      {"text": "역시 눈치가 빠르네", "affection_impact": 1},
      {"text": "그럼 어떻게 하는 게 좋을까?", "affection_impact": 2},
      {"text": "너는 어떻게 생각해?", "affection_impact": 0}
    ]
  };
}
