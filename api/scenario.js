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