// 채팅 API - 윤아와의 대화 처리
const DATABASE_DATA = {
  "character": {
    "name": "윤아",
    "age": 20,
    "personality": ["밝음", "적극적", "순수함", "감정 표현 풍부"],
    "relationship": "시우 오빠를 1년 넘게 좋아하는 후배",
    "speech_style": ["반말", "친근하고 애교스럽게", "이모티콘 자주 사용"]
  },
  "dialogue_patterns": {
    "greetings": {
      "keywords": ["안녕", "하이", "헬로", "좋은", "아침", "저녁", "만나"],
      "responses": [
        {
          "text": "오빠... 안녕하세요 😳 어제 일 때문에 정말 민망해요...",
          "emotion": "shy",
          "affection_change": 1
        },
        {
          "text": "시우 오빠... 어제 제가 너무 이상했죠? ㅠㅠ",
          "emotion": "shy", 
          "affection_change": 0
        },
        {
          "text": "오빠 안녕하세요... 어제 기억나세요? 😰",
          "emotion": "shy",
          "affection_change": -1
        }
      ]
    },
    "yesterday_alcohol": {
      "keywords": ["어제", "술", "마셨", "기억", "취했", "이상한", "부끄러", "민망"],
      "responses": [
        {
          "text": "어제... 정말 죄송해요 ㅠㅠ 술 마시고 오빠한테 이상한 말 많이 했죠?",
          "emotion": "shy",
          "affection_change": -1
        },
        {
          "text": "아... 기억나시는구나... 정말 부끄러워요 😳 제가 뭐라고 했더라...",
          "emotion": "shy",
          "affection_change": 0
        },
        {
          "text": "술 때문에... 평소에 못했던 말들을... ㅜㅜ 오빠가 어떻게 생각하실까봐 무서워요",
          "emotion": "sad",
          "affection_change": -2
        }
      ]
    },
    "comfort": {
      "keywords": ["괜찮", "문제없", "걱정", "신경쓰지", "이해", "괜찮아"],
      "responses": [
        {
          "text": "정말요? 오빠가 그렇게 말해주시니까... 조금 마음이 놓여요 😊",
          "emotion": "happy",
          "affection_change": 3
        },
        {
          "text": "오빠 너무 좋으세요... 제가 그런 실수를 해도 이해해주시다니 💕",
          "emotion": "love",
          "affection_change": 4
        },
        {
          "text": "휴... 다행이에요 ㅠㅠ 오빠가 화내실까봐 정말 걱정했어요",
          "emotion": "happy",
          "affection_change": 2
        }
      ]
    },
    "confession_memory": {
      "keywords": ["좋아한다", "고백", "사랑", "마음", "감정", "좋아해"],
      "responses": [
        {
          "text": "그... 그때 말한 거... 진심이었어요 😳 술 핑계 대고 싶지 않아요...",
          "emotion": "shy_happy",
          "affection_change": 5
        },
        {
          "text": "어제 한 말들... 다 진짜 제 마음이에요 💕 술이 용기를 준 것뿐이에요",
          "emotion": "love",
          "affection_change": 4
        },
        {
          "text": "오빠한테 제 마음을 말할 수 있어서... 술 마신 게 오히려 다행인 것 같아요 😊",
          "emotion": "shy_happy",
          "affection_change": 3
        }
      ]
    },
    "compliments": {
      "keywords": ["예쁘", "좋아", "사랑", "최고", "멋있", "잘생", "귀여"],
      "responses": [
        {
          "text": "오빠가 그렇게 말해주시니까 너무 기뻐요! ㅜㅜ 정말이에요?",
          "emotion": "shy_happy",
          "affection_change": 3
        },
        {
          "text": "ㅋㅋㅋ 시우 오빠도 정말 멋있어요! 💕",
          "emotion": "love",
          "affection_change": 2
        },
        {
          "text": "오빠... 그런 말 하시면 부끄러워요 😳",
          "emotion": "shy",
          "affection_change": 2
        }
      ]
    },
    "questions": {
      "keywords": ["뭐해", "뭐하", "어떻", "어디", "언제", "왜", "누구", "궁금"],
      "responses": [
        {
          "text": "지금은 오빠 생각하면서 공부하고 있었어요 ㅎㅎ",
          "emotion": "shy",
          "affection_change": 1
        },
        {
          "text": "오빠랑 얘기하는 게 제일 재밌어요! ㅋㅋ",
          "emotion": "happy",
          "affection_change": 2
        },
        {
          "text": "별거 없어요~ 오빠는 뭐 하고 계셨어요?",
          "emotion": "curious",
          "affection_change": 1
        }
      ]
    },
    "food": {
      "keywords": ["배고", "먹", "밥", "음식", "맛있", "카페", "커피"],
      "responses": [
        {
          "text": "저도 배고파요! 오빠랑 같이 맛있는 거 먹고 싶어요 ㅜㅜ",
          "emotion": "excited",
          "affection_change": 2
        },
        {
          "text": "어제처럼 또 카페 가고 싶어요! 오빠랑 있으면 더 맛있어요 💕",
          "emotion": "love",
          "affection_change": 2
        }
      ]
    }
  },
  "default_responses": {
    "high_affection": [
      {
        "text": "오빠~ 저랑 더 많은 얘기해요! 너무 좋아요 💕",
        "emotion": "love",
        "affection_change": 1
      }
    ],
    "medium_affection": [
      {
        "text": "ㅎㅎ 그렇게 생각해주시는군요~",
        "emotion": "neutral",
        "affection_change": 0
      }
    ],
    "low_affection": [
      {
        "text": "ㅜㅜ 그렇게 생각하시는군요...",
        "emotion": "sad",
        "affection_change": 0
      }
    ]
  },
  "emotions": {
    "happy": {"display": "😊", "color": "#FFD700"},
    "love": {"display": "💕", "color": "#FF69B4"},
    "shy": {"display": "😳", "color": "#FFA07A"},
    "playful": {"display": "😄", "color": "#87CEEB"},
    "excited": {"display": "🤗", "color": "#FF6347"},
    "curious": {"display": "🤔", "color": "#DDA0DD"},
    "shy_happy": {"display": "😊😳", "color": "#FFB6C1"},
    "sad": {"display": "😢", "color": "#4682B4"},
    "neutral": {"display": "😐", "color": "#808080"}
  }
};

