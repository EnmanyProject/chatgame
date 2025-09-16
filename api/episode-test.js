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

    // 채팅 훈련용 대화 생성
    if (action === 'generate') {
      console.log('🎯 채팅 훈련 대화 생성 시작...');
      
      const { character_id, user_prompt, difficulty } = req.body;
      
      // 캐릭터별 개성 있는 응답 생성
      const characterResponses = {
        'yuna_infp': {
          message: "음... 그런 얘기구나 😊\n사실 나도 비슷하게 생각하고 있었어",
          personality: "감성적이고 내향적인 INFP"
        },
        'mina_enfp': {
          message: "와! 진짜 그렇게 생각해? 😆\n우리 완전 잘 맞는 것 같아!",
          personality: "외향적이고 열정적인 ENFP"
        },
        'seoyeon_intj': {
          message: "흥미로운 관점이네요.\n논리적으로 타당한 부분이 있습니다.",
          personality: "논리적이고 독립적인 INTJ"
        },
        'jihye_esfj': {
          message: "정말? 괜찮아? 😟\n혹시 불편한 건 없어? 도와줄 수 있는 게 있다면 말해줘!",
          personality: "사교적이고 배려심 많은 ESFJ"
        },
        'hyejin_istp': {
          message: "그렇구나. 나쁘지 않네 👍",
          personality: "실용적이고 독립적인 ISTP"
        }
      };

      const character = characterResponses[character_id] || characterResponses['yuna_infp'];
      
      const testResponse = {
        character_message: character.message,
        context: `${character.personality} 성격이 반영된 대화`,
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