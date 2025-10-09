/**
 * Episode Manager API v2.0 - Character-Based Architecture
 *
 * 캐릭터 중심 에피소드 관리 시스템
 * - 각 캐릭터의 에피소드 풀 관리
 * - 트리거 조건 체크 및 상태 관리
 * - 호감도 기반 에피소드 활성화
 *
 * @version 2.0.0
 * @created 2025-10-09
 */

// GitHub API 설정
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = 'EnmanyProject';
const GITHUB_REPO = 'chatgame';
const GITHUB_BRANCH = 'main';

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
    const { action, character_id, episode_id } = req.method === 'GET' ? req.query : req.body;

    console.log(`📥 Episode Manager API v2.0 - Action: ${action}`);

    switch (action) {
      // 캐릭터의 모든 에피소드 조회
      case 'list':
        return await handleList(req, res, character_id);

      // 새 에피소드 생성
      case 'create':
        return await handleCreate(req, res);

      // 에피소드 수정
      case 'update':
        return await handleUpdate(req, res);

      // 에피소드 삭제
      case 'delete':
        return await handleDelete(req, res, episode_id);

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
  if (!character_id) {
    return res.status(400).json({
      success: false,
      message: 'character_id가 필요합니다'
    });
  }

  try {
    const episodeData = await loadCharacterEpisodes(character_id);

    return res.status(200).json({
      success: true,
      character_id: episodeData.character_id,
      character_name: episodeData.character_name,
      total_episodes: episodeData.total_episodes,
      episodes: episodeData.episodes
    });

  } catch (error) {
    console.error(`❌ 에피소드 목록 로드 실패 (${character_id}):`, error);
    return res.status(500).json({
      success: false,
      message: '에피소드 목록을 불러올 수 없습니다',
      error: error.message
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
async function handleDelete(req, res, episode_id) {
  const { character_id } = req.method === 'DELETE' ? req.query : req.body;

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

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');

    return JSON.parse(content);

  } catch (error) {
    console.error(`❌ 캐릭터 에피소드 로드 실패 (${character_id}):`, error);
    throw error;
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
