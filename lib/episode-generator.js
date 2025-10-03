/**
 * Episode Generator Module
 * @version 1.0.0
 * @description Episode generation engine combining templates and AI
 */

const { renderTemplate, mapCharacterToVariables, checkCompatibility, calculateAffectionImpact } = require('./scenario-engine');
const { callAIAPI, buildSystemPrompt, buildUserPrompt, parseAIResponse } = require('./claude-api-client');
const { getCachedEpisode, setCachedEpisode, generateEpisodeKey } = require('./episode-cache');

/**
 * Generate episode
 * @param {object} scenario - Scenario data
 * @param {object} character - Character data
 * @param {object} gameState - Game state
 * @param {object} context - Additional context
 * @returns {Promise<object>} Generated episode
 */
async function generateEpisode(scenario, character, gameState, context = {}) {
  console.log('=== 에피소드 생성 시작 ===');
  console.log(`시나리오: ${scenario.metadata.title}`);
  console.log(`캐릭터: ${character.basic_info.name}`);

  try {
    // 1. 호환성 확인
    const compatibility = checkCompatibility(scenario, character);
    if (!compatibility.compatible) {
      throw new Error('캐릭터와 시나리오가 호환되지 않습니다');
    }

    // 2. 현재 Act 및 Beat 결정
    const currentAct = determineCurrentAct(scenario, gameState);
    const currentBeat = determineCurrentBeat(currentAct, gameState);

    console.log(`현재 위치: Act ${currentAct.act_number}, Beat ${currentBeat.beat_number}`);

    // 3. 캐시 확인
    const cacheKey = generateEpisodeKey(scenario, currentBeat, gameState);
    const cached = getCachedEpisode(cacheKey);
    if (cached) {
      console.log('📦 캐시된 에피소드 사용');
      return cached;
    }

    // 4. 변수 통합
    const charVariables = mapCharacterToVariables(character);
    const stateVariables = mapGameStateToVariables(gameState);
    const contextVariables = mapContextToVariables(context);
    const allVariables = {
      ...charVariables,
      ...stateVariables,
      ...contextVariables
    };

    // 5. Beat 템플릿 렌더링
    const renderedBeat = renderBeatTemplate(currentBeat, allVariables);

    // 6. AI 대화 생성 여부 결정
    const useAI = shouldUseAI(scenario, character, gameState);

    let finalDialogue;
    if (useAI) {
      console.log('🤖 AI 대화 생성 시도...');
      try {
        finalDialogue = await generateAIDialogue(
          renderedBeat,
          character,
          scenario,
          gameState,
          context.model || 'claude'
        );
      } catch (error) {
        console.warn('AI 생성 실패, Fallback 사용:', error.message);
        finalDialogue = generateFallbackDialogue(renderedBeat, allVariables);
      }
    } else {
      console.log('📝 템플릿 기반 대화 사용');
      finalDialogue = renderedBeat;
    }

    // 7. 에피소드 객체 생성
    const episode = {
      id: `episode_${Date.now()}`,
      scenario_id: scenario.id,
      character_id: character.id,
      act_number: currentAct.act_number,
      beat_number: currentBeat.beat_number,
      timestamp: new Date().toISOString(),

      // 대화 내용
      dialogue: finalDialogue.dialogue,
      narration: finalDialogue.narration,
      choices: finalDialogue.choices.map((choice, index) => ({
        id: `${currentBeat.beat_number}_choice_${index}`,
        text: choice.text,
        affection_impact: choice.affection_impact || 0,
        tone: choice.tone,
        leads_to: choice.leads_to
      })),

      // 메타데이터
      metadata: {
        mood: scenario.metadata.mood || 'romantic',
        sexy_level: scenario.metadata.sexy_level,
        emotional_phase: getEmotionalPhase(gameState.messageCount || 0),
        generated_by: useAI ? (context.model || 'claude') : 'template'
      },

      // 게임 상태 스냅샷
      game_state_snapshot: {
        affection: gameState.affection || 0,
        message_count: gameState.messageCount || 0,
        relationship_stage: gameState.relationshipStage || 'acquaintances'
      }
    };

    // 8. 캐시 저장
    setCachedEpisode(cacheKey, episode);

    console.log('✅ 에피소드 생성 완료');
    return episode;

  } catch (error) {
    console.error('❌ 에피소드 생성 실패:', error);
    throw error;
  }
}

/**
 * Determine current act
 */
function determineCurrentAct(scenario, gameState) {
  const acts = scenario.structure.acts;
  const currentActNumber = gameState.current_act || 1;

  return acts.find(a => a.act_number === currentActNumber) || acts[0];
}

/**
 * Determine current beat
 */
function determineCurrentBeat(act, gameState) {
  const beats = act.beats;
  const beatProgress = gameState.beat_progress || 0;

  const currentIndex = Math.min(beatProgress, beats.length - 1);

  return beats[currentIndex];
}

/**
 * Render beat template
 */
function renderBeatTemplate(beat, variables) {
  const dialogue = renderTemplate(
    beat.template?.npc_dialogue_template || '',
    variables
  );

  const narration = renderTemplate(
    beat.template?.narration_template || '',
    variables
  );

  const choices = (beat.template?.choice_templates || []).map(choiceTemplate => ({
    text: renderTemplate(choiceTemplate.text_template || '', variables),
    affection_impact: calculateAffectionImpact(choiceTemplate.affection_range),
    tone: choiceTemplate.tone,
    leads_to: choiceTemplate.leads_to
  }));

  return { dialogue, narration, choices };
}

/**
 * Should use AI
 */
function shouldUseAI(scenario, character, gameState) {
  // AI 사용 가능한 경우에만
  return !!(process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Generate AI dialogue
 */
async function generateAIDialogue(renderedBeat, character, scenario, gameState, model = 'claude') {
  const systemPrompt = buildSystemPrompt(character, scenario, gameState);
  const userPrompt = buildUserPrompt(renderedBeat, gameState);

  const response = await callAIAPI(systemPrompt, userPrompt, {
    model,
    max_tokens: 1000,
    temperature: 0.8
  });

  // 응답 파싱 및 검증
  const parsed = parseAIResponse(response);

  // 템플릿과 병합
  return mergeDialogueWithTemplate(parsed, renderedBeat);
}

/**
 * Generate fallback dialogue
 */
function generateFallbackDialogue(renderedBeat, variables) {
  console.log('📝 Fallback 대화 사용');
  return renderedBeat;
}

/**
 * Merge AI dialogue with template
 */
function mergeDialogueWithTemplate(aiDialogue, templateDialogue) {
  return {
    dialogue: aiDialogue.dialogue || templateDialogue.dialogue,
    narration: aiDialogue.narration || templateDialogue.narration,
    choices: (aiDialogue.choices && aiDialogue.choices.length >= 2)
      ? aiDialogue.choices
      : templateDialogue.choices
  };
}

/**
 * Map game state to variables
 */
function mapGameStateToVariables(gameState) {
  return {
    affection: gameState.affection || 0,
    message_count: gameState.messageCount || 0,
    relationship_stage: gameState.relationshipStage || 'acquaintances'
  };
}

/**
 * Map context to variables
 */
function mapContextToVariables(context) {
  return {
    time_of_day: context.timeOfDay || '낮',
    location: context.location || '카페'
  };
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
module.exports = {
  generateEpisode,
  determineCurrentAct,
  determineCurrentBeat,
  renderBeatTemplate,
  shouldUseAI,
  generateAIDialogue,
  generateFallbackDialogue,
  mergeDialogueWithTemplate
};
