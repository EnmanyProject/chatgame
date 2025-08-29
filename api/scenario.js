// 안전한 시나리오 API - Vercel 호환 버전
export default function handler(req, res) {
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
      message: 'Scenario API is working!',
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

  // Claude 3.5 Sonnet 스타일 대화 생성
  if (action === 'generate') {
    const responses = [
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
    const response = responses[messageCount % responses.length];
    
    return res.json({
      success: true,
      generated: response,
      source: 'Claude 3.5 Sonnet Style'
    });
  }

  return res.json({ success: false, message: 'Unknown action' });
}