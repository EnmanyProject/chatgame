// API 키 로딩 테스트 API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 API 키 로딩 테스트 시작');

    // admin-auth의 getActiveApiKey 호출
    const { getActiveApiKey } = await import('./admin-auth.js');

    console.log('🔍 getActiveApiKey 함수 호출 시작');
    const apiKey = await getActiveApiKey();

    console.log('🔍 getActiveApiKey 결과:', {
      hasKey: !!apiKey,
      keyType: typeof apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyFormat: apiKey && apiKey.startsWith('sk-') ? 'Valid OpenAI format' : 'Invalid format',
      keyPreview: apiKey && apiKey.startsWith('sk-') ? `${apiKey.substring(0, 4)}...` : 'Invalid or null'
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      api_key_load_result: {
        loaded: !!apiKey,
        key_length: apiKey ? apiKey.length : 0,
        key_format_valid: apiKey ? apiKey.startsWith('sk-') : false,
        key_preview: apiKey && apiKey.startsWith('sk-') ? `${apiKey.substring(0, 4)}...` : 'None or invalid'
      },
      environment_check: {
        hasOpenAiEnv: !!process.env.OPENAI_API_KEY,
        hasGithubToken: !!process.env.GITHUB_TOKEN,
        hasEncryptionKey: !!process.env.API_ENCRYPTION_KEY,
        hasAdminSecret: !!process.env.ADMIN_SECRET
      }
    });

  } catch (error) {
    console.error('❌ API 키 로딩 테스트 오류:', error);
    console.error('❌ 오류 스택:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'API 키 로딩 테스트 실패',
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      environment_check: {
        hasOpenAiEnv: !!process.env.OPENAI_API_KEY,
        hasGithubToken: !!process.env.GITHUB_TOKEN,
        hasEncryptionKey: !!process.env.API_ENCRYPTION_KEY,
        hasAdminSecret: !!process.env.ADMIN_SECRET
      }
    });
  }
}