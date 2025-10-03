/**
 * Scenario UI Components
 * @version 1.0.0
 * @description 재사용 가능한 UI 컴포넌트 함수들
 */

/**
 * 1. renderScenarioList - 시나리오 목록 렌더링
 * @param {Array} scenarios - 시나리오 배열
 * @param {string} activeId - 현재 활성화된 시나리오 ID
 * @param {Function} onSelect - 선택 시 콜백
 * @returns {string} HTML 문자열
 */
function renderScenarioList(scenarios, activeId = null, onSelect = null) {
  if (!scenarios || scenarios.length === 0) {
    return '<div class="text-center text-secondary mt-4">시나리오가 없습니다.</div>';
  }

  return scenarios.map(scenario => {
    const isActive = scenario.id === activeId;
    const onClick = onSelect ? `onclick="(${onSelect.toString()})('${scenario.id}')"` : '';

    return `
      <div class="scenario-item ${isActive ? 'active' : ''}" ${onClick}>
        <div class="scenario-title">${scenario.metadata.title}</div>
        <div class="scenario-meta">
          <span class="badge badge-${getSexyLevelColor(scenario.metadata.sexy_level)}">
            Lv ${scenario.metadata.sexy_level}
          </span>
          <span>${scenario.metadata.genre}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 2. renderScenarioCard - 시나리오 카드 렌더링
 * @param {Object} scenario - 시나리오 객체
 * @returns {string} HTML 문자열
 */
function renderScenarioCard(scenario) {
  if (!scenario) {
    return '<div class="card"><div class="card-body">시나리오를 선택하세요</div></div>';
  }

  const meta = scenario.metadata;
  const actCount = scenario.structure?.acts?.length || 0;
  const beatCount = scenario.structure?.acts?.reduce((sum, act) => sum + (act.beats?.length || 0), 0) || 0;

  return `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${meta.title}</h3>
          <div class="scenario-meta mt-1">
            <span class="badge badge-primary">${meta.genre}</span>
            <span class="badge badge-${getSexyLevelColor(meta.sexy_level)}">Sexy Lv ${meta.sexy_level}</span>
          </div>
        </div>
      </div>
      <div class="card-body">
        <p><strong>태그:</strong> ${meta.tags.join(', ')}</p>
        <p><strong>예상 시간:</strong> ${meta.estimated_duration || 'N/A'}</p>
        <p><strong>구조:</strong> ${actCount} Acts, ${beatCount} Beats</p>
        <p><strong>호환 MBTI:</strong> ${scenario.compatibility?.mbti_best_fit?.join(', ') || 'N/A'}</p>
      </div>
    </div>
  `;
}

/**
 * 3. renderMetadataForm - 메타데이터 폼 렌더링
 * @param {Object} metadata - 메타데이터 객체 (편집 시)
 * @returns {string} HTML 문자열
 */
function renderMetadataForm(metadata = {}) {
  const genres = [
    { value: 'sensual_romance', label: '감각적 로맨스' },
    { value: 'sweet_romance', label: '달콤한 로맨스' },
    { value: 'passionate_love', label: '열정적 사랑' },
    { value: 'playful_flirt', label: '장난스러운 썸' },
    { value: 'emotional_connection', label: '감정적 교감' }
  ];

  return `
    <div class="form-group">
      <label class="form-label">시나리오 제목 *</label>
      <input type="text" class="form-input" id="meta-title"
             value="${metadata.title || ''}" placeholder="예: 늦은 밤의 고백">
    </div>

    <div class="form-group">
      <label class="form-label">장르 *</label>
      <select class="form-select" id="meta-genre">
        <option value="">선택하세요</option>
        ${genres.map(g => `
          <option value="${g.value}" ${metadata.genre === g.value ? 'selected' : ''}>
            ${g.label}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">섹시 레벨 (1-10) *</label>
      <input type="number" class="form-input" id="meta-sexy-level"
             value="${metadata.sexy_level || 5}" min="1" max="10">
      <div class="form-hint">1: 순수, 5: 보통, 10: 매우 야함</div>
    </div>

    <div class="form-group">
      <label class="form-label">태그 (쉼표로 구분) *</label>
      <input type="text" class="form-input" id="meta-tags"
             value="${metadata.tags?.join(', ') || ''}" placeholder="예: 술, 고백, 메신저">
    </div>

    <div class="form-group">
      <label class="form-label">예상 시간</label>
      <input type="text" class="form-input" id="meta-duration"
             value="${metadata.estimated_duration || ''}" placeholder="예: 5-7분">
    </div>
  `;
}

/**
 * 4. renderActList - Act 목록 렌더링
 * @param {Array} acts - Act 배열
 * @param {Function} onEditBeat - Beat 편집 콜백
 * @param {Function} onDeleteBeat - Beat 삭제 콜백
 * @returns {string} HTML 문자열
 */
function renderActList(acts = [], onEditBeat = null, onDeleteBeat = null) {
  if (!acts || acts.length === 0) {
    return '<div class="text-center text-secondary mt-4">Act가 없습니다. 추가해주세요.</div>';
  }

  return `
    <div class="act-list">
      ${acts.map((act, actIndex) => `
        <div class="act-item">
          <div class="act-header">
            <div>
              <span class="badge badge-primary">Act ${act.act_number}</span>
              <span class="act-title">${act.act_title || '제목 없음'}</span>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-sm btn-secondary" onclick="editAct(${actIndex})">
                ✏️ 수정
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteAct(${actIndex})">
                🗑️ 삭제
              </button>
            </div>
          </div>
          <div class="beat-list">
            ${act.beats?.map((beat, beatIndex) => `
              <div class="beat-item">
                <div class="beat-header">
                  <div>
                    <span class="badge badge-primary">Beat ${beat.beat_number}</span>
                    <span class="beat-type">${beat.beat_type}</span>
                  </div>
                  <div class="flex gap-1">
                    <button class="btn btn-sm btn-secondary"
                            onclick="(${onEditBeat?.toString() || 'editBeat'})(${actIndex}, ${beatIndex})">
                      ✏️
                    </button>
                    <button class="btn btn-sm btn-danger"
                            onclick="(${onDeleteBeat?.toString() || 'deleteBeat'})(${actIndex}, ${beatIndex})">
                      🗑️
                    </button>
                  </div>
                </div>
                <div class="beat-content">
                  ${beat.template?.npc_dialogue_template?.substring(0, 50) || 'NPC 대사 없음'}...
                </div>
              </div>
            `).join('') || '<div class="text-secondary">Beat가 없습니다</div>'}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * 5. renderBeatForm - Beat 편집 폼 렌더링
 * @param {Object} beat - Beat 객체 (편집 시)
 * @param {number} actIndex - Act 인덱스
 * @param {number} beatIndex - Beat 인덱스 (편집 시)
 * @returns {string} HTML 문자열
 */
function renderBeatForm(beat = {}, actIndex = 0, beatIndex = null) {
  const beatTypes = [
    { value: 'introduction', label: '소개/시작' },
    { value: 'flirtation', label: '작업/설렘' },
    { value: 'confession', label: '고백' },
    { value: 'response', label: '반응/응답' },
    { value: 'escalation', label: '관계 진전' },
    { value: 'resolution', label: '마무리' }
  ];

  return `
    <div class="form-group">
      <label class="form-label">Beat 번호 *</label>
      <input type="number" class="form-input" id="beat-number"
             value="${beat.beat_number || ''}" min="1">
    </div>

    <div class="form-group">
      <label class="form-label">Beat 타입 *</label>
      <select class="form-select" id="beat-type">
        <option value="">선택하세요</option>
        ${beatTypes.map(t => `
          <option value="${t.value}" ${beat.beat_type === t.value ? 'selected' : ''}>
            ${t.label}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">NPC 대사 템플릿 *</label>
      <textarea class="form-textarea" id="beat-npc-dialogue"
                placeholder="\${char_name}: 오빠... 어제 술 마시고 한 말 기억나? 😳">${beat.template?.npc_dialogue_template || ''}</textarea>
      <div class="form-hint">변수: \${char_name}, \${char_age}, \${char_mbti} 등 사용 가능</div>
    </div>

    <div class="form-group">
      <label class="form-label">상황 설명 템플릿 *</label>
      <textarea class="form-textarea" id="beat-narration"
                placeholder="\${char_name}(이)가 부끄러워하며 메시지를 보낸다.">${beat.template?.narration_template || ''}</textarea>
    </div>

    <div class="form-group">
      <label class="form-label">감정 힌트</label>
      <input type="text" class="form-input" id="beat-emotion"
             value="${beat.template?.emotion_hint || ''}"
             placeholder="예: 부끄러움, 설렘, 긴장">
    </div>

    <input type="hidden" id="act-index" value="${actIndex}">
    <input type="hidden" id="beat-index" value="${beatIndex !== null ? beatIndex : ''}">
  `;
}

/**
 * 6. renderChoiceList - 선택지 목록 렌더링
 * @param {Array} choices - 선택지 배열
 * @param {Function} onEdit - 편집 콜백
 * @param {Function} onDelete - 삭제 콜백
 * @returns {string} HTML 문자열
 */
function renderChoiceList(choices = [], onEdit = null, onDelete = null) {
  if (!choices || choices.length === 0) {
    return '<div class="text-center text-secondary mt-2">선택지가 없습니다 (2-4개 필요)</div>';
  }

  const affectionColors = {
    negative: 'danger',
    neutral: 'secondary',
    low: 'warning',
    medium: 'info',
    high: 'success',
    critical: 'primary'
  };

  return `
    <div class="flex flex-col gap-2 mt-2">
      ${choices.map((choice, index) => `
        <div class="card">
          <div class="card-body">
            <div class="flex justify-between items-center mb-2">
              <div class="flex gap-2">
                <span class="badge badge-${affectionColors[choice.affection_range] || 'secondary'}">
                  ${choice.affection_range}
                </span>
                <span class="badge badge-primary">${choice.tone}</span>
              </div>
              <div class="flex gap-1">
                <button class="btn btn-sm btn-secondary"
                        onclick="(${onEdit?.toString() || 'editChoice'})(${index})">
                  ✏️
                </button>
                <button class="btn btn-sm btn-danger"
                        onclick="(${onDelete?.toString() || 'deleteChoice'})(${index})">
                  🗑️
                </button>
              </div>
            </div>
            <div class="text-sm">${choice.text_template}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * 7. showModal - 모달 표시
 * @param {string} title - 모달 제목
 * @param {string} content - 모달 내용 (HTML)
 * @param {Array} buttons - 버튼 배열 [{text, className, onClick}]
 */
function showModal(title, content, buttons = []) {
  const modalHTML = `
    <div class="modal-overlay active" id="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="hideModal()">×</button>
        </div>
        <div class="modal-body" id="modal-body">
          ${content}
        </div>
        <div class="modal-footer" id="modal-footer">
          ${buttons.map(btn => `
            <button class="btn ${btn.className || 'btn-secondary'}"
                    onclick="${btn.onClick || 'hideModal()'}">
              ${btn.text}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // 기존 모달 제거
  const existingModal = document.getElementById('modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  // 새 모달 추가
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // 배경 클릭 시 닫기
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
      hideModal();
    }
  });
}

/**
 * 8. hideModal - 모달 숨김
 */
function hideModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 200);
  }
}

/**
 * 9. showToast - 토스트 알림 표시
 * @param {string} type - 타입 (success, error, warning, info)
 * @param {string} title - 제목
 * @param {string} message - 메시지
 * @param {number} duration - 표시 시간 (ms)
 */
function showToast(type = 'info', title = '', message = '', duration = 3000) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toastHTML = `
    <div class="toast ${type}" id="toast-${Date.now()}">
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    </div>
  `;

  // Toast 컨테이너 확인/생성
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Toast 추가
  const toast = document.createElement('div');
  toast.innerHTML = toastHTML;
  const toastElement = toast.firstElementChild;
  container.appendChild(toastElement);

  // 자동 제거
  setTimeout(() => {
    toastElement.remove();
  }, duration);
}

// ========== 유틸리티 함수 ==========

/**
 * Sexy Level에 따른 색상 반환
 */
function getSexyLevelColor(level) {
  if (level <= 3) return 'success';
  if (level <= 6) return 'warning';
  return 'danger';
}

/**
 * Choice 폼 렌더링
 */
function renderChoiceForm(choice = {}, index = null) {
  const affectionRanges = [
    { value: 'negative', label: '부정적 (-5~-1)' },
    { value: 'neutral', label: '중립 (0)' },
    { value: 'low', label: '낮음 (1-3)' },
    { value: 'medium', label: '보통 (4-6)' },
    { value: 'high', label: '높음 (7-10)' },
    { value: 'critical', label: '결정적 (11-15)' }
  ];

  const tones = [
    { value: 'caring', label: '배려심 있는' },
    { value: 'playful', label: '장난스러운' },
    { value: 'passionate', label: '열정적인' },
    { value: 'respectful', label: '예의 바른' },
    { value: 'bold', label: '대담한' },
    { value: 'gentle', label: '부드러운' }
  ];

  return `
    <div class="form-group">
      <label class="form-label">선택지 텍스트 *</label>
      <textarea class="form-textarea" id="choice-text"
                placeholder='"괜찮다고 다정하게 말해준다"'>${choice.text_template || ''}</textarea>
    </div>

    <div class="form-group">
      <label class="form-label">호감도 범위 *</label>
      <select class="form-select" id="choice-affection">
        ${affectionRanges.map(r => `
          <option value="${r.value}" ${choice.affection_range === r.value ? 'selected' : ''}>
            ${r.label}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">톤 *</label>
      <select class="form-select" id="choice-tone">
        ${tones.map(t => `
          <option value="${t.value}" ${choice.tone === t.value ? 'selected' : ''}>
            ${t.label}
          </option>
        `).join('')}
      </select>
    </div>

    <input type="hidden" id="choice-index" value="${index !== null ? index : ''}">
  `;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ScenarioUIComponents = {
    renderScenarioList,
    renderScenarioCard,
    renderMetadataForm,
    renderActList,
    renderBeatForm,
    renderChoiceList,
    renderChoiceForm,
    showModal,
    hideModal,
    showToast,
    getSexyLevelColor
  };
}
