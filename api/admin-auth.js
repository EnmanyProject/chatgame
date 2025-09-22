// 어드민 인증 API - 로그인 기반 API 키 관리
import crypto from 'crypto';

// 간단한 사용자 저장소 (실제로는 데이터베이스나 안전한 저장소 사용)
const adminUsers = {
  'admin': {
    password: 'chatgame2025', // 실제로는 해시된 비밀번호
    apiKey: null,
    lastLogin: null,
    sessions: new Set()
  }
};

// 세션 저장소
const activeSessions = new Map();

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

// 로그인 처리
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

  // 세션 생성
  const sessionId = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    username,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    apiKey: user.apiKey
  };

  activeSessions.set(sessionId, sessionData);
  user.sessions.add(sessionId);
  user.lastLogin = new Date().toISOString();

  console.log('✅ 로그인 성공:', username, 'Session:', sessionId.substring(0, 8) + '...');

  return res.json({
    success: true,
    message: '로그인 성공',
    sessionId,
    user: {
      username,
      hasApiKey: !!user.apiKey,
      lastLogin: user.lastLogin
    }
  });
}

// 로그아웃 처리
async function handleLogout(req, res) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: '세션 ID가 필요합니다.'
    });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: '유효하지 않은 세션입니다.'
    });
  }

  // 세션 제거
  activeSessions.delete(sessionId);
  const user = adminUsers[session.username];
  if (user) {
    user.sessions.delete(sessionId);
  }

  console.log('👋 로그아웃:', session.username);

  return res.json({
    success: true,
    message: '로그아웃 완료'
  });
}

// 세션 확인
async function handleCheckSession(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: '세션 ID가 필요합니다.'
    });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: '유효하지 않은 세션입니다.',
      authenticated: false
    });
  }

  // 세션 활동 시간 업데이트
  session.lastActivity = new Date().toISOString();

  return res.json({
    success: true,
    authenticated: true,
    user: {
      username: session.username,
      loginTime: session.loginTime,
      hasApiKey: !!session.apiKey
    }
  });
}

// API 키 저장 (인증된 사용자만)
async function handleSaveApiKey(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'POST 요청만 허용됩니다.' });
  }

  const { sessionId, apiKey } = req.body;

  if (!sessionId || !apiKey) {
    return res.status(400).json({
      success: false,
      message: '세션 ID와 API 키가 필요합니다.'
    });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(401).json({
      success: false,
      message: '인증되지 않은 요청입니다.'
    });
  }

  if (!apiKey.startsWith('sk-')) {
    return res.status(400).json({
      success: false,
      message: '유효한 OpenAI API 키 형식이 아닙니다.'
    });
  }

  // API 키 저장
  const user = adminUsers[session.username];
  user.apiKey = apiKey;
  session.apiKey = apiKey;

  // OpenAI API 유효성 검증
  try {
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

    if (testResponse.ok) {
      console.log('✅ API 키 저장 및 검증 완료:', session.username, apiKey.substring(0, 4) + '...');

      return res.json({
        success: true,
        message: 'API 키가 성공적으로 저장되고 검증되었습니다.',
        validated: true
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'API 키는 저장되었지만 OpenAI 인증에 실패했습니다.',
        validated: false
      });
    }
  } catch (error) {
    console.warn('⚠️ API 키 검증 실패:', error.message);
    return res.json({
      success: true,
      message: 'API 키가 저장되었지만 검증 중 오류가 발생했습니다.',
      validated: false,
      error: error.message
    });
  }
}

// API 키 조회 (인증된 사용자만)
async function handleGetApiKey(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: '세션 ID가 필요합니다.'
    });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(401).json({
      success: false,
      message: '인증되지 않은 요청입니다.'
    });
  }

  return res.json({
    success: true,
    hasApiKey: !!session.apiKey,
    apiKey: session.apiKey || null,
    keyPreview: session.apiKey ? `${session.apiKey.substring(0, 4)}...` : null
  });
}

// 활성 API 키 가져오기 (다른 API에서 사용)
export function getActiveApiKey() {
  // 가장 최근에 활동한 세션의 API 키 반환
  let latestSession = null;
  let latestTime = 0;

  for (const session of activeSessions.values()) {
    const activityTime = new Date(session.lastActivity).getTime();
    if (activityTime > latestTime && session.apiKey) {
      latestTime = activityTime;
      latestSession = session;
    }
  }

  return latestSession?.apiKey || null;
}

// 세션 정리 (1시간 비활성 세션 제거)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  for (const [sessionId, session] of activeSessions.entries()) {
    const lastActivity = new Date(session.lastActivity).getTime();
    if (now - lastActivity > oneHour) {
      console.log('🧹 비활성 세션 제거:', session.username, sessionId.substring(0, 8) + '...');
      activeSessions.delete(sessionId);

      const user = adminUsers[session.username];
      if (user) {
        user.sessions.delete(sessionId);
      }
    }
  }
}, 5 * 60 * 1000); // 5분마다 정리