// 환경변수 테스트 API - admin-auth 연동
import { getActiveApiKey, getAdminApiKeyStatus } from './admin-auth.js';

// save-api-key.js의 함수들은 fallback으로만 사용 (선택적)
let getGlobalApiKey, getApiKeyStatus;
try {
  const saveApiKeyModule = await import('./save-api-key.js');
  getGlobalApiKey = saveApiKeyModule.getGlobalApiKey;
  getApiKeyStatus = saveApiKeyModule.getApiKeyStatus;
} catch (error) {
  console.warn('⚠️ save-api-key.js 모듈 로드 실패 (무시 가능):', error.message);
  getGlobalApiKey = () => null;
  getApiKeyStatus = () => ({ status: 'module_load_failed' });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 다양한 소스에서 API 키 확인 (통합 저장소) - 우선순위 재정렬
  console.log('🔍 API 키 확인 시작 - 모든 저장소 체크');

  // 1. 환경변수 직접 확인 (가장 확실한 방법)
  const envApiKey = process.env.OPENAI_API_KEY;
  console.log('🔍 환경변수 직접 확인:', {
    hasEnvKey: !!envApiKey,
    envKeyPreview: envApiKey && envApiKey.startsWith('sk-') ? `${envApiKey.substring(0, 4)}...` : 'Invalid or None'
  });

  // 2. admin-auth 통합 저장소 (개선된 로직)
  const adminApiKey = await getActiveApiKey(); // admin-auth.js 통합 저장소 (async)
  console.log('🔍 admin-auth 통합 저장소:', {
    hasAdminKey: !!adminApiKey,
    adminKeyPreview: adminApiKey ? `${adminApiKey.substring(0, 4)}...` : 'None'
  });

  // 3. save-api-key 캐시 (fallback)
  let cacheApiKey;
  try {
    cacheApiKey = getGlobalApiKey(); // save-api-key.js 캐시 - 동기함수이면 await 제거
  } catch (error) {
    console.warn('⚠️ save-api-key 캐시 확인 실패:', error.message);
    cacheApiKey = null;
  }

  console.log('🔍 모든 API 키 소스 확인 결과:', {
    env: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
    admin: adminApiKey ? `${adminApiKey.substring(0, 4)}...` : 'None',
    cache: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None'
  });

  // 우선 순위: 환경변수 → admin-auth → cache
  const finalKey = envApiKey || adminApiKey || cacheApiKey;

  // 실제 OpenAI API 테스트로 상태 확인
  let actualApiStatus = '❌ 미설정';
  let actualKeyPreview = 'No key';

  if (finalKey) {
    try {
      // 간단한 OpenAI API 테스트
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${finalKey}`
        }
      });

      if (testResponse.ok) {
        actualApiStatus = '✅ 설정됨 (OpenAI 연결 확인됨)';
        actualKeyPreview = `${finalKey.substring(0, 4)}...`;
      } else {
        actualApiStatus = '⚠️ 키 있음 (OpenAI 인증 실패)';
        actualKeyPreview = `${finalKey.substring(0, 4)}...`;
      }
    } catch (error) {
      actualApiStatus = finalKey ? '⚠️ 키 있음 (연결 테스트 실패)' : '❌ 미설정';
      actualKeyPreview = finalKey ? `${finalKey.substring(0, 4)}...` : 'No key';
    }
  }

  // 관리자 API 키 상태 확인 (개선된 로깅과 함께)
  let adminApiKeyStatus;
  try {
    adminApiKeyStatus = await getAdminApiKeyStatus();
    console.log('✅ 관리자 API 키 상태 확인 완료:', adminApiKeyStatus);
  } catch (error) {
    console.warn('⚠️ 관리자 API 키 상태 확인 실패:', error.message);
    adminApiKeyStatus = { error: error.message };
  }

  // API 키 상태 확인 (fallback)
  let apiKeyStatus;
  try {
    apiKeyStatus = getApiKeyStatus();
  } catch (error) {
    console.warn('⚠️ API 키 상태 확인 실패:', error.message);
    apiKeyStatus = { error: error.message };
  }

  const envStatus = {
    OPENAI_API_KEY: actualApiStatus,
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString(),
    keyPreview: actualKeyPreview,
    // 상세한 통합 저장소 상태 정보
    apiKeyDetails: {
      // 실제 확인한 키들
      envKey: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
      adminKey: adminApiKey ? `${adminApiKey.substring(0, 4)}...` : 'None',
      cacheKey: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None',
      finalKey: finalKey ? `${finalKey.substring(0, 4)}...` : 'None',

      // 키 검증 결과
      hasValidEnvKey: !!(envApiKey && envApiKey.startsWith('sk-')),
      hasValidAdminKey: !!(adminApiKey && adminApiKey.startsWith('sk-')),
      hasValidCacheKey: !!(cacheApiKey && cacheApiKey.startsWith('sk-')),
      hasValidFinalKey: !!(finalKey && finalKey.startsWith('sk-')),

      // 통합 저장소 정보 (개선됨)
      unifiedStorage: {
        priorityOrder: 'environment → admin-auth → cache',
        keySource: finalKey ?
          (finalKey === envApiKey ? 'environment-direct' :
           finalKey === adminApiKey ? 'admin-auth-unified' :
           'cache-fallback') : 'none',
        storageAccess: {
          environment: !!(envApiKey && envApiKey.startsWith('sk-')),
          adminAuth: !!(adminApiKey && adminApiKey.startsWith('sk-')),
          cache: !!(cacheApiKey && cacheApiKey.startsWith('sk-'))
        }
      },

      // 상태 객체들 (오류 포함)
      adminStatus: adminApiKeyStatus || { error: 'not_available' },
      cacheStatus: apiKeyStatus || { error: 'not_available' }
    }
  };

  console.log('🔍 환경변수 상태 확인:', envStatus);

  return res.json({
    success: true,
    message: '환경변수 상태 확인',
    environment: envStatus
  });
}