// 간단한 Vercel 테스트 API
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🧪 Simple Test API 호출됨');
  console.log('📍 현재 작업 디렉토리:', process.cwd());
  console.log('🔧 Node.js 버전:', process.version);
  console.log('📊 메모리 사용량:', process.memoryUsage());

  try {
    // 기본 환경변수 확인
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    return res.json({
      success: true,
      message: '✅ Vercel 서버리스 함수 정상 동작',
      environment: {
        node_version: process.version,
        working_directory: process.cwd(),
        has_openai_key: hasOpenAI,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Simple Test 오류:', error);
    return res.status(500).json({
      success: false,
      message: '테스트 API 오류',
      error: error.message
    });
  }
};