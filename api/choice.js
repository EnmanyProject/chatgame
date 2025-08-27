// 선택지 기반 대화 API
const DATABASE_DATA = {
  "character": {
    "name": "윤아",
    "age": 20,
    "personality": ["밝음", "적극적", "순수함", "감정 표현 풍부"],
    "relationship": "시우 오빠를 1년 넘게 좋아하는 후배",
    "speech_style": ["반말", "친근하고 애교스럽게", "이모티콘 자주 사용"]
  },
  "choices": [
    {
      "id": 1,
      "situation": "윤아가 해장국을 끓여주러 왔습니다.",
      "yuna_messages": [
        "오빠~ 일어나세요! 😊",
        "어제 많이 드셨죠? ㅋㅋ",
        "해장국 끓여왔어요!",
        "얼른 일어나서 드세요~ 😋"
      ],
      "options": [
        {
          "id": "A",
          "text": "고마워, 윤아야",
          "response": "헤헤~ 별거 아니에요! 😊 오빠가 아파보이니까 걱정됐어요.",
          "emotion": "happy",
          "affection_change": 2
        },
        {
          "id": "B", 
          "text": "아직 졸려...",
          "response": "안 돼요~ 😤 식기 전에 드셔야 해요! 일어나세요!",
          "emotion": "playful",
          "affection_change": 1
        },
        {
          "id": "C",
          "text": "언제 왔어?",
          "response": "방금 전에 왔어요! 😋 오빠 잠든 거 보고 조용히 해장국 끓였어요~",
          "emotion": "caring",
          "affection_change": 1
        }
      ]
    },
    {
      "id": 2,
      "situation": "해장국을 먹으며 대화가 계속됩니다.",
      "depends_on": 1,
      "variations": {
        "A": {
          "yuna_messages": [
            "그래도 오빠가 좋아해주시니까 기뻐요! 😊",
            "이 해장국은 우리 엄마 레시피예요~",
            "어때요? 맛있어요?"
          ],
          "options": [
            {
              "id": "A",
              "text": "정말 맛있어, 고마워",
              "response": "헤헤~ 다행이에요! 😍 엄마가 가르쳐주신 비법이 있거든요!",
              "emotion": "proud",
              "affection_change": 2
            },
            {
              "id": "B",
              "text": "너도 같이 먹을래?",
              "response": "저요? 😳 좋아요! 오빠랑 같이 먹으면 더 맛있을 것 같아요~",
              "emotion": "shy_happy",
              "affection_change": 2
            },
            {
              "id": "C",
              "text": "엄마 레시피구나",
              "response": "네! 😊 나중에 오빠한테도 가르쳐드릴게요. 배우고 싶으세요?",
              "emotion": "excited",
              "affection_change": 1
            }
          ]
        },
        "B": {
          "yuna_messages": [
            "아... 아직 잠이 덜 깨셨나봐요 😅",
            "그럼 제가 오빠 깨워드릴게요!",
            "어떻게 하면 좋을까요?"
          ],
          "options": [
            {
              "id": "A",
              "text": "알겠어, 일어날게",
              "response": "와! 😍 드디어 일어나셨네요! 해장국 빨리 드세요~",
              "emotion": "excited",
              "affection_change": 2
            },
            {
              "id": "B",
              "text": "5분만 더...",
              "response": "안 돼요! 😤 해장국이 식어요! 정말 맛있는데 아까워요~",
              "emotion": "pouty",
              "affection_change": 1
            },
            {
              "id": "C",
              "text": "네가 깨워줘",
              "response": "네? 😳 어... 어떻게요? 오빠 어깨 흔들어드릴까요?",
              "emotion": "shy",
              "affection_change": 2
            }
          ]
        },
        "C": {
          "yuna_messages": [
            "아까 전이요! 😋",
            "오빠 자고 계실 때 몰래 들어와서~",
            "조용히 해장국 끓였어요!"
          ],
          "options": [
            {
              "id": "A",
              "text": "몰래 들어왔다고?",
              "response": "아... 죄송해요 😅 문 열려있길래... 오빠 아픈 것 같아서 걱정됐거든요!",
              "emotion": "apologetic",
              "affection_change": 1
            },
            {
              "id": "B",
              "text": "고생 많았겠다",
              "response": "아니에요! 😊 오빠를 위해서라면 전혀 고생이 아니에요~",
              "emotion": "happy",
              "affection_change": 2
            },
            {
              "id": "C",
              "text": "정말 착하다",
              "response": "헤헤... 😳 오빠가 그렇게 말해주시니까 기뻐요! 더 잘해드릴게요!",
              "emotion": "shy_happy",
              "affection_change": 2
            }
          ]
        }
      }
    },
    {
      "id": 3,
      "situation": "해장국을 다 먹고 마무리 대화",
      "depends_on": 2,
      "yuna_messages": [
        "해장국 다 드셨네요! 😊",
        "기분이 좀 나아지셨어요?",
        "오빠 몸 관리 잘 해야 해요!"
      ],
      "options": [
        {
          "id": "A",
          "text": "덕분에 완전히 나았어",
          "response": "정말요?! 😍 다행이에요! 윤아가 만든 해장국 효과가 있네요~",
          "emotion": "proud",
          "affection_change": 2
        },
        {
          "id": "B",
          "text": "자주 와서 해줘",
          "response": "네! 😊 언제든지 말씀하세요! 오빠 아플 때마다 달려올게요!",
          "emotion": "happy",
          "affection_change": 2
        },
        {
          "id": "C",
          "text": "너 때문에 더 아픈 것 같아",
          "response": "네? 😳 왜요...? 혹시 제가 뭔가 잘못했나요? 아니면... 다른 의미인가요?",
          "emotion": "confused",
          "affection_change": 1
        }
      ]
    }
  ],
  "emotions": {
    "happy": {"display": "😊", "color": "#FFD700"},
    "playful": {"display": "😤", "color": "#87CEEB"},
    "caring": {"display": "🥰", "color": "#FFB6C1"},
    "proud": {"display": "😍", "color": "#FF69B4"},
    "shy_happy": {"display": "😊😳", "color": "#FFB6C1"},
    "excited": {"display": "🤗", "color": "#FF6347"},
    "pouty": {"display": "😤", "color": "#FFA500"},
    "shy": {"display": "😳", "color": "#FFA07A"},
    "apologetic": {"display": "😅", "color": "#DDA0DD"},
    "confused": {"display": "😕", "color": "#DDA0DD"},
    "relieved": {"display": "😌", "color": "#87CEEB"},
    "grateful": {"display": "🥰", "color": "#FFB6C1"},
    "hopeful": {"display": "😊", "color": "#98FB98"},
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
        
        // 윤아의 주관식 답변에 대한 반응 (큰 호감도 변화)
        const subjectiveResponses = [
          "진짜요?! 😍 오빠가 제가 해주는 해장국을 좋아해주시다니... 너무 행복해요! 앞으로 더 자주 해드릴게요!",
          "그렇구나... 😳 그럼 제가 더 잘 챙겨드려야겠어요! 오빠만의 전속 요리사가 되어드릴게요~ 💕",
          "정말요?! 🥰 그럼 정말 자주 올게요! 매일매일 오빠 챙겨드리고 싶어요... 좋죠?"
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
            emotion: "ecstatic",
            emotion_display: "🤩",
            emotion_color: "#FF1493",
            affection_change: 8,
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
            affection_change: 10,
            switch_to_gpt: true,
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
        "오빠~ 궁금한 게 있는데... 저처럼 해장국 해주러 오는 후배 어때요? 😳 솔직하게 말해주세요!",
        "그런데 오빠는 평소에 누가 챙겨줘요? 😊 가족? 아니면... 다른 누군가? 궁금해요~",
        "마지막 질문이에요! 만약에 제가 앞으로도 자주 와서 챙겨드린다면... 어떨 것 같아요? 💕"
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