// 키워드 매칭으로 응답 찾기
function findResponse(userInput, affectionLevel) {
  const input = userInput.toLowerCase();
  
  // 키워드별 패턴 검색
  for (const [categoryKey, category] of Object.entries(DATABASE_DATA.dialogue_patterns)) {
    if (category.keywords.some(keyword => input.includes(keyword))) {
      const responses = category.responses;
      // 호감도에 따라 더 적절한 응답 선택 및 응답 단축
      let filteredResponses = responses;
      if (affectionLevel >= 80) {
        filteredResponses = responses.filter(r => r.affection_change >= 2) || responses;
      } else if (affectionLevel <= 30) {
        filteredResponses = responses.filter(r => r.affection_change <= 1) || responses;
      }
      const randomResponse = filteredResponses[Math.floor(Math.random() * filteredResponses.length)];
      
      // 응답 텍스트를 더 짧고 자연스럽게 수정
      if (randomResponse.text.length > 30) {
        const sentences = randomResponse.text.split(/[.!?]/);
        randomResponse.text = sentences[0] + (sentences[0].includes('😊') ? '' : ' 😊');
      }
      
      return {
        ...randomResponse,
        category: categoryKey,
        matched_keywords: category.keywords.filter(keyword => input.includes(keyword))
      };
    }
  }
  
  // 기본 응답 (호감도별)
  let defaultCategory;
  if (affectionLevel >= 80) {
    defaultCategory = DATABASE_DATA.default_responses.high_affection;
  } else if (affectionLevel >= 50) {
    defaultCategory = DATABASE_DATA.default_responses.medium_affection;
  } else {
    defaultCategory = DATABASE_DATA.default_responses.low_affection;
  }
  
  if (defaultCategory && defaultCategory.length > 0) {
    const randomResponse = defaultCategory[Math.floor(Math.random() * defaultCategory.length)];
    return {
      ...randomResponse,
      category: 'default',
      matched_keywords: []
    };
  }
  
  // 최후의 기본 응답
  return {
    text: "음... 그렇군요 ㅎㅎ",
    emotion: "neutral",
    affection_change: 0,
    category: 'fallback',
    matched_keywords: []
  };
}

// GPT API 설정 (admin에서 설정 가능)
let GPT_CONFIG = {
  api_key: process.env.OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo',
  max_tokens: 150,
  temperature: 0.8,
  enabled: false
};

