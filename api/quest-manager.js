// 36퀘스트 관리 API - v1.0.0
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  try {
    // 퀘스트 목록 조회
    if (action === 'list') {
      const questData = await loadQuestDatabase();
      return res.json({
        success: true,
        metadata: questData.metadata,
        categories: questData.categories,
        total_quests: 36
      });
    }

    // 특정 퀘스트 상세 정보
    if (action === 'get' && req.query.quest_id) {
      const questData = await loadQuestDatabase();
      const quest = questData.quests[req.query.quest_id];
      
      if (quest) {
        return res.json({
          success: true,
          quest: quest
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Quest not found'
        });
      }
    }

    // 캐릭터별 사용 가능 퀘스트 조회  
    if (action === 'character_quests' && req.query.character_id) {
      const questData = await loadQuestDatabase();
      const characterData = await loadCharacterDatabase();
      
      const character = characterData.characters[req.query.character_id];
      if (!character) {
        return res.status(404).json({
          success: false,
          message: 'Character not found'
        });
      }

      const availableQuests = getQuestsForCharacter(questData, character);
      
      return res.json({
        success: true,
        character_id: req.query.character_id,
        available_quests: availableQuests
      });
    }

    // 퀘스트 진행도 저장
    if (action === 'save_progress') {
      // TODO: 실제 사용자 진행도 저장 로직
      return res.json({
        success: true,
        message: 'Progress saved',
        saved_data: req.body
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown action'
    });

  } catch (error) {
    console.error('Quest Manager API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// 퀘스트 데이터베이스 로드
async function loadQuestDatabase() {
  try {
    const questPath = path.join(process.cwd(), 'data', 'quests', 'quest-database.json');
    const questData = fs.readFileSync(questPath, 'utf8');
    return JSON.parse(questData);
  } catch (error) {
    // Fallback 퀘스트 데이터
    return {
      metadata: { version: "1.0.0", total_quests: 1 },
      categories: {},
      quests: {
        quest_001: {
          id: "quest_001",
          title: "첫 번째 메시지",
          category: "daily_romance",
          difficulty: "easy"
        }
      }
    };
  }
}

// 캐릭터 데이터베이스 로드
async function loadCharacterDatabase() {
  try {
    const charPath = path.join(process.cwd(), 'data', 'characters-extended', 'mbti-characters.json');
    const charData = fs.readFileSync(charPath, 'utf8');
    return JSON.parse(charData);
  } catch (error) {
    // Fallback 캐릭터 데이터  
    return {
      characters: {
        yuna_infp: {
          id: "yuna_infp",
          name: "윤아",
          mbti: "INFP",
          available_quests: "all"
        }
      }
    };
  }
}

// 캐릭터별 사용 가능 퀘스트 필터링
function getQuestsForCharacter(questData, character) {
  const allQuests = Object.values(questData.quests);
  
  if (character.available_quests === "all") {
    return allQuests;
  }
  
  const availableCategories = character.available_quests.split(',');
  return allQuests.filter(quest => 
    availableCategories.includes(quest.category)
  );
}