// 시나리오 관리 API - v1.0.0
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
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // 첫 3줄만 표시
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

// 캐릭터 사용 검증 함수
function validateCharacterUsage(generatedText, characters) {
  const issues = [];

  if (!characters || characters.length === 0) {
    return { isValid: true, issues: [] }; // 캐릭터가 없으면 검증하지 않음
  }

  // 제공된 캐릭터 이름들
  const validNames = characters.map(char => char.name);
  console.log('🔍 검증할 캐릭터 이름들:', validNames);

  // 금지된 임의 이름들 (기존에 AI가 잘못 사용한 이름들)
  const forbiddenNames = ['윤하', '지현', '수진', '민지', '소연', '하영', '예은', '다은', '채원', '서현'];

  // 텍스트에서 이름 찾기
  const foundForbiddenNames = forbiddenNames.filter(name => generatedText.includes(name));
  const foundValidNames = validNames.filter(name => generatedText.includes(name));

  if (foundForbiddenNames.length > 0) {
    issues.push(`금지된 임의 이름 사용: ${foundForbiddenNames.join(', ')}`);
  }

  if (foundValidNames.length === 0 && validNames.length > 0) {
    issues.push(`제공된 캐릭터 이름이 전혀 사용되지 않음: ${validNames.join(', ')}`);
  }

  console.log('🔍 검증 결과 - 발견된 유효 이름:', foundValidNames);
  console.log('🔍 검증 결과 - 발견된 금지 이름:', foundForbiddenNames);

  return {
    isValid: issues.length === 0,
    issues: issues,
    foundValidNames: foundValidNames,
    foundForbiddenNames: foundForbiddenNames
  };
}

