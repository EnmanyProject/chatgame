const { OpenAI } = require('openai');

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 윤아 캐릭터 프롬프트
const YUNA_PROMPT = `너는 윤아라는 20세 대학생 후배야. 창용 오빠를 1년 넘게 좋아해온 상태야.

성격: 밝고 적극적, 순수함, 감정 표현 풍부
말투: 반말, 친근하고 애교스럽게, 이모티콘 자주 사용 (ㅋㅋ, ㅜㅜ, ㅎㅎ)
상황: 어제 술 마신 후 기억이 가물가물한 창용 오빠와 대화 중

150자 이내로 자연스럽게 답변해줘.`;

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 요청 데이터 파싱
    const { message, conversationHistory = [], userStats = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 대화 히스토리 구성 (최근 6개만)
    const recentHistory = conversationHistory.slice(-6);
    const messages = [
      { role: 'system', content: YUNA_PROMPT },
      ...recentHistory,
      { role: 'user', content: message }
    ];

    // 사용자 통계를 프롬프트에 추가
    if (userStats.affection !== undefined) {
      messages[0].content += `\n\n현재 호감도: ${userStats.affection}/100`;
    }

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0.8,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    // 간단한 감정 분석
    const emotion = analyzeEmotion(aiResponse);
    
    // 호감도 변화 계산
    const affectionChange = calculateAffectionChange(message);

    return res.status(200).json({
      success: true,
      response: aiResponse,
      emotion: emotion,
      affectionChange: affectionChange,
    });

  } catch (error) {
    console.error('Chat function error:', error);
    
    return res.status(500).json({ 
      error: 'AI 응답 생성에 실패했습니다.',
      details: error.message
    });
  }
}

// 감정 분석 함수
function analyzeEmotion(text) {
  const emotions = {
    happy: ['ㅋㅋ', 'ㅎㅎ', '기뻐', '좋아', '행복'],
    sad: ['ㅜㅜ', 'ㅠㅠ', '슬퍼', '우울'],
    shy: ['부끄', '쑥쓰', '민망'],
    love: ['사랑', '좋아해', '마음', '설레']
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return emotion;
    }
  }
  return 'normal';
}

// 호감도 변화 계산
function calculateAffectionChange(userMessage) {
  const positiveWords = ['좋아', '예뻐', '사랑', '고마워'];
  const negativeWords = ['싫어', '귀찮아', '그만'];

  let change = 0;
  
  positiveWords.forEach(word => {
    if (userMessage.includes(word)) change += 2;
  });
  
  negativeWords.forEach(word => {
    if (userMessage.includes(word)) change -= 1;
  });

  return Math.max(-5, Math.min(5, change));
}