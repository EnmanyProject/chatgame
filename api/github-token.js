// GitHub Personal Access Token API 엔드포인트
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔐 GitHub 토큰 요청 처리...');
    
    // 환경변수에서 GitHub Personal Access Token 로드
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (githubToken) {
      console.log('✅ GitHub 토큰 환경변수 발견');
      
      return res.json({
        success: true,
        token: githubToken,
        source: 'environment_variable'
      });
    } else {
      console.log('❌ GitHub 토큰 환경변수 없음');
      
      return res.status(404).json({
        success: false,
        message: 'GitHub token not configured in environment variables',
        instructions: {
          step1: 'Go to GitHub.com → Settings → Developer settings → Personal access tokens',
          step2: 'Generate new token (classic)',
          step3: 'Select scopes: repo (Full control of private repositories)',
          step4: 'Add GITHUB_TOKEN to Vercel environment variables'
        }
      });
    }
    
  } catch (error) {
    console.error('❌ GitHub 토큰 API 오류:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}