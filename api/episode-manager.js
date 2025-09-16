// 에피소드(36퀘스트) 관리 API - v1.0.0
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  try {
    // 특정 시나리오의 에피소드 목록 조회
    if (action === 'list' && req.query.scenario_id) {
      const episodes = await getEpisodesForScenario(req.query.scenario_id);
      return res.json({
        success: true,
        episodes,
        scenario_id: req.query.scenario_id
      });
    }

    // 새 에피소드 생성 (AI 대화 자동 생성)
    if (action === 'create') {
      const newEpisode = await createNewEpisode(req.body);
      return res.json({
        success: true,
        episode: newEpisode,
        message: 'AI가 대화와 선택지를 자동 생성했습니다'
      });
    }

    // 에피소드 상세 조회
    if (action === 'get' && req.query.episode_id) {
      const episode = await getEpisodeDetail(req.query.episode_id);
      return res.json({ success: true, episode });
    }

    // 캐릭터별 에피소드 목록 조회
    if (action === 'character_episodes' && req.query.character_id) {
      const episodes = await getEpisodesForCharacter(req.query.character_id);
      return res.json({
        success: true,
        character_id: req.query.character_id,
        episodes
      });
    }

    // 에피소드 편집/업데이트
    if (action === 'update') {
      const updatedEpisode = await updateEpisode(req.body);
      return res.json({
        success: true,
        episode: updatedEpisode,
        message: 'Episode updated successfully'
      });
    }

    // AI 대화 재생성
    if (action === 'regenerate_dialogue') {
      const episode = await regenerateDialogue(req.body);
      return res.json({
        success: true,
        episode,
        message: 'AI 대화가 재생성되었습니다'
      });
    }

    // 채팅 훈련용 대화 생성 (실시간 게임용)
    if (action === 'generate') {
      console.log('🎯 채팅 훈련 대화 생성 요청:', req.body);
      const chatTrainingData = await generateChatTrainingDialogue(req.body);
      return res.json({
        success: true,
        data: chatTrainingData,
        message: '채팅 훈련용 대화가 생성되었습니다'
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (error) {
    console.error('Episode Manager API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// 새 에피소드 생성 함수
async function createNewEpisode(data) {
  const { 
    scenario_id, 
    character_id, 
    character_name, 
    user_input_prompt, 
    difficulty = 'easy',
    episode_number 
  } = data;

  // 시나리오 정보 로드하여 컨텍스트 확인
  const scenarioContext = await getScenarioContext(scenario_id);
  
  // AI를 이용한 대화 및 선택지 생성
  const aiDialogue = await generateEpisodeDialogue({
    scenario_context: scenarioContext,
    character_id,
    character_name,
    user_input_prompt,
    difficulty
  });

  const newEpisode = {
    id: `episode_${scenario_id}_${String(episode_number).padStart(3, '0')}`,
    scenario_id,
    episode_number,
    title: `${character_name}의 ${episode_number}번째 대화`,
    character_id,
    character_name,
    difficulty,
    required_affection: calculateRequiredAffection(difficulty, episode_number),
    user_input_prompt,
    ai_generated_dialogue: aiDialogue,
    custom_dialogue: null,
    created_date: new Date().toISOString().split('T')[0],
    last_modified: new Date().toISOString().split('T')[0],
    active_status: true,
    play_count: 0,
    tags: extractEpisodeTags(user_input_prompt, character_name)
  };

  // 데이터베이스에 저장
  await saveEpisodeToDatabase(newEpisode);
  
  return newEpisode;
}

// 🎯 채팅 기술 훈련을 위한 AI 대화 생성 함수
async function generateEpisodeDialogue(data) {
  const { scenario_context, character_id, character_name, user_input_prompt, difficulty } = data;
  
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return generateChatTrainingFallback(character_id, user_input_prompt, difficulty);
    }

    // 🎯 채팅 기술 훈련용 특화 프롬프트 생성
    const chatTrainingPrompt = generateChatTrainingPrompt({
      scenario_context,
      character_id, 
      character_name,
      user_input_prompt,
      difficulty
    });

    console.log('🎯 채팅 기술 훈련 대화 생성 시작...');
    console.log('🔑 API 키 확인:', OPENAI_API_KEY ? '설정됨' : '없음');
    console.log('📝 프롬프트 길이:', chatTrainingPrompt.length);
    
    const requestBody = {
      model: 'gpt-3.5-turbo', // 더 안정적인 모델 사용
      messages: [
        {
          role: 'system',
          content: `당신은 남성들의 채팅 기술 향상을 위한 전문 훈련 시스템의 AI입니다.

🎯 핵심 목표:
1. 남성이 여성과의 실제 채팅에서 호감을 얻을 수 있는 메시지 패턴 교육
2. MBTI 특성에 맞는 맞춤형 어프로치 훈련  
3. 단계별 레포 구축 전략 제시
4. 실제 카톡/문자에서 활용 가능한 실용적 선택지 제공

⚠️ 중요 지침:
- 반드시 실제 채팅앱에서 보낼 수 있는 자연스러운 메시지 생성
- 길고 설명적인 문장 금지, 짧고 대화적인 톤 사용
- 이모티콘과 줄바꿈을 적절히 활용
- 상황에 맞는 구체적이고 생생한 대화
- JSON 형식을 정확히 지켜서 응답`
        },
        {
          role: 'user', 
          content: chatTrainingPrompt
        }
      ],
      temperature: 0.8,        // 창의성 증가 (0.7 → 0.8)
      max_tokens: 1500,       // 대화량 증가 (1200 → 1500)
      frequency_penalty: 0.5, // 반복 방지 강화 (0.3 → 0.5)
      presence_penalty: 0.4,  // 다양성 증가 강화 (0.2 → 0.4)
      top_p: 0.9             // 응답 다양성 추가 제어
    };

    console.log('📤 OpenAI API 요청 전송...');
    console.log('📊 요청 상세:', {
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      prompt_length: chatTrainingPrompt.length
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 API 응답 수신:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('📊 API 응답 메타데이터:', {
        model: data.model,
        usage: data.usage,
        finish_reason: data.choices[0]?.finish_reason
      });
      
      const generatedContent = data.choices[0]?.message?.content;
      
      if (generatedContent) {
        console.log('✅ 채팅 훈련 대화 생성 성공');
        console.log('📝 생성된 내용 길이:', generatedContent.length);
        return parseChatTrainingResponse(generatedContent, character_id);
      } else {
        console.error('❌ 생성된 콘텐츠가 없음');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
    }

    console.warn('⚠️ OpenAI API 실패, fallback 사용');
    return generateChatTrainingFallback(character_id, user_input_prompt, difficulty);

  } catch (error) {
    console.error('❌ 채팅 훈련 대화 생성 실패:', error);
    return generateChatTrainingFallback(character_id, user_input_prompt, difficulty);
  }
}

// 🎯 대화 상황 다양성을 위한 랜덤 요소
const conversationStarters = [
  "일상적인 대화로 시작하는 상황",
  "상대방이 먼저 말을 건 상황", 
  "공통 관심사에 대해 이야기하는 상황",
  "상대방이 고민을 털어놓는 상황",
  "재미있는 일이 있었다고 공유하는 상황",
  "계획을 세우거나 제안하는 상황",
  "감정적으로 가까워지는 순간의 상황"
];

const moodVariations = [
  "밝고 활기찬 분위기",
  "편안하고 자연스러운 분위기", 
  "약간 설레는 분위기",
  "진지하고 깊이있는 분위기",
  "장난스럽고 유쾌한 분위기",
  "조금 수줍어하는 분위기",
  "친밀하고 따뜻한 분위기"
];

// 🎯 채팅 훈련용 프롬프트 생성 (다양성 강화)
function generateChatTrainingPrompt({scenario_context, character_id, character_name, user_input_prompt, difficulty}) {
  const difficultyGuides = {
    'Easy': {
      focus: '기본적인 대화 매너와 관심 표현',
      techniques: ['적극적 경청', '공감 표현', '칭찬', '관심사 파악'],
      goals: '자연스럽고 편안한 분위기 조성'
    },
    'Medium': {
      focus: '감정적 연결과 개성 어필',
      techniques: ['유머 활용', '개인적 경험 공유', '감정 공감', '미묘한 플레이팅'],
      goals: '호감을 넘어서는 특별함 어필'
    },
    'Hard': {
      focus: '깊은 매력 어필과 심리적 우위',
      techniques: ['심리적 거리 조절', '미스터리 요소', '감정 기복 활용', '선별적 관심'],
      goals: '강한 끌림과 궁금증 유발'
    },
    'Expert': {
      focus: '고급 심리 전략과 관계 주도권',
      techniques: ['프레임 컨트롤', '감정적 롤러코스터', '희소성 원리', '투자 유도'],
      goals: '완전한 매력 포로 만들기'
    }
  };

  const guide = difficultyGuides[difficulty] || difficultyGuides['Easy'];
  
  // 🎲 랜덤 요소 선택으로 다양성 확보
  const randomStarter = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
  const randomMood = moodVariations[Math.floor(Math.random() * moodVariations.length)];
  
  return `
💬 실제 채팅 시뮬레이션을 위한 대화 상황을 생성해주세요.

🎭 설정:
- 상황: ${scenario_context}
- 여성 캐릭터: ${character_name} (${character_id})
- 대화 상황: ${user_input_prompt}
- 난이도: ${difficulty} (${guide.focus})
- 대화 스타일: ${randomStarter}
- 분위기: ${randomMood}

📱 채팅 시나리오:
당신은 ${character_name}과(와) 현재 ${scenario_context} 상황에서 채팅을 하고 있습니다.
${user_input_prompt}

🎯 이번 대화의 특징:
- 대화 시작 방식: ${randomStarter}
- 전체적인 분위기: ${randomMood}
- 사용할 채팅 기법: ${guide.techniques.slice(0, 3).join(', ')}

🎯 요구사항:
1. ${character_name}이(가) 보낸 자연스러운 채팅 메시지 (2-3줄, 실제 카톡/문자 스타일)
2. 남성이 답장할 수 있는 3가지 현실적인 메시지 옵션
3. 각 답장의 효과와 채팅 기술 분석

⚠️ 중요: 
- 실제 채팅앱에서 보낼 수 있는 자연스러운 메시지로 작성
- 길고 설명적인 문장 금지, 짧고 대화적인 톤 사용  
- 이모티콘과 줄바꿈을 적절히 활용
- 상황에 맞는 구체적이고 생생한 대화

난이도별 가이드:
- Easy: 일상적이고 편안한 대화 (${guide.techniques.slice(0,2).join(', ')})
- Medium: 감정적 연결과 매력 어필 (${guide.techniques.slice(0,3).join(', ')})  
- Hard: 심리적 기법과 흥미 유발 (${guide.techniques.join(', ')})
- Expert: 고급 매력 전략과 주도권 (${guide.techniques.join(', ')})

JSON 응답 형식:
{
  "character_message": "${character_name}이(가) 실제로 보낸 채팅 메시지 (자연스럽고 짧게, 2-3줄)",
  "context": "현재 대화 상황에 대한 간단한 설명 (1줄)",
  "choices": [
    {
      "text": "남성이 보낼 실제 메시지 1 (직접적 접근)",
      "strategy": "사용 기법",
      "effect": "예상 반응", 
      "affection_impact": 호감도(-3~+8),
      "tip": "핵심 포인트"
    },
    {
      "text": "남성이 보낼 실제 메시지 2 (매력적 접근)",
      "strategy": "사용 기법",
      "effect": "예상 반응",
      "affection_impact": 호감도(-3~+8), 
      "tip": "핵심 포인트"
    },
    {
      "text": "남성이 보낼 실제 메시지 3 (안전한 접근)",
      "strategy": "사용 기법",
      "effect": "예상 반응",
      "affection_impact": 호감도(-3~+8),
      "tip": "핵심 포인트"
    }
  ],
  "conversation_flow": "${character_name}이(가) 이 메시지를 보낸 심리와 다음 대화로 이어질 흐름"
}

예시 스타일:
character_message: "오늘 수업 끝나고 카페 갔는데 생각보다 사람이 많더라 😅\n혹시 조용한 카페 아는 곳 있어?"
choices: ["나도 그런 곳 찾고 있었는데 같이 가볼까?", "○○카페 어때? 거기 분위기 좋더라", "아 그랬구나 ㅠㅠ 찾으면 알려줄게"]`;
}

// 🎯 AI 응답 파싱 (대화형 채팅 특화)
function parseChatTrainingResponse(content, character_id) {
  try {
    console.log('🔍 AI 응답 원본:', content.substring(0, 500));
    
    // JSON 추출 시도 (여러 패턴 지원)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // 코드 블록 안의 JSON 찾기
      jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (jsonMatch) {
      const cleanedJson = jsonMatch[0].trim();
      console.log('🔍 추출된 JSON:', cleanedJson.substring(0, 300));
      
      const parsed = JSON.parse(cleanedJson);
      console.log('✅ JSON 파싱 성공:', parsed);
      
      return {
        dialogue: parsed.character_message || parsed.dialogue,
        narration: parsed.context || parsed.narration || "채팅 대화 상황",
        choices: (parsed.choices || []).map(choice => ({
          text: choice.text,
          affection_impact: choice.affection_impact || 0,
          strategy: choice.strategy,
          effect: choice.effect,
          learning_point: choice.tip || choice.learning_point
        })),
        training_tip: parsed.conversation_flow || parsed.training_tip,
        conversation_context: parsed.context
      };
    }
  } catch (error) {
    console.error('❌ AI 응답 파싱 실패:', error);
    console.error('파싱 시도한 내용:', content.substring(0, 1000));
  }
  
  // 파싱 실패 시 fallback
  console.log('⚠️ AI 파싱 실패, fallback 사용');
  return generateChatTrainingFallback(character_id, '기본 상황', 'Easy');
}

// 🎯 대화형 채팅 Fallback 템플릿
function generateChatTrainingFallback(character_id, user_input, difficulty) {
  const chatTemplates = {
    'Easy': [
      {
        dialogue: "오늘 날씨 진짜 좋다 ☀️\n산책하기 딱 좋은 것 같은데 어떻게 생각해?",
        narration: "밝은 톤으로 일상적인 대화를 시작하는 상황",
        choices: [
          {
            text: "맞아! 나도 그 생각했어. 같이 갈래?",
            affection_impact: 4,
            strategy: "즉시 공감 + 적극적 제안",
            effect: "호감도 상승, 적극성 어필",
            learning_point: "공감 후 바로 만남 제안하는 직진법"
          },
          {
            text: "그러게 ㅎㅎ 너는 보통 이런 날에 뭐해?",
            affection_impact: 2,
            strategy: "가벼운 공감 + 관심사 탐색",
            effect: "자연스러운 대화 이어가기",
            learning_point: "안전하게 상대방 정보 수집하는 법"
          },
          {
            text: "ㅇㅇ 날씨 좋네",
            affection_impact: -1,
            strategy: "단순 동의",
            effect: "대화 진전 없음",
            learning_point: "너무 짧은 답변은 대화를 막는다"
          }
        ],
        training_tip: "일상 대화에서는 공감 후 추가 질문이나 제안으로 이어가는 것이 핵심"
      },
      {
        dialogue: "아 오늘 수업 너무 힘들었어 😵\n커피 마시고 싶다...",
        narration: "피곤함을 표현하며 공감과 위로를 원하는 상황",
        choices: [
          {
            text: "고생했네 ㅠㅠ 맛있는 커피 한잔 사줄까?",
            affection_impact: 5,
            strategy: "공감 + 배려 + 구체적 제안",
            effect: "배려심 어필, 직접적 만남 제안",
            learning_point: "상대방의 니즈를 파악하고 즉시 해결책 제시"
          },
          {
            text: "무슨 수업이었길래 그렇게 힘들어? ㅠㅠ",
            affection_impact: 3,
            strategy: "관심 표현 + 세부사항 질문",
            effect: "관심있어 한다는 느낌 전달",
            learning_point: "구체적인 질문으로 관심 표현하기"
          },
          {
            text: "나도 오늘 힘들었어 ㅠㅠ",
            affection_impact: 1,
            strategy: "동병상련 어필",
            effect: "공감대 형성하지만 도움은 안됨",
            learning_point: "자신 얘기로 돌리면 상대방 기분 안좋아짐"
          }
        ],
        training_tip: "상대방이 힘들어할 때는 해결책을 제시하거나 관심을 보이는 것이 효과적"
      }
    ],
    'Medium': [
      {
        dialogue: "요즘 뭔가 재미있는 일이 없을까 하고 생각중이야 🤔\n너는 요즘 어떻게 지내?",
        narration: "일상에 변화를 원하며 상대방과의 추억 만들기를 암시하는 상황",
        choices: [
          {
            text: "그럼 내가 재미있게 해줄까? 😏 뭐 하고 싶은 거 있어?",
            affection_impact: 6,
            strategy: "자신감 어필 + 미스터리 + 관심 표현",
            effect: "호기심과 기대감 유발",
            learning_point: "자신감 있게 주도권을 잡으면서 상대방 의견 물어보기"
          },
          {
            text: "나도 그런 생각 하고 있었어! 같이 새로운 거 해볼까?",
            affection_impact: 4,
            strategy: "공감 + 공동 계획 제안",
            effect: "함께하고 싶다는 의지 전달",
            learning_point: "비슷한 니즈로 공감대 형성 후 함께 할 일 제안"
          },
          {
            text: "나는 그냥 평범하게 지내고 있어",
            affection_impact: 0,
            strategy: "평범한 답변",
            effect: "대화 흐름 끊김",
            learning_point: "상대방의 니즈를 무시하면 관심이 식어짐"
          }
        ],
        training_tip: "상대방이 변화를 원할 때는 적극적으로 새로운 제안을 하는 것이 좋음"
      }
    ],
    'Hard': [
      {
        dialogue: "친구들이 자꾸 소개팅 시켜주려고 해서 고민이야 😅\n어떻게 생각해?",
        narration: "다른 남성들의 관심을 암시하며 상대방의 반응을 테스트하는 상황",
        choices: [
          {
            text: "그런 거 할 시간에 나랑 있는 게 더 재밌을 텐데 😌",
            affection_impact: 7,
            strategy: "자신감 + 경쟁심 자극 + 간접적 고백",
            effect: "질투와 독점욕 자극, 자신감 어필",
            learning_point: "경쟁 상황에서 여유롭게 자신감을 보이는 법"
          },
          {
            text: "소개팅? 괜찮은 사람 만나면 좋겠네",
            affection_impact: -2,
            strategy: "무관심 어필",
            effect: "관심 없음으로 해석, 실망감",
            learning_point: "무관심을 가장하면 오히려 역효과"
          },
          {
            text: "에이 너 같은 애가 소개팅이 필요해? 😏",
            affection_impact: 5,
            strategy: "간접적 칭찬 + 친근함",
            effect: "기분 좋게 하면서 자연스러운 칭찬",
            learning_point: "직접적이지 않으면서도 매력을 인정해주는 법"
          }
        ],
        training_tip: "경쟁 상황이 언급될 때는 여유있는 자신감을 보이는 것이 중요"
      }
    ]
  };

  // 난이도에 맞는 템플릿 선택
  const templates = chatTemplates[difficulty] || chatTemplates['Easy'];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    dialogue: randomTemplate.dialogue,
    narration: randomTemplate.narration,
    choices: randomTemplate.choices,
    training_tip: randomTemplate.training_tip
  };
}
${scenario_context}

캐릭터 정보:
- 이름: ${character_name}
- 성격 특성: ${characterTraits.personality}  
- 말투: ${characterTraits.speech_style}
- MBTI: ${characterTraits.mbti}

사용자 입력 프롬프트:
${user_input_prompt}

난이도: ${difficulty}

응답 형식 (반드시 JSON):
{
  "dialogue": "캐릭터의 대사 (감정과 성격이 잘 드러나도록)",
  "narration": "상황 설명 (캐릭터의 표정, 몸짓, 분위기 묘사)",
  "choices": [
    {"text": "선택지 1 (${difficulty} 난이도에 맞게)", "affection_impact": 숫자},
    {"text": "선택지 2", "affection_impact": 숫자},
    {"text": "선택지 3", "affection_impact": 숫자}
  ]
}

중요사항:
- 한국 문화와 언어에 자연스럽게 맞춰주세요
- ${character_name}의 ${characterTraits.mbti} 성격이 잘 드러나도록 해주세요
- 선택지는 다양한 호감도 변화(-1~3)를 가지도록 해주세요`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const aiMessage = data.content[0]?.text;
      
      try {
        const parsedDialogue = JSON.parse(aiMessage);
        return parsedDialogue;
      } catch (parseError) {
        console.error('Failed to parse AI dialogue JSON:', parseError);
        return generateFallbackDialogue(character_id, user_input_prompt);
      }
    } else {
      return generateFallbackDialogue(character_id, user_input_prompt);
    }

  } catch (error) {
    console.error('Episode Dialogue Generation Error:', error);
    return generateFallbackDialogue(character_id, user_input_prompt);
  }
}

// 캐릭터 특성 정보 반환
function getCharacterTraits(character_id) {
  const traits = {
    'yuna_infp': {
      personality: '감성적, 내향적, 이상주의적, 창의적',
      speech_style: '부드럽고 따뜻한 말투, 이모티콘 자주 사용',
      mbti: 'INFP'
    },
    'mina_enfp': {
      personality: '외향적, 열정적, 창의적, 자유로운',  
      speech_style: '밝고 에너지 넘치는 말투, 격려 표현',
      mbti: 'ENFP'
    },
    'seoyeon_intj': {
      personality: '논리적, 독립적, 완벽주의, 전략적',
      speech_style: '간결하고 정확한 말투, 가끔 따뜻함',
      mbti: 'INTJ'
    },
    'jihye_esfj': {
      personality: '사교적, 배려심 많은, 책임감 강한, 감정적',
      speech_style: '따뜻하고 배려깊은 말투, 걱정하는 표현',
      mbti: 'ESFJ'
    },
    'hyejin_istp': {
      personality: '실용적, 독립적, 논리적, 적응적',
      speech_style: '간결하고 실용적인 말투, 필요한 말만',
      mbti: 'ISTP'
    }
  };
  
  return traits[character_id] || traits['yuna_infp'];
}

// Fallback 대화 생성 (다양성 강화)
function generateFallbackDialogue(character_id, user_prompt) {
  // 🎲 각 캐릭터별 다양한 템플릿 배열
  const fallbackDialogues = {
    'yuna_infp': [
      {
        dialogue: "음... 그런 이야기구나 😊\n사실 나도 비슷한 생각을 하고 있었어",
        narration: "윤아가 부드러운 미소를 지으며 고개를 끄덕인다.",
        choices: [
          {"text": "정말? 어떤 생각이었는지 궁금해", "affection_impact": 2, "strategy": "호기심 표현", "tip": "관심과 경청 어필"},
          {"text": "우리 생각이 비슷하네", "affection_impact": 1, "strategy": "공감대 형성", "tip": "유사성으로 친밀감 형성"},
          {"text": "나중에 더 자세히 이야기해줘", "affection_impact": 0, "strategy": "안전한 접근", "tip": "부담 없는 대화 연결"}
        ]
      },
      {
        dialogue: "어... 그게 그렇구나 😳\n나는 조금 다르게 생각했는데...",
        narration: "윤아가 살짝 당황한 표정으로 손을 만지작거린다.",
        choices: [
          {"text": "어떻게 다르게 생각했는지 알고 싶어", "affection_impact": 3, "strategy": "진심 어린 관심", "tip": "차이점에 대한 진짜 호기심"},
          {"text": "아, 그래도 괜찮아. 다양한 생각이 좋지", "affection_impact": 1, "strategy": "배려와 수용", "tip": "차이를 인정하는 성숙함"},
          {"text": "그럼 네 생각도 말해줄래?", "affection_impact": 2, "strategy": "대화 주도권 이양", "tip": "상대방에게 말할 기회 제공"}
        ]
      }
    ],
    'mina_enfp': [
      {
        dialogue: "와! 진짜 그렇게 생각해? 😆\n우리 완전 잘 맞는 것 같아!",
        narration: "미나가 눈을 반짝이며 흥분한 표정으로 말한다.",
        choices: [
          {"text": "너랑 대화하면 항상 즐거워", "affection_impact": 3, "strategy": "감정 공유", "tip": "긍정적 피드백으로 호감 증대"},
          {"text": "미나는 정말 에너지가 넘치네", "affection_impact": 2, "strategy": "성격 인정", "tip": "상대 특성을 알아차리는 관찰력"},
          {"text": "그래, 우리 잘 맞는 것 같아", "affection_impact": 1, "strategy": "공감과 동조", "tip": "안전한 공감대 형성"}
        ]
      }
    ],
    'seoyeon_intj': [
      {
        dialogue: "흥미로운 관점이네요.\n논리적으로 타당한 부분이 있습니다.",
        narration: "서연이 진지한 표정으로 고개를 끄덕이며 생각에 잠긴다.",
        choices: [
          {"text": "서연의 의견도 듣고 싶어", "affection_impact": 3, "strategy": "지적 존중", "tip": "상대방의 논리적 사고를 인정"},
          {"text": "논리적으로 생각해줘서 고마워", "affection_impact": 2, "strategy": "능력 인정", "tip": "상대의 강점을 칭찬"},
          {"text": "그래, 함께 생각해보자", "affection_impact": 1, "strategy": "협력 제안", "tip": "공동 작업 의지 표현"}
        ]
      }
    ],
    'jihye_esfj': [
      {
        dialogue: "정말? 괜찮아? 😟\n혹시 불편한 건 없어? 내가 도와줄 수 있는 게 있다면 말해줘!",
        narration: "지혜가 걱정스러운 표정으로 상대방을 바라본다.",
        choices: [
          {"text": "걱정해줘서 정말 고마워", "affection_impact": 3, "strategy": "감사 표현", "tip": "배려심에 대한 진심 어린 감사"},
          {"text": "지혜 덕분에 힘이 나", "affection_impact": 2, "strategy": "의존성 표현", "tip": "상대의 도움이 의미있음을 전달"},
          {"text": "괜찮아, 신경 써줘서 고마워", "affection_impact": 1, "strategy": "안전한 거리", "tip": "부담 주지 않으면서 감사 표현"}
        ]
      }
    ],
    'hyejin_istp': [
      {
        dialogue: "그렇구나. 나쁘지 않네 👍",
        narration: "혜진이 담담한 표정으로 짧게 대답한다.",
        choices: [
          {"text": "혜진의 솔직한 반응이 좋아", "affection_impact": 3, "strategy": "성격 인정", "tip": "솔직함을 긍정적으로 평가"},
          {"text": "더 자세히 얘기해줄래?", "affection_impact": 1, "strategy": "대화 유도", "tip": "말수 적은 상대에게 대화 기회 제공"},
          {"text": "그래, 나도 그렇게 생각해", "affection_impact": 2, "strategy": "동조와 공감", "tip": "간결한 동의로 편안함 조성"}
        ]
      }
    ]
  };
  
  // 🎲 캐릭터별 템플릿 중 랜덤 선택
  const characterTemplates = fallbackDialogues[character_id] || fallbackDialogues['yuna_infp'];
  const randomTemplate = characterTemplates[Math.floor(Math.random() * characterTemplates.length)];
  
  console.log(`🎯 ${character_id} fallback 템플릿 랜덤 선택: ${randomTemplate.dialogue.substring(0, 30)}...`);
  
  return randomTemplate;
}

// 필요 호감도 계산 
function calculateRequiredAffection(difficulty, episode_number) {
  const baseAffection = {
    'easy': 0,
    'medium': 10, 
    'hard': 20,
    'expert': 30
  };
  
  return baseAffection[difficulty] + Math.floor((episode_number - 1) / 3);
}

// 에피소드 데이터베이스 로드
async function loadEpisodeDatabase() {
  try {
    const episodePath = path.join(process.cwd(), 'data', 'episodes', 'episode-database.json');
    const episodeData = fs.readFileSync(episodePath, 'utf8');
    return JSON.parse(episodeData);
  } catch (error) {
    console.error('Failed to load episode database:', error);
    return { metadata: {}, episodes: {} };
  }
}

// 에피소드 데이터베이스에 저장
async function saveEpisodeToDatabase(episode) {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'episodes', 'episode-database.json');
    const db = await loadEpisodeDatabase();
    
    db.episodes[episode.id] = episode;
    db.metadata.total_episodes = Object.keys(db.episodes).length;
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save episode:', error);
    return false;
  }
}

// 시나리오 컨텍스트 가져오기
async function getScenarioContext(scenario_id) {
  try {
    const scenarioPath = path.join(process.cwd(), 'data', 'scenarios', 'scenario-database.json');
    const scenarioData = fs.readFileSync(scenarioPath, 'utf8');
    const db = JSON.parse(scenarioData);
    const scenario = db.scenarios[scenario_id];
    
    if (scenario) {
      return scenario.ai_generated_context || scenario.description;
    }
    return "";
  } catch (error) {
    console.error('Failed to get scenario context:', error);
    return "";
  }
}

// 시나리오별 에피소드 조회
async function getEpisodesForScenario(scenario_id) {
  const db = await loadEpisodeDatabase();
  return Object.values(db.episodes).filter(ep => ep.scenario_id === scenario_id);
}

// 캐릭터별 에피소드 조회
async function getEpisodesForCharacter(character_id) {
  const db = await loadEpisodeDatabase();
  return Object.values(db.episodes).filter(ep => ep.character_id === character_id);
}

// 에피소드 상세 조회
async function getEpisodeDetail(episode_id) {
  const db = await loadEpisodeDatabase();
  return db.episodes[episode_id];
}

// 에피소드 업데이트
async function updateEpisode(data) {
  const db = await loadEpisodeDatabase();
  const episode = db.episodes[data.id];
  
  if (!episode) {
    throw new Error('Episode not found');
  }
  
  Object.assign(episode, data);
  episode.last_modified = new Date().toISOString().split('T')[0];
  
  await saveEpisodeToDatabase(episode);
  return episode;
}

// 대화 재생성
async function regenerateDialogue(data) {
  const episode = await getEpisodeDetail(data.episode_id);
  
  if (!episode) {
    throw new Error('Episode not found');
  }
  
  const scenarioContext = await getScenarioContext(episode.scenario_id);
  
  const newDialogue = await generateEpisodeDialogue({
    scenario_context: scenarioContext,
    character_id: data.character_id || episode.character_id,
    character_name: data.character_name || episode.character_name,
    user_input_prompt: data.user_input_prompt || episode.user_input_prompt,
    difficulty: data.difficulty || episode.difficulty
  });
  
  episode.ai_generated_dialogue = newDialogue;
  episode.last_modified = new Date().toISOString().split('T')[0];
  
  await saveEpisodeToDatabase(episode);
  return episode;
}

// 채팅 훈련용 대화 생성 (실시간 게임용)
async function generateChatTrainingDialogue(data) {
  const { scenario_id, character_id, user_prompt, difficulty } = data;
  
  console.log('🎯 채팅 훈련 대화 생성 시작:', {
    scenario_id,
    character_id, 
    user_prompt,
    difficulty
  });

  try {
    // 시나리오 정보 로드
    const scenarios = await loadScenarioDatabase();
    const scenario = scenarios.scenarios[scenario_id];
    
    if (!scenario) {
      console.warn('⚠️ 시나리오를 찾을 수 없음, 기본 컨텍스트 사용');
    }

    // 캐릭터 정보 가져오기
    const characterTraits = getCharacterTraits(character_id);
    
    // OpenAI API를 통한 대화 생성 시도
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (OPENAI_API_KEY) {
      console.log('🤖 OpenAI API로 채팅 훈련 대화 생성 중...');
      
      const chatTrainingPrompt = generateChatTrainingPrompt({
        scenario_context: scenario?.ai_generated_context || '일상적인 대화 상황',
        character_id,
        character_name: characterTraits.name,
        user_input_prompt: user_prompt,
        difficulty: difficulty || 'Easy'
      });

      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 한국의 채팅 대화 전문가입니다. 실제 메신저 앱에서 나눌 수 있는 자연스러운 대화를 생성하세요.'
          },
          {
            role: 'user', 
            content: chatTrainingPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        frequency_penalty: 0.5,
        presence_penalty: 0.4,
        top_p: 0.9
      };

      console.log('📤 OpenAI API 요청 전송...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const generatedContent = aiResponse.choices[0]?.message?.content;
        
        if (generatedContent) {
          console.log('✅ OpenAI API 응답 성공');
          const parsedDialogue = parseChatTrainingResponse(generatedContent, character_id);
          
          if (parsedDialogue) {
            console.log('✅ 채팅 훈련 대화 생성 완료');
            return parsedDialogue;
          }
        }
      } else {
        console.warn('⚠️ OpenAI API 호출 실패:', response.status);
      }
    } else {
      console.warn('⚠️ OpenAI API 키가 설정되지 않음');
    }

    // Fallback: 사전 정의된 템플릿 사용
    console.log('🔄 Fallback 채팅 훈련 대화 사용');
    const fallbackDialogue = generateFallbackDialogue(character_id, user_prompt);
    
    return {
      character_message: fallbackDialogue.dialogue,
      context: `${characterTraits.name}과의 대화 상황`,
      choices: fallbackDialogue.choices,
      conversation_flow: `${characterTraits.name}의 ${characterTraits.personality} 성격이 반영된 자연스러운 대화 흐름`
    };

  } catch (error) {
    console.error('❌ 채팅 훈련 대화 생성 실패:', error);
    
    // 최종 Fallback
    return {
      character_message: "안녕! 오늘 기분이 어때? 😊",
      context: "일상적인 인사 대화",
      choices: [
        {
          text: "좋아! 너는 어때?",
          strategy: "긍정적 응답",
          effect: "밝은 분위기 조성",
          affection_impact: 2,
          tip: "긍정적 에너지로 대화 시작"
        },
        {
          text: "그냥 그래. 별일 없어",
          strategy: "담담한 응답", 
          effect: "평범한 대화 진행",
          affection_impact: 0,
          tip: "무난하지만 재미없을 수 있음"
        },
        {
          text: "너 때문에 기분이 좋아졌어",
          strategy: "로맨틱 어필",
          effect: "특별함 어필",
          affection_impact: 3,
          tip: "직접적이지만 효과적인 호감 표현"
        }
      ],
      conversation_flow: "기본적인 일상 대화로 친밀감 형성"
    };
  }
}

// 시나리오 데이터베이스 로드
async function loadScenarioDatabase() {
  try {
    const scenarioPath = path.join(process.cwd(), 'data', 'scenarios', 'scenario-database.json');
    const scenarioData = fs.readFileSync(scenarioPath, 'utf8');
    return JSON.parse(scenarioData);
  } catch (error) {
    console.error('Failed to load scenario database:', error);
    return { metadata: {}, scenarios: {} };
  }
}

// 태그 추출
function extractEpisodeTags(prompt, character_name) {
  const keywords = prompt.split(' ').filter(word => word.length > 2);
  keywords.push(character_name.toLowerCase());
  return keywords.map(word => word.toLowerCase().replace(/[^a-zA-Z가-힣]/g, '')).filter(tag => tag.length > 1);
}