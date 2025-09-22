// 환경변수 테스트 API - 전역 API 키 지원
import { getGlobalApiKey, getApiKeyStatus } from './save-api-key.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 다양한 소스에서 API 키 확인
  const globalApiKey = getGlobalApiKey();
  const envApiKey = process.env.OPENAI_API_KEY;
  const apiKeyStatus = getApiKeyStatus();

  console.log('🔍 API 키 소스 확인:', {
    global: globalApiKey ? `${globalApiKey.substring(0, 4)}...` : 'None',
    env: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
    status: apiKeyStatus
  });

  const finalKey = globalApiKey || envApiKey;

  const envStatus = {
    OPENAI_API_KEY: finalKey ? '✅ 설정됨' : '❌ 미설정',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString(),
    keyPreview: finalKey ? `${finalKey.substring(0, 4)}...` : 'No key',
    // 상세한 상태 정보
    apiKeyDetails: {
      ...apiKeyStatus,
      envKey: envApiKey ? `${envApiKey.substring(0, 4)}...` : 'None',
      globalKey: globalApiKey ? `${globalApiKey.substring(0, 4)}...` : 'None',
      finalKey: finalKey ? `${finalKey.substring(0, 4)}...` : 'None'
    }
  };

  console.log('🔍 환경변수 상태 확인:', envStatus);

  return res.json({
    success: true,
    message: '환경변수 상태 확인',
    environment: envStatus
  });
}