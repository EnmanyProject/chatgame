// AI 캐릭터 생성 API - v3.0.0 (GitHub API 전용)
// 메모리 저장소 제거, GitHub API만 사용

// GitHub API 전용 저장소 (로컬 파일/메모리 의존성 제거)
const DEFAULT_METADATA = {
  version: "3.0.0",
  total_characters: 0,
  created: new Date().toISOString(),
  storage_type: "github_api_only",
  last_updated: new Date().toISOString()
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
      console.log('🐙 GitHub API 전용 캐릭터 리스트 조회...');

      // GitHub API에서 직접 데이터 로드 (메모리 저장소 제거)
      let characterData;
      try {
        characterData = await loadFromGitHub();
      } catch (error) {
        console.error('❌ 캐릭터 데이터 로드 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: `캐릭터 데이터 로드 실패: ${error.message}`,
          error_type: 'GITHUB_API_ERROR',
          troubleshooting: [
            'Vercel 환경변수 GITHUB_TOKEN 확인',
            '인터넷 연결 상태 확인',
            'GitHub API 상태 확인 (status.github.com)',
            'Repository 접근 권한 확인'
          ]
        });
      }

      if (!characterData) {
        console.log('📂 캐릭터 데이터가 없음 - 빈 응답 반환');
        return res.json({
          success: true,
          characters: {},
          metadata: { ...DEFAULT_METADATA },
          github_synced: false
        });
      }

      console.log('📊 GitHub에서 로드된 캐릭터 수:', Object.keys(characterData.characters || {}).length, '개');

      return res.json({
        success: true,
        characters: characterData.characters,
        metadata: {
          ...characterData.metadata,
          github_synced: true,
          sync_time: new Date().toISOString()
        }
      });
    }

    // 모든 캐릭터 데이터 초기화
    if (action === 'reset_all_characters') {
      console.log('🐙 GitHub API 전용 캐릭터 데이터 초기화...');

      // 완전 초기화된 데이터 구조 생성
      const resetData = {
        characters: {},
        metadata: {
          ...DEFAULT_METADATA,
          reset_at: new Date().toISOString(),
          total_characters: 0
        }
      };

      // GitHub API로 초기화 상태 저장
      try {
        await saveToGitHub(resetData);
        console.log('🎉 GitHub에 초기화 상태 저장 완료');
      } catch (error) {
        console.error('❌ GitHub 초기화 저장 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: 'GitHub 초기화 실패: ' + error.message
        });
      }

      console.log('✅ GitHub API 전용 캐릭터 초기화 완료');

      return res.json({
        success: true,
        message: '모든 캐릭터 데이터가 초기화되었습니다',
        github_updated: true
      });
    }

    // 캐릭터 저장 (GitHub API + 메모리 저장소)
    if (action === 'save_character') {
      console.log('🐙 GitHub API 전용 캐릭터 저장 시작...');

      // GitHub에서 최신 데이터 로드 (기존 캐릭터 보존)
      const existingData = await loadFromGitHub();

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

      console.log('💾 GitHub API 전용 캐릭터 저장 시작:', characterData.name);

      // ID가 없으면 생성
      if (!characterData.id) {
        characterData.id = `${characterData.name.toLowerCase().replace(/\s+/g, '_')}_${characterData.mbti.toLowerCase()}_${Date.now()}`;
      }

      // GitHub 데이터 구조 준비
      const updatedData = {
        characters: {
          ...(existingData?.characters || {}),
          [characterData.id]: {
            ...characterData,
            updated_at: new Date().toISOString(),
            source: 'api_save'
          }
        },
        metadata: {
          ...(existingData?.metadata || DEFAULT_METADATA),
          total_characters: Object.keys(existingData?.characters || {}).length + 1,
          last_updated: new Date().toISOString(),
          storage_type: 'github_api_only'
        }
      };

      // GitHub API로 직접 저장 (메모리 저장소 제거)
      try {
        console.log('🔄 GitHub 저장 시작 - 총 캐릭터 수:', Object.keys(updatedData.characters).length);
        const saveResult = await saveToGitHub(updatedData);
        console.log('🎉 GitHub에 성공적으로 저장됨');
      } catch (error) {
        console.error('❌ GitHub 저장 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: 'GitHub 저장 실패: ' + error.message
        });
      }

      console.log('✅ 캐릭터 저장 완료:', characterData.id);

      return res.json({
        success: true,
        character: characterData,
        message: '캐릭터가 성공적으로 저장되었습니다',
        id: characterData.id,
        github_saved: true
      });
    }

    // AI 캐릭터 생성 - 부분 입력으로 완성
    if (action === 'generate_character') {
      const inputData = req.body;

      console.log('🤖 AI 캐릭터 생성 시작:', inputData);

      try {
        // 🧠 실제 OpenAI API를 사용한 지능적 캐릭터 완성
        const character = await generateCharacterWithAI(inputData);

        return res.json({
          success: true,
          character: character,
          message: '캐릭터가 AI에 의해 성공적으로 완성되었습니다!'
        });
      } catch (error) {
        console.error('❌ AI 캐릭터 생성 실패:', error);

        // AI 실패 시 fallback으로 기존 랜덤 생성 사용
        console.log('🔄 Fallback: 랜덤 생성으로 전환');
        const character = generateRandomCharacterFromInput(inputData);

        return res.json({
          success: true,
          character: character,
          message: '캐릭터가 완성되었습니다 (AI 오류로 인한 기본 생성)',
          fallback: true
        });
      }
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

      console.log('🐙 GitHub API 전용 캐릭터 삭제:', character_id);

      // GitHub에서 현재 데이터 로드
      const existingData = await loadFromGitHub();

      if (!existingData || !existingData.characters[character_id]) {
        return res.status(404).json({
          success: false,
          message: 'Character not found'
        });
      }

      const characterName = existingData.characters[character_id].name;
      console.log('🗑️ 삭제할 캐릭터:', characterName);

      // 캐릭터 삭제된 새로운 데이터 구조 생성
      const updatedData = {
        characters: { ...existingData.characters },
        metadata: {
          ...existingData.metadata,
          total_characters: Object.keys(existingData.characters).length - 1,
          last_updated: new Date().toISOString(),
          storage_type: 'github_api_only'
        }
      };

      // 해당 캐릭터 삭제
      delete updatedData.characters[character_id];

      // GitHub API로 업데이트 저장
      try {
        await saveToGitHub(updatedData);
        console.log('🎉 GitHub에서 캐릭터 삭제 완료');
      } catch (error) {
        console.error('❌ GitHub 삭제 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: 'GitHub 삭제 실패: ' + error.message
        });
      }

      console.log('✅ 캐릭터 삭제 완료:', characterName);
      console.log('📊 남은 캐릭터 수:', updatedData.metadata.total_characters);

      return res.json({
        success: true,
        message: 'Character deleted successfully',
        character_id: character_id,
        character_name: characterName,
        github_updated: true
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

// 🧠 OpenAI API를 사용한 지능적 캐릭터 완성 함수
async function generateCharacterWithAI(inputData) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다');
  }

  console.log('🤖 OpenAI API 캐릭터 생성 시작...');
  // 프론트엔드에서 answers 필드로 데이터를 보내므로 처리
  const userData = inputData.answers || inputData;

  console.log('📝 입력 데이터:', {
    name: userData.name,
    mbti: userData.mbti,
    age: userData.age,
    personality_traits: userData.personality_traits,
    hobbies: userData.hobbies,
    speech_style: userData.speech_style
  });

  // 사용자가 선택한 특성들을 문자열로 변환
  const selectedTraits = Array.isArray(userData.personality_traits) ? userData.personality_traits.join(', ') : '';
  const selectedHobbies = Array.isArray(userData.hobbies) ? userData.hobbies.join(', ') : '';

  const prompt = `다음 정보를 바탕으로 매력적이고 섹시한 성인 여성 캐릭터를 완성해주세요:

기본 정보:
- 이름: ${userData.name || '랜덤으로 생성'}
- 나이: ${userData.age || '20-30세 사이'} (성인 여성)
- MBTI: ${userData.mbti || '적절한 MBTI 선택'}

선택된 특성들:
- 성격 특성: ${selectedTraits || '섹시하고 매력적인 성격 특성들'}
- 취미: ${selectedHobbies || '성인 여성의 흥미로운 취미들'}
- 말투 스타일: ${userData.speech_style || '매혹적이고 성인 매력이 넘치는 말투'}
- 몸매 특성: ${userData.bust || '매력적인 가슴 사이즈'}, ${userData.waist_hip || '섹시한 허리/엉덩이 라인'}

요구사항:
1. 🔥 성인 매력: 성숙하고 섹시한 성인 여성의 매력을 강조해주세요
2. 💋 말투 스타일 완성: "${userData.speech_style}"에 맞는 구체적이고 유혹적인 말버릇을 창조해주세요
   - 예: "관능적이고 속삭이는 말투" → "중요한 말을 할 때 상대 귀에 속삭이는 습관", "시선을 오래 마주치며 말하는 습관"
   - 예: "섹시하고 도발적인 말투" → "말끝을 살짝 늘이며 입술을 살짝 핥는 습관", "자신감 있게 어깨를 움직이는 습관"

3. 🧠 MBTI 정확성: ${userData.mbti} 특성을 정확히 반영해주세요
4. 🇰🇷 한국 문화: 자연스러운 한국 성인 여성 캐릭터로 만들어주세요
5. ✨ 성인 매력과 현실성: 섹시하지만 믿을 만한 성인 캐릭터로 완성해주세요
6. 🎯 개성 강화: 선택된 특성들을 바탕으로 독특하고 매혹적인 캐릭터를 만들어주세요
7. 💃 몸매 반영: 선택된 몸매 특성을 자연스럽게 캐릭터 설정에 반영해주세요

JSON 형식으로 응답해주세요:
{
  "name": "캐릭터 이름",
  "age": 나이숫자,
  "mbti": "MBTI",
  "gender": "female",
  "personality_traits": ["섹시한 특성1", "매혹적인 특성2", "성인스러운 특성3"],
  "major": "전공분야",
  "family": "가족배경",
  "hometown": "출신지역",
  "relationship": "성인 관계 설정",
  "appearance": {
    "hair": "섹시한 헤어스타일",
    "eyes": "유혹적인 눈모양",
    "body": "매력적인 체형",
    "bust": "가슴 사이즈 설명",
    "waist_hip": "허리/엉덩이 라인 설명",
    "style": "성인 매력의 패션스타일"
  },
  "hobbies": ["성인취미1", "매력적인취미2", "섹시한취미3"],
  "values": "성인 여성의 가치관",
  "speech_style": "구체적이고 매혹적인 말투 설명",
  "speech_habit": "섹시하고 유혹적인 말버릇"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 매력적이고 섹시한 성인 여성 캐릭터를 만드는 전문가입니다. 성숙하고 매혹적인 성인 여성의 매력을 강조하며, 사용자의 요구사항을 정확히 반영하여 완성도 높은 성인 캐릭터를 만들어주세요. 모든 캐릭터는 20세 이상의 성인이며, 성인적 매력과 섹시함을 가진 캐릭터여야 합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('🤖 OpenAI 응답:', aiResponse);

    // JSON 응답 파싱
    let characterData;
    try {
      // JSON 블록을 찾아서 파싱
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        characterData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON 형식이 아닌 응답');
      }
    } catch (parseError) {
      console.warn('⚠️ JSON 파싱 실패:', parseError.message);
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    // 기본 필드 추가
    const completedCharacter = {
      ...characterData,
      id: `${characterData.name.toLowerCase().replace(/\s+/g, '_')}_${characterData.mbti.toLowerCase()}_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: 'ai_generated',
      active: true
    };

    console.log('✅ AI 캐릭터 생성 완료:', completedCharacter.name);
    return completedCharacter;

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    throw error;
  }
}

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
    gender: 'female', // 무조건 여성
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
  const name = inputData.name || inputData.answers?.name || randomChoice(['미나', '지수', '서연', '혜진', '유나', '소영', '하늘', '별', '가을', '민정', '수빈', '채원']);
  const mbti = inputData.mbti || inputData.answers?.mbti || 'INFP';
  const age = inputData.age || inputData.answers?.age || 22;

  console.log('✅ 추출된 핵심 정보:', { name, mbti, age });

  // MBTI 기반 템플릿으로 나머지 완성
  const template = getTemplateByMBTI(mbti);

  return {
    id: inputData.id || `${name.toLowerCase().replace(/\s+/g, '_')}_${mbti.toLowerCase()}_${Date.now()}`,
    name: name,
    age: parseInt(age) || 22,
    gender: 'female', // 무조건 여성
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
async function saveToGitHub(characterData) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';
  const FILE_PATH = 'data/characters.json';

  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN 환경변수가 설정되지 않았습니다');
    throw new Error('GITHUB_TOKEN 환경변수가 설정되지 않았습니다');
  }

  console.log('🔑 GitHub 토큰 확인됨 (길이:', GITHUB_TOKEN.length, ')');

  try {
    console.log('🐙 GitHub API로 캐릭터 데이터 저장 시작...');
    console.log('📋 저장할 데이터:', {
      총_캐릭터_수: Object.keys(characterData.characters).length,
      캐릭터_목록: Object.keys(characterData.characters),
      메타데이터: characterData.metadata
    });

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
    const characterDataJson = JSON.stringify(characterData, null, 2);
    const encodedContent = Buffer.from(characterDataJson, 'utf8').toString('base64');

    // 3. GitHub API로 파일 업데이트/생성
    const updateData = {
      message: `💾 캐릭터 데이터 업데이트 - ${characterData.metadata.total_characters}개 캐릭터`,
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

      // 메타데이터에 GitHub 전용 표시 추가 (메모리 저장소 제거)
      characterData.metadata = {
        ...characterData.metadata,
        storage_type: 'github_api_only',
        last_accessed: new Date().toISOString()
      };

      console.log('📊 GitHub에서 로드된 캐릭터 수:', Object.keys(characterData.characters || {}).length);

      return characterData;
    } else {
      console.log('📂 GitHub에 저장된 캐릭터 파일이 없음');
      return null;
    }

  } catch (error) {
    console.error('❌ GitHub 로드 실패:', {
      message: error.message,
      status: error.status,
      stack: error.stack?.split('\n')[0]
    });

    // GitHub API 연결 실패 시 더 구체적인 에러 정보 제공
    throw new Error(`GitHub API 연결 실패: ${error.message}. Vercel 환경변수 및 인터넷 연결을 확인하세요.`);
  }
}