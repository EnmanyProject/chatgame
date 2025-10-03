/**
 * Scenario Preview Module
 * @version 1.0.0
 * @description 실시간 시나리오 미리보기 및 폰 목업 렌더링
 */

// Import ScenarioEngine if in browser
if (typeof window !== 'undefined' && window.ScenarioEngine) {
  var { renderTemplate, mapCharacterToVariables } = window.ScenarioEngine;
}

/**
 * 샘플 캐릭터 데이터
 */
const SAMPLE_CHARACTER = {
  basic_info: {
    name: "윤아",
    age: 22,
    mbti: "INFP",
    occupation: "대학생"
  },
  physical_allure: {
    appearance: {
      style: "캐주얼",
      hair_color: "갈색",
      eye_color: "갈색"
    },
    body_profile: {
      height: "165cm",
      bust_size: "C컵"
    }
  },
  appeal_profile: {
    hobbies: ["그림 그리기", "음악 감상"],
    charm_point: "미소",
    personality_traits: ["따뜻함", "감성적"],
    sexual_comfort: 6,
    confidence_level: 5
  },
  conversation_dynamics: {
    speech_style: "부드럽고 따뜻한",
    emoji_usage: "moderate"
  }
};

/**
 * renderPreview - 실시간 미리보기 렌더링
 * @param {Object} scenario - 시나리오 객체
 * @param {Object} character - 캐릭터 객체 (기본: SAMPLE_CHARACTER)
 * @param {number} actIndex - 미리보기할 Act 인덱스 (기본: 0)
 * @param {number} beatIndex - 미리보기할 Beat 인덱스 (기본: 0)
 * @returns {string} HTML 문자열
 */
function renderPreview(scenario, character = SAMPLE_CHARACTER, actIndex = 0, beatIndex = 0) {
  if (!scenario || !scenario.structure || !scenario.structure.acts) {
    return renderEmptyPreview();
  }

  const act = scenario.structure.acts[actIndex];
  if (!act || !act.beats || !act.beats[beatIndex]) {
    return renderEmptyPreview();
  }

  const beat = act.beats[beatIndex];

  // 캐릭터를 변수로 매핑
  const variables = mapCharacterToVariables ?
    mapCharacterToVariables(character) :
    getDefaultVariables(character);

  // 템플릿 렌더링
  const npcDialogue = renderTemplate ?
    renderTemplate(beat.template.npc_dialogue_template, variables) :
    beat.template.npc_dialogue_template;

  const narration = renderTemplate ?
    renderTemplate(beat.template.narration_template, variables) :
    beat.template.narration_template;

  const choices = beat.template.choice_templates.map(choice => {
    const text = renderTemplate ?
      renderTemplate(choice.text_template, variables) :
      choice.text_template;

    return {
      text,
      affection_range: choice.affection_range,
      tone: choice.tone
    };
  });

  return renderPhoneMockup(npcDialogue, narration, choices, scenario.metadata);
}

/**
 * renderPhoneMockup - 폰 UI 목업 렌더링
 * @param {string} npcDialogue - NPC 대사
 * @param {string} narration - 상황 설명
 * @param {Array} choices - 선택지 배열
 * @param {Object} metadata - 시나리오 메타데이터
 * @returns {string} HTML 문자열
 */
