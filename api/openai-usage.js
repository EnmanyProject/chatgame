// OpenAI API 사용량 확인 API
import { getGlobalApiKey } from './save-api-key.js';
import { getActiveApiKey } from './admin-auth.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        const apiKey = getActiveApiKey() || getGlobalApiKey();

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'OpenAI API 키가 설정되지 않았습니다.'
            });
        }

        console.log('📊 OpenAI 사용량 확인 시작...');

        // OpenAI API 사용량 확인 (현재 API는 직접 사용량 조회를 제공하지 않음)
        // 대신 API 키 유효성과 계정 정보를 확인
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({
                success: false,
                message: 'OpenAI API 연결 실패',
                error: errorData.error?.message || 'Unknown error'
            });
        }

        const data = await response.json();
        const availableModels = data.data || [];

        // 사용 가능한 모델 분석
        const gptModels = availableModels.filter(model =>
            model.id.includes('gpt') || model.id.includes('text-davinci')
        );

        const imageModels = availableModels.filter(model =>
            model.id.includes('dall-e')
        );

        // 요청 헤더에서 사용량 정보 확인 (제한적)
        const remainingRequests = response.headers.get('x-ratelimit-remaining-requests');
        const remainingTokens = response.headers.get('x-ratelimit-remaining-tokens');
        const limitRequests = response.headers.get('x-ratelimit-limit-requests');
        const limitTokens = response.headers.get('x-ratelimit-limit-tokens');

        console.log('✅ OpenAI 사용량 확인 완료');

        return res.json({
            success: true,
            message: 'OpenAI API 사용량 확인 완료',
            data: {
                apiStatus: 'connected',
                keyPreview: `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`,
                totalModels: availableModels.length,
                gptModels: gptModels.length,
                imageModels: imageModels.length,
                rateLimit: {
                    remainingRequests: remainingRequests || 'Unknown',
                    remainingTokens: remainingTokens || 'Unknown',
                    limitRequests: limitRequests || 'Unknown',
                    limitTokens: limitTokens || 'Unknown'
                },
                availableModels: gptModels.slice(0, 5).map(model => model.id), // 상위 5개만
                lastChecked: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ OpenAI 사용량 확인 오류:', error);
        return res.status(500).json({
            success: false,
            message: 'OpenAI API 사용량 확인 중 오류가 발생했습니다.',
            error: error.message
        });
    }
}