// Vercel 환경에서 파일 시스템 대신 인메모리 데이터베이스 사용
const DATABASE_DATA = {
  "version": "1.0.0",
  "character": {
    "name": "윤아",
    "age": 20,
    "personality": ["밝음", "적극적", "순수함", "감정 표현 풍부"],
    "relationship": "창용 오빠를 1년 넘게 좋아하는 후배",
    "speech_style": ["반말", "친근하고 애교스럽게", "이모티콘 자주 사용"]
  },
  "dialogue_categories": {
    "greetings": {
      "name": "인사",
      "description": "인사말이나 만남 관련 대화",
      "keywords": ["안녕", "하이", "헬로", "좋은", "아침", "저녁", "만나", "처음"],
      "responses": [
        {
          "id": "greeting_001",
          "text": "안녕하세요! 창용 오빠 ㅎㅎ 오늘 하루 어떠셨어요?",
          "emotion": "happy",
          "intimacy_requirement": 0,
          "affection_change": 1,
          "created_at": "2025-08-25",
          "tags": ["기본", "일상"]
        },
        {
          "id": "greeting_002", 
          "text": "오빠! 안녕하세요~ 보고 싶었어요 💕",
          "emotion": "love",
          "intimacy_requirement": 20,
          "affection_change": 2,
          "created_at": "2025-08-25",
          "tags": ["애정표현", "그리움"]
        },
        {
          "id": "greeting_003",
          "text": "헤이~ 창용 오빠! 오늘도 멋있으시네요 ㅋㅋ",
          "emotion": "playful",
          "intimacy_requirement": 10,
          "affection_change": 1,
          "created_at": "2025-08-25",
          "tags": ["칭찬", "장난스러움"]
        }
      ]
    },
    "compliments": {
      "name": "칭찬/호감표현",
      "description": "사용자의 칭찬이나 호감표현에 대한 응답",
      "keywords": ["예쁘", "좋아", "사랑", "최고", "멋있", "잘생", "귀여"],
      "responses": [
        {
          "id": "compliment_001",
          "text": "오빠가 그렇게 말해주시니까 너무 기뻐요! ㅜㅜ 정말이에요?",
          "emotion": "shy_happy",
          "intimacy_requirement": 0,
          "affection_change": 3,
          "created_at": "2025-08-25",
          "tags": ["기쁨", "확인요청"]
        },
        {
          "id": "compliment_002",
          "text": "ㅋㅋㅋ 창용 오빠도 정말 멋있어요! 💕",
          "emotion": "love",
          "intimacy_requirement": 15,
          "affection_change": 2,
          "created_at": "2025-08-25",
          "tags": ["맞칭찬", "애정표현"]
        }
      ]
    },
    "questions": {
      "name": "질문/궁금증",
      "description": "사용자의 질문이나 일상 궁금증에 대한 응답",
      "keywords": ["뭐해", "뭐하", "어떻", "어디", "언제", "왜", "누구", "궁금"],
      "responses": [
        {
          "id": "question_001",
          "text": "지금은 오빠 생각하면서 공부하고 있었어요 ㅎㅎ",
          "emotion": "shy",
          "intimacy_requirement": 10,
          "affection_change": 1,
          "created_at": "2025-08-25",
          "tags": ["공부", "생각"]
        },
        {
          "id": "question_002",
          "text": "오빠랑 얘기하는 게 제일 재밌어요! ㅋㅋ",
          "emotion": "happy",
          "intimacy_requirement": 5,
          "affection_change": 2,
          "created_at": "2025-08-25",
          "tags": ["대화", "즐거움"]
        }
      ]
    },
    "default_high_affection": {
      "name": "기본응답(고호감도)",
      "description": "호감도 80 이상일 때 기본 응답",
      "keywords": [],
      "responses": [
        {
          "id": "default_high_001",
          "text": "오빠~ 저랑 더 많은 얘기해요! 너무 좋아요 💕",
          "emotion": "love",
          "intimacy_requirement": 0,
          "affection_change": 1,
          "created_at": "2025-08-25",
          "tags": ["기본", "애정표현"]
        }
      ]
    },
    "default_medium_affection": {
      "name": "기본응답(중호감도)",
      "description": "호감도 50-79일 때 기본 응답",
      "keywords": [],
      "responses": [
        {
          "id": "default_mid_001",
          "text": "ㅎㅎ 그렇게 생각해주시는군요~",
          "emotion": "neutral",
          "intimacy_requirement": 0,
          "affection_change": 0,
          "created_at": "2025-08-25",
          "tags": ["기본", "중성적"]
        }
      ]
    },
    "default_low_affection": {
      "name": "기본응답(저호감도)",
      "description": "호감도 50 미만일 때 기본 응답",
      "keywords": [],
      "responses": [
        {
          "id": "default_low_001",
          "text": "ㅜㅜ 그렇게 생각하시는군요...",
          "emotion": "sad",
          "intimacy_requirement": 0,
          "affection_change": 0,
          "created_at": "2025-08-25",
          "tags": ["기본", "슬픔"]
        }
      ]
    }
  },
  "emotions": {
    "happy": {"display": "😊", "color": "#FFD700"},
    "love": {"display": "💕", "color": "#FF69B4"},
    "shy": {"display": "😳", "color": "#FFA07A"},
    "playful": {"display": "😄", "color": "#87CEEB"},
    "caring": {"display": "🥰", "color": "#DDA0DD"},
    "sad": {"display": "😢", "color": "#4682B4"},
    "neutral": {"display": "😐", "color": "#808080"}
  },
  "statistics": {
    "total_responses": 8,
    "categories": 6,
    "last_updated": "2025-08-25T00:00:00Z"
  }
};