// GPT 분석 엔진 - 사용자 입력 분석 및 적절한 응답 선택
async function analyzeUserInputWithGPT(message, affection, intimacy, currentContext) {
  if (!GPT_CONFIG.enabled || !GPT_CONFIG.api_key) {
    throw new Error('GPT API not configured or disabled');
  }

  const systemPrompt = `당신은 어드벤처 게임의 분석 엔진입니다. 사용자 입력을 분석하여 적절한 윤아의 반응을 결정해주세요.

윤아 캐릭터 설정:
- 20세 대학생, 시우 오빠를 1년 넘게 좋아하는 후배
- 성격: 밝고 적극적, 순수함, 감정 표현 풍부
- 현재 상황: 해장국을 끓여주러 온 상황
- 현재 호감도: ${affection}/100

사용자 입력을 분석하고 다음 JSON 형식으로 응답하세요:
{
  "response": "윤아의 짧은 반응 (50자 이내, 반말, 이모티콘 포함)",
  "emotion": "감정 (happy/shy/love/excited/curious/sad 중 하나)",
  "affection_change": "호감도 변화 (-3~+5 범위의 정수)",
  "analysis": "입력 분석 결과 (간단히)"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GPT_CONFIG.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GPT_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `상황: ${currentContext || '해장국 상황'}\n사용자 입력: "${message}"` }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content.trim());
    
    // 기본값 설정 및 검증
    return {
      response: result.response || "그렇구나~ ㅎㅎ",
      emotion: result.emotion || "neutral",
      affection_change: Math.max(-3, Math.min(5, parseInt(result.affection_change) || 0)),
      analysis: result.analysis || "일반적인 응답"
    };
    
  } catch (error) {
    console.error('GPT Analysis failed:', error);
    throw error;
  }
}

module.exports = (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST method is supported'
    });
  }

  // 비동기 처리로 즉시 실행
  (async () => {
    try {
      const { message, affection = 75, intimacy = 0, use_gpt = false } = req.body || {};

      // 입력 검증
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input',
          message: 'Message is required and must be a non-empty string'
        });
      }

      let responseText, emotion, affectionChange, category, matchedKeywords;

      // GPT 분석 엔진 사용 여부 확인
      if (use_gpt && GPT_CONFIG.enabled && GPT_CONFIG.api_key) {
        try {
          const analysisResult = await analyzeUserInputWithGPT(
            message.trim(), 
            parseInt(affection), 
            parseInt(intimacy),
            req.body.context || '해장국 상황'
          );
          
          responseText = analysisResult.response;
          emotion = analysisResult.emotion;
          affectionChange = analysisResult.affection_change;
          category = 'gpt_analysis';
          matchedKeywords = [analysisResult.analysis];
        } catch (gptError) {
          console.error('GPT Analysis failed:', gptError);
          // GPT 실패 시 패턴 매칭으로 폴백
          const fallbackResponse = findResponse(message.trim(), parseInt(affection));
          responseText = "음... 그렇구나 ㅎㅎ GPT 분석이 안되네요 😅";
          emotion = fallbackResponse.emotion;
          affectionChange = fallbackResponse.affection_change;
          category = 'gpt_fallback';
          matchedKeywords = ['gpt_analysis_failed'];
          
          // 에러 정보를 응답에 포함하지만 계속 진행
          console.log('GPT 분석 실패로 패턴 매칭 사용:', gptError.message);
        }
      } else {
        // 기존 패턴 매칭 사용
        const response = findResponse(message.trim(), parseInt(affection));
        responseText = response.text;
        emotion = response.emotion;
        affectionChange = response.affection_change;
        category = response.category;
        matchedKeywords = response.matched_keywords;
      }

      const emotionData = DATABASE_DATA.emotions[emotion] || DATABASE_DATA.emotions.neutral;

      // 성공 응답
      return res.status(200).json({
        success: true,
        response: responseText,
        emotion: emotion,
        emotion_display: emotionData.display,
        emotion_color: emotionData.color,
        affection_change: affectionChange,
        category: category,
        matched_keywords: matchedKeywords,
        used_gpt: use_gpt && GPT_CONFIG.enabled && GPT_CONFIG.api_key,
        character: {
          name: DATABASE_DATA.character.name,
          current_affection: Math.max(0, Math.min(100, parseInt(affection) + affectionChange))
        },
        metadata: {
          timestamp: new Date().toISOString(),
          input_length: message.trim().length,
          mode: use_gpt && GPT_CONFIG.enabled && GPT_CONFIG.api_key ? 'gpt' : 'pattern_matching'
        }
      });

    } catch (error) {
      console.error('Chat API Error:', error);
      
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'AI 응답 생성에 실패했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })();
}

// GPT 설정 업데이트 함수 (admin API에서 호출)
module.exports.updateGPTConfig = (config) => {
  GPT_CONFIG = { ...GPT_CONFIG, ...config };
};