// 채팅 API - 윤아와의 대화 처리
const DATABASE_DATA = {
  "character": {
    "name": "윤아",
    "age": 20,
    "personality": ["밝음", "적극적", "순수함", "감정 표현 풍부"],
    "relationship": "창용 오빠를 1년 넘게 좋아하는 후배",
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
          "text": "창용 오빠... 어제 제가 너무 이상했죠? ㅠㅠ",
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
          "text": "ㅋㅋㅋ 창용 오빠도 정말 멋있어요! 💕",
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
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
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

  try {
    const { message, affection = 75, intimacy = 0 } = req.body || {};

    // 입력 검증
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Message is required and must be a non-empty string'
      });
    }

    // 응답 생성
    const response = findResponse(message.trim(), parseInt(affection));
    const emotionData = DATABASE_DATA.emotions[response.emotion] || DATABASE_DATA.emotions.neutral;

    // 성공 응답
    return res.status(200).json({
      success: true,
      response: response.text,
      emotion: response.emotion,
      emotion_display: emotionData.display,
      emotion_color: emotionData.color,
      affection_change: response.affection_change,
      category: response.category,
      matched_keywords: response.matched_keywords,
      character: {
        name: DATABASE_DATA.character.name,
        current_affection: Math.max(0, Math.min(100, parseInt(affection) + response.affection_change))
      },
      metadata: {
        timestamp: new Date().toISOString(),
        input_length: message.trim().length,
        processing_time: Date.now() - Date.now() // 실제로는 처리 시작 시간을 기록해야 함
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
}