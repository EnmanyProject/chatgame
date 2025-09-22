// API 키 삭제 API - 간소화된 버전

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'POST 요청만 허용됩니다.'
    });
  }

  try {
    console.log('🗑️ API 키 삭제 요청 받음');

    // 런타임 환경변수에서 삭제
    delete process.env.OPENAI_API_KEY;

    console.log('✅ API 키 삭제 완료');

    return res.json({
      success: true,
      message: 'API 키가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ API 키 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}