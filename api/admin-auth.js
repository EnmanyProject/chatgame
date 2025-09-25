// 어드민 인증 API - JWT/HMAC 토큰 기반 API 키 관리 (서버리스 환경 최적화)
import crypto from 'crypto';

// 간단한 사용자 저장소 (실제로는 데이터베이스나 안전한 저장소 사용)
const adminUsers = {
  'admin': {
    password: 'chatgame2025', // 실제로는 해시된 비밀번호
    lastLogin: null
  }
};

// JWT/HMAC 서명을 위한 시크릿 키
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'chatgame-admin-secret-2025-default-change-in-production';

// 토큰 생성 (HMAC-SHA256 기반)
function createAuthToken(username) {
  const payload = {
    username,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    hasApiKey: false, // 초기값
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24시간 만료
  };

  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', ADMIN_SECRET)
    .update(payloadStr)
    .digest('hex');

  // Base64 인코딩으로 토큰 생성
  const token = Buffer.from(`${payloadStr}.${signature}`).toString('base64');

  console.log('🔑 새 인증 토큰 생성:', {
    username,
    tokenPreview: `${token.substring(0, 10)}...`,
    expiresAt: new Date(payload.exp).toISOString()
  });

  return token;
}

// 토큰 검증 및 페이로드 추출
function verifyAuthToken(token) {
  try {
    if (!token) {
      throw new Error('토큰이 없습니다');
    }

    // Base64 디코딩
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [payloadStr, signature] = decoded.split('.');

    if (!payloadStr || !signature) {
      throw new Error('잘못된 토큰 형식');
    }

    // 서명 검증
    const expectedSignature = crypto.createHmac('sha256', ADMIN_SECRET)
      .update(payloadStr)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('토큰 서명이 유효하지 않습니다');
    }

    const payload = JSON.parse(payloadStr);

    // 만료 시간 확인
    if (Date.now() > payload.exp) {
      throw new Error('토큰이 만료되었습니다');
    }

    // 사용자 존재 확인
    if (!adminUsers[payload.username]) {
      throw new Error('유효하지 않은 사용자');
    }

    console.log('✅ 토큰 검증 성공:', {
      username: payload.username,
      loginTime: payload.loginTime,
      hasApiKey: payload.hasApiKey
    });

    return payload;

  } catch (error) {
    console.error('❌ 토큰 검증 실패:', error.message);
    return null;
  }
}

// 토큰의 hasApiKey 상태 업데이트 (새 토큰 생성)
function updateTokenApiKeyStatus(token, hasApiKey) {
  try {
    const payload = verifyAuthToken(token);
    if (!payload) return null;

    payload.hasApiKey = hasApiKey;
    payload.lastActivity = new Date().toISOString();

    const payloadStr = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', ADMIN_SECRET)
      .update(payloadStr)
      .digest('hex');

    return Buffer.from(`${payloadStr}.${signature}`).toString('base64');
  } catch (error) {
    console.error('❌ 토큰 API 키 상태 업데이트 실패:', error);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'check-session':
        return await handleCheckSession(req, res);
      case 'save-api-key':
        return await handleSaveApiKey(req, res);
      case 'get-api-key':
        return await handleGetApiKey(req, res);
      case 'delete-api-key':
        return await handleDeleteApiKey(req, res);
      default:
        return res.status(400).json({
          success: false,
          message: '지원되지 않는 액션입니다.'
        });
    }
  } catch (error) {
    console.error('어드민 인증 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 로그인 처리 (토큰 기반)
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'POST 요청만 허용됩니다.' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '사용자명과 비밀번호를 입력해주세요.'
    });
  }

  // 사용자 확인
  const user = adminUsers[username];
  if (!user || user.password !== password) {
    console.log('🚫 로그인 실패:', username);
    return res.status(401).json({
      success: false,
      message: '사용자명 또는 비밀번호가 잘못되었습니다.'
    });
  }

  // 토큰 생성 (세션 대신)
  const authToken = createAuthToken(username);
  user.lastLogin = new Date().toISOString();

  console.log('✅ 토큰 기반 로그인 성공:', username);

  return res.json({
    success: true,
    message: '로그인 성공',
    authToken, // sessionId 대신 authToken
    user: {
      username,
      hasApiKey: false, // 토큰에서 관리됨
      lastLogin: user.lastLogin
    }
  });
}

// 로그아웃 처리 (토큰 기반)
async function handleLogout(req, res) {
  const { authToken } = req.body;

  if (!authToken) {
    return res.status(400).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  const payload = verifyAuthToken(authToken);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }

  console.log('👋 토큰 기반 로그아웃:', payload.username);

  // 토큰 기반에서는 단순히 성공 응답 (토큰 무효화는 클라이언트에서 삭제)
  return res.json({
    success: true,
    message: '로그아웃 완료'
  });
}

