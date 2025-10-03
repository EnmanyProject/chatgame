/**
 * Scenario Builder - Core Logic
 * @version 1.0.0
 * @description 시나리오 빌더 핵심 로직 (14개 함수)
 */

// Global state
let scenarios = [];
let currentScenario = null;
let currentEditingBeat = null;

// ========== CRUD Operations ==========

/**
 * 1. createScenario - 새 시나리오 생성
 */
async function createScenario() {
  const metadataForm = renderMetadataForm();

  showModal('새 시나리오 생성', metadataForm, [
    { text: '취소', className: 'btn-secondary', onClick: 'hideModal()' },
    { text: '생성', className: 'btn-primary', onClick: 'saveNewScenario()' }
  ]);
}

/**
 * saveNewScenario - 새 시나리오 저장 (createScenario의 헬퍼)
 */
function saveNewScenario() {
  const id = `scenario_${Date.now()}`;
  const title = document.getElementById('meta-title').value;
  const genre = document.getElementById('meta-genre').value;
  const sexyLevel = parseInt(document.getElementById('meta-sexy-level').value);
  const tags = document.getElementById('meta-tags').value.split(',').map(t => t.trim());
  const duration = document.getElementById('meta-duration').value;

  if (!title || !genre) {
    showToast('error', '오류', '필수 항목을 입력해주세요');
    return;
  }

  const newScenario = {
    id,
    metadata: {
      title,
      genre,
      sexy_level: sexyLevel,
      tags,
      estimated_duration: duration
    },
    structure: {
      acts: []
    },
    compatibility: {
      mbti_best_fit: [],
      personality_requirements: {}
    }
  };

  scenarios.push(newScenario);
  currentScenario = newScenario;

  hideModal();
  showToast('success', '생성 완료', `"${title}" 시나리오가 생성되었습니다`);
  refreshUI();
}

/**
 * 2. loadScenario - 시나리오 로드
 * @param {string} scenarioId - 시나리오 ID
 */
function loadScenario(scenarioId) {
  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario) {
    showToast('error', '오류', '시나리오를 찾을 수 없습니다');
    return;
  }

  currentScenario = scenario;
  window.currentScenario = scenario; // 전역 변수로도 저장
  window.currentPreviewActIndex = 0;
  window.currentPreviewBeatIndex = 0;

  refreshUI();
  showToast('info', '로드 완료', `"${scenario.metadata.title}" 로드됨`);
}

/**
 * 3. saveScenario - 현재 시나리오 저장
 */
async function saveScenario() {
  if (!currentScenario) {
    showToast('warning', '경고', '저장할 시나리오가 없습니다');
    return;
  }

  // 검증
  const validation = validateScenario ? validateScenario(currentScenario) : { valid: true };

  if (!validation.valid) {
    showToast('error', '검증 실패', validation.errors.join('<br>'));
    return;
  }

  // 로컬 스토리지 저장
  localStorage.setItem('scenarios', JSON.stringify(scenarios));

  showToast('success', '저장 완료', `"${currentScenario.metadata.title}" 저장됨`);
}

/**
 * 4. deleteScenario - 시나리오 삭제
 * @param {string} scenarioId - 삭제할 시나리오 ID
 */
function deleteScenario(scenarioId) {
  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario) return;

  if (!confirm(`"${scenario.metadata.title}" 시나리오를 삭제하시겠습니까?`)) {
    return;
  }

  scenarios = scenarios.filter(s => s.id !== scenarioId);

  if (currentScenario?.id === scenarioId) {
    currentScenario = null;
    window.currentScenario = null;
  }

  localStorage.setItem('scenarios', JSON.stringify(scenarios));
  refreshUI();
  showToast('success', '삭제 완료', '시나리오가 삭제되었습니다');
}

// ========== Act Management ==========

/**
 * 5. addAct - Act 추가
 */
function addAct() {
  if (!currentScenario) {
    showToast('warning', '경고', '시나리오를 먼저 선택하세요');
    return;
  }

  const actNumber = currentScenario.structure.acts.length + 1;
  const actTitle = prompt('Act 제목을 입력하세요:', `Act ${actNumber}`);

  if (!actTitle) return;

  const newAct = {
    act_number: actNumber,
    act_title: actTitle,
    beats: []
  };

  currentScenario.structure.acts.push(newAct);
  refreshUI();
  showToast('success', 'Act 추가', `Act ${actNumber} "${actTitle}"가 추가되었습니다`);
}

