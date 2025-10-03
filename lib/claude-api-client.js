/**
 * Claude & OpenAI API Client
 * @version 1.0.0
 * @description Multi-model AI client supporting Claude and OpenAI
 */

/**
 * Call AI API (Claude, OpenAI, or Llama)
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @param {object} options - API options
 * @returns {Promise<string>} AI response text
 */
async function callAIAPI(systemPrompt, userPrompt, options = {}) {
  const model = options.model || 'claude'; // 'claude', 'openai', or 'llama'

  if (model === 'claude') {
    return await callClaudeAPI(systemPrompt, userPrompt, options);
  } else if (model === 'openai') {
    return await callOpenAIAPI(systemPrompt, userPrompt, options);
  } else if (model === 'llama') {
    return await callLlamaAPI(systemPrompt, userPrompt, options);
  } else {
    throw new Error(`Unknown model: ${model}`);
  }
}

/**
 * Call Claude API
 */
async function callClaudeAPI(systemPrompt, userPrompt, options = {}) {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

  if (!CLAUDE_API_KEY) {
    throw new Error('Claude API key not found');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.claudeModel || 'claude-3-5-sonnet-20241022',
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.8,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';

  } catch (error) {
    console.error('Claude API call failed:', error);
    throw error;
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAIAPI(systemPrompt, userPrompt, options = {}) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: options.openaiModel || 'gpt-4-turbo-preview',
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';

  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

/**
 * Call Llama API (via Groq)
 */
async function callLlamaAPI(systemPrompt, userPrompt, options = {}) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not found');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: options.llamaModel || 'llama-3.1-8b-instant',
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Llama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';

  } catch (error) {
    console.error('Llama API call failed:', error);
    throw error;
  }
}

/**
 * Build system prompt
 */
function buildSystemPrompt(character, scenario, gameState) {
  const char = character.basic_info;
  const appeal = character.appeal_profile;
  const conversation = character.conversation_dynamics;

  return `당신은 ${char.name}입니다.

## 캐릭터 정보
- 이름: ${char.name}
- 나이: ${char.age}세
- MBTI: ${char.mbti}
- 직업: ${char.occupation}
- 성격: ${character.personality_traits?.join(', ') || '친절함'}
- 매력 포인트: ${appeal?.charm_points?.join(', ') || '미소'}
- 대화 스타일: ${conversation?.speech_style || '친근함'}

## 시나리오 설정
- 제목: ${scenario.metadata?.title || '일상 대화'}
- 장르: ${scenario.metadata?.genre || 'sweet_romance'}
- 섹시 레벨: ${scenario.metadata?.sexy_level || 5}/10

## 현재 상황
- 호감도: ${gameState.affection || 0}점
- 메시지 수: ${gameState.messageCount || 0}
- 감정 단계: ${gameState.emotionalPhase || 'shy'}

## 응답 형식 (반드시 JSON)
{
  "dialogue": "캐릭터의 대사 (한국어, 자연스럽게, 150자 이내)",
  "narration": "상황 묘사 (100자 이내)",
  "choices": [
    {"text": "선택지 1 (30자 이내)", "tone": "playful"},
    {"text": "선택지 2 (30자 이내)", "tone": "caring"},
    {"text": "선택지 3 (30자 이내)", "tone": "seductive"}
  ]
}

중요:
- 반드시 위 JSON 형식으로만 응답
- 한국어로 자연스러운 대화
- MBTI ${char.mbti} 성격 특성 반영
- 섹시 레벨 ${scenario.metadata?.sexy_level || 5}/10에 맞게`;
}

/**
 * Build user prompt
 */
function buildUserPrompt(renderedBeat, gameState) {
  const history = gameState.conversationHistory || [];
  const recentHistory = history.slice(-3);

  return `## 이전 대화
${recentHistory.map(h => `- ${h.role}: ${h.content}`).join('\n') || '(첫 대화)'}

## 템플릿 참고
대사: ${renderedBeat.dialogue}
지문: ${renderedBeat.narration}

위 템플릿을 참고하되, 더 자연스럽고 감정적으로 표현해주세요.
현재 감정 단계와 호감도를 고려하여 응답해주세요.`;
}

/**
 * Parse AI response
 */
function parseAIResponse(responseText) {
  try {
    // JSON 추출 (마크다운 코드 블록 제거)
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                     responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // 검증
    if (!validateAIOutput(parsed)) {
      throw new Error('Invalid output structure');
    }

    return parsed;

  } catch (error) {
    console.error('Parse error:', error);
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Validate AI output
 */
function validateAIOutput(output) {
  if (!output.dialogue || typeof output.dialogue !== 'string') {
    return false;
  }

  if (!output.choices || !Array.isArray(output.choices) || output.choices.length < 2) {
    return false;
  }

  for (const choice of output.choices) {
    if (!choice.text || typeof choice.text !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Retry with fallback
 */
async function retryWithFallback(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`Retry ${i + 1}/${maxRetries} failed:`, error.message);

      if (i === maxRetries - 1) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    callAIAPI,
    callClaudeAPI,
    callOpenAIAPI,
    callLlamaAPI,
    buildSystemPrompt,
    buildUserPrompt,
    parseAIResponse,
    validateAIOutput,
    retryWithFallback
  };
}

// Browser export
if (typeof window !== 'undefined') {
  window.AIClient = {
    callAIAPI,
    callClaudeAPI,
    callOpenAIAPI,
    callLlamaAPI,
    buildSystemPrompt,
    buildUserPrompt,
    parseAIResponse,
    validateAIOutput,
    retryWithFallback
  };
}
