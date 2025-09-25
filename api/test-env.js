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

  // 다양한 소스에서 API 키 확인
  const cacheApiKey = getGlobalApiKey(); // save-api-key.js 캐시
  const adminApiKey = getActiveApiKey(); // admin-auth.js 세션
  const envApiKey = process.env.OPENAI_API_KEY;
  const apiKeyStatus = getApiKeyStatus();
  const adminApiKeyStatus = getAdminApiKeyStatus();

  console.log('🔍 API 키 소스 확인:', {
    cache: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None',
    admin: adminApiKey ? `${adminApiKey.substring(0, 4)}...` : 'None',
    env: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
    status: apiKeyStatus,
    adminStatus: adminApiKeyStatus
  });

  // 우선 순위: admin-auth 세션 키 → save-api-key 캐시 → 환경변수
  const finalKey = adminApiKey || cacheApiKey || envApiKey;

  const envStatus = {
    OPENAI_API_KEY: finalKey ? '✅ 설정됨' : '❌ 미설정',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString(),
    keyPreview: finalKey ? `${finalKey.substring(0, 4)}...` : 'No key',
    // 상세한 상태 정보
    apiKeyDetails: {
      ...apiKeyStatus,
      ...adminApiKeyStatus,
      envKey: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
      cacheKey: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None',
      adminKey: adminApiKey ? `${adminApiKey.substring(0, 4)}...` : 'None',
      finalKey: finalKey ? `${finalKey.substring(0, 4)}...` : 'None',
      storageType: adminApiKey ? 'admin-session-memory' : 'save-api-key-cache',
      keySource: adminApiKey ? 'admin-auth-session' : (cacheApiKey ? 'save-api-key-cache' : 'environment')
    }
  };

  console.log('🔍 환경변수 상태 확인:', envStatus);

  return res.json({
    success: true,
    message: '환경변수 상태 확인',
    environment: envStatus
  });
}