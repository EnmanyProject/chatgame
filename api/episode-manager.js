// 에피소드 관리 API - 간소화 버전
const fs = require('fs');
const path = require('path');

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

// 에피소드 데이터베이스 로드 (안전한 버전)
async function loadEpisodeDatabase() {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'episodes', 'episode-database.json');
    console.log('📂 DB 경로:', dbPath);

    // 파일 존재 확인
    if (!fs.existsSync(dbPath)) {
      console.log('📝 에피소드 DB 파일 없음 - 기본 구조 반환');
      return {
        metadata: {
          version: "1.0.0",
          total_episodes: 0
        },
        episodes: {}
      };
    }

    // 파일 읽기
    const data = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(data);

    console.log('✅ 에피소드 DB 로드 성공');
    return parsed;

  } catch (error) {
    console.error('❌ DB 로드 오류:', error.message);
    // 에러 시 기본 구조 반환
    return {
      metadata: { error: error.message },
      episodes: {}
    };
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

// 에피소드 데이터베이스 저장 함수
async function saveEpisodeDatabase(database) {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'episodes', 'episode-database.json');
    const dbDir = path.dirname(dbPath);

    // 디렉토리 생성 (없으면)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('📂 에피소드 디렉토리 생성:', dbDir);
    }

    // JSON 파일 저장
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
    console.log('💾 에피소드 데이터베이스 저장 완료:', dbPath);

  } catch (error) {
    console.error('❌ 에피소드 데이터베이스 저장 실패:', error);
    throw error;
  }
}