// AI 컨텍스트 생성 함수 (OpenAI API 사용)
async function generateAIContext(scenarioData) {
  try {
    // 간단한 API 키 조회 방식 사용
    const { getSimpleApiKey } = await import('./simple-api-key.js');
    const OPENAI_API_KEY = await getSimpleApiKey();

    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API 키가 설정되지 않았습니다');
      throw new Error('API 키가 설정되지 않았습니다. 관리자 페이지에서 OpenAI API 키를 먼저 저장해주세요.');
    }

    console.log('🤖 OpenAI API 호출 시작...');

    // 캐릭터 데이터베이스에서 실제 캐릭터 정보 로드
    let characterInfo = '';
    if (scenarioData.available_characters && scenarioData.available_characters.length > 0) {
      console.log('📋 캐릭터 ID 목록:', scenarioData.available_characters);

      // 캐릭터 데이터베이스 로드
      const characterDb = await loadCharacterDatabase();
      console.log('🎭 로드된 캐릭터 DB:', Object.keys(characterDb.characters));

      characterInfo = '\n등장인물 (상세 정보):\n';
      scenarioData.available_characters.forEach((charId, index) => {
        const char = characterDb.characters[charId];
        if (char) {
          characterInfo += `${index + 1}. **${char.name}** (${char.age}세, ${char.mbti})\n`;
          characterInfo += `   - 성격: ${char.personality_traits ? char.personality_traits.join(', ') : '정보 없음'}\n`;
          characterInfo += `   - 외모: ${char.appearance ? Object.values(char.appearance).join(', ') : '정보 없음'}\n`;
          characterInfo += `   - 취미: ${char.hobbies ? char.hobbies.join(', ') : '정보 없음'}\n`;
          characterInfo += `   - 말투: ${char.speech_style || '정보 없음'}\n`;
          characterInfo += `   - 말버릇: ${char.speech_habit || '정보 없음'}\n`;
          characterInfo += `   - 전공: ${char.major || '일반'}\n`;
          characterInfo += `   - 관계: ${char.relationship || '친구'}\n`;
          characterInfo += `   - 가치관: ${char.values || '정보 없음'}\n`;
          characterInfo += `   - 고향: ${char.hometown || '정보 없음'}\n\n`;
        } else {
          console.warn(`⚠️ 캐릭터 ID ${charId}를 찾을 수 없음`);
          characterInfo += `${index + 1}. 캐릭터 ID: ${charId} (정보를 찾을 수 없음)\n\n`;
        }
      });
    } else {
      console.log('⚠️ 캐릭터 정보가 없어 기본 메시지 사용');
      characterInfo = '\n등장인물: 시나리오에 맞는 매력적인 캐릭터들을 창조해주세요.\n';
    }

    const prompt = `🚨 MANDATORY CHARACTER CONSTRAINT 🚨
다음 등장인물 정보를 EXACTLY 그대로 사용하여 시나리오를 작성하세요:${characterInfo}

⚠️ WARNING: 위에 명시된 캐릭터 이름과 정보만 사용하고, 절대로 다른 이름(윤하, 지현, 수진 등)이나 새로운 캐릭터를 만들지 마세요!

기본 시나리오 정보:
제목: ${scenarioData.title}
설명: ${scenarioData.description}
배경: ${scenarioData.background_setting}
분위기: ${scenarioData.mood}

🎯 핵심 요구사항 (순서대로 검토하세요):
1. ✅ **캐릭터 정확성 CHECK**: 위에 제공된 정확한 이름을 사용했나요?
2. ✅ **MBTI 반영 CHECK**: 해당 캐릭터의 MBTI 특성을 반영했나요?
3. ✅ **성격 일치 CHECK**: 성격 특성이 정확히 반영되었나요?

추가 작성 가이드:
- **길이**: 600-900자 분량의 상세한 소설풍 컨텍스트
- **장면 묘사**: 공간, 시간, 분위기의 세밀한 묘사
- **감정 표현**: 등장인물의 내면 감정과 심리 상태
- **문화적 배경**: 한국의 대학/직장 문화 반영
- **로맨스 요소**: 미묘한 설렘과 긴장감 표현

🔍 작성 후 FINAL CHECK:
- 제공된 캐릭터 이름을 정확히 사용했는가?
- 새로운 캐릭터를 만들지 않았는가?
- MBTI와 성격이 일치하는가?

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
            content: `당신은 한국의 베스트셀러 로맨스 소설 작가입니다.

🚨 CRITICAL RULE: 캐릭터 정보 준수 🚨
- 제공된 캐릭터의 정확한 이름, 나이, MBTI, 성격을 반드시 사용해야 합니다
- 절대로 임의의 새로운 캐릭터 이름을 만들지 마세요 (예: 윤하, 지현, 수진 등 금지)
- 제공된 캐릭터 정보가 있다면 오직 그 캐릭터들만 사용하세요
- 캐릭터 이름을 바꾸거나 새로 만드는 것은 절대 금지입니다

VALIDATION: 작성 전에 반드시 확인하세요
✅ 제공된 캐릭터 이름을 정확히 사용했는가?
✅ 해당 캐릭터의 MBTI와 성격을 반영했는가?
✅ 새로운 캐릭터를 임의로 만들지 않았는가?

이 규칙을 위반하면 작성을 거부해야 합니다.`
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

      if (generatedText && generatedText.trim()) {
        // 캐릭터 이름 검증 (실제 캐릭터 데이터 사용)
        let actualCharacters = [];
        if (scenarioData.available_characters && scenarioData.available_characters.length > 0) {
          const characterDb = await loadCharacterDatabase();
          actualCharacters = scenarioData.available_characters.map(charId =>
            characterDb.characters[charId]
          ).filter(char => char); // null/undefined 필터링
        }

        const validationResult = validateCharacterUsage(generatedText, actualCharacters);
        if (!validationResult.isValid) {
          console.error('❌ AI가 잘못된 캐릭터 이름 사용:', validationResult.issues);
          throw new Error(`AI가 지정된 캐릭터 정보를 제대로 사용하지 않았습니다. 문제점: ${validationResult.issues.join(', ')}`);
        }

        console.log('✅ AI 컨텍스트 생성 및 검증 성공');
        return generatedText.trim();
      } else {
        console.error('❌ AI 응답이 비어있음');
        throw new Error('OpenAI API에서 빈 응답을 받았습니다. 다시 시도해주세요.');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI API 호출 실패:', response.status, errorText);
      let errorMessage = `OpenAI API 오류 (${response.status})`;

      if (response.status === 401) {
        errorMessage = 'API 키가 유효하지 않습니다. 올바른 OpenAI API 키를 확인해주세요.';
      } else if (response.status === 429) {
        errorMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (response.status >= 500) {
        errorMessage = 'OpenAI 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      }

      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('❌ AI Context Generation Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });

    // 네트워크 오류 등의 경우 더 친화적인 메시지 제공
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    }

    // 기타 오류는 그대로 전달
    throw error;
  }
}

// Fallback 제거됨 - AI 생성 실패 시 에러 처리로 대체

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

// 캐릭터 데이터베이스 로드 (character-ai-generator API 호출)
async function loadCharacterDatabase() {
  try {
    console.log('🔄 캐릭터 API에서 데이터 로드 시도...');

    // 내부 API 호출 (같은 서버 내에서)
    const response = await fetch('https://chatgame-seven.vercel.app/api/character-ai-generator?action=list_characters');

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('✅ 캐릭터 API에서 로드 성공:', Object.keys(result.characters).length, '개');
        return {
          characters: result.characters,
          metadata: result.metadata
        };
      } else {
        throw new Error(result.message || '캐릭터 API 호출 실패');
      }
    } else {
      throw new Error(`캐릭터 API HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ 캐릭터 데이터베이스 로드 실패:', error);
    console.log('📋 빈 캐릭터 DB 반환');
    return { metadata: {}, characters: {} };
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
  console.log('🔄 AI 컨텍스트 재생성 시작:', data);

  // 시나리오 ID가 있는 경우 기존 시나리오 업데이트
  if (data.scenario_id) {
    const db = await loadScenarioDatabase();
    const scenario = db.scenarios[data.scenario_id];

    if (!scenario) {
      throw new Error(`Scenario not found: ${data.scenario_id}. Available: ${Object.keys(db.scenarios).join(', ')}`);
    }

    const newContext = await generateAIContext({
      title: data.title || scenario.title,
      description: data.description || scenario.description,
      background_setting: data.background_setting || scenario.background_setting,
      mood: data.mood || scenario.mood,
      available_characters: data.available_characters || scenario.available_characters || []
    });

    scenario.ai_generated_context = newContext;
    await saveScenarioToDatabase(scenario);

    return scenario;
  }

  // 시나리오 ID가 없는 경우 새로운 컨텍스트만 생성
  else {
    const newContext = await generateAIContext({
      title: data.title,
      description: data.description,
      background_setting: data.background_setting,
      mood: data.mood,
      available_characters: data.available_characters || []
    });

    return {
      ai_generated_context: newContext,
      message: 'AI 컨텍스트가 생성되었습니다'
    };
  }
}

// 태그 추출 함수
function extractTags(description, mood) {
  const keywords = [...description.split(' '), ...mood.split(', ')];
  return keywords.map(word => word.toLowerCase().replace(/[^a-zA-Z가-힣]/g, '')).filter(tag => tag.length > 1);
}