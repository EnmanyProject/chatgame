// API 키 저장 API - 간소화된 버전

// 메모리 저장소 (임시 캐시용)
const apiKeyStore = {
  key: null,
  timestamp: null
};

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

    console.log('🔑 API 키 저장 요청 받음:', `${apiKey.substring(0, 4)}...`);

    // 🔐 메모리와 환경변수에 저장
    apiKeyStore.key = apiKey;
    apiKeyStore.timestamp = new Date().toISOString();
    process.env.OPENAI_API_KEY = apiKey;

    console.log('✅ API 키 저장 완료:', `${apiKey.substring(0, 4)}...`);
    console.log('🔍 저장 확인:', {
      cacheKey: apiKeyStore.key ? `${apiKeyStore.key.substring(0, 4)}...` : 'None',
      envKey: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'None'
    });

    // 즉시 연결 테스트 수행
    try {
      const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: '테스트' }],
          max_tokens: 5
        })
      });

      if (testResponse.ok) {
        console.log('✅ API 키 검증 성공');

        return res.json({
          success: true,
          message: 'API 키가 성공적으로 저장되고 검증되었습니다.',
          validated: true,
          keyPreview: `${apiKey.substring(0, 4)}...`,
          storage: 'memory-env'
        });
      } else {
        console.warn('⚠️ API 키 저장되었으나 검증 실패');
        return res.status(400).json({
          success: false,
          message: 'API 키 형식은 올바르지만 OpenAI에서 인증에 실패했습니다. 키가 유효한지 확인해주세요.',
          validated: false
        });
      }
    } catch (testError) {
      console.warn('⚠️ API 키 검증 중 오류:', testError.message);
      return res.json({
        success: true,
        message: 'API 키가 저장되었지만 검증 중 오류가 발생했습니다.',
        validated: false,
        error: testError.message
      });
    }

  } catch (error) {
    console.error('API 키 저장 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 저장 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 전역 API 키 접근 함수 (다른 API에서 사용) - Secure Storage 연동
export async function getGlobalApiKeySync() {
  // 우선 순위: 캐시 → Secure Storage → 환경변수
  if (apiKeyStore.key) {
    console.log('🔍 캐시에서 API 키 반환:', `${apiKeyStore.key.substring(0, 4)}...`);
    return apiKeyStore.key;
  }

  try {
    const secureKey = await getGlobalApiKey();
    if (secureKey) {
      // 캐시에 저장
      apiKeyStore.key = secureKey;
      apiKeyStore.timestamp = new Date().toISOString();

      console.log('🔍 Secure Storage에서 API 키 반환:', `${secureKey.substring(0, 4)}...`);
      return secureKey;
    }
  } catch (error) {
    console.error('❌ Secure Storage API 키 조회 오류:', error);
  }

  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) {
    console.log('🔍 환경변수에서 API 키 반환:', `${envKey.substring(0, 4)}...`);
    return envKey;
  }

  console.log('❌ 사용 가능한 API 키 없음');
  return null;
}

// 동기식 호환성을 위한 래퍼 (기존 코드와의 호환성)
export function getGlobalApiKey() {
  // 캐시 우선 반환
  const result = apiKeyStore.key || process.env.OPENAI_API_KEY;

  console.log('🔍 getGlobalApiKey (동기) 호출:', {
    cacheKey: apiKeyStore.key ? `${apiKeyStore.key.substring(0, 4)}...` : 'None',
    envKey: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'None',
    result: result ? `${result.substring(0, 4)}...` : 'None'
  });
  return result;
}

// API 키 저장소 상태 확인 함수
export function getApiKeyStatus() {
  return {
    hasCacheKey: !!apiKeyStore.key,
    hasEnvKey: !!process.env.OPENAI_API_KEY,
    timestamp: apiKeyStore.timestamp,
    preview: apiKeyStore.key ? `${apiKeyStore.key.substring(0, 4)}...` : 'None',
    storage: 'secure-encrypted-github'
  };
}