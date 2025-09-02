// 에피소드(36퀘스트) 관리 API - v1.0.0
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
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

// AI 대화 생성 함수 (캐릭터별 특성 반영)
async function generateEpisodeDialogue(data) {
  const { scenario_context, character_id, character_name, user_input_prompt, difficulty } = data;
  
  try {
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!CLAUDE_API_KEY) {
      return generateFallbackDialogue(character_id, user_input_prompt);
    }

    // 캐릭터별 성격 특성 로드
    const characterTraits = getCharacterTraits(character_id);
    
    const prompt = `다음 조건에 맞는 대화와 선택지를 JSON 형식으로 생성해주세요:

시나리오 컨텍스트:
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

// Fallback 대화 생성
function generateFallbackDialogue(character_id, user_prompt) {
  const fallbackDialogues = {
    'yuna_infp': {
      dialogue: "음... 그런 이야기구나 😊 사실 나도 비슷한 생각을 하고 있었어",
      narration: "윤아가 부드러운 미소를 지으며 고개를 끄덕인다.",
      choices: [
        {"text": "정말? 어떤 생각이었는지 궁금해", "affection_impact": 2},
        {"text": "우리 생각이 비슷하네", "affection_impact": 1},
        {"text": "나중에 더 자세히 이야기해줘", "affection_impact": 0}
      ]
    },
    'mina_enfp': {
      dialogue: "와! 진짜 그렇게 생각해? 대박이다! 😆 우리 완전 잘 맞는 것 같아!",
      narration: "미나가 눈을 반짝이며 흥분한 표정으로 말한다.",
      choices: [
        {"text": "너랑 대화하면 항상 즐거워", "affection_impact": 2},
        {"text": "미나는 정말 긍정적이야", "affection_impact": 1},
        {"text": "그래, 우리 잘 맞는 것 같아", "affection_impact": 1}
      ]
    },
    'seoyeon_intj': {
      dialogue: "흥미로운 관점이네요. 논리적으로 타당한 부분이 있습니다.",
      narration: "서연이 진지한 표정으로 고개를 끄덕이며 생각에 잠긴다.",
      choices: [
        {"text": "서연의 의견도 듣고 싶어", "affection_impact": 2},
        {"text": "논리적으로 생각해줘서 고마워", "affection_impact": 1},
        {"text": "그래, 함께 생각해보자", "affection_impact": 0}
      ]
    },
    'jihye_esfj': {
      dialogue: "정말? 괜찮아? 혹시 불편한 건 없어? 내가 도와줄 수 있는 게 있다면 말해줘!",
      narration: "지혜가 걱정스러운 표정으로 상대방을 바라본다.",
      choices: [
        {"text": "걱정해줘서 정말 고마워", "affection_impact": 2},
        {"text": "지혜 덕분에 힘이 나", "affection_impact": 1},
        {"text": "괜찮아, 신경 써줘서 고마워", "affection_impact": 1}
      ]
    },
    'hyejin_istp': {
      dialogue: "그렇구나. 나쁘지 않네.",
      narration: "혜진이 담담한 표정으로 짧게 대답한다.",
      choices: [
        {"text": "혜진의 솔직한 반응이 좋아", "affection_impact": 2},
        {"text": "더 자세히 얘기해줄래?", "affection_impact": 1},
        {"text": "그래, 나도 그렇게 생각해", "affection_impact": 0}
      ]
    }
  };
  
  return fallbackDialogues[character_id] || fallbackDialogues['yuna_infp'];
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

// 태그 추출
function extractEpisodeTags(prompt, character_name) {
  const keywords = prompt.split(' ').filter(word => word.length > 2);
  keywords.push(character_name.toLowerCase());
  return keywords.map(word => word.toLowerCase().replace(/[^a-zA-Z가-힣]/g, '')).filter(tag => tag.length > 1);
}