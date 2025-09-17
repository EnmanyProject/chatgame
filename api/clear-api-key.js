// API 키 삭제 API
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
    console.log('🗑️ API 키 삭제 요청 받음');

    // 런타임 환경변수에서 삭제
    delete process.env.OPENAI_API_KEY;
    
    console.log('✅ API 키 런타임 삭제 완료');

    return res.json({
      success: true,
      message: 'API 키가 삭제되었습니다.',
      note: '런타임 환경변수에서만 삭제됩니다. Vercel 환경변수가 설정되어 있다면 수동으로 삭제해주세요.'
    });

  } catch (error) {
    console.error('API 키 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}