/**
 * 6. editAct - Act 수정
 * @param {number} actIndex - Act 인덱스
 */
function editAct(actIndex) {
  if (!currentScenario) return;

  const act = currentScenario.structure.acts[actIndex];
  if (!act) return;

  const newTitle = prompt('Act 제목 수정:', act.act_title);
  if (newTitle && newTitle !== act.act_title) {
    act.act_title = newTitle;
    refreshUI();
    showToast('success', 'Act 수정', '제목이 수정되었습니다');
  }
}

/**
 * 7. deleteAct - Act 삭제
 * @param {number} actIndex - Act 인덱스
 */
function deleteAct(actIndex) {
  if (!currentScenario) return;

  const act = currentScenario.structure.acts[actIndex];
  if (!act) return;

  if (!confirm(`Act ${act.act_number} "${act.act_title}"를 삭제하시겠습니까?`)) {
    return;
  }

  currentScenario.structure.acts.splice(actIndex, 1);

  // Act 번호 재정렬
  currentScenario.structure.acts.forEach((a, index) => {
    a.act_number = index + 1;
  });

  refreshUI();
  showToast('success', 'Act 삭제', 'Act가 삭제되었습니다');
}

// ========== Beat Management ==========

/**
 * 8. addBeat - Beat 추가
 * @param {number} actIndex - Act 인덱스
 */
function addBeat(actIndex) {
  if (!currentScenario) return;

  const act = currentScenario.structure.acts[actIndex];
  if (!act) return;

  const beatForm = renderBeatForm({}, actIndex);

  showModal(`Act ${act.act_number}에 Beat 추가`, beatForm, [
    { text: '취소', className: 'btn-secondary', onClick: 'hideModal()' },
    { text: '추가', className: 'btn-primary', onClick: 'saveBeat()' }
  ]);
}

/**
 * 9. editBeat - Beat 수정
 * @param {number} actIndex - Act 인덱스
 * @param {number} beatIndex - Beat 인덱스
 */
function editBeat(actIndex, beatIndex) {
  if (!currentScenario) return;

  const act = currentScenario.structure.acts[actIndex];
  if (!act) return;

  const beat = act.beats[beatIndex];
  if (!beat) return;

  currentEditingBeat = { actIndex, beatIndex };

  const beatForm = renderBeatForm(beat, actIndex, beatIndex);

  showModal(`Beat ${beat.beat_number} 수정`, beatForm, [
    { text: '취소', className: 'btn-secondary', onClick: 'hideModal()' },
    { text: '저장', className: 'btn-primary', onClick: 'saveBeat()' }
  ]);
}

/**
 * saveBeat - Beat 저장 (addBeat/editBeat의 헬퍼)
 */
function saveBeat() {
  const beatNumber = parseInt(document.getElementById('beat-number').value);
  const beatType = document.getElementById('beat-type').value;
  const npcDialogue = document.getElementById('beat-npc-dialogue').value;
  const narration = document.getElementById('beat-narration').value;
  const emotion = document.getElementById('beat-emotion').value;
  const actIndex = parseInt(document.getElementById('act-index').value);
  const beatIndexInput = document.getElementById('beat-index').value;

  if (!beatNumber || !beatType || !npcDialogue || !narration) {
    showToast('error', '오류', '필수 항목을 입력해주세요');
    return;
  }

  const beatData = {
    beat_number: beatNumber,
    beat_type: beatType,
    template: {
      npc_dialogue_template: npcDialogue,
      narration_template: narration,
      choice_templates: [],
      emotion_hint: emotion
    }
  };

  const act = currentScenario.structure.acts[actIndex];

  if (beatIndexInput === '') {
    // 새 Beat 추가
    act.beats.push(beatData);
    showToast('success', 'Beat 추가', 'Beat가 추가되었습니다');
  } else {
    // 기존 Beat 수정
    const beatIndex = parseInt(beatIndexInput);
    act.beats[beatIndex] = beatData;
    showToast('success', 'Beat 수정', 'Beat가 수정되었습니다');
  }

  currentEditingBeat = null;
  hideModal();
  refreshUI();
}

/**
 * 10. deleteBeat - Beat 삭제
 * @param {number} actIndex - Act 인덱스
 * @param {number} beatIndex - Beat 인덱스
 */
