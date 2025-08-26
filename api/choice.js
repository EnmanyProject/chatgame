// 선택지 기반 대화 API
const DATABASE_DATA = {
  "character": {
    "name": "윤아",
    "age": 20,
    "personality": ["밝음", "적극적", "순수함", "감정 표현 풍부"],
    "relationship": "창용 오빠를 1년 넘게 좋아하는 후배",
    "speech_style": ["반말", "친근하고 애교스럽게", "이모티콘 자주 사용"]
  },
  "choices": [
    {
      "id": 1,
      "situation": "윤아가 어제 술 마신 후 일어난 일로 부끄러워하고 있습니다.",
      "yuna_messages": [
        "창용 오빠... 안녕하세요 😳",
        "어제... 제가 술 마시고 이상한 말 많이 했죠? ㅠㅠ", 
        "정말 부끄러워서...",
        "오빠한테 뭐라고 말해야 할지 모르겠어요... 😰"
      ],
      "options": [
        {
          "id": "A",
          "text": "괜찮아, 별거 아니었어",
          "response": "정말요?! 오빠가 그렇게 말해주시니까... 조금 마음이 놓여요 😊 사실 정말 걱정했거든요...",
          "emotion": "relieved",
          "affection_change": 3
        },
        {
          "id": "B", 
          "text": "어떤 말을 했는데?",
          "response": "아... 그게... 😳 오빠한테... 제가... 좋아한다고... 말했어요 ㅜㅜ 너무 부끄러워요!",
          "emotion": "shy",
          "affection_change": 1
        },
        {
          "id": "C",
          "text": "기억 안 나는데?",
          "response": "정말요? 혹시 오빠도 많이 드셨나요? ㅋㅋ 그럼 다행이에요... 아니 다행인가? 😅",
          "emotion": "confused",
          "affection_change": 0
        }
      ]
    },
    {
      "id": 2,
      "situation": "첫 번째 선택에 따른 후속 대화",
      "depends_on": 1,
      "variations": {
        "A": {
          "yuna_messages": [
            "오빠 너무 좋으세요... 💕",
            "그런데 정말 기억나는 게 없으세요?",
            "제가 뭐라고 했는지..."
          ],
          "options": [
            {
              "id": "A",
              "text": "솔직히 기억나지만 괜찮다고 했잖아",
              "response": "아... 역시 기억나시는군요 😳 그런데도 괜찮다고 해주시다니... 정말 감사해요!",
              "emotion": "grateful",
              "affection_change": 4
            },
            {
              "id": "B",
              "text": "정말 기억이 안 나",
              "response": "그렇구나... 그럼 제가 다시 말해드릴까요? 😊 용기내서...",
              "emotion": "hopeful",
              "affection_change": 2
            },
            {
              "id": "C",
              "text": "중요한 건 지금이야",
              "response": "지금이요...? 무슨 뜻이세요? 😳 혹시... 오빠도...?",
              "emotion": "excited",
              "affection_change": 5
            }
          ]
        },
        "B": {
          "yuna_messages": [
            "이제 말해버렸으니까... 😳",
            "오빠는 어떻게 생각하세요?",
            "제 마음에 대해서..."
          ],
          "options": [
            {
              "id": "A",
              "text": "나도 너를 좋아해",
              "response": "정말요?! 😍 꿈인가요...? 진짜로 그렇게 생각해주시는 거예요?!",
              "emotion": "ecstatic",
              "affection_change": 10
            },
            {
              "id": "B",
              "text": "친구로서 좋아해",
              "response": "아... 그렇구나요 😢 그래도 친구라도 좋아요... 계속 곁에 있어도 되죠?",
              "emotion": "sad_understanding",
              "affection_change": -2
            },
            {
              "id": "C",
              "text": "시간이 필요해",
              "response": "네... 알겠어요 😊 기다릴게요, 오빠! 제가 더 좋은 사람이 되도록 노력할게요!",
              "emotion": "determined",
              "affection_change": 3
            }
          ]
        },
        "C": {
          "yuna_messages": [
            "ㅋㅋㅋ 그럼 우리 둘 다 기억이 없네요! 😄",
            "그런데... 혹시 궁금하지 않으세요?",
            "제가 뭐라고 했는지..."
          ],
          "options": [
            {
              "id": "A",
              "text": "궁금하다",
              "response": "사실... 오빠를 좋아한다고 고백했어요 😳 이제 기억나세요?",
              "emotion": "confessing",
              "affection_change": 3
            },
            {
              "id": "B",
              "text": "과거는 과거야",
              "response": "와... 오빠 진짜 쿨하시네요! 😎 그럼 새로 시작하는 기분이에요!",
              "emotion": "impressed",
              "affection_change": 2
            },
            {
              "id": "C",
              "text": "다시 말해봐",
              "response": "지금 말하라는 거예요? 😳 용기내서... 오빠, 저는... 오빠를 좋아해요! 💕",
              "emotion": "brave_confession",
              "affection_change": 6
            }
          ]
        }
      }
    },
    {
      "id": 3,
      "situation": "세 번째 선택 - 관계 정리",
      "depends_on": 2,
      "yuna_messages": [
        "오빠와 이렇게 얘기하다 보니...",
        "정말 많은 생각이 들어요 😊",
        "앞으로 우리 어떻게 지내면 좋을까요?"
      ],
      "options": [
        {
          "id": "A",
          "text": "천천히 알아가자",
          "response": "네! 좋아요 😊 오빠와 함께라면 천천히라도 행복할 것 같아요! 많은 얘기 나눠요!",
          "emotion": "happy_future",
          "affection_change": 4
        },
        {
          "id": "B",
          "text": "지금처럼 편하게",
          "response": "그것도 좋네요! 😄 편하게 지내는 것도 소중하죠. 오빠랑은 어떻게든 행복해요!",
          "emotion": "comfortable",
          "affection_change": 3
        },
        {
          "id": "C",
          "text": "더 가까워지고 싶어",
          "response": "저도요! 😍 정말 많이요! 오빠와 더 많은 시간을 보내고 싶어요! 💕",
          "emotion": "excited_close",
          "affection_change": 6
        }
      ]
    }
  ],
  "emotions": {
    "relieved": {"display": "😌", "color": "#87CEEB"},
    "shy": {"display": "😳", "color": "#FFA07A"},
    "confused": {"display": "😅", "color": "#DDA0DD"},
    "grateful": {"display": "🥰", "color": "#FFB6C1"},
    "hopeful": {"display": "😊", "color": "#98FB98"},
    "excited": {"display": "😍", "color": "#FF69B4"},
    "ecstatic": {"display": "🤩", "color": "#FF1493"},
    "sad_understanding": {"display": "😢", "color": "#4682B4"},
    "determined": {"display": "😤", "color": "#FFA500"},
    "confessing": {"display": "💕", "color": "#FF69B4"},
    "impressed": {"display": "😎", "color": "#00CED1"},
    "brave_confession": {"display": "💖", "color": "#DC143C"},
    "happy_future": {"display": "✨", "color": "#FFD700"},
    "comfortable": {"display": "😊", "color": "#90EE90"},
    "excited_close": {"display": "💞", "color": "#FF1493"}
  }
};

