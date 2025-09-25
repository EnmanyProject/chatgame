// 환경변수 테스트 API - admin-auth 연동
import { getGlobalApiKey, getApiKeyStatus } from './save-api-key.js';
import { getActiveApiKey, getAdminApiKeyStatus } from './admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 다양한 소스에서 API 키 확인 (통합 저장소)
  const cacheApiKey = getGlobalApiKey(); // save-api-key.js 캐시
  const adminApiKey = await getActiveApiKey(); // admin-auth.js 통합 저장소 (async)
  const envApiKey = process.env.OPENAI_API_KEY;
  const apiKeyStatus = getApiKeyStatus();
  const adminApiKeyStatus = await getAdminApiKeyStatus(); // 통합 저장소 (async)

  console.log('🔍 API 키 소스 확인 (통합 저장소):', {
    cache: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None',
    admin: adminApiKey ? `${adminApiKey.substring(0, 4)}...` : 'None',
    env: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
    status: apiKeyStatus,
    adminStatus: adminApiKeyStatus
  });

  // 우선 순위: 통합 admin-auth (메모리→GitHub→환경변수) → save-api-key 캐시 → 직접 환경변수
  const finalKey = adminApiKey || cacheApiKey || envApiKey;

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

  const envStatus = {
    OPENAI_API_KEY: actualApiStatus,
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString(),
    keyPreview: actualKeyPreview,
    // 상세한 통합 저장소 상태 정보
    apiKeyDetails: {
      ...apiKeyStatus,
      ...adminApiKeyStatus,
      envKey: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
      cacheKey: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None',
      adminKey: adminApiKey ? `${adminApiKey.substring(0, 4)}...` : 'None',
      finalKey: finalKey ? `${finalKey.substring(0, 4)}...` : 'None',

      // 통합 저장소 정보
      unifiedStorage: {
        isActive: adminApiKeyStatus?.unifiedSystem || false,
        storageType: adminApiKeyStatus?.storage || 'none',
        hasFallback: !!(cacheApiKey || envApiKey),
        keySource: adminApiKey ?
          `admin-auth-unified(${adminApiKeyStatus?.storage})` :
          (cacheApiKey ? 'save-api-key-cache' : 'environment'),
        priorityChain: 'admin-unified → cache → env'
      },

      // 기존 호환성
      storageType: adminApiKeyStatus?.storage || 'fallback',
      keySource: adminApiKey ?
        `admin-auth-unified(${adminApiKeyStatus?.storage})` :
        (cacheApiKey ? 'save-api-key-cache' : 'environment')
    }
  };

  console.log('🔍 환경변수 상태 확인:', envStatus);

  return res.json({
    success: true,
    message: '환경변수 상태 확인',
    environment: envStatus
  });
}