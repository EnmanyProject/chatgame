// 에러 로깅 API - 클라이언트에서 발생하는 에러를 서버에 기록

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const timestamp = new Date().toISOString();

    // GET 요청 - API 상태 확인
    if (req.method === 'GET') {
      return res.json({
        success: true,
        message: 'Error Logger API 정상 작동',
        timestamp: timestamp,
        endpoints: {
          'POST /api/error-logger': 'Log client-side errors',
          'GET /api/error-logger': 'Health check'
        }
      });
    }

    // POST 요청 - 에러 로깅
    if (req.method === 'POST') {
      const errorData = req.body;

      // 필수 필드 검증
      if (!errorData.message) {
        return res.status(400).json({
          success: false,
          message: 'Error message is required'
        });
      }

      // 에러 정보 구조화
      const logEntry = {
        timestamp: timestamp,
        level: errorData.level || 'error',
        message: errorData.message,
        stack: errorData.stack || null,
        url: errorData.url || null,
        userAgent: req.headers['user-agent'] || null,
        context: {
          userId: errorData.userId || 'anonymous',
          sessionId: errorData.sessionId || null,
          action: errorData.action || null,
          component: errorData.component || null,
          additionalData: errorData.additionalData || {}
        },
        server: {
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection?.remoteAddress || null,
          headers: {
            referer: req.headers.referer || null,
            'x-forwarded-for': req.headers['x-forwarded-for'] || null
          }
        }
      };

      // 콘솔에 상세 로그 출력
      console.error('🚨 CLIENT ERROR LOG:', {
        timestamp: logEntry.timestamp,
        level: logEntry.level,
        message: logEntry.message,
        url: logEntry.url,
        userAgent: logEntry.userAgent,
        context: logEntry.context
      });

      // 스택 트레이스가 있으면 별도 출력
      if (logEntry.stack) {
        console.error('📋 STACK TRACE:', logEntry.stack);
      }

      // 추가 데이터가 있으면 출력
      if (logEntry.context.additionalData && Object.keys(logEntry.context.additionalData).length > 0) {
        console.error('📊 ADDITIONAL DATA:', logEntry.context.additionalData);
      }

      // 심각도별 구분
      switch (logEntry.level) {
        case 'critical':
          console.error('💀 CRITICAL ERROR - Immediate attention required');
          break;
        case 'error':
          console.error('❌ ERROR - Needs investigation');
          break;
        case 'warning':
          console.warn('⚠️ WARNING - Monitor closely');
          break;
        case 'info':
          console.log('ℹ️ INFO - For reference');
          break;
      }

      // 성공 응답
      return res.json({
        success: true,
        message: 'Error logged successfully',
        timestamp: timestamp,
        logId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    // 지원하지 않는 메서드
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET or POST.'
    });

  } catch (error) {
    console.error('💥 ERROR LOGGER API FAILURE:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logger API internal error: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};