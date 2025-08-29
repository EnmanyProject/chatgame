// 시나리오 관리 API - 안전한 간소화 버전
export default function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const action = req.query.action || req.body?.action;
    
    // 기본 테스트 응답
    if (action === 'test' || !action) {
      return res.status(200).json({ 
        success: true, 
        message: 'Scenario API is working perfectly!',
        timestamp: new Date().toISOString(),
        method: req.method
      });
    }

    // 시나리오 목록 요청
    if (action === 'list' && req.query.type === 'scenarios') {
      return res.status(200).json({
        success: true,
        scenarios: [
          {
            id: "hangover_confession",
            title: "어제 밤의 기억",
            description: "시우 오빠를 1년째 좋아하는 후배가 어제 술먹고 고백한 후 부끄러워하는 상황",
            setting: "다음날 아침, 메신저로 연락",
            mood: "부끄러움, 설렘, 긴장감",
            active: true
          }
        ]
      });
    }

    // 캐릭터 목록 요청
    if (action === 'list' && req.query.type === 'characters') {
      return res.status(200).json({
        success: true,
        characters: [
          {
            id: "yuna_infp",
            name: "윤아",
            age: 20,
            mbti: "INFP",
            personality_traits: {
              primary: ["감성적", "이상주의적", "창의적", "내향적"],
              speech_style: ["부드럽고 따뜻한 말투", "감정적 표현 많음", "이모티콘 자주 사용"]
            },
            relationship: "시우 오빠를 1년 넘게 좋아하는 후배",
            active: true
          }
        ]
      });
    }

    // Claude 3.5 Sonnet 생성 요청
    if (action === 'generate') {
      const { character_id, scenario_id, situation, message_count = 0 } = req.body;
      
      try {
        // Claude API 호출
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            temperature: 0.8,
            messages: [
              {
                role: 'user',
                content: `당신은 MBTI 기반 로맨스 게임의 윤아(INFP, 20세) 캐릭터입니다.

성격: 감성적, 창의적, 내향적, 이상주의적
관계: 시우 오빠를 1년째 좋아하는 후배 
말투: 부드럽고 따뜻함, 이모티콘 자주 사용

현재 상황: ${situation || '어제 술먹고 고백한 후 부끄러워하는 상황'}
대화 진행도: ${message_count}번째 대화

다음 JSON 형식으로 응답해주세요:
{
  "dialogue": "윤아의 자연스럽고 감정적인 대사",
  "narration": "상황 설명 (선택사항)",
  "choices": [
    {"text": "선택지 1", "affection_impact": 1-2},
    {"text": "선택지 2", "affection_impact": 0-1}, 
    {"text": "선택지 3", "affection_impact": -1-0}
  ]
}`
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.content[0].text;
          
          try {
            const generated = JSON.parse(content);
            return res.status(200).json({
              success: true,
              generated: {
                dialogue: generated.dialogue,
                narration: generated.narration || null,
                choices: generated.choices || [
                  {"text": "괜찮다고 말한다", "affection_impact": 1},
                  {"text": "더 자세히 물어본다", "affection_impact": 0}
                ]
              }
            });
          } catch (parseError) {
            console.error('Claude 응답 파싱 실패:', parseError);
          }
        }
      } catch (error) {
        console.error('Claude API 오류:', error);
      }
      
      // Fallback 응답
      return res.status(200).json({
        success: true,
        generated: {
          dialogue: "오빠... 어제는 정말 미안해 😳 취해서 이상한 말 많이 했지?",
          narration: "윤아가 부끄러워하며 메시지를 보낸다.",
          choices: [
            {"text": "괜찮다고 안심시켜준다", "affection_impact": 2},
            {"text": "어떤 말을 했는지 물어본다", "affection_impact": 0},
            {"text": "진심이었는지 확인한다", "affection_impact": 1}
          ]
        }
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Unknown action',
      action: action
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}