// Secure API Key Storage for Vercel Environment
// Uses GitHub repository as persistent encrypted storage

import crypto from 'crypto';

// GitHub configuration for persistent storage
const GITHUB_CONFIG = {
  owner: 'EnmanyProject',
  repo: 'chatgame',
  branch: 'main',
  filePath: 'data/secure/api-keys.json'
};

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'default-key-change-in-production';

// GitHub Personal Access Token from environment (다양한 이름 지원)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ||
                     process.env.GITHUB_ACCESS_TOKEN ||
                     process.env.GITHUB_PAT ||
                     process.env.GH_TOKEN ||
                     process.env.VERCEL_GIT_COMMIT_REF; // Vercel 자동 생성 토큰도 시도

console.log('🔍 GitHub 토큰 확인:', {
  GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
  GITHUB_ACCESS_TOKEN: !!process.env.GITHUB_ACCESS_TOKEN,
  GITHUB_PAT: !!process.env.GITHUB_PAT,
  GH_TOKEN: !!process.env.GH_TOKEN,
  선택된토큰: GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 4)}...` : '없음'
});

/**
 * Encrypt API key with AES-256-CBC (simplified for Vercel)
 */
function encryptApiKey(apiKey) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ API 키 암호화 오류:', error);
    throw new Error('API 키 암호화 실패: ' + error.message);
  }
}

/**
 * Decrypt API key with AES-256-CBC (simplified for Vercel)
 */
function decryptApiKey(encryptedData) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = Buffer.from(encryptedData.iv, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('❌ API 키 복호화 오류:', error);
    throw new Error('API 키 복호화 실패: ' + error.message);
  }
}

/**
 * Get stored API keys from GitHub
 */
async function getStoredApiKeys() {
  console.log('🔍 getStoredApiKeys 함수 시작');
  console.log('🔍 GITHUB_TOKEN 상태:', {
    hasToken: !!GITHUB_TOKEN,
    tokenLength: GITHUB_TOKEN ? GITHUB_TOKEN.length : 0,
    tokenPreview: GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 4)}...` : 'None'
  });

  if (!GITHUB_TOKEN) {
    console.warn('⚠️ GitHub Token이 설정되지 않음 - 빈 객체 반환');
    return {};
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
    console.log('🔍 GitHub API 호출 URL:', url);

    console.log('🔍 GitHub API 요청 시작...');
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ChatGame-Admin'
      }
    });

    console.log('🔍 GitHub API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.status === 404) {
      console.log('📁 API 키 저장소 파일이 없음 (404) - 새로 생성 필요');
      return {};
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API 호출 실패 상세:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      throw new Error(`GitHub API 오류: ${response.status} ${response.statusText}`);
    }

    console.log('✅ GitHub API 응답 성공 - 데이터 파싱 시작');
    const data = await response.json();
    console.log('🔍 GitHub API 응답 데이터:', {
      hasContent: !!data.content,
      contentLength: data.content ? data.content.length : 0,
      sha: data.sha ? data.sha.substring(0, 8) + '...' : 'None'
    });

    const content = Buffer.from(data.content, 'base64').toString('utf8');
    console.log('🔍 Base64 디코딩 결과:', {
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...'
    });

    const parsedContent = JSON.parse(content);
    console.log('🔍 JSON 파싱 결과:', {
      keysCount: Object.keys(parsedContent).length,
      keys: Object.keys(parsedContent)
    });

    return parsedContent;
  } catch (error) {
    console.error('❌ GitHub에서 API 키 로드 전체 오류:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {};
  }
}

/**
 * Save API keys to GitHub
 */
async function saveApiKeysToGitHub(apiKeysData) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub Token이 설정되지 않음');
  }

  try {
    const content = JSON.stringify(apiKeysData, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');

    // Get current file SHA (if exists)
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;

    let sha = null;
    try {
      const getCurrentFile = await fetch(url, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ChatGame-Admin'
        }
      });

      if (getCurrentFile.ok) {
        const currentData = await getCurrentFile.json();
        sha = currentData.sha;
      }
    } catch (error) {
      console.log('📝 새 API 키 파일 생성');
    }

    // Create or update file
    const updatePayload = {
      message: `🔐 Secure API key storage update - ${new Date().toISOString()}`,
      content: encodedContent,
      branch: GITHUB_CONFIG.branch
    };

    if (sha) {
      updatePayload.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ChatGame-Admin'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub 저장 실패: ${response.status} - ${errorData.message}`);
    }

    console.log('✅ API 키가 GitHub에 안전하게 저장됨');
    return true;
  } catch (error) {
    console.error('❌ GitHub API 키 저장 오류:', error);
    throw error;
  }
}

/**
 * Store API key securely for a user
 */
export async function storeUserApiKey(username, apiKey) {
  try {
    console.log(`🔐 API 키 저장 시작: ${username}`);

    // Validate API key format
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('유효하지 않은 API 키 형식');
    }

    // Get current stored keys
    const apiKeys = await getStoredApiKeys();

    // Encrypt the API key
    const encryptedData = encryptApiKey(apiKey);

    // Store with user association
    apiKeys[username] = {
      ...encryptedData,
      lastUpdated: new Date().toISOString(),
      keyPreview: `${apiKey.substring(0, 4)}...${apiKey.substring(-4)}`
    };

    // Save to GitHub
    await saveApiKeysToGitHub(apiKeys);

    // Also set as current environment variable for immediate use
    process.env.OPENAI_API_KEY = apiKey;

    console.log(`✅ API 키 저장 완료: ${username} (${apiKeys[username].keyPreview})`);

    return {
      success: true,
      message: 'API 키가 안전하게 저장되었습니다',
      keyPreview: apiKeys[username].keyPreview
    };

  } catch (error) {
    console.error('❌ API 키 저장 실패:', error);
    throw error;
  }
}

