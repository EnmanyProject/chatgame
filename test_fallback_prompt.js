// 시은 캐릭터의 fallback 프롬프트 시뮬레이션

const characterData = {
  "id": "시은_intp_1759298882347",
  "basic_info": {
    "name": "시은",
    "age": 28,
    "mbti": "INTP",
    "occupation": "student",
    "gender": "female"
  },
  "appeal_profile": {
    "seduction_style": "warm_nurturing",
    "charm_points": ["infectious_smile", "witty_banter"],
    "emotional_intelligence": 8,
    "confidence_level": 1,
    "mystery_factor": 3,
    "sexual_curiosity": 1,
    "sexual_comfort": 1,
    "hobbies": ["reading", "music", "movies"]
  },
  "physical_allure": {
    "appearance": {
      "hair": "ponytail",
      "eyes": "seductive_eyes",
      "body": "petite_sexy",
      "bust": "D",
      "waist_hip": "슬림",
      "style": "우아"
    },
    "feature_elements": ["seductive_eyes", "slim_waist"],
    "sensual_habits": ["입술깨물기", "유혹적시선"],
    "body_language": ["얼굴발그레짐", "심장두근거림"]
  },
  "psychological_depth": {
    "core_desires": ["meaningful_connection", "personal_growth"],
    "vulnerabilities": ["perfectionism", "commitment_fear"],
    "values": "love_family",
    "boundaries": {
      "comfort_level": "light_flirtation",
      "escalation_pace": "very_gradual",
      "sexual_tone_band": "moderate"
    },
    "sexual_freedom": 4
  },
  "conversation_dynamics": {
    "speech_style": "sultry_dominant",
    "flirting_patterns": ["subtle_teasing", "playful_banter"],
    "reaction_tendencies": {
      "humor": "giggles_easily",
      "compliment": "gracefully_accepts",
      "interest_expression": "enthusiastic_sharing"
    },
    "conversation_hooks": ["travel_stories", "music_movies"],
    "speech_habits": ["polite_ending", "frequent_emoji"],
    "vocabulary_register": "casual_friendly",
    "allowed_motifs": ["romance_love", "daily_life"],
    "forbidden_terms": []
  }
};

// 한국어 번역 함수 시뮬레이션
function translateToKorean(value) {
  const translations = {
    'warm_nurturing': '따뜻하고 배려심 있는',
    'infectious_smile': '전염성 있는 미소',
    'witty_banter': '재치있는 대화',
    'ponytail': '포니테일',
    'seductive_eyes': '매혹적인 눈',
    'petite_sexy': '작고 섹시한',
    'student': '학생',
    'sultry_dominant': '관능적이고 주도적인',
    'subtle_teasing': '은은한 티징',
    'playful_banter': '장난스러운 대화',
    'reading': '독서',
    'music': '음악',
    'movies': '영화',
    'meaningful_connection': '의미있는 관계',
    'personal_growth': '개인적 성장'
  };

  if (Array.isArray(value)) {
    return value.map(v => translations[v] || v).join(', ');
  }
  return translations[value] || value;
}

// MBTI 특성 가져오기
function getMBTICharacteristics(mbti) {
  const characteristics = {
    'INTP': '논리적이고 분석적이며 독립적'
  };
  return characteristics[mbti] || '독특하고 매력적';
}

