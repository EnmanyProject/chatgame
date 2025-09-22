// 환경변수 테스트 API - 간소화된 버전
import { getGlobalApiKey, getApiKeyStatus } from './save-api-key.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 다양한 소스에서 API 키 확인
  const cacheApiKey = getGlobalApiKey(); // 캐시된 키
  const envApiKey = process.env.OPENAI_API_KEY;
  const apiKeyStatus = getApiKeyStatus();

  // 간단한 키 확인
  const secureApiKey = null; // 현재는 사용하지 않음

  console.log('🔍 API 키 소스 확인:', {
    cache: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None',
    secure: secureApiKey ? `${secureApiKey.substring(0, 4)}...` : 'None',
    env: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
    status: apiKeyStatus
  });

  const finalKey = cacheApiKey || envApiKey;

  const envStatus = {
    OPENAI_API_KEY: finalKey ? '✅ 설정됨' : '❌ 미설정',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString(),
    keyPreview: finalKey ? `${finalKey.substring(0, 4)}...` : 'No key',
    // 상세한 상태 정보
    apiKeyDetails: {
      ...apiKeyStatus,
      envKey: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
      cacheKey: cacheApiKey ? `${cacheApiKey.substring(0, 4)}...` : 'None',
      secureKey: secureApiKey ? `${secureApiKey.substring(0, 4)}...` : 'None',
      finalKey: finalKey ? `${finalKey.substring(0, 4)}...` : 'None',
      storageType: 'secure-encrypted-github'
    }
  };

  console.log('🔍 환경변수 상태 확인:', envStatus);

  return res.json({
    success: true,
    message: '환경변수 상태 확인',
    environment: envStatus
  });
}