// 토큰 확인 (세션 확인 대신)
async function handleCheckSession(req, res) {
  // URL 파라미터 또는 Authorization 헤더에서 토큰 추출
  const authToken = req.query.authToken ||
                   (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));

  if (!authToken) {
    return res.status(400).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  const payload = verifyAuthToken(authToken);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않거나 만료된 토큰입니다.',
      authenticated: false
    });
  }

  return res.json({
    success: true,
    authenticated: true,
    user: {
      username: payload.username,
      loginTime: payload.loginTime,
      hasApiKey: payload.hasApiKey
    }
  });
}

// API 키 저장 (토큰 인증된 사용자만)
async function handleSaveApiKey(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'POST 요청만 허용됩니다.' });
  }

  const { authToken, apiKey } = req.body;

  if (!authToken || !apiKey) {
    return res.status(400).json({
      success: false,
      message: '인증 토큰과 API 키가 필요합니다.'
    });
  }

  const payload = verifyAuthToken(authToken);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: '인증되지 않은 요청입니다. 다시 로그인해주세요.'
    });
  }

  if (!apiKey.startsWith('sk-')) {
    return res.status(400).json({
      success: false,
      message: '유효한 OpenAI API 키 형식이 아닙니다.'
    });
  }

  // 🔐 API 키 저장 (토큰 기반 통합 저장소: GitHub + 환경변수)
  try {
    // 1. 환경변수에 설정 (즉시 사용 가능)
    process.env.OPENAI_API_KEY = apiKey;

    // 2. GitHub 보안 저장소에 영구 저장
    try {
      const { storeUserApiKey } = await import('./secure-api-storage.js');
      await storeUserApiKey(payload.username, apiKey);
      console.log('✅ GitHub 보안 저장소에 API 키 저장 완료');
    } catch (error) {
      console.warn('⚠️ GitHub 저장소 저장 실패 (환경변수는 유지):', error.message);
    }

    console.log('🔄 토큰 기반 통합 저장소 업데이트:', {
      환경변수: '✅ 저장됨',
      GitHub: '⏳ 시도됨',
      사용자: payload.username,
      새키: `${apiKey.substring(0, 4)}...`
    });

    // 3. OpenAI API 유효성 검증
    const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: '테스트' }],
        max_tokens: 5
      })
    });

    // 4. 토큰의 hasApiKey 상태 업데이트
    const updatedToken = updateTokenApiKeyStatus(authToken, true);

    if (testResponse.ok) {
      console.log('✅ 토큰 기반 API 키 저장 및 검증 완료:', payload.username, `${apiKey.substring(0, 4)}...`);

      return res.json({
        success: true,
        message: 'API 키가 성공적으로 저장되고 검증되었습니다.',
        validated: true,
        keyPreview: `${apiKey.substring(0, 4)}...`,
        authToken: updatedToken || authToken // 업데이트된 토큰 반환
      });
    } else {
      console.warn('⚠️ API 키 저장되었으나 검증 실패');
      return res.status(400).json({
        success: false,
        message: 'API 키는 저장되었지만 OpenAI 인증에 실패했습니다.',
        validated: false,
        authToken: updatedToken || authToken
      });
    }
  } catch (error) {
    console.error('❌ 토큰 기반 API 키 저장 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 저장 중 오류가 발생했습니다: ' + error.message,
      validated: false
    });
  }
}

