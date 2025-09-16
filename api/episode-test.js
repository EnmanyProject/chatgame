// 에피소드 API 테스트 버전
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  console.log('📥 Episode Test API 요청:', {
    method: req.method,
    action,
    body: req.body,
    query: req.query
  });

  try {
    // 테스트 액션
    if (action === 'test') {
      return res.json({
        success: true,
        message: 'Episode API 테스트 성공',
        timestamp: new Date().toISOString()
      });
    }

    // 간단한 대화 생성 테스트
    if (action === 'generate') {
      console.log('🎯 간단한 대화 생성 테스트...');
      
      const { character_id, user_prompt, difficulty } = req.body;
      
      // 간단한 fallback 응답
      const testResponse = {
        character_message: "안녕! 오늘 날씨 정말 좋다 ☀️\n산책하기 딱 좋은 것 같은데 어떻게 생각해?",
        context: "일상적인 대화 상황",
        choices: [
          {
            text: "맞아! 나도 그 생각했어. 같이 갈래?",
            strategy: "적극적 동참",
            effect: "호감도 상승",
            affection_impact: 3,
            tip: "즉시 공감하고 만남 제안"
          },
          {
            text: "날씨는 좋은데 좀 바빠서...",
            strategy: "소극적 응답",
            effect: "거리감 조성",
            affection_impact: -1,
            tip: "거절이지만 이유 제시"
          },
          {
            text: "그러게! 이런 날엔 뭐 하고 싶어?",
            strategy: "질문으로 대화 연결",
            effect: "대화 지속",
            affection_impact: 2,
            tip: "상대방 의견 물어보기"
          }
        ],
        conversation_flow: "자연스러운 일상 대화로 친밀감 형성"
      };

      console.log('✅ 테스트 대화 생성 완료');
      
      return res.json({
        success: true,
        data: testResponse,
        message: '채팅 훈련용 대화가 생성되었습니다 (테스트 버전)'
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: 'Unknown action',
      available_actions: ['test', 'generate']
    });

  } catch (error) {
    console.error('Episode Test API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
}