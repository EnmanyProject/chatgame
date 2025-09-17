// API 키 저장 API
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
      message: 'Method not allowed' 
    });
  }

  try {
    const { apiKey } = req.body;

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.status(400).json({
        success: false,
        message: '유효한 OpenAI API 키를 제공해주세요.'
      });
    }

    console.log('🔑 API 키 저장 요청 받음');

    // 실제로는 Vercel 환경변수에 직접 저장할 수 없으므로
    // 임시적으로 런타임 환경변수에 저장
    process.env.OPENAI_API_KEY = apiKey;
    
    console.log('✅ API 키 런타임 저장 완료');

    return res.json({
      success: true,
      message: 'API 키가 성공적으로 저장되었습니다.',
      note: '현재 세션에서만 유효합니다. 영구 저장을 위해서는 Vercel 대시보드에서 환경변수를 수동 설정해주세요.'
    });

  } catch (error) {
    console.error('API 키 저장 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 저장 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}