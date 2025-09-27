// 간단한 API 키 관리 - 런타임 메모리 저장
let runtimeApiKey = null;

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
      const apiKey = runtimeApiKey || process.env.OPENAI_API_KEY;

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

    // API 키 저장 (환경변수 설정 안내)
    if (action === 'save') {
      const { apiKey } = req.body;

      if (!apiKey || !apiKey.startsWith('sk-')) {
        return res.status(400).json({
          success: false,
          message: '유효한 OpenAI API 키를 입력해주세요 (sk-로 시작)'
        });
      }

      // API 키 유효성 검증
      try {
        console.log('🔍 API 키 유효성 검증 중...');
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error('❌ API 키 검증 실패:', testResponse.status, errorText);

          let errorMessage = 'API 키가 유효하지 않습니다.';
          if (testResponse.status === 401) {
            errorMessage = 'API 키가 잘못되었습니다. OpenAI 대시보드에서 올바른 키를 확인해주세요.';
          } else if (testResponse.status === 429) {
            errorMessage = 'API 사용량 한도를 초과했습니다.';
          }

          return res.status(400).json({
            success: false,
            message: errorMessage,
            details: `HTTP ${testResponse.status}`
          });
        }

        console.log('✅ API 키 유효성 검증 성공');

        // 런타임 메모리에 API 키 저장 (모듈 레벨 변수)
        runtimeApiKey = apiKey;
        process.env.OPENAI_API_KEY = apiKey; // 환경변수도 설정 (현재 인스턴스용)
        console.log('✅ 런타임 메모리 및 환경변수 설정 완료', `${apiKey.substring(0, 4)}...`);

        return res.json({
          success: true,
          message: '✅ API 키가 성공적으로 설정되었습니다!',
          note: 'API 키가 현재 세션에 저장되었습니다. AI 생성 기능을 사용할 수 있습니다.',
          apiKey: {
            preview: `${apiKey.substring(0, 4)}...`,
            connected: true
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ API 키 검증 중 오류:', error);
        return res.status(500).json({
          success: false,
          message: '네트워크 오류로 API 키를 검증할 수 없습니다.',
          details: error.message
        });
      }
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
  // 런타임 메모리에서 먼저 확인
  const apiKey = runtimeApiKey || process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.startsWith('sk-')) {
    console.log('✅ Simple API Key 발견:', `${apiKey.substring(0, 4)}...`);
    return apiKey;
  }

  console.log('❌ Simple API Key 없음 - runtimeApiKey:', !!runtimeApiKey, 'env:', !!process.env.OPENAI_API_KEY);
  return null;
}