// 에피소드 테스트 API - 대화 생성 전용
module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🎯 Episode Test API 호출:', {
      method: req.method,
      action: req.body?.action,
      character_id: req.body?.character_id,
      difficulty: req.body?.difficulty
    });

    if (req.method === 'POST' && req.body?.action === 'generate') {
      const { character_id, user_prompt, difficulty } = req.body;

      console.log(`🎭 ${character_id}의 ${difficulty} 난이도 대화 생성:`, user_prompt);

      // 에러 메시지 반환 (폴백 제거됨)
      return res.status(500).json({
        success: false,
        message: 'AI 대화 생성 기능이 현재 비활성화되어 있습니다.',
        error: 'AI_API_DISABLED',
        details: {
          character_id,
          difficulty,
          user_prompt: user_prompt?.substring(0, 50) + '...'
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid request format'
    });

  } catch (error) {
    console.error('❌ Episode Test API 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 오류: ' + error.message
    });
  }
};