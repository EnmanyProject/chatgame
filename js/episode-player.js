/**
 * Episode Player Module
 * @version 1.0.0
 * @description Main episode player logic
 */

let currentScenario = null;
let currentCharacter = null;
let gameState = null;
let isProcessing = false;
let selectedModel = 'claude'; // or 'openai'

/**
 * Start episode
 */
async function startEpisode(scenarioId, characterId, model = 'claude') {
  try {
    console.log('=== 에피소드 시작 ===');
    selectedModel = model;

    // Load scenario
    currentScenario = await fetchScenario(scenarioId);

    // Mock character for now
    currentCharacter = {
      id: characterId,
      basic_info: { name: "윤아", age: 22, mbti: "INFP", occupation: "대학생" },
      personality_traits: ["감성적", "따뜻함"],
      appeal_profile: { charm_points: ["미소"] },
      conversation_dynamics: { speech_style: "부드럽고 따뜻한" },
      photo: "/assets/default-avatar.png"
    };

    // Initialize game state
    gameState = EpisodeFlowManager.initializeGameFlow(currentScenario, currentCharacter);

    // Initialize UI
    initializeUI();

    // Generate first episode
    await generateAndPlayNextEpisode();

  } catch (error) {
    console.error('Start episode error:', error);
    alert('에피소드 시작 실패: ' + error.message);
  }
}

/**
 * Initialize UI
 */
function initializeUI() {
  document.getElementById('character-photo').src = currentCharacter.photo || '/assets/default-avatar.png';
  document.getElementById('character-name').textContent = currentCharacter.basic_info.name;
  document.getElementById('scenario-title').textContent = currentScenario.metadata.title;

  updateUI();
}

/**
 * Generate and play next episode
 */
async function generateAndPlayNextEpisode() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    // Check completion
    if (EpisodeFlowManager.checkScenarioCompletion(currentScenario, gameState)) {
      showScenarioComplete();
      return;
    }

    // Show loading
    showLoading(true);

    // Generate episode via API
    const response = await fetch('/api/episodes?action=generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: currentScenario.id,
        character_id: currentCharacter.id,
        game_state: gameState,
        context: {
          timeOfDay: getCurrentTimeOfDay(),
          model: selectedModel
        }
      })
    });

    const result = await response.json();
    showLoading(false);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Play episode
    await playEpisode(result.episode);

  } catch (error) {
    console.error('Generate episode error:', error);
    showLoading(false);
    alert('에피소드 생성 실패: ' + error.message);
  } finally {
    isProcessing = false;
  }
}

/**
 * Play episode
 */
async function playEpisode(episode) {
  console.log('▶️ 에피소드 재생:', episode.id);

  // 1. Narration
  if (episode.narration) {
    await displayNarration(episode.narration);
    await delay(500);
  }

  // 2. NPC message
  await displayMessage({
    type: 'npc',
    text: episode.dialogue,
    character: currentCharacter
  });

  await delay(300);

  // 3. Choices
  displayChoices(episode.choices);
}

/**
 * Display narration
 */
async function displayNarration(narration) {
  const container = document.getElementById('messages-container');
  const narrationDiv = document.createElement('div');
  narrationDiv.className = 'message-narration';

  container.appendChild(narrationDiv);

  await EpisodeEffects.typewriterEffect(narration, narrationDiv, 30);
  scrollToBottom();
}

/**
 * Display message
 */
