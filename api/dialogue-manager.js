// 대화 관리 API - GitHub API 전용 버전 (캐릭터 인식 기능 추가)

// 캐릭터 데이터를 로드하는 함수 (새로 추가)
async function loadCharacterDatabase() {
  try {
    const response = await fetch('https://api.github.com/repos/EnmanyProject/chatgame/contents/data/characters.json', {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    });

    if (response.ok) {
      const text = await response.text();
      return text ? JSON.parse(text) : { characters: {}, metadata: {} };
    }
    return { characters: {}, metadata: {} };
  } catch (error) {
    console.error('⚠️ 캐릭터 데이터베이스 로드 실패:', error.message);
    return { characters: {}, metadata: {} };
  }
}

// 캐릭터 ID로 캐릭터 데이터 가져오기 (새로 추가)
async function getCharacterById(characterId) {
  try {
    const characterDb = await loadCharacterDatabase();
    const character = characterDb.characters[characterId];

    if (character) {
      console.log('✅ 캐릭터 발견:', character.basic_info?.name || character.name || characterId);
      return character;
    } else {
      console.log('⚠️ 캐릭터를 찾을 수 없음:', characterId);
      return null;
    }
  } catch (error) {
    console.error('❌ 캐릭터 조회 실패:', error.message);
    return null;
  }
}

// 관계 단계 판정 함수 (새로 추가)
function getRelationshipStage(affection, character) {
  if (!character?.relationship_progression?.stages) {
    // 기본 단계 설정
    if (affection <= 25) return 'initial_attraction';
    if (affection <= 60) return 'building_tension';
    return 'intimate_connection';
  }

  const stages = character.relationship_progression.stages;
  for (const [stageName, config] of Object.entries(stages)) {
    if (affection >= config.affection_range[0] && affection <= config.affection_range[1]) {
      return stageName;
    }
  }
  return 'initial_attraction';
}