// 데이터베이스 읽기 (인메모리)
function readDatabase() {
  return JSON.parse(JSON.stringify(DATABASE_DATA)); // 깊은 복사
}

// 데이터베이스 쓰기 (읽기 전용 - Vercel에서 파일 쓰기 불가)
function writeDatabase(data) {
  console.log('Write operation not supported in Vercel environment');
  return false; // Vercel에서는 파일 시스템 쓰기 불가
}

// 키워드 매칭으로 응답 찾기
function findResponseByKeyword(userInput, affection, intimacy, database) {
  const input = userInput.toLowerCase();
  
  // 키워드별 카테고리 검색
  for (const [categoryKey, category] of Object.entries(database.dialogue_categories)) {
    if (category.keywords && category.keywords.length > 0) {
      if (category.keywords.some(keyword => input.includes(keyword))) {
        // 친밀도 요구사항을 만족하는 응답들 필터링
        const validResponses = category.responses.filter(response => 
          intimacy >= (response.intimacy_requirement || 0)
        );
        
        if (validResponses.length > 0) {
          const randomResponse = validResponses[Math.floor(Math.random() * validResponses.length)];
          return {
            ...randomResponse,
            category: categoryKey,
            category_name: category.name
          };
        }
      }
    }
  }

  // 키워드 매칭 실패시 호감도별 기본 응답
  let defaultCategory;
  if (affection >= 80) {
    defaultCategory = database.dialogue_categories.default_high_affection;
  } else if (affection >= 50) {
    defaultCategory = database.dialogue_categories.default_medium_affection;
  } else {
    defaultCategory = database.dialogue_categories.default_low_affection;
  }

  if (defaultCategory && defaultCategory.responses.length > 0) {
    const validResponses = defaultCategory.responses.filter(response => 
      intimacy >= (response.intimacy_requirement || 0)
    );
    
    if (validResponses.length > 0) {
      const randomResponse = validResponses[Math.floor(Math.random() * validResponses.length)];
      return {
        ...randomResponse,
        category: affection >= 80 ? 'default_high' : affection >= 50 ? 'default_medium' : 'default_low',
        category_name: defaultCategory.name
      };
    }
  }

  return null;
}

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const database = readDatabase();
  if (!database) {
    return res.status(500).json({ error: 'Failed to load dialogue database' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res, database);
      case 'POST':
        return handlePost(req, res, database);
      case 'PUT':
        return handlePut(req, res, database);
      case 'DELETE':
        return handleDelete(req, res, database);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Dialogue API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET: 대사 조회 및 생성
async function handleGet(req, res, database) {
  const { action, category, id } = req.query;

  switch (action) {
    case 'generate':
      // 대사 생성 (채팅에서 사용)
      const { message, affection = 75, intimacy = 0 } = req.query;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = findResponseByKeyword(
        message, 
        parseInt(affection), 
        parseInt(intimacy), 
        database
      );

      if (response) {
        return res.status(200).json({
          success: true,
          response: response.text,
          emotion: response.emotion,
          affection_change: response.affection_change || 0,
          category: response.category,
          response_id: response.id,
          metadata: {
            emotion_display: database.emotions[response.emotion]?.display || '😐',
            tags: response.tags || []
          }
        });
      } else {
        return res.status(404).json({ error: 'No suitable response found' });
      }

    case 'list':
      // 카테고리 목록 또는 특정 카테고리의 응답 목록
      if (category) {
        const cat = database.dialogue_categories[category];
        if (!cat) {
          return res.status(404).json({ error: 'Category not found' });
        }
        return res.status(200).json({
          category: {
            name: cat.name,
            description: cat.description,
            keywords: cat.keywords,
            responses: cat.responses
          }
        });
      } else {
        // 모든 카테고리 목록
        const categories = Object.entries(database.dialogue_categories).map(([key, cat]) => ({
          id: key,
          name: cat.name,
          description: cat.description,
          response_count: cat.responses.length,
          keywords: cat.keywords || []
        }));
        return res.status(200).json({ categories });
      }

    case 'stats':
      // 통계 정보
      return res.status(200).json({
        statistics: database.statistics,
        character: database.character,
        emotions: database.emotions
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// POST: 새 응답 추가
async function handlePost(req, res, database) {
  const { category, response } = req.body;

  if (!category || !response) {
    return res.status(400).json({ error: 'Category and response are required' });
  }

  if (!database.dialogue_categories[category]) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // 응답 ID 생성
  const categoryResponses = database.dialogue_categories[category].responses;
  const maxId = categoryResponses.length > 0 
    ? Math.max(...categoryResponses.map(r => parseInt(r.id.split('_').pop()))) 
    : 0;
  
  const newResponse = {
    id: `${category}_${String(maxId + 1).padStart(3, '0')}`,
    text: response.text,
    emotion: response.emotion || 'neutral',
    intimacy_requirement: response.intimacy_requirement || 0,
    affection_change: response.affection_change || 0,
    created_at: new Date().toISOString().split('T')[0],
    tags: response.tags || []
  };

  database.dialogue_categories[category].responses.push(newResponse);

  if (writeDatabase(database)) {
    return res.status(201).json({
      success: true,
      response: newResponse
    });
  } else {
    return res.status(500).json({ error: 'Failed to save response' });
  }
}

// PUT: 응답 수정
async function handlePut(req, res, database) {
  const { category, id } = req.query;
  const { response } = req.body;

  if (!category || !id || !response) {
    return res.status(400).json({ error: 'Category, ID, and response are required' });
  }

  const categoryData = database.dialogue_categories[category];
  if (!categoryData) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const responseIndex = categoryData.responses.findIndex(r => r.id === id);
  if (responseIndex === -1) {
    return res.status(404).json({ error: 'Response not found' });
  }

  // 응답 업데이트
  const updatedResponse = {
    ...categoryData.responses[responseIndex],
    ...response,
    id: id, // ID는 변경 불가
    updated_at: new Date().toISOString().split('T')[0]
  };

  database.dialogue_categories[category].responses[responseIndex] = updatedResponse;

  if (writeDatabase(database)) {
    return res.status(200).json({
      success: true,
      response: updatedResponse
    });
  } else {
    return res.status(500).json({ error: 'Failed to update response' });
  }
}

// DELETE: 응답 삭제
async function handleDelete(req, res, database) {
  const { category, id } = req.query;

  if (!category || !id) {
    return res.status(400).json({ error: 'Category and ID are required' });
  }

  const categoryData = database.dialogue_categories[category];
  if (!categoryData) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const responseIndex = categoryData.responses.findIndex(r => r.id === id);
  if (responseIndex === -1) {
    return res.status(404).json({ error: 'Response not found' });
  }

  const deletedResponse = categoryData.responses.splice(responseIndex, 1)[0];

  if (writeDatabase(database)) {
    return res.status(200).json({
      success: true,
      deleted_response: deletedResponse
    });
  } else {
    return res.status(500).json({ error: 'Failed to delete response' });
  }
}