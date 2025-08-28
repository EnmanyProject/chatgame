// 시나리오 관리 API - 간소화된 버전
module.exports = (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 기본 테스트 응답
    if (req.query.action === 'test' || (!req.query.action && !req.body?.action)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Scenario API is working',
        timestamp: new Date().toISOString(),
        method: req.method
      });
    }

    // 파라미터 추출
    let action, type;
    if (req.method === 'POST') {
      action = req.body?.action || req.query?.action;
      type = req.body?.type || req.query?.type;
    } else {
      action = req.query?.action;
      type = req.query?.type;
    }

    console.log(`[${req.method}] /api/scenario - action: "${action}", type: "${type}"`);

    // 시나리오 목록 요청
    if (action === 'list' && type === 'scenarios') {
      return res.status(200).json({
        success: true,
        scenarios: [
          {
            id: "hangover_confession",
            title: "어제 밤의 기억",
            description: "시우 오빠를 1년째 좋아하는 후배가 어제 술먹고 고백한 후 부끄러워하는 상황",
            setting: "다음날 아침, 메신저로 연락",
            mood: "부끄러움, 설렘, 긴장감",
            created_at: "2025-08-27T00:00:00.000Z",
            active: true
          }
        ],
        metadata: { count: 1 }
      });
    }

    // 캐릭터 목록 요청
    if (action === 'list' && type === 'characters') {
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
              secondary: ["공감능력 뛰어남", "완벽주의 성향", "감정 표현 풍부"],
              speech_style: ["부드럽고 따뜻한 말투", "감정적 표현 많음", "이모티콘 자주 사용"]
            },
            relationship: "시우 오빠를 1년 넘게 좋아하는 후배",
            background: "예술을 전공하는 대학생, 감수성이 풍부함",
            avatar_url: "photo/윤아.jpg",
            scenarios: ["hangover_confession"],
            created_at: "2025-08-27T00:00:00.000Z",
            active: true
          }
        ],
        metadata: { count: 1 }
      });
    }

    // GPT 시나리오 생성 요청
    if (action === 'generate') {
      const { character_id, scenario_id, situation, gpt_config } = req.body;
      
      console.log('GPT 생성 요청:', { character_id, scenario_id, situation });
      
      try {
        const fetch = require('node-fetch');
        
        const gptPrompt = `당신은 MBTI 기반 로맨스 게임의 AI입니다.
        
캐릭터: 윤아 (INFP, 20세, 예술 전공 대학생)
- 감성적이고 창의적인 성격
- 시우 오빠를 1년 넘게 좋아하는 후배
- 부드럽고 따뜻한 말투, 이모티콘 자주 사용

현재 상황: ${situation}
시나리오: 어제 술먹고 고백한 후 부끄러워하는 상황

다음 형식으로 응답해주세요:
{
  "dialogue": "윤아의 대사 (자연스럽고 감정이 풍부하게)",
  "narration": "상황 설명 (선택사항)",
  "choices": [
    {"text": "선택지 1", "affection_impact": 1},
    {"text": "선택지 2", "affection_impact": 0}, 
    {"text": "선택지 3", "affection_impact": -1}
  ]
}`;

        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gpt_config.api_key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: gpt_config.model || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: gptPrompt }
            ],
            temperature: 0.8,
            max_tokens: 500
          })
        });

        if (!gptResponse.ok) {
          throw new Error(`GPT API 오류: ${gptResponse.status}`);
        }

        const gptData = await gptResponse.json();
        const gptContent = gptData.choices[0].message.content;
        
        console.log('GPT 원본 응답:', gptContent);
        
        try {
          const generated = JSON.parse(gptContent);
          
          return res.status(200).json({
            success: true,
            generated: {
              dialogue: generated.dialogue,
              narration: generated.narration || null,
              choices: generated.choices || [
                {"text": "기본 선택지 1", "affection_impact": 0},
                {"text": "기본 선택지 2", "affection_impact": 0}
              ]
            }
          });
        } catch (parseError) {
          console.error('GPT 응답 파싱 실패:', parseError);
          
          return res.status(200).json({
            success: true,
            generated: {
              dialogue: "미안해... 뭔가 말이 꼬였네 😅",
              narration: null,
              choices: [
                {"text": "괜찮다고 말한다", "affection_impact": 1},
                {"text": "다시 설명해달라고 한다", "affection_impact": 0}
              ]
            }
          });
        }
        
      } catch (gptError) {
        console.error('GPT API 호출 실패:', gptError);
        
        return res.status(200).json({
          success: true,
          generated: {
            dialogue: "어... 잠깐만, 생각이 정리가 안돼 😳",
            narration: "윤아가 잠시 머뭇거린다.",
            choices: [
              {"text": "기다려준다", "affection_impact": 1},
              {"text": "다른 이야기를 꺼낸다", "affection_impact": 0}
            ]
          }
        });
      }
    }

    // 기본 응답
    return res.status(200).json({ 
      success: true, 
      message: 'API endpoint received',
      action,
      type,
      method: req.method
    });

  } catch (error) {
    console.error('Scenario API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};