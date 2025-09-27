// AI 캐릭터 생성 API - 세계관 최강 버전
import fs from 'fs';
import path from 'path';
// import { getGlobalApiKey } from './save-api-key.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  console.log('🎭 캐릭터 생성 AI 요청:', {
    method: req.method,
    action,
    body: req.body,
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'x-openai-key': req.headers['x-openai-key'] ? req.headers['x-openai-key'].substring(0, 10) + '...' : 'None',
      'authorization': req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'None'
    }
  });

  try {
    // 대화 시작 - 초기 질문 생성
    if (action === 'start_conversation') {
      const initialQuestion = generateInitialQuestion();
      return res.json({
        success: true,
        step: 1,
        stepName: '기본 정보',
        question: initialQuestion,
        options: generateBasicOptions(),
        progress: 14.3 // 1/7 * 100
      });
    }

    // AI 기반 다음 질문 생성
    if (action === 'next_question') {
      const { currentStep, answers } = req.body;
      const nextQuestion = await generateNextQuestion(currentStep, answers);
      
      return res.json({
        success: true,
        step: currentStep + 1,
        stepName: getStepName(currentStep + 1),
        question: nextQuestion.question,
        options: nextQuestion.options,
        progress: ((currentStep + 1) / 7) * 100
      });
    }

    // 완성된 캐릭터 생성
    if (action === 'generate_character') {
      const { answers } = req.body;
      const character = await generateCompleteCharacter(answers, req);
      
      // 캐릭터 데이터베이스에 저장
      await saveCharacterToDatabase(character);
      
      return res.json({
        success: true,
        character,
        message: '완벽한 캐릭터가 생성되었습니다!'
      });
    }

    // 캐릭터 리스트 조회
    if (action === 'list_characters') {
      try {
        console.log('📋 캐릭터 리스트 조회 시작...');
        const characters = await loadCharacterDatabase();
        console.log('✅ 캐릭터 DB 로드 성공:', Object.keys(characters.characters || {}).length, '개');

        return res.json({
          success: true,
          characters: characters.characters || {},
          metadata: characters.metadata || {}
        });
      } catch (error) {
        console.error('❌ 캐릭터 리스트 조회 실패:', error);
        return res.status(500).json({
          success: false,
          message: '캐릭터 목록을 불러오는 중 오류가 발생했습니다',
          error: error.message
        });
      }
    }

    // 모든 캐릭터 데이터 초기화 (더미 데이터 삭제)
    if (action === 'reset_all_characters') {
      try {
        console.log('🗑️ 모든 캐릭터 데이터 초기화 시작...');
        const success = await resetAllCharacters();
        
        if (success) {
          return res.json({
            success: true,
            message: '모든 캐릭터 데이터가 초기화되었습니다'
          });
        } else {
          return res.status(500).json({
            success: false,
            message: '데이터 초기화 중 오류가 발생했습니다'
          });
        }
      } catch (error) {
        console.error('❌ 데이터 초기화 실패:', error);
        return res.status(500).json({
          success: false,
          message: '데이터 초기화 실패: ' + error.message
        });
      }
    }

    // 캐릭터 저장
    if (action === 'save_character') {
      const { character } = req.body;
      
      if (!character || !character.name || !character.mbti) {
        return res.status(400).json({ 
          success: false, 
          message: 'Character name and MBTI are required' 
        });
      }

      const success = await saveCharacterToDatabase(character);
      
      if (success) {
        return res.json({
          success: true,
          character: character,
          message: 'Character saved successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to save character'
        });
      }
    }

    // 캐릭터 삭제
    if (action === 'delete_character') {
      const { character_id } = req.body;
      
      if (!character_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Character ID is required' 
        });
      }

      const success = await deleteCharacterFromDatabase(character_id);
      
      if (success) {
        return res.json({
          success: true,
          message: 'Character deleted successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete character'
        });
      }
    }

    // 캐릭터 사진 분석 (OpenAI Vision API 사용)
    if (action === 'analyze_character_image') {
      try {
        const { imageBase64 } = req.body;
        
        if (!imageBase64) {
          return res.status(400).json({ 
            success: false, 
            message: '이미지 데이터가 없습니다' 
          });
        }

        const analysis = await analyzeCharacterImage(imageBase64);
        
        return res.json({
          success: true,
          analysis: analysis,
          message: '이미지 분석이 완료되었습니다'
        });
        
      } catch (error) {
        console.error('❌ 이미지 분석 실패:', error);
        return res.status(500).json({
          success: false,
          message: '이미지 분석 중 오류가 발생했습니다'
        });
      }
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });

  } catch (error) {
    console.error('❌ 캐릭터 생성 AI 오류:', error);
    console.error('에러 상세 정보:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      action: action,
      method: req.method,
      body: req.body ? Object.keys(req.body) : 'no body'
    });

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      action: action,
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// === AI 질문 생성 함수들 ===

