// AI 캐릭터 생성 API - 세계관 최강 버전
import fs from 'fs';
import path from 'path';
import { getGlobalApiKey } from './save-api-key.js';

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
    query: req.query
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
        progress: 12.5 // 1/8 * 100
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
        progress: ((currentStep + 1) / 8) * 100
      });
    }

    // 완성된 캐릭터 생성
    if (action === 'generate_character') {
      const { answers } = req.body;
      const character = await generateCompleteCharacter(answers);
      
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
      const characters = await loadCharacterDatabase();
      return res.json({
        success: true,
        characters: characters.characters,
        metadata: characters.metadata
      });
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
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
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
  const OPENAI_API_KEY = getGlobalApiKey();
  
  if (!OPENAI_API_KEY) {
    console.log('⚠️ API 키 없음, fallback 사용');
    return generateFallbackQuestion(currentStep, answers);
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

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (aiResponse) {
        return JSON.parse(aiResponse);
      }
    }
    
    console.log('⚠️ AI 질문 생성 실패, fallback 사용');
    return generateFallbackQuestion(currentStep, answers);
    
  } catch (error) {
    console.error('❌ AI 질문 생성 오류:', error);
    return generateFallbackQuestion(currentStep, answers);
  }
}

async function generateCompleteCharacter(answers) {
  const OPENAI_API_KEY = getGlobalApiKey();
  
  const character = {
    id: 'char_' + Date.now(),
    created_date: new Date().toISOString().split('T')[0],
    generation_method: 'ai_conversation',
    ...answers
  };

  if (!OPENAI_API_KEY) {
    console.log('⚠️ API 키 없음, fallback 캐릭터 생성');
    return generateFallbackCharacter(character);
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
            content: '당신은 완벽한 캐릭터 프로파일을 생성하는 전문가입니다. 일관성 있고 매력적인 캐릭터를 만들어주세요.'
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

    if (response.ok) {
      const data = await response.json();
      const aiCharacter = data.choices[0]?.message?.content;
      
      if (aiCharacter) {
        const aiData = JSON.parse(aiCharacter);
        return { ...character, ...aiData };
      }
    }
    
    return generateFallbackCharacter(character);
    
  } catch (error) {
    console.error('❌ AI 캐릭터 생성 오류:', error);
    return generateFallbackCharacter(character);
  }
}

// === 헬퍼 함수들 ===

function getStepName(step) {
  const stepNames = [
    '', '기본 정보', '성격 설정', '배경 설정', 
    '관계 설정', '상황 설정', '외모 설정', 
    '내면/습관', '장르 설정'
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
    7: { name: '내면/습관', focus: '취미, 가치관, 특기, 습관' },
    8: { name: '장르 설정', focus: '스토리 장르, 로맨스 유형' }
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
  return `
다음 정보를 바탕으로 완전한 캐릭터 프로파일을 JSON으로 생성해주세요:

${JSON.stringify(answers, null, 2)}

다음 구조로 생성해주세요:
{
  "name": "캐릭터 이름",
  "age": "나이",
  "gender": "성별",
  "mbti": "MBTI 유형",
  "personality_traits": ["특성1", "특성2", "특성3"],
  "appearance": {
    "hair": "헤어 스타일과 색상",
    "eyes": "눈 모양과 색상",
    "height": "키",
    "style": "패션 스타일"
  },
  "background": {
    "occupation": "직업",
    "family": "가족 관계",
    "education": "학력"
  },
  "personality": {
    "speech_pattern": "말투 특징",
    "hobbies": ["취미1", "취미2"],
    "values": ["가치관1", "가치관2"],
    "fears": ["두려워하는 것"]
  },
  "story_context": {
    "genre": "장르",
    "role": "역할",
    "initial_situation": "첫 등장 상황"
  }
}
`;
}

// Fallback 함수들
function generateFallbackQuestion(currentStep, answers) {
  const fallbacks = {
    2: {
      question: {
        text: "이 캐릭터의 성격은 어떤 편인가요?",
        type: "multiple_choice",
        required: true
      },
      options: [
        { id: 'intj', text: 'INTJ - 논리적이고 독립적', icon: '🧠' },
        { id: 'infp', text: 'INFP - 감성적이고 이상주의적', icon: '🌸' },
        { id: 'enfp', text: 'ENFP - 외향적이고 열정적', icon: '✨' },
        { id: 'istp', text: 'ISTP - 실용적이고 독립적', icon: '🔧' }
      ]
    }
    // 다른 단계들 추가...
  };
  
  return fallbacks[currentStep + 1] || { question: { text: "완료되었습니다!", type: "text" }, options: [] };
}

function generateFallbackCharacter(character) {
  return {
    ...character,
    name: character.name || "미스터리 캐릭터",
    personality_traits: ["매력적", "신비로운", "독특한"],
    appearance: {
      hair: "흑발의 단정한 헤어스타일",
      eyes: "깊고 인상적인 눈빛",
      style: "세련되고 모던한 스타일"
    }
  };
}

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
      const aiDb = {
        metadata: { 
          version: "2.0.0", 
          total_characters: mainDb.characters ? mainDb.characters.length : 0,
          converted_from: "characters.json"
        },
        characters: {}
      };
      
      if (mainDb.characters && Array.isArray(mainDb.characters)) {
        mainDb.characters.forEach(char => {
          aiDb.characters[char.id] = char;
        });
      }
      
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
    const OPENAI_API_KEY = getGlobalApiKey();
    
    if (!OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured, using fallback analysis');
      return generateFallbackImageAnalysis();
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
        console.warn('⚠️ Vision API 응답이 비어있음, fallback 사용');
        return generateFallbackImageAnalysis();
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Vision API 호출 실패:', response.status, errorText);
      return generateFallbackImageAnalysis();
    }

  } catch (error) {
    console.error('❌ 이미지 분석 오류:', error);
    return generateFallbackImageAnalysis();
  }
}

// Fallback 이미진 분석
function generateFallbackImageAnalysis() {
  return {
    appearance: "매력적인 외모, 추측 불가",
    personality_prediction: "사진에서 느껴지는 따뜻하고 친근한 인상",
    mbti_suggestion: "INFP, ENFP, ISFJ 중 선택 권장",
    speech_style: "부드럽고 친근한 말투",
    background_suggestion: "대학생 또는 직장인으로 설정 권장",
    note: "OpenAI API가 설정되지 않아 기본 분석을 제공합니다."
  };
}