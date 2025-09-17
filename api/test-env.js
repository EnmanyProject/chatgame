// 환경변수 테스트 API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const envStatus = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ 설정됨' : '❌ 미설정',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString(),
    // API 키가 설정되어 있다면 앞 4자리만 표시
    keyPreview: process.env.OPENAI_API_KEY ? 
      `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 
      'No key'
  };

  console.log('🔍 환경변수 상태 확인:', envStatus);

  return res.json({
    success: true,
    message: '환경변수 상태 확인',
    environment: envStatus
  });
}