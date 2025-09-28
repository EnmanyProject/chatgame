// 에피소드 테스트 API - OpenAI GPT 기반 대화 생성
module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🎯 Episode Test API 호출:', {
      method: req.method,
      action: req.body?.action,
      character_id: req.body?.character_id,
      difficulty: req.body?.difficulty
    });

    if (req.method === 'POST' && req.body?.action === 'generate') {
      const { character_id, user_prompt, difficulty } = req.body;

      console.log(`🎭 ${character_id}의 ${difficulty} 난이도 대화 생성:`, user_prompt);

      // OpenAI API 키 확인
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        console.error('❌ OpenAI API 키가 환경변수에 없음');
        return res.status(200).json({
          success: false,
          message: 'OpenAI API 키가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.',
          error: 'OPENAI_API_KEY_MISSING',
          disabled: true
        });
      }

      try {
        // OpenAI API 호출로 대화 생성
        const aiResponse = await generateDialogueWithOpenAI(character_id, user_prompt, difficulty, openaiApiKey);

        return res.status(200).json({
          success: true,
          data: aiResponse,
          message: 'AI 대화 생성 완료',
          generated_at: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ OpenAI API 호출 실패:', error);
        return res.status(200).json({
          success: false,
          message: `AI 대화 생성 실패: ${error.message}`,
          error: 'OPENAI_API_ERROR',
          details: {
            character_id,
            difficulty,
            user_prompt: user_prompt?.substring(0, 50) + '...'
          }
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid request format'
    });

  } catch (error) {
    console.error('❌ Episode Test API 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 오류: ' + error.message
    });
  }
};

// OpenAI API를 사용한 대화 생성 함수
async function generateDialogueWithOpenAI(characterId, userPrompt, difficulty, apiKey) {
  console.log('🤖 OpenAI API 호출 시작...');

  // 캐릭터별 성격 설정
  const characterProfiles = {
    'yuna_infp': {
      name: '윤아',
      personality: '감성적, 내향적, 이상주의적인 INFP 성격',
      traits: '부드럽고 따뜻한 말투, 감정 표현이 풍부, 예술과 문학을 좋아함',
      speech_style: '이모티콘을 자주 사용하고, 섬세한 감정 표현'
    },
    'mina_enfp': {
      name: '미나',
      personality: '외향적, 열정적, 창의적인 ENFP 성격',
      traits: '밝고 에너지 넘치는 성격, 새로운 경험을 좋아함',
      speech_style: '감탄사를 많이 쓰고, 활기찬 말투'
    },
    'seoyeon_intj': {
      name: '서연',
      personality: '논리적, 독립적, 완벽주의적인 INTJ 성격',
      traits: '체계적이고 분석적, 깊이 있는 대화를 선호',
      speech_style: '간결하고 정확한 표현, 논리적인 말투'
    },
    'jihye_esfj': {
      name: '지혜',
      personality: '사교적, 배려심 많은 ESFJ 성격',
      traits: '타인을 먼저 생각하고, 조화를 중시함',
      speech_style: '따뜻하고 배려깊은 말투, 상대방 기분을 살핌'
    },
    'hyejin_istp': {
      name: '혜진',
      personality: '실용적, 독립적인 ISTP 성격',
      traits: '현실적이고 자유로운 성격, 직접적인 표현',
      speech_style: '간결하고 솔직한 말투, 불필요한 꾸밈 없음'
    }
  };

  const character = characterProfiles[characterId] || characterProfiles['yuna_infp'];

  // 난이도별 시나리오 설정
  const difficultySettings = {
    'Easy': {
      affection_range: '0~5점',
      scenario_type: '일상적이고 편안한 상황',
      choice_complexity: '명확하고 직관적인 선택지'
    },
    'Medium': {
      affection_range: '3~8점',
      scenario_type: '감정적 깊이가 있는 상황',
      choice_complexity: '심리적 고려가 필요한 선택지'
    },
    'Hard': {
      affection_range: '5~12점',
      scenario_type: '복잡한 감정이나 갈등 상황',
      choice_complexity: '섬세한 감정 파악이 필요한 선택지'
    },
    'Expert': {
      affection_range: '8~15점',
      scenario_type: '깊은 신뢰와 친밀감이 필요한 상황',
      choice_complexity: '고급 심리 전략이 필요한 선택지'
    }
  };

  const diffSetting = difficultySettings[difficulty] || difficultySettings['Easy'];

  // OpenAI API 프롬프트 생성
  const prompt = `당신은 한국 대학생 여성 ${character.name}입니다.

성격: ${character.personality}
특징: ${character.traits}
말투: ${character.speech_style}

상황: ${userPrompt}
난이도: ${difficulty} (${diffSetting.scenario_type})

다음 JSON 형식으로 응답해주세요:
{
  "character_message": "${character.name}의 대사 (감정을 담아 자연스럽게)",
  "context": "상황 설명 (${character.name}의 행동과 감정 묘사)",
  "choices": [
    {
      "text": "선택지 1 (${diffSetting.choice_complexity})",
      "affection_impact": 호감도 변화값(-3~+5)
    },
    {
      "text": "선택지 2",
      "affection_impact": 호감도 변화값(-3~+5)
    },
    {
      "text": "선택지 3",
      "affection_impact": 호감도 변화값(-3~+5)
    }
  ]
}

주의사항:
- 한국어로 자연스럽게 작성
- ${character.name}의 성격에 맞는 대화
- 선택지는 현실적이고 다양한 호감도 변화 제공
- 호감도는 ${diffSetting.affection_range} 범위에서 설정`;

  try {
    console.log('🚀 OpenAI API 요청 시작...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 한국 로맨스 채팅 게임의 전문 대화 작가입니다.

🎯 MISSION: JSON 형식으로 정확한 응답 생성
- 반드시 올바른 JSON 형식으로만 응답하세요
- 추가 텍스트나 설명 없이 JSON만 출력하세요
- 한국어 자연스러운 대화로 작성하세요
- 캐릭터의 MBTI 성격을 정확히 반영하세요

🚨 CRITICAL: JSON 형식 준수 필수
형식을 벗어나면 시스템 오류가 발생합니다.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    console.log(`📊 OpenAI API 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API 오류 상세:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });

      // 520 오류는 일시적인 문제일 가능성이 높음
      if (response.status === 520) {
        throw new Error(`OpenAI API 일시적 오류 (520): 서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요. 연속 요청 시 2-3초 간격을 두세요.`);
      }

      throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    console.log('🤖 OpenAI 응답:', aiText);

    // JSON 파싱 시도
    try {
      const parsedResponse = JSON.parse(aiText);
      console.log('✅ JSON 파싱 성공');
      return parsedResponse;
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패, 기본 형식으로 변환:', parseError);

      // 파싱 실패 시 기본 형식으로 변환
      return {
        character_message: `${character.name}: 죄송해요, 지금 제대로 대답하기 어려워요 😅`,
        context: `${character.name}가 잠시 당황한 표정을 짓는다.`,
        choices: [
          { text: "괜찮다고 말하며 다른 화제로 넘어간다", affection_impact: 1 },
          { text: "무슨 일인지 걱정스럽게 물어본다", affection_impact: 2 },
          { text: "시간을 두고 천천히 이야기하자고 한다", affection_impact: 3 }
        ]
      };
    }

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    throw error;
  }
}