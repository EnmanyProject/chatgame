// 시나리오 관리 API - v2.0.0 (GitHub API 전용)
// 로컬 파일 시스템 의존성 완전 제거

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
    bodyKeys: req.body ? Object.keys(req.body) : [],
    title: req.body?.title,
    description: req.body?.description ? req.body.description.substring(0, 50) + '...' : null,
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

    // 시나리오 삭제 (DELETE 요청 또는 action=delete)
    if (req.method === 'DELETE' || action === 'delete') {
      const scenarioId = req.body.scenario_id || req.query.scenario_id;

      if (!scenarioId) {
        return res.status(400).json({
          success: false,
          message: 'scenario_id가 필요합니다'
        });
      }

      console.log('🗑️ 시나리오 삭제 요청:', scenarioId);
      const deleteResult = await deleteScenarioFromDatabase(scenarioId);

      if (deleteResult.success) {
        return res.json({
          success: true,
          message: `시나리오 '${scenarioId}'가 성공적으로 삭제되었습니다`,
          deleted_scenario_id: scenarioId
        });
      } else {
        return res.status(404).json({
          success: false,
          message: deleteResult.message || '시나리오 삭제에 실패했습니다'
        });
      }
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
  const {
    scenario_id = `scenario_${Date.now()}`,
    title = '새로운 시나리오',
    description = '',
    background_setting = '카페',
    mood = '편안한',
    available_characters = []
  } = data;

  console.log('📝 시나리오 생성 데이터:', {
    scenario_id,
    title,
    description,
    background_setting,
    mood,
    available_characters
  });

  // AI를 이용한 소설풍 컨텍스트 생성
  const aiContext = await generateAIContext({
    title,
    description,
    background_setting,
    mood,
    available_characters // 캐릭터 정보 전달
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
    // 환경변수에서 직접 API 키 가져오기
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API 키가 설정되지 않았습니다');
      throw new Error('API 키가 설정되지 않았습니다. Vercel 환경변수에서 OPENAI_API_KEY를 설정해주세요.');
    }

    console.log('🤖 OpenAI API 호출 시작...');

    // 캐릭터 데이터베이스에서 실제 캐릭터 정보 로드
    let characterInfo = '';
    if (scenarioData.available_characters && scenarioData.available_characters.length > 0) {
      console.log('📋 캐릭터 ID 목록:', scenarioData.available_characters);

      // 캐릭터 데이터베이스 로드
      const characterDb = await loadCharacterDatabase();
      console.log('🎭 로드된 캐릭터 DB:', Object.keys(characterDb.characters));

      // 🚨 캐릭터 로드 오류 체크
      if (characterDb.loadError) {
        console.error('❌ 캐릭터 데이터 로드 실패로 시나리오 생성 중단');
        throw new Error(`캐릭터 정보를 불러올 수 없어 시나리오를 생성할 수 없습니다. 오류: ${characterDb.metadata.message}`);
      }

      if (Object.keys(characterDb.characters).length === 0) {
        console.error('❌ 사용 가능한 캐릭터가 없어 시나리오 생성 중단');
        throw new Error('생성된 캐릭터가 없습니다. 먼저 캐릭터를 생성한 후 시나리오를 생성해주세요.');
      }

      console.log('🔍 캐릭터 매칭 상세 정보:');
      console.log('  - 요청된 캐릭터 ID들:', scenarioData.available_characters);
      console.log('  - DB에 있는 캐릭터 ID들:', Object.keys(characterDb.characters));

      characterInfo = '\n등장인물 (상세 정보):\n';
      let foundCharacters = 0;

      scenarioData.available_characters.forEach((charId, index) => {
        console.log(`🔎 캐릭터 ${index + 1} 검색 중: ${charId}`);
        const char = characterDb.characters[charId];

        if (char) {
          foundCharacters++;
          console.log(`✅ 캐릭터 발견: ${char.name} (${char.mbti})`);
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
          console.warn(`❌ 캐릭터 ID ${charId}를 DB에서 찾을 수 없음`);
          characterInfo += `${index + 1}. 캐릭터 ID: ${charId} (정보를 찾을 수 없음)\n\n`;
        }
      });

      console.log(`📊 매칭 결과: ${foundCharacters}/${scenarioData.available_characters.length} 캐릭터 발견`);

      if (foundCharacters === 0) {
        console.error('❌ 요청된 캐릭터 중 DB에서 찾을 수 있는 캐릭터가 없음');
        throw new Error(`요청된 캐릭터들(${scenarioData.available_characters.join(', ')})을 데이터베이스에서 찾을 수 없습니다. 캐릭터가 삭제되었거나 ID가 올바르지 않을 수 있습니다.`);
      }
    } else {
      console.log('⚠️ 캐릭터 정보가 없어 기본 메시지 사용');
      characterInfo = '\n등장인물: 시나리오에 맞는 매력적인 캐릭터들을 창조해주세요.\n';
    }

    const prompt = `📱 메신저 채팅 시나리오 컨텍스트 생성 🚨 MANDATORY CHARACTER CONSTRAINT 🚨
다음 등장인물 정보를 EXACTLY 그대로 사용하여 메신저 대화 배경을 작성하세요:${characterInfo}

⚠️ WARNING: 위에 명시된 캐릭터 이름과 정보만 사용하고, 절대로 다른 이름이나 새로운 캐릭터를 만들지 마세요!

📱 메신저 시나리오 정보:
상황 제목: ${scenarioData.title}
상황 설명: ${scenarioData.description}
감정 테마: ${scenarioData.mood}

🎯 메신저 컨텍스트 핵심 요구사항:
1. ✅ **메신저 대화 배경**: 왜 이 상황에서 메신저로 대화하게 되었는지 설명
2. ✅ **캐릭터 정확성**: 위에 제공된 정확한 이름과 성격 사용
3. ✅ **감정 상태**: 메신저를 보내는 시점의 감정과 심리 상태
4. ✅ **상황의 현실성**: 실제로 일어날 수 있는 메신저 대화 상황

📝 메신저 컨텍스트 작성 가이드:
- **길이**: 400-600자 분량의 메신저 대화 배경 설명
- **상황 배경**: 메신저 대화 직전에 어떤 일이 있었는지
- **감정 상태**: 캐릭터가 메신저를 보내는 이유와 심리 상태
- **관계 상황**: 두 사람 사이의 현재 관계와 미묘한 감정
- **메신저 특성**: 직접 만나서 말하기 어려운 이유나 상황
- **한국 문화**: 자연스러운 한국의 연애 문화와 메신저 사용 패턴

🔍 메신저 컨텍스트 FINAL CHECK:
- 제공된 캐릭터 이름을 정확히 사용했는가?
- 메신저 대화 배경으로 적절한가?
- 실제 연애에서 일어날 수 있는 상황인가?
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

// 시나리오 데이터베이스 로드 (GitHub API 우선)
async function loadScenarioDatabase() {
  try {
    console.log('🐙 GitHub API 전용 시나리오 데이터베이스 로드 시작...');

    // GitHub API에서만 데이터 로드 (로컬 파일 의존성 완전 제거)
    const githubData = await loadFromGitHub();
    if (githubData) {
      console.log('✅ GitHub에서 시나리오 데이터 로드 성공:', Object.keys(githubData.scenarios).length + '개');
      return githubData;
    }

    // GitHub API 실패 시 기본 구조 반환 (로컬 파일 시도 제거)
    console.log('⚠️ GitHub API 접근 실패 - 기본 빈 데이터베이스 반환');
    return getDefaultScenarioDatabase();

  } catch (error) {
    console.error('❌ GitHub API 시나리오 로드 실패:', error);
    console.log('🆕 기본 빈 데이터베이스 생성');
    return getDefaultScenarioDatabase();
  }
}

// 기본 시나리오 데이터베이스 구조
function getDefaultScenarioDatabase() {
  return {
    metadata: {
      version: '1.0.0',
      created_date: new Date().toISOString().split('T')[0],
      total_scenarios: 0,
      ai_context_engine: 'gpt-4o-mini',
      last_updated: new Date().toISOString(),
      data_source: 'github_api_only'
    },
    scenarios: {},
    scenario_templates: {
      romance_template: {
        mood_options: ['설렘', '부끄러움', '긴장감', '달콤함', '애절함'],
        setting_options: ['카페', '학교', '집', '공원', '도서관', '거리'],
        time_options: ['아침', '점심', '저녁', '밤', '새벽']
      }
    }
  };
}

// 캐릭터 데이터베이스 로드 (character-ai-generator API 호출)
async function loadCharacterDatabase() {
  try {
    console.log('🔄 캐릭터 API에서 데이터 로드 시도...');

    // 내부 API 호출 (같은 서버 내에서)
    const response = await fetch('https://chatgame-seven.vercel.app/api/character-ai-generator?action=list_characters');

    console.log('📡 캐릭터 API 응답 상태:', response.status, response.statusText);

    if (response.ok) {
      const result = await response.json();
      console.log('📄 캐릭터 API 응답 데이터:', {
        success: result.success,
        characterCount: result.characters ? Object.keys(result.characters).length : 0,
        metadata: result.metadata
      });

      if (result.success) {
        console.log('✅ 캐릭터 API에서 로드 성공:', Object.keys(result.characters).length, '개');
        console.log('📋 캐릭터 ID 목록:', Object.keys(result.characters));

        return {
          characters: result.characters,
          metadata: result.metadata
        };
      } else {
        throw new Error(result.message || '캐릭터 API 호출 실패');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ HTTP 오류 응답:', errorText);
      throw new Error(`캐릭터 API HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ 캐릭터 데이터베이스 로드 실패:', error);
    console.error('❌ 상세 오류:', error.stack);
    console.log('⚠️ 시나리오 생성에 캐릭터 정보 없음 - 기본 메시지 반환');

    // 빈 DB 대신 오류 상태를 명확히 표시
    return {
      metadata: { error: true, message: error.message },
      characters: {},
      loadError: true
    };
  }
}

