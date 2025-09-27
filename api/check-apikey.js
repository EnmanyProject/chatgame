// API 키 상태 확인용 간단한 엔드포인트 (인증 없음)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 환경변수에서 API 키 직접 확인
    const envApiKey = process.env.OPENAI_API_KEY;
    const hasValidKey = !!(envApiKey && envApiKey.startsWith('sk-'));

    let openaiTestResult = null;

    // API 키가 있으면 OpenAI 연결 테스트
    if (hasValidKey) {
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${envApiKey}`
          }
        });

        openaiTestResult = {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText
        };
      } catch (error) {
        openaiTestResult = {
          error: error.message
        };
      }
    }

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      apiKeyStatus: {
        hasEnvKey: !!envApiKey,
        isValidFormat: hasValidKey,
        keyPreview: hasValidKey ? `${envApiKey.substring(0, 4)}...` : 'No valid key',
        openaiTest: openaiTestResult
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        platform: process.platform,
        nodeVersion: process.version
      }
    });

  } catch (error) {
    console.error('❌ API 키 확인 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 확인 중 오류 발생',
      error: error.message,
      stack: error.stack
    });
  }
}