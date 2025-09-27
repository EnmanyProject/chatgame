// 캐릭터 API 최소 테스트 버전
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  console.log('🧪 Character Test API - action:', action);

  try {
    if (action === 'list_characters') {
      console.log('📋 캐릭터 리스트 테스트 응답');

      return res.json({
        success: true,
        characters: {},
        metadata: {
          version: "2.0.0",
          total_characters: 0,
          source: "test_api",
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.json({
      success: true,
      message: '✅ Character Test API 정상 동작',
      available_actions: ['list_characters'],
      received_action: action
    });

  } catch (error) {
    console.error('❌ Character Test 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'Character Test API 오류',
      error: error.message
    });
  }
};