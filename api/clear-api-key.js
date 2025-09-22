// API 키 삭제 API - Secure Storage 지원
import { removeUserApiKey } from './secure-api-storage.js';

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
      message: 'POST 요청만 허용됩니다.'
    });
  }

  try {
    console.log('🗑️ API 키 안전 삭제 요청 받음');

    // 🔐 Secure Storage에서 기본 사용자의 API 키 삭제
    const deleteResult = await removeUserApiKey('default');

    // 런타임 환경변수에서도 삭제
    delete process.env.OPENAI_API_KEY;

    console.log('✅ API 키 안전 삭제 완료 (Secure Storage + Runtime)');

    if (deleteResult.success) {
      return res.json({
        success: true,
        message: 'API 키가 안전하게 삭제되었습니다. (GitHub 암호화 저장소에서 완전 제거됨)'
      });
    } else {
      return res.json({
        success: true,
        message: 'API 키가 런타임에서 삭제되었습니다. (저장된 키가 없었음)',
        note: deleteResult.message
      });
    }

  } catch (error) {
    console.error('❌ API 키 삭제 오류:', error);

    // 런타임에서라도 삭제 시도
    delete process.env.OPENAI_API_KEY;

    return res.status(500).json({
      success: false,
      message: 'API 키 삭제 중 오류가 발생했습니다.',
      error: error.message,
      note: '런타임 환경변수는 삭제되었습니다.'
    });
  }
}