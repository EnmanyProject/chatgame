export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 윤아 캐릭터 응답들
    const responses = [
      '안녕! 창용 오빠 ㅎㅎ 어제 정말 재밌었어요! 💕',
      '오빠! 어제 기억 안나요? ㅋㅋ 같이 산책하면서 얘기 많이 했는데 ㅜㅜ',
      '어제 오빠랑 카페에서 커피 마셨잖아요! 기억 안 나는 척 하는 거예요? ㅎㅎ',
      '창용 오빠~ 어제 너무 좋았어요! 또 만나요 💕',
      '오빠가 저한테 그런 말 해주셔서 기뻤어요 ㅋㅋ'
    ];

    const aiResponse = responses[Math.floor(Math.random() * responses.length)];

    return res.status(200).json({
      success: true,
      response: aiResponse,
      emotion: 'happy',
      affectionChange: 1
    });

  } catch (error) {
    console.error('Chat function error:', error);
    
    return res.status(500).json({ 
      error: 'AI 응답 생성에 실패했습니다.',
      details: error.message
    });
  }
}