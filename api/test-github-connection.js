// GitHub 연결 테스트 API
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-github-token');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log('🧪 GitHub 연결 테스트 시작...');

    try {
        // 테스트용 토큰 확인
        const testToken = req.headers['x-github-token'] || process.env.GITHUB_TOKEN;

        if (!testToken) {
            return res.status(400).json({
                success: false,
                error: 'GitHub Token이 필요합니다',
                instructions: {
                    step1: 'GitHub.com → Settings → Developer settings → Personal access tokens',
                    step2: 'Generate new token (classic)',
                    step3: 'Select scope: repo (Full control)',
                    step4: 'Copy token and use in header: x-github-token'
                }
            });
        }

        // GitHub API 연결 테스트
        console.log(`🔐 토큰 테스트: ${testToken.substring(0, 8)}...`);

        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${testToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'ChatGame-Test'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({
                success: false,
                error: `GitHub API 오류: ${response.status}`,
                details: errorData.message || 'Unknown error',
                suggestions: [
                    '토큰이 유효한지 확인하세요',
                    'repo 권한이 설정되어 있는지 확인하세요',
                    '토큰이 만료되지 않았는지 확인하세요'
                ]
            });
        }

        const userData = await response.json();

        // 저장소 접근 테스트
        const repoResponse = await fetch('https://api.github.com/repos/EnmanyProject/chatgame', {
            headers: {
                'Authorization': `token ${testToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'ChatGame-Test'
            }
        });

        if (!repoResponse.ok) {
            return res.status(repoResponse.status).json({
                success: false,
                error: '저장소 접근 실패',
                details: `HTTP ${repoResponse.status}: chatgame 저장소에 접근할 수 없습니다`,
                suggestions: [
                    '저장소가 존재하는지 확인하세요',
                    '토큰에 저장소 접근 권한이 있는지 확인하세요'
                ]
            });
        }

        const repoData = await repoResponse.json();

        // 성공 응답
        return res.json({
            success: true,
            message: '✅ GitHub 연결 테스트 성공!',
            user: {
                login: userData.login,
                name: userData.name,
                id: userData.id
            },
            repository: {
                name: repoData.name,
                full_name: repoData.full_name,
                private: repoData.private,
                permissions: repoData.permissions
            },
            rateLimit: {
                remaining: response.headers.get('x-ratelimit-remaining'),
                total: response.headers.get('x-ratelimit-limit'),
                reset: new Date(parseInt(response.headers.get('x-ratelimit-reset')) * 1000)
            },
            nextSteps: [
                '1. Vercel 환경변수에 GITHUB_TOKEN 설정',
                '2. 관리 페이지에서 데이터 관리 테스트',
                '3. 캐릭터/시나리오 생성 테스트'
            ]
        });

    } catch (error) {
        console.error('❌ GitHub 연결 테스트 실패:', error);
        return res.status(500).json({
            success: false,
            error: 'GitHub 연결 테스트 실패',
            details: error.message,
            troubleshooting: [
                '네트워크 연결을 확인하세요',
                'GitHub 서비스 상태를 확인하세요',
                'API 토큰이 올바른지 확인하세요'
            ]
        });
    }
}