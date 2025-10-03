/**
 * Scenario Validator - 시나리오 데이터 검증 전문 모듈
 * @version 1.0.0
 * @description 시나리오의 각 구성요소를 세밀하게 검증하는 전문 검증 함수들
 */

/**
 * 1. validateMetadata - 시나리오 메타데이터 검증
 * @param {Object} metadata - 검증할 메타데이터 객체
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * @example
 * const metadata = {
 *   title: "늦은 밤의 고백",
 *   genre: "sensual_romance",
 *   sexy_level: 6,
 *   tags: ["술", "고백"],
 *   estimated_duration: "5-7분"
 * };
 * const result = validateMetadata(metadata);
 */
function validateMetadata(metadata) {
  const errors = [];

  // 필수 필드 존재 확인
  if (!metadata) {
    errors.push('메타데이터 객체가 필요합니다.');
    return { valid: false, errors };
  }

  // title 검증 (필수)
  if (!metadata.title || typeof metadata.title !== 'string') {
    errors.push('title은 필수 문자열 필드입니다.');
  } else if (metadata.title.length < 2 || metadata.title.length > 50) {
    errors.push('title은 2-50자 사이여야 합니다.');
  }

  // genre 검증 (필수, enum)
  const validGenres = [
    'sensual_romance',
    'sweet_romance',
    'passionate_love',
    'playful_flirt',
    'emotional_connection'
  ];
  if (!metadata.genre) {
    errors.push('genre는 필수 필드입니다.');
  } else if (!validGenres.includes(metadata.genre)) {
    errors.push(`genre는 다음 중 하나여야 합니다: ${validGenres.join(', ')}`);
  }

  // sexy_level 검증 (필수, 1-10)
  if (typeof metadata.sexy_level !== 'number') {
    errors.push('sexy_level은 숫자여야 합니다.');
  } else if (metadata.sexy_level < 1 || metadata.sexy_level > 10) {
    errors.push('sexy_level은 1-10 사이여야 합니다.');
  }

  // tags 검증 (필수, 배열)
  if (!Array.isArray(metadata.tags)) {
    errors.push('tags는 배열이어야 합니다.');
  } else {
    if (metadata.tags.length === 0) {
      errors.push('최소 1개 이상의 태그가 필요합니다.');
    }
    metadata.tags.forEach((tag, index) => {
      if (typeof tag !== 'string') {
        errors.push(`tags[${index}]는 문자열이어야 합니다.`);
      }
    });
  }

  // estimated_duration 검증 (선택, 문자열)
  if (metadata.estimated_duration && typeof metadata.estimated_duration !== 'string') {
    errors.push('estimated_duration은 문자열이어야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * 2. validateStructure - 시나리오 구조(Acts) 검증
 * @param {Object} structure - 검증할 구조 객체
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * @example
 * const structure = {
 *   acts: [
 *     { act_number: 1, act_title: "시작", beats: [...] }
 *   ]
 * };
 * const result = validateStructure(structure);
 */
function validateStructure(structure) {
  const errors = [];

  // 구조 객체 존재 확인
  if (!structure) {
    errors.push('구조 객체가 필요합니다.');
    return { valid: false, errors };
  }

  // acts 배열 검증
  if (!structure.acts) {
    errors.push('acts 필드가 필요합니다.');
    return { valid: false, errors };
  }

  if (!Array.isArray(structure.acts)) {
    errors.push('acts는 배열이어야 합니다.');
    return { valid: false, errors };
  }

  if (structure.acts.length < 1) {
    errors.push('최소 1개의 Act가 필요합니다.');
    return { valid: false, errors };
  }

  // 각 Act 검증
  const actNumbers = new Set();
  structure.acts.forEach((act, actIndex) => {
    const actPrefix = `Act ${actIndex + 1}`;

    // act_number 검증 (필수, 중복 불가)
    if (typeof act.act_number !== 'number') {
      errors.push(`${actPrefix}: act_number는 숫자여야 합니다.`);
    } else {
      if (act.act_number < 1) {
        errors.push(`${actPrefix}: act_number는 1 이상이어야 합니다.`);
      }
      if (actNumbers.has(act.act_number)) {
        errors.push(`${actPrefix}: act_number ${act.act_number}가 중복됩니다.`);
      }
      actNumbers.add(act.act_number);
    }

    // act_title 검증 (선택)
    if (act.act_title && typeof act.act_title !== 'string') {
      errors.push(`${actPrefix}: act_title은 문자열이어야 합니다.`);
    }

    // beats 배열 검증
    if (!act.beats) {
      errors.push(`${actPrefix}: beats 필드가 필요합니다.`);
    } else if (!Array.isArray(act.beats)) {
      errors.push(`${actPrefix}: beats는 배열이어야 합니다.`);
    } else if (act.beats.length < 1) {
      errors.push(`${actPrefix}: 최소 1개의 Beat가 필요합니다.`);
    } else {
      // Beat 번호 중복 검사
      const beatNumbers = new Set();
      act.beats.forEach((beat, beatIndex) => {
        if (typeof beat.beat_number === 'number') {
          if (beatNumbers.has(beat.beat_number)) {
            errors.push(`${actPrefix}, Beat ${beatIndex + 1}: beat_number ${beat.beat_number}가 중복됩니다.`);
          }
          beatNumbers.add(beat.beat_number);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * 3. validateBeat - Beat(대화 단위) 검증
 * @param {Object} beat - 검증할 Beat 객체
 * @param {string} [context] - 에러 메시지에 표시할 컨텍스트 (예: "Act 1, Beat 2")
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * @example
 * const beat = {
 *   beat_number: 1,
 *   beat_type: "introduction",
 *   template: {
 *     npc_dialogue_template: "안녕",
 *     narration_template: "인사한다",
 *     choice_templates: [...]
 *   }
 * };
 * const result = validateBeat(beat, "Act 1, Beat 1");
 */
function validateBeat(beat, context = 'Beat') {
  const errors = [];

  // Beat 객체 존재 확인
  if (!beat) {
    errors.push(`${context}: Beat 객체가 필요합니다.`);
    return { valid: false, errors };
  }

  // beat_number 검증 (필수)
  if (typeof beat.beat_number !== 'number') {
    errors.push(`${context}: beat_number는 숫자여야 합니다.`);
  } else if (beat.beat_number < 1) {
    errors.push(`${context}: beat_number는 1 이상이어야 합니다.`);
  }

  // beat_type 검증 (필수, enum)
  const validBeatTypes = [
    'introduction',
    'flirtation',
    'confession',
    'response',
    'escalation',
    'resolution'
  ];
  if (!beat.beat_type) {
    errors.push(`${context}: beat_type은 필수 필드입니다.`);
  } else if (!validBeatTypes.includes(beat.beat_type)) {
    errors.push(`${context}: beat_type은 다음 중 하나여야 합니다: ${validBeatTypes.join(', ')}`);
  }

  // template 검증
  if (!beat.template) {
    errors.push(`${context}: template 필드가 필요합니다.`);
    return { valid: false, errors };
  }

  // npc_dialogue_template 검증 (필수)
  if (!beat.template.npc_dialogue_template || typeof beat.template.npc_dialogue_template !== 'string') {
    errors.push(`${context}: npc_dialogue_template은 필수 문자열 필드입니다.`);
  }

  // narration_template 검증 (필수)
  if (!beat.template.narration_template || typeof beat.template.narration_template !== 'string') {
    errors.push(`${context}: narration_template은 필수 문자열 필드입니다.`);
  }

  // choice_templates 검증 (필수, 2-4개)
  if (!beat.template.choice_templates) {
    errors.push(`${context}: choice_templates 필드가 필요합니다.`);
  } else if (!Array.isArray(beat.template.choice_templates)) {
    errors.push(`${context}: choice_templates는 배열이어야 합니다.`);
  } else {
    const choiceCount = beat.template.choice_templates.length;
    if (choiceCount < 2 || choiceCount > 4) {
      errors.push(`${context}: choice_templates는 2-4개여야 합니다 (현재: ${choiceCount}개).`);
    }
  }

  // emotion_hint 검증 (선택)
  if (beat.template.emotion_hint && typeof beat.template.emotion_hint !== 'string') {
    errors.push(`${context}: emotion_hint는 문자열이어야 합니다.`);
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * 4. validateChoice - 선택지 검증
 * @param {Object} choice - 검증할 선택지 객체
 * @param {string} [context] - 에러 메시지에 표시할 컨텍스트
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * @example
 * const choice = {
 *   text_template: "안녕하세요",
 *   affection_range: "medium",
 *   tone: "gentle"
 * };
 * const result = validateChoice(choice, "Act 1, Beat 1, Choice 1");
 */
function validateChoice(choice, context = 'Choice') {
  const errors = [];

  // 선택지 객체 존재 확인
  if (!choice) {
    errors.push(`${context}: 선택지 객체가 필요합니다.`);
    return { valid: false, errors };
  }

  // text_template 검증 (필수)
  if (!choice.text_template || typeof choice.text_template !== 'string') {
    errors.push(`${context}: text_template은 필수 문자열 필드입니다.`);
  } else if (choice.text_template.length < 2) {
    errors.push(`${context}: text_template은 최소 2자 이상이어야 합니다.`);
  } else if (choice.text_template.length > 200) {
    errors.push(`${context}: text_template은 200자 이하여야 합니다.`);
  }

  // affection_range 검증 (필수, enum)
  const validAffectionRanges = [
    'negative',
    'neutral',
    'low',
    'medium',
    'high',
    'critical'
  ];
  if (!choice.affection_range) {
    errors.push(`${context}: affection_range는 필수 필드입니다.`);
  } else if (!validAffectionRanges.includes(choice.affection_range)) {
    errors.push(`${context}: affection_range는 다음 중 하나여야 합니다: ${validAffectionRanges.join(', ')}`);
  }

  // tone 검증 (필수, enum)
  const validTones = [
    'caring',
    'playful',
    'passionate',
    'respectful',
    'bold',
    'gentle'
  ];
  if (!choice.tone) {
    errors.push(`${context}: tone은 필수 필드입니다.`);
  } else if (!validTones.includes(choice.tone)) {
    errors.push(`${context}: tone은 다음 중 하나여야 합니다: ${validTones.join(', ')}`);
  }

  // next_beat_hint 검증 (선택)
  if (choice.next_beat_hint && typeof choice.next_beat_hint !== 'string') {
    errors.push(`${context}: next_beat_hint는 문자열이어야 합니다.`);
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Node.js 환경에서 모듈로 export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateMetadata,
    validateStructure,
    validateBeat,
    validateChoice
  };
}

// 브라우저 환경에서 전역 객체로 export
if (typeof window !== 'undefined') {
  window.ScenarioValidator = {
    validateMetadata,
    validateStructure,
    validateBeat,
    validateChoice
  };
}

// ========== 테스트 코드 ==========

/**
 * 테스트 함수 - 모든 validator 함수를 테스트
 */
function testScenarioValidator() {
  console.log('=== Scenario Validator 테스트 시작 ===\n');

  // 1. validateMetadata 테스트
  console.log('1. validateMetadata 테스트:');
  const validMetadata = {
    title: "늦은 밤의 고백",
    genre: "sensual_romance",
    sexy_level: 6,
    tags: ["술", "고백", "메신저"],
    estimated_duration: "5-7분"
  };
  const metadataResult = validateMetadata(validMetadata);
  console.log(`검증 결과: ${metadataResult.valid ? '성공' : '실패'}`);
  if (!metadataResult.valid) {
    console.log('오류:', metadataResult.errors);
  }

  const invalidMetadata = {
    title: "A",  // 너무 짧음
    genre: "invalid_genre",  // 잘못된 장르
    sexy_level: 15,  // 범위 초과
    tags: "not_array"  // 배열 아님
  };
  const invalidResult = validateMetadata(invalidMetadata);
  console.log(`\n잘못된 메타데이터 검증: ${invalidResult.valid ? '성공' : '실패'}`);
  console.log('예상된 오류:', invalidResult.errors);
  console.log(`✓ 테스트 완료\n`);

  // 2. validateStructure 테스트
  console.log('2. validateStructure 테스트:');
  const validStructure = {
    acts: [
      {
        act_number: 1,
        act_title: "시작",
        beats: [
          {
            beat_number: 1,
            beat_type: "introduction",
            template: {
              npc_dialogue_template: "안녕",
              narration_template: "인사한다",
              choice_templates: []
            }
          }
        ]
      }
    ]
  };
  const structureResult = validateStructure(validStructure);
  console.log(`검증 결과: ${structureResult.valid ? '성공' : '실패'}`);
  if (!structureResult.valid) {
    console.log('오류:', structureResult.errors);
  }
  console.log(`✓ 테스트 완료\n`);

  // 3. validateBeat 테스트
  console.log('3. validateBeat 테스트:');
  const validBeat = {
    beat_number: 1,
    beat_type: "introduction",
    template: {
      npc_dialogue_template: "${char_name}: 안녕 오빠!",
      narration_template: "${char_name}가 밝게 인사한다.",
      choice_templates: [
        { text_template: "안녕!", affection_range: "medium", tone: "gentle" },
        { text_template: "오 안녕", affection_range: "low", tone: "playful" }
      ],
      emotion_hint: "밝음, 설렘"
    }
  };
  const beatResult = validateBeat(validBeat, "Test Beat");
  console.log(`검증 결과: ${beatResult.valid ? '성공' : '실패'}`);
  if (!beatResult.valid) {
    console.log('오류:', beatResult.errors);
  }
  console.log(`✓ 테스트 완료\n`);

  // 4. validateChoice 테스트
  console.log('4. validateChoice 테스트:');
  const validChoice = {
    text_template: "\"안녕하세요\" 정중하게 인사한다",
    affection_range: "medium",
    tone: "respectful",
    next_beat_hint: "friendly_response"
  };
  const choiceResult = validateChoice(validChoice, "Test Choice");
  console.log(`검증 결과: ${choiceResult.valid ? '성공' : '실패'}`);
  if (!choiceResult.valid) {
    console.log('오류:', choiceResult.errors);
  }

  const invalidChoice = {
    text_template: "A",  // 너무 짧음
    affection_range: "invalid",  // 잘못된 범위
    tone: "invalid_tone"  // 잘못된 톤
  };
  const invalidChoiceResult = validateChoice(invalidChoice, "Invalid Choice");
  console.log(`\n잘못된 선택지 검증: ${invalidChoiceResult.valid ? '성공' : '실패'}`);
  console.log('예상된 오류:', invalidChoiceResult.errors);
  console.log(`✓ 테스트 완료\n`);

  console.log('=== 모든 테스트 완료 ===');
}

// Node.js 환경에서 직접 실행 시 테스트
if (typeof require !== 'undefined' && require.main === module) {
  testScenarioValidator();
}