function deleteBeat(actIndex, beatIndex) {
  if (!currentScenario) return;

  const act = currentScenario.structure.acts[actIndex];
  if (!act) return;

  const beat = act.beats[beatIndex];
  if (!beat) return;

  if (!confirm(`Beat ${beat.beat_number} (${beat.beat_type})를 삭제하시겠습니까?`)) {
    return;
  }

  act.beats.splice(beatIndex, 1);
  refreshUI();
  showToast('success', 'Beat 삭제', 'Beat가 삭제되었습니다');
}

// ========== Choice Management ==========

/**
 * 11. addChoice - 선택지 추가
 * @param {number} actIndex - Act 인덱스
 * @param {number} beatIndex - Beat 인덱스
 */
function addChoice(actIndex, beatIndex) {
  if (!currentScenario) return;

  const beat = currentScenario.structure.acts[actIndex]?.beats[beatIndex];
  if (!beat) return;

  if (beat.template.choice_templates.length >= 4) {
    showToast('warning', '경고', '선택지는 최대 4개까지 추가할 수 있습니다');
    return;
  }

  const choiceForm = renderChoiceForm();

  showModal('선택지 추가', choiceForm, [
    { text: '취소', className: 'btn-secondary', onClick: 'hideModal()' },
    { text: '추가', className: 'btn-primary', onClick: `saveChoice(${actIndex}, ${beatIndex})` }
  ]);
}

/**
 * 12. updateChoice - 선택지 수정
 * @param {number} actIndex - Act 인덱스
 * @param {number} beatIndex - Beat 인덱스
 * @param {number} choiceIndex - 선택지 인덱스
 */
function updateChoice(actIndex, beatIndex, choiceIndex) {
  if (!currentScenario) return;

  const beat = currentScenario.structure.acts[actIndex]?.beats[beatIndex];
  if (!beat) return;

  const choice = beat.template.choice_templates[choiceIndex];
  if (!choice) return;

  const choiceForm = renderChoiceForm(choice, choiceIndex);

  showModal('선택지 수정', choiceForm, [
    { text: '취소', className: 'btn-secondary', onClick: 'hideModal()' },
    { text: '저장', className: 'btn-primary', onClick: `saveChoice(${actIndex}, ${beatIndex})` }
  ]);
}

/**
 * saveChoice - 선택지 저장 (addChoice/updateChoice의 헬퍼)
 */
function saveChoice(actIndex, beatIndex) {
  const text = document.getElementById('choice-text').value;
  const affection = document.getElementById('choice-affection').value;
  const tone = document.getElementById('choice-tone').value;
  const choiceIndexInput = document.getElementById('choice-index').value;

  if (!text || !affection || !tone) {
    showToast('error', '오류', '필수 항목을 입력해주세요');
    return;
  }

  const choiceData = {
    text_template: text,
    affection_range: affection,
    tone: tone
  };

  const beat = currentScenario.structure.acts[actIndex].beats[beatIndex];

  if (choiceIndexInput === '') {
    // 새 선택지 추가
    beat.template.choice_templates.push(choiceData);
    showToast('success', '선택지 추가', '선택지가 추가되었습니다');
  } else {
    // 기존 선택지 수정
    const choiceIndex = parseInt(choiceIndexInput);
    beat.template.choice_templates[choiceIndex] = choiceData;
    showToast('success', '선택지 수정', '선택지가 수정되었습니다');
  }

  hideModal();
  refreshUI();
}

/**
 * 13. deleteChoice - 선택지 삭제
 * @param {number} actIndex - Act 인덱스
 * @param {number} beatIndex - Beat 인덱스
 * @param {number} choiceIndex - 선택지 인덱스
 */
function deleteChoice(actIndex, beatIndex, choiceIndex) {
  if (!currentScenario) return;

  const beat = currentScenario.structure.acts[actIndex]?.beats[beatIndex];
  if (!beat) return;

  if (beat.template.choice_templates.length <= 2) {
    showToast('warning', '경고', '선택지는 최소 2개가 필요합니다');
    return;
  }

  if (!confirm('이 선택지를 삭제하시겠습니까?')) {
    return;
  }

  beat.template.choice_templates.splice(choiceIndex, 1);
  refreshUI();
  showToast('success', '선택지 삭제', '선택지가 삭제되었습니다');
}

// ========== Export/Import/Test ==========

