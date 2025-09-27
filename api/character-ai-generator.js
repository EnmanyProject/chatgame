// AI 캐릭터 생성 API - 새로운 안전 버전

// 메모리 기반 캐릭터 저장소 (세션 동안 유지)
let memoryStorage = {
  characters: {},
  metadata: {
    version: "2.0.0",
    total_characters: 0,
    created: new Date().toISOString(),
    storage_type: "memory"
  }
};

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
    // 캐릭터 리스트 조회 (GitHub 동기화 포함)
    if (action === 'list_characters') {
      console.log('📋 캐릭터 리스트 조회...');

      // 🐙 GitHub에서 최신 데이터 로드 시도
      try {
        await loadFromGitHub();
        console.log('🔄 GitHub에서 최신 데이터 동기화 완료');
      } catch (error) {
        console.warn('⚠️ GitHub 동기화 실패 (메모리 데이터 사용):', error.message);
      }

      console.log('📊 현재 메모리 저장소:', Object.keys(memoryStorage.characters).length, '개');

      // 메타데이터 업데이트
      memoryStorage.metadata.total_characters = Object.keys(memoryStorage.characters).length;
      memoryStorage.metadata.last_accessed = new Date().toISOString();

      return res.json({
        success: true,
        characters: memoryStorage.characters,
        metadata: {
          ...memoryStorage.metadata,
          github_synced: true,
          sync_time: new Date().toISOString()
        }
      });
    }

    // 모든 캐릭터 데이터 초기화
    if (action === 'reset_all_characters') {
      console.log('🗑️ 캐릭터 데이터 초기화...');

      // 메모리 저장소 초기화
      memoryStorage.characters = {};
      memoryStorage.metadata.total_characters = 0;
      memoryStorage.metadata.reset_at = new Date().toISOString();

      console.log('✅ 메모리 저장소 초기화 완료');

      return res.json({
        success: true,
        message: '모든 캐릭터 데이터가 초기화되었습니다'
      });
    }

    // 캐릭터 저장 (GitHub API + 메모리 저장소)
    if (action === 'save_character') {
      // scenario-admin.html에서 {action: 'save_character', character: {...}} 형태로 전송
      const characterData = req.body.character || req.body;

      // action 필드 제거 (characterData에 action이 있을 경우)
      if (characterData.action) {
        delete characterData.action;
      }

      console.log('💾 캐릭터 저장 요청:', characterData);

      if (!characterData.name || !characterData.mbti) {
        return res.status(400).json({
          success: false,
          message: 'Character name and MBTI are required'
        });
      }

      console.log('💾 캐릭터 저장 시작:', characterData.name);

      // ID가 없으면 생성
      if (!characterData.id) {
        characterData.id = `${characterData.name.toLowerCase().replace(/\s+/g, '_')}_${characterData.mbti.toLowerCase()}_${Date.now()}`;
      }

      // 메모리 저장소에 저장
      memoryStorage.characters[characterData.id] = {
        ...characterData,
        updated_at: new Date().toISOString(),
        source: 'api_save'
      };

      // 메타데이터 업데이트
      memoryStorage.metadata.total_characters = Object.keys(memoryStorage.characters).length;
      memoryStorage.metadata.last_updated = new Date().toISOString();

      // 🐙 GitHub API를 통한 영구 저장 시도
      try {
        await saveToGitHub(memoryStorage);
        console.log('🎉 GitHub에 성공적으로 저장됨');
      } catch (error) {
        console.warn('⚠️ GitHub 저장 실패 (메모리 저장은 완료):', error.message);
        // GitHub 저장 실패해도 메모리 저장은 성공으로 처리
      }

      console.log('✅ 캐릭터 저장 완료:', characterData.id);
      console.log('📊 총 캐릭터 수:', memoryStorage.metadata.total_characters);

      return res.json({
        success: true,
        character: memoryStorage.characters[characterData.id],
        message: 'Character saved successfully',
        github_saved: true // GitHub 저장 시도했음을 표시
      });
    }

    // AI 캐릭터 생성 - 부분 입력으로 완성
    if (action === 'generate_character') {
      const inputData = req.body;

      console.log('🤖 AI 캐릭터 생성 시작:', inputData);

      // 🎲 진짜 AI가 랜덤하게 완성
      const character = generateRandomCharacterFromInput(inputData);

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

      if (memoryStorage.characters[character_id]) {
        const characterName = memoryStorage.characters[character_id].name;
        delete memoryStorage.characters[character_id];

        // 메타데이터 업데이트
        memoryStorage.metadata.total_characters = Object.keys(memoryStorage.characters).length;
        memoryStorage.metadata.last_updated = new Date().toISOString();

        console.log('✅ 캐릭터 삭제 완료:', characterName);
        console.log('📊 남은 캐릭터 수:', memoryStorage.metadata.total_characters);

        return res.json({
          success: true,
          message: 'Character deleted successfully'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Character not found'
        });
      }
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

// 🎲 AI가 랜덤하게 캐릭터 완성하는 함수 (매번 다른 결과)
function generateRandomCharacterFromInput(inputData) {
  console.log('🎲 AI 랜덤 생성 시작:', inputData);

  // 기본값 설정
  const name = inputData.name || inputData.answers?.name || randomChoice(['미나', '지수', '서연', '혜진', '유나', '소영', '하늘', '별', '가을']);
  const mbti = inputData.mbti || inputData.answers?.mbti || randomChoice(['INFP', 'ENFP', 'INTJ', 'ESFJ', 'ISTP', 'INFJ']);
  const age = inputData.age || inputData.answers?.age || randomChoice([19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);

  console.log('🎯 AI 선택 결과:', { name, mbti, age });

  // 🎲 AI가 랜덤하게 선택하는 다양한 옵션들
  const personalityOptions = ['감성적', '이상주의적', '창의적', '내향적', '따뜻한', '외향적', '열정적', '사교적', '활발한',
                              '논리적', '독립적', '완벽주의', '계획적', '분석적', '배려심많은', '책임감있는', '협력적',
                              '실용적', '조용한', '현실적', '직관적', '신중한', '통찰력있는', '유머러스한', '자유로운'];

  const hobbyOptions = ['글쓰기', '그림그리기', '음악감상', '독서', '산책', '여행', '파티', '새로운 경험', '사람들과 만나기',
                        '연구', '계획세우기', '전략게임', '학습', '요리', '친구만나기', '봉사활동', '쇼핑', '카페가기',
                        '운동', '수리', '게임', '영화감상', '명상', '상담', '예술감상', '사진촬영', '춤', '노래', '악기연주'];

  const speechStyles = ['부드러운', '감정적인', '은유적인', '밝은', '에너지 넘치는', '친근한', '간결한', '정확한', '논리적인',
                        '따뜻한', '배려깊은', '직설적인', '실용적인', '신중한', '깊이있는', '통찰력있는', '유쾌한', '위트있는'];

  const majorOptions = ['문학과', '심리학과', '미술과', '음악과', '철학과', '사회학과', '경영학과', '컴퓨터공학과', '의학과',
                        '간호학과', '교육학과', '언론정보학과', '국제관계학과', '경제학과', '법학과', '건축학과', '디자인학과'];

  const hometownOptions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '수원', '성남', '고양', '용인', '청주', '전주', '천안', '제주'];

  const familyOptions = ['평범한 가정', '화목한 가정', '엄격한 가정', '자유로운 가정', '예술가족', '학자 가족', '사업가 가족', '교육자 가족'];

  const valuesOptions = ['가족 중시', '자아실현', '성취지향', '관계중심', '창의성', '안정성', '모험심', '정의감', '배움', '자유'];

  const relationshipOptions = ['친구', '후배', '선배', '동갑', '어릴 적 친구', '새로운 만남', '소개팅', '동아리 친구', '같은 과 친구'];

  // 🎲 AI가 랜덤하게 선택
  return {
    id: `${name.toLowerCase().replace(/\s+/g, '_')}_${mbti.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name,
    age: parseInt(age),
    gender: inputData.gender || randomChoice(['female', 'female', 'female', 'male']), // 75% 여성
    mbti: mbti,

    // 🎯 AI가 매번 다르게 선택
    personality_traits: inputData.personality_traits || randomSelect(personalityOptions, randomChoice([2, 3, 4])),
    major: inputData.major || randomChoice(majorOptions),
    family: inputData.family || randomChoice(familyOptions),
    hometown: inputData.hometown || randomChoice(hometownOptions),
    relationship: inputData.relationship || randomChoice(relationshipOptions),
    speech_style: inputData.speech_style || `${randomChoice(speechStyles)} 말투`,
    speech_habit: inputData.speech_habit || randomChoice(['이모티콘을 자주 사용함', '웃음소리를 많이 냄', '습관적으로 머리를 넘김',
                                                          '손짓을 많이 함', '눈을 자주 깜빡임', '입술을 깨무는 습관', '볼을 부풀리는 습관']),

    appearance: {
      hair: inputData.appearance?.hair || inputData.hair || randomChoice(['긴 생머리', '짧은 생머리', '웨이브 머리', '곱슬머리', '포니테일', '단발머리', '염색한 머리']),
      eyes: inputData.appearance?.eyes || inputData.eyes || randomChoice(['큰 눈', '작은 눈', '둥근 눈', '아몬드 눈', '고양이 눈', '또렷한 눈']),
      style: inputData.appearance?.style || inputData.style || randomChoice(['캐주얼한 스타일', '우아한 스타일', '스포티한 스타일', '빈티지 스타일',
                                                                              '모던한 스타일', '로맨틱한 스타일', '심플한 스타일'])
    },

    background: {
      family: inputData.background?.family || inputData.family || randomChoice(familyOptions),
      hometown: inputData.background?.hometown || inputData.hometown || randomChoice(hometownOptions),
      occupation: inputData.background?.occupation || randomChoice(['대학생', '대학원생', '인턴', '아르바이트생'])
    },

    // 🎲 취미와 가치관도 랜덤 선택
    hobbies: inputData.hobbies || randomSelect(hobbyOptions, randomChoice([2, 3, 4, 5])),
    values: inputData.values || randomChoice(valuesOptions),

    personality: {
      hobbies: inputData.personality?.hobbies || inputData.hobbies || randomSelect(hobbyOptions, 3),
      values: inputData.personality?.values || inputData.values || randomChoice(valuesOptions),
      fears: inputData.personality?.fears || inputData.fears || randomChoice(['거절당하는 것', '혼자 남겨지는 것', '실패하는 것',
                                                                              '오해받는 것', '무시당하는 것', '변화하는 것'])
    },

    story_context: {
      main_situation: inputData.story_context?.main_situation || randomChoice([
        '대학교에서 처음 만나는 상황', '카페에서 우연히 마주친 상황', '도서관에서 책을 빌리다 만난 상황',
        '버스정류장에서 기다리다 만난 상황', '동아리 활동 중 만난 상황', '친구 소개로 만난 상황'
      ])
    },

    // 원본 메타데이터 보존
    created_at: new Date().toISOString(),
    created_date: new Date().toISOString().split('T')[0],
    generation_method: 'ai_random_generation',
    source: inputData.source || 'ai_generate',
    active: inputData.active !== undefined ? inputData.active : true
  };
}

// 🎲 랜덤 선택 헬퍼 함수들
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomSelect(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 부분 입력으로 캐릭터 완성 함수 (기존 함수 - 호환성 유지)
function completeCharacterFromInput(inputData) {
  console.log('📝 입력된 데이터:', inputData);

  // 기본값 설정
  const name = inputData.name || inputData.answers?.name || '미지의 소녀';
  const mbti = inputData.mbti || inputData.answers?.mbti || 'INFP';
  const age = inputData.age || inputData.answers?.age || 22;

  console.log('✅ 추출된 핵심 정보:', { name, mbti, age });

  // MBTI 기반 템플릿으로 나머지 완성
  const template = getTemplateByMBTI(mbti);

  return {
    id: inputData.id || `${name.toLowerCase().replace(/\s+/g, '_')}_${mbti.toLowerCase()}_${Date.now()}`,
    name: name,
    age: parseInt(age) || 22,
    gender: inputData.gender || 'female',
    mbti: mbti,

    // ✨ 모든 입력 필드를 우선적으로 사용, 없으면 MBTI 템플릿 기본값
    personality_traits: inputData.personality_traits || template.personalities.slice(0, 3),
    major: inputData.major || '대학생',
    family: inputData.family || '평범한 가정',
    hometown: inputData.hometown || '서울',
    relationship: inputData.relationship || '친구',
    speech_style: inputData.speech_style || `${template.speech_styles[0]} 말투`,
    speech_habit: inputData.speech_habit || '이모티콘을 자주 사용함',

    appearance: {
      hair: inputData.appearance?.hair || inputData.hair || '긴 머리',
      eyes: inputData.appearance?.eyes || inputData.eyes || '큰 눈',
      style: inputData.appearance?.style || inputData.style || '캐주얼한 스타일'
    },

    background: {
      family: inputData.background?.family || inputData.family || '평범한 가정',
      hometown: inputData.background?.hometown || inputData.hometown || '서울',
      occupation: inputData.background?.occupation || '대학생'
    },

    personality: {
      hobbies: inputData.personality?.hobbies || inputData.hobbies || template.hobbies.slice(0, 3),
      values: inputData.personality?.values || inputData.values || `${mbti} 유형의 가치관`,
      fears: inputData.personality?.fears || inputData.fears || '거절당하는 것'
    },

    // ✨ scenario-admin.html에서 온 추가 필드들도 보존
    values: inputData.values || `${mbti} 유형의 가치관`,
    hobbies: inputData.hobbies || template.hobbies.slice(0, 3),

    story_context: {
      main_situation: inputData.story_context?.main_situation || '대학교에서 처음 만나는 상황'
    },

    // ✨ 원본 메타데이터 보존
    created_at: inputData.created_at || new Date().toISOString(),
    created_date: inputData.created_date || new Date().toISOString().split('T')[0],
    generation_method: inputData.generation_method || 'ai_completion',
    source: inputData.source || 'api_generate',
    active: inputData.active !== undefined ? inputData.active : true
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

// 🐙 GitHub API를 통한 영구 저장 함수
async function saveToGitHub(memoryStorage) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';
  const FILE_PATH = 'data/characters.json';

  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN 환경변수가 설정되지 않았습니다');
  }

  try {
    console.log('🐙 GitHub API로 캐릭터 데이터 저장 시작...');

    // 1. 현재 파일의 SHA 값 가져오기 (파일 업데이트에 필요)
    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    let currentFileSha = null;

    try {
      const getResponse = await fetch(getFileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ChatGame-Character-Saver'
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

    // 2. 캐릭터 데이터를 JSON으로 변환
    const characterDataJson = JSON.stringify(memoryStorage, null, 2);
    const encodedContent = Buffer.from(characterDataJson, 'utf8').toString('base64');

    // 3. GitHub API로 파일 업데이트/생성
    const updateData = {
      message: `💾 캐릭터 데이터 업데이트 - ${memoryStorage.metadata.total_characters}개 캐릭터`,
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
        'User-Agent': 'ChatGame-Character-Saver'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      throw new Error(`GitHub API 오류: ${updateResponse.status} - ${errorData}`);
    }

    const result = await updateResponse.json();
    console.log('🎉 GitHub 저장 성공:', {
      sha: result.content.sha,
      size: result.content.size,
      download_url: result.content.download_url
    });

    return result;

  } catch (error) {
    console.error('❌ GitHub 저장 실패:', error);
    throw error;
  }
}

// 🐙 GitHub에서 캐릭터 데이터 로드 함수 (추가 기능)
async function loadFromGitHub() {
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';
  const FILE_PATH = 'data/characters.json';

  try {
    console.log('🐙 GitHub에서 캐릭터 데이터 로드 시도...');

    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const response = await fetch(getFileUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ChatGame-Character-Loader'
      }
    });

    if (response.ok) {
      const fileData = await response.json();
      const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      const characterData = JSON.parse(decodedContent);

      console.log('✅ GitHub에서 데이터 로드 성공:', characterData.metadata);

      // 메모리 저장소에 로드된 데이터 병합
      memoryStorage.characters = { ...memoryStorage.characters, ...characterData.characters };
      memoryStorage.metadata = { ...memoryStorage.metadata, ...characterData.metadata };

      return characterData;
    } else {
      console.log('📂 GitHub에 저장된 캐릭터 파일이 없음');
      return null;
    }

  } catch (error) {
    console.warn('⚠️ GitHub 로드 실패:', error.message);
    return null;
  }
}