/**
 * Retrieve API key for a user
 */
export async function getUserApiKey(username) {
  try {
    console.log(`🔍 API 키 조회: ${username}`);

    // Get stored keys from GitHub
    const apiKeys = await getStoredApiKeys();

    if (!apiKeys[username]) {
      console.log(`📝 ${username}의 저장된 API 키 없음`);
      return null;
    }

    // Decrypt the API key
    const apiKey = decryptApiKey(apiKeys[username]);

    // Set as environment variable for current session
    process.env.OPENAI_API_KEY = apiKey;

    console.log(`✅ API 키 조회 완료: ${username} (${apiKeys[username].keyPreview})`);

    return {
      apiKey: apiKey,
      keyPreview: apiKeys[username].keyPreview,
      lastUpdated: apiKeys[username].lastUpdated
    };

  } catch (error) {
    console.error('❌ API 키 조회 실패:', error);
    return null;
  }
}

/**
 * Remove API key for a user
 */
export async function removeUserApiKey(username) {
  try {
    console.log(`🗑️ API 키 삭제: ${username}`);

    const apiKeys = await getStoredApiKeys();

    if (!apiKeys[username]) {
      return { success: false, message: '삭제할 API 키가 없습니다' };
    }

    delete apiKeys[username];
    await saveApiKeysToGitHub(apiKeys);

    // Clear environment variable if it was this user's key
    const currentKey = process.env.OPENAI_API_KEY;
    if (currentKey) {
      const userKey = await getUserApiKey(username);
      if (userKey && userKey.apiKey === currentKey) {
        delete process.env.OPENAI_API_KEY;
      }
    }

    console.log(`✅ API 키 삭제 완료: ${username}`);

    return {
      success: true,
      message: 'API 키가 삭제되었습니다'
    };

  } catch (error) {
    console.error('❌ API 키 삭제 실패:', error);
    throw error;
  }
}

/**
 * Get global API key (for backward compatibility)
 * Returns the most recently updated API key
 */
export async function getGlobalApiKey() {
  console.log('🔍 secure-api-storage getGlobalApiKey 호출 시작');

  try {
    console.log('🔍 GitHub에서 저장된 API 키 조회 시작...');
    const apiKeys = await getStoredApiKeys();

    console.log('🔍 getStoredApiKeys 결과:', {
      keysCount: Object.keys(apiKeys).length,
      keys: Object.keys(apiKeys),
      hasKeys: Object.keys(apiKeys).length > 0
    });

    if (Object.keys(apiKeys).length === 0) {
      console.log('📝 저장된 API 키 없음 - 환경변수로 fallback');
      const envFallback = process.env.OPENAI_API_KEY || null;
      console.log('🔍 환경변수 fallback 결과:', {
        hasEnvKey: !!envFallback,
        envKeyPreview: envFallback ? envFallback.substring(0, 4) + '...' : 'None'
      });
      return envFallback;
    }

    // Find the most recently updated key
    let latestKey = null;
    let latestTime = 0;
    let latestUsername = null;

    console.log('🔍 최신 API 키 검색 중...');
    for (const [username, keyData] of Object.entries(apiKeys)) {
      console.log(`🔍 사용자 ${username} 키 데이터:`, {
        hasLastUpdated: !!keyData.lastUpdated,
        lastUpdated: keyData.lastUpdated,
        hasKeyPreview: !!keyData.keyPreview,
        keyPreview: keyData.keyPreview,
        hasEncrypted: !!keyData.encrypted
      });

      const updateTime = new Date(keyData.lastUpdated).getTime();
      if (updateTime > latestTime) {
        latestTime = updateTime;
        latestKey = keyData;
        latestUsername = username;
      }
    }

    console.log('🔍 최신 키 선택 결과:', {
      hasLatestKey: !!latestKey,
      latestUsername,
      latestTime: new Date(latestTime).toISOString()
    });

    if (latestKey) {
      console.log('🔓 API 키 복호화 시도...');
      try {
        const apiKey = decryptApiKey(latestKey);
        console.log('✅ API 키 복호화 성공:', {
          keyLength: apiKey ? apiKey.length : 0,
          keyFormat: apiKey && apiKey.startsWith('sk-') ? 'Valid OpenAI format' : 'Invalid format',
          keyPreview: apiKey && apiKey.startsWith('sk-') ? `${apiKey.substring(0, 4)}...` : 'Invalid'
        });

        process.env.OPENAI_API_KEY = apiKey;
        console.log('🔄 환경변수에 API 키 설정 완료');

        console.log(`🔑 전역 API 키 설정 완료: ${latestKey.keyPreview}`);
        return apiKey;
      } catch (decryptError) {
        console.error('❌ API 키 복호화 실패:', {
          message: decryptError.message,
          stack: decryptError.stack
        });
        return process.env.OPENAI_API_KEY || null;
      }
    }

    console.log('❌ 유효한 최신 키를 찾지 못함');
    return process.env.OPENAI_API_KEY || null;

  } catch (error) {
    console.error('❌ 전역 API 키 조회 전체 오류:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    const envFallback = process.env.OPENAI_API_KEY || null;
    console.log('🔄 오류 시 환경변수 fallback:', {
      hasEnvKey: !!envFallback,
      envKeyPreview: envFallback ? envFallback.substring(0, 4) + '...' : 'None'
    });
    return envFallback;
  }
}

/**
 * Test API key validity
 */
export async function testApiKey(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    return {
      valid: response.ok,
      status: response.status,
      statusText: response.statusText
    };

  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}