// API 키 조회 (토큰 인증된 사용자만)
async function handleGetApiKey(req, res) {
  // URL 파라미터 또는 Authorization 헤더에서 토큰 추출
  const authToken = req.query.authToken ||
                   (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));

  if (!authToken) {
    return res.status(400).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  const payload = verifyAuthToken(authToken);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: '인증되지 않은 요청입니다.'
    });
  }

  // 🔍 통합 저장소에서 API 키 조회 (GitHub → 환경변수)
  try {
    let apiKey = null;
    let storageSource = 'none';

    // 1. GitHub 보안 저장소에서 조회
    try {
      const { getUserApiKey } = await import('./secure-api-storage.js');
      const keyData = await getUserApiKey(payload.username);
      if (keyData) {
        apiKey = keyData.apiKey;
        storageSource = 'github-encrypted';
        console.log('✅ GitHub 저장소에서 API 키 조회 성공');
      }
    } catch (error) {
      console.warn('⚠️ GitHub 저장소 조회 실패:', error.message);
    }

    // 2. 환경변수에서 fallback 조회
    if (!apiKey) {
      const envKey = process.env.OPENAI_API_KEY;
      if (envKey && envKey.startsWith('sk-')) {
        apiKey = envKey;
        storageSource = 'environment';
        console.log('✅ 환경변수에서 API 키 조회 성공');
      }
    }

    if (apiKey) {
      return res.json({
        success: true,
        hasApiKey: true,
        apiKey: apiKey,
        keyPreview: `${apiKey.substring(0, 4)}...`,
        storageSource,
        lastUpdated: new Date().toISOString()
      });
    } else {
      return res.json({
        success: true,
        hasApiKey: false,
        apiKey: null,
        keyPreview: null,
        storageSource: 'none'
      });
    }
  } catch (error) {
    console.error('❌ 토큰 기반 API 키 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// API 키 삭제 처리 (토큰 기반)
async function handleDeleteApiKey(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'POST 요청만 허용됩니다.' });
  }

  const { authToken } = req.body;

  if (!authToken) {
    return res.status(400).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  const payload = verifyAuthToken(authToken);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: '인증되지 않은 요청입니다.'
    });
  }

  try {
    // 🗑️ 통합 저장소에서 API 키 삭제
    // 1. GitHub 보안 저장소에서 삭제
    try {
      const { removeUserApiKey } = await import('./secure-api-storage.js');
      await removeUserApiKey(payload.username);
      console.log('✅ GitHub 저장소에서 API 키 삭제 완료');
    } catch (error) {
      console.warn('⚠️ GitHub 저장소 삭제 실패:', error.message);
    }

    // 2. 환경변수에서 제거
    delete process.env.OPENAI_API_KEY;

    // 3. 토큰의 hasApiKey 상태 업데이트
    const updatedToken = updateTokenApiKeyStatus(authToken, false);

    console.log('🗑️ 토큰 기반 API 키 삭제 완료:', payload.username);

    return res.json({
      success: true,
      message: 'API 키가 모든 저장소에서 삭제되었습니다.',
      authToken: updatedToken || authToken
    });
  } catch (error) {
    console.error('❌ 토큰 기반 API 키 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 활성 API 키 가져오기 (다른 API에서 사용) - 토큰 없이 통합 저장소 기반
export async function getActiveApiKey() {
  try {
    // 1. GitHub 보안 저장소에서 최신 API 키 확인
    try {
      const { getGlobalApiKey } = await import('./secure-api-storage.js');
      const githubKey = await getGlobalApiKey();

      if (githubKey) {
        console.log('🔑 admin-auth에서 GitHub 저장소 API 키 반환:', `${githubKey.substring(0, 4)}...`);
        return githubKey;
      }
    } catch (error) {
      console.warn('⚠️ GitHub 저장소 접근 실패:', error.message);
    }

    // 2. 환경변수에서 fallback
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey && envKey.startsWith('sk-')) {
      console.log('🔑 admin-auth에서 환경변수 API 키 반환:', `${envKey.substring(0, 4)}...`);
      return envKey;
    }

    console.log('❌ admin-auth에서 API 키 없음 (모든 저장소 확인함)');
    return null;

  } catch (error) {
    console.error('❌ admin-auth API 키 조회 오류:', error);

    // 오류 시에도 환경변수 확인
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey && envKey.startsWith('sk-')) {
      return envKey;
    }

    return null;
  }
}

// API 키 상태 확인 (다른 API에서 사용) - 토큰 기반 통합 저장소
export async function getAdminApiKeyStatus() {
  let hasActiveKey = false;
  let keyPreview = 'None';
  let latestActivity = null;
  let storageType = 'none';

  // 1. GitHub 저장소 확인
  try {
    const { getGlobalApiKey } = await import('./secure-api-storage.js');
    const githubKey = await getGlobalApiKey();

    if (githubKey) {
      hasActiveKey = true;
      keyPreview = `${githubKey.substring(0, 4)}...`;
      storageType = 'github-encrypted-storage';
      latestActivity = new Date(); // 현재 시간으로 설정
    }
  } catch (error) {
    console.warn('⚠️ GitHub 저장소 상태 확인 실패:', error.message);
  }

  // 2. 환경변수 확인 (GitHub에서 키가 없는 경우)
  if (!hasActiveKey) {
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey && envKey.startsWith('sk-')) {
      hasActiveKey = true;
      keyPreview = `${envKey.substring(0, 4)}...`;
      storageType = 'environment-variable';
    }
  }

  return {
    hasActiveKey,
    keyPreview,
    sessionCount: 0, // 토큰 기반에서는 세션 수 없음
    latestActivity: latestActivity ? latestActivity.toISOString() : null,
    hasEnvKey: !!process.env.OPENAI_API_KEY,
    storage: storageType,
    tokenBased: true, // 토큰 기반 시스템임을 표시
    unifiedSystem: true
  };
}

// 토큰 기반 시스템에서는 세션 정리가 필요 없음 (토큰이 만료 시간을 가지고 있음)
// 토큰은 24시간 후 자동 만료되며, 클라이언트에서 관리됨