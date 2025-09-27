// AI 캐릭터 생성 API - 새로운 안전 버전
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  console.log('🎭 새로운 캐릭터 생성 AI 요청:', {
    method: req.method,
    action,
    timestamp: new Date().toISOString()
  });

  try {
    // 캐릭터 리스트 조회
    if (action === 'list_characters') {
      console.log('📋 캐릭터 리스트 조회...');

      return res.json({
        success: true,
        characters: {},
        metadata: {
          version: "2.0.0",
          total_characters: 0,
          source: "new_api_version",
          timestamp: new Date().toISOString()
        }
      });
    }

    // 모든 캐릭터 데이터 초기화
    if (action === 'reset_all_characters') {
      console.log('🗑️ 캐릭터 데이터 초기화...');

      return res.json({
        success: true,
        message: '모든 캐릭터 데이터가 초기화되었습니다 (테스트 모드)'
      });
    }

    // 캐릭터 저장
    if (action === 'save_character') {
      const { character } = req.body;

      if (!character || !character.name || !character.mbti) {
        return res.status(400).json({
          success: false,
          message: 'Character name and MBTI are required'
        });
      }

      console.log('💾 캐릭터 저장:', character.name);

      return res.json({
        success: true,
        character: {
          ...character,
          id: `${character.name.toLowerCase()}_${character.mbti.toLowerCase()}_${Date.now()}`
        },
        message: 'Character saved successfully (test mode)'
      });
    }

    // 캐릭터 삭제
    if (action === 'delete_character') {
      const { character_id } = req.body;

      if (!character_id) {
        return res.status(400).json({
          success: false,
          message: 'Character ID is required'
        });
      }

      console.log('🗑️ 캐릭터 삭제:', character_id);

      return res.json({
        success: true,
        message: 'Character deleted successfully (test mode)'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown action. Available: list_characters, save_character, delete_character, reset_all_characters'
    });

  } catch (error) {
    console.error('❌ 새로운 캐릭터 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      action: action,
      timestamp: new Date().toISOString()
    });
  }
};