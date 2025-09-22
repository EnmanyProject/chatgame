// GitHub API 기반 통합 데이터 관리 시스템
// 모든 데이터 CRUD 작업을 GitHub Repository를 통해 수행

const GITHUB_CONFIG = {
    owner: 'EnmanyProject',
    repo: 'chatgame',
    branch: 'main',
    basePath: 'data',
    endpoints: {
        characters: 'data/characters.json',
        scenarios: 'data/scenarios/scenario-database.json',
        episodes: 'data/episodes/episode-database.json'
    }
};

export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-github-token');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, type } = req.query;
    console.log(`🌐 GitHub 데이터 관리 요청: ${req.method} ${action} ${type}`);

    try {
        // GitHub Token 확인
        const githubToken = getGitHubToken(req);
        if (!githubToken) {
            return res.status(401).json({
                error: 'GitHub Token 필요',
                message: '환경변수 GITHUB_TOKEN 또는 헤더 x-github-token이 필요합니다'
            });
        }

        switch (action) {
            case 'load':
                return await handleLoad(req, res, githubToken, type);
            case 'save':
                return await handleSave(req, res, githubToken, type);
            case 'delete':
                return await handleDelete(req, res, githubToken, type);
            case 'list':
                return await handleList(req, res, githubToken, type);
            case 'reset':
                return await handleReset(req, res, githubToken, type);
            default:
                return res.status(400).json({ error: '지원하지 않는 액션입니다' });
        }
    } catch (error) {
        console.error('❌ GitHub 데이터 관리 오류:', error);
        return res.status(500).json({
            error: 'GitHub API 오류',
            message: error.message,
            details: error.response?.data || error
        });
    }
}

// GitHub Token 획득 (환경변수 우선, 헤더 보조)
function getGitHubToken(req) {
    return process.env.GITHUB_TOKEN || req.headers['x-github-token'];
}

// 데이터 로드 (GET)
async function handleLoad(req, res, githubToken, type) {
    const { id } = req.query;
    console.log(`📥 GitHub에서 ${type} 데이터 로드 (ID: ${id})`);

    try {
        const endpoint = GITHUB_CONFIG.endpoints[type];
        if (!endpoint) {
            return res.status(400).json({ error: `지원하지 않는 데이터 타입: ${type}` });
        }

        const fileData = await getGitHubFile(githubToken, endpoint);

        if (id) {
            // 특정 ID 데이터 반환
            const itemData = fileData[type] && fileData[type][id];
            if (!itemData) {
                return res.status(404).json({ error: `${type} ID ${id}를 찾을 수 없습니다` });
            }
            return res.json({
                success: true,
                data: itemData,
                source: 'github'
            });
        } else {
            // 전체 데이터 반환
            return res.json({
                success: true,
                data: fileData[type] || {},
                count: Object.keys(fileData[type] || {}).length,
                source: 'github'
            });
        }
    } catch (error) {
        console.error(`❌ ${type} 로드 실패:`, error);
        return res.status(500).json({ error: `${type} 로드 실패: ${error.message}` });
    }
}

// 데이터 저장 (POST/PUT)
async function handleSave(req, res, githubToken, type) {
    const { id } = req.query;
    const newData = req.body;

    console.log(`💾 GitHub에 ${type} 데이터 저장 (ID: ${id})`);
    console.log('저장할 데이터:', JSON.stringify(newData, null, 2));

    try {
        const endpoint = GITHUB_CONFIG.endpoints[type];
        if (!endpoint) {
            return res.status(400).json({ error: `지원하지 않는 데이터 타입: ${type}` });
        }

        // 1. 현재 파일 데이터 로드
        const currentFileData = await getGitHubFile(githubToken, endpoint);

        // 2. 데이터 구조 초기화
        if (!currentFileData[type]) {
            currentFileData[type] = {};
        }

        // 3. 새 데이터 추가/수정
        const itemId = id || newData.id || `${type}_${Date.now()}`;
        const updatedItem = {
            ...newData,
            id: itemId,
            updated_at: new Date().toISOString(),
            source: 'github_api'
        };

        currentFileData[type][itemId] = updatedItem;

        // 4. GitHub에 커밋
        const commitMessage = id ?
            `Update ${type}: ${itemId}` :
            `Add new ${type}: ${itemId}`;

        await commitToGitHub(githubToken, endpoint, currentFileData, commitMessage);

        console.log(`✅ ${type} 저장 완료: ${itemId}`);
        return res.json({
            success: true,
            id: itemId,
            data: updatedItem,
            message: `${type} 저장 완료`,
            source: 'github'
        });

    } catch (error) {
        console.error(`❌ ${type} 저장 실패:`, error);
        return res.status(500).json({ error: `${type} 저장 실패: ${error.message}` });
    }
}

