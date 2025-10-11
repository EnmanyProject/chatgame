/**
 * Episode Manager API v2.1 - Dialogue Content & Affection System
 *
 * 호감도/애정도 기반 대화 콘텐츠 관리
 * - AI 기반 에피소드 생성 (대사 + 선택지)
 * - 호감도/애정도에 따른 톤 조절
 * - 주관식 답변 AI 평가
 *
 * @version 2.1.0
 * @created 2025-10-09
 * @updated 2025-10-09
 */

// GitHub API 설정
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = 'EnmanyProject';
const GITHUB_REPO = 'chatgame';
const GITHUB_BRANCH = 'main';

// AI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// 기본 에피소드 디렉토리
const EPISODES_DIR = 'data/episodes';

/**
 * Main API Handler
 */
module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ✅ DELETE도 쿼리 파라미터에서 읽음 (GET, DELETE → query / POST, PUT → body)
    const { action, character_id, episode_id } = (req.method === 'GET' || req.method === 'DELETE') ? req.query : req.body;

    console.log(`📥 Episode Manager API v2.1 - Action: ${action}`);

    switch (action) {
      // 캐릭터의 모든 에피소드 조회
      case 'list':
        return await handleList(req, res, character_id);

      // 새 에피소드 생성 (수동)
      case 'create':
        return await handleCreate(req, res);

      // 🆕 AI 기반 에피소드 자동 생성
      case 'generate_episode':
        return await handleGenerateEpisode(req, res);

      // 에피소드 수정
      case 'update':
        return await handleUpdate(req, res);

      // 에피소드 삭제
      case 'delete':
        return await handleDelete(req, res, episode_id, character_id);

      // 트리거 조건 체크 (활성화할 에피소드 찾기)
      case 'check_triggers':
        return await handleCheckTriggers(req, res, character_id);

      // 에피소드를 대화방으로 전송
      case 'send_to_chatroom':
        return await handleSendToChatroom(req, res, episode_id);

      // 에피소드 완료 처리
      case 'complete_episode':
        return await handleCompleteEpisode(req, res);

      // 에피소드 상태 변경
      case 'change_status':
        return await handleChangeStatus(req, res);

      // 에피소드 상세 정보 조회
      case 'get':
        return await handleGet(req, res, episode_id);

      // 🆕 주관식 답변 AI 평가 (게임 플레이 중)
      case 'evaluate_user_input':
        return await handleEvaluateUserInput(req, res);

      default:
        return res.status(400).json({
          success: false,
          message: `알 수 없는 액션: ${action}`
        });
    }

  } catch (error) {
    console.error('❌ Episode Manager API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: error.message
    });
  }
};

/**
 * 캐릭터의 에피소드 목록 조회
 */