module.exports = (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // 첫 번째 선택지 반환
    const firstChoice = DATABASE_DATA.choices[0];
    return res.status(200).json({
      success: true,
      choice: firstChoice,
      character: DATABASE_DATA.character,
      metadata: {
        timestamp: new Date().toISOString(),
        choice_number: 1,
        total_choices: 3
      }
    });
  }

  if (req.method === 'POST') {
    try {
      const { choice_number, selected_option, previous_choices, subjective_answer, action } = req.body || {};

      // 주관식 답변 처리
      if (action === 'subjective_response' && subjective_answer) {
        const hasNextChoice = choice_number < 3;
        
        // 윤아의 주관식 답변에 대한 반응
        const subjectiveResponses = [
          "와... 오빠가 그렇게 생각해주셨다니 😳 너무 기뻐요! 저도 오빠를 정말 좋아해요 💕",
          "오빠의 취미가 그거구나! 😊 저도 같이 해보고 싶어요~ 가르쳐주실 거죠?",
          "우와... 정말 멋진 계획이에요! ✨ 오빠와 그런 추억들을 만들 수 있다면... 정말 행복할 것 같아요! 💕"
        ];

        if (hasNextChoice) {
          // 다음 선택지로 진행
          const nextChoiceData = DATABASE_DATA.choices[choice_number];
          let nextChoice = null;

          if (choice_number === 1) {
            // 2번째 선택지는 첫 번째 선택에 따라 결정
            const firstChoice = previous_choices[0];
            const variation = nextChoiceData.variations[firstChoice];
            if (variation) {
              nextChoice = {
                id: choice_number + 1,
                yuna_messages: variation.yuna_messages,
                options: variation.options
              };
            }
          } else if (choice_number === 2) {
            // 3번째 선택지
            nextChoice = {
              id: choice_number + 1,
              yuna_messages: nextChoiceData.yuna_messages,
              options: nextChoiceData.options
            };
          }

          return res.status(200).json({
            success: true,
            yuna_response: subjectiveResponses[choice_number - 1],
            emotion: "happy",
            emotion_display: "😊",
            emotion_color: "#FFD700",
            affection_change: 2,
            next_choice: nextChoice,
            has_next: true,
            metadata: {
              timestamp: new Date().toISOString(),
              choice_number: choice_number + 1,
              flow_stage: 'subjective_to_next_choice'
            }
          });
        } else {
          // 모든 선택지 완료 - GPT로 전환
          return res.status(200).json({
            success: true,
            yuna_response: subjectiveResponses[choice_number - 1],
            emotion: "excited_close",
            emotion_display: "💞",
            emotion_color: "#FF1493",
            affection_change: 3,
            switch_to_gpt: true,
            message: "이제부터 자유롭게 대화해보세요!",
            metadata: {
              timestamp: new Date().toISOString(),
              mode: 'free_chat_gpt',
              flow_stage: 'subjective_to_gpt'
            }
          });
        }
      }

      if (!choice_number || !selected_option) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'choice_number and selected_option are required'
        });
      }

      // 선택지 4번째부터는 GPT로 전환 신호
      if (choice_number > 3) {
        return res.status(200).json({
          success: true,
          switch_to_gpt: true,
          message: "이제부터 자유롭게 대화해보세요!",
          metadata: {
            timestamp: new Date().toISOString(),
            mode: 'free_chat_gpt'
          }
        });
      }

      const currentChoice = DATABASE_DATA.choices[choice_number - 1];
      if (!currentChoice) {
        return res.status(404).json({
          error: 'Choice not found',
          message: `Choice ${choice_number} does not exist`
        });
      }

      let options, yuna_messages;

      if (choice_number === 1) {
        // 첫 번째 선택
        options = currentChoice.options;
        yuna_messages = currentChoice.yuna_messages;
      } else if (choice_number === 2) {
        // 두 번째 선택 - 첫 번째 선택에 따라 분기
        const previous_choice = previous_choices[0];
        const variation = currentChoice.variations[previous_choice];
        if (!variation) {
          return res.status(400).json({
            error: 'Invalid previous choice',
            message: `No variation found for previous choice: ${previous_choice}`
          });
        }
        options = variation.options;
        yuna_messages = variation.yuna_messages;
      } else if (choice_number === 3) {
        // 세 번째 선택
        options = currentChoice.options;
        yuna_messages = currentChoice.yuna_messages;
      } else if (selected_option === 'CONTINUE') {
        // 주관식 질문 후 다음 선택지로 연결
        const nextChoiceData = DATABASE_DATA.choices[choice_number - 1];
        if (nextChoiceData) {
          if (choice_number === 2) {
            const previous_choice = previous_choices[0];
            const variation = nextChoiceData.variations[previous_choice];
            if (variation) {
              return res.status(200).json({
                success: true,
                next_choice: {
                  id: choice_number,
                  yuna_message: variation.yuna_message,
                  options: variation.options
                }
              });
            }
          } else {
            return res.status(200).json({
              success: true,
              next_choice: {
                id: choice_number,
                yuna_message: nextChoiceData.yuna_message,
                options: nextChoiceData.options
              }
            });
          }
        }
        return res.status(200).json({
          success: true,
          switch_to_gpt: true,
          message: "모든 선택지를 완료했습니다!"
        });
      }

      // 선택된 옵션 찾기
      const selectedOption = options.find(opt => opt.id === selected_option);
      if (!selectedOption) {
        return res.status(400).json({
          error: 'Invalid option selected',
          message: `Option ${selected_option} not found`
        });
      }

      const emotionData = DATABASE_DATA.emotions[selectedOption.emotion] || 
                         DATABASE_DATA.emotions.happy_future;

      // 각 선택지 후 주관식 질문 정의
      const subjectiveQuestions = [
        "그런데 오빠는... 평소에 저를 어떻게 생각하고 계셨어요? 😳 정말 궁금해요!",
        "오빠와 이야기하다 보니... 더 알고 싶어졌어요. 오빠의 취미는 뭐예요? 😊",
        "마지막으로... 앞으로 저희가 어떤 추억을 만들면 좋을까요? 💕"
      ];

      // 선택지 응답 후 바로 주관식 질문 표시
      const hasSubjectiveQuestion = choice_number <= 3;
      
      return res.status(200).json({
        success: true,
        yuna_response: selectedOption.response,
        emotion: selectedOption.emotion,
        emotion_display: emotionData.display,
        emotion_color: emotionData.color,
        affection_change: selectedOption.affection_change,
        subjective_question: hasSubjectiveQuestion ? {
          question: subjectiveQuestions[choice_number - 1],
          choice_number: choice_number
        } : null,
        has_subjective: hasSubjectiveQuestion,
        metadata: {
          timestamp: new Date().toISOString(),
          choice_number: choice_number,
          selected_option: selected_option,
          total_choices: 3,
          flow_stage: 'choice_response'
        }
      });

    } catch (error) {
      console.error('Choice API Error:', error);
      
      return res.status(500).json({
        error: 'Internal server error',
        message: '선택지 처리에 실패했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  return res.status(405).json({
    error: 'Method not allowed',
    message: 'Only GET and POST methods are supported'
  });
};