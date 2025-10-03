/**
 * Episode Flow Manager Module
 * @version 1.0.0
 * @description Game flow management and progression logic
 */

/**
 * Initialize game flow
 */
function initializeGameFlow(scenario, character) {
  return {
    scenario_id: scenario.id,
    character_id: character.id,
    current_act: 1,
    current_beat: 0,
    beat_progress: 0,
    affection: 0,
    messageCount: 0,
    emotionalPhase: 'shy',
    relationshipStage: 'acquaintances',
    conversationHistory: [],
    previousChoices: [],
    flags: {},
    startedAt: new Date().toISOString()
  };
}

/**
 * Process user choice
 */
function processUserChoice(choice, currentState, scenario) {
  // 호감도 업데이트
  const newAffection = Math.max(-10, Math.min(100,
    currentState.affection + (choice.affection_impact || 0)
  ));

  // 메시지 카운트 증가
  const newMessageCount = currentState.messageCount + 1;

  // 감정 단계 업데이트
  const newEmotionalPhase = getEmotionalPhase(newMessageCount);

  // 선택 히스토리 추가
  const newChoices = [
    ...currentState.previousChoices,
    {
      choice_id: choice.id,
      text: choice.text,
      affection_impact: choice.affection_impact,
      timestamp: new Date().toISOString()
    }
  ];

  // 다음 Beat 결정
  const nextBeatInfo = getNextBeat(currentState, choice, scenario);

  return {
    ...currentState,
    affection: newAffection,
    messageCount: newMessageCount,
    emotionalPhase: newEmotionalPhase,
    previousChoices: newChoices,
    current_act: nextBeatInfo.act,
    beat_progress: nextBeatInfo.beatProgress
  };
}

/**
 * Get next beat
 */
function getNextBeat(currentState, choice, scenario) {
  // leads_to가 지정된 경우
  if (choice.leads_to) {
    return parseLeadsTo(choice.leads_to);
  }

  // 기본: 다음 Beat로 진행
  const currentAct = scenario.structure.acts.find(a =>
    a.act_number === currentState.current_act
  );

  const nextBeatProgress = currentState.beat_progress + 1;

  // Beat가 남아있으면 진행
  if (nextBeatProgress < currentAct.beats.length) {
    return {
      act: currentState.current_act,
      beatProgress: nextBeatProgress
    };
  }

  // 다음 Act로 이동
  const nextActNumber = currentState.current_act + 1;
  if (nextActNumber <= scenario.structure.acts.length) {
    return {
      act: nextActNumber,
      beatProgress: 0
    };
  }

  // 시나리오 완료
  return {
    act: currentState.current_act,
    beatProgress: currentState.beat_progress,
    completed: true
  };
}

/**
 * Handle branching point
 */
function handleBranchingPoint(branchPoint, state) {
  for (const branch of branchPoint.branches) {
    if (evaluateCondition(branch.condition, state)) {
      return parseLeadsTo(branch.next_beat);
    }
  }

  // 기본 분기
  return null;
}

/**
 * Evaluate condition
 */
function evaluateCondition(condition, state) {
  try {
    const func = new Function('state', `return ${condition}`);
    return func(state);
  } catch {
    return false;
  }
}

/**
 * Parse leads_to
 */
function parseLeadsTo(leadsTo) {
  // 형식: "act2_beat1" 또는 "2.1"
  const match = leadsTo.match(/act(\d+)_beat(\d+)/) ||
                leadsTo.match(/(\d+)\.(\d+)/);

  if (match) {
    return {
      act: parseInt(match[1]),
      beatProgress: parseInt(match[2]) - 1
    };
  }

  return null;
}

/**
 * Check scenario completion
 */
function checkScenarioCompletion(scenario, state) {
  const lastAct = scenario.structure.acts[scenario.structure.acts.length - 1];
  const lastBeatIndex = lastAct.beats.length - 1;

  return state.current_act === lastAct.act_number &&
         state.beat_progress >= lastBeatIndex;
}

/**
 * Calculate progress percentage
 */
function calculateProgressPercentage(scenario, state) {
  let totalBeats = 0;
  let completedBeats = 0;

  for (const act of scenario.structure.acts) {
    totalBeats += act.beats.length;

    if (act.act_number < state.current_act) {
      completedBeats += act.beats.length;
    } else if (act.act_number === state.current_act) {
      completedBeats += state.beat_progress;
    }
  }

  return Math.round((completedBeats / totalBeats) * 100);
}

/**
 * Get emotional phase
 */
function getEmotionalPhase(messageCount) {
  if (messageCount <= 2) return 'shy';
  if (messageCount <= 5) return 'honest';
  return 'relief';
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeGameFlow,
    processUserChoice,
    getNextBeat,
    handleBranchingPoint,
    checkScenarioCompletion,
    calculateProgressPercentage
  };
}

// Browser export
if (typeof window !== 'undefined') {
  window.EpisodeFlowManager = {
    initializeGameFlow,
    processUserChoice,
    getNextBeat,
    handleBranchingPoint,
    checkScenarioCompletion,
    calculateProgressPercentage
  };
}