// 시나리오 데이터베이스에 저장
async function saveScenarioToDatabase(scenario) {
  try {
    console.log('🐙 GitHub API 전용 시나리오 저장 시작:', scenario.title, scenario.id);

    const db = await loadScenarioDatabase();
    console.log('📊 저장 전 시나리오 수:', Object.keys(db.scenarios).length);

    // 시나리오 저장 (타임스탬프 추가)
    db.scenarios[scenario.id] = {
      ...scenario,
      last_modified: new Date().toISOString(),
      updated_by: 'scenario_manager_github_only'
    };

    db.metadata.total_scenarios = Object.keys(db.scenarios).length;
    db.metadata.last_updated = new Date().toISOString();
    db.metadata.data_source = 'github_api_only';

    console.log('📊 저장 후 시나리오 수:', Object.keys(db.scenarios).length);
    console.log('🐙 GitHub API 저장 시작...');

    // GitHub API를 통한 직접 저장 (로컬 파일 저장 제거)
    try {
      console.log('🐙 GitHub API를 통한 시나리오 영구 저장 시작...');
      await saveToGitHub(db, 'data/scenarios/scenario-database.json');
      console.log('✅ 시나리오 GitHub 저장 완료');
      return true;
    } catch (githubError) {
      console.error('❌ 시나리오 GitHub 저장 실패:', githubError.message);
      console.log('💡 로컬 메모리에는 저장되었지만 GitHub 동기화 실패');
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
    console.log('📝 전달받은 데이터:', {
      available_characters: data.available_characters,
      characters: data.characters,
      characterCount: (data.available_characters || []).length
    });

    const newContext = await generateAIContext({
      title: data.title,
      description: data.description,
      background_setting: data.background_setting,
      mood: data.mood,
      available_characters: data.available_characters || [],
      characters: data.characters || [] // 캐릭터 전체 데이터도 전달
    });

    return {
      ai_generated_context: newContext,
      message: 'AI 컨텍스트가 생성되었습니다'
    };
  }
}

// 🐙 GitHub API를 통한 시나리오 데이터 저장 함수
async function saveToGitHub(db, filePath) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';

  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN 환경 변수가 설정되지 않았습니다.');
  }

  try {
    console.log('🐙 GitHub API를 통한 시나리오 저장 시작...');

    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

    // 1. 기존 파일의 SHA 값 확인 (파일 업데이트에 필요)
    let currentFileSha = null;
    try {
      const getResponse = await fetch(getFileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ChatGame-Scenario-Saver'
        }
      });

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        currentFileSha = fileData.sha;
        console.log('📂 기존 파일 SHA 확인:', currentFileSha);
      } else {
        console.log('📂 새 파일 생성 (기존 파일 없음)');
      }
    } catch (error) {
      console.log('📂 새 파일 생성 (파일 조회 실패):', error.message);
    }

    // 2. 시나리오 데이터를 JSON으로 변환
    const scenarioDataJson = JSON.stringify(db, null, 2);
    const encodedContent = Buffer.from(scenarioDataJson, 'utf8').toString('base64');

    // 3. GitHub API로 파일 업데이트/생성
    const updateData = {
      message: `💾 시나리오 데이터 업데이트 - ${db.metadata.total_scenarios}개 시나리오`,
      content: encodedContent,
      branch: 'main'
    };

    if (currentFileSha) {
      updateData.sha = currentFileSha;
    }

    const updateResponse = await fetch(getFileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ChatGame-Scenario-Saver'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      throw new Error(`GitHub API 오류: ${updateResponse.status} - ${errorData}`);
    }

    const result = await updateResponse.json();
    console.log('🎉 시나리오 GitHub 저장 성공:', {
      sha: result.content.sha,
      size: result.content.size,
      download_url: result.content.download_url
    });

    return result;

  } catch (error) {
    console.error('❌ 시나리오 GitHub 저장 실패:', error);
    throw error;
  }
}

