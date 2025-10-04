/**
 * AI Response Engine API
 * @description 유저 입력 판단 및 캐릭터 응답 생성 (GPT-4/Claude/Llama 지원)
 * @version 2.0.0
 */

export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({success: false, error: 'Method not allowed'});
    }

    try {
        const {character_id, user_input, choice_value, engine = 'gpt4'} = req.body;

        console.log(`[AI 엔진] 요청 - 캐릭터: ${character_id}, 엔진: ${engine}`);

        // 캐릭터 정보 로드
        const character = await loadCharacter(character_id);
        if (!character) {
            return res.status(404).json({success: false, error: '캐릭터를 찾을 수 없습니다'});
        }

        // AI 엔진 선택
        let response;
        switch (engine) {
            case 'gpt4':
                response = await judgeWithGPT4(user_input, character, choice_value);
                break;
            case 'claude':
                response = await judgeWithClaude(user_input, character, choice_value);
                break;
            case 'llama':
                response = await judgeWithLlama(user_input, character, choice_value);
                break;
            default:
                response = await getFallbackResponse(user_input, character, choice_value);
        }

        return res.status(200).json({
            success: true,
            response: response.text,
            affection_change: response.affection_change,
            mood_change: response.mood_change,
            engine_used: engine
        });

    } catch (error) {
        console.error('[AI 엔진 에러]', error);
        
        // 폴백 응답
        const fallback = getFallbackResponse(req.body.user_input, null, req.body.choice_value);
        
        return res.status(200).json({
            success: true,
            response: fallback.text,
            affection_change: fallback.affection_change,
            mood_change: fallback.mood_change,
            engine_used: 'fallback'
        });
    }
}

/**
 * 캐릭터 정보 로드
 */
async function loadCharacter(character_id) {
    try {
        const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/character-ai-generator?action=list_characters`);
        const result = await response.json();
        
        if (result.success) {
            const characters = result.data.characters || result.data || [];
            return characters.find(c => c.id === character_id);
        }
    } catch (error) {
        console.error('캐릭터 로드 실패:', error);
    }
    
    return null;
}

/**
 * GPT-4 판단
 */
async function judgeWithGPT4(user_input, character, choice_value) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
        console.warn('OpenAI API 키 없음, 폴백 사용');
        return getFallbackResponse(user_input, character, choice_value);
    }

    const characterName = character?.basic_info?.name || '캐릭터';
    const mbti = character?.basic_info?.mbti || 'INFP';
    const personality = character?.personality_traits?.join(', ') || '감성적, 따뜻함';

    const systemPrompt = `당신은 ${characterName}입니다.
- MBTI: ${mbti}
- 성격: ${personality}
- 말투: 부드럽고 따뜻하며, 이모티콘을 자주 사용합니다.
- 역할: 연애 시뮬레이션 게임의 캐릭터로서 유저와 자연스러운 대화를 합니다.

유저의 응답을 평가하고 적절한 반응을 보이세요:
- 긍정적 응답: 기쁘고 호감있는 반응
- 중립적 응답: 자연스러운 대화 지속
- 부정적 응답: 약간 실망하거나 서운한 반응

200자 이내로 자연스럽게 답변하세요.`;

    const userPrompt = `유저가 "${user_input}"라고 말했습니다. ${characterName}로서 자연스럽게 반응해주세요.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {role: 'system', content: systemPrompt},
                    {role: 'user', content: userPrompt}
                ],
                max_tokens: 300,
                temperature: 0.8
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const aiText = data.choices[0].message.content.trim();
            
            // 감정 분석으로 점수 계산
            const affection_change = analyzeAffection(user_input, choice_value);
            
            return {
                text: aiText,
                affection_change,
                mood_change: affection_change
            };
        }
    } catch (error) {
        console.error('GPT-4 호출 실패:', error);
    }

    return getFallbackResponse(user_input, character, choice_value);
}

/**
 * Claude 판단
 */
async function judgeWithClaude(user_input, character, choice_value) {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
        console.warn('Anthropic API 키 없음, 폴백 사용');
        return getFallbackResponse(user_input, character, choice_value);
    }

    const characterName = character?.basic_info?.name || '캐릭터';
    const mbti = character?.basic_info?.mbti || 'INFP';
    const personality = character?.personality_traits?.join(', ') || '감성적, 따뜻함';

    const prompt = `당신은 ${characterName}입니다. (MBTI: ${mbti}, 성격: ${personality})

유저가 "${user_input}"라고 말했을 때, ${characterName}로서 자연스럽게 반응해주세요.
부드럽고 따뜻한 말투로, 이모티콘을 적절히 사용하며 200자 이내로 답변하세요.`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 300,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        const data = await response.json();
        
        if (data.content && data.content[0]) {
            const aiText = data.content[0].text.trim();
            const affection_change = analyzeAffection(user_input, choice_value);
            
            return {
                text: aiText,
                affection_change,
                mood_change: affection_change
            };
        }
    } catch (error) {
        console.error('Claude 호출 실패:', error);
    }

    return getFallbackResponse(user_input, character, choice_value);
}

/**
 * Llama 판단
 */
async function judgeWithLlama(user_input, character, choice_value) {
    // Llama API 구현 (추후 추가)
    console.log('Llama 엔진은 준비 중입니다.');
    return getFallbackResponse(user_input, character, choice_value);
}

/**
 * 호감도 분석 (간단한 룰 기반)
 */
function analyzeAffection(user_input, choice_value) {
    const text = user_input.toLowerCase();
    
    // 긍정 키워드
    const positiveKeywords = ['좋', '예쁘', '귀엽', '사랑', '고마', '최고', '행복', '완벽', '멋지'];
    const positiveCount = positiveKeywords.filter(k => text.includes(k)).length;
    
    // 부정 키워드
    const negativeKeywords = ['싫', '별로', '안 좋', '이상', '그만', '짜증', '화나'];
    const negativeCount = negativeKeywords.filter(k => text.includes(k)).length;
    
    // 선택지 기반 점수
    const choiceScores = {
        'good': +2,
        'normal': 0,
        'tired': +1,
        'text_input': positiveCount > 0 ? +1 : (negativeCount > 0 ? -1 : 0)
    };
    
    return choiceScores[choice_value] || 0;
}

/**
 * 폴백 응답 (AI 실패 시)
 */
function getFallbackResponse(user_input, character, choice_value) {
    const responses = {
        'good': {
            text: '그렇구나! 좋은 하루 보내셨다니 저도 기분이 좋아요 😊 어떤 좋은 일이 있었어요?',
            affection_change: +2,
            mood_change: +2
        },
        'normal': {
            text: '그래도 무사히 하루 마무리하셨네요! 고생하셨어요~ 오늘 저녁은 드셨어요?',
            affection_change: 0,
            mood_change: 0
        },
        'tired': {
            text: '오늘 많이 힘드셨나봐요ㅠㅠ 괜찮으세요? 푹 쉬시고 내일은 좋은 일만 있길 바랄게요!',
            affection_change: +1,
            mood_change: +1
        },
        'text_input': {
            text: '그렇군요! 재미있는 얘기네요~ 더 들려주세요 😊',
            affection_change: 0,
            mood_change: 0
        }
    };
    
    return responses[choice_value] || responses.text_input;
}
