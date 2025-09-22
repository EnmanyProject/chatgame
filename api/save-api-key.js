// API 키 저장 API - 향상된 세션 관리
let globalApiKey = null; // 전역 변수로 API 키 저장

// 메모리 저장소 (Vercel 서버리스 환경에서 공유)
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

    // 전역 변수, 환경변수, 메모리 저장소에 모두 저장
    globalApiKey = apiKey;
    process.env.OPENAI_API_KEY = apiKey;
    apiKeyStore.key = apiKey;
    apiKeyStore.timestamp = new Date().toISOString();

    console.log('✅ API 키 전역 저장 완료');
    console.log('🔍 저장 확인:', {
      globalApiKey: globalApiKey ? `${globalApiKey.substring(0, 4)}...` : 'None',
      envKey: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'None',
      storeKey: apiKeyStore.key ? `${apiKeyStore.key.substring(0, 4)}...` : 'None'
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
          messages: [
            {
              role: 'system',
              content: '간단한 연결 테스트입니다.'
            },
            {
              role: 'user',
              content: '테스트'
            }
          ],
          max_tokens: 5,
          temperature: 0.1
        })
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ API 키 검증 성공');
        
        return res.json({
          success: true,
          message: 'API 키가 성공적으로 저장되고 검증되었습니다.',
          validated: true,
          model: 'gpt-4o-mini',
          note: '현재 세션에서 유효합니다.'
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

// 전역 API 키 접근 함수 (다른 API에서 사용)
export function getGlobalApiKey() {
  // 우선 순위: 메모리 저장소 → 전역 변수 → 환경변수
  const result = apiKeyStore.key || globalApiKey || process.env.OPENAI_API_KEY;
  console.log('🔍 getGlobalApiKey 호출:', {
    storeKey: apiKeyStore.key ? `${apiKeyStore.key.substring(0, 4)}...` : 'None',
    globalKey: globalApiKey ? `${globalApiKey.substring(0, 4)}...` : 'None',
    envKey: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'None',
    result: result ? `${result.substring(0, 4)}...` : 'None'
  });
  return result;
}

// API 키 저장소 상태 확인 함수
export function getApiKeyStatus() {
  return {
    hasStoreKey: !!apiKeyStore.key,
    hasGlobalKey: !!globalApiKey,
    hasEnvKey: !!process.env.OPENAI_API_KEY,
    timestamp: apiKeyStore.timestamp,
    preview: apiKeyStore.key ? `${apiKeyStore.key.substring(0, 4)}...` : 'None'
  };
}