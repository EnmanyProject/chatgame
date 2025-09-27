// AI 캐릭터 생성 API - 새로운 안전 버전
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  console.log('🎭 새로운 캐릭터 생성 AI 요청:', {
    method: req.method,
    action,
    timestamp: new Date().toISOString()
  });

  try {
    // 캐릭터 리스트 조회
    if (action === 'list_characters') {
      console.log('📋 캐릭터 리스트 조회...');

      return res.json({
        success: true,
        characters: {},
        metadata: {
          version: "2.0.0",
          total_characters: 0,
          source: "new_api_version",
          timestamp: new Date().toISOString()
        }
      });
    }

    // 모든 캐릭터 데이터 초기화
    if (action === 'reset_all_characters') {
      console.log('🗑️ 캐릭터 데이터 초기화...');

      return res.json({
        success: true,
        message: '모든 캐릭터 데이터가 초기화되었습니다 (테스트 모드)'
      });
    }

    // 캐릭터 저장
    if (action === 'save_character') {
      const { character } = req.body;

      if (!character || !character.name || !character.mbti) {
        return res.status(400).json({
          success: false,
          message: 'Character name and MBTI are required'
        });
      }

      console.log('💾 캐릭터 저장:', character.name);

      return res.json({
        success: true,
        character: {
          ...character,
          id: `${character.name.toLowerCase()}_${character.mbti.toLowerCase()}_${Date.now()}`
        },
        message: 'Character saved successfully (test mode)'
      });
    }

    // AI 캐릭터 생성 - 부분 입력으로 완성
    if (action === 'generate_character') {
      const inputData = req.body;

      console.log('🤖 AI 캐릭터 생성 시작:', inputData);

      // 부분 입력된 데이터를 AI가 완성
      const character = completeCharacterFromInput(inputData);

      return res.json({
        success: true,
        character: character,
        message: '캐릭터가 성공적으로 완성되었습니다!'
      });
    }

    // 캐릭터 삭제
    if (action === 'delete_character') {
      const { character_id } = req.body;

      if (!character_id) {
        return res.status(400).json({
          success: false,
          message: 'Character ID is required'
        });
      }

      console.log('🗑️ 캐릭터 삭제:', character_id);

      return res.json({
        success: true,
        message: 'Character deleted successfully (test mode)'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown action. Available: list_characters, save_character, delete_character, reset_all_characters, generate_character'
    });

  } catch (error) {
    console.error('❌ 새로운 캐릭터 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      action: action,
      timestamp: new Date().toISOString()
    });
  }
};

// 부분 입력으로 캐릭터 완성 함수
function completeCharacterFromInput(inputData) {
  console.log('📝 입력된 데이터:', inputData);

  // 기본값 설정
  const name = inputData.name || inputData.answers?.name || '미지의 소녀';
  const mbti = inputData.mbti || inputData.answers?.mbti || 'INFP';
  const age = inputData.age || inputData.answers?.age || '22';

  console.log('✅ 추출된 핵심 정보:', { name, mbti, age });

  // MBTI 기반 템플릿으로 나머지 완성
  const template = getTemplateByMBTI(mbti);

  return {
    id: `${name.toLowerCase().replace(/\s+/g, '_')}_${mbti.toLowerCase()}_${Date.now()}`,
    name: name,
    age: parseInt(age) || 22,
    gender: 'female',
    mbti: mbti,

    // 입력된 것이 있으면 사용, 없으면 MBTI 템플릿 기본값
    personality_traits: inputData.personality_traits || template.personalities.slice(0, 3),
    major: inputData.major || '대학생',
    relationship: inputData.relationship || '친구',
    speech_style: inputData.speech_style || `${template.speech_styles[0]} 말투`,
    speech_habit: inputData.speech_habit || '이모티콘을 자주 사용함',

    appearance: {
      hair: inputData.hair || '긴 머리',
      eyes: inputData.eyes || '큰 눈',
      style: inputData.style || '캐주얼한 스타일'
    },

    background: {
      family: inputData.family || '평범한 가정',
      hometown: inputData.hometown || '서울',
      occupation: '대학생'
    },

    personality: {
      hobbies: inputData.hobbies || template.hobbies.slice(0, 3),
      values: inputData.values || `${mbti} 유형의 가치관`,
      fears: '거절당하는 것'
    },

    story_context: {
      main_situation: '대학교에서 처음 만나는 상황'
    },

    created_date: new Date().toISOString().split('T')[0],
    generation_method: 'ai_completion'
  };
}

// MBTI별 템플릿 가져오기 함수
function getTemplateByMBTI(mbti) {
  const templates = {
    'INFP': {
      personalities: ['감성적', '이상주의적', '창의적', '내향적', '따뜻한'],
      hobbies: ['글쓰기', '그림그리기', '음악감상', '독서', '산책'],
      speech_styles: ['부드러운', '감정적인', '은유적인']
    },
    'ENFP': {
      personalities: ['외향적', '열정적', '창의적', '사교적', '활발한'],
      hobbies: ['여행', '파티', '새로운 경험', '사람들과 만나기', '음악'],
      speech_styles: ['밝은', '에너지 넘치는', '친근한']
    },
    'INTJ': {
      personalities: ['논리적', '독립적', '완벽주의', '계획적', '분석적'],
      hobbies: ['독서', '연구', '계획세우기', '전략게임', '학습'],
      speech_styles: ['간결한', '정확한', '논리적인']
    },
    'ESFJ': {
      personalities: ['사교적', '배려심많은', '책임감있는', '따뜻한', '협력적'],
      hobbies: ['요리', '친구만나기', '봉사활동', '쇼핑', '카페가기'],
      speech_styles: ['따뜻한', '배려깊은', '친근한']
    },
    'ISTP': {
      personalities: ['실용적', '독립적', '분석적', '조용한', '현실적'],
      hobbies: ['운동', '수리', '게임', '영화감상', '혼자만의 시간'],
      speech_styles: ['간결한', '직설적인', '실용적인']
    },
    'INFJ': {
      personalities: ['직관적', '이상주의적', '신중한', '완벽주의', '통찰력있는'],
      hobbies: ['명상', '독서', '글쓰기', '상담', '예술감상'],
      speech_styles: ['신중한', '깊이있는', '통찰력있는']
    }
  };

  return templates[mbti] || templates['INFP']; // 기본값
}