// 간단한 디버깅 API - 기본 환경변수만 확인
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 기본 환경변수만 확인
    const envApiKey = process.env.OPENAI_API_KEY;

    console.log('🔍 간단한 환경변수 확인:', {
      hasEnvKey: !!envApiKey,
      envKeyPreview: envApiKey && envApiKey.startsWith('sk-') ? `${envApiKey.substring(0, 4)}...` : 'Invalid or None',
      nodeEnv: process.env.NODE_ENV || 'undefined'
    });

    return res.json({
      success: true,
      message: '간단한 환경변수 테스트',
      environment: {
        OPENAI_API_KEY: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        timestamp: new Date().toISOString(),
        hasValidApiKey: !!(envApiKey && envApiKey.startsWith('sk-'))
      }
    });

  } catch (error) {
    console.error('❌ 간단한 디버깅 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '디버깅 API 오류',
      error: error.message,
      stack: error.stack
    });
  }
}