// 호감도 영향도 계산 개선 함수 (새로 추가)
function calculateEnhancedAffectionImpact(baseImpact, userChoice, character, currentAffection) {
  let adjustedImpact = baseImpact;

  if (!character) return adjustedImpact;

  // 1. 캐릭터의 감정 트리거 확인
  const triggers = character.psychological_depth?.emotional_triggers;
  if (triggers) {
    // 긍정적 트리거에 맞는 선택
    if (triggers.positive && userChoice.tags) {
      const hasPositiveTrigger = triggers.positive.some(trigger =>
        userChoice.tags.includes(trigger) || userChoice.text?.toLowerCase().includes(trigger)
      );
      if (hasPositiveTrigger) {
        adjustedImpact += 2;
        console.log('💖 긍정적 감정 트리거 활성화 +2');
      }
    }

    // 부정적 트리거에 맞는 선택
    if (triggers.negative && userChoice.tags) {
      const hasNegativeTrigger = triggers.negative.some(trigger =>
        userChoice.tags.includes(trigger) || userChoice.text?.toLowerCase().includes(trigger)
      );
      if (hasNegativeTrigger) {
        adjustedImpact -= 3;
        console.log('💔 부정적 감정 트리거 활성화 -3');
      }
    }
  }

  // 2. 관계 단계별 민감도 적용
  const stage = getRelationshipStage(currentAffection, character);
  let stageSensitivity = 1.0;

  switch(stage) {
    case 'initial_attraction':
      stageSensitivity = 1.2; // 초기에는 더 민감하게 반응
      break;
    case 'building_tension':
      stageSensitivity = 1.0; // 표준 반응
      break;
    case 'intimate_connection':
      stageSensitivity = 0.8; // 친밀해지면 덜 민감하게
      break;
  }

  // 3. 캐릭터의 감성 지능에 따른 반응 세밀함
  const emotionalIntelligence = character.appeal_profile?.emotional_intelligence || 7;
  const intelligenceFactor = 0.8 + (emotionalIntelligence / 50); // 0.8 ~ 1.0

  adjustedImpact = Math.round(adjustedImpact * stageSensitivity * intelligenceFactor);

  console.log(`🎯 호감도 계산: 기본=${baseImpact} → 조정=${adjustedImpact} (단계=${stage}, 민감도=${stageSensitivity}, 감성지능=${emotionalIntelligence})`);

  return adjustedImpact;
}

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST 요청과 GET 요청에서 action 가져오는 방식이 다름
    const action = req.method === 'POST' ? req.body?.action : req.query.action;

    console.log('🔧 Dialogue Manager API 호출:', {
      method: req.method,
      action: action,
      scenario_id: req.query.scenario_id,
      body: req.method === 'POST' ? req.body : null
    });

    // API 테스트
    if (action === 'test') {
      return res.json({
        success: true,
        message: 'Dialogue Manager API 정상 작동',
        timestamp: new Date().toISOString()
      });
    }

    // 대화 목록 조회 (실제로는 에피소드 데이터)
    if (action === 'list' && req.query.scenario_id) {
      try {
        console.log('📚 에피소드 목록 조회:', req.query.scenario_id);

        // 에피소드 데이터베이스 로드
        const episodes = await loadEpisodeDatabase();
        console.log('📊 에피소드 DB 로드 완료');

        // 해당 시나리오의 에피소드 필터링
        const scenarioEpisodes = filterEpisodesByScenario(episodes, req.query.scenario_id);
        console.log('✅ 필터링 완료:', scenarioEpisodes.length, '개');

        return res.json({
          success: true,
          dialogues: scenarioEpisodes,  // 클라이언트에서 dialogues로 기대함
          scenario_id: req.query.scenario_id,
          total: scenarioEpisodes.length
        });

      } catch (error) {
        console.error('❌ 에피소드 목록 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '에피소드 목록 조회 실패: ' + error.message
        });
      }
    }

    // POST 요청 - 에피소드 생성
    if (req.method === 'POST') {
      const body = req.body;
      console.log('📝 에피소드 생성 요청:', body);

      if (body.action === 'create') {
        try {
          const newEpisode = await createEpisode(body);
          return res.json({
            success: true,
            episode: newEpisode,
            message: '에피소드가 성공적으로 생성되었습니다.'
          });
        } catch (error) {
          console.error('❌ 에피소드 생성 실패:', error.message);
          return res.status(500).json({
            success: false,
            message: '에피소드 생성 실패: ' + error.message
          });
        }
      }
    }

    // 전체 에피소드 조회 (새로 추가)
    if (action === 'get_all_episodes') {
      try {
        console.log('📊 전체 에피소드 조회 요청');

        // 에피소드 데이터베이스 로드
        const database = await loadEpisodeDatabase();
        console.log('📊 전체 에피소드 DB 로드 완료');

        return res.json({
          success: true,
          episodes: database.episodes || {},
          metadata: database.metadata || {},
          total: Object.keys(database.episodes || {}).length
        });

      } catch (error) {
        console.error('❌ 전체 에피소드 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '전체 에피소드 조회 실패: ' + error.message
        });
      }
    }

    // 모든 에피소드 초기화 (새로 추가)
    if (action === 'reset_all_episodes' && req.method === 'POST') {
      try {
        console.log('🗑️ 모든 에피소드 초기화 요청');

        // 기존 에피소드 데이터 로드 (삭제 전 개수 확인)
        const existingDatabase = await loadEpisodeDatabase();
        const existingCount = Object.keys(existingDatabase.episodes || {}).length;
        console.log('📊 삭제 대상 에피소드 개수:', existingCount);

        // 빈 에피소드 데이터베이스 구조 생성
        const emptyDatabase = {
          metadata: {
            version: "1.0.0",
            created_date: new Date().toISOString().split('T')[0],
            total_episodes: 0,
            ai_context_engine: "gpt-4o-mini",
            last_updated: new Date().toISOString(),
            data_source: "episode_manager_api",
            deleted_episodes_count: existingCount
          },
          episodes: {}
        };

        console.log('📊 빈 데이터베이스 구조 생성 완료 (기존:', existingCount, '개 삭제 예정)');

        // GitHub API를 통해 파일 업데이트
        const success = await saveEpisodeDatabase(emptyDatabase);

        if (success) {
          console.log('✅ 모든 에피소드 삭제 완료 - 삭제된 개수:', existingCount);
          return res.json({
            success: true,
            message: `모든 에피소드가 성공적으로 삭제되었습니다. (${existingCount}개 삭제됨)`,
            deleted_count: existingCount,
            previous_count: existingCount,
            current_count: 0,
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('GitHub API를 통한 파일 업데이트 실패');
        }

      } catch (error) {
        console.error('❌ 에피소드 초기화 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '에피소드 초기화 실패: ' + error.message
        });
      }
    }

    // 개별 에피소드 삭제
    if (action === 'delete_episode' && req.method === 'POST') {
      try {
        const { episode_id } = req.body;

        if (!episode_id) {
          return res.status(400).json({
            success: false,
            message: 'episode_id 파라미터가 필요합니다.'
          });
        }

        console.log('🗑️ 에피소드 삭제 요청:', episode_id);

        // 기존 에피소드 데이터 로드
        const database = await loadEpisodeDatabase();

        // 삭제할 에피소드가 존재하는지 확인
        if (!database.episodes || !database.episodes[episode_id]) {
          return res.status(404).json({
            success: false,
            message: `에피소드를 찾을 수 없습니다: ${episode_id}`
          });
        }

        // 삭제할 에피소드 정보 보존
        const deletedEpisode = database.episodes[episode_id];
        console.log('🎯 삭제 대상 에피소드:', {
          id: deletedEpisode.id,
          title: deletedEpisode.title,
          character_name: deletedEpisode.character_name,
          difficulty: deletedEpisode.difficulty
        });

        // 해당 에피소드 삭제
        delete database.episodes[episode_id];

        // 메타데이터 업데이트
        const remainingCount = Object.keys(database.episodes).length;
        database.metadata.total_episodes = remainingCount;
        database.metadata.last_updated = new Date().toISOString();

        console.log('📊 삭제 후 남은 에피소드 개수:', remainingCount);

        // GitHub API를 통해 파일 업데이트
        const success = await saveEpisodeDatabase(database);

        if (success) {
          console.log('✅ 에피소드 삭제 완료:', episode_id);
          return res.json({
            success: true,
            message: `에피소드가 성공적으로 삭제되었습니다.`,
            deleted_episode: {
              id: deletedEpisode.id,
              title: deletedEpisode.title || '제목 없음',
              character_name: deletedEpisode.character_name || '캐릭터 없음'
            },
            remaining_count: remainingCount,
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('GitHub API를 통한 파일 업데이트 실패');
        }

      } catch (error) {
        console.error('❌ 에피소드 삭제 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '에피소드 삭제 실패: ' + error.message
        });
      }
    }

    // 에피소드 생성
    if (action === 'create_episode' && req.method === 'POST') {
      try {
        const { scenario_id, episode_title, dialogue_count, difficulty } = req.body;

        if (!scenario_id || !episode_title || !dialogue_count || !difficulty) {
          return res.status(400).json({
            success: false,
            message: '필수 파라미터가 누락되었습니다: scenario_id, episode_title, dialogue_count, difficulty'
          });
        }

        console.log('✨ 새 에피소드 생성 요청:', {
          scenario_id,
          episode_title,
          dialogue_count,
          difficulty
        });

        // 기존 에피소드 데이터 로드
        const database = await loadEpisodeDatabase();

        // 새 에피소드 ID 생성
        const episodeId = generateEpisodeId();

        // 새 에피소드 객체 생성
        const newEpisode = {
          id: episodeId,
          scenario_id: scenario_id,
          title: episode_title,
          difficulty: difficulty,
          dialogue_count: parseInt(dialogue_count),
          created_at: new Date().toISOString(),
          character_id: null, // 나중에 시나리오에서 가져올 수 있음
          character_name: null,
          dialogues: [] // 실제 대화 내용은 별도 생성
        };

        // 데이터베이스에 추가
        database.episodes[episodeId] = newEpisode;

        // 메타데이터 업데이트
        const totalCount = Object.keys(database.episodes).length;
        database.metadata.total_episodes = totalCount;
        database.metadata.last_updated = new Date().toISOString();

        console.log('📊 에피소드 생성 후 총 개수:', totalCount);

        // GitHub API를 통해 저장
        const success = await saveEpisodeDatabase(database);

        if (success) {
          console.log('✅ 새 에피소드 생성 완료:', episodeId);
          return res.json({
            success: true,
            message: `에피소드 "${episode_title}"가 성공적으로 생성되었습니다.`,
            episode: newEpisode,
            total_episodes: totalCount,
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('GitHub API를 통한 파일 저장 실패');
        }

      } catch (error) {
        console.error('❌ 에피소드 생성 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '에피소드 생성 실패: ' + error.message
        });
      }
    }

    // 시나리오별 에피소드 목록 조회
    if (action === 'list_episodes' && req.query.scenario_id) {
      try {
        console.log('📋 시나리오별 에피소드 목록 조회:', req.query.scenario_id);

        const database = await loadEpisodeDatabase();
        const scenarioEpisodes = filterEpisodesByScenario(database, req.query.scenario_id);

        console.log('✅ 시나리오 에피소드 조회 완료:', scenarioEpisodes.length, '개');

        return res.json({
          success: true,
          episodes: scenarioEpisodes,
          scenario_id: req.query.scenario_id,
          total: scenarioEpisodes.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ 시나리오 에피소드 목록 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '에피소드 목록 조회 실패: ' + error.message
        });
      }
    }

    // 에피소드의 대화 목록 조회
    if (action === 'get_episode_dialogues' && req.query.episode_id) {
      try {
        console.log('💬 에피소드 대화 목록 조회:', req.query.episode_id);

        const database = await loadEpisodeDatabase();
        const episode = database.episodes[req.query.episode_id];

        if (!episode) {
          return res.status(404).json({
            success: false,
            message: '에피소드를 찾을 수 없습니다: ' + req.query.episode_id
          });
        }

        // 에피소드의 대화 목록 반환 (실제로는 dialogues 배열 또는 별도 생성 필요)
        const dialogues = episode.dialogues || [];

        return res.json({
          success: true,
          dialogues: dialogues,
          episode_id: req.query.episode_id,
          episode_title: episode.title,
          total: dialogues.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ 에피소드 대화 목록 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '대화 목록 조회 실패: ' + error.message
        });
      }
    }

    // 대화 내용 조회
    if (action === 'get_dialogue_content' && req.query.dialogue_id) {
      try {
        console.log('📝 대화 내용 조회:', req.query.dialogue_id);

        // 실제 구현에서는 dialogue_id로 특정 대화 내용을 찾아야 함
        // 현재는 더미 데이터 반환
        return res.json({
          success: true,
          dialogue: {
            id: req.query.dialogue_id,
            dialogue: "이는 예시 대화 내용입니다. 실제 대화 생성 시스템과 연결이 필요합니다.",
            choices: [
              {
                text: "선택지 1: 공감하며 대답한다",
                affection_change: "+2"
              },
              {
                text: "선택지 2: 농담으로 분위기를 바꾼다",
                affection_change: "+1"
              },
              {
                text: "선택지 3: 진지하게 조언한다",
                affection_change: "+1"
              }
            ]
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ 대화 내용 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '대화 내용 조회 실패: ' + error.message
        });
      }
    }

    // 전체 에피소드 조회 (카운트용)
    if (action === 'get_all_episodes') {
      try {
        console.log('📊 전체 에피소드 조회 (카운트용)');

        const database = await loadEpisodeDatabase();
        const allEpisodes = Object.values(database.episodes || {});

        console.log('📊 전체 에피소드 조회 완료:', allEpisodes.length, '개');

        return res.json({
          success: true,
          episodes: database.episodes || {},
          total: allEpisodes.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ 전체 에피소드 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: '전체 에피소드 조회 실패: ' + error.message
        });
      }
    }

    // 알 수 없는 액션
    return res.status(400).json({
      success: false,
      message: 'Unknown action: ' + action
    });

  } catch (error) {
    console.error('❌ Dialogue Manager API 치명적 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 내부 서버 오류: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 에피소드 데이터베이스 로드 (GitHub API 사용)
async function loadEpisodeDatabase() {
  try {
    console.log('🐙 GitHub API를 통한 에피소드 DB 로드 시작...');

    // GitHub API를 통해 로드
    const result = await loadFromGitHub('data/episodes/episode-database.json');

    if (result.success) {
      console.log('✅ GitHub API를 통한 에피소드 DB 로드 성공');
      return result.data;
    } else {
      console.log('📝 에피소드 DB 파일 없음 - 기본 구조 반환');
      return {
        metadata: {
          version: "1.0.0",
          total_episodes: 0,
          created_date: new Date().toISOString().split('T')[0],
          data_source: "github_api_only"
        },
        episodes: {}
      };
    }

  } catch (error) {
    console.error('❌ 에피소드 DB 로드 오류:', error.message);
    // 에러 시 기본 구조 반환
    return {
      metadata: {
        error: error.message,
        version: "1.0.0",
        total_episodes: 0
      },
      episodes: {}
    };
  }
}

// GitHub API 로드 함수
async function loadFromGitHub(filePath) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN 환경변수가 설정되지 않았습니다');
    }

    const owner = 'EnmanyProject';
    const repo = 'chatgame';

    console.log(`🐙 GitHub API 로드: ${filePath}`);

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('📄 파일이 존재하지 않음 (404)');
        return { success: false, error: 'File not found' };
      }
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const fileData = await response.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    const data = JSON.parse(content);

    console.log('✅ GitHub API 로드 성공');
    return { success: true, data: data };

  } catch (error) {
    console.error('❌ GitHub API 로드 실패:', error);
    return { success: false, error: error.message };
  }
}

// 시나리오별 에피소드 필터링 (안전한 버전)
function filterEpisodesByScenario(database, scenario_id) {
  try {
    console.log('🔍 에피소드 필터링 시작:', scenario_id);

    // 안전한 데이터 검증
    if (!database || !database.episodes) {
      console.log('📝 에피소드 데이터 없음');
      return [];
    }

    const episodes = database.episodes;
    const episodeList = Object.values(episodes);

    console.log('📋 총 에피소드 수:', episodeList.length);

    if (episodeList.length === 0) {
      return [];
    }

    // 안전한 필터링
    const filtered = episodeList.filter(episode => {
      if (!episode || typeof episode !== 'object') {
        return false;
      }
      return episode.scenario_id === scenario_id;
    });

    console.log('✅ 필터링 결과:', filtered.length, '개');
    return filtered;

  } catch (error) {
    console.error('❌ 필터링 오류:', error.message);
    return [];
  }
}

// 캐릭터 특성으로 기존 대화 향상 (새로 추가)
function enhanceDialogueWithCharacterTraits(dialogue, character, relationshipStage) {
  try {
    if (!dialogue.story_flow || !character) return dialogue;

    // 캐릭터 특성 정보 추출
    const appealProfile = character.appeal_profile || {};
    const psychoDepth = character.psychological_depth || {};

    // 대화 흐름의 각 요소에 캐릭터 특성 반영
    const enhancedStoryFlow = dialogue.story_flow.map(item => {
      if (item.type === 'dialogue') {
        // 대화 스타일 향상
        const enhancedItem = { ...item };

        // 유혹 스타일에 따른 말투 조정
        if (appealProfile.seduction_style) {
          enhancedItem.seduction_style = appealProfile.seduction_style;
          enhancedItem.charm_points = appealProfile.charm_points;
        }

        // 관계 단계에 따른 친밀도 조정
        enhancedItem.relationship_stage = relationshipStage;
        return enhancedItem;
      } else if (item.type === 'choice_point') {
        // 선택지에 캐릭터 감정 트리거 정보 추가
        const enhancedChoices = item.choices.map(choice => ({
          ...choice,
          character_triggers: {
            positive: psychoDepth.emotional_triggers?.positive || [],
            negative: psychoDepth.emotional_triggers?.negative || []
          },
          relationship_stage: relationshipStage
        }));

        return {
          ...item,
          choices: enhancedChoices,
          character_context: {
            seduction_style: appealProfile.seduction_style,
            emotional_intelligence: appealProfile.emotional_intelligence,
            relationship_stage: relationshipStage
          }
        };
      }
      return item;
    });

    console.log('✨ 대화에 캐릭터 특성 반영 완료:', {
      seduction_style: appealProfile.seduction_style,
      relationship_stage: relationshipStage,
      dialogue_items: enhancedStoryFlow.length
    });

    return {
      ...dialogue,
      story_flow: enhancedStoryFlow,
      character_awareness: {
        character_id: character.id,
        appeal_profile: appealProfile,
        relationship_stage: relationshipStage,
        enhanced_at: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ 대화 캐릭터 특성 반영 실패:', error.message);
    return dialogue; // 오류 시 원본 반환
  }
}

// 캐릭터 인식 새 대화 생성 (새로 추가)
async function generateCharacterAwareDialogue(data, character, relationshipStage, currentAffection) {
  try {
    console.log('🎭 캐릭터 인식 대화 생성 시작:', {
      character_name: character?.basic_info?.name || character?.name || '알 수 없음',
      relationship_stage: relationshipStage,
      current_affection: currentAffection
    });

    if (!character) {
      throw new Error('캐릭터 데이터를 찾을 수 없습니다. 캐릭터 ID를 확인해주세요.');
    }

    // 캐릭터 특성 기반 대화 템플릿 생성
    const appealProfile = character.appeal_profile || {};
    const psychoDepth = character.psychological_depth || {};

    // 관계 단계별 대화 스타일 결정
    const stageConfig = character.relationship_progression?.stages?.[relationshipStage] || {
      behaviors: ['friendly_conversation'],
      dialogue_style: 'warm_and_approachable'
    };

    // 유혹 스타일에 따른 대화 생성
    const seductionStyle = appealProfile.seduction_style || 'warm_nurturing';
    const characterName = character.basic_info?.name || character.name || '캐릭터';

    // 대화 생성 (캐릭터 특성 반영)
    const generatedDialogue = {
      story_flow: [
        {
          type: "dialogue",
          speaker: characterName,
          text: generateCharacterSpecificDialogue(character, relationshipStage, data.user_input_prompt),
          emotion: getEmotionForStage(relationshipStage, seductionStyle),
          narration: generateCharacterSpecificNarration(character, relationshipStage),
          seduction_style: seductionStyle,
          relationship_stage: relationshipStage
        },
        {
          type: "choice_point",
          situation: generateSituationForStage(relationshipStage, characterName),
          choices: generateCharacterSpecificChoices(character, relationshipStage, currentAffection),
          character_context: {
            seduction_style: seductionStyle,
            emotional_intelligence: appealProfile.emotional_intelligence || 7,
            charm_points: appealProfile.charm_points || [],
            relationship_stage: relationshipStage
          }
        }
      ],
      episode_summary: `${characterName}와의 ${relationshipStage} 단계 대화 (${seductionStyle} 스타일)`,
      character_awareness: {
        character_id: character.id,
        appeal_profile: appealProfile,
        psychological_depth: psychoDepth,
        relationship_stage: relationshipStage,
        generated_at: new Date().toISOString()
      }
    };

    console.log('✅ 캐릭터 인식 대화 생성 완료');
    return generatedDialogue;

  } catch (error) {
    console.error('❌ 캐릭터 인식 대화 생성 실패:', error.message);
    throw new Error('대화 생성 실패: ' + error.message);
  }
}

// 캐릭터별 맞춤 대화 생성 헬퍼 함수들
function generateCharacterSpecificDialogue(character, relationshipStage, userPrompt) {
  const characterName = character.basic_info?.name || character.name || '캐릭터';
  const seductionStyle = character.appeal_profile?.seduction_style || 'warm_nurturing';

  // 유혹 스타일별 대화 패턴
  const dialoguePatterns = {
    playful_confident: {
      initial_attraction: `오빠~ 혹시 ${userPrompt || '그런 얘기'} 진짜야? 😏 나도 그런 거 좋아하는데... 어떻게 알았지?`,
      building_tension: `정말? 오빠 생각보다 센스 있네~ 💕 이런 식으로 나랑 놀아줄 거야?`,
      intimate_connection: `오빠... 이제 진짜 나한테 마음이 있는 거 맞지? 😳 솔직히 말해봐~`
    },
    mysterious_elegant: {
      initial_attraction: `흥미롭네요... ${userPrompt || '그런 이야기'}는 처음 들어보는 관점이에요. 더 자세히 말해주실래요?`,
      building_tension: `당신에 대해 궁금한 게 많아지고 있어요... 🌙 그렇게 깊은 생각을 하는 사람이었군요.`,
      intimate_connection: `이제야 당신의 진짜 모습을 보는 것 같아요... ✨ 마음이 두근거려요.`
    },
    warm_nurturing: {
      initial_attraction: `와~ 정말요? 그런 생각을 하고 계셨구나요! 😊 저도 그런 걸 좋아해요. 함께 이야기해 봐요.`,
      building_tension: `오빠와 이렇게 대화하니까 정말 편해요... 💕 마음이 따뜻해져요.`,
      intimate_connection: `오빠 정말 소중해요... 🥺 이런 마음 처음이에요. 계속 옆에 있어 주실 거죠?`
    },
    intellectually_stimulating: {
      initial_attraction: `정말 흥미로운 관점이네요. ${userPrompt || '그 주제'}에 대해 저는 다른 생각을 갖고 있는데, 토론해 볼까요?`,
      building_tension: `당신의 지적 호기심이 매력적이에요... 📚 더 깊은 대화를 나눠보고 싶어요.`,
      intimate_connection: `당신과의 대화는 언제나 새로운 발견이에요... 💭 평생 이런 지적 교감을 나누고 싶어요.`
    }
  };

  const pattern = dialoguePatterns[seductionStyle] || dialoguePatterns.warm_nurturing;
  return pattern[relationshipStage] || pattern.initial_attraction;
}

function getEmotionForStage(relationshipStage, seductionStyle) {
  const emotionMap = {
    initial_attraction: {
      playful_confident: '장난스러움',
      mysterious_elegant: '신비로움',
      warm_nurturing: '따뜻함',
      intellectually_stimulating: '호기심'
    },
    building_tension: {
      playful_confident: '유혹적',
      mysterious_elegant: '은밀함',
      warm_nurturing: '애정어림',
      intellectually_stimulating: '지적 흥미'
    },
    intimate_connection: {
      playful_confident: '애교',
      mysterious_elegant: '깊은 신뢰',
      warm_nurturing: '사랑',
      intellectually_stimulating: '깊은 유대감'
    }
  };

  return emotionMap[relationshipStage]?.[seductionStyle] || '따뜻함';
}

function generateCharacterSpecificNarration(character, relationshipStage) {
  const characterName = character.basic_info?.name || character.name || '그녀';
  const charmPoints = character.appeal_profile?.charm_points || ['infectious_smile'];

  const narrativeElements = {
    infectious_smile: '환한 미소를 지으며',
    witty_banter: '재치있는 표정으로',
    confident_touch: '자신감 있는 몸짓으로',
    mysterious_aura: '신비로운 눈빛으로',
    graceful_movements: '우아한 몸짓으로',
    expressive_eyes: '표현력 있는 눈으로'
  };

  const primaryCharm = charmPoints[0] || 'infectious_smile';
  const charmAction = narrativeElements[primaryCharm] || '미소를 지으며';

  const stageNarrations = {
    initial_attraction: `${characterName}가 ${charmAction} 호기심 어린 표정을 짓는다.`,
    building_tension: `${characterName}가 ${charmAction} 당신을 바라보며 약간 볼이 붉어진다.`,
    intimate_connection: `${characterName}가 ${charmAction} 당신에게 더 가까이 다가온다.`
  };

  return stageNarrations[relationshipStage] || stageNarrations.initial_attraction;
}

function generateSituationForStage(relationshipStage, characterName) {
  const situations = {
    initial_attraction: `${characterName}가 당신에게 관심을 보이기 시작합니다. 어떻게 반응하시겠습니까?`,
    building_tension: `${characterName}와의 관계가 발전하고 있습니다. 다음 단계로 나아가고 싶습니다.`,
    intimate_connection: `${characterName}와 깊은 유대감을 형성했습니다. 이 특별한 순간을 어떻게 할까요?`
  };

  return situations[relationshipStage] || situations.initial_attraction;
}

function generateCharacterSpecificChoices(character, relationshipStage, currentAffection) {
  const emotionalTriggers = character.psychological_depth?.emotional_triggers || {};
  const seductionStyle = character.appeal_profile?.seduction_style || 'warm_nurturing';

  // 기본 선택지 템플릿
  const baseChoices = {
    initial_attraction: [
      { text: "진심으로 공감하며 대답한다", affection_impact: 2, tags: ["genuine_compliments", "emotional_connection"] },
      { text: "유머러스하게 분위기를 바꾼다", affection_impact: 1, tags: ["humor", "light_mood"] },
      { text: "더 깊은 질문을 던진다", affection_impact: 1, tags: ["intellectual_stimulation", "curiosity"] }
    ],
    building_tension: [
      { text: "그녀의 마음을 진지하게 들어준다", affection_impact: 3, tags: ["emotional_support", "genuine_interest"] },
      { text: "은근히 칭찬을 건넨다", affection_impact: 2, tags: ["genuine_compliments", "confidence_boost"] },
      { text: "자신의 진솔한 이야기를 나눈다", affection_impact: 2, tags: ["vulnerability", "trust_building"] }
    ],
    intimate_connection: [
      { text: "솔직한 마음을 고백한다", affection_impact: 4, tags: ["emotional_honesty", "vulnerability"] },
      { text: "따뜻하게 안아준다", affection_impact: 3, tags: ["physical_affection", "comfort"] },
      { text: "미래에 대한 이야기를 꺼낸다", affection_impact: 3, tags: ["future_planning", "commitment"] }
    ]
  };

  const choices = baseChoices[relationshipStage] || baseChoices.initial_attraction;

  // 캐릭터 감정 트리거에 따른 선택지 조정
  return choices.map(choice => {
    let adjustedImpact = choice.affection_impact;

    // 긍정적 트리거 매칭 시 보너스
    if (emotionalTriggers.positive) {
      const hasPositiveTrigger = choice.tags.some(tag =>
        emotionalTriggers.positive.includes(tag)
      );
      if (hasPositiveTrigger) {
        adjustedImpact += 1;
      }
    }

    // 부정적 트리거 매칭 시 페널티
    if (emotionalTriggers.negative) {
      const hasNegativeTrigger = choice.tags.some(tag =>
        emotionalTriggers.negative.includes(tag)
      );
      if (hasNegativeTrigger) {
        adjustedImpact -= 1;
      }
    }

    return {
      ...choice,
      affection_impact: Math.max(0, adjustedImpact), // 최소 0
      consequence: `캐릭터의 ${seductionStyle} 스타일에 맞는 반응을 보입니다.`,
      character_triggers: {
        positive: emotionalTriggers.positive || [],
        negative: emotionalTriggers.negative || []
      }
    };
  });
}

// ⚠️ DEPRECATED - Fallback 시스템 제거됨
// 대화 생성 실패 시 명확한 에러를 반환하도록 변경
// 이 함수는 더 이상 사용되지 않음
function generateFallbackDialogue(data) {
  return {
    story_flow: [
      {
        type: "dialogue",
        speaker: data.character_name || "캐릭터",
        text: "안녕하세요! 오늘 기분이 어떠세요? 😊",
        emotion: "친근함",
        narration: "그녀가 밝은 미소로 당신을 바라본다."
      },
      {
        type: "choice_point",
        situation: "새로운 대화가 시작되었습니다. 어떻게 반응하시겠습니까?",
        choices: [
          { text: "기분 좋다고 답한다", affection_impact: 1, consequence: "긍정적인 분위기로 대화가 이어집니다" },
          { text: "그저 그렇다고 답한다", affection_impact: 0, consequence: "평범한 대화가 계속됩니다" },
          { text: "당신은 어떤지 되물어본다", affection_impact: 1, consequence: "서로에 대한 관심을 표현합니다" }
        ]
      }
    ],
    episode_summary: "기본 대화 템플릿이 사용되었습니다.",
    character_awareness: {
      status: "fallback_mode",
      reason: "character_data_not_available"
    }
  };
}

// 새 에피소드 생성 및 저장 (캐릭터 인식 기능 통합)
async function createEpisode(data) {
  try {
    console.log('🎯 에피소드 생성 데이터 확인:', {
      has_generated_dialogue: !!data.generated_dialogue,
      has_ai_generated_dialogue: !!data.ai_generated_dialogue,
      user_prompt: data.user_input_prompt,
      character_id: data.character_id,
      scenario_id: data.scenario_id
    });

    // 캐릭터 데이터 로드 및 관계 단계 확인
    let character = null;
    let currentAffection = data.current_affection || 0;
    let relationshipStage = 'initial_attraction';

    if (data.character_id) {
      console.log('📚 캐릭터 데이터 로드 시작:', data.character_id);
      character = await getCharacterById(data.character_id);

      if (character) {
        relationshipStage = getRelationshipStage(currentAffection, character);
        console.log('✅ 캐릭터 로드 완료:', {
          name: character.basic_info?.name || character.name,
          seduction_style: character.appeal_profile?.seduction_style,
          relationship_stage: relationshipStage,
          current_affection: currentAffection
        });
      }
    }

    // 캐릭터 기반 대화 생성 또는 기존 대화 사용
    let dialogue;

    if (data.generated_dialogue || data.ai_generated_dialogue) {
      // 기존 AI 생성 대화 사용 (캐릭터 특성 반영 향상)
      dialogue = data.generated_dialogue || data.ai_generated_dialogue;

      // 캐릭터 특성을 대화에 추가 반영
      if (character && dialogue.story_flow) {
        dialogue = enhanceDialogueWithCharacterTraits(dialogue, character, relationshipStage);
      }

      console.log('✅ AI 생성된 대화 사용됨 (캐릭터 특성 반영)');
    } else {
      // 캐릭터 기반 새 대화 생성
      dialogue = await generateCharacterAwareDialogue(data, character, relationshipStage, currentAffection);
      console.log('✨ 캐릭터 인식 대화 새로 생성됨');
    }

    const newEpisode = {
      id: `dialogue_${data.scenario_id}_${Date.now()}`,
      scenario_id: data.scenario_id,
      dialogue_number: data.dialogue_number || 1,
      title: data.title || `대화 ${data.dialogue_number || 1}번`,
      character_id: data.character_id,
      character_name: data.character_name,
      difficulty: data.difficulty || 'Easy',
      user_input_prompt: data.user_input_prompt,
      created_at: new Date().toISOString(),
      dialogue: dialogue
    };

    console.log('✅ 에피소드 객체 생성 완료:', newEpisode.id);

    // 실제 저장 - 기존 데이터베이스 로드
    const database = await loadEpisodeDatabase();

    // 에피소드 추가
    database.episodes = database.episodes || {};
    database.episodes[newEpisode.id] = newEpisode;

    // 메타데이터 업데이트
    database.metadata = database.metadata || {};
    database.metadata.total_episodes = Object.keys(database.episodes).length;
    database.metadata.last_updated = new Date().toISOString();

    // 파일에 저장
    await saveEpisodeDatabase(database);

    console.log('✅ 에피소드 데이터베이스 저장 완료:', newEpisode.id);
    return newEpisode;

  } catch (error) {
    console.error('❌ 에피소드 생성 및 저장 오류:', error.message);
    throw error;
  }
}

// 에피소드 데이터베이스 저장 함수 (GitHub API 사용)
async function saveEpisodeDatabase(database) {
  try {
    console.log('🐙 GitHub API를 통한 에피소드 저장 시작...');

    // GitHub API를 통해 저장 (시나리오와 동일한 방식)
    const result = await saveToGitHub('data/episodes/episode-database.json', database);

    if (result.success) {
      console.log('✅ GitHub API를 통한 에피소드 저장 완료');
    } else {
      throw new Error(`GitHub API 저장 실패: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ GitHub API 에피소드 저장 실패:', error);
    throw error;
  }
}

// GitHub API 저장 함수 (시나리오 매니저에서 사용하는 것과 동일)
async function saveToGitHub(filePath, data) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN 환경변수가 설정되지 않았습니다');
    }

    const owner = 'EnmanyProject';
    const repo = 'chatgame';
    const branch = 'main';

    console.log(`🐙 GitHub API 저장: ${filePath}`);

    // 현재 파일 정보 가져오기 (SHA 필요)
    let currentSha = null;
    try {
      const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (getResponse.ok) {
        const currentFile = await getResponse.json();
        currentSha = currentFile.sha;
        console.log('📄 기존 파일 SHA:', currentSha);
      }
    } catch (error) {
      console.log('📝 새 파일 생성 (기존 파일 없음)');
    }

    // 파일 내용을 Base64로 인코딩
    const content = Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64');

    // GitHub API를 통해 파일 저장/업데이트
    const saveData = {
      message: `Update episodes database - ${new Date().toISOString()}`,
      content: content,
      branch: branch
    };

    if (currentSha) {
      saveData.sha = currentSha; // 기존 파일 업데이트
    }

    const saveResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saveData)
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      throw new Error(`GitHub API 오류: ${saveResponse.status} - ${errorText}`);
    }

    const result = await saveResponse.json();
    console.log('✅ GitHub API 저장 성공:', result.commit.sha);

    return { success: true, commit: result.commit };

  } catch (error) {
    console.error('❌ GitHub API 저장 실패:', error);
    return { success: false, error: error.message };
  }
}

// 에피소드 ID 생성 유틸리티 함수
function generateEpisodeId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ep_${timestamp}_${randomStr}`;
}