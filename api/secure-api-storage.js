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

// GitHub Personal Access Token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Encrypt API key with AES-256-GCM
 */
function encryptApiKey(apiKey) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ API 키 암호화 오류:', error);
    throw new Error('API 키 암호화 실패');
  }
}

/**
 * Decrypt API key with AES-256-GCM
 */
function decryptApiKey(encryptedData) {
  try {
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('❌ API 키 복호화 오류:', error);
    throw new Error('API 키 복호화 실패');
  }
}

/**
 * Get stored API keys from GitHub
 */
async function getStoredApiKeys() {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️ GitHub Token이 설정되지 않음');
    return {};
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ChatGame-Admin'
      }
    });

    if (response.status === 404) {
      console.log('📁 API 키 저장소 파일이 없음, 새로 생성');
      return {};
    }

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');

    return JSON.parse(content);
  } catch (error) {
    console.error('❌ GitHub에서 API 키 로드 오류:', error);
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
  try {
    const apiKeys = await getStoredApiKeys();

    if (Object.keys(apiKeys).length === 0) {
      console.log('📝 저장된 API 키 없음');
      return process.env.OPENAI_API_KEY || null;
    }

    // Find the most recently updated key
    let latestKey = null;
    let latestTime = 0;

    for (const [username, keyData] of Object.entries(apiKeys)) {
      const updateTime = new Date(keyData.lastUpdated).getTime();
      if (updateTime > latestTime) {
        latestTime = updateTime;
        latestKey = keyData;
      }
    }

    if (latestKey) {
      const apiKey = decryptApiKey(latestKey);
      process.env.OPENAI_API_KEY = apiKey;

      console.log(`🔑 전역 API 키 설정 완료: ${latestKey.keyPreview}`);
      return apiKey;
    }

    return process.env.OPENAI_API_KEY || null;

  } catch (error) {
    console.error('❌ 전역 API 키 조회 오류:', error);
    return process.env.OPENAI_API_KEY || null;
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