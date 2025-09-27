// GitHub Token 상태 디버그 API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 모든 가능한 GitHub Token 환경변수 확인
    const tokens = {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN,
      GITHUB_PAT: process.env.GITHUB_PAT,
      GH_TOKEN: process.env.GH_TOKEN,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF
    };

    // OpenAI API 키도 확인
    const openaiKey = process.env.OPENAI_API_KEY;

    // 다른 중요한 환경변수들
    const otherEnvs = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      API_ENCRYPTION_KEY: process.env.API_ENCRYPTION_KEY,
      ADMIN_SECRET: process.env.ADMIN_SECRET
    };

    // 보안을 위해 실제 값은 숨기고 존재 여부와 일부만 표시
    const tokenStatus = {};
    for (const [key, value] of Object.entries(tokens)) {
      tokenStatus[key] = {
        exists: !!value,
        length: value ? value.length : 0,
        preview: value ? `${value.substring(0, 4)}...` : 'None',
        type: typeof value
      };
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      github_tokens: tokenStatus,
      openai_key: {
        exists: !!openaiKey,
        length: openaiKey ? openaiKey.length : 0,
        preview: openaiKey ? `${openaiKey.substring(0, 4)}...` : 'None',
        isValidFormat: openaiKey ? openaiKey.startsWith('sk-') : false
      },
      other_env_vars: {
        NODE_ENV: otherEnvs.NODE_ENV,
        VERCEL: otherEnvs.VERCEL,
        VERCEL_ENV: otherEnvs.VERCEL_ENV,
        hasApiEncryptionKey: !!otherEnvs.API_ENCRYPTION_KEY,
        hasAdminSecret: !!otherEnvs.ADMIN_SECRET
      },
      // 선택된 GitHub Token 확인
      selected_github_token: {
        selected: process.env.GITHUB_TOKEN ||
                  process.env.GITHUB_ACCESS_TOKEN ||
                  process.env.GITHUB_PAT ||
                  process.env.GH_TOKEN ||
                  process.env.VERCEL_GIT_COMMIT_REF,
        source: process.env.GITHUB_TOKEN ? 'GITHUB_TOKEN' :
                process.env.GITHUB_ACCESS_TOKEN ? 'GITHUB_ACCESS_TOKEN' :
                process.env.GITHUB_PAT ? 'GITHUB_PAT' :
                process.env.GH_TOKEN ? 'GH_TOKEN' :
                process.env.VERCEL_GIT_COMMIT_REF ? 'VERCEL_GIT_COMMIT_REF' : 'None'
      }
    };

    return res.json(response);

  } catch (error) {
    console.error('❌ 환경변수 디버그 오류:', error);
    return res.status(500).json({
      success: false,
      message: '환경변수 확인 중 오류 발생',
      error: error.message
    });
  }
}