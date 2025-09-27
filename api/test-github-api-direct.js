// GitHub API 직접 테스트
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GitHub 설정
    const GITHUB_CONFIG = {
      owner: 'EnmanyProject',
      repo: 'chatgame',
      branch: 'main',
      filePath: 'data/secure/api-keys.json'
    };

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    console.log('🔍 GitHub 직접 API 테스트 시작');
    console.log('🔍 GITHUB_TOKEN 상태:', {
      hasToken: !!GITHUB_TOKEN,
      tokenLength: GITHUB_TOKEN ? GITHUB_TOKEN.length : 0,
      tokenPreview: GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 4)}...` : 'None'
    });

    if (!GITHUB_TOKEN) {
      return res.json({
        success: false,
        message: 'GitHub Token이 설정되지 않음',
        step: 'token_check'
      });
    }

    // GitHub API 직접 호출
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
    console.log('🔍 GitHub API URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ChatGame-Admin'
      }
    });

    console.log('🔍 GitHub API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.status === 404) {
      return res.json({
        success: false,
        message: 'API 키 파일이 GitHub에 존재하지 않음 (404)',
        step: 'file_not_found',
        url: url
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API 오류:', errorText);
      return res.json({
        success: false,
        message: `GitHub API 오류: ${response.status}`,
        step: 'github_api_error',
        error: errorText,
        url: url
      });
    }

    const data = await response.json();
    console.log('🔍 GitHub 응답 데이터:', {
      hasContent: !!data.content,
      contentLength: data.content ? data.content.length : 0,
      sha: data.sha
    });

    // Base64 디코딩
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    console.log('🔍 디코딩된 내용 미리보기:', content.substring(0, 200));

    // JSON 파싱
    const apiKeysData = JSON.parse(content);
    console.log('🔍 파싱된 API 키 데이터:', {
      keysCount: Object.keys(apiKeysData).length,
      usernames: Object.keys(apiKeysData)
    });

    // 복호화 테스트
    const { decryptApiKey } = await import('./secure-api-storage.js');

    let decryptionResults = {};
    for (const [username, keyData] of Object.entries(apiKeysData)) {
      console.log(`🔓 ${username} 키 복호화 시도...`);
      try {
        const decryptedKey = decryptApiKey(keyData);
        decryptionResults[username] = {
          success: true,
          keyLength: decryptedKey ? decryptedKey.length : 0,
          keyFormat: decryptedKey && decryptedKey.startsWith('sk-') ? 'Valid' : 'Invalid',
          keyPreview: decryptedKey && decryptedKey.startsWith('sk-') ? `${decryptedKey.substring(0, 4)}...` : 'Invalid'
        };
        console.log(`✅ ${username} 복호화 성공`);
      } catch (decryptError) {
        console.error(`❌ ${username} 복호화 실패:`, decryptError.message);
        decryptionResults[username] = {
          success: false,
          error: decryptError.message
        };
      }
    }

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      github_file_access: {
        file_exists: true,
        content_length: content.length,
        users_count: Object.keys(apiKeysData).length
      },
      decryption_results: decryptionResults,
      environment_status: {
        hasGithubToken: !!GITHUB_TOKEN,
        hasEncryptionKey: !!process.env.API_ENCRYPTION_KEY,
        hasAdminSecret: !!process.env.ADMIN_SECRET
      }
    });

  } catch (error) {
    console.error('❌ GitHub 직접 테스트 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'GitHub 직접 테스트 실패',
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}