// 데이터 삭제 (DELETE)
async function handleDelete(req, res, githubToken, type) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: '삭제할 ID가 필요합니다' });
    }

    console.log(`🗑️ GitHub에서 ${type} 삭제 (ID: ${id})`);

    try {
        const endpoint = GITHUB_CONFIG.endpoints[type];
        const currentFileData = await getGitHubFile(githubToken, endpoint);

        if (!currentFileData[type] || !currentFileData[type][id]) {
            return res.status(404).json({ error: `${type} ID ${id}를 찾을 수 없습니다` });
        }

        // 데이터 삭제
        delete currentFileData[type][id];

        // GitHub에 커밋
        await commitToGitHub(githubToken, endpoint, currentFileData, `Delete ${type}: ${id}`);

        console.log(`✅ ${type} 삭제 완료: ${id}`);
        return res.json({
            success: true,
            message: `${type} ${id} 삭제 완료`,
            source: 'github'
        });

    } catch (error) {
        console.error(`❌ ${type} 삭제 실패:`, error);
        return res.status(500).json({ error: `${type} 삭제 실패: ${error.message}` });
    }
}

// 목록 조회 (GET)
async function handleList(req, res, githubToken, type) {
    console.log(`📋 GitHub에서 ${type} 목록 조회`);

    try {
        const endpoint = GITHUB_CONFIG.endpoints[type];
        const fileData = await getGitHubFile(githubToken, endpoint);

        const items = fileData[type] || {};
        const itemList = Object.values(items).map(item => ({
            id: item.id,
            name: item.name || item.title || item.id,
            created_at: item.created_at || item.updated_at,
            type: type
        }));

        return res.json({
            success: true,
            items: itemList,
            count: itemList.length,
            source: 'github'
        });

    } catch (error) {
        console.error(`❌ ${type} 목록 조회 실패:`, error);
        return res.status(500).json({ error: `${type} 목록 조회 실패: ${error.message}` });
    }
}

// GitHub API: 파일 내용 가져오기
async function getGitHubFile(token, filePath) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;

    console.log(`📥 GitHub 파일 요청: ${url}`);

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ChatGame-Admin'
        }
    });

    if (response.status === 404) {
        // 파일이 없으면 빈 구조 반환
        console.log(`📭 파일 없음, 빈 구조 생성: ${filePath}`);
        return {};
    }

    if (!response.ok) {
        throw new Error(`GitHub API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));

    console.log(`✅ GitHub 파일 로드 성공: ${filePath}`);
    return { ...content, _sha: data.sha };
}

// GitHub API: 파일 커밋
async function commitToGitHub(token, filePath, content, message) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;

    // 현재 SHA 가져오기 (파일 업데이트용)
    const currentSha = content._sha;
    delete content._sha; // SHA는 커밋할 내용에서 제거

    const body = {
        message: `${message} 🤖 [ChatGame Admin]`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        branch: GITHUB_CONFIG.branch
    };

    // 파일이 존재하면 SHA 포함
    if (currentSha) {
        body.sha = currentSha;
    }

    console.log(`📤 GitHub 커밋: ${url}`);
    console.log(`📝 메시지: ${message}`);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'ChatGame-Admin'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub 커밋 실패: ${response.status} - ${errorData.message}`);
    }

    const result = await response.json();
    console.log(`✅ GitHub 커밋 성공: ${result.commit.sha}`);
    return result;
}

// 데이터 완전 초기화 (POST)
async function handleReset(req, res, githubToken, type) {
    console.log(`🗑️ ${type} 데이터 완전 초기화 시작`);

    try {
        const endpoint = GITHUB_CONFIG.endpoints[type];
        if (!endpoint) {
            return res.status(400).json({ error: `지원하지 않는 데이터 타입: ${type}` });
        }

        // 현재 파일 데이터 로드
        const currentFileData = await getGitHubFile(githubToken, endpoint);

        // 완전 초기화: 빈 객체로 설정
        currentFileData[type] = {};
        currentFileData.metadata = currentFileData.metadata || {};
        currentFileData.metadata.reset_at = new Date().toISOString();
        currentFileData.metadata.reset_reason = `Clean ${type} data reset`;

        // GitHub에 커밋
        await commitToGitHub(githubToken, endpoint, currentFileData, `Reset all ${type} data - Clean slate`);

        console.log(`✅ ${type} 데이터 완전 초기화 완료`);
        return res.json({
            success: true,
            message: `${type} 데이터가 완전히 초기화되었습니다`,
            reset_at: currentFileData.metadata.reset_at
        });

    } catch (error) {
        console.error(`❌ ${type} 데이터 초기화 실패:`, error);
        return res.status(500).json({
            error: `${type} 데이터 초기화 실패`,
            message: error.message
        });
    }
}