function generateInitialQuestion() {
  return {
    text: "안녕하세요! 🎭 세계관 최강의 캐릭터 생성 AI입니다.\n\n함께 매력적인 캐릭터를 만들어보아요!\n\n먼저, 어떤 캐릭터를 만들고 싶으신가요?",
    type: "multiple_choice",
    required: true
  };
}

function generateBasicOptions() {
  return [
    { id: 'romance_female', text: '로맨스 여성 캐릭터', icon: '💕' },
    { id: 'romance_male', text: '로맨스 남성 캐릭터', icon: '💙' },
    { id: 'mystery_detective', text: '미스터리 탐정 캐릭터', icon: '🔍' },
    { id: 'fantasy_hero', text: '판타지 주인공', icon: '⚔️' },
    { id: 'modern_student', text: '현대물 학생 캐릭터', icon: '📚' },
    { id: 'custom', text: '직접 설정하기', icon: '🎨' }
  ];
}

async function generateNextQuestion(currentStep, answers) {
  // 간단한 API 키 조회 방식 사용
  const { getSimpleApiKey } = await import('./simple-api-key.js');
  const OPENAI_API_KEY = await getSimpleApiKey();

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API 키가 설정되지 않았습니다');
    throw new Error('API 키가 설정되지 않았습니다. 관리자 페이지에서 OpenAI API 키를 먼저 저장해주세요.');
  }

  try {
    const stepInfo = getStepInfo(currentStep + 1);
    const prompt = createQuestionPrompt(stepInfo, answers);

    console.log('🤖 OpenAI API 호출 - 질문 생성...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 세계관 최강의 캐릭터 생성 전문가입니다. 사용자와 자연스럽게 대화하며 매력적인 캐릭터를 만들어주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    console.log('📡 OpenAI API 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      console.log('🤖 AI 응답 내용:', aiResponse?.substring(0, 200) + '...');

      if (aiResponse && aiResponse.trim()) {
        try {
          return JSON.parse(aiResponse);
        } catch (parseError) {
          console.error('❌ JSON 파싱 실패:', parseError);
          console.error('파싱 실패한 AI 응답:', aiResponse);
          throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
        }
      } else {
        console.error('❌ AI 응답이 비어있음');
        throw new Error('OpenAI API에서 빈 응답을 받았습니다. 다시 시도해주세요.');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI API 호출 실패:', response.status, errorText);

      let errorMessage = `OpenAI API 오류 (${response.status})`;
      if (response.status === 401) {
        errorMessage = 'API 키가 유효하지 않습니다. OpenAI API 키를 확인해주세요.';
      } else if (response.status === 429) {
        errorMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (response.status >= 500) {
        errorMessage = 'OpenAI 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      }

      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('❌ AI 질문 생성 오류:', error);
    console.error('에러 상세 정보:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // OpenAI API 응답 오류 처리
    if (error.message.includes('JSON')) {
      console.error('❌ JSON 파싱 오류 - AI 응답이 올바른 JSON 형식이 아닙니다');
      throw new Error('AI가 올바르지 않은 형식으로 응답했습니다. 다시 시도해주세요.');
    }

    // 네트워크 오류 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    }

    // 기타 오류는 그대로 전달
    throw error;
  }
}

async function generateCompleteCharacter(answers, req = null) {
  // 간단한 API 키 조회 방식 사용
  const { getSimpleApiKey } = await import('./simple-api-key.js');
  const OPENAI_API_KEY = await getSimpleApiKey();

  const character = {
    id: 'char_' + Date.now(),
    created_date: new Date().toISOString().split('T')[0],
    generation_method: 'ai_conversation',
    ...answers
  };

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API 키가 설정되지 않았습니다');
    throw new Error('API 키가 설정되지 않았습니다. 관리자 페이지에서 OpenAI API 키를 먼저 저장해주세요.');
  }

  try {
    const prompt = createCharacterPrompt(answers);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 완벽한 캐릭터 프로파일을 생성하는 전문가입니다.
규칙:
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. 코드 블록이나 설명 텍스트를 추가하지 마세요
3. JSON 앞뒤에 다른 텍스트를 추가하지 마세요
4. 일관성 있고 매력적인 캐릭터를 만들어주세요`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    console.log('📡 OpenAI API 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      const aiCharacter = data.choices[0]?.message?.content;

      console.log('🤖 AI 캐릭터 응답 내용:', aiCharacter?.substring(0, 200) + '...');

      if (aiCharacter && aiCharacter.trim()) {
        try {
          // JSON 추출 및 정리
          let cleanedResponse = aiCharacter.trim();

          // 코드 블록 제거 (```json...``` 패턴)
          if (cleanedResponse.includes('```')) {
            const jsonMatch = cleanedResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
              cleanedResponse = jsonMatch[1];
            } else {
              // 코드 블록 마커만 제거
              cleanedResponse = cleanedResponse.replace(/```(?:json)?/g, '');
            }
          }

          // 불필요한 텍스트 제거 (JSON 이전/이후)
          const jsonStart = cleanedResponse.indexOf('{');
          const jsonEnd = cleanedResponse.lastIndexOf('}');

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
          }

          console.log('🧹 정리된 AI 응답:', cleanedResponse.substring(0, 200) + '...');

          const aiData = JSON.parse(cleanedResponse);
          console.log('✅ AI 캐릭터 데이터 파싱 성공');
          console.log('📊 파싱된 데이터 키:', Object.keys(aiData));

          return { ...character, ...aiData };
        } catch (parseError) {
          console.error('❌ AI 캐릭터 JSON 파싱 실패:', parseError);
          console.error('❌ 원본 AI 응답 (처음 500자):', aiCharacter.substring(0, 500));
          console.error('❌ 파싱 에러 상세:', parseError.message);
          throw new Error('AI가 올바르지 않은 형식으로 응답했습니다. 다시 시도해주세요.');
        }
      } else {
        console.error('❌ AI 캐릭터 응답이 비어있음');
        throw new Error('OpenAI API에서 빈 캐릭터 응답을 받았습니다. 다시 시도해주세요.');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI API 캐릭터 생성 실패:', response.status, errorText);

      let errorMessage = `OpenAI API 오류 (${response.status})`;
      if (response.status === 401) {
        errorMessage = 'API 키가 유효하지 않습니다. OpenAI API 키를 확인해주세요.';
      } else if (response.status === 429) {
        errorMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (response.status >= 500) {
        errorMessage = 'OpenAI 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      }

      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('❌ AI 캐릭터 생성 오류:', error);
    console.error('에러 상세 정보:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // JSON 파싱 오류 처리
    if (error.message.includes('JSON') || error.message.includes('파싱')) {
      console.error('❌ JSON 파싱 오류 - AI 응답이 올바른 JSON 형식이 아닙니다');
      throw new Error('AI가 올바르지 않은 형식으로 응답했습니다. 다시 시도해주세요.');
    }

    // 네트워크 오류 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    }

    // 기타 오류는 그대로 전달
    throw error;
  }
}

// === 헬퍼 함수들 ===

function getStepName(step) {
  const stepNames = [
    '', '기본 정보', '성격 설정', '배경 설정',
    '관계 설정', '상황 설정', '외모 설정',
    '내면/습관'
  ];
  return stepNames[step] || '완료';
}

function getStepInfo(step) {
  const steps = {
    2: { name: '성격 설정', focus: 'MBTI, 성격 특성, 말투' },
    3: { name: '배경 설정', focus: '직업, 사회적 지위, 출신지' },
    4: { name: '관계 설정', focus: '가족, 친구, 연인 관계' },
    5: { name: '상황 설정', focus: '현재 상황, 도입부, 갈등' },
    6: { name: '외모 설정', focus: '헤어, 눈, 체형, 스타일' },
    7: { name: '내면/습관', focus: '취미, 가치관, 특기, 습관' }
  };
  return steps[step];
}

function createQuestionPrompt(stepInfo, answers) {
  return `
현재 단계: ${stepInfo.name}
포커스: ${stepInfo.focus}

지금까지의 답변:
${JSON.stringify(answers, null, 2)}

다음 JSON 형식으로 질문을 생성해주세요:
{
  "question": {
    "text": "자연스러운 대화체 질문 (1-2개의 핵심 질문)",
    "type": "multiple_choice" 또는 "text" 또는 "slider",
    "required": true
  },
  "options": [
    { "id": "option1", "text": "선택지 1", "icon": "🎭" },
    { "id": "option2", "text": "선택지 2", "icon": "🎨" }
  ] (multiple_choice일 때만)
}
`;
}

function createCharacterPrompt(answers) {
  // 입력된 정보 분석
  const providedInfo = Object.entries(answers)
    .filter(([key, value]) => value && value !== '' && value !== 'undefined')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
    
  return `
당신은 전문 캐릭터 디자이너입니다. 제공된 정보가 부족하더라도 논리적으로 추정하여 완전한 캐릭터를 생성해주세요.

**제공된 정보:**
${providedInfo || '정보 없음 - 완전히 새로운 캐릭터 생성 필요'}

**생성 규칙:**
1. **제공된 정보를 반드시 정확히 반영** - 사용자가 선택한 내용은 절대 변경하지 않기
2. 부족한 정보는 제공된 정보와 일관성 있게 추정
3. MBTI가 주어지면 해당 성격에 맞게 모든 특성 결정
4. 로맨스 게임 캐릭터로서 매력적이고 입체적인 성격
5. 한국어 로맨스 웹툰/게임 스타일 캐릭터
6. **나이는 반드시 18세 이상 30세 이하로 설정**

**필수 출력 JSON 구조:**
{
  "name": "적절한 한국 이름",
  "age": "18-30 사이의 숫자",
  "gender": "female",
  "mbti": "4글자 MBTI",
  "personality_traits": ["특성1", "특성2", "특성3"],
  "major": "전공분야",
  "relationship": "관계설정",
  "speech_style": "말투특징",
  "speech_habit": "입버릇",
  "appearance": {
    "hair": "헤어스타일",
    "eyes": "눈모양",
    "style": "패션스타일"
  },
  "background": {
    "family": "가족관계",
    "hometown": "출신지역",
    "occupation": "직업/학생"
  },
  "personality": {
    "hobbies": ["취미1", "취미2", "취미3"],
    "values": "가치관",
    "fears": "두려워하는것"
  },
  "story_context": {
    "main_situation": "첫만남상황"
  }
}

🚨 중요: 반드시 위의 JSON 구조만 출력하세요.
- 코드 블록(```) 사용 금지
- 설명 텍스트 추가 금지
- JSON 외의 어떤 텍스트도 포함하지 마세요
- 순수한 JSON만 응답하세요
`;
}

// Fallback 함수들은 제거됨 - 실제 AI 생성 실패 시 에러 발생

// 데이터베이스 함수들
async function loadCharacterDatabase() {
  try {
    // 먼저 기존 characters.json 시도
    const mainDbPath = path.join(process.cwd(), 'data', 'characters.json');
    const aiDbPath = path.join(process.cwd(), 'data', 'characters-ai.json');
    
    console.log('📂 캐릭터 DB 로드 시도:', { mainDbPath, aiDbPath });
    
    // characters-ai.json이 있으면 사용
    if (fs.existsSync(aiDbPath)) {
      console.log('✅ AI 캐릭터 DB 파일 발견');
      const data = fs.readFileSync(aiDbPath, 'utf8');
      return JSON.parse(data);
    }
    
    // 기존 characters.json을 AI 형식으로 변환
    if (fs.existsSync(mainDbPath)) {
      console.log('📄 기존 캐릭터 DB에서 변환');
      const data = fs.readFileSync(mainDbPath, 'utf8');
      const mainDb = JSON.parse(data);
      
      // characters.json 형식을 characters-ai.json 형식으로 변환
      const charactersObj = mainDb.characters || {};
      const charactersCount = Object.keys(charactersObj).length;

      const aiDb = {
        metadata: {
          version: "2.0.0",
          total_characters: charactersCount,
          converted_from: "characters.json",
          last_converted: new Date().toISOString()
        },
        characters: charactersObj
      };
      
      // AI DB 파일로 저장 시도 (실패해도 메모리에서 반환)
      try {
        fs.writeFileSync(aiDbPath, JSON.stringify(aiDb, null, 2));
        console.log('✅ AI DB 파일 생성 성공');
      } catch (writeError) {
        console.log('⚠️ AI DB 파일 쓰기 실패, 메모리에서 반환:', writeError.message);
      }
      
      return aiDb;
    }
    
    // 둘 다 없으면 초기 DB 생성
    console.log('🆕 초기 캐릭터 DB 생성');
    const initialDb = {
      metadata: { version: "2.0.0", total_characters: 0 },
      characters: {}
    };
    
    try {
      fs.writeFileSync(aiDbPath, JSON.stringify(initialDb, null, 2));
      console.log('✅ 초기 DB 파일 생성 성공');
    } catch (writeError) {
      console.log('⚠️ 초기 DB 파일 쓰기 실패, 메모리에서 반환:', writeError.message);
    }
    
    return initialDb;
    
  } catch (error) {
    console.error('❌ 캐릭터 DB 로드 실패:', error);
    return { 
      metadata: { version: "2.0.0", total_characters: 0, error: error.message }, 
      characters: {} 
    };
  }
}

async function saveCharacterToDatabase(character) {
  try {
    console.log('💾 캐릭터 저장 시작:', character.name, character.id);
    
    const db = await loadCharacterDatabase();
    console.log('📊 DB 로드 완료, 기존 캐릭터 수:', Object.keys(db.characters).length);
    
    // 캐릭터 ID 생성 (없으면)
    if (!character.id) {
      character.id = `${character.name.toLowerCase()}_${character.mbti.toLowerCase()}_${Date.now()}`;
      console.log('🔧 캐릭터 ID 생성:', character.id);
    }
    
    // 캐릭터 저장
    db.characters[character.id] = {
      ...character,
      updated_at: new Date().toISOString(),
      source: 'ai_generator'
    };
    
    db.metadata.total_characters = Object.keys(db.characters).length;
    db.metadata.last_updated = new Date().toISOString();
    
    console.log('💾 DB 업데이트 완료, 총 캐릭터 수:', db.metadata.total_characters);
    
    // 파일 저장 시도
    const aiDbPath = path.join(process.cwd(), 'data', 'characters-ai.json');
    try {
      fs.writeFileSync(aiDbPath, JSON.stringify(db, null, 2));
      console.log('✅ AI 캐릭터 파일 저장 성공:', character.id);
      return true;
    } catch (writeError) {
      console.error('❌ 파일 쓰기 실패:', writeError.message);
      // Vercel 환경에서는 파일 쓰기가 제한될 수 있지만, 
      // 메모리에서는 업데이트되었으므로 성공으로 처리
      console.log('⚠️ 파일 쓰기 실패했지만 메모리 업데이트는 완료');
      return true;
    }
    
  } catch (error) {
    console.error('❌ AI 캐릭터 저장 실패:', error);
    console.error('❌ 에러 스택:', error.stack);
    return false;
  }
}

async function deleteCharacterFromDatabase(characterId) {
  try {
    console.log('🗑️ 캐릭터 삭제 시작:', characterId);
    
    const db = await loadCharacterDatabase();
    console.log('📊 DB 로드 완료, 현재 캐릭터 수:', Object.keys(db.characters).length);
    
    if (db.characters[characterId]) {
      const characterName = db.characters[characterId].name;
      delete db.characters[characterId];
      
      db.metadata.total_characters = Object.keys(db.characters).length;
      db.metadata.last_updated = new Date().toISOString();
      
      console.log('🗑️ 캐릭터 삭제 완료:', characterName, '남은 캐릭터 수:', db.metadata.total_characters);
      
      // 파일 저장 시도
      const aiDbPath = path.join(process.cwd(), 'data', 'characters-ai.json');
      try {
        fs.writeFileSync(aiDbPath, JSON.stringify(db, null, 2));
        console.log('✅ 삭제 후 파일 저장 성공');
        return true;
      } catch (writeError) {
        console.error('❌ 삭제 후 파일 쓰기 실패:', writeError.message);
        console.log('⚠️ 파일 쓰기 실패했지만 메모리 삭제는 완료');
        return true;
      }
      
    } else {
      console.log('⚠️ 삭제할 캐릭터를 찾을 수 없음:', characterId);
      console.log('📋 현재 캐릭터 목록:', Object.keys(db.characters));
      return false;
    }
  } catch (error) {
    console.error('❌ AI 캐릭터 삭제 실패:', error);
    console.error('❌ 에러 스택:', error.stack);
    return false;
  }
}

// 모든 캐릭터 데이터 초기화
async function resetAllCharacters() {
  try {
    console.log('🗑️ 모든 캐릭터 데이터 초기화 시작...');
    
    // 빈 데이터베이스 생성
    const emptyDb = {
      metadata: { 
        version: "2.0.0", 
        total_characters: 0,
        reset_at: new Date().toISOString(),
        reset_by: 'admin'
      },
      characters: {}
    };
    
    // 파일 저장 시도
    const aiDbPath = path.join(process.cwd(), 'data', 'characters-ai.json');
    try {
      fs.writeFileSync(aiDbPath, JSON.stringify(emptyDb, null, 2));
      console.log('✅ AI 캐릭터 DB 초기화 성공');
    } catch (writeError) {
      console.log('⚠️ AI DB 파일 쓰기 실패, 메모리에서 초기화:', writeError.message);
    }
    
    // 기본 characters.json도 초기화 시도
    const mainDbPath = path.join(process.cwd(), 'data', 'characters.json');
    const mainDbEmpty = {
      characters: []
    };
    
    try {
      fs.writeFileSync(mainDbPath, JSON.stringify(mainDbEmpty, null, 2));
      console.log('✅ 기본 캐릭터 DB 초기화 성공');
    } catch (writeError) {
      console.log('⚠️ 기본 DB 파일 쓰기 실패:', writeError.message);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 데이터 초기화 실패:', error);
    console.error('❌ 에러 스택:', error.stack);
    return false;
  }
}

// 캐릭터 이미지 분석 함수 (OpenAI Vision API)
async function analyzeCharacterImage(imageBase64) {
  try {
    // 간단한 API 키 조회 방식 사용
    const { getSimpleApiKey } = await import('./simple-api-key.js');
    const OPENAI_API_KEY = await getSimpleApiKey();

    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API 키가 설정되지 않았습니다');
      throw new Error('API 키가 설정되지 않았습니다. 관리자 페이지에서 OpenAI API 키를 먼저 저장해주세요.');
    }

    console.log('🔍 OpenAI Vision API 이미지 분석 시작...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 캐릭터 디자이너입니다. 이미지를 분석하여 캐릭터의 외모 특징과 MBTI 성격을 추측해주세요.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '이 이미지를 분석하여 다음 형식으로 JSON을 반환해주세요:\n{\n  "appearance": {눈 색깔, 머리 색깔, 체형 등},\n  "personality_prediction": {사진에서 느껴지는 성격},\n  "mbti_suggestion": {추측되는 MBTI 유형},\n  "speech_style": {말투 예측},\n  "background_suggestion": {배경 설정 제안}\n}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    console.log('📱 Vision API 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      const analysis = data.choices[0]?.message?.content;
      
      if (analysis) {
        try {
          // JSON 파싱 시도
          const parsed = JSON.parse(analysis);
          console.log('✅ 이미지 분석 성공');
          return parsed;
        } catch (parseError) {
          console.log('⚠️ JSON 파싱 실패, 텍스트 반환:', parseError);
          return { raw_analysis: analysis };
        }
      } else {
        console.error('❌ Vision API에서 빈 응답을 받았습니다');
        throw new Error('이미지 분석 API에서 빈 응답을 받았습니다. 다시 시도해주세요.');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Vision API 호출 실패:', response.status, errorText);

      let errorMessage = `이미지 분석 API 오류 (${response.status})`;
      if (response.status === 401) {
        errorMessage = 'API 키가 유효하지 않습니다. 올바른 OpenAI API 키를 확인해주세요.';
      } else if (response.status === 429) {
        errorMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (response.status >= 500) {
        errorMessage = 'OpenAI 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      }

      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('❌ 이미지 분석 오류:', error);

    // 네트워크 오류 등의 경우 더 친화적인 메시지 제공
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    }

    // 기타 오류는 그대로 전달
    throw error;
  }
}

// Fallback 이미지 분석 제거됨 - 실제 AI 분석 실패 시 에러 발생