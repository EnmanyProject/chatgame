// 간단한 API 키 관리 - Vercel 환경변수 전용
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  try {
    // API 키 확인
    if (action === 'check') {
      const apiKey = process.env.OPENAI_API_KEY;

      let testResult = null;
      if (apiKey && apiKey.startsWith('sk-')) {
        try {
          console.log('🔍 OpenAI API 연결 테스트 시작...');
          const testResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          });

          testResult = {
            status: testResponse.status,
            ok: testResponse.ok,
            connected: testResponse.ok
          };
        } catch (error) {
          testResult = {
            connected: false,
            error: error.message
          };
        }
      }

      return res.json({
        success: true,
        apiKey: {
          exists: !!apiKey,
          isValid: apiKey ? apiKey.startsWith('sk-') : false,
          preview: apiKey && apiKey.startsWith('sk-') ? `${apiKey.substring(0, 4)}...` : 'Not set',
          connected: testResult?.connected || false
        },
        testResult,
        timestamp: new Date().toISOString()
      });
    }

    // Vercel 환경변수 설정 안내
    if (action === 'save') {
      return res.json({
        success: false,
        message: '❌ API 키는 Vercel 환경변수에서 설정해야 합니다',
        instructions: {
          title: 'Vercel 환경변수 설정 방법',
          steps: [
            '1. Vercel 대시보드 → 프로젝트 선택',
            '2. Settings → Environment Variables',
            '3. 변수명: OPENAI_API_KEY',
            '4. 값: 실제 OpenAI API 키 (sk-로 시작)',
            '5. Environment: Production, Preview, Development 모두 선택',
            '6. Save 후 프로젝트 재배포'
          ],
          note: '환경변수 설정 후 약 1-2분 뒤에 적용됩니다.'
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown action. Use: check, save'
    });

  } catch (error) {
    console.error('❌ Simple API Key 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// 다른 API에서 사용할 수 있는 간단한 API 키 조회 함수
export async function getSimpleApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.startsWith('sk-')) {
    console.log('✅ Vercel 환경변수에서 API Key 발견:', `${apiKey.substring(0, 4)}...`);
    return apiKey;
  }

  console.log('❌ Vercel 환경변수 OPENAI_API_KEY 없음 또는 형식 오류');
  return null;
}