// 실제 Claude API 통합 버전 - v2.0.0
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;
  
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
    return res.json({
      success: true,
      scenarios: [{
        id: "hangover_confession",
        title: "어제 밤의 기억",
        description: "어제 술먹고 고백한 후 부끄러워하는 상황",
        active: true
      }]
    });
  }

  // 캐릭터 목록
  if (action === 'list' && req.query.type === 'characters') {
    return res.json({
      success: true,
      characters: [{
        id: "yuna_infp",
        name: "윤아",
        mbti: "INFP",
        active: true
      }]
    });
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

  return res.json({ success: false, message: 'Unknown action' });
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

// Fallback 응답 시스템 (기존 하드코딩된 고품질 응답)
function getFallbackResponse(req, res) {
  console.log('Using fallback responses - Claude API unavailable');
  
  const fallbackResponses = [
    {
      dialogue: "오빠... 어제는 정말 미안해 😳 취해서 그런 말까지 했는데, 기억나지도 않아서 더 부끄러워 💦",
      narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다. 진심이었지만 용기가 나지 않는 것 같다.",
      choices: [
        {"text": "괜찮다고 다정하게 말해준다", "affection_impact": 2},
        {"text": "어떤 말을 했는지 궁금하다고 한다", "affection_impact": 0},
        {"text": "진심이었는지 조심스럽게 물어본다", "affection_impact": 1}
      ]
    },
    {
      dialogue: "사실은... 술 핑계였어 😔 평소에 말 못했던 진심이었는데, 이렇게 어색해질까봐 무서워",
      narration: "윤아의 목소리가 떨리며, 눈물이 살짝 맺힌다. 1년 동안 숨겨왔던 마음을 털어놓고 있다.",
      choices: [
        {"text": "나도 같은 마음이었다고 고백한다", "affection_impact": 3},
        {"text": "용기내줘서 고맙다고 말한다", "affection_impact": 2},
        {"text": "시간을 두고 생각해보자고 한다", "affection_impact": -1}
      ]
    },
    {
      dialogue: "오빠가 싫어할까봐 걱정했는데... 이렇게 말해주니까 마음이 좀 놓여 😌 고마워",
      narration: "윤아가 안도의 표정을 지으며 작은 미소를 짓는다. 차분해진 분위기가 따뜻하게 느껴진다.",
      choices: [
        {"text": "앞으로 더 많이 대화하자고 제안한다", "affection_impact": 2},
        {"text": "언제든 편하게 말하라고 격려한다", "affection_impact": 1},
        {"text": "커피라도 한잔 하자고 제안한다", "affection_impact": 2}
      ]
    }
  ];
  
  const messageCount = req.body?.message_count || 0;
  const response = fallbackResponses[messageCount % fallbackResponses.length];
  
  return res.json({
    success: true,
    generated: response,
    source: 'Fallback (Claude API unavailable)',
    version: 'v2.0.0'
  });
}