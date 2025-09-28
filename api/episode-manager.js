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

// 새 에피소드 생성 (기본 버전)
async function createEpisode(data) {
  try {
    const newEpisode = {
      id: `episode_${data.scenario_id}_${Date.now()}`,
      scenario_id: data.scenario_id,
      episode_number: data.episode_number || 1,
      title: data.title || '새 에피소드',
      character_id: data.character_id,
      character_name: data.character_name,
      difficulty: data.difficulty || 'easy',
      user_input_prompt: data.user_input_prompt,
      created_at: new Date().toISOString(),
      dialogue: {
        message: "대화 내용이 여기에 표시됩니다.",
        narration: "상황 설명이 여기에 표시됩니다.",
        choices: [
          { text: "선택지 1", affection_impact: 1 },
          { text: "선택지 2", affection_impact: 0 },
          { text: "선택지 3", affection_impact: -1 }
        ]
      }
    };

    console.log('✅ 에피소드 생성 완료:', newEpisode.id);
    return newEpisode;

  } catch (error) {
    console.error('❌ 에피소드 생성 오류:', error.message);
    throw error;
  }
}