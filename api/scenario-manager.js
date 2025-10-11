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

      try {
        const scenarios = await loadScenarioDatabase();
        console.log('📊 로드된 시나리오 수:', Object.keys(scenarios.scenarios).length);
        console.log('📝 시나리오 ID 목록:', Object.keys(scenarios.scenarios));

        return res.json({
          success: true,
          scenarios: scenarios.scenarios,
          metadata: scenarios.metadata
        });
      } catch (error) {
        console.error('❌ 시나리오 목록 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: `시나리오 목록 조회 실패: ${error.message}`,
          error_type: 'SCENARIO_DATABASE_ERROR',
          troubleshooting: [
            'GitHub API 연결 상태 확인',
            'Vercel 환경변수 설정 확인',
            '인터넷 연결 상태 확인',
            'Repository 접근 권한 확인'
          ]
        });
      }
    }

    // 새 시나리오 생성 (AI 컨텍스트 자동 생성)
    if (action === 'create') {
      try {
        console.log('🚀 시나리오 생성 시작...');
        console.log('📥 받은 데이터:', JSON.stringify(req.body, null, 2));
        const newScenario = await createNewScenario(req.body);
        console.log('✅ 시나리오 생성 완료:', newScenario.id);
        return res.json({
          success: true,
          scenario: newScenario,
          message: 'AI 컨텍스트가 자동 생성된 시나리오가 생성되었습니다'
        });
      } catch (error) {
        console.error('❌ 시나리오 생성 실패:', error);
        console.error('❌ 오류 스택:', error.stack);
        return res.status(500).json({
          success: false,
          message: `시나리오 생성 실패: ${error.message}`,
          error_type: 'SCENARIO_CREATE_ERROR',
          error_details: error.stack,
          troubleshooting: [
            'OpenAI API 키 확인',
            'GitHub API 연결 확인',
            'JSON 데이터 형식 확인',
            'Vercel 환경변수 설정 확인'
          ]
        });
      }
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
      try {
        console.log('🎯 AI 컨텍스트 재생성 요청 받음:', {
          bodyKeys: Object.keys(req.body),
          scenario_id: req.body.scenario_id,
          title: req.body.title,
          characterCount: req.body.available_characters ? req.body.available_characters.length : 0
        });

        const scenario = await regenerateAIContext(req.body);

        console.log('✅ AI 컨텍스트 재생성 완료');
        return res.json({
          success: true,
          scenario,
          message: 'AI 컨텍스트가 재생성되었습니다'
        });
      } catch (error) {
        console.error('❌ AI 컨텍스트 재생성 실패:', error);
        console.error('❌ 오류 상세:', error.stack);
        return res.status(500).json({
          success: false,
          message: `AI 컨텍스트 재생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
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

    // 🗑️ Step 6: 모든 시나리오 초기화 (v2.0.0 전환용)
    if (action === 'reset_all_scenarios') {
      try {
        console.log('⚠️ === 모든 시나리오 초기화 요청 ===');
        console.log('📦 받은 빈 데이터 구조:', JSON.stringify(req.body.data, null, 2));

        const emptyData = req.body.data;

        // GitHub에 빈 데이터 저장
        console.log('📤 GitHub에 빈 scenario-database.json 저장 중...');
        await saveToGitHub('data/scenarios/scenario-database.json', JSON.stringify(emptyData, null, 2));

        console.log('✅ GitHub에 빈 데이터 저장 완료');
        console.log('🎉 === 모든 시나리오 초기화 완료 ===');

        return res.json({
          success: true,
          message: '모든 시나리오가 삭제되었습니다. v2.0.0으로 전환 완료!'
        });
      } catch (error) {
        console.error('❌ === 모든 시나리오 초기화 실패 ===');
        console.error('❌ 오류 상세:', error);
        console.error('❌ 스택 트레이스:', error.stack);

        return res.status(500).json({
          success: false,
          message: `시나리오 초기화 실패: ${error.message}`,
          error_details: error.stack
        });
      }
    }

    // AI 시나리오 구조 자동 생성
    if (action === 'generate_scenario_structure') {
      try {
        console.log('🤖 AI 시나리오 구조 생성 시작...');
        console.log('📥 받은 데이터:', JSON.stringify(req.body, null, 2));

        const { title, description } = req.body;

        if (!title || !description) {
          return res.status(400).json({
            success: false,
            message: '제목과 설명이 필요합니다'
          });
        }

        const structure = await generateScenarioStructure({ title, description });

        console.log('✅ AI 시나리오 구조 생성 완료');
        return res.json({
          success: true,
          structure,
          message: 'Acts & Beats 구조가 자동 생성되었습니다'
        });
      } catch (error) {
        console.error('❌ AI 시나리오 구조 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: `AI 시나리오 구조 생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
    }

    // 📖 기승전결 구조 자동 생성 (신규 시스템 + 멀티 AI 모델)
    if (action === 'generate_story_structure') {
      try {
        console.log('📖 기승전결 구조 AI 생성 시작...');
        console.log('📥 받은 데이터:', JSON.stringify(req.body, null, 2));

        const { title, description, genre, ai_model, tone, sexy_level } = req.body;

        if (!title || !description) {
          return res.status(400).json({
            success: false,
            message: '제목과 설명이 필요합니다'
          });
        }

        console.log('🎨 선택된 분위기:', tone || 'balanced (기본)');
        console.log('🔥 섹시 레벨:', sexy_level || '5 (기본)');

        const structure = await generateKiSeungJeonGyeolStructure({
          title,
          description,
          genre,
          aiModel: ai_model || 'openai',
          tone: tone || 'balanced',  // 분위기 파라미터 추가
          sexyLevel: sexy_level || 5  // 섹시 레벨 파라미터 추가
        });

        console.log('✅ 기승전결 구조 생성 완료');
        return res.json({
          success: true,
          structure,
          message: '기승전결 구조가 자동 생성되었습니다'
        });
      } catch (error) {
        console.error('❌ 기승전결 구조 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: `기승전결 구조 생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
    }

    // Acts & Beats 기반 소설풍 스토리 생성
    if (action === 'generate_story_from_structure') {
      try {
        console.log('📖 Acts & Beats 기반 스토리 생성 시작...');

        const { title, description, structure } = req.body;

        if (!title || !structure || !structure.acts) {
          return res.status(400).json({
            success: false,
            message: '제목과 Acts & Beats 구조가 필요합니다'
          });
        }

        const story = await generateStoryFromStructure({ title, description, structure });

        console.log('✅ 소설풍 스토리 생성 완료');
        return res.json({
          success: true,
          story,
          message: 'Acts & Beats 기반 소설풍 스토리가 생성되었습니다'
        });
      } catch (error) {
        console.error('❌ 스토리 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: `스토리 생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
    }

    // 기승전결 기반 장문 소설풍 스토리 생성 (멀티 AI 모델)
    if (action === 'generate_story_from_ki_seung_jeon_gyeol') {
      try {
        console.log('📖 기승전결 기반 장문 스토리 생성 시작...');

        const { title, description, structure, ai_model, tone } = req.body;

        if (!title || !structure || !structure.beginning || !structure.buildup || !structure.climax || !structure.resolution) {
          return res.status(400).json({
            success: false,
            message: '제목과 완전한 기승전결 구조(beginning, buildup, climax, resolution)가 필요합니다'
          });
        }

        const story = await generateStoryFromKiSeungJeonGyeol({
          title,
          description,
          structure,
          aiModel: ai_model || 'openai',
          tone: tone || 'balanced'  // 분위기 파라미터 추가
        });

        console.log('✅ 기승전결 기반 장문 스토리 생성 완료');
        return res.json({
          success: true,
          story,
          message: '기승전결 기반 장문 소설풍 스토리가 생성되었습니다'
        });
      } catch (error) {
        console.error('❌ 기승전결 스토리 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: `기승전결 스토리 생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
    }

    // AI 프롬프트 저장
    if (action === 'save_ai_prompts') {
      try {
        console.log('💾 AI 프롬프트 저장 시작...');

        const { prompts } = req.body;

        if (!prompts) {
          return res.status(400).json({
            success: false,
            message: 'AI 프롬프트 데이터가 필요합니다'
          });
        }

        // GitHub API를 사용하여 저장
        const owner = 'EnmanyProject';
        const repo = 'chatgame';
        const path = 'data/ai-prompts.json';
        const githubToken = process.env.GITHUB_TOKEN;

        if (!githubToken) {
          throw new Error('GitHub Token이 설정되지 않았습니다');
        }

        // 현재 파일의 SHA 가져오기
        const getFileResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        const fileData = await getFileResponse.json();
        const currentSha = fileData.sha;

        // 새 데이터를 base64로 인코딩
        const content = Buffer.from(JSON.stringify(prompts, null, 2)).toString('base64');

        // GitHub에 파일 업데이트
        const updateResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Update AI prompts - ${new Date().toISOString()}`,
              content,
              sha: currentSha
            })
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(`GitHub 업데이트 실패: ${errorData.message}`);
        }

        console.log('✅ AI 프롬프트 GitHub 저장 완료');
        return res.json({
          success: true,
          message: 'AI 프롬프트가 성공적으로 저장되었습니다',
          prompts
        });

      } catch (error) {
        console.error('❌ AI 프롬프트 저장 실패:', error);
        return res.status(500).json({
          success: false,
          message: `AI 프롬프트 저장 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
    }

    // 📐 Step 1: 대화 구조만 빠르게 생성 (v2.0.0 - 2단계 생성 방식)
    if (action === 'generate_dialogue_structure') {
      try {
        console.log('📐 Step 1: 대화 구조 생성 시작...');

        const { title, description, genre, sexy_level, mood, total_choices, ai_model } = req.body;

        if (!title || !description || !genre || !sexy_level || !mood || !total_choices) {
          return res.status(400).json({
            success: false,
            message: '필수 파라미터가 누락되었습니다',
            received: { title, description, genre, sexy_level, mood, total_choices }
          });
        }

        // AI 프롬프트 로드
        const promptsData = await loadFromGitHub('data/ai-prompts.json');
        const prompts = JSON.parse(promptsData);

        if (!prompts.dialogue_generation) {
          throw new Error('dialogue_generation 프롬프트가 없습니다');
        }

        const dialoguePrompts = prompts.dialogue_generation;

        // tone_settings 체크
        let toneSettings = prompts.tone_settings[mood];
        if (!toneSettings) {
          console.warn(`⚠️ tone_settings[${mood}] 없음, balanced 사용`);
          toneSettings = prompts.tone_settings['balanced'];
        }

        // 구조 생성용 간결한 프롬프트
        const systemPrompt = `당신은 한국 로맨스 메신저 대화 구조 설계자입니다.
대화의 전체 흐름과 구조만 간결하게 설계합니다.

각 블록은 다음 정보만 포함:
- type: "message" (캐릭터 메시지) | "choice" (선택지) | "user_input" (사용자 입력)
- summary: 1-2문장 요약 (실제 대사 아님)
- emotion: neutral, shy, excited, sad, angry, longing, playful, serious 중 하나

선택지는 5-7개 메시지마다 1개씩 배치하고, 각 옵션의 affection_change만 표시합니다.
반드시 JSON 형식으로만 응답하세요.`;

        const userPrompt = `다음 조건으로 메신저 대화 구조를 설계하세요:

제목: ${title}
설명: ${description}
장르: ${genre}
섹시 레벨: ${sexy_level}/10
분위기: ${mood}
선택지 개수: ${total_choices}개

출력 형식 (JSON):
{
  "structure": [
    { "id": 1, "type": "message", "summary": "캐릭터가 먼저 톡을 보냄", "emotion": "neutral" },
    { "id": 5, "type": "choice", "question_summary": "어떻게 답할까?", "options_count": 3 },
    ...
  ],
  "total_messages": 예상 메시지 수,
  "total_choices": ${total_choices}
}`;

        let structureData;

        // OpenAI API
        if (!ai_model || ai_model === 'openai') {
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
          }

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: "json_object" },
              temperature: toneSettings.temperature,
              max_tokens: 800 // 구조만 생성 - 빠름!
            })
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI API 오류: ${response.status} - ${errorBody}`);
          }

          const result = await response.json();
          const content = result.choices[0].message.content;
          structureData = JSON.parse(content);

          console.log('✅ Step 1 완료: 구조 생성됨', structureData.structure?.length || 0, '개 블록');
        }

        return res.status(200).json({
          success: true,
          structure: structureData,
          message: 'Step 1: 대화 구조 생성 완료'
        });

      } catch (error) {
        console.error('❌ Step 1 구조 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: `Step 1 구조 생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
    }

    // 📝 Step 2: 구조 기반 상세 대화 생성 (v2.0.0 - 2단계 생성 방식)
    if (action === 'generate_dialogue_from_structure') {
      try {
        console.log('📝 Step 2: 상세 대화 생성 시작...');

        const { title, description, genre, sexy_level, mood, structure, ai_model } = req.body;

        if (!title || !description || !structure) {
          return res.status(400).json({
            success: false,
            message: '필수 파라미터가 누락되었습니다 (title, description, structure 필요)',
            received: { title, description, structure: structure ? '있음' : '없음' }
          });
        }

        // AI 프롬프트 로드
        const promptsData = await loadFromGitHub('data/ai-prompts.json');
        const prompts = JSON.parse(promptsData);

        if (!prompts.dialogue_generation) {
          throw new Error('dialogue_generation 프롬프트가 없습니다');
        }

        const dialoguePrompts = prompts.dialogue_generation;

        // tone_settings 체크
        let toneSettings = prompts.tone_settings[mood];
        if (!toneSettings) {
          console.warn(`⚠️ tone_settings[${mood}] 없음, balanced 사용`);
          toneSettings = prompts.tone_settings['balanced'];
        }

        // 상세 대화 생성용 프롬프트
        const systemPrompt = dialoguePrompts.system_prompt;

        const userPrompt = `다음 조건과 구조를 바탕으로 실제 메신저 대화를 작성하세요:

제목: ${title}
설명: ${description}
장르: ${genre}
섹시 레벨: ${sexy_level}/10
분위기: ${mood} - ${toneSettings.instruction}

아래는 이미 설계된 대화 구조입니다. 이 구조를 따라 실제 대사를 작성하세요:

${JSON.stringify(structure, null, 2)}

# 작성 규칙
1. 메신저 대화 형식 (연속 메시지 허용)
2. 구조의 각 블록을 실제 대사로 변환
3. 감정 태그: neutral, shy, excited, sad, angry, longing, playful, serious
4. 말줄임(...), 이모티콘 표현: (///), (웃음) 등
5. 시간은 저녁~밤 시간대 (19:00~23:00)

# 출력 형식 (JSON)
{
  "dialogue_script": [
    {
      "id": 1,
      "type": "message",
      "speaker": "캐릭터명",
      "text": "실제 대사",
      "emotion": "neutral",
      "timestamp": "19:23"
    },
    {
      "id": 5,
      "type": "choice",
      "question": "질문?",
      "options": [
        { "id": "A", "text": "선택지1", "affection_change": 3 },
        { "id": "B", "text": "선택지2", "affection_change": 0 },
        { "id": "C", "text": "선택지3", "affection_change": 1 }
      ]
    }
  ]
}

구조를 참고하되 실제 감정적이고 자연스러운 대화로 작성하세요.`;

        let dialogueScript;

        // OpenAI API
        if (!ai_model || ai_model === 'openai') {
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
          }

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: "json_object" },
              temperature: toneSettings.temperature,
              max_tokens: 2000 // 상세 대화 생성 - 구조가 있어서 여전히 빠름
            })
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI API 오류: ${response.status} - ${errorBody}`);
          }

          const result = await response.json();
          const content = result.choices[0].message.content;
          const parsed = JSON.parse(content);
          dialogueScript = parsed.dialogue_script || [];

          console.log('✅ Step 2 완료: 상세 대화 생성됨', dialogueScript.length, '개 블록');
        }

        if (!dialogueScript || dialogueScript.length === 0) {
          throw new Error('dialogue_script가 비어있습니다');
        }

        return res.status(200).json({
          success: true,
          dialogue_script: dialogueScript,
          message: 'Step 2: 상세 대화 생성 완료'
        });

      } catch (error) {
        console.error('❌ Step 2 상세 대화 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: `Step 2 상세 대화 생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
    }

    // 📝 대화 스크립트 자동 생성 (v2.0.0)
    if (action === 'generate_dialogue_script') {
      try {
        console.log('📝 대화 스크립트 AI 생성 시작...');

        const { title, description, genre, sexy_level, mood, total_choices, ai_model } = req.body;

        console.log('📥 받은 파라미터:', {
          title: title ? '✅' : '❌',
          description: description ? '✅' : '❌',
          genre: genre || 'none',
          sexy_level: sexy_level || 'none',
          mood: mood || 'none',
          total_choices: total_choices || 'none',
          ai_model: ai_model || 'openai'
        });

        if (!title || !description || !genre || !sexy_level || !mood || !total_choices) {
          return res.status(400).json({
            success: false,
            message: '필수 파라미터가 누락되었습니다',
            received: { title, description, genre, sexy_level, mood, total_choices }
          });
        }

        // AI 프롬프트 로드
        console.log('📂 ai-prompts.json 로드 시작...');
        const promptsData = await loadFromGitHub('data/ai-prompts.json');
        console.log('📂 파일 로드 완료, JSON 파싱 시작...');
        const prompts = JSON.parse(promptsData);
        console.log('✅ JSON 파싱 완료');

        if (!prompts.dialogue_generation) {
          throw new Error('dialogue_generation 프롬프트가 없습니다');
        }

        const dialoguePrompts = prompts.dialogue_generation;

        // tone_settings 체크 및 기본값 처리
        let toneSettings = prompts.tone_settings[mood];
        if (!toneSettings) {
          console.warn(`⚠️ tone_settings[${mood}] 없음, balanced 사용`);
          toneSettings = prompts.tone_settings['balanced'];
        }

        if (!toneSettings) {
          throw new Error(`tone_settings를 찾을 수 없습니다. 사용 가능한 mood: ${Object.keys(prompts.tone_settings).join(', ')}`);
        }

        // 메시지 개수 계산: 선택지 개수 × 6
        const totalMessages = parseInt(total_choices) * 6;

        console.log('📝 프롬프트 생성 정보:', {
          mood,
          toneSettings: toneSettings ? '✅' : '❌',
          toneName: toneSettings?.name,
          temperature: toneSettings?.temperature
        });

        // 프롬프트 변수 치환
        let userPrompt = dialoguePrompts.user_prompt_template
          .replace('{title}', title)
          .replace('{description}', description)
          .replace('{genre}', genre)
          .replace('{sexy_level}', sexy_level)
          .replace('{mood}', toneSettings.name)
          .replace('{total_choices}', total_choices)
          .replace('{total_messages}', totalMessages);

        const systemPrompt = dialoguePrompts.system_prompt + '\n\n' + toneSettings.instruction;

        console.log('🔧 AI 파라미터:', {
          ai_model,
          total_messages: totalMessages,
          total_choices: total_choices,
          mood: mood,
          temperature: toneSettings.temperature
        });

        let dialogueScript;

        // OpenAI API
        if (!ai_model || ai_model === 'openai') {
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.');
          }

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: "json_object" },
              temperature: toneSettings.temperature,
              max_tokens: Math.min(1500, parseInt(total_choices) * 150) // Vercel 10초 제한 대응
            })
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error('OpenAI API 에러 응답:', errorBody);
            throw new Error(`OpenAI API 오류: ${response.status} - ${errorBody.substring(0, 200)}`);
          }

          const result = await response.json();

          if (!result.choices || !result.choices[0] || !result.choices[0].message) {
            console.error('OpenAI API 응답 형식 오류:', result);
            throw new Error('OpenAI API 응답에 choices가 없습니다: ' + JSON.stringify(result).substring(0, 200));
          }

          const content = result.choices[0].message.content;
          console.log('🤖 OpenAI 응답 길이:', content.length, '자');

          // JSON 파싱
          const parsed = JSON.parse(content);
          dialogueScript = parsed.dialogue_script || [];

          if (!dialogueScript || dialogueScript.length === 0) {
            throw new Error('dialogue_script가 비어있습니다');
          }

          console.log('✅ OpenAI 대화 스크립트 파싱 완료:', dialogueScript.length, '개 블록');

        }
        // Groq API (Llama)
        else if (ai_model === 'llama') {
          if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY 환경변수가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.');
          }

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: 'llama-3.1-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: "json_object" },
              temperature: toneSettings.temperature,
              max_tokens: Math.min(1500, parseInt(total_choices) * 150) // Vercel 10초 제한 대응
            })
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error('Groq API 에러 응답:', errorBody);
            throw new Error(`Groq API 오류: ${response.status} - ${errorBody.substring(0, 200)}`);
          }

          const result = await response.json();

          if (!result.choices || !result.choices[0] || !result.choices[0].message) {
            console.error('Groq API 응답 형식 오류:', result);
            throw new Error('Groq API 응답에 choices가 없습니다: ' + JSON.stringify(result).substring(0, 200));
          }

          const content = result.choices[0].message.content;
          console.log('🤖 Groq 응답 길이:', content.length, '자');

          const parsed = JSON.parse(content);
          dialogueScript = parsed.dialogue_script || [];

          if (!dialogueScript || dialogueScript.length === 0) {
            throw new Error('dialogue_script가 비어있습니다');
          }

          console.log('✅ Groq 대화 스크립트 파싱 완료:', dialogueScript.length, '개 블록');

        }
        // Claude API
        else if (ai_model === 'claude') {
          if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.');
          }

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: parseInt(total_choices) * 200,
              temperature: toneSettings.temperature,
              messages: [{
                role: 'user',
                content: `${systemPrompt}\n\n${userPrompt}`
              }]
            })
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error('Claude API 에러 응답:', errorBody);
            throw new Error(`Claude API 오류: ${response.status} - ${errorBody.substring(0, 200)}`);
          }

          const result = await response.json();

          if (!result.content || !result.content[0] || !result.content[0].text) {
            console.error('Claude API 응답 형식 오류:', result);
            throw new Error('Claude API 응답에 content가 없습니다: ' + JSON.stringify(result).substring(0, 200));
          }

          const content = result.content[0].text;
          console.log('🤖 Claude 응답 길이:', content.length, '자');

          // JSON 추출 (코드 블록 제거)
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
          const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

          const parsed = JSON.parse(jsonText);
          dialogueScript = parsed.dialogue_script || [];

          if (!dialogueScript || dialogueScript.length === 0) {
            throw new Error('dialogue_script가 비어있습니다');
          }

          console.log('✅ Claude 대화 스크립트 파싱 완료:', dialogueScript.length, '개 블록');
        }

        console.log(`✅ 대화 스크립트 생성 완료: ${dialogueScript.length}개 블록`);

        return res.json({
          success: true,
          dialogue_script: dialogueScript,
          metadata: {
            ai_model,
            total_blocks: dialogueScript.length,
            total_choices: total_choices,
            mood: mood
          }
        });

      } catch (error) {
        console.error('❌ 대화 스크립트 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: `대화 스크립트 생성 실패: ${error.message}`,
          error_details: error.stack?.split('\n').slice(0, 5).join('\n')
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
  console.log('🎯 받은 데이터 전체:', JSON.stringify(data, null, 2));

  // v2.0.0 호환성: mood와 tone 파라미터 모두 지원 (mood가 canonical)
  const mood_value = data.mood || data.tone || '편안한';

  const {
    id = data.scenario_id || `scenario_${Date.now()}`,
    scenario_id = data.id || `scenario_${Date.now()}`,
    title = '새로운 시나리오',
    description = '',
    background_setting = '멤신저 대화',
    mood = mood_value,
    available_characters = [],
    created_date = new Date().toISOString().split('T')[0],
    episode_count = 0,
    tags = [],
    source = 'scenario_admin',
    active = true,
    ai_generated_context = '',
    custom_context = '',
    metadata = {}, // 메타데이터 (장르, 섹시 레벨, AI 모델 등)
    structure = {}, // Acts & Beats 구조
    genre = data.genre,
    sexy_level = data.sexy_level,
    total_choices = data.total_choices,
    estimated_duration = data.estimated_duration,
    dialogue_script = data.dialogue_script || []
  } = data;

  console.log('📝 시나리오 생성 데이터:', {
    scenario_id,
    title,
    description,
    background_setting,
    mood,
    available_characters
  });

  // AI를 이용한 소설풍 컨텍스트 생성 (필수)
  console.log('🤖 AI 컨텍스트 생성 시도...');
  const aiContext = await generateAIContext({
    title,
    description,
    background_setting,
    mood,
    available_characters // 캐릭터 정보 전달
  });
  console.log('✅ AI 컨텍스트 생성 성공');
  
  // v2.0.0 스키마 준수: 평면 구조 + dialogue_script
  const newScenario = {
    id: scenario_id,
    scenario_id: scenario_id, // API 호환성을 위해 둘 다 설정
    title,
    description,
    background_setting,
    mood, // canonical field name (v2.0.0)
    genre: genre || 'crush', // v2.0.0: 최상위
    sexy_level: sexy_level || 5, // v2.0.0: 최상위
    total_choices: total_choices || 12, // v2.0.0: 최상위
    estimated_duration: estimated_duration || 'medium', // v2.0.0: 최상위
    dialogue_script: dialogue_script || [], // v2.0.0: 대화 스크립트
    active_status: active,
    created_date,
    last_modified: new Date().toISOString(),
    ai_generated_context: ai_generated_context || aiContext,
    custom_context,
    available_characters: available_characters || [],
    episode_count,
    tags: tags.length > 0 ? tags : extractTags(description, mood),
    source,
    updated_by: 'scenario_manager_github_only',
    metadata: metadata || {}, // v2.0.0: 간소화된 메타데이터 (ai_model, timestamps만)
    structure: structure || {} // v1.x 호환성: Acts & Beats 구조
  };

  // 데이터베이스에 저장
  try {
    console.log('💾 시나리오 저장 시작:', newScenario.id);
    const saveResult = await saveScenarioToDatabase(newScenario);
    console.log('💾 저장 결과:', saveResult);

    // 저장 후 검증
    const updatedDb = await loadScenarioDatabase();
    console.log('🔍 저장 검증 - 전체 시나리오 수:', Object.keys(updatedDb.scenarios).length);
    console.log('🔍 저장된 시나리오 존재 확인:', !!updatedDb.scenarios[newScenario.id]);
  } catch (error) {
    console.error('❌ 시나리오 저장 중 오류:', error);
    throw new Error(`시나리오 저장 실패: ${error.message}`);
  }
  
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

    // AI 페르소나 설정 적용
    const aiSettings = {
      role: 'romance_novelist', // 베스트셀러 연애소설가
      expertise: 'master',      // 마스터 레벨
      style: 'bestseller',      // 베스트셀러 소설 스타일
      personality: 'witty',     // 재치있고 유머러스
      specialization: 'messenger_chat' // 메신저 대화 특화
    };

    const rolePrefix = `🎭 당신은 베스트셀러 연애소설가이자 메신저 대화 코칭 전문가입니다.
- 📚 수백만 독자의 마음을 사로잡은 연애소설 작가로서의 경험을 활용하세요
- 💬 현대인의 메신저 대화 패턴과 연애 심리를 정확히 이해하고 있습니다
- 🎨 재치있고 유머러스하면서도 감동적인 스토리텔링 능력을 발휘하세요
- 🏆 마스터 레벨의 전문성으로 고품질 컨텍스트를 생성해주세요

`;

    const prompt = `${rolePrefix}📱 메신저 채팅 시나리오 컨텍스트 생성 🚨 MANDATORY CHARACTER CONSTRAINT 🚨
다음 등장인물 정보를 EXACTLY 그대로 사용하여 메신저 대화 배경을 작성하세요:${characterInfo}

⚠️ WARNING: 위에 명시된 캐릭터 이름과 정보만 사용하고, 절대로 다른 이름이나 새로운 캐릭터를 만들지 마세요!

📱 메신저 시나리오 정보:
상황 제목: ${scenarioData.title}
상황 설명: ${scenarioData.description}
감정 테마: ${scenarioData.mood}

🎯 메신저 컨텍스트 핵심 요구사항:
1. ✅ **메신저 대화 배경**: 왜 이 상황에서 메신저로 대화하게 되었는지 상세 설명
2. ✅ **캐릭터 정확성**: 위에 제공된 정확한 이름과 성격 사용
3. ✅ **감정 상태**: 메신저를 보내는 시점의 감정과 심리 상태 깊이 분석
4. ✅ **상황의 현실성**: 실제로 일어날 수 있는 메신저 대화 상황
5. 🆕 **대화 소재 제공**: 메신저에서 다룰 수 있는 구체적인 대화 주제들
6. 🆕 **감정 변화 과정**: 대화 진행에 따른 감정 변화 예측
7. 🆕 **심리적 배경**: 캐릭터의 내면 심리와 고민 상세 분석

📝 메신저 컨텍스트 작성 가이드 (확장판):
- **길이**: 800-1200자 분량의 상세한 메신저 대화 배경 설명 (기존 2배 분량)
- **상황 배경**: 메신저 대화 직전에 어떤 일이 있었는지 시간순으로 상세 설명
- **감정 상태**: 캐릭터가 메신저를 보내는 이유와 복잡한 심리 상태
- **관계 역학**: 두 사람 사이의 현재 관계와 미묘한 감정의 변화 과정
- **메신저 특성**: 직접 만나서 말하기 어려운 이유나 상황, 메신저만의 장점
- **한국 문화**: 자연스러운 한국의 연애 문화와 메신저 사용 패턴
- **대화 소재**: 실제 메신저에서 나눌 수 있는 구체적인 대화 주제 5-7개 제시
- **감정 단계**: 대화 초반/중반/후반에 예상되는 감정 변화
- **심리 분석**: MBTI 성격에 따른 캐릭터의 내면 갈등과 욕구

💬 대화 소재 가이드라인:
- **즉석 대화**: 지금 당장 말할 수 있는 자연스러운 주제
- **감정 탐색**: 서로의 마음을 확인하는 질문들
- **과거 회상**: 함께 했던 추억이나 특별한 순간
- **미래 계획**: 앞으로의 관계나 만남에 대한 이야기
- **일상 공유**: 오늘 있었던 일이나 현재 상황
- **깊은 대화**: 서로의 가치관이나 꿈에 대한 이야기
- **미묘한 감정**: 직접 말하기 어려운 미묘한 감정 표현

🔍 메신저 컨텍스트 FINAL CHECK:
- 제공된 캐릭터 이름을 정확히 사용했는가?
- 메신저 대화 배경으로 적절한가?
- 실제 연애에서 일어날 수 있는 상황인가?
- MBTI와 성격이 일치하는가?
- 대화 소재가 구체적으로 제시되었는가?
- 분량이 기존 대비 2배 이상인가?

시나리오 컨텍스트와 대화 소재를 모두 포함하여 작성해주세요:`;

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
        max_tokens: 2400,
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

// 🔥 섹시 레벨 지시문 생성 함수
function getSexyLevelInstruction(level) {
  const levelInt = parseInt(level) || 5;

  if (levelInt <= 2) {
    return {
      name: '순수한 로맨스',
      instruction: `- 감정 표현: 순수하고 따뜻한 감정 중심
- 스킨십: 언급 금지 (손잡기, 포옹도 암시만)
- 표현: "설렘", "두근거림", "행복", "따뜻함" 같은 순수한 감정
- 분위기: 청순하고 로맨틱한 첫사랑 같은 느낌`
    };
  } else if (levelInt <= 4) {
    return {
      name: '일반 로맨스',
      instruction: `- 감정 표현: 자연스러운 애정 표현
- 스킨십: 가벼운 스킨십 가능 (손잡기, 어깨 기대기, 볼 키스)
- 표현: "보고 싶어", "안아주고 싶어", "따뜻해" 같은 자연스러운 감정
- 분위기: 편안하고 달콤한 연인 사이`
    };
  } else if (levelInt <= 6) {
    return {
      name: '달콤한 로맨스',
      instruction: `- 감정 표현: 애정이 담긴 직접적 표현
- 스킨십: 자연스러운 스킨십 (포옹, 키스 언급 가능)
- 표현: "보고싶어 미치겠어", "안고 싶어", "키스하고 싶어" 같은 솔직한 감정
- 분위기: 달콤하고 로맨틱한 연인`
    };
  } else if (levelInt <= 8) {
    return {
      name: '관능적 로맨스',
      instruction: `- 감정 표현: 강렬하고 진한 애정 표현
- 스킨십: 진한 스킨십 암시 가능 (키스, 포옹의 구체적 묘사)
- 표현: "너무 원해", "참기 힘들어", "더 가까이" 같은 강렬한 감정
- 분위기: 열정적이고 관능적인 연인
- 주의: 직접적인 성적 표현은 피하되 강렬한 욕망과 끌림 표현`
    };
  } else {
    return {
      name: '매우 관능적',
      instruction: `- 감정 표현: 매우 강렬하고 노골적인 애정 표현
- 스킨십: 진한 스킨십의 구체적 묘사
- 표현: "미칠 것 같아", "지금 당장", "너만 생각나" 같은 매우 강렬한 욕망
- 분위기: 열정적이고 강렬한 끌림
- 경계: 선정적이지만 품위를 유지 (노골적 성행위 묘사는 피함)`
    };
  }
}

// AI 프롬프트 로드 함수 (GitHub API에서 동적 로드)
async function loadAIPrompts() {
  try {
    console.log('🎛️ AI 프롬프트 로드 시작...');

    const owner = 'EnmanyProject';
    const repo = 'chatgame';
    const path = 'data/ai-prompts.json';
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.warn('⚠️ GitHub Token 없음 - 기본 프롬프트 사용');
      return null;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      console.warn('⚠️ AI 프롬프트 로드 실패 - 기본 프롬프트 사용');
      return null;
    }

    const fileData = await response.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const prompts = JSON.parse(content);

    console.log('✅ AI 프롬프트 로드 완료:', prompts.metadata.version);
    return prompts;

  } catch (error) {
    console.error('❌ AI 프롬프트 로드 실패:', error.message);
    return null;
  }
}

// OpenAI API 호출 함수
async function callOpenAI({ systemPrompt, userPrompt, modelParams }) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: modelParams.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: modelParams.temperature,
      max_tokens: modelParams.max_tokens
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API 오류: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Claude API 호출 함수
async function callClaude({ systemPrompt, userPrompt, modelParams }) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('Claude API 키가 설정되지 않았습니다');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelParams.model,
      max_tokens: modelParams.max_tokens,
      temperature: modelParams.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Claude API 오류: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Groq (Llama) API 호출 함수
async function callGroq({ systemPrompt, userPrompt, modelParams }) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('Groq API 키가 설정되지 않았습니다');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: modelParams.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: modelParams.temperature,
      max_tokens: modelParams.max_tokens
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API 오류: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// AI 모델 라우팅 함수
async function callAI({ aiModel, systemPrompt, userPrompt, modelParams }) {
  console.log(`🤖 AI 모델 호출: ${aiModel}`);

  switch (aiModel) {
    case 'openai':
      return await callOpenAI({ systemPrompt, userPrompt, modelParams });
    case 'claude':
      return await callClaude({ systemPrompt, userPrompt, modelParams });
    case 'llama':
      return await callGroq({ systemPrompt, userPrompt, modelParams });
    default:
      console.warn(`⚠️ 알 수 없는 AI 모델: ${aiModel}, OpenAI로 대체`);
      return await callOpenAI({ systemPrompt, userPrompt, modelParams });
  }
}

// 시나리오 데이터베이스 로드 (GitHub API 우선)
async function loadScenarioDatabase() {
  try {
    console.log('🐙 GitHub API 전용 시나리오 데이터베이스 로드 시작...');

    // GitHub API에서만 데이터 로드 (로컬 파일 의존성 완전 제거)
    const githubDataString = await loadFromGitHub();
    if (githubDataString) {
      const githubData = JSON.parse(githubDataString);
      console.log('✅ GitHub에서 시나리오 데이터 로드 성공:', Object.keys(githubData.scenarios).length + '개');
      return githubData;
    }

    // GitHub API 실패 시 기본 구조 반환 (로컬 파일 시도 제거)
    console.log('⚠️ GitHub API 접근 실패 - 기본 빈 데이터베이스 반환');
    return getDefaultScenarioDatabase();

  } catch (error) {
    console.error('❌ GitHub API 시나리오 로드 실패:', {
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });

    // GitHub API 연결 실패 시 더 구체적인 에러 정보 제공
    throw new Error(`시나리오 데이터 로드 실패: ${error.message}. GitHub API 연결을 확인하세요.`);
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
    console.log('🔄 GitHub API에서 직접 캐릭터 데이터 로드 시도...');

    // GitHub API 직접 호출로 HTTP 오류 회피
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'EnmanyProject';
    const REPO_NAME = 'chatgame';
    const FILE_PATH = 'data/characters.json';

    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN 환경변수가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.');
    }

    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const response = await fetch(getFileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ChatGame-Scenario-Manager'
      }
    });

    console.log('📡 GitHub API 응답 상태:', response.status, response.statusText);

    if (response.ok) {
      const fileData = await response.json();
      const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      const characterData = JSON.parse(decodedContent);

      console.log('✅ GitHub에서 캐릭터 데이터 로드 성공:', {
        characterCount: Object.keys(characterData.characters || {}).length,
        metadata: characterData.metadata
      });

      console.log('📋 캐릭터 ID 목록:', Object.keys(characterData.characters || {}));

      return {
        characters: characterData.characters || {},
        metadata: characterData.metadata || {}
      };
    } else {
      const errorText = await response.text();
      console.error('❌ GitHub API 오류 응답:', errorText);
      throw new Error(`GitHub API HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ 캐릭터 데이터베이스 로드 실패:', error);
    console.error('❌ 상세 오류:', error.stack);

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

  // v2.0.0 호환성: tone → mood 자동 변환
  if (data.tone && !data.mood) {
    data.mood = data.tone;
    delete data.tone; // tone 파라미터 제거하여 중복 방지
  }

  Object.assign(scenario, data);
  scenario.last_modified = new Date().toISOString();

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
      mood: data.mood || data.tone || scenario.mood, // v2.0.0: mood/tone 모두 지원
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
      mood: data.mood || data.tone, // v2.0.0: mood/tone 모두 지원
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
async function loadFromGitHub(filePath = 'data/scenarios/scenario-database.json') {
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';

  try {
    console.log('🐙 GitHub에서 파일 로드 시도:', filePath);

    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
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

      console.log('✅ GitHub에서 파일 로드 성공:', filePath);

      // JSON 문자열 반환 (파싱하지 않음 - 호출자가 결정)
      return decodedContent;
    } else {
      console.log('📂 GitHub에 저장된 파일이 없음:', filePath);
      return null;
    }

  } catch (error) {
    console.warn('⚠️ GitHub 파일 로드 실패:', error.message);
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

// AI 시나리오 구조 자동 생성 함수
async function generateScenarioStructure({ title, description, genre }) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다');
  }

  // 장르별 감정 흐름 매핑
  const emotionFlows = {
    anger: '폭발 → 침묵 → 후회 → 진심 노출',
    jealousy: '의심 → 방어 → 솔직함 → 안도',
    unrequited: '망설임 → 표현 → 거절/희망 → 수용',
    temptation: '긴장 → 접근 → 흔들림 → 유예',
    longing: '회상 → 공백 → 연락 → 여운',
    reconciliation: '대립 → 사과 → 이해 → 포옹(심리적)',
    flutter: '호감 → 시선 교환 → 미소 → 약속',
    anxiety: '거리감 → 불신 → 대화 → 안도',
    obsession: '독점 → 불안 → 붕괴 → 깨달음',
    resignation: '미련 → 인식 → 포기 → 수용',
    courage: '두려움 → 결심 → 표현 → 해방',
    bond: '갈등 → 신뢰 회복 → 따뜻함',
    guilt: '사과 → 침묵 → 용서 → 안도',
    rejection: '고백 → 머뭇 → 단호함 → 존중',
    avoidance: '질문 회피 → 억눌림 → 혼란 → 침묵'
  };

  const emotionFlow = emotionFlows[genre] || '감정 시작 → 감정 전개 → 감정 절정 → 감정 마무리';
  const genreInfo = genre ? `\n- 장르: ${genre}\n- 감정 흐름: ${emotionFlow}` : '';

  const prompt = `당신은 로맨스 메신저 대화 시나리오 전문 작가입니다.

**시나리오 정보**:
- 제목: ${title}
- 설명: ${description}${genreInfo}

**핵심 컨셉**:
설명에 나온 일은 **이미 벌어진 일**입니다.
시나리오는 그 일에 대해 메신저로 대화하는 내용이어야 합니다.
일이 벌어지는 과정이 아니라, 일이 벌어진 후의 감정과 반응을 다룹니다.

**예시**:
- "술김에 키스했다" → 키스하는 장면이 아니라, 다음날 "어제 일 기억나?" 같은 대화
- "우연히 재회했다" → 재회 장면이 아니라, 재회 후 "오랜만이야" 같은 대화
- "고백을 받았다" → 고백 장면이 아니라, 고백 후 "어떻게 대답해야 할지 모르겠어" 같은 대화

**목표**: 위 정보를 바탕으로 **이미 일어난 사건에 대한** 메신저 대화 Acts & Beats 구조를 생성하세요.

**출력 형식** (반드시 JSON으로):
{
  "acts": [
    {
      "name": "Act 이름 (예: 어색한 대화 시작, 진심을 묻는 대화)",
      "beats": [
        {
          "name": "Beat 이름 (예: 어젯밤 일 꺼내기, 그때 기분 물어보기)",
          "time": "시간 (예: 다음날 아침 8시, 점심시간)",
          "topic": "대화 주제 (예: 어제 키스한 일 언급하기, 그때 향수 냄새가 좋았다고 말하기)",
          "emotion": "감정 흐름 (예: 어색함 → 부끄러움, 호기심 → 설렘)",
          "affection_change": 호감도변화숫자 (예: 2, 5, 3),
          "character_reaction": "캐릭터 반응 (예: 어색해하면서도 먼저 메시지를 보냄, 그때 일이 기억난다며 부끄러워함)"
        }
      ]
    }
  ]
}

**중요 규칙**:
1. Acts는 3-5개 정도
2. 각 Act마다 Beats는 2-4개 정도
3. **모든 Beat는 메신저 대화 내용이어야 함 (사건이 아니라 대화)**
4. **감정 흐름은 반드시 "${emotionFlow}" 패턴을 따라 구성**
5. 호감도 변화는 -5 ~ +10 범위
6. topic은 "~한다"가 아니라 "~에 대해 이야기한다" 형식
7. 순수 JSON만 출력 (설명 없이)`;

  try {
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
            content: '당신은 로맨스 메신저 대화 시나리오 전문 작가입니다. 순수 JSON 형식으로만 응답하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API 오류: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // JSON 파싱
    let structure;
    try {
      // 코드 블록 제거 (```json ... ``` 형식일 경우)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      structure = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', content);
      throw new Error('AI 응답을 JSON으로 파싱할 수 없습니다');
    }

    console.log('✅ AI 구조 생성 성공:', JSON.stringify(structure, null, 2));
    return structure;

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    throw error;
  }
}

// 📖 기승전결 구조 생성 함수 (신규 시스템 - 동적 프롬프트 로드 + 멀티 AI 모델 + 분위기 조절)
async function generateKiSeungJeonGyeolStructure({ title, description, genre = '', aiModel = 'openai', tone = 'balanced', sexyLevel = 5 }) {
  console.log(`📖 기승전결 구조 생성 시작 - AI 모델: ${aiModel}, 분위기: ${tone}, 섹시 레벨: ${sexyLevel}`);

  // AI 프롬프트를 동적으로 로드
  const aiPrompts = await loadAIPrompts();

  let systemPrompt, userPromptTemplate, modelParams, emotionFlows, toneSettings;

  if (aiPrompts) {
    // 동적으로 로드된 프롬프트 사용
    console.log('✅ 동적 프롬프트 사용 (ai-prompts.json)');
    const structurePrompt = aiPrompts.prompts.structure_generation;
    systemPrompt = structurePrompt.system_prompt;
    userPromptTemplate = structurePrompt.user_prompt_template;

    // AI 모델별 파라미터 선택
    modelParams = structurePrompt.parameters[aiModel] || structurePrompt.parameters.openai;
    emotionFlows = structurePrompt.emotion_flows;
    toneSettings = aiPrompts.tone_settings || {};  // 분위기 설정 로드
  } else {
    // 기본 프롬프트 사용 (폴백)
    console.log('⚠️ 기본 프롬프트 사용 (ai-prompts.json 로드 실패)');
    systemPrompt = '당신은 로맨스 메신저 대화 시나리오 전문 작가입니다. 순수 JSON 형식으로만 응답하세요.';
    modelParams = {
      model: 'gpt-4o-mini',
      temperature: 0.8,
      max_tokens: 1000
    };
    // 장르별 감정 흐름 매핑 (기본값)
    emotionFlows = {
      anger: '폭발 → 침묵 → 후회 → 진심 노출',
      jealousy: '의심 → 방어 → 솔직함 → 안도',
      unrequited: '망설임 → 표현 → 거절/희망 → 수용',
      temptation: '긴장 → 접근 → 흔들림 → 유예',
      longing: '회상 → 공백 → 연락 → 여운',
    reconciliation: '대립 → 사과 → 이해 → 포옹(심리적)',
    flutter: '호감 → 시선 교환 → 미소 → 약속',
    anxiety: '거리감 → 불신 → 대화 → 안도',
    obsession: '독점 → 불안 → 붕괴 → 깨달음',
    resignation: '미련 → 인식 → 포기 → 수용',
    courage: '두려움 → 결심 → 표현 → 해방',
    bond: '갈등 → 신뢰 회복 → 따뜻함',
    guilt: '사과 → 침묵 → 용서 → 안도',
    rejection: '고백 → 머뭇 → 단호함 → 존중',
    avoidance: '질문 회피 → 억눌림 → 혼란 → 침묵'
  };

    // 기본 userPromptTemplate (폴백용 - 템플릿 변수 사용)
    userPromptTemplate = `당신은 로맨스 메신저 대화 시나리오 전문 작가입니다.

**시나리오 정보**:
- 제목: {{title}}
- 설명: {{description}}
{{genre_info}}

**핵심 컨셉**:
설명에 나온 일은 **이미 벌어진 일**입니다.
시나리오는 그 일에 대해 메신저로 대화하는 내용이어야 합니다.
일이 벌어지는 과정이 아니라, 일이 벌어진 후의 감정과 반응을 다룹니다.

**예시**:
- "술김에 키스했다" → 키스하는 과정이 아니라, 다음날 그 일에 대해 대화하는 내용
- "우연히 재회했다" → 재회 장면이 아니라, 재회 후 서로의 감정을 나누는 대화
- "고백을 받았다" → 고백 장면이 아니라, 고백 후 어떻게 답할지 고민하며 대화

**중요: 캐릭터 정보는 필요하지 않습니다**
이 작업은 **스켈레톤 구조**만 만드는 것입니다.
특정 캐릭터 이름, 성격, MBTI 등은 나중에 채워질 것이므로,
지금은 "그/그녀", "상대방", "남자/여자" 같은 일반적인 표현으로 구조만 만들어주세요.
캐릭터 정보가 없다고 거부하지 말고, 반드시 구조를 생성해주세요.

**목표**: 위 정보를 바탕으로 **이미 일어난 사건에 대한 메신저 대화**의 기승전결 4단계 구조를 생성하세요.

**출력 형식** (반드시 JSON으로):
{
  "beginning": {
    "title": "기(起) 단계 제목 (예: 어색한 대화 시작)",
    "summary": "기 단계 요약 (1-2문장, 일어난 일에 대한 대화 시작)",
    "goal": "기 단계 목표 (예: 어젯밤 일에 대해 꺼내기)"
  },
  "buildup": {
    "title": "승(承) 단계 제목 (예: 그때 감정 확인)",
    "summary": "승 단계 요약 (1-2문장, 그때의 감정과 생각 나누기)",
    "goal": "승 단계 목표 (예: 서로의 진심 알아가기)"
  },
  "climax": {
    "title": "전(轉) 단계 제목 (예: 관계 정의 고민)",
    "summary": "전 단계 요약 (1-2문장, 앞으로 어떻게 할지 갈등)",
    "goal": "전 단계 목표 (예: 솔직한 마음 표현하기)"
  },
  "resolution": {
    "title": "결(結) 단계 제목 (예: 새로운 관계 시작)",
    "summary": "결 단계 요약 (1-2문장, 감정 정리 및 다음 약속)",
    "goal": "결 단계 목표 (예: 다시 만나기로 약속)"
  }
}

**중요 규칙**:
1. 기(起): 도입 - 일어난 일에 대한 대화 시작 (호감도 0~5)
2. 승(承): 전개 - 그때의 감정과 생각 공유 (호감도 5~10)
3. 전(轉): 위기 - 관계 정의나 앞으로에 대한 고민 (호감도 3~8)
4. 결(結): 결말 - 감정 정리 및 다음 만남 약속 (호감도 10~15)
5. **감정 흐름은 반드시 "{{emotion_flow}}" 패턴을 따라 구성**
6. **모든 단계는 메신저 대화 내용이어야 함 (사건 전개가 아니라 대화)**
7. summary와 goal은 "~한다"가 아니라 "~에 대해 이야기한다" 형식
8. 순수 JSON만 출력 (설명 없이)`;
  }

  // 템플릿 변수 치환
  const emotionFlow = emotionFlows[genre] || '감정 시작 → 감정 전개 → 감정 절정 → 감정 마무리';
  const genreInfo = genre ? `- 장르: ${genre}\n- 감정 흐름: ${emotionFlow}` : '';

  // 🎨 분위기 설정 적용
  const selectedTone = toneSettings[tone] || toneSettings['balanced'] || {
    name: '보통',
    instruction: '진솔하면서도 따뜻한 톤으로 작성하세요.',
    temperature: 0.8
  };

  console.log(`🎨 적용된 분위기: ${selectedTone.name} (${tone})`);

  // 🔥 섹시 레벨 지시문 생성
  const sexyLevelInstruction = getSexyLevelInstruction(sexyLevel);
  console.log(`🔥 섹시 레벨: ${sexyLevel}/10 - ${sexyLevelInstruction.name}`);

  // 분위기 지시문을 프롬프트 맨 앞에 추가 (최우선 적용)
  const toneInstruction = `**🎨 분위기 조절 (${selectedTone.name}) - 최우선 준수**:\n${selectedTone.instruction}\n\n`;

  // 섹시 레벨 지시문 추가
  const sexyInstruction = `**🔥 섹시 레벨 (${sexyLevel}/10) - ${sexyLevelInstruction.name}**:\n${sexyLevelInstruction.instruction}\n\n`;

  const prompt = (toneInstruction + sexyInstruction + userPromptTemplate)
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{genre_info\}\}/g, genreInfo)
    .replace(/\{\{emotion_flow\}\}/g, emotionFlow);

  // 분위기에 따른 temperature 적용
  const finalTemperature = selectedTone.temperature || modelParams.temperature;

  console.log('📝 사용된 프롬프트 설정:', {
    ai_model: aiModel,
    model: modelParams.model,
    temperature: finalTemperature,
    tone: selectedTone.name,
    max_tokens: modelParams.max_tokens,
    prompt_source: aiPrompts ? 'ai-prompts.json' : 'fallback'
  });

  try {
    // AI 모델 라우팅을 통한 호출 (분위기 반영된 temperature 사용)
    const content = await callAI({
      aiModel,
      systemPrompt,
      userPrompt: prompt,
      modelParams: {
        ...modelParams,
        temperature: finalTemperature  // 분위기에 맞는 temperature 적용
      }
    });

    // JSON 파싱
    let structure;
    try {
      // 코드 블록 제거 (```json ... ``` 형식일 경우)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      structure = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', content);
      throw new Error('AI 응답을 JSON으로 파싱할 수 없습니다');
    }

    console.log('✅ 기승전결 구조 생성 성공:', JSON.stringify(structure, null, 2));
    return structure;

  } catch (error) {
    console.error(`❌ ${aiModel} AI API 호출 실패:`, error);
    throw error;
  }
}

// Acts & Beats 기반 소설풍 스토리 생성 함수
async function generateStoryFromStructure({ title, description, structure }) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다');
  }

  // Acts & Beats를 텍스트로 변환
  const actsDescription = structure.acts.map((act, actIndex) => {
    const beatsDescription = act.beats.map((beat, beatIndex) => {
      return `  Beat ${beatIndex + 1}: ${beat.name}
    - 시간: ${beat.time || '미정'}
    - 주제: ${beat.topic || '대화 진행'}
    - 감정: ${beat.emotion || '평온'}
    - 캐릭터 반응: ${beat.character_reaction || '자연스럽게 반응'}`;
    }).join('\n\n');

    return `Act ${actIndex + 1}: ${act.name}
${beatsDescription}`;
  }).join('\n\n');

  const prompt = `당신은 로맨스 소설 작가입니다.

**시나리오 정보**:
- 제목: ${title}
- 설명: ${description}

**Acts & Beats 구조**:
${actsDescription}

**목표**: 위 Acts & Beats 구조를 바탕으로 **소설풍의 배경 스토리**를 작성하세요.

**작성 규칙**:
1. 분량: 800-1200자 정도
2. 문체: 소설처럼 서술적이고 감성적으로
3. 포함 요소:
   - 두 사람이 어떤 상황에서 만났는지
   - 각 Act에서 어떤 일이 벌어지는지 흐름
   - 감정의 변화와 분위기
   - 독자가 설렘을 느낄 수 있는 표현
4. 제외 요소:
   - Acts, Beats 같은 용어 사용 금지
   - 구조적인 설명 금지
   - 순수한 이야기만

**출력**: 순수한 소설 텍스트만 (JSON이나 다른 형식 없이)`;

  try {
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
            content: '당신은 로맨스 소설 작가입니다. 감성적이고 몰입감 있는 배경 스토리를 작성하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API 오류: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const story = data.choices[0].message.content.trim();

    console.log('✅ 소설풍 스토리 생성 성공 (길이:', story.length, '자)');
    return story;

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    throw error;
  }
}

/**
 * 기승전결 구조를 바탕으로 장문의 소설풍 스토리 생성
 */
async function generateStoryFromKiSeungJeonGyeol({ title, description, structure, aiModel = 'openai', tone = 'balanced' }) {
  console.log(`📖 장문 스토리 생성 시작 - AI 모델: ${aiModel}, 분위기: ${tone}`);

  // AI 프롬프트를 동적으로 로드
  const aiPrompts = await loadAIPrompts();

  let systemPrompt, userPromptTemplate, modelParams, toneSettings;

  if (aiPrompts) {
    // 동적으로 로드된 프롬프트 사용
    console.log('✅ 동적 프롬프트 사용 (ai-prompts.json - story generation)');
    const storyPrompt = aiPrompts.prompts.story_generation;
    systemPrompt = storyPrompt.system_prompt;
    userPromptTemplate = storyPrompt.user_prompt_template;

    // AI 모델별 파라미터 선택
    modelParams = storyPrompt.parameters[aiModel] || storyPrompt.parameters.openai;
    toneSettings = aiPrompts.tone_settings || {};  // 분위기 설정 로드
  } else {
    // 기본 프롬프트 사용 (폴백)
    console.log('⚠️ 기본 프롬프트 사용 (ai-prompts.json 로드 실패 - story generation)');
    systemPrompt = '당신은 로맨스 소설 작가입니다. 감성적이고 몰입감 있는 배경 스토리를 자연스럽게 연결하여 작성하세요.';
    modelParams = {
      model: 'gpt-4o-mini',
      temperature: 0.9,
      max_tokens: 1000
    };

    // 기본 userPromptTemplate (폴백용 - 템플릿 변수 사용)
    userPromptTemplate = `당신은 로맨스 소설 작가입니다.

**시나리오 정보**:
- 제목: {{title}}
- 설명: {{description}}

**기승전결 구조**:
{{ki_description}}

{{seung_description}}

{{jeon_description}}

{{gyeol_description}}

**핵심 컨셉**:
이 시나리오는 "이미 벌어진 일"에 대한 메신저 대화를 다룹니다.
사건이 벌어지는 과정이 아니라, 사건 후 두 사람이 메신저로 감정을 나누는 이야기입니다.

**중요: 캐릭터 정보는 필요하지 않습니다**
이 작업은 **배경 스토리의 스켈레톤**만 만드는 것입니다.
특정 캐릭터 이름, 성격, MBTI 등은 나중에 채워질 것이므로,
지금은 "그/그녀", "상대방", "남자/여자", "둘" 같은 일반적인 표현으로 스토리를 작성해주세요.
캐릭터 정보가 없다고 거부하지 말고, 반드시 스토리를 생성해주세요.

**목표**: 위 기승전결 구조를 바탕으로 **자연스럽게 연결된 장문의 배경 스토리**를 작성하세요.

**작성 규칙**:
1. 분량: 600-900자 정도의 한 덩어리 텍스트
2. 문체: 소설처럼 서술적이고 감성적으로, 자연스럽게 흐르도록
3. 포함 요소:
   - 어떤 일이 벌어졌는지 (과거)
   - 그 후 메신저로 어떻게 대화가 시작되는지
   - 기승전결에 따라 감정이 어떻게 변화하는지
   - 대화의 흐름과 분위기, 두 사람의 심리
   - 독자가 설렘과 몰입을 느낄 수 있는 표현
4. 제외 요소:
   - "기승전결", "Beat" 같은 구조 용어 사용 금지
   - 단계별 구분 표시 금지 (단락 나누기는 자연스럽게)
   - 순수한 이야기 흐름만

**중요**: 문단 구분 없이 자연스럽게 이어지는 하나의 긴 스토리로 작성하세요.

**출력**: 순수한 소설 텍스트만 (JSON이나 다른 형식 없이)`;
  }

  // 기승전결을 텍스트로 변환 (영어 속성명 사용)
  const kiDescription = structure.beginning.beats && structure.beginning.beats.length > 0
    ? `기(起) - ${structure.beginning.summary}\n  목표: ${structure.beginning.goal}\n  대화 흐름: ${structure.beginning.beats.map(b => b.name).join(' → ')}`
    : `기(起) - ${structure.beginning.title || '도입'}\n  요약: ${structure.beginning.summary}\n  목표: ${structure.beginning.goal}`;

  const seungDescription = structure.buildup.beats && structure.buildup.beats.length > 0
    ? `승(承) - ${structure.buildup.summary}\n  목표: ${structure.buildup.goal}\n  대화 흐름: ${structure.buildup.beats.map(b => b.name).join(' → ')}`
    : `승(承) - ${structure.buildup.title || '전개'}\n  요약: ${structure.buildup.summary}\n  목표: ${structure.buildup.goal}`;

  const jeonDescription = structure.climax.beats && structure.climax.beats.length > 0
    ? `전(轉) - ${structure.climax.summary}\n  목표: ${structure.climax.goal}\n  대화 흐름: ${structure.climax.beats.map(b => b.name).join(' → ')}`
    : `전(轉) - ${structure.climax.title || '위기'}\n  요약: ${structure.climax.summary}\n  목표: ${structure.climax.goal}`;

  const gyeolDescription = structure.resolution.beats && structure.resolution.beats.length > 0
    ? `결(結) - ${structure.resolution.summary}\n  목표: ${structure.resolution.goal}\n  대화 흐름: ${structure.resolution.beats.map(b => b.name).join(' → ')}`
    : `결(結) - ${structure.resolution.title || '결말'}\n  요약: ${structure.resolution.summary}\n  목표: ${structure.resolution.goal}`;

  // 🎨 분위기 설정 적용
  const selectedTone = toneSettings[tone] || toneSettings['balanced'] || {
    name: '보통',
    instruction: '진솔하면서도 따뜻한 톤으로 작성하세요.',
    temperature: 0.9
  };

  console.log(`🎨 적용된 분위기: ${selectedTone.name} (${tone})`);

  // 분위기 지시문을 프롬프트 맨 앞에 추가 (최우선 적용)
  const toneInstruction = `**🎨 분위기 조절 (${selectedTone.name}) - 최우선 준수**:\n${selectedTone.instruction}\n\n`;

  // 템플릿 변수 치환
  const prompt = (toneInstruction + userPromptTemplate)
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{ki_description\}\}/g, kiDescription)
    .replace(/\{\{seung_description\}\}/g, seungDescription)
    .replace(/\{\{jeon_description\}\}/g, jeonDescription)
    .replace(/\{\{gyeol_description\}\}/g, gyeolDescription);

  // 분위기에 따른 temperature 적용
  const finalTemperature = selectedTone.temperature || modelParams.temperature;

  console.log('📝 사용된 프롬프트 설정 (story generation):', {
    ai_model: aiModel,
    model: modelParams.model,
    temperature: finalTemperature,
    tone: selectedTone.name,
    max_tokens: modelParams.max_tokens,
    prompt_source: aiPrompts ? 'ai-prompts.json' : 'fallback'
  });

  try {
    // AI 모델 라우팅을 통한 호출 (분위기 반영된 temperature 사용)
    const story = await callAI({
      aiModel,
      systemPrompt,
      userPrompt: prompt,
      modelParams: {
        ...modelParams,
        temperature: finalTemperature  // 분위기에 맞는 temperature 적용
      }
    });

    console.log('✅ 기승전결 기반 장문 스토리 생성 성공 (길이:', story.length, '자)');
    return story;

  } catch (error) {
    console.error(`❌ ${aiModel} 스토리 생성 실패:`, error);
    throw error;
  }
}