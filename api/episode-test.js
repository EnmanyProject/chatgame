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
    },
    'mihwa_esfp': {
      name: '미화',
      personality: '외향적, 감정적, 유연한 ESFP 성격',
      traits: '사교적이고 매력적, 순간을 즐기는 성격, 감정 표현이 자유로움',
      speech_style: '밝고 친근한 말투, 이모티콘 사용, 상대방을 끌어들이는 매력적인 표현'
    }
  };

  // 캐릭터 ID에서 프로필 키 찾기
  let profileKey = characterId;

  // ID가 "미화_esfp_1759064886354" 형태인 경우 처리
  if (characterId.includes('미화')) {
    profileKey = 'mihwa_esfp';
  } else if (characterId.includes('윤아')) {
    profileKey = 'yuna_infp';
  } else if (characterId.includes('미나')) {
    profileKey = 'mina_enfp';
  } else if (characterId.includes('서연')) {
    profileKey = 'seoyeon_intj';
  } else if (characterId.includes('지혜')) {
    profileKey = 'jihye_esfj';
  } else if (characterId.includes('혜진')) {
    profileKey = 'hyejin_istp';
  }

  const character = characterProfiles[profileKey] || characterProfiles['mihwa_esfp'];

  console.log(`🎭 캐릭터 매칭: ${characterId} → ${profileKey} → ${character.name}`);

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

  // OpenAI API 프롬프트 생성 - 자연스러운 대화 흐름
  const prompt = `당신은 한국 로맨스 소설 작가입니다. "${character.name}"라는 ${character.personality} 캐릭터와의 자연스러운 대화 에피소드를 작성해주세요.

** 캐릭터 설정 **
이름: ${character.name}
성격: ${character.personality}
특징: ${character.traits}
말투: ${character.speech_style}

** 에피소드 상황 **
${userPrompt}
난이도: ${difficulty} (${diffSetting.scenario_type})

** 요구사항 **
"어젯밤의 기억" 같은 긴 대화 흐름으로 작성해주세요:
1. 자연스러운 대화가 여러 번 이어지는 구조
2. 감정적 깊이와 긴장감 포함
3. 중간에 선택의 기회 제공
4. 로맨스 소설처럼 몰입감 있는 전개
5. ${character.name}의 성격이 잘 드러나는 대화

다음 JSON 형식으로 응답해주세요:
{
  "story_flow": [
    {
      "type": "dialogue",
      "speaker": "${character.name}",
      "text": "첫 번째 대화 (상황 시작, 감정적 몰입)",
      "emotion": "감정 상태",
      "narration": "행동과 심리 묘사"
    },
    {
      "type": "choice_point",
      "situation": "선택해야 할 상황 설명",
      "choices": [
        {
          "text": "선택지 1 (감정적 반응)",
          "affection_impact": 호감도변화(-3~+5),
          "consequence": "이 선택의 결과"
        },
        {
          "text": "선택지 2 (논리적 반응)",
          "affection_impact": 호감도변화(-3~+5),
          "consequence": "이 선택의 결과"
        },
        {
          "text": "선택지 3 (자유로운 대답 - 주관식)",
          "affection_impact": 0,
          "consequence": "사용자가 직접 답할 기회"
        }
      ]
    },
    {
      "type": "dialogue",
      "speaker": "${character.name}",
      "text": "두 번째 대화 (반응과 감정 변화)",
      "emotion": "변화된 감정",
      "narration": "상황 전개와 심리 묘사"
    },
    {
      "type": "dialogue",
      "speaker": "${character.name}",
      "text": "세 번째 대화 (클라이맥스 또는 감정 정점)",
      "emotion": "깊어진 감정",
      "narration": "결정적 순간의 묘사"
    }
  ],
  "episode_summary": "이 에피소드의 핵심 내용과 의미"
}

주의사항:
- 총 3-5개의 대화가 자연스럽게 이어져야 함
- 선택지는 1번만 등장하되 의미 있는 시점에 배치
- ${character.name}의 MBTI 성격이 대화에 자연스럽게 반영되어야 함
- 호감도는 ${diffSetting.affection_range} 범위에서 설정
- 로맨스 소설처럼 감정적 몰입도가 높아야 함
- 한국 대학생들의 자연스러운 대화 톤 유지`;

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
            content: `당신은 한국 로맨스 소설의 베스트셀러 작가입니다.

🎯 MISSION: 자연스러운 대화 흐름을 가진 에피소드 생성
- 반드시 올바른 JSON 형식으로만 응답하세요
- 추가 텍스트나 설명 없이 JSON만 출력하세요
- "어젯밤의 기억" 같은 몰입감 있는 스토리텔링
- 여러 대화 턴이 자연스럽게 이어지는 구조
- 감정적 깊이와 로맨스 요소 포함
- 캐릭터의 MBTI 성격이 자연스럽게 드러나는 대화
- 한국 대학생들의 현실적인 대화 톤

🚨 CRITICAL: story_flow 배열에 dialogue와 choice_point가 적절히 배치되어야 함

🚨 CRITICAL: JSON 형식 준수 필수
형식을 벗어나면 시스템 오류가 발생합니다.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
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

      // 파싱 실패 시 기본 story_flow 형식으로 변환
      return {
        story_flow: [
          {
            type: "dialogue",
            speaker: character.name,
            text: "죄송해요, 지금 제대로 대답하기 어려워요 😅",
            emotion: "당황",
            narration: `${character.name}가 잠시 당황한 표정을 짓는다.`
          },
          {
            type: "choice_point",
            situation: "이런 상황에서 어떻게 반응하실 건가요?",
            choices: [
              {
                text: "괜찮다고 말하며 다른 화제로 넘어간다",
                affection_impact: 1,
                consequence: "자연스럽게 화제를 전환한다"
              },
              {
                text: "무슨 일인지 걱정스럽게 물어본다",
                affection_impact: 2,
                consequence: "그녀의 속마음을 알고 싶어한다는 것을 보여준다"
              },
              {
                text: "시간을 두고 천천히 이야기하자고 한다",
                affection_impact: 3,
                consequence: "그녀를 배려하는 마음을 전달한다"
              }
            ]
          },
          {
            type: "dialogue",
            speaker: character.name,
            text: "고마워요... 사실 조금 복잡한 기분이었어요.",
            emotion: "안도",
            narration: `${character.name}가 작은 미소를 지으며 마음을 열기 시작한다.`
          }
        ],
        episode_summary: "AI 생성 오류로 기본 대화가 제공되었습니다. 재생성을 권장합니다."
      };
    }

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    throw error;
  }
}