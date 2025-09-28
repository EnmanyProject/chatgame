// 에피소드 관리 API - GitHub API 전용 버전

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔧 Episode Manager API 호출:', {
      method: req.method,
      action: req.query.action,
      scenario_id: req.query.scenario_id
    });

    const action = req.query.action;

    // API 테스트
    if (action === 'test') {
      return res.json({
        success: true,
        message: 'Episode Manager API 정상 작동',
        timestamp: new Date().toISOString()
      });
    }

    // 에피소드 목록 조회
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
          episodes: scenarioEpisodes,
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

    // 알 수 없는 액션
    return res.status(400).json({
      success: false,
      message: 'Unknown action: ' + action
    });

  } catch (error) {
    console.error('❌ Episode Manager API 치명적 오류:', error);
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

// 새 에피소드 생성 및 저장 (GitHub API 활용)
async function createEpisode(data) {
  try {
    // 실제 AI 생성된 대화가 있다면 사용, 없으면 기본값
    const dialogue = data.ai_generated_dialogue || data.generated_dialogue || {
      character_message: "대화 내용이 여기에 표시됩니다.",
      context: "상황 설명이 여기에 표시됩니다.",
      choices: [
        { text: "선택지 1", affection_impact: 1 },
        { text: "선택지 2", affection_impact: 0 },
        { text: "선택지 3", affection_impact: -1 }
      ]
    };

    const newEpisode = {
      id: `episode_${data.scenario_id}_${Date.now()}`,
      scenario_id: data.scenario_id,
      episode_number: data.episode_number || 1,
      title: data.title || `에피소드 ${data.episode_number || 1}번`,
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