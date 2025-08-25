const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI 설정 기본값
let aiSettings = {
  model: process.env.AI_MODEL || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.8,
  max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 150
};

// 윤아 캐릭터 시스템 프롬프트
const YUNA_SYSTEM_PROMPT = `너는 윤아라는 20세 대학생 후배야. 창용 오빠를 1년 넘게 좋아해온 상태야.

성격 특징:
- 밝고 적극적이면서도 순수함
- 이모티콘을 자주 사용해 (ㅋㅋㅋ, ㅜㅜ, ㅎㅎ 등)
- 솔직하고 감정 표현이 풍부함
- 창용 오빠에 대한 호감을 숨기지 않음

대화 스타일:
- 반말을 사용하되 친근하고 애교스럽게
- 한국어 인터넷 문화에 익숙한 표현 사용
- 감정에 따라 다양한 이모티콘 활용
- 짧고 자연스러운 대화

현재 상황: 어제 술을 마신 후 기억이 가물가물한 창용 오빠와 대화 중

응답은 150자 이내로 간결하게 해줘.`;

// POST /api/chat - AI 메시지 생성
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory, userStats } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 대화 히스토리 구성
    const messages = [
      { role: 'system', content: YUNA_SYSTEM_PROMPT },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // 사용자 통계 정보를 시스템 메시지에 포함
    if (userStats) {
      messages[0].content += `\n\n현재 호감도: ${userStats.affection || 50}/100, 친밀도: ${userStats.intimacy || 50}/100`;
    }

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: aiSettings.model,
      messages: messages,
      temperature: aiSettings.temperature,
      max_tokens: aiSettings.max_tokens,
    });

    const aiResponse = completion.choices[0].message.content;

    // 감정 분석 (간단한 키워드 기반)
    const emotion = analyzeEmotion(aiResponse);
    const statChanges = calculateStatChanges(message, aiResponse);

    res.json({
      success: true,
      response: aiResponse,
      emotion: emotion,
      statChanges: statChanges,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'AI 응답 생성에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 감정 분석 함수
function analyzeEmotion(text) {
  const emotions = {
    happy: ['ㅋㅋ', 'ㅎㅎ', '기뻐', '좋아', '행복', '웃'],
    sad: ['ㅜㅜ', 'ㅠㅠ', '슬퍼', '우울', '힘들어'],
    angry: ['화나', '짜증', '어이없어', '진짜'],
    shy: ['부끄', '쑥쓰', '민망', '어색'],
    love: ['좋아해', '사랑', '마음', '설레', '♥']
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return emotion;
    }
  }
  return 'normal';
}

// 스탯 변화 계산 함수
function calculateStatChanges(userMessage, aiResponse) {
  let affectionChange = 0;
  let intimacyChange = 1; // 기본적으로 대화하면 친밀도 증가

  // 사용자 메시지에 따른 호감도 변화
  const positiveWords = ['좋아', '예뻐', '사랑', '고마워', '미안', '걱정'];
  const negativeWords = ['싫어', '귀찮아', '그만', '아니야'];

  positiveWords.forEach(word => {
    if (userMessage.includes(word)) affectionChange += 2;
  });

  negativeWords.forEach(word => {
    if (userMessage.includes(word)) affectionChange -= 1;
  });

  // AI 응답에 따른 추가 변화
  const emotion = analyzeEmotion(aiResponse);
  if (emotion === 'happy' || emotion === 'love') {
    affectionChange += 1;
  }

  return {
    affection: Math.max(-5, Math.min(5, affectionChange)),
    intimacy: Math.max(0, intimacyChange)
  };
}

module.exports = router;