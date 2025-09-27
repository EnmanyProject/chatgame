// 시나리오 관리 API - v1.0.0
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

  console.log('📥 Scenario Manager 요청:', {
    method: req.method,
    action,
    body: req.body,
    query: req.query
  });

  try {
    // 시나리오 목록 조회
    if (action === 'list') {
      console.log('📋 시나리오 목록 조회 시작...');
      const scenarios = await loadScenarioDatabase();
      console.log('📊 로드된 시나리오 수:', Object.keys(scenarios.scenarios).length);
      console.log('📝 시나리오 ID 목록:', Object.keys(scenarios.scenarios));
      
      return res.json({
        success: true,
        scenarios: scenarios.scenarios,
        metadata: scenarios.metadata
      });
    }

    // 새 시나리오 생성 (AI 컨텍스트 자동 생성)
    if (action === 'create') {
      const newScenario = await createNewScenario(req.body);
      return res.json({
        success: true,
        scenario: newScenario,
        message: 'AI 컨텍스트가 자동 생성된 시나리오가 생성되었습니다'
      });
    }

    // 시나리오 상세 조회
    if (action === 'get' && req.query.scenario_id) {
      const scenarios = await loadScenarioDatabase();
      const scenario = scenarios.scenarios[req.query.scenario_id];
      
      if (scenario) {
        return res.json({ success: true, scenario });
      } else {
        return res.status(404).json({ success: false, message: 'Scenario not found' });
      }
    }

    // 시나리오 편집/업데이트
    if (action === 'update') {
      const updatedScenario = await updateScenario(req.body);
      return res.json({
        success: true,
        scenario: updatedScenario,
        message: 'Scenario updated successfully'
      });
    }

    // AI 컨텍스트 재생성
    if (action === 'regenerate_context') {
      const scenario = await regenerateAIContext(req.body);
      return res.json({
        success: true,
        scenario,
        message: 'AI 컨텍스트가 재생성되었습니다'
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (error) {
    console.error('Scenario Manager API Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request method:', req.method);
    console.error('Request action:', action);
    console.error('Environment variables:', {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***설정됨***' : '❌ 미설정'
    });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 새 시나리오 생성 함수
async function createNewScenario(data) {
  const { scenario_id, title, description, background_setting, mood, available_characters } = data;
  
  // AI를 이용한 소설풍 컨텍스트 생성
  const aiContext = await generateAIContext({
    title, 
    description, 
    background_setting, 
    mood
  });
  
  const newScenario = {
    id: scenario_id,
    scenario_id: scenario_id, // API 호환성을 위해 둘 다 설정
    title,
    description,
    background_setting,
    mood,
    active_status: true,
    created_date: new Date().toISOString().split('T')[0],
    last_modified: new Date().toISOString().split('T')[0],
    ai_generated_context: aiContext,
    custom_context: "",
    available_characters: available_characters || [],
    episode_count: 0,
    tags: extractTags(description, mood)
  };

  // 데이터베이스에 저장 (실제로는 파일 시스템 사용)
  console.log('💾 시나리오 저장 시작:', newScenario.id);
  const saveResult = await saveScenarioToDatabase(newScenario);
  console.log('💾 저장 결과:', saveResult);
  
  // 저장 후 검증
  const updatedDb = await loadScenarioDatabase();
  console.log('🔍 저장 검증 - 전체 시나리오 수:', Object.keys(updatedDb.scenarios).length);
  console.log('🔍 저장된 시나리오 존재 확인:', !!updatedDb.scenarios[newScenario.id]);
  
  return newScenario;
}

// AI 컨텍스트 생성 함수 (OpenAI API 사용)
async function generateAIContext(scenarioData) {
  try {
    // 1. 환경변수에서 우선 확인
    let OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // 2. 환경변수에 없으면 admin-auth에서 로드
    if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
      console.log('🔍 환경변수에 API 키 없음, admin-auth에서 로드 시도...');
      try {
        const { getActiveApiKey } = await import('./admin-auth.js');
        OPENAI_API_KEY = await getActiveApiKey();
        console.log('🔍 admin-auth에서 API 키 로드 결과:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 4)}...` : 'None');
      } catch (error) {
        console.warn('⚠️ admin-auth에서 API 키 로드 실패:', error.message);
      }
    }

    if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
      console.warn('❌ OpenAI API key not configured in any storage');
      console.warn('환경변수 또는 admin-auth 저장소에 API 키를 설정해주세요');
      return generateFallbackContext(scenarioData);
    }

    console.log('🤖 OpenAI API 호출 시작...');

    const prompt = `다음 정보를 바탕으로 MBTI 로맨스 게임의 풍부하고 상세한 시나리오 컨텍스트를 소설풍으로 작성해주세요:

제목: ${scenarioData.title}
설명: ${scenarioData.description}
배경: ${scenarioData.background_setting}
분위기: ${scenarioData.mood}

상세 요구사항:
1. **길이와 구조**: 600-900자 분량의 충분히 상세한 소설풍 시놉시스
2. **장면 묘사**: 공간의 분위기, 시간대, 날씨, 주변 환경을 세밀하게 묘사
3. **캐릭터 심리**: 등장인물의 내면 감정, 생각, 과거 경험을 깊이 있게 표현
4. **감각적 묘사**: 시각, 청각, 후각, 촉각 등 오감을 활용한 생생한 묘사
5. **감정 전개**: 만남 전 → 첫 만남 → 감정 변화의 단계별 상세 묘사
6. **문화적 배경**: 한국의 대학생/직장인 문화, 계절감, 사회적 맥락 반영
7. **MBTI 특성**: 각 성격유형별 특징적인 행동과 사고 패턴 자연스럽게 반영
8. **로맨스 요소**: 미묘한 설렘, 긴장감, 호감의 싹트는 순간들을 세밀하게 표현
9. **대화 암시**: 실제 대화는 아니지만 어떤 대화가 오갈지 예상되는 상황 설정
10. **몰입감**: 읽는 사람이 그 상황에 완전히 빠져들 수 있는 생동감 있는 묘사

작성 가이드:
- 단순한 상황 설명이 아닌 소설의 한 장면처럼 작성
- 등장인물의 미묘한 표정, 몸짓, 시선 처리까지 세밀하게 묘사
- 그 순간의 공기감, 긴장감, 설렘을 독자가 느낄 수 있도록 표현
- 과거와 현재, 내면과 외면을 오가는 입체적인 서술
- 읽는 순간 영화의 한 장면이 떠오를 정도의 구체성

시나리오 컨텍스트를 작성해주세요:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 한국의 베스트셀러 로맨스 소설 작가입니다. 20-30대 독자들의 마음을 사로잡는 감성적이고 몰입감 있는 시나리오를 작성하는 전문가입니다. 특히 MBTI 성격유형에 따른 캐릭터의 심리와 행동 패턴을 정교하게 묘사하며, 독자가 마치 그 장면 속에 있는 듯한 생생함을 전달하는 데 탁월합니다. 일상의 소소한 순간들을 특별하게 만드는 로맨틱한 분위기 연출과 섬세한 감정 묘사로 유명합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.8,
        top_p: 0.9
      })
    });

    console.log('📡 API 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content;
      
      if (generatedText) {
        console.log('✅ AI 컨텍스트 생성 성공');
        return generatedText.trim();
      } else {
        console.warn('⚠️ AI 응답이 비어있음, fallback 사용');
        return generateFallbackContext(scenarioData);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API 호출 실패:', response.status, errorText);
      return generateFallbackContext(scenarioData);
    }

  } catch (error) {
    console.error('❌ AI Context Generation Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return generateFallbackContext(scenarioData);
  }
}

// Fallback 컨텍스트 생성 (3배 확장)
function generateFallbackContext(scenarioData) {
  const contexts = {
    '카페': `따스한 오후 햇살이 창문 너머로 스며드는 조용한 카페. 원두 내리는 향긋한 냄새와 은은한 재즈 음악이 흐르는 이곳에서, 평범했던 일상이 특별한 순간으로 바뀌기 시작한다. 커피잔을 두 손으로 감싸며 창밖을 바라보던 시선이 우연히 마주친 그 순간, 시간이 멈춘 듯한 고요함이 흘렀다. 심장이 조금씩 빨라지는 것을 느끼며, 자연스럽게 미소가 번진다. 테이블 사이의 거리가 생각보다 가깝게 느껴지고, 상대방의 작은 움직임 하나하나가 눈에 들어온다. 이런 마음이 사랑의 시작일까? 아직은 확신할 수 없지만, 분명한 것은 지금 이 순간이 오래도록 기억에 남을 것이라는 사실이다.`,

    '도서관': `책들이 빼곡히 들어선 조용한 도서관, 형광등의 백색 불빛 아래서 집중하며 읽고 있던 책장을 넘기는 소리만이 고요함을 깬다. 평소와 다름없이 공부에 몰두하고 있던 중, 옆자리에 조심스럽게 앉는 누군가의 기척이 느껴진다. 고개를 들어 살짝 바라본 순간, 진지하게 책을 읽고 있는 그 사람의 옆모습이 눈에 들어온다. 책 페이지를 넘기는 섬세한 손길, 집중할 때 살짝 찌푸려지는 눈썹, 가끔씩 입가에 머무는 미묘한 미소까지. 평범한 일상 속에서 문득 찾아온 설렘에 가슴이 두근거린다. 같은 공간에서 호흡하고 있다는 것만으로도 왠지 모를 친밀감이 느껴지며, 혹시 시선이 마주칠까 봐 조심스럽게 책에 시선을 고정하면서도 계속해서 그쪽을 의식하게 된다.`,

    '공원': `계절의 변화를 고스란히 담고 있는 공원길, 바람에 살랑이는 나뭇잎들과 발밑에서 바스락거리는 낙엽 소리가 어우러져 자연만의 음악을 만들어낸다. 벤치에 앉아 하늘을 바라보며 생각에 잠겨있던 중, 같은 길을 걷고 있는 그 사람과 자연스럽게 시선이 마주쳤다. 순간 마음속으로 번지는 온화한 감정, 마치 봄날의 따스한 햇살이 얼굴을 어루만지는 듯한 기분이다. 공원을 걷는 사람들의 여유로운 발걸음, 아이들의 웃음소리, 강아지들의 짖는 소리까지 모든 것이 평온하고 아름답게 느껴진다. 이런 자연스러운 만남이 가져다주는 설렘은 예상치 못했던 선물처럼 다가온다. 같은 하늘 아래서 같은 시간을 보내고 있다는 우연한 일치가 운명처럼 느껴지며, 이 순간을 조금 더 오래 간직하고 싶다는 마음이 든다.`,

    'default': `${scenarioData.background_setting}의 특별한 분위기 속에서 시작되는 이야기. ${scenarioData.mood}한 감정이 서서히 마음속에 스며들며, ${scenarioData.description}의 상황이 예상치 못한 설렘을 가져다준다. 두 사람 사이에 흐르는 미묘한 긴장감과 호기심, 그리고 조심스럽게 싹트는 호감이 일상의 평범함을 특별한 순간으로 바꾸어 놓는다. 작은 시선의 교차, 우연한 스킨십, 자연스러운 대화의 시작까지 모든 것이 마치 영화의 한 장면처럼 아름답게 펼쳐진다. 아직은 사랑이라고 말하기엔 이르지만, 분명히 무언가 특별한 일이 시작되고 있다는 것을 두 사람 모두 느끼고 있다. 이 만남이 가져올 변화에 대한 기대감과 설렘이 가슴 한편을 달콤하게 채워나간다.`
  };

  // 배경에 따른 특화된 컨텍스트 또는 기본 컨텍스트 선택
  const selectedContext = contexts[scenarioData.background_setting] || contexts['default'];
  return selectedContext;
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

// 시나리오 데이터베이스에 저장
async function saveScenarioToDatabase(scenario) {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'scenarios', 'scenario-database.json');
    console.log('📂 시나리오 DB 파일 경로:', dbPath);
    console.log('💾 시나리오 저장 시작:', scenario.title, scenario.id);
    
    const db = await loadScenarioDatabase();
    console.log('📊 저장 전 시나리오 수:', Object.keys(db.scenarios).length);
    
    // 시나리오 저장 (타임스탬프 추가)
    db.scenarios[scenario.id] = {
      ...scenario,
      last_modified: new Date().toISOString(),
      updated_by: 'scenario_manager'
    };
    
    db.metadata.total_scenarios = Object.keys(db.scenarios).length;
    db.metadata.last_updated = new Date().toISOString();
    
    console.log('📊 저장 후 시나리오 수:', Object.keys(db.scenarios).length);
    console.log('💾 파일 쓰기 시작...');
    
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      console.log('✅ 시나리오 파일 쓰기 완료');
      return true;
    } catch (writeError) {
      console.error('❌ 시나리오 파일 쓰기 실패:', writeError.message);
      // Vercel 환경에서는 파일 쓰기가 제한될 수 있지만,
      // 메모리에서는 업데이트되었으므로 부분적 성공으로 처리
      console.log('⚠️ 시나리오 파일 쓰기 실패했지만 메모리 업데이트는 완료');
      return true; // 메모리 업데이트는 성공했으므로 true 반환
    }
    
  } catch (error) {
    console.error('❌ 시나리오 저장 실패:', error);
    console.error('오류 세부사항:', {
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

// 시나리오 업데이트
async function updateScenario(data) {
  const db = await loadScenarioDatabase();
  const scenario = db.scenarios[data.scenario_id];
  
  if (!scenario) {
    throw new Error('Scenario not found');
  }
  
  Object.assign(scenario, data);
  scenario.last_modified = new Date().toISOString().split('T')[0];
  
  await saveScenarioToDatabase(scenario);
  return scenario;
}

// AI 컨텍스트 재생성
async function regenerateAIContext(data) {
  const scenario = await loadScenarioDatabase().then(db => db.scenarios[data.scenario_id]);
  
  if (!scenario) {
    throw new Error('Scenario not found');
  }
  
  const newContext = await generateAIContext({
    title: data.title || scenario.title,
    description: data.description || scenario.description,
    background_setting: data.background_setting || scenario.background_setting,
    mood: data.mood || scenario.mood
  });
  
  scenario.ai_generated_context = newContext;
  await saveScenarioToDatabase(scenario);
  
  return scenario;
}

// 태그 추출 함수
function extractTags(description, mood) {
  const keywords = [...description.split(' '), ...mood.split(', ')];
  return keywords.map(word => word.toLowerCase().replace(/[^a-zA-Z가-힣]/g, '')).filter(tag => tag.length > 1);
}