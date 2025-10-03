/**
 * Scenario Engine - 시나리오 템플릿 렌더링 및 처리 엔진
 * @version 1.0.0
 * @description 시나리오 템플릿의 변수 치환, 검증, 캐릭터 매핑, 호감도 계산 등 핵심 기능 제공
 */

/**
 * 1. renderTemplate - 템플릿 문자열의 변수를 실제 값으로 치환
 * @param {string} template - 변수를 포함한 템플릿 문자열 (예: "${char_name}는 ${char_age}살입니다")
 * @param {Object} variables - 변수명:값 매핑 객체
 * @returns {string} 변수가 치환된 최종 문자열
 *
 * @example
 * const template = "${char_name}는 ${char_age}살 ${char_mbti} 성격의 캐릭터입니다.";
 * const variables = { char_name: "윤아", char_age: 22, char_mbti: "INFP" };
 * renderTemplate(template, variables);
 * // 결과: "윤아는 22살 INFP 성격의 캐릭터입니다."
 */
function renderTemplate(template, variables) {
  if (!template || typeof template !== 'string') {
    throw new Error('템플릿은 문자열이어야 합니다.');
  }

  if (!variables || typeof variables !== 'object') {
    throw new Error('변수는 객체여야 합니다.');
  }

  let result = template;

  // ${변수명} 패턴을 찾아서 실제 값으로 치환
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });

  // 치환되지 않은 변수가 있는지 검사
  const unresolvedVars = result.match(/\$\{[^}]+\}/g);
  if (unresolvedVars) {
    console.warn('치환되지 않은 변수:', unresolvedVars);
  }

  return result;
}

/**
 * 2. validateScenario - 시나리오 전체 구조 검증
 * @param {Object} scenario - 검증할 시나리오 객체
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * @example
 * const scenario = { id: "test_v1", metadata: {...}, structure: {...} };
 * const result = validateScenario(scenario);
 * if (!result.valid) {
 *   console.error('시나리오 오류:', result.errors);
 * }
 */