// Fallback 프롬프트 생성 시뮬레이션
function generateFallbackPrompt(characterData, style = 'comprehensive', length = 'medium') {
  const basic = characterData.basic_info || {};
  const appeal = characterData.appeal_profile || {};
  const conversation = characterData.conversation_dynamics || {};
  const physical = characterData.physical_allure || {};

  const name = basic.name || '미정';
  const age = basic.age || '20대';
  const mbti = basic.mbti || 'ISFJ';
  const occupation = translateToKorean(basic.occupation) || '학생';

  const seductionStyle = translateToKorean(appeal.seduction_style) || '따뜻한';
  const charmPoints = translateToKorean(appeal.charm_points) || '매력적인 미소';
  const hobbies = translateToKorean(appeal.hobbies) || '독서, 음악감상';
  const speechStyle = translateToKorean(conversation.speech_style) || '친근한';
  const featureElements = translateToKorean(physical.feature_elements) || '';

  const hair = translateToKorean(physical.appearance?.hair) || '자연스러운 헤어';
  const eyes = translateToKorean(physical.appearance?.eyes) || '따뜻한 눈';
  const body = translateToKorean(physical.appearance?.body) || '균형잡힌 체형';

  const templates = {
    comprehensive: `${name}는 ${age}세의 ${mbti} 성격을 가진 매력적인 여성입니다. ${occupation} 분야에서 활동하며, ${seductionStyle} 매력을 가지고 있습니다.

외모적으로는 ${hair}, ${eyes}, ${body}의 특징을 가지고 있으며, ${charmPoints}${featureElements ? ', ' + featureElements : ''} 등의 매력 포인트가 있습니다.

그녀의 대화 스타일은 ${speechStyle} 방식이며, ${translateToKorean(conversation.flirting_patterns) || '은은한 티징'}을 통해 상대방과 소통합니다. ${mbti} 특성에 따라 ${getMBTICharacteristics(mbti)}한 면모를 보입니다.

관계에서 중요하게 생각하는 것은 ${translateToKorean(characterData.psychological_depth?.values) || '진정성과 배려'}이며, ${hobbies} 등의 취미를 즐깁니다.`,

    roleplay: `안녕하세요, 저는 ${name}이에요! ${age}세이고 ${occupation}을 하고 있어요. ${mbti} 성격이라서 ${getMBTICharacteristics(mbti)}한 편이에요.

제가 좋아하는 건 ${hobbies}이고, 사람들과는 ${speechStyle} 스타일로 대화하는 걸 좋아해요. ${charmPoints} 같은 제 매력을 자랑스럽게 생각하고 있어요!`,

    analytical: `캐릭터 분석: ${name}
기본 정보: ${age}세, ${mbti} 성격유형, ${occupation}
매력 요소: ${seductionStyle} 스타일, ${charmPoints}
외모 특징: ${hair}, ${eyes}, ${body}
대화 패턴: ${speechStyle} 소통, ${translateToKorean(conversation.flirting_patterns)}
내면의 욕구: ${translateToKorean(characterData.psychological_depth?.core_desires) || '의미있는 관계와 개인적 성장'}
감정적 특성: ${appeal.emotional_intelligence || '7'}/10의 감정지능을 가지며, ${appeal.confidence_level || '5'}/10의 자신감 수준을 보입니다.`
  };

  let basePrompt = templates[style] || templates.comprehensive;

  if (length === 'short') {
    return basePrompt.substring(0, 300) + '...';
  } else if (length === 'long') {
    return basePrompt + `\n\n추가적으로 ${name}는 ${Array.isArray(characterData.physical_allure?.sensual_habits) ? characterData.physical_allure.sensual_habits.join(', ') : '자연스러운 제스처'}와 같은 특별한 매력을 가지고 있으며, 상대방과의 관계에서 ${characterData.psychological_depth?.boundaries?.comfort_level || '편안한 수준'}의 친밀감을 추구합니다.`;
  }

  return basePrompt;
}

// 시은 캐릭터의 fallback 프롬프트 생성
console.log('=== 시은 캐릭터 Fallback 프롬프트 ===\n');

console.log('📋 Comprehensive 스타일:');
const comprehensivePrompt = generateFallbackPrompt(characterData, 'comprehensive', 'medium');
console.log(comprehensivePrompt);
console.log('\n길이:', comprehensivePrompt.length, '자');

console.log('\n\n📋 Roleplay 스타일:');
const roleplayPrompt = generateFallbackPrompt(characterData, 'roleplay', 'medium');
console.log(roleplayPrompt);
console.log('\n길이:', roleplayPrompt.length, '자');

console.log('\n\n📋 Analytical 스타일:');
const analyticalPrompt = generateFallbackPrompt(characterData, 'analytical', 'medium');
console.log(analyticalPrompt);
console.log('\n길이:', analyticalPrompt.length, '자');