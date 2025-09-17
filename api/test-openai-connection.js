// OpenAI 연결 테스트 API - 전역 API 키 지원
import { getGlobalApiKey } from './save-api-key.js';

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
    // 전역 API 키 또는 환경변수에서 API 키 가져오기
    const OPENAI_API_KEY = getGlobalApiKey();
    
    console.log('🔍 API 키 확인:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 4)}...` : '없음');
    
    if (!OPENAI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'OpenAI API 키가 설정되지 않았습니다. 먼저 API 키를 저장해주세요.'
      });
    }

    console.log('🧪 OpenAI 연결 테스트 시작...');
    const startTime = Date.now();

    // 간단한 테스트 요청
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
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
            content: '안녕하세요'
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      const tokensUsed = data.usage?.total_tokens || 0;
      
      console.log('✅ OpenAI 연결 테스트 성공:', {
        model: 'gpt-4o-mini',
        responseTime,
        tokensUsed
      });

      return res.json({
        success: true,
        message: 'OpenAI API 연결 테스트 성공',
        model: 'gpt-4o-mini',
        responseTime: responseTime,
        tokensUsed: tokensUsed,
        response: data.choices[0]?.message?.content || '테스트 응답',
        timestamp: new Date().toISOString()
      });
      
    } else {
      const errorData = await response.json();
      console.error('❌ OpenAI API 응답 오류:', errorData);
      
      return res.status(400).json({
        success: false,
        message: 'OpenAI API 오류: ' + (errorData.error?.message || 'Unknown error'),
        statusCode: response.status,
        error: errorData
      });
    }

  } catch (error) {
    console.error('❌ OpenAI 연결 테스트 오류:', error);
    
    return res.status(500).json({
      success: false,
      message: 'OpenAI 연결 테스트 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}