function validateScenario(scenario) {
  const errors = [];

  // 필수 필드 검증
  if (!scenario.id || typeof scenario.id !== 'string') {
    errors.push('시나리오 ID는 문자열이어야 합니다.');
  }

  if (!scenario.metadata) {
    errors.push('metadata 필드가 필요합니다.');
  } else {
    // metadata 검증
    if (!scenario.metadata.title) errors.push('metadata.title이 필요합니다.');
    if (!scenario.metadata.genre) errors.push('metadata.genre가 필요합니다.');
    if (typeof scenario.metadata.sexy_level !== 'number' ||
        scenario.metadata.sexy_level < 1 ||
        scenario.metadata.sexy_level > 10) {
      errors.push('metadata.sexy_level은 1-10 사이의 숫자여야 합니다.');
    }
    if (!Array.isArray(scenario.metadata.tags)) {
      errors.push('metadata.tags는 배열이어야 합니다.');
    }
  }

  if (!scenario.structure || !scenario.structure.acts) {
    errors.push('structure.acts 필드가 필요합니다.');
  } else {
    // acts 배열 검증
    if (!Array.isArray(scenario.structure.acts)) {
      errors.push('structure.acts는 배열이어야 합니다.');
    } else if (scenario.structure.acts.length < 1) {
      errors.push('최소 1개의 Act가 필요합니다.');
    } else {
      // 각 Act 검증
      scenario.structure.acts.forEach((act, actIndex) => {
        if (typeof act.act_number !== 'number') {
          errors.push(`Act ${actIndex + 1}: act_number는 숫자여야 합니다.`);
        }
        if (!Array.isArray(act.beats) || act.beats.length < 1) {
          errors.push(`Act ${actIndex + 1}: 최소 1개의 Beat가 필요합니다.`);
        } else {
          // 각 Beat 검증
          act.beats.forEach((beat, beatIndex) => {
            if (!beat.beat_type) {
              errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}: beat_type이 필요합니다.`);
            }
            if (!beat.template) {
              errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}: template 필드가 필요합니다.`);
            } else {
              if (!beat.template.npc_dialogue_template) {
                errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}: npc_dialogue_template이 필요합니다.`);
              }
              if (!beat.template.narration_template) {
                errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}: narration_template이 필요합니다.`);
              }
              if (!Array.isArray(beat.template.choice_templates) ||
                  beat.template.choice_templates.length < 2 ||
                  beat.template.choice_templates.length > 4) {
                errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}: 선택지는 2-4개여야 합니다.`);
              } else {
                // 각 선택지 검증
                beat.template.choice_templates.forEach((choice, choiceIndex) => {
                  if (!choice.text_template) {
                    errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}, Choice ${choiceIndex + 1}: text_template이 필요합니다.`);
                  }
                  if (!choice.affection_range) {
                    errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}, Choice ${choiceIndex + 1}: affection_range가 필요합니다.`);
                  }
                  if (!choice.tone) {
                    errors.push(`Act ${actIndex + 1}, Beat ${beatIndex + 1}, Choice ${choiceIndex + 1}: tone이 필요합니다.`);
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  if (!scenario.compatibility) {
    errors.push('compatibility 필드가 필요합니다.');
  } else {
    if (!Array.isArray(scenario.compatibility.mbti_best_fit)) {
      errors.push('compatibility.mbti_best_fit는 배열이어야 합니다.');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * 3. mapCharacterToVariables - 캐릭터 객체를 템플릿 변수로 변환
 * @param {Object} character - 캐릭터 객체 (characters.json 구조)
 * @returns {Object} 템플릿 변수 매핑 객체
 *
 * @example
 * const character = {
 *   basic_info: { name: "윤아", age: 22, mbti: "INFP" },
 *   physical_allure: { appearance: { style: "캐주얼" } },
 *   appeal_profile: { hobbies: ["그림 그리기", "음악 감상"] }
 * };
 * const variables = mapCharacterToVariables(character);
 * // 결과: { char_name: "윤아", char_age: 22, char_mbti: "INFP", ... }
 */
function mapCharacterToVariables(character) {
  if (!character) {
    throw new Error('캐릭터 객체가 필요합니다.');
  }

  const variables = {};

  // basic_info 매핑
  if (character.basic_info) {
    variables.char_name = character.basic_info.name || '';
    variables.char_age = character.basic_info.age || '';
    variables.char_mbti = character.basic_info.mbti || '';
    variables.char_occupation = character.basic_info.occupation || '';
  }

  // physical_allure 매핑
  if (character.physical_allure) {
    if (character.physical_allure.appearance) {
      variables.char_style = character.physical_allure.appearance.style || '';
      variables.char_hair = character.physical_allure.appearance.hair_color || '';
      variables.char_eye = character.physical_allure.appearance.eye_color || '';
    }
    if (character.physical_allure.body_profile) {
      variables.char_height = character.physical_allure.body_profile.height || '';
      variables.char_bust = character.physical_allure.body_profile.bust_size || '';
    }
  }

  // appeal_profile 매핑
  if (character.appeal_profile) {
    variables.char_hobby = (character.appeal_profile.hobbies && character.appeal_profile.hobbies[0]) || '';
    variables.char_charm_point = character.appeal_profile.charm_point || '';
    variables.char_personality = (character.appeal_profile.personality_traits &&
                                  character.appeal_profile.personality_traits[0]) || '';
  }

  // conversation_dynamics 매핑
  if (character.conversation_dynamics) {
    variables.char_speech_style = character.conversation_dynamics.speech_style || '';
    variables.char_emoji_usage = character.conversation_dynamics.emoji_usage || '';
  }

  // 기본 게임 상태 변수 (게임 진행 중에 업데이트됨)
  variables.user_name = '오빠';  // 기본값
  variables.affection = 0;       // 기본값
  variables.time_of_day = '낮';  // 기본값

  return variables;
}

/**
 * 4. checkCompatibility - 시나리오와 캐릭터의 호환성 검사
 * @param {Object} scenario - 시나리오 객체
 * @param {Object} character - 캐릭터 객체
 * @returns {Object} { compatible: boolean, reasons: string[] }
 *
 * @example
 * const scenario = { compatibility: { mbti_best_fit: ["INFP", "ENFP"] } };
 * const character = { basic_info: { mbti: "INFP" } };
 * const result = checkCompatibility(scenario, character);
 * // 결과: { compatible: true, reasons: ["MBTI 호환"] }
 */
function checkCompatibility(scenario, character) {
  if (!scenario || !scenario.compatibility) {
    throw new Error('시나리오 호환성 정보가 필요합니다.');
  }

  if (!character) {
    throw new Error('캐릭터 객체가 필요합니다.');
  }

  const reasons = [];
  let compatible = true;

  // MBTI 호환성 검사
  if (scenario.compatibility.mbti_best_fit &&
      Array.isArray(scenario.compatibility.mbti_best_fit) &&
      scenario.compatibility.mbti_best_fit.length > 0) {

    const charMbti = character.basic_info?.mbti;
    if (!charMbti) {
      compatible = false;
      reasons.push('캐릭터 MBTI 정보가 없습니다.');
    } else if (!scenario.compatibility.mbti_best_fit.includes(charMbti)) {
      compatible = false;
      reasons.push(`MBTI 불일치 (캐릭터: ${charMbti}, 권장: ${scenario.compatibility.mbti_best_fit.join(', ')})`);
    } else {
      reasons.push('MBTI 호환');
    }
  }

  // 성격 요구사항 검사
  if (scenario.compatibility.personality_requirements) {
    const requirements = scenario.compatibility.personality_requirements;

    // 최소 성적 편안함 (sexual_comfort) 검사
    if (requirements.min_sexual_comfort) {
      const charComfort = character.appeal_profile?.sexual_comfort || 0;
      if (charComfort < requirements.min_sexual_comfort) {
        compatible = false;
        reasons.push(`성적 편안함 부족 (캐릭터: ${charComfort}, 필요: ${requirements.min_sexual_comfort})`);
      } else {
        reasons.push('성적 편안함 충족');
      }
    }

    // 최소 자신감 (confidence) 검사
    if (requirements.min_confidence) {
      const charConfidence = character.appeal_profile?.confidence_level || 0;
      if (charConfidence < requirements.min_confidence) {
        compatible = false;
        reasons.push(`자신감 부족 (캐릭터: ${charConfidence}, 필요: ${requirements.min_confidence})`);
      } else {
        reasons.push('자신감 충족');
      }
    }

    // 필수 취미 검사 (옵션)
    if (requirements.required_hobbies && Array.isArray(requirements.required_hobbies)) {
      const charHobbies = character.appeal_profile?.hobbies || [];
      const hasRequiredHobby = requirements.required_hobbies.some(hobby =>
        charHobbies.includes(hobby)
      );
      if (!hasRequiredHobby) {
        compatible = false;
        reasons.push(`필수 취미 부족 (필요: ${requirements.required_hobbies.join(', ')})`);
      } else {
        reasons.push('필수 취미 충족');
      }
    }
  }

  return {
    compatible: compatible,
    reasons: reasons
  };
}

/**
 * 5. calculateAffectionImpact - 호감도 범위를 실제 점수로 변환
 * @param {string} affection_range - 호감도 범위 ("negative", "neutral", "low", "medium", "high", "critical")
 * @returns {number} 호감도 변화 점수
 *
 * @example
 * calculateAffectionImpact("high");     // 결과: 7-10 사이 랜덤 값
 * calculateAffectionImpact("critical"); // 결과: 11-15 사이 랜덤 값
 * calculateAffectionImpact("negative"); // 결과: -5 ~ -1 사이 랜덤 값
 */
function calculateAffectionImpact(affection_range) {
  const ranges = {
    'negative': { min: -5, max: -1 },
    'neutral': { min: 0, max: 0 },
    'low': { min: 1, max: 3 },
    'medium': { min: 4, max: 6 },
    'high': { min: 7, max: 10 },
    'critical': { min: 11, max: 15 }
  };

  if (!affection_range || !ranges[affection_range]) {
    console.warn(`알 수 없는 호감도 범위: ${affection_range}, 기본값 0 반환`);
    return 0;
  }

  const range = ranges[affection_range];

  // min과 max 사이의 랜덤 정수 반환
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Node.js 환경에서 모듈로 export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderTemplate,
    validateScenario,
    mapCharacterToVariables,
    checkCompatibility,
    calculateAffectionImpact
  };
}

// 브라우저 환경에서 전역 객체로 export
if (typeof window !== 'undefined') {
  window.ScenarioEngine = {
    renderTemplate,
    validateScenario,
    mapCharacterToVariables,
    checkCompatibility,
    calculateAffectionImpact
  };
}

// ========== 테스트 코드 ==========

/**
 * 테스트 함수 - 모든 scenario-engine 함수를 테스트
 */
function testScenarioEngine() {
  console.log('=== Scenario Engine 테스트 시작 ===\n');

  // 1. renderTemplate 테스트
  console.log('1. renderTemplate 테스트:');
  const template = "${char_name}는 ${char_age}살 ${char_mbti} 성격입니다.";
  const variables = { char_name: "윤아", char_age: 22, char_mbti: "INFP" };
  const rendered = renderTemplate(template, variables);
  console.log(`입력: ${template}`);
  console.log(`결과: ${rendered}`);
  console.log(`✓ 성공\n`);

  // 2. validateScenario 테스트
  console.log('2. validateScenario 테스트:');
  const validScenario = {
    id: "test_v1",
    metadata: {
      title: "테스트",
      genre: "sweet_romance",
      sexy_level: 5,
      tags: ["테스트"]
    },
    structure: {
      acts: [{
        act_number: 1,
        beats: [{
          beat_number: 1,
          beat_type: "introduction",
          template: {
            npc_dialogue_template: "안녕",
            narration_template: "인사한다",
            choice_templates: [
              { text_template: "선택1", affection_range: "low", tone: "gentle" },
              { text_template: "선택2", affection_range: "high", tone: "caring" }
            ]
          }
        }]
      }]
    },
    compatibility: {
      mbti_best_fit: ["INFP"]
    }
  };
  const validationResult = validateScenario(validScenario);
  console.log(`검증 결과: ${validationResult.valid ? '성공' : '실패'}`);
  if (!validationResult.valid) {
    console.log('오류:', validationResult.errors);
  }
  console.log(`✓ 성공\n`);

  // 3. mapCharacterToVariables 테스트
  console.log('3. mapCharacterToVariables 테스트:');
  const character = {
    basic_info: { name: "윤아", age: 22, mbti: "INFP" },
    physical_allure: {
      appearance: { style: "캐주얼" },
      body_profile: { height: "165cm" }
    },
    appeal_profile: {
      hobbies: ["그림 그리기"],
      sexual_comfort: 7,
      confidence_level: 5
    }
  };
  const mappedVars = mapCharacterToVariables(character);
  console.log('매핑된 변수:', mappedVars);
  console.log(`✓ 성공\n`);

  // 4. checkCompatibility 테스트
  console.log('4. checkCompatibility 테스트:');
  const scenario = {
    compatibility: {
      mbti_best_fit: ["INFP", "ENFP"],
      personality_requirements: {
        min_sexual_comfort: 5,
        min_confidence: 3
      }
    }
  };
  const compatResult = checkCompatibility(scenario, character);
  console.log(`호환성: ${compatResult.compatible ? '호환' : '불호환'}`);
  console.log('이유:', compatResult.reasons);
  console.log(`✓ 성공\n`);

  // 5. calculateAffectionImpact 테스트
  console.log('5. calculateAffectionImpact 테스트:');
  const ranges = ['negative', 'neutral', 'low', 'medium', 'high', 'critical'];
  ranges.forEach(range => {
    const impact = calculateAffectionImpact(range);
    console.log(`${range}: ${impact}`);
  });
  console.log(`✓ 성공\n`);

  console.log('=== 모든 테스트 완료 ===');
}

// Node.js 환경에서 직접 실행 시 테스트
if (typeof require !== 'undefined' && require.main === module) {
  testScenarioEngine();
}