/**
 * 14. exportScenario - 시나리오 내보내기 (JSON)
 */
function exportScenario() {
  if (!currentScenario) {
    showToast('warning', '경고', '내보낼 시나리오가 없습니다');
    return;
  }

  const dataStr = JSON.stringify(currentScenario, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `${currentScenario.id}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();

  showToast('success', '내보내기 완료', `${exportFileDefaultName} 다운로드됨`);
}

/**
 * importScenario - 시나리오 가져오기
 */
function importScenario() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const scenario = JSON.parse(event.target.result);

        // 검증
        const validation = validateScenario ? validateScenario(scenario) : { valid: true };

        if (!validation.valid) {
          showToast('error', '검증 실패', validation.errors.join('<br>'));
          return;
        }

        scenarios.push(scenario);
        currentScenario = scenario;
        window.currentScenario = scenario;

        localStorage.setItem('scenarios', JSON.stringify(scenarios));
        refreshUI();
        showToast('success', '가져오기 완료', `"${scenario.metadata.title}" 가져옴`);
      } catch (error) {
        showToast('error', '오류', '잘못된 JSON 파일입니다');
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

/**
 * testScenario - 시나리오 테스트
 */
function testScenario() {
  if (!currentScenario) {
    showToast('warning', '경고', '테스트할 시나리오가 없습니다');
    return;
  }

  // Get selected AI model
  const modelSelector = document.getElementById('ai-model-selector');
  const selectedModel = modelSelector ? modelSelector.value : 'claude';

  // Mock character for testing
  const testCharacter = {
    id: 'test_character',
    basic_info: { name: "테스트 캐릭터", age: 22, mbti: "INFP" },
    personality_traits: ["감성적", "따뜻함"],
    appeal_profile: { charm_points: ["미소"] },
    conversation_dynamics: { speech_style: "부드럽고 따뜻한" },
    photo: "/assets/default-avatar.png"
  };

  // Open episode player with scenario, character, and model
  const playerUrl = `episode-player-test.html?scenario=${currentScenario.id}&character=${testCharacter.id}&model=${selectedModel}`;
  localStorage.setItem('test-scenario', JSON.stringify(currentScenario));
  localStorage.setItem('test-character', JSON.stringify(testCharacter));
  window.open(playerUrl, '_blank');

  const modelNames = {
    'claude': 'Claude 3.5 Sonnet',
    'openai': 'OpenAI GPT-4',
    'llama': 'Llama 3.1 (Groq)'
  };
  showToast('info', '테스트 시작', `${modelNames[selectedModel] || selectedModel} 모델로 테스트를 시작합니다`);
}

// ========== UI Refresh ==========

/**
 * refreshUI - 전체 UI 새로고침
 */
function refreshUI() {
  // 시나리오 목록 업데이트
  const listContainer = document.getElementById('scenario-list');
  if (listContainer) {
    listContainer.innerHTML = renderScenarioList(
      scenarios,
      currentScenario?.id,
      loadScenario
    );
  }

  // 편집 영역 업데이트
  if (currentScenario) {
    updateEditorContent();
    updatePreview(currentScenario, window.currentPreviewActIndex || 0, window.currentPreviewBeatIndex || 0);
  } else {
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
      previewContainer.innerHTML = renderEmptyPreview();
    }
  }
}

/**
 * updateEditorContent - 편집 영역 업데이트
 */
function updateEditorContent() {
  if (!currentScenario) return;

  // 메타데이터 탭
  const metaTab = document.getElementById('tab-metadata');
  if (metaTab) {
    metaTab.innerHTML = `
      ${renderScenarioCard(currentScenario)}
      <button class="btn btn-primary mt-3" onclick="editMetadata()">
        ✏️ 메타데이터 수정
      </button>
    `;
  }

  // 구조 탭
  const structureTab = document.getElementById('tab-structure');
  if (structureTab) {
    structureTab.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <h3>Acts & Beats</h3>
        <button class="btn btn-primary" onclick="addAct()">+ Act 추가</button>
      </div>
      ${renderActList(currentScenario.structure.acts, editBeat, deleteBeat)}
    `;
  }

  // 호환성 탭
  const compatTab = document.getElementById('tab-compatibility');
  if (compatTab) {
    compatTab.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">호환성 설정</h3>
        </div>
        <div class="card-body">
          <p><strong>권장 MBTI:</strong> ${currentScenario.compatibility?.mbti_best_fit?.join(', ') || '없음'}</p>
          <p><strong>최소 성적 편안함:</strong> ${currentScenario.compatibility?.personality_requirements?.min_sexual_comfort || 'N/A'}</p>
          <p><strong>최소 자신감:</strong> ${currentScenario.compatibility?.personality_requirements?.min_confidence || 'N/A'}</p>
        </div>
      </div>
    `;
  }
}

/**
 * editMetadata - 메타데이터 수정
 */
function editMetadata() {
  if (!currentScenario) return;

  const metadataForm = renderMetadataForm(currentScenario.metadata);

  showModal('메타데이터 수정', metadataForm, [
    { text: '취소', className: 'btn-secondary', onClick: 'hideModal()' },
    { text: '저장', className: 'btn-primary', onClick: 'saveMetadataChanges()' }
  ]);
}

/**
 * saveMetadataChanges - 메타데이터 변경사항 저장
 */
function saveMetadataChanges() {
  const title = document.getElementById('meta-title').value;
  const genre = document.getElementById('meta-genre').value;
  const sexyLevel = parseInt(document.getElementById('meta-sexy-level').value);
  const tags = document.getElementById('meta-tags').value.split(',').map(t => t.trim());
  const duration = document.getElementById('meta-duration').value;

  if (!title || !genre) {
    showToast('error', '오류', '필수 항목을 입력해주세요');
    return;
  }

  currentScenario.metadata = {
    title,
    genre,
    sexy_level: sexyLevel,
    tags,
    estimated_duration: duration
  };

  hideModal();
  refreshUI();
  showToast('success', '수정 완료', '메타데이터가 수정되었습니다');
}

// ========== Tab Switching ==========

/**
 * switchTab - 탭 전환
 * @param {string} tabName - 탭 이름
 */
function switchTab(tabName) {
  // 모든 탭 버튼 비활성화
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // 모든 탭 패널 숨김
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // 선택된 탭 활성화
  const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  const selectedPanel = document.getElementById(`tab-${tabName}`);
  if (selectedPanel) {
    selectedPanel.classList.add('active');
  }
}

// ========== Initialization ==========

/**
 * initializeBuilder - 빌더 초기화
 */
function initializeBuilder() {
  // 로컬 스토리지에서 시나리오 로드
  const savedScenarios = localStorage.getItem('scenarios');
  if (savedScenarios) {
    try {
      scenarios = JSON.parse(savedScenarios);
    } catch (e) {
      console.error('Failed to load scenarios:', e);
    }
  }

  // 샘플 시나리오 로드 (첫 실행 시)
  if (scenarios.length === 0) {
    loadSampleScenarios();
  }

  refreshUI();
}

/**
 * loadSampleScenarios - 샘플 시나리오 로드
 */
async function loadSampleScenarios() {
  const sampleFiles = [
    'data/scenarios/sample-late-night-confession.json',
    'data/scenarios/sample-morning-after.json',
    'data/scenarios/sample-date-planning.json'
  ];

  for (const file of sampleFiles) {
    try {
      const response = await fetch(file);
      const scenario = await response.json();
      scenarios.push(scenario);
    } catch (e) {
      console.warn(`Failed to load ${file}:`, e);
    }
  }

  localStorage.setItem('scenarios', JSON.stringify(scenarios));
  refreshUI();
}

// Export for global use
if (typeof window !== 'undefined') {
  window.createScenario = createScenario;
  window.loadScenario = loadScenario;
  window.saveScenario = saveScenario;
  window.deleteScenario = deleteScenario;
  window.addAct = addAct;
  window.editAct = editAct;
  window.deleteAct = deleteAct;
  window.addBeat = addBeat;
  window.editBeat = editBeat;
  window.deleteBeat = deleteBeat;
  window.addChoice = addChoice;
  window.updateChoice = updateChoice;
  window.deleteChoice = deleteChoice;
  window.exportScenario = exportScenario;
  window.importScenario = importScenario;
  window.testScenario = testScenario;
  window.switchTab = switchTab;
  window.initializeBuilder = initializeBuilder;
  window.editMetadata = editMetadata;
  window.saveMetadataChanges = saveMetadataChanges;
  window.saveNewScenario = saveNewScenario;
  window.saveBeat = saveBeat;
  window.saveChoice = saveChoice;
}