async function displayMessage(message) {
  const container = document.getElementById('messages-container');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${message.type}`;

  if (message.type === 'npc') {
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <img src="${message.character.photo || '/assets/default-avatar.png'}" alt="${message.character.basic_info.name}">
      </div>
      <div class="message-bubble">
        <div class="message-text"></div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-bubble user">
        <div class="message-text">${message.text}</div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;
  }

  container.appendChild(messageDiv);
  await EpisodeEffects.fadeInMessage(messageDiv);

  if (message.type === 'npc') {
    const textElement = messageDiv.querySelector('.message-text');
    await EpisodeEffects.typewriterEffect(message.text, textElement, 40);
  }

  scrollToBottom();
}

/**
 * Display choices
 */
function displayChoices(choices) {
  const container = document.getElementById('choices-container');
  container.innerHTML = '';

  choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.className = 'choice-button';
    button.textContent = choice.text;
    button.onclick = () => handleUserChoice(choice);

    if (choice.tone) {
      button.classList.add(`tone-${choice.tone}`);
    }

    container.appendChild(button);
  });

  EpisodeEffects.slideInChoices(container);
}

/**
 * Handle user choice
 */
async function handleUserChoice(choice) {
  if (isProcessing) return;

  console.log('✅ 선택:', choice.text);

  // Hide choices
  document.getElementById('choices-container').innerHTML = '';

  // Show user message
  await displayMessage({
    type: 'user',
    text: choice.text
  });

  await delay(500);

  // Update game state
  gameState = EpisodeFlowManager.processUserChoice(choice, gameState, currentScenario);

  // Add to history
  gameState.conversationHistory.push({
    role: 'user',
    content: choice.text
  });

  // Update UI
  updateUI();

  // Auto save
  saveProgress();

  // Next episode
  await generateAndPlayNextEpisode();
}

/**
 * Update UI
 */
function updateUI() {
  const affection = gameState.affection;
  const affectionPercentage = ((affection + 10) / 110) * 100;
  document.getElementById('affection-fill').style.width = `${affectionPercentage}%`;
  document.getElementById('affection-value').textContent = affection;

  // Affection color
  const affectionFill = document.getElementById('affection-fill');
  if (affection < 20) {
    affectionFill.style.backgroundColor = '#ff6b6b';
  } else if (affection < 50) {
    affectionFill.style.backgroundColor = '#ffd93d';
  } else if (affection < 80) {
    affectionFill.style.backgroundColor = '#6bcf7f';
  } else {
    affectionFill.style.backgroundColor = '#ff69b4';
  }

  // Progress
  const progress = EpisodeFlowManager.calculateProgressPercentage(currentScenario, gameState);
  document.getElementById('progress-fill').style.width = `${progress}%`;
  document.getElementById('progress-percentage').textContent = `${progress}%`;
}

/**
 * Show scenario complete
 */
function showScenarioComplete() {
  const modal = document.getElementById('complete-modal');

  document.getElementById('final-affection').textContent = gameState.affection;
  document.getElementById('total-messages').textContent = gameState.messageCount;

  const playTime = Math.round((Date.now() - new Date(gameState.startedAt)) / 1000 / 60);
  document.getElementById('play-time').textContent = `${playTime}분`;

  modal.style.display = 'flex';
}

/**
 * Save progress
 */
function saveProgress() {
  const saveData = {
    scenario_id: currentScenario.id,
    character_id: currentCharacter.id,
    game_state: gameState,
    saved_at: new Date().toISOString()
  };

  localStorage.setItem('episode_save', JSON.stringify(saveData));
  console.log('💾 진행 상황 저장됨');
}

/**
 * Fetch scenario
 */
async function fetchScenario(scenarioId) {
  const response = await fetch(`/api/scenarios?id=${scenarioId}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error('Failed to load scenario');
  }

  return result.data;
}

/**
 * Utility functions
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCurrentTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return '새벽';
  if (hour < 12) return '아침';
  if (hour < 18) return '오후';
  if (hour < 22) return '저녁';
  return '밤';
}

function showLoading(show) {
  const loading = document.getElementById('loading-indicator');
  if (loading) {
    loading.style.display = show ? 'block' : 'none';
  }
}

function scrollToBottom() {
  const container = document.getElementById('messages-container');
  container.scrollTop = container.scrollHeight;
}

function restartScenario() {
  location.reload();
}

function goToScenarioList() {
  window.location.href = '/scenario-builder.html';
}

function showMenu() {
  alert('메뉴 기능 준비 중');
}

// Export for global use
if (typeof window !== 'undefined') {
  window.startEpisode = startEpisode;
  window.saveProgress = saveProgress;
  window.restartScenario = restartScenario;
  window.goToScenarioList = goToScenarioList;
  window.showMenu = showMenu;
}