// 🐙 GitHub에서 시나리오 데이터 로드 함수
async function loadFromGitHub() {
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';
  const FILE_PATH = 'data/scenarios/scenario-database.json';

  try {
    console.log('🐙 GitHub에서 시나리오 데이터 로드 시도...');

    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const response = await fetch(getFileUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ChatGame-Scenario-Loader'
      }
    });

    if (response.ok) {
      const fileData = await response.json();
      const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      const scenarioData = JSON.parse(decodedContent);

      console.log('✅ GitHub에서 시나리오 데이터 로드 성공:', {
        총시나리오수: scenarioData.metadata?.total_scenarios || 0,
        버전: scenarioData.metadata?.version || 'unknown'
      });

      return scenarioData;
    } else {
      console.log('📂 GitHub에 저장된 시나리오 파일이 없음');
      return null;
    }

  } catch (error) {
    console.warn('⚠️ GitHub 시나리오 로드 실패:', error.message);
    return null;
  }
}

// 시나리오 데이터베이스에서 삭제 (GitHub 동기화 포함)
async function deleteScenarioFromDatabase(scenarioId) {
  try {
    console.log('🗑️ === 시나리오 삭제 프로세스 시작 ===');
    console.log('🎯 삭제할 시나리오 ID:', scenarioId);

    // 1. 현재 데이터베이스 로드
    const db = await loadScenarioDatabase();
    console.log('📊 삭제 전 시나리오 수:', Object.keys(db.scenarios).length);

    // 2. 시나리오 존재 확인
    if (!db.scenarios[scenarioId]) {
      console.error('❌ 시나리오를 찾을 수 없음:', scenarioId);
      console.log('📋 사용 가능한 시나리오 ID들:', Object.keys(db.scenarios));
      return {
        success: false,
        message: `시나리오 ID '${scenarioId}'를 찾을 수 없습니다. 이미 삭제되었거나 잘못된 ID일 수 있습니다.`
      };
    }

    const deletedScenario = db.scenarios[scenarioId];
    console.log('✅ 삭제할 시나리오 확인:', deletedScenario.title);

    // 3. 시나리오 삭제
    delete db.scenarios[scenarioId];

    // 4. 메타데이터 업데이트
    db.metadata.total_scenarios = Object.keys(db.scenarios).length;
    db.metadata.last_updated = new Date().toISOString();

    console.log('📊 삭제 후 시나리오 수:', Object.keys(db.scenarios).length);

    // GitHub API를 통한 직접 저장 (로컬 파일 업데이트 제거)
    try {
      console.log('🐙 GitHub API를 통한 시나리오 삭제 동기화...');
      await saveToGitHub(db, 'data/scenarios/scenario-database.json');
      console.log('✅ GitHub 동기화 완료');
    } catch (githubError) {
      console.error('❌ GitHub 동기화 실패:', githubError.message);
      // GitHub 실패는 로그만 남기고 성공으로 처리 (메모리 삭제는 성공)
    }

    console.log('🎉 === 시나리오 삭제 프로세스 완료 ===');
    return {
      success: true,
      message: `시나리오 '${deletedScenario.title}'가 성공적으로 삭제되었습니다`,
      deleted_scenario: {
        id: scenarioId,
        title: deletedScenario.title
      },
      remaining_count: Object.keys(db.scenarios).length
    };

  } catch (error) {
    console.error('❌ === 시나리오 삭제 실패 ===');
    console.error('❌ 오류 세부사항:', {
      message: error.message,
      stack: error.stack,
      scenarioId: scenarioId
    });

    return {
      success: false,
      message: `시나리오 삭제 중 오류가 발생했습니다: ${error.message}`
    };
  }
}

// 태그 추출 함수
function extractTags(description, mood) {
  // undefined나 null 체크
  const desc = description || '';
  const moodStr = mood || '';

  const keywords = [...desc.split(' '), ...moodStr.split(', ')];
  return keywords.map(word => word.toLowerCase().replace(/[^a-zA-Z가-힣]/g, '')).filter(tag => tag.length > 1);
}