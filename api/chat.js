// Vercel Edge Runtime 사용
export const config = {
  runtime: 'nodejs',
}

export default async function handler(request, response) {
  // CORS 헤더 설정
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = request.body

    if (!message) {
      return response.status(400).json({ error: 'Message is required' })
    }

    // 임시로 간단한 응답을 반환
    const responses = [
      '안녕! 창용 오빠 ㅎㅎ 어제 정말 재밌었어요! 💕',
      '오빠! 어제 기억 안나요? ㅋㅋ 같이 산책하면서 얘기 많이 했는데 ㅜㅜ',
      '어제 오빠랑 카페에서 커피 마셨잖아요! 기억 안 나는 척 하는 거예요? ㅎㅎ'
    ]

    const aiResponse = responses[Math.floor(Math.random() * responses.length)]

    return response.status(200).json({
      success: true,
      response: aiResponse,
      emotion: 'happy',
      affectionChange: 1
    })

  } catch (error) {
    console.error('Chat function error:', error)
    
    return response.status(500).json({ 
      error: 'AI 응답 생성에 실패했습니다.',
      details: error.message
    })
  }
}