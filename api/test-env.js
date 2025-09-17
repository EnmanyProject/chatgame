// 환경변수 테스트 API - 전역 API 키 지원
import { getGlobalApiKey, getApiKeyStatus } from './save-api-key.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 전역 API 키 확인
  const globalApiKey = getGlobalApiKey();
  const apiKeyStatus = getApiKeyStatus();

  const envStatus = {
    OPENAI_API_KEY: globalApiKey ? '✅ 설정됨' : '❌ 미설정',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString(),
    keyPreview: globalApiKey ? 
      `${globalApiKey.substring(0, 4)}...` : 
      'No key',
    // 상세한 상태 정보
    apiKeyDetails: {
      ...apiKeyStatus,
      finalKey: globalApiKey ? `${globalApiKey.substring(0, 4)}...` : 'None'
    }
  };

  console.log('🔍 환경변수 상태 확인:', envStatus);

  return res.json({
    success: true,
    message: '환경변수 상태 확인',
    environment: envStatus
  });
}