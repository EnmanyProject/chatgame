// 통합 시나리오 API v3.0.0 - 게임과 어드민 연동
import { getActiveApiKey } from './admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query || {};

  try {
    switch (action) {
      case 'test':
        return handleTest(req, res);
      case 'list':
        return handleList(req, res);
      case 'generate':
        return handleGenerate(req, res);
      default:
        if (req.method === 'POST') {
          return handleGenerate(req, res);
        }
        return res.status(400).json({
          success: false,
          message: '지원되지 않는 액션입니다.'
        });
    }
  } catch (error) {
    console.error('❌ 시나리오 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// API 상태 테스트
function handleTest(req, res) {
  console.log('🧪 시나리오 API 테스트');
  return res.json({
    success: true,
    message: '시나리오 API가 정상 작동 중입니다.',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
}

// 데이터 목록 조회
async function handleList(req, res) {
  const { type } = req.query;

  try {
    if (type === 'scenarios') {
      // 시나리오 목록 조회
      const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
      const scenarioResponse = await fetch(`${baseUrl}/api/scenario-manager?action=list`);
      const scenarioData = await scenarioResponse.json();

      return res.json({
        success: true,
        data: scenarioData.scenarios || {},
        count: scenarioData.scenarios ? Object.keys(scenarioData.scenarios).length : 0
      });

    } else if (type === 'characters') {
      // 캐릭터 목록 조회
      const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
      const characterResponse = await fetch(`${baseUrl}/api/character-ai-generator?action=list_characters`);
      const characterData = await characterResponse.json();

      return res.json({
        success: true,
        data: characterData.characters || {},
        count: characterData.characters ? Object.keys(characterData.characters).length : 0
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'type 파라미터가 필요합니다 (scenarios 또는 characters)'
      });
    }

  } catch (error) {
    console.error('❌ 데이터 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '데이터 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 대화 생성
async function handleGenerate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'POST 요청만 허용됩니다.'
    });
  }

  const { scenario, character, userInput, affection = 0, messageCount = 0, conversationHistory = [] } = req.body;

  if (!scenario || !character) {
    return res.status(400).json({
      success: false,
      message: '시나리오와 캐릭터 정보가 필요합니다.'
    });
  }

  try {
    console.log('💬 대화 생성 요청:', {
      scenario: scenario.title,
      character: character.name,
      userInput,
      affection,
      messageCount
    });

    // OpenAI API 키 확인
    const apiKey = getActiveApiKey() || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // API 키가 없으면 템플릿 기반 응답
      const templateResponse = generateTemplateResponse(scenario, character, userInput, affection);
      return res.json({
        success: true,
        generated: templateResponse,
        source: 'template'
      });
    }

    // OpenAI API 호출
    const aiResponse = await generateAIResponse(apiKey, scenario, character, userInput, affection, conversationHistory);

    return res.json({
      success: true,
      generated: aiResponse,
      source: 'openai'
    });

  } catch (error) {
    console.error('❌ 대화 생성 오류:', error);

    // 오류 시 템플릿 기반 응답으로 fallback
    try {
      const fallbackResponse = generateTemplateResponse(scenario, character, userInput, affection);
      return res.json({
        success: true,
        generated: fallbackResponse,
        source: 'fallback',
        note: 'AI 생성 실패로 템플릿 응답을 사용합니다.'
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        message: '대화 생성에 실패했습니다.',
        error: error.message
      });
    }
  }
}

// OpenAI API를 통한 대화 생성
async function generateAIResponse(apiKey, scenario, character, userInput, affection, conversationHistory) {
  const systemPrompt = `당신은 ${character.name} (${character.mbti}) 캐릭터입니다.

캐릭터 정보:
- 이름: ${character.name}
- MBTI: ${character.mbti}
- 성격: ${Array.isArray(character.personality_traits) ? character.personality_traits.join(', ') : character.personality_traits || ''}
- 말투: ${character.speech_style || '자연스럽고 친근한 말투'}

시나리오: ${scenario.title}
상황: ${scenario.description || scenario.context}

현재 호감도: ${affection}/100
대화 진행도: ${conversationHistory.length}회차

다음 규칙을 따라 응답해주세요:
1. 캐릭터의 성격과 MBTI에 맞는 자연스러운 반응
2. 호감도에 따른 적절한 친밀도 수준 (0-30: 어색함, 31-60: 친근함, 61-100: 친밀함)
3. JSON 형식으로 응답: {"dialogue": "대사", "narration": "상황설명", "choices": [{"text": "선택지1", "affection_impact": 1}, {"text": "선택지2", "affection_impact": 0}, {"text": "선택지3", "affection_impact": -1}]}
4. 선택지는 3개, 호감도 영향 -2~+3 범위
5. 한국어로만 응답`;

  const userMessage = userInput || "대화를 시작합니다.";

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 800,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (parseError) {
    // JSON 파싱 실패 시 텍스트를 적절히 변환
    return {
      dialogue: content,
      narration: "상황이 계속 진행됩니다.",
      choices: [
        { text: "긍정적으로 반응한다", affection_impact: 1 },
        { text: "중립적으로 반응한다", affection_impact: 0 },
        { text: "조심스럽게 반응한다", affection_impact: -1 }
      ]
    };
  }
}

// 템플릿 기반 응답 생성
function generateTemplateResponse(scenario, character, userInput, affection) {
  const templates = {
    start: [
      {
        dialogue: `안녕! 나는 ${character.name}이야. 오늘 ${scenario.title}에서 만나게 되었네.`,
        narration: `${character.name}가 밝은 미소를 지으며 인사를 건넨다.`,
        choices: [
          { text: "안녕하세요! 만나서 반가워요.", affection_impact: 2 },
          { text: "네, 안녕하세요.", affection_impact: 0 },
          { text: "...(조용히 인사한다)", affection_impact: -1 }
        ]
      },
      {
        dialogue: `이런 곳에서 만나다니, 정말 우연이네요! ${character.name}라고 해요.`,
        narration: `${character.name}가 친근하게 자기소개를 한다.`,
        choices: [
          { text: "저도 만나서 정말 기뻐요!", affection_impact: 2 },
          { text: "네, 반갑습니다.", affection_impact: 1 },
          { text: "아, 네...", affection_impact: 0 }
        ]
      }
    ],
    continuing: [
      {
        dialogue: "그래서 어떻게 생각해요? 제 이야기 말이에요.",
        narration: `${character.name}가 호기심 어린 눈빛으로 바라본다.`,
        choices: [
          { text: "정말 흥미로운 이야기네요!", affection_impact: 2 },
          { text: "그럭저럭 괜찮은 것 같아요.", affection_impact: 0 },
          { text: "음... 잘 모르겠어요.", affection_impact: -1 }
        ]
      },
      {
        dialogue: `${affection > 50 ? "우리 정말 잘 통하는 것 같아요!" : "조금 더 이야기해볼까요?"}`,
        narration: `${character.name}가 ${affection > 50 ? "환하게 웃으며" : "조심스럽게"} 말을 건넨다.`,
        choices: [
          { text: "저도 그렇게 생각해요!", affection_impact: 2 },
          { text: "네, 좋아요.", affection_impact: 1 },
          { text: "시간이 있으면...", affection_impact: 0 }
        ]
      }
    ]
  };

  const isFirstMessage = !userInput || userInput === "게임이 시작되었습니다.";
  const templateGroup = isFirstMessage ? templates.start : templates.continuing;
  const template = templateGroup[Math.floor(Math.random() * templateGroup.length)];

  return template;
}