function renderPhoneMockup(npcDialogue, narration, choices, metadata = {}) {
  return `
    <div class="phone-mockup">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        <div class="phone-content">
          <!-- 시나리오 정보 -->
          <div style="text-align: center; margin-bottom: 16px; padding: 8px; background: rgba(255,255,255,0.9); border-radius: 8px;">
            <div style="font-size: 12px; font-weight: 600; color: #6366f1;">
              ${metadata.title || '시나리오 미리보기'}
            </div>
            <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">
              ${metadata.genre || ''} • Sexy Lv ${metadata.sexy_level || 'N/A'}
            </div>
          </div>

          <!-- 상황 설명 -->
          ${narration ? `
            <div class="chat-narration">
              ${narration}
            </div>
          ` : ''}

          <!-- NPC 메시지 -->
          <div class="chat-message" style="background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 14px; line-height: 1.6;">
              ${npcDialogue || 'NPC 대사가 표시됩니다'}
            </div>
          </div>

          <!-- 선택지 -->
          ${choices && choices.length > 0 ? `
            <div class="chat-choices">
              ${choices.map((choice, index) => {
                const affectionColors = {
                  negative: '#ef4444',
                  neutral: '#6b7280',
                  low: '#f59e0b',
                  medium: '#3b82f6',
                  high: '#10b981',
                  critical: '#8b5cf6'
                };
                const color = affectionColors[choice.affection_range] || '#6b7280';

                return `
                  <button class="choice-button" style="border-left: 3px solid ${color};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="flex: 1; font-size: 13px;">${choice.text}</span>
                      <span style="font-size: 10px; color: ${color}; font-weight: 600; margin-left: 8px;">
                        ${choice.affection_range}
                      </span>
                    </div>
                    <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">
                      톤: ${choice.tone}
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- 미리보기 컨트롤 -->
    <div style="margin-top: 16px; text-align: center;">
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
        실시간 미리보기
      </div>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <button class="btn btn-sm btn-secondary" onclick="previewPrevBeat()">
          ← 이전
        </button>
        <button class="btn btn-sm btn-secondary" onclick="previewNextBeat()">
          다음 →
        </button>
      </div>
    </div>
  `;
}

/**
 * renderEmptyPreview - 빈 미리보기 렌더링
 * @returns {string} HTML 문자열
 */
function renderEmptyPreview() {
  return `
    <div style="text-align: center; padding: 48px 16px; color: #6b7280;">
      <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
        미리보기 준비 중
      </div>
      <div style="font-size: 14px;">
        시나리오를 선택하거나<br>
        Beat를 추가해주세요
      </div>
    </div>
  `;
}

/**
 * testWithSampleCharacter - 샘플 캐릭터로 테스트
 * @param {Object} scenario - 시나리오 객체
 * @param {HTMLElement} container - 렌더링할 컨테이너
 */
function testWithSampleCharacter(scenario, container) {
  if (!container) {
    console.error('Container element not found');
    return;
  }

  const previewHTML = renderPreview(scenario, SAMPLE_CHARACTER, 0, 0);
  container.innerHTML = previewHTML;
}

/**
 * updatePreview - 미리보기 업데이트
 * @param {Object} scenario - 시나리오 객체
 * @param {number} actIndex - Act 인덱스
 * @param {number} beatIndex - Beat 인덱스
 */
function updatePreview(scenario, actIndex = 0, beatIndex = 0) {
  const previewContainer = document.getElementById('preview-container');
  if (!previewContainer) return;

  const previewHTML = renderPreview(scenario, SAMPLE_CHARACTER, actIndex, beatIndex);
  previewContainer.innerHTML = previewHTML;
}

/**
 * 기본 변수 매핑 (ScenarioEngine이 없을 때 사용)
 */
function getDefaultVariables(character) {
  return {
    char_name: character.basic_info?.name || '캐릭터',
    char_age: character.basic_info?.age || 20,
    char_mbti: character.basic_info?.mbti || 'INFP',
    char_occupation: character.basic_info?.occupation || '대학생',
    char_style: character.physical_allure?.appearance?.style || '캐주얼',
    char_hobby: character.appeal_profile?.hobbies?.[0] || '취미',
    user_name: '오빠',
    affection: 0,
    time_of_day: '낮'
  };
}

/**
 * previewPrevBeat - 이전 Beat 미리보기
 */
function previewPrevBeat() {
  if (window.currentPreviewBeatIndex > 0) {
    window.currentPreviewBeatIndex--;
    updateCurrentPreview();
  }
}

/**
 * previewNextBeat - 다음 Beat 미리보기
 */
function previewNextBeat() {
  const scenario = window.currentScenario;
  if (!scenario) return;

  const currentAct = scenario.structure.acts[window.currentPreviewActIndex || 0];
  if (!currentAct) return;

  if ((window.currentPreviewBeatIndex || 0) < currentAct.beats.length - 1) {
    window.currentPreviewBeatIndex = (window.currentPreviewBeatIndex || 0) + 1;
    updateCurrentPreview();
  }
}

/**
 * updateCurrentPreview - 현재 상태로 미리보기 업데이트
 */
function updateCurrentPreview() {
  if (!window.currentScenario) return;

  updatePreview(
    window.currentScenario,
    window.currentPreviewActIndex || 0,
    window.currentPreviewBeatIndex || 0
  );
}

/**
 * 전역 미리보기 상태 초기화
 */
if (typeof window !== 'undefined') {
  window.currentPreviewActIndex = 0;
  window.currentPreviewBeatIndex = 0;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ScenarioPreview = {
    renderPreview,
    renderPhoneMockup,
    renderEmptyPreview,
    testWithSampleCharacter,
    updatePreview,
    previewPrevBeat,
    previewNextBeat,
    SAMPLE_CHARACTER
  };
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderPreview,
    renderPhoneMockup,
    renderEmptyPreview,
    testWithSampleCharacter,
    updatePreview,
    SAMPLE_CHARACTER
  };
}
