import fs from 'fs';
import path from 'path';

// 대사 데이터베이스 파일 경로
const DB_PATH = path.join(process.cwd(), 'data', 'dialogue_database.json');

// 데이터베이스 읽기
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read dialogue database:', error);
    return null;
  }
}

// 데이터베이스 쓰기
function writeDatabase(data) {
  try {
    // 통계 업데이트
    data.statistics.last_updated = new Date().toISOString();
    data.statistics.categories = Object.keys(data.dialogue_categories).length;
    data.statistics.total_responses = Object.values(data.dialogue_categories)
      .reduce((total, category) => total + category.responses.length, 0);

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to write dialogue database:', error);
    return false;
  }
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

export default async function handler(req, res) {
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