async function handleList(req, res, character_id) {
  console.log(`🔍 [DEBUG] handleList 호출: character_id=${character_id}`);

  if (!character_id) {
    console.error('❌ [DEBUG] character_id 누락');
    return res.status(400).json({
      success: false,
      message: 'character_id가 필요합니다'
    });
  }

  try {
    console.log(`🔍 [DEBUG] loadCharacterEpisodes 호출 중...`);
    const episodeData = await loadCharacterEpisodes(character_id);
    console.log(`✅ [DEBUG] loadCharacterEpisodes 완료:`, {
      character_id: episodeData.character_id,
      character_name: episodeData.character_name,
      total_episodes: episodeData.total_episodes,
      episodes_count: Object.keys(episodeData.episodes || {}).length
    });

    // 🆕 데이터 검증
    if (!episodeData || typeof episodeData !== 'object') {
      console.error(`⚠️ [DEBUG] 유효하지 않은 episodeData:`, typeof episodeData);
      return res.status(500).json({
        success: false,
        message: '에피소드 데이터 구조가 올바르지 않습니다'
      });
    }

    // 🆕 안전한 응답 생성 (모든 필드 기본값 보장)
    const response = {
      success: true,
      character_id: episodeData.character_id || character_id,
      character_name: episodeData.character_name || 'Unknown',
      total_episodes: episodeData.total_episodes || 0,
      episodes: episodeData.episodes || {}
    };

    console.log(`✅ [DEBUG] 응답 전송 준비 완료`);
    return res.status(200).json(response);

  } catch (error) {
    console.error(`❌ [DEBUG] 에피소드 목록 로드 실패 (${character_id}):`, error);
    console.error('❌ [DEBUG] 에러 스택:', error.stack);

    return res.status(500).json({
      success: false,
      message: '에피소드 목록을 불러올 수 없습니다',
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * 새 에피소드 생성
 */
async function handleCreate(req, res) {
  const {
    character_id,
    scenario_template_id,
    title,
    description,
    difficulty,
    trigger_conditions,
    dialogues
  } = req.body;

  // 필수 필드 검증
  if (!character_id || !scenario_template_id || !title) {
    return res.status(400).json({
      success: false,
      message: '필수 필드가 누락되었습니다 (character_id, scenario_template_id, title)'
    });
  }

  try {
    // 캐릭터 에피소드 데이터 로드
    const episodeData = await loadCharacterEpisodes(character_id);

    // 새 에피소드 ID 생성
    const episode_id = generateEpisodeId(character_id, scenario_template_id);

    // 새 에피소드 객체 생성
    const newEpisode = {
      id: episode_id,
      character_id,
      scenario_template_id,
      title,
      description: description || '',
      status: 'pending',
      trigger_conditions: trigger_conditions || {
        type: 'affection_based',
        affection_min: 0,
        affection_max: 100,
        time_based: null,
        event_based: null,
        priority: 5
      },
      dialogue_count: dialogues ? dialogues.length : 0,
      difficulty: difficulty || 'Easy',
      created_at: new Date().toISOString(),
      sent_at: null,
      completed_at: null,
      play_stats: {
        played_count: 0,
        last_played: null,
        best_affection_gain: 0
      },
      dialogues: dialogues || []
    };

    // 에피소드 추가
    episodeData.episodes[episode_id] = newEpisode;
    episodeData.total_episodes = Object.keys(episodeData.episodes).length;
    episodeData.metadata.last_updated = new Date().toISOString();

    // GitHub에 저장
    await saveCharacterEpisodes(character_id, episodeData);

    console.log(`✅ 에피소드 생성 완료: ${episode_id}`);

    return res.status(200).json({
      success: true,
      message: '에피소드가 생성되었습니다',
      episode: newEpisode
    });

  } catch (error) {
    console.error('❌ 에피소드 생성 실패:', error);
    return res.status(500).json({
      success: false,
      message: '에피소드 생성에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 에피소드 수정
 */
async function handleUpdate(req, res) {
  const {
    episode_id,
    character_id,
    title,
    description,
    difficulty,
    trigger_conditions,
    dialogues
  } = req.body;

  if (!episode_id || !character_id) {
    return res.status(400).json({
      success: false,
      message: 'episode_id와 character_id가 필요합니다'
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);

    if (!episodeData.episodes[episode_id]) {
      return res.status(404).json({
        success: false,
        message: '에피소드를 찾을 수 없습니다'
      });
    }

    // 에피소드 업데이트
    const episode = episodeData.episodes[episode_id];

    if (title) episode.title = title;
    if (description !== undefined) episode.description = description;
    if (difficulty) episode.difficulty = difficulty;
    if (trigger_conditions) episode.trigger_conditions = trigger_conditions;
    if (dialogues) {
      episode.dialogues = dialogues;
      episode.dialogue_count = dialogues.length;
    }

    episodeData.metadata.last_updated = new Date().toISOString();

    // GitHub에 저장
    await saveCharacterEpisodes(character_id, episodeData);

    console.log(`✅ 에피소드 수정 완료: ${episode_id}`);

    return res.status(200).json({
      success: true,
      message: '에피소드가 수정되었습니다',
      episode: episode
    });

  } catch (error) {
    console.error('❌ 에피소드 수정 실패:', error);
    return res.status(500).json({
      success: false,
      message: '에피소드 수정에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 에피소드 삭제
 */
async function handleDelete(req, res, episode_id, character_id) {
  // ✅ character_id는 이미 쿼리 파라미터에서 추출됨 (line 41)

  if (!episode_id || !character_id) {
    return res.status(400).json({
      success: false,
      message: 'episode_id와 character_id가 필요합니다'
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);

    if (!episodeData.episodes[episode_id]) {
      return res.status(404).json({
        success: false,
        message: '에피소드를 찾을 수 없습니다'
      });
    }

    // 에피소드 삭제
    delete episodeData.episodes[episode_id];
    episodeData.total_episodes = Object.keys(episodeData.episodes).length;
    episodeData.metadata.last_updated = new Date().toISOString();

    // GitHub에 저장
    await saveCharacterEpisodes(character_id, episodeData);

    console.log(`✅ 에피소드 삭제 완료: ${episode_id}`);

    return res.status(200).json({
      success: true,
      message: '에피소드가 삭제되었습니다'
    });

  } catch (error) {
    console.error('❌ 에피소드 삭제 실패:', error);
    return res.status(500).json({
      success: false,
      message: '에피소드 삭제에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 트리거 조건 체크 - 활성화 가능한 에피소드 찾기
 */
async function handleCheckTriggers(req, res, character_id) {
  const { current_affection, current_time, completed_events } = req.method === 'GET' ? req.query : req.body;

  if (!character_id) {
    return res.status(400).json({
      success: false,
      message: 'character_id가 필요합니다'
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);
    const activatableEpisodes = [];

    // pending 상태의 에피소드들 체크
    for (const episode_id in episodeData.episodes) {
      const episode = episodeData.episodes[episode_id];

      if (episode.status !== 'pending') continue;

      const triggers = episode.trigger_conditions;
      let canActivate = true;

      // 호감도 조건 체크
      if (triggers.affection_min !== undefined && triggers.affection_max !== undefined) {
        const affection = parseInt(current_affection) || 0;
        if (affection < triggers.affection_min || affection > triggers.affection_max) {
          canActivate = false;
        }
      }

      // 시간 조건 체크
      if (canActivate && triggers.time_based) {
        const timeMatch = checkTimeCondition(current_time, triggers.time_based);
        if (!timeMatch) {
          canActivate = false;
        }
      }

      // 이벤트 조건 체크
      if (canActivate && triggers.event_based) {
        const completedList = completed_events ? completed_events.split(',') : [];
        if (!completedList.includes(triggers.event_based)) {
          canActivate = false;
        }
      }

      if (canActivate) {
        activatableEpisodes.push({
          episode_id: episode.id,
          title: episode.title,
          priority: triggers.priority || 5,
          difficulty: episode.difficulty
        });
      }
    }

    // 우선순위 정렬
    activatableEpisodes.sort((a, b) => b.priority - a.priority);

    console.log(`✅ 트리거 체크 완료: ${activatableEpisodes.length}개 활성화 가능`);

    return res.status(200).json({
      success: true,
      character_id,
      activatable_count: activatableEpisodes.length,
      episodes: activatableEpisodes
    });

  } catch (error) {
    console.error('❌ 트리거 체크 실패:', error);
    return res.status(500).json({
      success: false,
      message: '트리거 체크에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 에피소드를 대화방으로 전송
 */
async function handleSendToChatroom(req, res, episode_id) {
  const { character_id } = req.body;

  if (!episode_id || !character_id) {
    return res.status(400).json({
      success: false,
      message: 'episode_id와 character_id가 필요합니다'
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);
    const episode = episodeData.episodes[episode_id];

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: '에피소드를 찾을 수 없습니다'
      });
    }

    if (episode.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `에피소드 상태가 pending이 아닙니다: ${episode.status}`
      });
    }

    // 상태 변경
    episode.status = 'sent';
    episode.sent_at = new Date().toISOString();
    episodeData.metadata.last_updated = new Date().toISOString();

    // GitHub에 저장
    await saveCharacterEpisodes(character_id, episodeData);

    console.log(`✅ 에피소드 전송 완료: ${episode_id}`);

    return res.status(200).json({
      success: true,
      message: '에피소드가 대화방으로 전송되었습니다',
      episode: episode
    });

  } catch (error) {
    console.error('❌ 에피소드 전송 실패:', error);
    return res.status(500).json({
      success: false,
      message: '에피소드 전송에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 에피소드 완료 처리
 */
async function handleCompleteEpisode(req, res) {
  const { episode_id, character_id, affection_gain } = req.body;

  if (!episode_id || !character_id) {
    return res.status(400).json({
      success: false,
      message: 'episode_id와 character_id가 필요합니다'
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);
    const episode = episodeData.episodes[episode_id];

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: '에피소드를 찾을 수 없습니다'
      });
    }

    // 상태 변경
    episode.status = 'completed';
    episode.completed_at = new Date().toISOString();

    // 플레이 통계 업데이트
    episode.play_stats.played_count += 1;
    episode.play_stats.last_played = new Date().toISOString();

    if (affection_gain && affection_gain > episode.play_stats.best_affection_gain) {
      episode.play_stats.best_affection_gain = affection_gain;
    }

    episodeData.metadata.last_updated = new Date().toISOString();

    // GitHub에 저장
    await saveCharacterEpisodes(character_id, episodeData);

    console.log(`✅ 에피소드 완료 처리: ${episode_id}`);

    return res.status(200).json({
      success: true,
      message: '에피소드가 완료되었습니다',
      episode: episode
    });

  } catch (error) {
    console.error('❌ 에피소드 완료 처리 실패:', error);
    return res.status(500).json({
      success: false,
      message: '에피소드 완료 처리에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 에피소드 상태 변경
 */
async function handleChangeStatus(req, res) {
  const { episode_id, character_id, new_status } = req.body;

  const validStatuses = ['pending', 'sent', 'playing', 'completed'];

  if (!episode_id || !character_id || !new_status) {
    return res.status(400).json({
      success: false,
      message: 'episode_id, character_id, new_status가 필요합니다'
    });
  }

  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({
      success: false,
      message: `유효하지 않은 상태: ${new_status}`
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);
    const episode = episodeData.episodes[episode_id];

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: '에피소드를 찾을 수 없습니다'
      });
    }

    // 상태 변경
    const oldStatus = episode.status;
    episode.status = new_status;
    episodeData.metadata.last_updated = new Date().toISOString();

    // GitHub에 저장
    await saveCharacterEpisodes(character_id, episodeData);

    console.log(`✅ 에피소드 상태 변경: ${episode_id} (${oldStatus} → ${new_status})`);

    return res.status(200).json({
      success: true,
      message: '에피소드 상태가 변경되었습니다',
      old_status: oldStatus,
      new_status: new_status,
      episode: episode
    });

  } catch (error) {
    console.error('❌ 에피소드 상태 변경 실패:', error);
    return res.status(500).json({
      success: false,
      message: '에피소드 상태 변경에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 에피소드 상세 정보 조회
 */
async function handleGet(req, res, episode_id) {
  const { character_id } = req.query;

  if (!episode_id || !character_id) {
    return res.status(400).json({
      success: false,
      message: 'episode_id와 character_id가 필요합니다'
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);
    const episode = episodeData.episodes[episode_id];

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: '에피소드를 찾을 수 없습니다'
      });
    }

    return res.status(200).json({
      success: true,
      episode: episode
    });

  } catch (error) {
    console.error('❌ 에피소드 조회 실패:', error);
    return res.status(500).json({
      success: false,
      message: '에피소드 조회에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * ===== Helper Functions =====
 */

/**
 * 캐릭터 에피소드 데이터 로드 (GitHub)
 */
async function loadCharacterEpisodes(character_id) {
  const fileName = `${character_id}_episodes.json`;
  const filePath = `${EPISODES_DIR}/${fileName}`;

  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // 파일이 없으면 (404) 빈 에피소드 구조 반환
    if (response.status === 404) {
      console.log(`📄 에피소드 파일 없음, 빈 구조 생성: ${character_id}`);

      // 캐릭터 이름 추출 (ID에서 첫 부분) - 에러 없이 안전하게
      const nameFromId = character_id.split('_')[0] || 'Unknown';

      return {
        character_id: character_id,
        character_name: nameFromId,
        character_mbti: 'INFP',
        total_episodes: 0,
        metadata: {
          version: '2.1.0',
          schema_type: 'character_based_dialogue',
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        },
        episodes: {},
        schema_description: {
          purpose: '캐릭터 대화 콘텐츠 관리 (호감도/애정도 기반)',
          episode_structure: [
            '에피소드 = 대사 + 객관식 선택지 + 주관식 입력',
            '호감도: 대화 톤/표현에 영향',
            '애정도: 호칭/허용 답변에 영향'
          ],
          dialogue_flow: [
            'narration - 상황 설명',
            'character_dialogue - 캐릭터 대사',
            'multiple_choice - 객관식 선택지 (호감도/애정도 변화)',
            'free_input - 주관식 입력 (AI 판정)'
          ],
          lifecycle: [
            'pending - 생성됨, 트리거 대기',
            'sent - 채팅방 전송됨',
            'playing - 유저 플레이 중',
            'completed - 완료됨'
          ]
        }
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');

    return JSON.parse(content);

  } catch (error) {
    // 어떤 에러가 발생하든 빈 에피소드 구조 반환 (안전성 우선)
    console.warn(`⚠️ 캐릭터 에피소드 로드 실패, 빈 구조 반환 (${character_id}):`, error.message);

    // 캐릭터 이름 추출 (ID에서 첫 부분) - 에러 없이 안전하게
    const nameFromId = character_id.split('_')[0] || 'Unknown';

    return {
      character_id: character_id,
      character_name: nameFromId,
      character_mbti: 'INFP',
      total_episodes: 0,
      metadata: {
        version: '2.1.0',
        schema_type: 'character_based_dialogue',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      },
      episodes: {},
      schema_description: {
        purpose: '캐릭터 대화 콘텐츠 관리 (호감도/애정도 기반)',
        episode_structure: [
          '에피소드 = 대사 + 객관식 선택지 + 주관식 입력',
          '호감도: 대화 톤/표현에 영향',
          '애정도: 호칭/허용 답변에 영향'
        ],
        dialogue_flow: [
          'narration - 상황 설명',
          'character_dialogue - 캐릭터 대사',
          'multiple_choice - 객관식 선택지 (호감도/애정도 변화)',
          'free_input - 주관식 입력 (AI 판정)'
        ],
        lifecycle: [
          'pending - 생성됨, 트리거 대기',
          'sent - 채팅방 전송됨',
          'playing - 유저 플레이 중',
          'completed - 완료됨'
        ]
      }
    };
  }
}

/**
 * 캐릭터 에피소드 데이터 저장 (GitHub)
 */
async function saveCharacterEpisodes(character_id, episodeData) {
  const fileName = `${character_id}_episodes.json`;
  const filePath = `${EPISODES_DIR}/${fileName}`;

  try {
    // 현재 파일의 SHA 가져오기
    const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    if (getResponse.ok) {
      const getData = await getResponse.json();
      sha = getData.sha;
    }

    // 파일 저장
    const content = Buffer.from(JSON.stringify(episodeData, null, 2)).toString('base64');

    const putUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    const putData = {
      message: `Update ${character_id} episodes`,
      content: content,
      branch: GITHUB_BRANCH
    };

    if (sha) {
      putData.sha = sha;
    }

    const putResponse = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putData)
    });

    if (!putResponse.ok) {
      const errorText = await putResponse.text();
      throw new Error(`GitHub API 저장 오류: ${putResponse.status} - ${errorText}`);
    }

    const result = await putResponse.json();
    console.log(`✅ GitHub 저장 성공: ${result.commit.sha}`);

    return { success: true };

  } catch (error) {
    console.error(`❌ 캐릭터 에피소드 저장 실패 (${character_id}):`, error);
    throw error;
  }
}

/**
 * 에피소드 ID 생성
 */
function generateEpisodeId(character_id, scenario_template_id) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  // 캐릭터 이름 추출 (ID에서 첫 부분)
  const charName = character_id.split('_')[0];

  return `ep_${charName}_${scenario_template_id}_${random}`;
}

/**
 * 시간 조건 체크
 */
function checkTimeCondition(current_time, time_condition) {
  if (!current_time) {
    current_time = new Date();
  } else if (typeof current_time === 'string') {
    current_time = new Date(current_time);
  }

  const hour = current_time.getHours();
  const day = current_time.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = (day === 0 || day === 6);

  switch (time_condition) {
    case 'morning_weekday':
      return !isWeekend && hour >= 6 && hour < 11;

    case 'lunch_time':
      return hour >= 11 && hour < 14;

    case 'afternoon':
      return hour >= 14 && hour < 18;

    case 'evening_weekend':
      return isWeekend && hour >= 18 && hour < 23;

    case 'late_night':
      return hour >= 23 || hour < 6;

    default:
      return true; // 조건이 없으면 통과
  }
}

/**
 * ===== AI Generation Functions =====
 */

/**
 * 🆕 AI 기반 에피소드 자동 생성
 *
 * 캐릭터 정보와 호감도/애정도를 기반으로 대화 콘텐츠 생성
 */
async function handleGenerateEpisode(req, res) {
  // 🔍 디버깅: 받은 요청 페이로드 전체 출력
  console.log('🔍 [DEBUG] 받은 요청 body:', JSON.stringify(req.body, null, 2));

  // 🆕 프론트엔드 페이로드 구조에 맞춰 필드명 수정
  const {
    characterId,           // camelCase로 변경
    character_id,          // 하위 호환성 유지
    template,              // 새 필드명
    scenario_template_id,  // 하위 호환성 유지
    affection,             // generation_context 밖에 있음
    intimacy,              // generation_context 밖에 있음
    generation_context,    // 기존 구조도 지원
    trigger_conditions,
    title,
    description,
    ai_model,
    episode_type  // 🆕 'choice_based' or 'free_input_based'
  } = req.body;

  // 🆕 유연한 필드 매핑 (camelCase, snake_case 모두 지원)
  const finalCharacterId = characterId || character_id;
  const finalScenarioId = template || scenario_template_id;

  console.log('🔍 [DEBUG] 매핑된 값:', { finalCharacterId, finalScenarioId, affection, intimacy });

  // 필수 필드 검증 (유연하게)
  if (!finalCharacterId || !finalScenarioId) {
    console.error('❌ [DEBUG] 필수 필드 누락:', { finalCharacterId, finalScenarioId });
    return res.status(400).json({
      success: false,
      message: '필수 필드 누락: characterId (또는 character_id), template (또는 scenario_template_id)'
    });
  }

  // 🆕 호감도/애정도 값 추출 (유연하게)
  let base_affection, base_intimacy, scenario_length;

  if (generation_context) {
    // 기존 구조 (generation_context 객체 사용)
    base_affection = generation_context.base_affection;
    base_intimacy = generation_context.base_intimacy;
    scenario_length = generation_context.scenario_length;
    console.log('🔍 [DEBUG] generation_context에서 추출:', { base_affection, base_intimacy, scenario_length });
  } else {
    // 새 구조 (affection, intimacy 직접 사용)
    base_affection = affection;
    base_intimacy = intimacy;
    scenario_length = 'medium';  // 기본값
    console.log('🔍 [DEBUG] 직접 필드에서 추출:', { base_affection, base_intimacy });
  }

  const finalEpisodeType = episode_type || 'choice_based';  // 기본값: 선택지 전용

  if (base_affection === undefined || base_intimacy === undefined) {
    console.error('❌ [DEBUG] 호감도/애정도 누락:', { base_affection, base_intimacy });
    return res.status(400).json({
      success: false,
      message: '호감도(affection)와 애정도(intimacy)가 필요합니다'
    });
  }

  try {
    console.log(`🤖 AI 에피소드 생성 시작: ${finalCharacterId} - ${finalScenarioId}`);
    console.log(`📊 호감도: ${base_affection}, 애정도: ${base_intimacy}`);
    console.log(`🎯 에피소드 타입: ${finalEpisodeType}`);
    console.log(`🤖 AI 모델: ${ai_model || 'gpt-4o-mini'}`);

    // 캐릭터 정보 로드
    console.log(`🔍 [DEBUG] 캐릭터 정보 로드 시작: ${finalCharacterId}`);
    const characterInfo = await loadCharacterInfo(finalCharacterId);
    console.log(`✅ [DEBUG] 캐릭터 정보 로드 완료: ${characterInfo.name}`);

    // 🆕 시나리오 정보 로드
    console.log(`🔍 [DEBUG] 시나리오 정보 로드 시작: ${finalScenarioId}`);
    const scenarioInfo = await loadScenarioInfo(finalScenarioId);
    console.log(`✅ [DEBUG] 시나리오 로드 완료: ${scenarioInfo.title}`);

    // AI로 dialogue_flow 생성 (🆕 scenarioInfo 전달)
    console.log(`🔍 [DEBUG] AI dialogue_flow 생성 시작...`);
    const dialogueFlow = await generateDialogueFlowWithAI(
      characterInfo,
      scenarioInfo,  // 🆕 시나리오 ID가 아닌 상세 정보 전달
      base_affection,
      base_intimacy,
      scenario_length || 'medium',
      ai_model || 'gpt-4o-mini',
      finalEpisodeType  // 🆕 에피소드 타입 전달
    );
    console.log(`✅ [DEBUG] AI dialogue_flow 생성 완료: ${dialogueFlow.length}개 대화`);

    // 에피소드 객체 생성
    const episode_id = generateEpisodeId(finalCharacterId, finalScenarioId);

    const newEpisode = {
      id: episode_id,
      character_id: finalCharacterId,
      scenario_template_id: finalScenarioId,
      title: title || `${characterInfo.name}과의 ${finalScenarioId}`,
      description: description || `호감도 ${base_affection}, 애정도 ${base_intimacy} 기반 에피소드`,
      episode_type: finalEpisodeType,  // 🆕 에피소드 타입 저장

      // 트리거 조건
      trigger_conditions: trigger_conditions || {
        affection_min: Math.max(0, base_affection - 5),
        affection_max: Math.min(100, base_affection + 5),
        intimacy_min: Math.max(0, base_intimacy - 5),
        intimacy_max: Math.min(100, base_intimacy + 5),
        time_based: null,
        event_based: null,
        priority: 5
      },

      // 생성 컨텍스트
      generation_context: {
        base_affection,
        base_intimacy,
        tone_style: getToneStyle(base_affection),
        formality: getFormality(base_intimacy),
        scenario_length: scenario_length || 'medium',
        episode_type: finalEpisodeType  // 🆕 타입 정보 포함
      },

      status: 'pending',
      difficulty: getDifficulty(base_affection, base_intimacy),
      estimated_duration: getEstimatedDuration(scenario_length, finalEpisodeType),  // 🆕 타입별 다른 시간
      created_at: new Date().toISOString(),
      last_edited_at: null,

      // AI 생성된 대화 플로우
      dialogue_flow: dialogueFlow,

      // 통계
      statistics: {
        total_dialogues: dialogueFlow.length,
        choice_points: dialogueFlow.filter(d => d.type === 'multiple_choice').length,
        free_input_points: dialogueFlow.filter(d => d.type === 'free_input').length,
        max_affection_gain: calculateMaxAffectionGain(dialogueFlow),
        max_intimacy_gain: calculateMaxIntimacyGain(dialogueFlow),
        average_play_time: getEstimatedDuration(scenario_length)
      },

      play_stats: {
        played_count: 0,
        best_affection_gain: 0,
        best_intimacy_gain: 0,
        completion_rate: 0
      }
    };

    // 캐릭터 에피소드 파일에 저장
    console.log(`🔍 [DEBUG] 에피소드 저장 시작: ${finalCharacterId}`);
    const episodeData = await loadCharacterEpisodes(finalCharacterId);
    episodeData.episodes[episode_id] = newEpisode;
    episodeData.total_episodes = Object.keys(episodeData.episodes).length;
    episodeData.metadata.last_updated = new Date().toISOString();

    await saveCharacterEpisodes(finalCharacterId, episodeData);
    console.log(`✅ [DEBUG] 에피소드 저장 완료`);

    console.log(`✅ AI 에피소드 생성 완료: ${episode_id}`);
    console.log(`📝 대화 수: ${dialogueFlow.length}, 선택지: ${newEpisode.statistics.choice_points}, 주관식: ${newEpisode.statistics.free_input_points}`);

    return res.status(200).json({
      success: true,
      message: 'AI 에피소드가 생성되었습니다',
      episode: newEpisode
    });

  } catch (error) {
    console.error('❌ AI 에피소드 생성 실패:', error);
    return res.status(500).json({
      success: false,
      message: 'AI 에피소드 생성에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * 🆕 주관식 답변 AI 평가 (게임 플레이 중)
 *
 * 유저의 자유 입력 답변을 AI가 평가하여 호감도/애정도 변화 반환
 */
async function handleEvaluateUserInput(req, res) {
  const {
    episode_id,
    character_id,
    dialogue_sequence,
    user_input,
    current_affection,
    current_intimacy
  } = req.body;

  // 필수 필드 검증
  if (!episode_id || !character_id || !user_input || dialogue_sequence === undefined) {
    return res.status(400).json({
      success: false,
      message: '필수 필드 누락: episode_id, character_id, dialogue_sequence, user_input'
    });
  }

  try {
    console.log(`🤖 AI 답변 평가 시작: ${episode_id} - sequence ${dialogue_sequence}`);
    console.log(`💬 유저 입력: "${user_input}"`);

    // 에피소드 및 캐릭터 정보 로드
    const episodeData = await loadCharacterEpisodes(character_id);
    const episode = episodeData.episodes[episode_id];

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: '에피소드를 찾을 수 없습니다'
      });
    }

    const characterInfo = await loadCharacterInfo(character_id);

    // 해당 dialogue_sequence의 평가 기준 찾기
    const targetDialogue = episode.dialogue_flow.find(d => d.sequence === dialogue_sequence);

    if (!targetDialogue || targetDialogue.type !== 'free_input') {
      return res.status(400).json({
        success: false,
        message: '해당 sequence는 주관식 입력이 아닙니다'
      });
    }

    // AI 평가 실행
    const evaluation = await evaluateUserInputWithAI(
      user_input,
      characterInfo,
      current_affection || 0,
      current_intimacy || 0,
      targetDialogue.ai_evaluation.criteria,
      targetDialogue.context || episode.title
    );

    console.log(`✅ AI 평가 완료: ${evaluation.score} (호감도 ${evaluation.affection_change > 0 ? '+' : ''}${evaluation.affection_change}, 애정도 ${evaluation.intimacy_change > 0 ? '+' : ''}${evaluation.intimacy_change})`);

    return res.status(200).json({
      success: true,
      evaluation: {
        score: evaluation.score,
        affection_change: evaluation.affection_change,
        intimacy_change: evaluation.intimacy_change,
        feedback: evaluation.feedback,
        character_response: evaluation.character_response
      }
    });

  } catch (error) {
    console.error('❌ AI 답변 평가 실패:', error);
    return res.status(500).json({
      success: false,
      message: 'AI 답변 평가에 실패했습니다',
      error: error.message
    });
  }
}

/**
 * ===== AI Helper Functions =====
 */

/**
 * AI를 사용하여 dialogue_flow 생성 (OpenAI/Groq/Claude 지원)
 * 🆕 episode_type에 따라 다른 구조 생성
 */
async function generateDialogueFlowWithAI(characterInfo, scenarioInfo, baseAffection, baseIntimacy, scenarioLength, aiModel = 'gpt-4o-mini', episodeType = 'choice_based') {
  // AI 제공자 감지
  const provider = detectAIProvider(aiModel);

  // API 키 검증
  if (provider === 'openai' && !OPENAI_API_KEY) {
    throw new Error('🔑 OPENAI_API_KEY가 Vercel 환경변수에 설정되지 않았습니다.\n\n해결 방법:\n1. Vercel 대시보드 → Settings → Environment Variables\n2. OPENAI_API_KEY 추가 후 재배포');
  }
  if (provider === 'groq' && !GROQ_API_KEY) {
    throw new Error('🔑 GROQ_API_KEY가 Vercel 환경변수에 설정되지 않았습니다.\n\n해결 방법:\n1. Vercel 대시보드 → Settings → Environment Variables\n2. GROQ_API_KEY 추가 후 재배포');
  }
  if (provider === 'claude' && !ANTHROPIC_API_KEY) {
    throw new Error('🔑 ANTHROPIC_API_KEY가 Vercel 환경변수에 설정되지 않았습니다.\n\n해결 방법:\n1. Vercel 대시보드 → Settings → Environment Variables\n2. ANTHROPIC_API_KEY 추가 (값: sk-ant-로 시작)\n3. 재배포 (Deployments → Redeploy)');
  }

  const toneStyle = getToneStyle(baseAffection);
  const formality = getFormality(baseIntimacy);

  // 🆕 타입별 대화 개수 및 구조 결정
  let choiceCount, freeInputCount, totalDialogues;

  if (episodeType === 'choice_based') {
    // 선택지 전용: 최소 3번의 선택지
    choiceCount = scenarioLength === 'short' ? 3 : scenarioLength === 'long' ? 5 : 4;
    freeInputCount = 0;
    // (character_dialogue + narration + character_dialogue + multiple_choice + character_dialogue) * N + closing
    totalDialogues = choiceCount * 5 + 1;
  } else {
    // 주관식 전용: 2-3번의 주관식
    choiceCount = 0;
    freeInputCount = scenarioLength === 'short' ? 2 : scenarioLength === 'long' ? 3 : 3;
    // (character_dialogue + narration + character_dialogue + free_input + character_dialogue) * N + closing
    totalDialogues = freeInputCount * 5 + 1;
  }

  // 🆕 타입별 다른 프롬프트 생성
  let prompt;

  if (episodeType === 'choice_based') {
    // 선택지 전용 프롬프트
    prompt = `당신은 로맨스 채팅 게임의 전문 대화 작가입니다.

**📖 시나리오 정보:**
- 제목: ${scenarioInfo.title}
- 설명: ${scenarioInfo.description}
- 장르: ${scenarioInfo.genre} (섹시 레벨: ${scenarioInfo.sexy_level}/10)
- 분위기: ${scenarioInfo.mood}

**📚 시나리오 배경 스토리:**
${scenarioInfo.ai_generated_context}

**💁 캐릭터 정보:**
- 이름: ${characterInfo.name}
- 나이: ${characterInfo.age}세
- 직업: ${characterInfo.occupation || '대학생'}
- MBTI: ${characterInfo.mbti}
- 성격: ${characterInfo.personality || '친근하고 다정함'}
- 성격 특성: ${characterInfo.personality_traits?.join(', ') || '긍정적, 배려심 많음'}
- 취미: ${characterInfo.hobbies?.join(', ') || '독서, 음악 감상'}
- 말투: ${characterInfo.speech_style || '자연스럽고 친근함'}
- 좋아하는 주제: ${characterInfo.favorite_topics?.join(', ') || '일상, 취미'}
- 피하는 주제: ${characterInfo.disliked_topics?.join(', ') || '과거 연애, 정치'}

**💕 현재 관계 상태:**
- 호감도: ${baseAffection}/100 (톤: ${toneStyle})
- 애정도: ${baseIntimacy}/100 (호칭: ${formality})

**🎯 생성 요구사항 (선택지 전용 에피소드):**
메신저 대화 형식으로 **최소 ${choiceCount}번의 선택지**를 포함한 대화를 만들어주세요.

**필수 구조 (반복 ${choiceCount}번):**
1. **character_dialogue**: ${characterInfo.name}의 메시지 (먼저 캐릭터가 말을 건네기)
2. **narration**: 상황 설명 (간단하게)
3. **character_dialogue**: ${characterInfo.name}의 추가 대사 (감정과 행동 묘사)
4. **multiple_choice**: 유저가 답할 선택지 3개
   - 각 선택지마다 affection_change, intimacy_change 값 포함
   - 선택지는 다양한 감정 반응을 유도 (긍정/중립/부정)
5. **character_dialogue**: 유저 선택에 대한 ${characterInfo.name}의 반응 대사 (필수!)

**중요: 대화의 80%는 캐릭터(${characterInfo.name})의 대사여야 합니다!**
**마지막**: character_dialogue로 대화를 자연스럽게 마무리

**캐릭터 대사 작성 지침:**
- 매 선택지마다 캐릭터의 반응 대사를 **반드시** 포함
- 대사는 구체적이고 감정이 드러나게
- emotion(감정), narration(행동 묘사) 필드 활용
- 톤: ${toneStyle}, 호칭: ${formality}를 반영

**🚨 중요: 위의 "시나리오 배경 스토리"를 반드시 참고하여 대화를 생성하세요!**
- 시나리오의 상황과 분위기를 정확히 반영
- 캐릭터의 성격 특성과 MBTI를 대사에 녹여내기
- 시나리오의 감정선을 대화 흐름에 적용

**톤 가이드 (호감도 ${baseAffection}):**
- 0-20: 차갑고 무뚝뚝
- 21-40: 정중하고 예의바름
- 41-60: 친근하고 편안함
- 61-80: 따뜻하고 다정함
- 81-100: 애교 섞인 밝은 톤

**호칭 가이드 (애정도 ${baseIntimacy}):**
- 0-20: ~님, ~씨 (존칭)
- 21-40: 이름 호칭
- 41-60: 오빠, 언니 등
- 61-80: 애칭
- 81-100: 특별한 애칭

다음 JSON 형식으로 응답해주세요 (총 ${totalDialogues}개 정도):`;
  } else {
    // 주관식 전용 프롬프트
    prompt = `당신은 로맨스 채팅 게임의 전문 대화 작가입니다.

**📖 시나리오 정보:**
- 제목: ${scenarioInfo.title}
- 설명: ${scenarioInfo.description}
- 장르: ${scenarioInfo.genre} (섹시 레벨: ${scenarioInfo.sexy_level}/10)
- 분위기: ${scenarioInfo.mood}

**📚 시나리오 배경 스토리:**
${scenarioInfo.ai_generated_context}

**💁 캐릭터 정보:**
- 이름: ${characterInfo.name}
- 나이: ${characterInfo.age}세
- 직업: ${characterInfo.occupation || '대학생'}
- MBTI: ${characterInfo.mbti}
- 성격: ${characterInfo.personality || '친근하고 다정함'}
- 성격 특성: ${characterInfo.personality_traits?.join(', ') || '긍정적, 배려심 많음'}
- 취미: ${characterInfo.hobbies?.join(', ') || '독서, 음악 감상'}
- 말투: ${characterInfo.speech_style || '자연스럽고 친근함'}
- 좋아하는 주제: ${characterInfo.favorite_topics?.join(', ') || '일상, 취미'}
- 피하는 주제: ${characterInfo.disliked_topics?.join(', ') || '과거 연애, 정치'}

**💕 현재 관계 상태:**
- 호감도: ${baseAffection}/100 (톤: ${toneStyle})
- 애정도: ${baseIntimacy}/100 (호칭: ${formality})

**🎯 생성 요구사항 (주관식 전용 에피소드):**
메신저 대화 형식으로 **${freeInputCount}번의 주관식 입력**을 포함한 대화를 만들어주세요.

**필수 구조 (반복 ${freeInputCount}번):**
1. **character_dialogue**: ${characterInfo.name}의 메시지 (먼저 캐릭터가 말을 건네기)
2. **narration**: 상황 설명 (간단하게)
3. **character_dialogue**: ${characterInfo.name}의 추가 대사 (감정과 행동 묘사)
4. **free_input**: 유저에게 자유 입력을 요청하는 질문
   - question: 유저에게 자유롭게 답하도록 유도하는 질문
   - prompt_hint: 어떻게 답하면 좋을지 힌트
   - context: 상황 설명
   - ai_evaluation: 평가 기준 (criteria 배열 포함)
5. **character_dialogue**: 질문 후 기대하는 분위기나 추가 대사 (필수!)

**중요: 대화의 80%는 캐릭터(${characterInfo.name})의 대사여야 합니다!**
**마지막**: character_dialogue로 대화를 자연스럽게 마무리

**캐릭터 대사 작성 지침:**
- 매 주관식마다 캐릭터의 대사를 **반드시** 포함
- 대사는 구체적이고 감정이 드러나게
- emotion(감정), narration(행동 묘사) 필드 활용
- 톤: ${toneStyle}, 호칭: ${formality}를 반영

**🚨 중요: 위의 "시나리오 배경 스토리"를 반드시 참고하여 대화를 생성하세요!**
- 시나리오의 상황과 분위기를 정확히 반영
- 캐릭터의 성격 특성과 MBTI를 대사에 녹여내기
- 시나리오의 감정선을 대화 흐름에 적용

**톤 가이드 (호감도 ${baseAffection}):**
- 0-20: 차갑고 무뚝뚝
- 21-40: 정중하고 예의바름
- 41-60: 친근하고 편안함
- 61-80: 따뜻하고 다정함
- 81-100: 애교 섞인 밝은 톤

**호칭 가이드 (애정도 ${baseIntimacy}):**
- 0-20: ~님, ~씨 (존칭)
- 21-40: 이름 호칭
- 41-60: 오빠, 언니 등
- 61-80: 애칭
- 81-100: 특별한 애칭

다음 JSON 형식으로 응답해주세요 (총 ${totalDialogues}개 정도):`;
  }

  // 🆕 v2.3.0 개선: 더 상세한 JSON 예시와 요구사항 추가
  prompt += `

✅ **필수 1: 캐릭터 대사 길이 (매우 중요!)**
- 각 character_dialogue의 text는 최소 3문장, 평균 100-200자
- 짧은 대사는 절대 금지! 반드시 3문장 이상 작성
- 이모티콘을 자연스럽게 포함 (최소 1개 이상)

예시 (좋은 대사):
"안녕 ☀️ 어제 그 메시지… 다들 붙잡고 잔소리하더라고! 😅 친구들이 '너 완전히 정신 나갔어?'라면서 한참 놀렸어. 너무 부끄러워서 어제 밤 잠도 못 잤어 ㅠㅠ"

예시 (나쁜 대사 - 절대 금지!):
"안녕! 오늘 뭐해?" ❌
"어제 미안해." ❌

✅ **필수 2: narration 상세 묘사**
- 각 character_dialogue의 narration은 2-4문장, 80-150자
- 반드시 포함: 행동 묘사 + 심리 묘사 + 환경/분위기 묘사
- 구체적인 행동 표현 사용

예시 (좋은 narration):
"아침 햇살이 창문을 비추는 시간. 시은은 여전히 전날 보낸 메시지를 떠올리며 휴대폰을 켠다. 그녀의 손가락이 화면 위를 빠르게 움직이며, 볼이 살짝 붉어진다. 메시지를 보내고 나서도 계속 화면을 응시하며 답장을 기다린다."

예시 (나쁜 narration - 절대 금지!):
"시은이 메시지를 보낸다." ❌
"그녀가 휴대폰을 본다." ❌

✅ **필수 3: 구체적 행동/감정 표현**
narration에 다음과 같은 구체적 표현을 반드시 포함:

- 얼굴 표정: "볼을 살짝 붉히며", "미소를 머금고", "눈을 반짝이며"
- 손/몸 동작: "손가락으로 입을 가리고", "고개를 살짝 숙이며", "휴대폰을 꼭 쥐고"
- 심리 상태: "가슴이 두근거린다", "입술을 깨문다", "숨을 깊게 들이마신다"
- 환경/시간: "아침 햇살이 비추고", "방 안이 고요하다", "시계가 10시를 가리킨다"

✅ **필수 4: 시나리오 배경 완전 반영**
위의 "시나리오 배경 스토리" 600-900자의 모든 요소를 대화에 녹여내세요:
- 배경 스토리에 나온 시간대/장소를 정확히 사용
- 캐릭터의 과거 행동/발언을 대화에서 언급
- 스토리의 감정 흐름을 대화에 반영
- 스토리에 나온 구체적 사물/상황을 대화에 포함

\`\`\`json
[
  {
    "sequence": 1,
    "type": "character_dialogue",
    "speaker": "${characterInfo.name}",
    "text": "안녕 ☀️ 어제 그 메시지… 다들 붙잡고 잔소리하더라고! 😅 친구들이 '너 완전히 정신 나갔어?'라면서 한참 놀렸어. 너무 부끄러워서 어제 밤 잠도 못 잤어 ㅠㅠ",
    "emotion": "embarrassed",
    "narration": "아침 햇살이 창문을 비추는 시간. 시은은 여전히 전날 보낸 메시지를 떠올리며 휴대폰을 켠다. 그녀의 손가락이 화면 위를 빠르게 움직이며, 볼이 살짝 붉어진다."
  },
  {
    "sequence": 2,
    "type": "narration",
    "content": "메시지를 보내고 나서도 계속 화면을 응시하며 답장을 기다린다. 창밖의 햇살이 그녀의 얼굴을 비춘다."
  },
  {
    "sequence": 3,
    "type": "character_dialogue",
    "speaker": "${characterInfo.name}",
    "text": "에이, 진짜 실수였어! 그냥 장난이었는데 말이야 😳 그런 말 하지 마~ 부끄럽잖아ㅋㅋ",
    "emotion": "shy",
    "narration": "손가락으로 입을 가리고 고개를 살짝 숙인다. 메시지를 보낸 후 한숨을 내쉬며 침대에 몸을 던진다."
  },

  if (episodeType === 'choice_based') {
    prompt += `
  {
    "sequence": 4,
    "type": "multiple_choice",
    "question": "질문",
    "choices": [
      {
        "id": "choice_1",
        "text": "선택지 1",
        "affection_change": 2,
        "intimacy_change": 1,
        "consequence": "결과 설명"
      },
      {
        "id": "choice_2",
        "text": "선택지 2",
        "affection_change": 0,
        "intimacy_change": 0,
        "consequence": "결과 설명"
      },
      {
        "id": "choice_3",
        "text": "선택지 3",
        "affection_change": 3,
        "intimacy_change": 2,
        "consequence": "결과 설명"
      }
    ]
  },
  {
    "sequence": 5,
    "type": "character_dialogue",
    "speaker": "${characterInfo.name}",
    "text": "유저 선택에 대한 ${characterInfo.name}의 반응 대사 (자연스럽고 감정 풍부하게)",
    "emotion": "감정",
    "narration": "행동 묘사"
  },
  ...위 패턴을 정확히 ${choiceCount}번 반복...

**🚨 주의: speaker 필드는 반드시 "${characterInfo.name}"을 정확히 사용하세요!**`;
  } else {
    prompt += `
  {
    "sequence": 4,
    "type": "free_input",
    "question": "자유롭게 답변해보세요",
    "prompt_hint": "힌트",
    "context": "상황",
    "ai_evaluation": {
      "model": "gpt-4o-mini",
      "criteria": [
        "적절한 호칭 사용",
        "대화 맥락 일치",
        "예의 바른 표현"
      ],
      "scoring": {
        "excellent": { "affection": 5, "intimacy": 3 },
        "good": { "affection": 3, "intimacy": 2 },
        "normal": { "affection": 1, "intimacy": 1 },
        "poor": { "affection": -1, "intimacy": 0 },
        "inappropriate": { "affection": -3, "intimacy": -2 }
      }
    }
  },
  {
    "sequence": 5,
    "type": "character_dialogue",
    "speaker": "${characterInfo.name}",
    "text": "질문 후 ${characterInfo.name}의 추가 대사 (자연스럽고 감정 풍부하게)",
    "emotion": "감정",
    "narration": "행동 묘사"
  },
  ...위 패턴을 정확히 ${freeInputCount}번 반복...

**🚨 주의: speaker 필드는 반드시 "${characterInfo.name}"을 정확히 사용하세요!**`;
  }

  prompt += `
]
\`\`\`

**🚨🚨🚨 필수 준수 사항 🚨🚨🚨**
1. **speaker 필드**: 모든 character_dialogue의 speaker는 정확히 "${characterInfo.name}"이어야 합니다
2. **선택지 개수**: ${episodeType === 'choice_based' ? `정확히 ${choiceCount}번의 multiple_choice` : `정확히 ${freeInputCount}번의 free_input`}를 생성하세요
3. **대사 비중**: 전체 dialogue_flow의 60% 이상이 character_dialogue여야 합니다
4. **마지막**: 반드시 character_dialogue로 자연스럽게 마무리하세요

**절대 금지:**
- speaker를 "undefined"나 빈 문자열로 남기지 마세요
- 선택지/입력 개수를 임의로 줄이지 마세요
- narration만 가득한 대화를 생성하지 마세요`;

  try {
    let response, content;

    // 제공자별 API 호출
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: '당신은 로맨스 채팅 게임의 전문 대화 작가입니다. 항상 JSON 형식으로만 응답합니다.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.85,  // 🆕 v2.3.0: 창의성 증가 (0.7 → 0.85)
          max_tokens: 6000,  // 🆕 v2.3.0: 토큰 2배 증가 (3000 → 6000)
          presence_penalty: 0.6,  // 🆕 v2.3.0: 반복 방지
          frequency_penalty: 0.3  // 🆕 v2.3.0: 다양성 증가
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 400 || errorText.includes('content_policy') ||
            errorText.includes('content_filter') || errorText.includes('safety')) {
          throw new Error('content policy violation: AI 모델이 콘텐츠 정책 위반으로 생성을 거부했습니다');
        }
        throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      content = data.choices[0].message.content;

    } else if (provider === 'groq') {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: '당신은 로맨스 채팅 게임의 전문 대화 작가입니다. 항상 JSON 형식으로만 응답합니다.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.85,  // 🆕 v2.3.0: 창의성 증가
          max_tokens: 6000,  // 🆕 v2.3.0: 토큰 2배 증가
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API 오류: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      content = data.choices[0].message.content;

    } else if (provider === 'claude') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: aiModel,
          max_tokens: 6000,  // 🆕 v2.3.0: 토큰 2배 증가
          temperature: 0.85,  // 🆕 v2.3.0: 창의성 증가 (Claude는 temperature 지원)
          messages: [{
            role: 'user',
            content: `당신은 로맨스 채팅 게임의 전문 대화 작가입니다. 항상 JSON 형식으로만 응답합니다.\n\n${prompt}`
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API 오류: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      content = data.content[0].text;
    }

    // JSON 추출 (코드 블록 제거)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

    let dialogueFlow = JSON.parse(jsonText);

    // 🆕 후처리: speaker 검증 및 교체
    dialogueFlow = dialogueFlow.map(item => {
      if (item.type === 'character_dialogue') {
        // speaker가 없거나 "undefined"이면 캐릭터 이름으로 교체
        if (!item.speaker || item.speaker === 'undefined' || item.speaker.trim() === '') {
          item.speaker = characterInfo.name;
          console.log(`⚠️ speaker 수정: sequence ${item.sequence} → ${characterInfo.name}`);
        }
      }
      return item;
    });

    // 🆕 검증: 최소 선택지/입력 개수 확인
    const choicePoints = dialogueFlow.filter(d => d.type === 'multiple_choice').length;
    const freeInputPoints = dialogueFlow.filter(d => d.type === 'free_input').length;

    if (episodeType === 'choice_based' && choicePoints < choiceCount) {
      console.warn(`⚠️ 선택지 부족: ${choicePoints}개 (요청: ${choiceCount}개)`);
    }

    if (episodeType === 'free_input_based' && freeInputPoints < freeInputCount) {
      console.warn(`⚠️ 주관식 부족: ${freeInputPoints}개 (요청: ${freeInputCount}개)`);
    }

    console.log(`✅ ${provider.toUpperCase()} dialogue_flow 생성 완료: ${dialogueFlow.length}개 대화`);
    console.log(`📊 캐릭터 대사: ${dialogueFlow.filter(d => d.type === 'character_dialogue').length}개`);
    console.log(`📊 선택지: ${choicePoints}개, 주관식: ${freeInputPoints}개`);

    return dialogueFlow;

  } catch (error) {
    console.error(`❌ ${provider.toUpperCase()} API 호출 실패:`, error);
    throw error;
  }
}

/**
 * AI 모델명으로 제공자 감지
 */
function detectAIProvider(modelName) {
  if (!modelName) return 'openai';

  const model = modelName.toLowerCase();

  // Groq (Llama 모델)
  if (model.includes('llama') || model.includes('mixtral') || model.includes('gemma')) {
    return 'groq';
  }

  // Claude (Anthropic)
  if (model.includes('claude') || model.includes('sonnet') || model.includes('opus') || model.includes('haiku')) {
    return 'claude';
  }

  // 기본값: OpenAI
  return 'openai';
}

/**
 * OpenAI를 사용하여 유저 입력 평가
 */
async function evaluateUserInputWithAI(userInput, characterInfo, currentAffection, currentIntimacy, criteria, context) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다');
  }

  const prompt = `당신은 로맨스 채팅 게임의 답변 평가자입니다.

**캐릭터 정보:**
- 이름: ${characterInfo.name}
- MBTI: ${characterInfo.mbti}
- 성격: ${characterInfo.personality || '친근함'}

**현재 관계:**
- 호감도: ${currentAffection}/100
- 애정도: ${currentIntimacy}/100

**상황:** ${context}

**유저 답변:** "${userInput}"

**평가 기준:**
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

다음 JSON 형식으로 평가 결과를 응답해주세요:
\`\`\`json
{
  "score": "excellent|good|normal|poor|inappropriate",
  "affection_change": 5,
  "intimacy_change": 3,
  "feedback": "평가 피드백",
  "character_response": "캐릭터의 답변"
}
\`\`\`

**점수 기준:**
- excellent: 완벽한 답변 (호감도 +5, 애정도 +3)
- good: 좋은 답변 (호감도 +3, 애정도 +2)
- normal: 평범한 답변 (호감도 +1, 애정도 +1)
- poor: 부적절한 답변 (호감도 -1, 애정도 0)
- inappropriate: 매우 부적절 (호감도 -3, 애정도 -2)`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '당신은 로맨스 채팅 게임의 답변 평가 전문가입니다. 항상 JSON 형식으로만 응답합니다.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // JSON 추출
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

    const evaluation = JSON.parse(jsonText);

    console.log(`✅ OpenAI 평가 완료: ${evaluation.score}`);

    return evaluation;

  } catch (error) {
    console.error('❌ OpenAI 평가 API 호출 실패:', error);
    throw error;
  }
}

/**
 * 시나리오 정보 로드 (scenario-database.json)
 */
async function loadScenarioInfo(scenario_id) {
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/scenarios/scenario-database.json?ref=${GITHUB_BRANCH}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`시나리오 정보 로드 실패: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const scenarioData = JSON.parse(content);

    const scenario = scenarioData.scenarios[scenario_id];

    if (!scenario) {
      throw new Error(`시나리오를 찾을 수 없습니다: ${scenario_id}`);
    }

    return {
      id: scenario.id || scenario.scenario_id,
      title: scenario.title || '제목 없음',
      description: scenario.description || '',
      ai_generated_context: scenario.ai_generated_context || '',
      mood: scenario.mood || '편안한',
      genre: scenario.metadata?.genre || 'flutter',
      sexy_level: scenario.metadata?.sexy_level || 5,
      tags: scenario.tags || []
    };

  } catch (error) {
    console.error(`❌ 시나리오 정보 로드 실패 (${scenario_id}):`, error);
    throw error;
  }
}

/**
 * 캐릭터 정보 로드 (characters.json) - 🆕 더 상세한 정보 포함
 */
async function loadCharacterInfo(character_id) {
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/characters.json?ref=${GITHUB_BRANCH}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`캐릭터 정보 로드 실패: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const charactersData = JSON.parse(content);

    // characters 배열 또는 객체 처리
    const characters = charactersData.characters || charactersData;
    const characterList = Array.isArray(characters) ? characters : Object.values(characters);

    const character = characterList.find(c => c.id === character_id || c.character_id === character_id);

    if (!character) {
      throw new Error(`캐릭터를 찾을 수 없습니다: ${character_id}`);
    }

    // 🆕 더 상세한 캐릭터 정보 추출
    return {
      id: character.id || character.character_id,
      name: character.name || character.character_name,
      mbti: character.mbti || 'INFP',
      age: character.age || 25,
      occupation: character.occupation || '',
      personality: character.personality_summary || character.personality || '',
      personality_traits: character.personality_traits || [],
      hobbies: character.hobbies || [],
      speech_style: character.speech_style || '',
      favorite_topics: character.favorite_topics || [],
      disliked_topics: character.disliked_topics || [],
      // AI 소개 (있으면 포함)
      ai_introduction: character.ai_introduction || ''
    };

  } catch (error) {
    console.error(`❌ 캐릭터 정보 로드 실패 (${character_id}):`, error);
    throw error;
  }
}

/**
 * 호감도 기반 톤 스타일 결정
 */
function getToneStyle(affection) {
  if (affection <= 20) return 'cold';
  if (affection <= 40) return 'polite';
  if (affection <= 60) return 'friendly';
  if (affection <= 80) return 'warm';
  return 'intimate';
}

/**
 * 애정도 기반 격식 수준 결정
 */
function getFormality(intimacy) {
  if (intimacy <= 20) return 'formal';
  if (intimacy <= 40) return 'polite';
  if (intimacy <= 60) return 'casual';
  return 'intimate';
}

/**
 * 난이도 결정 (호감도 + 애정도 합)
 */
function getDifficulty(affection, intimacy) {
  const total = affection + intimacy;
  if (total <= 40) return 'Easy';
  if (total <= 80) return 'Medium';
  if (total <= 120) return 'Hard';
  return 'Expert';
}

/**
 * 예상 플레이 시간 (🆕 타입별 다른 시간)
 */
function getEstimatedDuration(scenarioLength, episodeType = 'choice_based') {
  if (episodeType === 'choice_based') {
    // 선택지 전용: 더 많은 선택지와 대사
    switch (scenarioLength) {
      case 'short': return '8-12분';
      case 'long': return '18-25분';
      default: return '12-18분';
    }
  } else {
    // 주관식 전용: 생각하는 시간 필요
    switch (scenarioLength) {
      case 'short': return '10-15분';
      case 'long': return '20-30분';
      default: return '15-20분';
    }
  }
}

/**
 * 최대 호감도 획득 계산
 */
function calculateMaxAffectionGain(dialogueFlow) {
  let max = 0;
  for (const dialogue of dialogueFlow) {
    if (dialogue.type === 'multiple_choice') {
      const maxChoice = Math.max(...dialogue.choices.map(c => c.affection_change || 0));
      max += maxChoice;
    } else if (dialogue.type === 'free_input') {
      max += dialogue.ai_evaluation?.scoring?.excellent?.affection || 5;
    }
  }
  return max;
}

/**
 * 최대 애정도 획득 계산
 */
function calculateMaxIntimacyGain(dialogueFlow) {
  let max = 0;
  for (const dialogue of dialogueFlow) {
    if (dialogue.type === 'multiple_choice') {
      const maxChoice = Math.max(...dialogue.choices.map(c => c.intimacy_change || 0));
      max += maxChoice;
    } else if (dialogue.type === 'free_input') {
      max += dialogue.ai_evaluation?.scoring?.excellent?.intimacy || 3;
    }
  }
  return max;
}
