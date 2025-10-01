// AI 캐릭터 생성 API - v4.2.0 (사진 관리 기능 통합)
// 상태: 안정적인 GitHub 직접 방식 + 캐릭터 사진 관리 시스템 통합
// 이전 문제: Vercel 서버리스 환경에서 메모리 캐시가 요청 간 유지되지 않아 500 오류 발생

const DEFAULT_METADATA = {
  version: "4.2.0",
  total_characters: 0,
  created: new Date().toISOString(),
  storage_type: "stable_github_direct",
  last_updated: new Date().toISOString(),
  performance_mode: "stable_reliable"
};

// 📸 사진 관리 시스템 추가
const PHOTO_CATEGORIES = {
    'profile': { name: '프로필', max: 1, description: '메인 프로필 사진' },
    'casual': { name: '일상', max: 5, description: '일상적인 모습' },
    'romantic': { name: '로맨틱', max: 5, description: '로맨틱한 순간' },
    'emotional': { name: '감정표현', max: 5, description: '다양한 감정 표현' },
    'special': { name: '특별한순간', max: 4, description: '특별한 이벤트나 순간' }
};

const PHOTOS_FILE_PATH = 'data/character-photos.json';

// 🔧 사진 관리 유틸리티 함수들
function validatePhotoData(photoData, category) {
    if (!photoData || !photoData.startsWith('data:image/')) {
        throw new Error('유효하지 않은 이미지 데이터입니다.');
    }

    if (!PHOTO_CATEGORIES[category]) {
        throw new Error(`지원하지 않는 카테고리입니다: ${category}`);
    }

    // Base64 데이터 크기 확인 (약 3MB 제한 - Vercel 4.5MB 페이로드 제한 고려)
    const sizeInBytes = (photoData.length * 3) / 4;
    const maxSizeInBytes = 3 * 1024 * 1024; // 3MB (Base64로 인코딩 시 약 4MB가 되어 Vercel 4.5MB 제한 내)

    if (sizeInBytes > maxSizeInBytes) {
        throw new Error(`이미지 크기가 너무 큽니다. 최대 3MB까지 지원됩니다. (현재: ${Math.round(sizeInBytes / (1024 * 1024) * 10) / 10}MB)`);
    }

    return true;
}

function generatePhotoId(characterId, category) {
    const timestamp = Date.now();
    return `${characterId}_${category}_${timestamp}`;
}

module.exports = async function handler(req, res) {
  // 🚨 강력한 디버깅: API 호출 시작
  console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
  console.log('🚨 API CHARACTER-AI-GENERATOR 호출 시작 🚨');
  console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
  console.log('📅 타임스탬프:', new Date().toISOString());
  console.log('🌐 메소드:', req.method);
  console.log('📋 Query Params:', req.query);
  console.log('📋 Request Body:', JSON.stringify(req.body, null, 2));

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS 요청 처리됨');
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  // 디버깅 정보를 클라이언트로 전송하기 위해 저장
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    detected_action: action,
    action_type: typeof action,
    query_action: req.query.action,
    body_action: req.body?.action,
    body_keys: req.body ? Object.keys(req.body) : [],
    request_body_sample: req.body ? JSON.stringify(req.body).substring(0, 500) : null
  };

  console.log('🎯🎯🎯 액션 식별 완료 🎯🎯🎯');
  console.log('📌 감지된 액션:', action);
  console.log('📌 액션 타입:', typeof action);
  console.log('📌 Query에서 추출:', req.query.action);
  console.log('📌 Body에서 추출:', req.body?.action);

  console.log('🎭 새로운 캐릭터 생성 AI 요청:', {
    method: req.method,
    action,
    timestamp: new Date().toISOString()
  });

  try {
    // v4.1.0 캐릭터 리스트 조회 (안정적인 GitHub 직접 방식)
    if (action === 'list_characters') {
      console.log('✅ 🔍 액션 매칭: list_characters');
      console.log('🛡️ 안정적인 GitHub 직접 조회 (v4.1.0)...');

      try {
        // GitHub에서 직접 로드 (타임아웃 추가)
        const characterData = await loadFromGitHub();

        if (characterData) {
          console.log('✅ GitHub 직접 로드 성공:', Object.keys(characterData.characters || {}).length, '개 캐릭터');
          return res.json({
            success: true,
            data: characterData,
            characters: characterData.characters,
            metadata: characterData.metadata,
            message: 'GitHub에서 캐릭터 데이터를 성공적으로 로드했습니다',
            source: 'github_success'
          });
        } else {
          console.log('📂 GitHub에 캐릭터 데이터 없음, 빈 응답 반환');
          // 빈 데이터로 응답
          const emptyData = {
            characters: {},
            metadata: {
              ...DEFAULT_METADATA,
              total_characters: 0
            }
          };
          return res.json({
            success: true,
            data: emptyData,
            message: 'GitHub에 캐릭터 데이터가 없습니다',
            source: 'github_empty'
          });
        }
      } catch (error) {
        console.error('❌ GitHub 로드 실패:', error.message);

        // 빈 데이터로 graceful fallback
        const fallbackData = {
          characters: {},
          metadata: {
            ...DEFAULT_METADATA,
            total_characters: 0,
            storage_type: 'fallback_empty'
          }
        };

        return res.json({
          success: true,
          data: fallbackData,
          message: 'GitHub 연결 실패, 빈 상태로 시작합니다',
          warning: 'GitHub API 연결에 문제가 있습니다',
          source: 'fallback'
        });
      }

      // 정상적으로 데이터를 로드한 경우
      return res.json({
        success: true,
        data: characterData,
        characters: characterData.characters,
        metadata: characterData.metadata,
        message: 'GitHub에서 캐릭터 데이터를 성공적으로 로드했습니다',
        source: 'github_success'
      });
    }

    // 모든 캐릭터 데이터 초기화
    if (action === 'reset_all_characters') {
      console.log('🐙 GitHub API 전용 캐릭터 데이터 초기화...');

      // 완전 초기화된 데이터 구조 생성
      const resetData = {
        characters: {},
        metadata: {
          ...DEFAULT_METADATA,
          reset_at: new Date().toISOString(),
          total_characters: 0
        }
      };

      // GitHub API로 초기화 상태 저장
      try {
        await saveToGitHub(resetData);
        console.log('🎉 GitHub에 초기화 상태 저장 완료');
      } catch (error) {
        console.error('❌ GitHub 초기화 저장 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: 'GitHub 초기화 실패: ' + error.message
        });
      }

      console.log('✅ GitHub API 전용 캐릭터 초기화 완료');

      return res.json({
        success: true,
        message: '모든 캐릭터 데이터가 초기화되었습니다',
        github_updated: true
      });
    }

    // v4.1.0 캐릭터 저장 (안정적인 GitHub 직접 방식)
    if (action === 'save_character') {
      console.log('✅ 💾 액션 매칭: save_character');
      console.log('🛡️ 안정적인 GitHub 직접 저장 시작 (v4.1.0)...');

      // scenario-admin.html에서 {action: 'save_character', character: {...}} 형태로 전송
      const characterData = req.body.character || req.body;

      // action 필드 제거 (characterData에 action이 있을 경우)
      if (characterData.action) {
        delete characterData.action;
      }

      console.log('💾 캐릭터 저장 요청 v2.0:', characterData);

      // 🔄 새로운 스키마와 기존 스키마 호환성 처리
      const name = characterData.basic_info?.name || characterData.name;
      const mbti = characterData.basic_info?.mbti || characterData.mbti;

      console.log('📋 추출된 필수 정보:');
      console.log('  - 이름:', name);
      console.log('  - MBTI:', mbti);
      console.log('  - 스키마 타입:', characterData.basic_info ? 'v2.0 (복잡한 스키마)' : 'v1.0 (기존 스키마)');

      if (!name || !mbti) {
        return res.status(400).json({
          success: false,
          message: 'Character name and MBTI are required (both v1.0 and v2.0 schema supported)'
        });
      }

      console.log('💾 안정적인 GitHub 직접 저장 시작:', name);

      // ID가 없으면 생성 (v2.0 호환)
      if (!characterData.id) {
        characterData.id = `${name.toLowerCase().replace(/\s+/g, '_')}_${mbti.toLowerCase()}_${Date.now()}`;
      }

      // 🛡️ 안정적인 GitHub 직접 저장
      try {
        // 기존 데이터 로드
        const existingData = await loadFromGitHub() || {
          characters: {},
          metadata: {
            ...DEFAULT_METADATA,
            total_characters: 0
          }
        };

        // 캐릭터 추가/업데이트
        existingData.characters[characterData.id] = {
          ...characterData,
          id: characterData.id,
          created_at: characterData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // 메타데이터 업데이트
        existingData.metadata = {
          ...existingData.metadata,
          total_characters: Object.keys(existingData.characters).length,
          last_updated: new Date().toISOString(),
          version: "4.1.0",
          storage_type: "stable_github_direct"
        };

        // GitHub에 직접 저장
        const saveResult = await saveToGitHub(existingData);

        if (saveResult) {
          console.log('🎉 GitHub 직접 저장 완료');
          return res.json({
            success: true,
            message: `캐릭터 '${name}' 저장 완료 (안정적인 v4.1.0)`,
            character: characterData,
            storage_info: {
              github_confirmed: true,
              response_time: 'stable',
              data_integrity: 'verified',
              method: 'github_direct'
            }
          });
        } else {
          throw new Error('GitHub 저장 실패');
        }

      } catch (error) {
        console.error('❌ GitHub 직접 저장 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: `캐릭터 저장 실패: ${error.message}`,
          details: 'GitHub 직접 저장 실패',
          storage_info: {
            github_confirmed: false,
            method: 'github_direct_failed'
          }
        });
      }
    }

    // AI 캐릭터 생성 - 부분 입력으로 완성
    if (action === 'generate_character') {
      const inputData = req.body;

      console.log('🤖 AI 캐릭터 생성 시작:', inputData);

      try {
        // 🧠 실제 OpenAI API를 사용한 지능적 캐릭터 완성
        const character = await generateCharacterWithAI(inputData);

        return res.json({
          success: true,
          character: character,
          message: '캐릭터가 AI에 의해 성공적으로 완성되었습니다!'
        });
      } catch (error) {
        console.error('❌ AI 캐릭터 생성 실패:', error);

        // AI 실패 시 fallback으로 기존 랜덤 생성 사용
        console.log('🔄 Fallback: 랜덤 생성으로 전환');
        const character = generateRandomCharacterFromInput(inputData);

        return res.json({
          success: true,
          character: character,
          message: '캐릭터가 완성되었습니다 (AI 오류로 인한 기본 생성)',
          fallback: true
        });
      }
    }

    // 🎭 캐릭터 프롬프트 생성 (OpenAI API 기반)
    if (action === 'generate_character_prompt') {
      const { character_data, model, style, length, system_prompt } = req.body;

      console.log('🎭 캐릭터 프롬프트 생성 시작');
      console.log('📋 캐릭터:', character_data?.basic_info?.name);
      console.log('🤖 모델:', model);
      console.log('📝 스타일:', style);
      console.log('📏 길이:', length);

      if (!character_data) {
        return res.status(400).json({
          success: false,
          error: '캐릭터 데이터가 필요합니다.'
        });
      }

      try {
        // OpenAI 전송용 안전한 구간만 추출 (민감한 필드 완전 제외)
        const safeCharacterData = extractSafeDataForOpenAI(character_data);
        console.log('🎯 안전한 구간만 추출 완료 - 민감한 필드 제외됨');

        // OpenAI API를 통한 프롬프트 생성
        const prompt = await generateCharacterPromptWithOpenAI(safeCharacterData, model, style, length, system_prompt);

        console.log('✅ 프롬프트 생성 성공');
        return res.json({
          success: true,
          prompt: prompt,
          character_name: character_data.basic_info?.name,
          model_used: model,
          style: style,
          length: length
        });

      } catch (error) {
        console.error('❌ 프롬프트 생성 실패 (첫 번째 시도):', error);

        // 재시도 로직 - 더 간단한 모델과 더 짧은 길이로 재시도
        try {
          console.log('🔄 더 안정적인 설정으로 재시도 중...');

          const retryPrompt = await generateCharacterPromptWithOpenAI(safeCharacterData, 'gpt-4o', style, 'medium', 'AI 캐릭터 프롬프트를 상세하게 작성해주세요. 제공된 모든 캐릭터 정보를 빠짐없이 포함해야 합니다.');

          return res.json({
            success: true,
            prompt: retryPrompt,
            character_name: character_data.basic_info?.name,
            model_used: 'gpt-4o-retry',
            style: style,
            length: length,
            retry: true,
            message: '재시도를 통해 프롬프트를 성공적으로 생성했습니다.'
          });

        } catch (retryError) {
          console.error('❌ 재시도도 실패:', retryError);

          // 두 번째 재시도 - 가장 짧은 길이로
          try {
            console.log('🔄 최종 재시도 중 (짧은 길이)...');

            const finalRetryPrompt = await generateCharacterPromptWithOpenAI(safeCharacterData, 'gpt-4o', style, 'short', 'AI 캐릭터 프롬프트를 작성해주세요. 모든 캐릭터 데이터를 포함해야 합니다.');

            return res.json({
              success: true,
              prompt: finalRetryPrompt,
              character_name: character_data.basic_info?.name,
              model_used: 'gpt-4o-final-retry',
              style: style,
              length: 'short',
              final_retry: true,
              message: '최종 재시도를 통해 짧은 프롬프트를 생성했습니다.'
            });

          } catch (finalError) {
            console.error('❌ 모든 재시도 실패:', finalError);

            return res.status(500).json({
              success: false,
              message: 'OpenAI API가 모든 재시도에서 실패했습니다. 잠시 후 다시 시도해주세요.',
              error: finalError.message,
              original_error: error.message,
              retry_error: retryError.message
            });
          }
        }
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

      console.log('🐙 GitHub API 전용 캐릭터 삭제:', character_id);

      // GitHub에서 현재 데이터 로드
      const existingData = await loadFromGitHub();

      if (!existingData || !existingData.characters[character_id]) {
        return res.status(404).json({
          success: false,
          message: 'Character not found'
        });
      }

      const characterName = existingData.characters[character_id].name;
      console.log('🗑️ 삭제할 캐릭터:', characterName);

      // 캐릭터 삭제된 새로운 데이터 구조 생성
      const updatedData = {
        characters: { ...existingData.characters },
        metadata: {
          ...existingData.metadata,
          total_characters: Object.keys(existingData.characters).length - 1,
          last_updated: new Date().toISOString(),
          storage_type: 'github_api_only'
        }
      };

      // 해당 캐릭터 삭제
      delete updatedData.characters[character_id];

      // GitHub API로 업데이트 저장
      try {
        await saveToGitHub(updatedData);
        console.log('🎉 GitHub에서 캐릭터 삭제 완료');
      } catch (error) {
        console.error('❌ GitHub 삭제 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: 'GitHub 삭제 실패: ' + error.message
        });
      }

      console.log('✅ 캐릭터 삭제 완료:', characterName);
      console.log('📊 남은 캐릭터 수:', updatedData.metadata.total_characters);

      return res.json({
        success: true,
        message: 'Character deleted successfully',
        character_id: character_id,
        character_name: characterName,
        github_updated: true
      });
    }

    // 캐릭터 자동 완성 기능 (새로 추가)
    if (action === 'auto_complete_character') {
      const inputData = req.body;
      console.log('🎯 캐릭터 자동 완성 요청:', inputData);

      try {
        const completedCharacter = await autoCompleteCharacter(inputData);
        return res.json({
          success: true,
          character: completedCharacter,
          message: '캐릭터 정보가 자동으로 완성되었습니다!'
        });
      } catch (error) {
        console.error('❌ 캐릭터 자동 완성 실패:', error);
        return res.status(500).json({
          success: false,
          message: '캐릭터 자동 완성 실패: ' + error.message
        });
      }
    }

    // AI 인물 소개 생성 기능 (새로 추가)
    if (action === 'generate_character_profile') {
      const characterData = req.body;
      console.log('📝 인물 소개 생성 요청:', characterData);

      try {
        const characterProfile = await generateCharacterProfile(characterData);
        return res.json({
          success: true,
          profile: characterProfile,
          message: 'AI 인물 소개가 성공적으로 생성되었습니다!'
        });
      } catch (error) {
        console.error('❌ 인물 소개 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: '인물 소개 생성 실패: ' + error.message
        });
      }
    }

    // 🚀 통합된 캐릭터 생성 + 프로필 생성 (새로운 워크플로우)
    if (action === 'generate_complete_character_with_profile') {
      console.log('🚀🚀🚀 === 통합 캐릭터 생성 시작 === 🚀🚀🚀');
      console.log('📋 요청 바디:', JSON.stringify(req.body, null, 2));

      try {
        // 1️⃣ 필수 필드 검증
        const { name, age, mbti } = req.body;
        if (!name || !age || !mbti) {
          return res.status(400).json({
            success: false,
            message: '이름, 나이, MBTI는 필수 입력 사항입니다.',
            required_fields: ['name', 'age', 'mbti']
          });
        }

        console.log('✅ 필수 필드 검증 완료:', { name, age, mbti });
        console.log('📋 받은 전체 데이터:', req.body);

        // 2️⃣ AI를 사용한 캐릭터 생성 시도
        try {
          console.log('🤖 AI 캐릭터 생성 시작...');
          const aiCharacter = await generateCharacterWithAI(req.body);
          console.log('✅ AI 캐릭터 생성 성공:', aiCharacter);

          // 3️⃣ 인물소개 프롬프트 생성
          const characterProfile = generateSimpleProfile(aiCharacter);

          console.log('🎉 AI 통합 캐릭터 생성 완료:', {
            character_name: aiCharacter.basic_info.name,
            has_profile: !!characterProfile.profile_text
          });

          return res.json({
            success: true,
            character: aiCharacter,
            character_profile: characterProfile,
            message: `${aiCharacter.basic_info.name} 캐릭터가 AI로 완전히 생성되었습니다!`,
            workflow: 'ai_generation',
            ai_powered: true,
            debug_info: debugInfo,
            execution_path: 'AI_GENERATION_SUCCESS'
          });

        } catch (aiError) {
          console.error('❌ AI 생성 실패:', aiError);
          console.log('🔄 Fallback: 기본 생성으로 전환');

          // AI 실패 시 fallback으로 기본 생성 사용
          const characterData = convertToV2Schema(req.body);
          console.log('🔄 v2.0 스키마로 변환 완료:', characterData);

          const characterProfile = generateSimpleProfile(characterData);

          console.log('🎉 Fallback 캐릭터 생성 완료:', {
            character_name: characterData.basic_info.name,
            has_profile: !!characterProfile.profile_text
          });

          return res.json({
            success: true,
            character: characterData,
            character_profile: characterProfile,
            message: `${characterData.basic_info.name} 캐릭터가 생성되었습니다 (AI 오류로 인한 기본 생성)`,
            workflow: 'fallback_generation',
            ai_powered: false,
            fallback: true,
            debug_info: debugInfo,
            execution_path: 'FALLBACK_GENERATION',
            ai_error: aiError.message
          });
        }

      } catch (error) {
        console.error('❌ 통합 캐릭터 생성 실패:', error);
        return res.status(500).json({
          success: false,
          message: '통합 캐릭터 생성 실패: ' + error.message,
          error_type: 'unified_generation_error'
        });
      }
    }

    // 📸 사진 관리 액션들
    if (action === 'list_all_photos') {
      console.log('📸 모든 사진 목록 조회');
      try {
        const photosData = await loadPhotosFromGitHub();
        return res.status(200).json({
          success: true,
          data: photosData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ 사진 목록 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: error.message || '사진 데이터 로드 실패',
          error_type: 'photo_list_error'
        });
      }
    }

    if (action === 'get_character_photos') {
      const character_id = req.query.character_id || req.body?.character_id;
      console.log('📸 캐릭터 사진 조회:', character_id);

      if (!character_id) {
        return res.status(400).json({
          success: false,
          message: '캐릭터 ID가 필요합니다.'
        });
      }

      try {
        console.log('🔄 사진 데이터 로딩 시작...');

        let photosData;
        try {
          photosData = await loadPhotosFromGitHub();
          console.log('✅ 사진 데이터 로딩 성공');
          console.log('🔍 로드된 사진 데이터 구조:', {
            isArray: Array.isArray(photosData),
            hasPhotosProperty: !!photosData.photos,
            hasMetadataProperty: !!photosData.metadata,
            topLevelKeys: Object.keys(photosData),
            firstFewKeys: Object.keys(photosData).slice(0, 3)
          });
          console.log('🔍 캐릭터 ID 검색:', {
            searchingFor: character_id,
            exists: !!photosData[character_id],
            existsInPhotos: !!photosData.photos?.[character_id]
          });

          // 실제 캐릭터 ID들을 확인해보자
          if (photosData.photos) {
            console.log('📋 photos 속성 내 캐릭터 ID들:', Object.keys(photosData.photos));
          }

          // 최상위 레벨의 캐릭터 ID들을 확인
          const topLevelCharIds = Object.keys(photosData).filter(key =>
            key !== 'photos' && key !== 'metadata'
          );
          console.log('📋 최상위 레벨 캐릭터 ID들:', topLevelCharIds);
        } catch (parseError) {
          console.error('❌ 사진 데이터 파싱 실패:', parseError.message);

          // JSON 파싱 실패 시 빈 데이터로 복구
          photosData = {
            photos: {},
            metadata: {
              version: "1.0.0",
              total_photos: 0,
              created: new Date().toISOString(),
              last_updated: new Date().toISOString()
            }
          };

          console.log('🔧 빈 사진 데이터로 복구됨');
        }

        // 올바른 데이터 구조로 캐릭터 사진 조회 - 두 가지 가능한 구조 처리
        let characterPhotos;

        // 구조 1: photosData[character_id] (현재 character-photos.json 구조)
        if (photosData[character_id]) {
          characterPhotos = photosData[character_id];
          console.log('✅ 직접 접근으로 캐릭터 사진 데이터 발견');
        }
        // 구조 2: photosData.photos[character_id] (기존 구조)
        else if (photosData.photos && photosData.photos[character_id]) {
          characterPhotos = photosData.photos[character_id];
          console.log('✅ photos 속성 내에서 캐릭터 사진 데이터 발견');
        }
        // 구조 3: 데이터 없음 - 기본값
        else {
          characterPhotos = {
            character_id,
            photos: Object.keys(PHOTO_CATEGORIES).reduce((acc, cat) => {
              acc[cat] = cat === 'profile' ? null : [];
              return acc;
            }, {}),
            photo_count: 0
          };
          console.log('❌ 캐릭터 사진 데이터 없음 - 기본값 사용');
        }

        console.log(`📊 캐릭터 ${character_id} 사진 개수:`, characterPhotos.photo_count);

        // 대용량 데이터로 인한 JSON 직렬화 에러 방지 - 사진 데이터 크기 확인
        const photoDataSize = JSON.stringify(characterPhotos).length;
        console.log(`📏 사진 데이터 크기: ${Math.round(photoDataSize / 1024)}KB`);

        // 3MB 이상의 데이터는 요약 형태로 반환 (Vercel 4.5MB 제한 고려)
        if (photoDataSize > 3 * 1024 * 1024) {
          console.log('⚠️ 데이터가 너무 큼 - 요약 형태로 반환');
          const summaryPhotos = {
            ...characterPhotos,
            photos: Object.keys(characterPhotos.photos || {}).reduce((acc, cat) => {
              const photos = characterPhotos.photos[cat];
              if (Array.isArray(photos)) {
                acc[cat] = photos.map(photo => ({ ...photo, data: '[DATA_TOO_LARGE]' }));
              } else if (photos && photos.data) {
                acc[cat] = { ...photos, data: '[DATA_TOO_LARGE]' };
              } else {
                acc[cat] = photos;
              }
              return acc;
            }, {})
          };

          return res.status(200).json({
            success: true,
            data: summaryPhotos,
            categories: PHOTO_CATEGORIES,
            warning: '데이터가 너무 커서 요약 형태로 반환됩니다.'
          });
        }

        const responseData = {
          success: true,
          data: characterPhotos,
          categories: PHOTO_CATEGORIES
        };

        console.log('📤 응답 데이터 준비 완료');
        return res.status(200).json(responseData);

      } catch (error) {
        console.error('❌ 캐릭터 사진 조회 실패:', error);
        console.error('❌ 에러 스택:', error.stack);

        return res.status(500).json({
          success: false,
          message: error.message || '캐릭터 사진 조회 실패',
          error_type: 'character_photos_error',
          character_id: character_id
        });
      }
    }

    // 📷 개별 파일에서 캐릭터 사진 조회
    if (action === 'get_character_photos_v2') {
      const character_id = req.query.character_id || req.body?.character_id;
      console.log('📷 개별 파일에서 캐릭터 사진 조회:', character_id);

      try {
        if (!character_id) {
          return res.status(400).json({
            success: false,
            message: '캐릭터 ID가 필요합니다.'
          });
        }

        // GitHub에서 해당 캐릭터의 모든 사진 파일 검색
        const octokit = new (require('@octokit/rest').Octokit)({
          auth: process.env.GITHUB_TOKEN
        });

        console.log('🔍 GitHub에서 사진 파일 검색 중...');

        // data/photos 폴더에서 해당 캐릭터 파일들 찾기
        let photoFiles = [];
        let contentsResponse = null;

        try {
          contentsResponse = await octokit.repos.getContent({
            owner: 'EnmanyProject',
            repo: 'chatgame',
            path: 'data/photos'
          });

          console.log(`📁 GitHub API 응답 상태: ${contentsResponse.status}`);
          console.log(`📁 응답 데이터 타입: ${typeof contentsResponse.data}`);
          console.log(`📁 응답 데이터 배열 여부: ${Array.isArray(contentsResponse.data)}`);

          if (Array.isArray(contentsResponse.data)) {
            photoFiles = contentsResponse.data.filter(file =>
              file.name.startsWith(character_id) && file.name.endsWith('.json')
            );
          }
        } catch (dirError) {
          console.log('📁 photos 폴더가 없거나 비어있음:', dirError.message);
          console.log('❌ GitHub API 오류 상세:', dirError);
        }

        console.log(`📊 찾은 사진 파일 수: ${photoFiles.length}`);
        console.log(`🔍 검색 기준: character_id=${character_id}`);

        // contentsResponse가 정의되었을 때만 접근
        if (contentsResponse && contentsResponse.data) {
          console.log(`📁 전체 파일 목록:`, Array.isArray(contentsResponse.data) ?
            contentsResponse.data.map(f => f.name) : 'contentsResponse.data is not array');
        } else {
          console.log(`📁 contentsResponse가 정의되지 않았거나 data가 없음`);
        }

        console.log(`✅ 필터링된 파일:`, photoFiles.map(f => f.name));

        // 각 파일에서 사진 데이터 로드
        const characterPhotos = {
          character_id,
          character_name: character_id.split('_')[0],
          photos: {
            profile: null,
            casual: [],
            romantic: [],
            emotional: [],
            special: []
          },
          photo_count: 0,
          updated_at: new Date().toISOString()
        };

        for (const file of photoFiles) {
          console.log(`🔍 파일 처리 시작: ${file.name}`);
          try {
            const fileResponse = await octokit.repos.getContent({
              owner: 'EnmanyProject',
              repo: 'chatgame',
              path: file.path
            });

            console.log(`📁 파일 응답 상태: ${fileResponse.status}`);
            console.log(`📁 파일 size: ${fileResponse.data.size}`);
            console.log(`📁 파일 truncated: ${fileResponse.data.truncated}`);
            console.log(`📁 파일 content 길이: ${fileResponse.data.content ? fileResponse.data.content.length : 'no content'}`);

            // GitHub API는 1MB 이상 파일을 truncate함 - 이 경우 Git Blob API 사용
            if (fileResponse.data.truncated || fileResponse.data.size > 1000000) {
              console.log(`⚠️ 파일이 너무 큼 (${fileResponse.data.size} bytes) 또는 잘림 - Git Blob API 사용`);

              // Git Blob API로 전체 파일 내용 가져오기
              const blobResponse = await octokit.git.getBlob({
                owner: 'EnmanyProject',
                repo: 'chatgame',
                file_sha: fileResponse.data.sha
              });

              console.log(`📦 Blob API 응답 크기: ${blobResponse.data.content.length}`);
              const content = Buffer.from(blobResponse.data.content, 'base64').toString();
              console.log(`📄 Blob 디코딩된 content 길이: ${content.length}`);
              console.log(`📄 Blob content 미리보기: ${content.substring(0, 100)}...`);

              const photoData = JSON.parse(content);
              console.log(`📊 Blob 파싱된 데이터:`, {
                hasCategory: !!photoData.category,
                category: photoData.category,
                hasPhotoData: !!photoData.photo_data,
                photoDataLength: photoData.photo_data ? photoData.photo_data.length : 0
              });

              // 카테고리별로 분류 - Blob API 버전
              if (photoData.category === 'profile') {
                console.log(`🎯 프로필 사진 발견! (Blob API) 파일: ${file.name}`);
                console.log(`🎯 설정 전 characterPhotos.photos.profile:`, characterPhotos.photos.profile);

                characterPhotos.photos.profile = {
                  id: file.name,
                  data: photoData.photo_data,
                  uploaded_at: photoData.uploaded_at
                };

                console.log(`🎯 설정 후 characterPhotos.photos.profile:`, {
                  id: characterPhotos.photos.profile.id,
                  hasData: !!characterPhotos.photos.profile.data,
                  dataLength: characterPhotos.photos.profile.data ? characterPhotos.photos.profile.data.length : 0,
                  uploaded_at: characterPhotos.photos.profile.uploaded_at
                });
                console.log(`✅ 프로필 사진 설정 완료 (Blob API): ${file.name}`);
              } else if (characterPhotos.photos[photoData.category]) {
                characterPhotos.photos[photoData.category].push({
                  id: file.name,
                  data: photoData.photo_data,
                  uploaded_at: photoData.uploaded_at
                });
                console.log(`✅ ${photoData.category} 사진 추가 완료 (Blob API): ${file.name}`);
              } else {
                console.log(`⚠️ 알 수 없는 카테고리 (Blob API): ${photoData.category} (파일: ${file.name})`);
              }

              characterPhotos.photo_count++;
              console.log(`📊 현재 총 사진 수 (Blob API): ${characterPhotos.photo_count}`);
              continue; // 다음 파일로 넘어감
            }

            const content = Buffer.from(fileResponse.data.content, 'base64').toString();
            console.log(`📄 디코딩된 content 길이: ${content.length}`);
            console.log(`📄 content 미리보기: ${content.substring(0, 100)}...`);

            const photoData = JSON.parse(content);
            console.log(`📊 파싱된 데이터:`, {
              hasCategory: !!photoData.category,
              category: photoData.category,
              hasPhotoData: !!photoData.photo_data,
              photoDataLength: photoData.photo_data ? photoData.photo_data.length : 0
            });

            // 카테고리별로 분류 - 더 상세한 로깅 추가
            if (photoData.category === 'profile') {
              console.log(`🎯 프로필 사진 발견! 파일: ${file.name}`);
              console.log(`🎯 설정 전 characterPhotos.photos.profile:`, characterPhotos.photos.profile);

              characterPhotos.photos.profile = {
                id: file.name,
                data: photoData.photo_data,
                uploaded_at: photoData.uploaded_at
              };

              console.log(`🎯 설정 후 characterPhotos.photos.profile:`, {
                id: characterPhotos.photos.profile.id,
                hasData: !!characterPhotos.photos.profile.data,
                dataLength: characterPhotos.photos.profile.data ? characterPhotos.photos.profile.data.length : 0,
                uploaded_at: characterPhotos.photos.profile.uploaded_at
              });
              console.log(`✅ 프로필 사진 설정 완료: ${file.name}`);
            } else if (characterPhotos.photos[photoData.category]) {
              characterPhotos.photos[photoData.category].push({
                id: file.name,
                data: photoData.photo_data,
                uploaded_at: photoData.uploaded_at
              });
              console.log(`✅ ${photoData.category} 사진 추가 완료: ${file.name}`);
            } else {
              console.log(`⚠️ 알 수 없는 카테고리: ${photoData.category} (파일: ${file.name})`);
            }

            characterPhotos.photo_count++;
            console.log(`📊 현재 총 사진 수: ${characterPhotos.photo_count}`);
          } catch (parseError) {
            console.log(`❌ 파일 파싱 실패: ${file.name}`, parseError.message);
            console.log(`❌ 파싱 오류 상세:`, parseError);
          }
        }

        console.log(`✅ 로드된 사진 수: ${characterPhotos.photo_count}`);

        // 최종 프로필 사진 상태 확인
        console.log(`🔍 최종 프로필 사진 상태:`, {
          hasProfile: !!characterPhotos.photos.profile,
          profileType: typeof characterPhotos.photos.profile,
          profileNull: characterPhotos.photos.profile === null,
          profileUndefined: characterPhotos.photos.profile === undefined,
          profileKeys: characterPhotos.photos.profile ? Object.keys(characterPhotos.photos.profile) : 'no keys'
        });

        // 처리 요약 정보 생성 - Git Blob API 지원
        const processing_summary = [];
        for (const file of photoFiles) {
          try {
            const fileResponse = await octokit.repos.getContent({
              owner: 'EnmanyProject',
              repo: 'chatgame',
              path: file.path
            });

            let content;
            let usedBlobAPI = false;

            // 큰 파일의 경우 Git Blob API 사용
            if (fileResponse.data.truncated || fileResponse.data.size > 1000000) {
              const blobResponse = await octokit.git.getBlob({
                owner: 'EnmanyProject',
                repo: 'chatgame',
                file_sha: fileResponse.data.sha
              });
              content = Buffer.from(blobResponse.data.content, 'base64').toString();
              usedBlobAPI = true;
            } else {
              content = Buffer.from(fileResponse.data.content, 'base64').toString();
            }

            const photoData = JSON.parse(content);

            processing_summary.push({
              filename: file.name,
              status: 'success',
              category: photoData.category,
              has_photo_data: !!photoData.photo_data,
              photo_data_length: photoData.photo_data ? photoData.photo_data.length : 0,
              file_size: fileResponse.data.size,
              used_blob_api: usedBlobAPI,
              truncated: fileResponse.data.truncated
            });
          } catch (summaryError) {
            processing_summary.push({
              filename: file.name,
              status: 'error',
              error: summaryError.message
            });
          }
        }

        return res.status(200).json({
          success: true,
          data: characterPhotos,
          categories: PHOTO_CATEGORIES,
          debug_info: {
            github_response_status: contentsResponse ? contentsResponse.status : 'no_response',
            total_files_found: contentsResponse && Array.isArray(contentsResponse.data) ? contentsResponse.data.length : 0,
            filtered_files_count: photoFiles.length,
            search_character_id: character_id,
            files_searched_in_github: contentsResponse && Array.isArray(contentsResponse.data) ?
              contentsResponse.data.map(f => f.name) : ['no_files_or_not_array'],
            file_processing_summary: processing_summary
          }
        });

      } catch (error) {
        console.error('❌ 개별 파일 사진 조회 실패:', error);
        return res.status(500).json({
          success: false,
          message: error.message || '사진 조회 실패',
          error_type: 'photo_query_error'
        });
      }
    }

    // 📸 간단한 개별 사진 업로드 (안전한 방식)
    if (action === 'upload_single_photo') {
      const { character_id, category, photo_data } = req.body;
      console.log('📸 간단한 사진 업로드:', character_id, category);

      try {
        // 기본 검증
        if (!character_id || !category || !photo_data) {
          return res.status(400).json({
            success: false,
            message: '필수 데이터가 누락되었습니다.'
          });
        }

        // 크기 검증 (Vercel 4.5MB 페이로드 제한 고려)
        const photoSizeBytes = (photo_data.length * 3) / 4;
        const maxSize = 3 * 1024 * 1024; // 3MB (Base64로 약 4MB가 되어 안전한 범위)
        if (photoSizeBytes > maxSize) {
          return res.status(413).json({
            success: false,
            message: `파일이 너무 큽니다. 최대 3MB (현재: ${Math.round(photoSizeBytes / (1024 * 1024))}MB)`
          });
        }

        // 개별 캐릭터 사진 파일로 저장
        const filename = `data/photos/${character_id}_${category}_${Date.now()}.json`;
        const photoRecord = {
          character_id,
          category,
          photo_data,
          uploaded_at: new Date().toISOString(),
          file_size: photoSizeBytes
        };

        // GitHub에 개별 파일로 저장
        console.log('💾 개별 파일로 저장:', filename);
        const content = JSON.stringify(photoRecord, null, 2);
        const base64Content = Buffer.from(content).toString('base64');

        const octokit = new (require('@octokit/rest').Octokit)({
          auth: process.env.GITHUB_TOKEN
        });

        await octokit.repos.createOrUpdateFileContents({
          owner: 'EnmanyProject',
          repo: 'chatgame',
          path: filename,
          message: `Add photo for ${character_id} - ${category}`,
          content: base64Content,
          branch: 'main'
        });

        console.log('✅ 사진 업로드 성공');
        return res.status(200).json({
          success: true,
          message: '사진이 성공적으로 업로드되었습니다.',
          data: {
            character_id,
            category,
            filename,
            uploaded_at: photoRecord.uploaded_at
          }
        });

      } catch (error) {
        console.error('❌ 간단한 사진 업로드 실패:', error);
        return res.status(500).json({
          success: false,
          message: error.message || '업로드 실패'
        });
      }
    }

    // 🔧 사진 데이터베이스 복구 기능
    if (action === 'repair_photo_database') {
      console.log('🔧 사진 데이터베이스 복구 시작...');

      try {
        // 기존 사진 데이터 백업 시도
        let backupData = null;
        try {
          backupData = await loadPhotosFromGitHub();
          console.log('📦 기존 데이터 백업 성공');
        } catch (e) {
          console.log('⚠️ 기존 데이터 손상됨 - 새로 생성');
        }

        // 새로운 빈 데이터베이스 생성
        const newPhotosData = {
          photos: {},
          metadata: {
            version: "1.0.0",
            total_photos: 0,
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            repair_note: "Database repaired due to JSON parsing error"
          }
        };

        // GitHub에 저장
        await savePhotosToGitHub(newPhotosData);

        return res.status(200).json({
          success: true,
          message: '사진 데이터베이스가 성공적으로 복구되었습니다.',
          backup_available: !!backupData,
          repaired_at: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ 데이터베이스 복구 실패:', error);
        return res.status(500).json({
          success: false,
          message: '데이터베이스 복구 실패: ' + error.message
        });
      }
    }

    if (action === 'upload_photo') {
      const { character_id, category, photo_data } = req.body;
      console.log('📸 사진 업로드:', character_id, category);

      if (!character_id || !category || !photo_data) {
        return res.status(400).json({
          success: false,
          message: '캐릭터 ID, 카테고리, 사진 데이터가 모두 필요합니다.'
        });
      }

      try {
        console.log('🔍 사진 데이터 크기 확인:', Math.round(photo_data.length / 1024), 'KB');

        // 사진 데이터 검증
        validatePhotoData(photo_data, category);
        console.log('✅ 사진 데이터 검증 통과');

        // 메모리 사용량 제한 - 매우 큰 파일은 거부
        const photoSizeBytes = (photo_data.length * 3) / 4;
        if (photoSizeBytes > 10 * 1024 * 1024) { // 10MB 초과
          console.log('❌ 사진이 너무 큼:', Math.round(photoSizeBytes / (1024 * 1024)), 'MB');
          return res.status(413).json({
            success: false,
            message: '사진 크기가 너무 큽니다. 서버 안정성을 위해 10MB 이하로 제한됩니다.'
          });
        }

        // 사진 데이터 로드 - 개별 캐릭터 파일 방식으로 변경
        console.log('📂 개별 캐릭터 사진 파일 로드 시도...');

        let photosData;
        try {
          photosData = await loadPhotosFromGitHub();
          console.log('✅ 기존 통합 파일 로드 성공');
        } catch (loadError) {
          console.log('❌ 통합 파일 로드 실패:', loadError.message);
          console.log('🔄 개별 파일 방식으로 전환...');

          // 빈 구조로 초기화
          photosData = {
            photos: {},
            metadata: {
              version: "2.0.0",
              total_photos: 0,
              created: new Date().toISOString(),
              last_updated: new Date().toISOString(),
              storage_mode: "individual_files"
            }
          };
        }

        // 캐릭터 사진 데이터 초기화 (없는 경우)
        if (!photosData.photos[character_id]) {
          photosData.photos[character_id] = {
            character_id,
            character_name: character_id.split('_')[0],
            photos: Object.keys(PHOTO_CATEGORIES).reduce((acc, cat) => {
              acc[cat] = cat === 'profile' ? null : [];
              return acc;
            }, {}),
            photo_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }

        const charPhotos = photosData.photos[character_id];
        const categoryConfig = PHOTO_CATEGORIES[category];

        // 카테고리별 최대 개수 확인
        if (category === 'profile') {
          charPhotos.photos.profile = {
            id: generatePhotoId(character_id, 'profile'),
            data: photo_data,
            uploaded_at: new Date().toISOString()
          };
        } else {
          if (charPhotos.photos[category].length >= categoryConfig.max) {
            return res.status(400).json({
              success: false,
              message: `${categoryConfig.name} 카테고리는 최대 ${categoryConfig.max}장까지만 업로드 가능합니다.`
            });
          }

          charPhotos.photos[category].push({
            id: generatePhotoId(character_id, category),
            data: photo_data,
            uploaded_at: new Date().toISOString()
          });
        }

        // 카운트 업데이트
        charPhotos.photo_count = Object.values(charPhotos.photos).reduce((count, photos) => {
          if (Array.isArray(photos)) {
            return count + photos.length;
          } else if (photos !== null) {
            return count + 1;
          }
          return count;
        }, 0);

        charPhotos.updated_at = new Date().toISOString();

        // 메타데이터 업데이트
        photosData.metadata.total_photos = Object.values(photosData.photos).reduce((total, char) => total + char.photo_count, 0);
        photosData.metadata.last_updated = new Date().toISOString();

        // GitHub에 저장 (재시도 로직 포함)
        console.log('💾 GitHub 저장 시작...');
        let saveAttempts = 0;
        const maxAttempts = 3;

        while (saveAttempts < maxAttempts) {
          try {
            await savePhotosToGitHub(photosData);
            console.log('✅ GitHub 저장 성공');
            break;
          } catch (saveError) {
            saveAttempts++;
            console.log(`❌ GitHub 저장 실패 (시도 ${saveAttempts}/${maxAttempts}):`, saveError.message);

            if (saveAttempts >= maxAttempts) {
              throw new Error(`GitHub 저장 실패: ${saveError.message}`);
            }

            // 잠시 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // 응답 데이터를 간소화하여 JSON 크기 줄이기
        const responseData = {
          character_id: charPhotos.character_id,
          character_name: charPhotos.character_name,
          photo_count: charPhotos.photo_count,
          updated_at: charPhotos.updated_at
        };

        console.log('📤 응답 전송 준비 완료');
        return res.status(200).json({
          success: true,
          message: '사진이 성공적으로 업로드되었습니다.',
          data: responseData
        });

      } catch (error) {
        console.error('❌ 사진 업로드 실패:', error);
        console.error('❌ 에러 스택:', error.stack);

        return res.status(500).json({
          success: false,
          message: error.message || '사진 업로드 실패',
          error_type: 'photo_upload_error',
          character_id: character_id,
          category: category
        });
      }
    }

    if (action === 'delete_photo') {
      const { character_id, category, photo_id } = req.body;
      console.log('📸 사진 삭제:', character_id, category, photo_id);

      if (!character_id || !category || !photo_id) {
        return res.status(400).json({
          success: false,
          message: '캐릭터 ID, 카테고리, 사진 ID가 모두 필요합니다.'
        });
      }

      try {
        const photosData = await loadPhotosFromGitHub();

        if (!photosData.photos[character_id]) {
          return res.status(404).json({
            success: false,
            message: '캐릭터를 찾을 수 없습니다.'
          });
        }

        const targetCharPhotos = photosData.photos[character_id];
        let needsSave = false;

        if (category === 'profile') {
          if (targetCharPhotos.photos.profile && targetCharPhotos.photos.profile.id === photo_id) {
            targetCharPhotos.photos.profile = null;
            needsSave = true;
          }
        } else {
          const photoIndex = targetCharPhotos.photos[category].findIndex(photo => photo.id === photo_id);
          if (photoIndex !== -1) {
            targetCharPhotos.photos[category].splice(photoIndex, 1);
            needsSave = true;
          }
        }

        if (needsSave) {
          // 카운트 업데이트
          targetCharPhotos.photo_count = Object.values(targetCharPhotos.photos).reduce((count, photos) => {
            if (Array.isArray(photos)) {
              return count + photos.length;
            } else if (photos !== null) {
              return count + 1;
            }
            return count;
          }, 0);

          targetCharPhotos.updated_at = new Date().toISOString();
          photosData.metadata.last_updated = new Date().toISOString();

          // GitHub에 저장
          await savePhotosToGitHub(photosData);
        }

        return res.status(200).json({
          success: true,
          message: '사진이 성공적으로 삭제되었습니다.',
          data: targetCharPhotos,
          categories: PHOTO_CATEGORIES
        });

      } catch (error) {
        console.error('❌ 사진 삭제 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: error.message || '사진 삭제 실패',
          error_type: 'photo_delete_error'
        });
      }
    }

    // 🧪 간단한 OpenAI API 테스트 엔드포인트들
    if (action === 'test_simple_generation') {
      const { prompt } = req.body;

      try {
        console.log('🧪 간단한 텍스트 생성 테스트 시작');

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
          return res.status(500).json({
            success: false,
            error: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다'
          });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: prompt || '안녕하세요라고 한국어로 인사말을 한 문장으로 작성해주세요.'
              }
            ],
            max_tokens: 150,
            temperature: 0.9,
            top_p: 0.95,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API 오류: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
        }

        const result = await response.json();
        const text = result.choices[0]?.message?.content?.trim();

        return res.json({
          success: true,
          text: text,
          model: 'gpt-4o-mini',
          usage: result.usage
        });

      } catch (error) {
        console.error('❌ 간단한 텍스트 생성 실패:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }

    if (action === 'test_character_simple') {
      const { character } = req.body;

      try {
        console.log('🧪 캐릭터 간단 설명 생성 테스트 시작');

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
          return res.status(500).json({
            success: false,
            error: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다'
          });
        }

        const prompt = `다음 캐릭터에 대해 매번 다른 관점으로 2-3문장 소개해주세요:
이름: ${character.name}
나이: ${character.age}세
MBTI: ${character.mbti}

매번 다른 매력포인트나 특징을 강조해서 소개해주세요.
(생성시각: ${Date.now()})`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 200,
            temperature: 0.9,
            top_p: 0.95,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API 오류: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
        }

        const result = await response.json();
        const description = result.choices[0]?.message?.content?.trim();

        return res.json({
          success: true,
          description: description,
          character: character,
          model: 'gpt-4o-mini',
          usage: result.usage
        });

      } catch (error) {
        console.error('❌ 캐릭터 간단 설명 생성 실패:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }

    console.log('❌❌❌ 액션 매칭 실패 ❌❌❌');
    console.log('❌ 요청된 액션:', action);
    console.log('❌ 액션 타입:', typeof action);
    console.log('❌ 사용 가능한 액션들:');
    console.log('  - list_characters');
    console.log('  - save_character');
    console.log('  - delete_character');
    console.log('  - reset_all_characters');
    console.log('  - generate_character');
    console.log('  - auto_complete_character');
    console.log('  - generate_character_profile');
    console.log('  - generate_complete_character_with_profile');
    console.log('  - list_all_photos');
    console.log('  - get_character_photos');
    console.log('  - get_character_photos_v2');
    console.log('  - upload_photo');
    console.log('  - upload_single_photo');
    console.log('  - delete_photo');
    console.log('  - repair_photo_database');

    return res.status(400).json({
      success: false,
      message: 'Unknown action. Available: list_characters, save_character, delete_character, reset_all_characters, generate_character, generate_character_prompt, auto_complete_character, generate_character_profile, generate_complete_character_with_profile, test_simple_generation, test_character_simple, list_all_photos, get_character_photos, get_character_photos_v2, upload_photo, upload_single_photo, delete_photo, repair_photo_database',
      received_action: action,
      action_type: typeof action,
      debug_info: debugInfo,
      error_type: 'ACTION_NOT_MATCHED'
    });

  } catch (error) {
    console.error('❌ 새로운 캐릭터 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      action: action,
      timestamp: new Date().toISOString()
    });
  }
};

// 🧠 OpenAI API를 사용한 지능적 캐릭터 완성 함수
async function generateCharacterWithAI(inputData) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다');
  }

  console.log('🤖 OpenAI API 캐릭터 생성 시작...');
  // 프론트엔드에서 answers 필드로 데이터를 보내므로 처리
  const userData = inputData.answers || inputData;

  // 🎯 MBTI 기본값 처리: null 값들을 MBTI 타입별 기본값으로 대체
  const mbtiDefaults = generateMBTIDefaults(userData.mbti);
  console.log(`🎯 [${userData.mbti}] MBTI 기본값 준비:`, mbtiDefaults);

  // null 값들을 MBTI 기본값으로 대체
  if (userData.charm_points === null || userData.charm_points === undefined || (Array.isArray(userData.charm_points) && userData.charm_points.length === 0)) {
    userData.charm_points = mbtiDefaults.charm_points;
    console.log('✅ charm_points MBTI 기본값 적용:', userData.charm_points);
  }

  if (userData.core_desires === null || userData.core_desires === undefined || (Array.isArray(userData.core_desires) && userData.core_desires.length === 0)) {
    userData.core_desires = mbtiDefaults.core_desires;
    console.log('✅ core_desires MBTI 기본값 적용:', userData.core_desires);
  }

  if (userData.speech_style === null || userData.speech_style === undefined || userData.speech_style === '') {
    userData.speech_style = mbtiDefaults.speech_style;
    console.log('✅ speech_style MBTI 기본값 적용:', userData.speech_style);
  }

  console.log('📝 입력 데이터:', {
    name: userData.name,
    mbti: userData.mbti,
    age: userData.age,
    personality_traits: userData.personality_traits,
    hobbies: userData.hobbies,
    speech_style: userData.speech_style
  });

  // 사용자가 선택한 특성들을 문자열로 변환
  const selectedTraits = Array.isArray(userData.personality_traits) ? userData.personality_traits.join(', ') : '';
  const selectedHobbies = Array.isArray(userData.hobbies) ? userData.hobbies.join(', ') : '';

  const prompt = `당신은 복잡하고 매력적인 성인 여성 캐릭터를 창조하는 전문가입니다. 다음 사용자의 상세한 선택을 바탕으로 입체적이고 현실적인 캐릭터를 완성해주세요:

🔥 기본 프로필 (사용자 선택):
- 이름: ${userData.name || '사용자가 지정하지 않음'}
- 나이: ${userData.age || '20-30세 사이'} (성인 여성)
- MBTI: ${userData.mbti || '적절한 MBTI 선택'}
- 직업/전공: ${userData.major || '일반 전공'}
- 가족배경: ${userData.family || '일반 가정'}
- 고향: ${userData.hometown || '서울'}
- 관계설정: ${userData.relationship || '친구'}

👀 외모 프로필 (사용자 선택):
- 헤어스타일: ${userData.hair || '긴 생머리'}
- 눈모양: ${userData.eyes || '큰 눈'}
- 체형: ${userData.body || '보통 체형'}
- 가슴: ${userData.bust || '보통 사이즈'}
- 허리/엉덩이: ${userData.waist_hip || '균형잡힌 라인'}
- 패션스타일: ${userData.style || '캐주얼'}

💫 매력 프로필 (사용자 맞춤):
- 유혹 스타일: ${userData.seduction_style || 'playful_confident'}
- 매력 포인트: ${userData.charm_points && userData.charm_points.length > 0 ? userData.charm_points.join(', ') : '전염성 있는 미소, 재치있는 대화'}
- 감성 지능: ${userData.emotional_intelligence || 7}/10
- 자신감 수준: ${userData.confidence_level || 8}/10
- 신비로움: ${userData.mystery_factor || 6}/10
- 성적 호기심: ${userData.sexual_curiosity || 5}/10 (🔥 새로 추가)

📋 과거 이력 (사용자 설정):
- 남자친구 경험 수: ${userData.boyfriend_count || 2}명
- 선호하는 스킨십: ${userData.preferred_skinship && userData.preferred_skinship.length > 0 ? userData.preferred_skinship.join(', ') : '손 잡기, 포옹, 가벼운 키스'}
- 연애 경험 수준: ${userData.relationship_experience || 'intermediate'}
- 첫 경험 연령대: ${userData.first_experience_age || 'late_teens'}

🧠 심리적 깊이 (사용자 설정):
- 핵심 욕구: ${userData.core_desires && userData.core_desires.length > 0 ? userData.core_desires.join(', ') : '의미있는 연결, 개인적 성장'}
- 경계선: ${userData.comfort_level || 'moderate_flirtation'}
- 관계 발전 속도: ${userData.escalation_pace || 'gradual_building'}

🎯 성격 특성 (사용자 선택):
${selectedTraits && selectedTraits.length > 0 ? selectedTraits.map(trait => `- ${trait}`).join('\n') : '- 사용자가 선택하지 않음 (MBTI 기반 기본 성격 적용)'}

🎨 취미/관심사 (사용자 선택):
${selectedHobbies && selectedHobbies.length > 0 ? selectedHobbies.map(hobby => `- ${hobby}`).join('\n') : '- 사용자가 선택하지 않음 (연령대 맞춤 기본 취미 적용)'}

💬 커뮤니케이션:
- 말투 스타일: ${userData.speech_style || '매력적이고 우아한 말투'}
- 말버릇: ${userData.speech_habit || '표현력 있는 제스처 사용'}
- 가치관: ${userData.values || '가족중심'}

요구사항:
1. 🔥 복합적 매력: 사용자가 선택한 매력 프로필(유혹 스타일, 매력 포인트, 감성지능 등)을 정확히 반영
2. 🧠 심리적 현실성: 핵심 욕구, 경계선, 관계 발전 속도를 바탕으로 입체적인 인격 구성
3. 💬 대화 특성: 선택된 매력 포인트가 실제 대화에서 어떻게 나타날지 구체적으로 명시
4. 🎯 MBTI 정확성: ${userData.mbti || 'ENFP'} 특성을 매력 프로필과 조화롭게 반영
5. 🇰🇷 한국 문화: 자연스러운 한국 성인 여성으로서의 배경과 가치관
6. ⚖️ 균형감: 매력적이면서도 존중받는 캐릭터, 건전한 경계선 유지
7. 🎭 개성화: 선택된 모든 특성들이 조화롭게 통합된 독특한 매력

다음 새로운 JSON 스키마로 응답해주세요:
{
  "basic_info": {
    "name": "캐릭터 이름",
    "age": 나이숫자,
    "mbti": "MBTI",
    "occupation": "직업/전공",
    "gender": "female"
  },
  "appeal_profile": {
    "seduction_style": "사용자 선택한 유혹 스타일",
    "charm_points": ["선택된 매력포인트들"],
    "emotional_intelligence": 감성지능숫자,
    "confidence_level": 자신감숫자,
    "mystery_factor": 신비로움숫자,
    "sexual_curiosity": 성적호기심숫자
  },
  "physical_allure": {
    "signature_features": ["특징적인 외모 요소들"],
    "sensual_habits": ["매력적인 습관들"],
    "body_language": "바디랭귀지 특성",
    "appearance": {
      "hair": "헤어스타일 설명",
      "eyes": "눈 특성",
      "body": "체형 설명",
      "bust": "가슴 사이즈 특성",
      "waist_hip": "허리/엉덩이 라인",
      "style": "패션 스타일"
    }
  },
  "psychological_depth": {
    "core_desires": ["핵심 욕구들"],
    "vulnerabilities": ["약점/취약점"],
    "boundaries": {
      "comfort_level": "경계선 설정",
      "escalation_pace": "관계 발전 속도"
    },
    "emotional_triggers": {
      "positive": ["긍정적 반응 트리거들"],
      "negative": ["부정적 반응 트리거들"]
    }
  },
  "conversation_dynamics": {
    "flirtation_patterns": ["플러팅 패턴들"],
    "response_tendencies": {
      "to_humor": "유머에 대한 반응",
      "to_compliments": "칭찬에 대한 반응",
      "to_interest": "관심 표현에 대한 반응"
    },
    "conversation_hooks": ["대화 주제/훅"],
    "speech_style": "말투 특성",
    "speech_quirks": ["말버릇들"]
  },
  "past_history": {
    "boyfriend_count": 경험한남자친구수,
    "preferred_skinship": ["선호하는 스킨십 유형들"],
    "relationship_experience": "연애경험수준",
    "first_experience_age": "첫경험연령대"
  },
  "relationship_progression": {
    "stages": {
      "initial_attraction": {
        "behaviors": ["초기 매력 단계 행동들"],
        "affection_range": [0, 25],
        "dialogue_style": "초기 단계 대화 스타일"
      },
      "building_tension": {
        "behaviors": ["긴장감 형성 단계 행동들"],
        "affection_range": [26, 60],
        "dialogue_style": "발전 단계 대화 스타일"
      },
      "intimate_connection": {
        "behaviors": ["친밀감 형성 단계 행동들"],
        "affection_range": [61, 100],
        "dialogue_style": "친밀 단계 대화 스타일"
      }
    }
  },
  "hobbies": ["취미들"],
  "values": "가치관",
  "background": {
    "family": "가족 배경",
    "hometown": "고향",
    "relationship": "관계 설정"
  }
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 매력적인 성인 여성 캐릭터를 만드는 전문가입니다. 우아하고 매력적인 성인 여성의 특징을 강조하며, 사용자의 요구사항을 정확히 반영하여 완성도 높은 캐릭터를 만들어주세요. 모든 캐릭터는 20세 이상의 성인이며, 품격있고 매력적인 캐릭터여야 합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('🤖 OpenAI 응답:', aiResponse);

    // JSON 응답 파싱
    let characterData;
    try {
      // JSON 블록을 찾아서 파싱
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        characterData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON 형식이 아닌 응답');
      }
    } catch (parseError) {
      console.warn('⚠️ JSON 파싱 실패:', parseError.message);
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    // 기본 필드 추가
    const completedCharacter = {
      ...characterData,
      id: `${characterData.basic_info?.name?.toLowerCase().replace(/\s+/g, '_') || characterData.name?.toLowerCase().replace(/\s+/g, '_')}_${characterData.basic_info?.mbti?.toLowerCase() || characterData.mbti?.toLowerCase()}_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: 'ai_generated',
      active: true,
      version: '2.0'
    };

    // 🚨 중요: AI 응답에서도 빈 값들을 MBTI 기본값으로 다시 한번 검증
    console.log('🔍 AI 응답 후 빈 값 검증 시작...');
    const finalMbti = completedCharacter.basic_info?.mbti || completedCharacter.mbti;
    const finalDefaults = generateMBTIDefaults(finalMbti);

    // appeal_profile.charm_points 검증
    if (!completedCharacter.appeal_profile?.charm_points ||
        (Array.isArray(completedCharacter.appeal_profile.charm_points) && completedCharacter.appeal_profile.charm_points.length === 0) ||
        completedCharacter.appeal_profile.charm_points === null) {
      if (!completedCharacter.appeal_profile) completedCharacter.appeal_profile = {};
      completedCharacter.appeal_profile.charm_points = [...finalDefaults.charm_points];
      console.log('✅ AI 응답 후 charm_points 기본값 적용:', completedCharacter.appeal_profile.charm_points);
    }

    // psychological_depth.core_desires 검증
    if (!completedCharacter.psychological_depth?.core_desires ||
        (Array.isArray(completedCharacter.psychological_depth.core_desires) && completedCharacter.psychological_depth.core_desires.length === 0) ||
        completedCharacter.psychological_depth.core_desires === null) {
      if (!completedCharacter.psychological_depth) completedCharacter.psychological_depth = {};
      completedCharacter.psychological_depth.core_desires = [...finalDefaults.core_desires];
      console.log('✅ AI 응답 후 core_desires 기본값 적용:', completedCharacter.psychological_depth.core_desires);
    }

    // conversation_dynamics.speech_style 검증
    if (!completedCharacter.conversation_dynamics?.speech_style ||
        completedCharacter.conversation_dynamics.speech_style === null ||
        completedCharacter.conversation_dynamics.speech_style === '') {
      if (!completedCharacter.conversation_dynamics) completedCharacter.conversation_dynamics = {};
      completedCharacter.conversation_dynamics.speech_style = finalDefaults.speech_style;
      console.log('✅ AI 응답 후 speech_style 기본값 적용:', completedCharacter.conversation_dynamics.speech_style);
    }

    // 🔥 새로운 필드들 검증 및 기본값 설정
    // appeal_profile.sexual_curiosity 검증
    if (!completedCharacter.appeal_profile?.sexual_curiosity ||
        completedCharacter.appeal_profile.sexual_curiosity === null) {
      if (!completedCharacter.appeal_profile) completedCharacter.appeal_profile = {};
      completedCharacter.appeal_profile.sexual_curiosity = 5; // 기본값 5
      console.log('✅ AI 응답 후 sexual_curiosity 기본값 적용:', completedCharacter.appeal_profile.sexual_curiosity);
    }

    // past_history 전체 섹션 검증 및 기본값 설정
    if (!completedCharacter.past_history) {
      completedCharacter.past_history = {
        boyfriend_count: 2,
        preferred_skinship: ['hand_holding', 'hug'],
        relationship_experience: 'intermediate',
        first_experience_age: 'late_teens'
      };
      console.log('✅ AI 응답 후 past_history 전체 섹션 기본값 적용:', completedCharacter.past_history);
    } else {
      // 개별 필드별 기본값 검증
      if (!completedCharacter.past_history.boyfriend_count && completedCharacter.past_history.boyfriend_count !== 0) {
        completedCharacter.past_history.boyfriend_count = 2;
      }
      if (!completedCharacter.past_history.preferred_skinship ||
          (Array.isArray(completedCharacter.past_history.preferred_skinship) && completedCharacter.past_history.preferred_skinship.length === 0)) {
        completedCharacter.past_history.preferred_skinship = ['hand_holding', 'hug'];
      }
      if (!completedCharacter.past_history.relationship_experience) {
        completedCharacter.past_history.relationship_experience = 'intermediate';
      }
      if (!completedCharacter.past_history.first_experience_age) {
        completedCharacter.past_history.first_experience_age = 'late_teens';
      }
    }

    console.log('✅ AI 캐릭터 생성 완료:', completedCharacter.name);
    return completedCharacter;

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    throw error;
  }
}

// 🎲 AI가 랜덤하게 캐릭터 완성하는 함수 (매번 다른 결과)
function generateRandomCharacterFromInput(inputData) {
  console.log('🎲 AI 랜덤 생성 시작:', inputData);

  // 기본값 설정
  const name = inputData.name || inputData.answers?.name || randomChoice(['미나', '지수', '서연', '혜진', '유나', '소영', '하늘', '별', '가을']);
  const mbti = inputData.mbti || inputData.answers?.mbti || randomChoice(['INFP', 'ENFP', 'INTJ', 'ESFJ', 'ISTP', 'INFJ']);
  const age = inputData.age || inputData.answers?.age || randomChoice([19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);

  console.log('🎯 AI 선택 결과:', { name, mbti, age });

  // 🎲 AI가 랜덤하게 선택하는 다양한 옵션들
  const personalityOptions = ['감성적', '이상주의적', '창의적', '내향적', '따뜻한', '외향적', '열정적', '사교적', '활발한',
                              '논리적', '독립적', '완벽주의', '계획적', '분석적', '배려심많은', '책임감있는', '협력적',
                              '실용적', '조용한', '현실적', '직관적', '신중한', '통찰력있는', '유머러스한', '자유로운'];

  const hobbyOptions = ['글쓰기', '그림그리기', '음악감상', '독서', '산책', '여행', '파티', '새로운 경험', '사람들과 만나기',
                        '연구', '계획세우기', '전략게임', '학습', '요리', '친구만나기', '봉사활동', '쇼핑', '카페가기',
                        '운동', '수리', '게임', '영화감상', '명상', '상담', '예술감상', '사진촬영', '춤', '노래', '악기연주'];

  const speechStyles = ['부드러운', '감정적인', '은유적인', '밝은', '에너지 넘치는', '친근한', '간결한', '정확한', '논리적인',
                        '따뜻한', '배려깊은', '직설적인', '실용적인', '신중한', '깊이있는', '통찰력있는', '유쾌한', '위트있는'];

  const majorOptions = ['문학과', '심리학과', '미술과', '음악과', '철학과', '사회학과', '경영학과', '컴퓨터공학과', '의학과',
                        '간호학과', '교육학과', '언론정보학과', '국제관계학과', '경제학과', '법학과', '건축학과', '디자인학과'];

  const hometownOptions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '수원', '성남', '고양', '용인', '청주', '전주', '천안', '제주'];

  const familyOptions = ['평범한 가정', '화목한 가정', '엄격한 가정', '자유로운 가정', '예술가족', '학자 가족', '사업가 가족', '교육자 가족'];

  const valuesOptions = ['가족 중시', '자아실현', '성취지향', '관계중심', '창의성', '안정성', '모험심', '정의감', '배움', '자유'];

  const relationshipOptions = ['친구', '후배', '선배', '동갑', '어릴 적 친구', '새로운 만남', '소개팅', '동아리 친구', '같은 과 친구'];

  // 🎲 AI가 랜덤하게 선택
  return {
    id: `${name.toLowerCase().replace(/\s+/g, '_')}_${mbti.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name,
    age: parseInt(age),
    gender: 'female', // 무조건 여성
    mbti: mbti,

    // 🎯 AI가 매번 다르게 선택
    personality_traits: inputData.personality_traits || randomSelect(personalityOptions, randomChoice([2, 3, 4])),
    major: inputData.major || randomChoice(majorOptions),
    family: inputData.family || randomChoice(familyOptions),
    hometown: inputData.hometown || randomChoice(hometownOptions),
    relationship: inputData.relationship || randomChoice(relationshipOptions),
    speech_style: inputData.speech_style || `${randomChoice(speechStyles)} 말투`,
    speech_habit: inputData.speech_habit || randomChoice(['이모티콘을 자주 사용함', '웃음소리를 많이 냄', '습관적으로 머리를 넘김',
                                                          '손짓을 많이 함', '눈을 자주 깜빡임', '입술을 깨무는 습관', '볼을 부풀리는 습관']),

    appearance: {
      hair: inputData.appearance?.hair || inputData.hair || randomChoice(['긴 생머리', '짧은 생머리', '웨이브 머리', '곱슬머리', '포니테일', '단발머리', '염색한 머리']),
      eyes: inputData.appearance?.eyes || inputData.eyes || randomChoice(['큰 눈', '작은 눈', '둥근 눈', '아몬드 눈', '고양이 눈', '또렷한 눈']),
      style: inputData.appearance?.style || inputData.style || randomChoice(['캐주얼한 스타일', '우아한 스타일', '스포티한 스타일', '빈티지 스타일',
                                                                              '모던한 스타일', '로맨틱한 스타일', '심플한 스타일'])
    },

    background: {
      family: inputData.background?.family || inputData.family || randomChoice(familyOptions),
      hometown: inputData.background?.hometown || inputData.hometown || randomChoice(hometownOptions),
      occupation: inputData.background?.occupation || randomChoice(['대학생', '대학원생', '인턴', '아르바이트생'])
    },

    // 🎲 취미와 가치관도 랜덤 선택
    hobbies: inputData.hobbies || randomSelect(hobbyOptions, randomChoice([2, 3, 4, 5])),
    values: inputData.values || randomChoice(valuesOptions),

    personality: {
      hobbies: inputData.personality?.hobbies || inputData.hobbies || randomSelect(hobbyOptions, 3),
      values: inputData.personality?.values || inputData.values || randomChoice(valuesOptions),
      fears: inputData.personality?.fears || inputData.fears || randomChoice(['거절당하는 것', '혼자 남겨지는 것', '실패하는 것',
                                                                              '오해받는 것', '무시당하는 것', '변화하는 것'])
    },


    // 원본 메타데이터 보존
    created_at: new Date().toISOString(),
    created_date: new Date().toISOString().split('T')[0],
    generation_method: 'ai_random_generation',
    source: inputData.source || 'ai_generate',
    active: inputData.active !== undefined ? inputData.active : true
  };
}

// 🎲 랜덤 선택 헬퍼 함수들
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomSelect(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 부분 입력으로 캐릭터 완성 함수 (기존 함수 - 호환성 유지)
function completeCharacterFromInput(inputData) {
  console.log('📝 입력된 데이터:', inputData);

  // 기본값 설정
  const name = inputData.name || inputData.answers?.name || randomChoice(['미나', '지수', '서연', '혜진', '유나', '소영', '하늘', '별', '가을', '민정', '수빈', '채원']);
  const mbti = inputData.mbti || inputData.answers?.mbti || 'INFP';
  const age = inputData.age || inputData.answers?.age || 22;

  console.log('✅ 추출된 핵심 정보:', { name, mbti, age });

  // MBTI 기반 템플릿으로 나머지 완성
  const template = getTemplateByMBTI(mbti);

  return {
    id: inputData.id || `${name.toLowerCase().replace(/\s+/g, '_')}_${mbti.toLowerCase()}_${Date.now()}`,
    name: name,
    age: parseInt(age) || 22,
    gender: 'female', // 무조건 여성
    mbti: mbti,

    // ✨ 모든 입력 필드를 우선적으로 사용, 없으면 MBTI 템플릿 기본값
    personality_traits: inputData.personality_traits || template.personalities.slice(0, 3),
    major: inputData.major || '대학생',
    family: inputData.family || '평범한 가정',
    hometown: inputData.hometown || '서울',
    relationship: inputData.relationship || '친구',
    speech_style: inputData.speech_style || `${template.speech_styles[0]} 말투`,
    speech_habit: inputData.speech_habit || '이모티콘을 자주 사용함',

    appearance: {
      hair: inputData.appearance?.hair || inputData.hair || '긴 머리',
      eyes: inputData.appearance?.eyes || inputData.eyes || '큰 눈',
      style: inputData.appearance?.style || inputData.style || '캐주얼한 스타일'
    },

    background: {
      family: inputData.background?.family || inputData.family || '평범한 가정',
      hometown: inputData.background?.hometown || inputData.hometown || '서울',
      occupation: inputData.background?.occupation || '대학생'
    },

    personality: {
      hobbies: inputData.personality?.hobbies || inputData.hobbies || template.hobbies.slice(0, 3),
      values: inputData.personality?.values || inputData.values || `${mbti} 유형의 가치관`,
      fears: inputData.personality?.fears || inputData.fears || '거절당하는 것'
    },

    // ✨ scenario-admin.html에서 온 추가 필드들도 보존
    values: inputData.values || `${mbti} 유형의 가치관`,
    hobbies: inputData.hobbies || template.hobbies.slice(0, 3),


    // ✨ 원본 메타데이터 보존
    created_at: inputData.created_at || new Date().toISOString(),
    created_date: inputData.created_date || new Date().toISOString().split('T')[0],
    generation_method: inputData.generation_method || 'ai_completion',
    source: inputData.source || 'api_generate',
    active: inputData.active !== undefined ? inputData.active : true
  };
}

// MBTI별 템플릿 가져오기 함수
function getTemplateByMBTI(mbti) {
  const templates = {
    'INFP': {
      personalities: ['감성적', '이상주의적', '창의적', '내향적', '따뜻한'],
      hobbies: ['글쓰기', '그림그리기', '음악감상', '독서', '산책'],
      speech_styles: ['부드러운', '감정적인', '은유적인']
    },
    'ENFP': {
      personalities: ['외향적', '열정적', '창의적', '사교적', '활발한'],
      hobbies: ['여행', '파티', '새로운 경험', '사람들과 만나기', '음악'],
      speech_styles: ['밝은', '에너지 넘치는', '친근한']
    },
    'INTJ': {
      personalities: ['논리적', '독립적', '완벽주의', '계획적', '분석적'],
      hobbies: ['독서', '연구', '계획세우기', '전략게임', '학습'],
      speech_styles: ['간결한', '정확한', '논리적인']
    },
    'ESFJ': {
      personalities: ['사교적', '배려심많은', '책임감있는', '따뜻한', '협력적'],
      hobbies: ['요리', '친구만나기', '봉사활동', '쇼핑', '카페가기'],
      speech_styles: ['따뜻한', '배려깊은', '친근한']
    },
    'ISTP': {
      personalities: ['실용적', '독립적', '분석적', '조용한', '현실적'],
      hobbies: ['운동', '수리', '게임', '영화감상', '혼자만의 시간'],
      speech_styles: ['간결한', '직설적인', '실용적인']
    },
    'INFJ': {
      personalities: ['직관적', '이상주의적', '신중한', '완벽주의', '통찰력있는'],
      hobbies: ['명상', '독서', '글쓰기', '상담', '예술감상'],
      speech_styles: ['신중한', '깊이있는', '통찰력있는']
    }
  };

  return templates[mbti] || templates['INFP']; // 기본값
}

// 🐙 GitHub API를 통한 영구 저장 함수
async function saveToGitHub(characterData) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';
  const FILE_PATH = 'data/characters.json';

  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN 환경변수가 설정되지 않았습니다');
    throw new Error('GITHUB_TOKEN 환경변수가 설정되지 않았습니다');
  }

  console.log('🔑 GitHub 토큰 확인됨 (길이:', GITHUB_TOKEN.length, ')');

  try {
    console.log('🐙 GitHub API로 캐릭터 데이터 저장 시작...');
    console.log('📋 저장할 데이터:', {
      총_캐릭터_수: Object.keys(characterData.characters).length,
      캐릭터_목록: Object.keys(characterData.characters),
      메타데이터: characterData.metadata
    });

    // 1. 현재 파일의 SHA 값 가져오기 (파일 업데이트에 필요)
    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    let currentFileSha = null;

    try {
      const getResponse = await fetch(getFileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ChatGame-Character-Saver'
        }
      });

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        currentFileSha = fileData.sha;
        console.log('📂 기존 파일 SHA 확인:', currentFileSha);
      } else {
        console.log('📂 새 파일 생성 (기존 파일 없음)');
      }
    } catch (error) {
      console.log('📂 새 파일 생성 (파일 조회 실패):', error.message);
    }

    // 2. 캐릭터 데이터를 JSON으로 변환
    const characterDataJson = JSON.stringify(characterData, null, 2);
    const encodedContent = Buffer.from(characterDataJson, 'utf8').toString('base64');

    // 3. GitHub API로 파일 업데이트/생성
    const updateData = {
      message: `💾 캐릭터 데이터 업데이트 - ${characterData.metadata.total_characters}개 캐릭터`,
      content: encodedContent,
      branch: 'main'
    };

    if (currentFileSha) {
      updateData.sha = currentFileSha;
    }

    const updateResponse = await fetch(getFileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ChatGame-Character-Saver'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      throw new Error(`GitHub API 오류: ${updateResponse.status} - ${errorData}`);
    }

    const result = await updateResponse.json();
    console.log('🎉 GitHub 저장 성공:', {
      sha: result.content.sha,
      size: result.content.size,
      download_url: result.content.download_url
    });

    return result;

  } catch (error) {
    console.error('❌ GitHub 저장 실패:', error);
    throw error;
  }
}

// 🐙 GitHub에서 캐릭터 데이터 로드 함수 (추가 기능)
async function loadFromGitHub() {
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';
  const FILE_PATH = 'data/characters.json';

  try {
    console.log('🐙 GitHub에서 캐릭터 데이터 로드 시도...');

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

    // GitHub 토큰이 있으면 사용, 없으면 public 접근 시도
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ChatGame-Character-Loader'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      console.log('🔑 GitHub 토큰 사용하여 데이터 로드');
    } else {
      console.log('⚠️ GitHub 토큰 없이 public 접근 시도');
    }

    const response = await fetch(getFileUrl, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const fileData = await response.json();
      const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      const characterData = JSON.parse(decodedContent);

      console.log('✅ GitHub에서 데이터 로드 성공:', characterData.metadata);

      // 메타데이터에 GitHub 전용 표시 추가 (메모리 저장소 제거)
      characterData.metadata = {
        ...characterData.metadata,
        storage_type: 'github_api_only',
        last_accessed: new Date().toISOString()
      };

      console.log('📊 GitHub에서 로드된 캐릭터 수:', Object.keys(characterData.characters || {}).length);

      return characterData;
    } else {
      console.log('📂 GitHub에 저장된 캐릭터 파일이 없음');
      return null;
    }

  } catch (error) {
    console.error('❌ GitHub 로드 실패:', {
      message: error.message,
      status: error.status,
      stack: error.stack?.split('\n')[0]
    });

    // GitHub API 연결 실패 시 더 구체적인 에러 정보 제공
    throw new Error(`GitHub API 연결 실패: ${error.message}. Vercel 환경변수 및 인터넷 연결을 확인하세요.`);
  }
}

// 🛡️ v4.1.0 안정적인 GitHub 직접 방식: 복잡한 캐시 로직 제거, 검증된 방식으로 복구

// 🎯 캐릭터 자동 완성 함수 (새로 추가)
async function autoCompleteCharacter(inputData) {
  console.log('🎯 캐릭터 자동 완성 시작:', inputData);

  try {
    // OpenAI API를 사용한 지능적 완성
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API 키 없음 - 템플릿 기반 완성으로 전환');
      return generateTemplateBasedCompletion(inputData);
    }

    const completionPrompt = `당신은 매력적이고 현실적인 성인 여성 캐릭터를 완성하는 전문가입니다.

사용자가 제공한 부분적인 정보:
${JSON.stringify(inputData, null, 2)}

요구사항:
1. 🔥 누락된 정보를 지능적으로 추론하여 완성
2. 💫 기존 정보와 일관성 있게 연결
3. 🎭 매력적이고 복합적인 성격 구성
4. 📚 새로운 character_schema_v2 형식으로 출력

다음 JSON 구조로 완성된 캐릭터를 반환하세요:
{
  "basic_info": {
    "name": "입력된 이름 또는 새로 생성",
    "age": "20-27 사이의 성인 연령",
    "mbti": "입력된 MBTI 또는 추론",
    "occupation": "직업 설정",
    "gender": "female"
  },
  "appeal_profile": {
    "seduction_style": "playful_confident|mysterious_elegant|warm_nurturing|intellectually_stimulating 중 선택",
    "charm_points": ["매력 포인트 3개"],
    "emotional_intelligence": 7,
    "confidence_level": 8,
    "mystery_factor": 6
  },
  "physical_allure": {
    "signature_features": ["특징적인 외모 요소들"],
    "style_preference": "스타일 선호도",
    "sensual_habits": ["매력적인 습관들"],
    "body_language": "바디랭귀지 특성",
    "appearance": {
      "hair": "머리 스타일",
      "eyes": "눈 특징",
      "body": "체형 설명",
      "bust": "상체 특징",
      "waist_hip": "허리-엉덩이 비율",
      "style": "패션 스타일"
    }
  },
  "psychological_depth": {
    "core_desires": ["핵심 욕구들"],
    "vulnerabilities": ["취약점들"],
    "boundaries": {
      "comfort_level": "light_flirtation|moderate_flirtation|intense_chemistry",
      "escalation_pace": "very_gradual|gradual_building|moderate_pace|quick_progression"
    },
    "emotional_triggers": {
      "positive": ["긍정적 트리거들"],
      "negative": ["부정적 트리거들"]
    }
  },
  "conversation_dynamics": {
    "flirtation_patterns": ["플러팅 패턴들"],
    "response_tendencies": {
      "to_humor": "유머에 대한 반응",
      "to_compliments": "칭찬에 대한 반응",
      "to_interest": "관심에 대한 반응"
    },
    "conversation_hooks": ["대화 유도 주제들"],
    "speech_style": "말투 특성",
    "speech_quirks": ["말버릇들"]
  },
  "relationship_progression": {
    "stages": {
      "initial_attraction": {
        "behaviors": ["초기 매력 행동들"],
        "affection_range": [0, 25],
        "dialogue_style": "대화 스타일"
      },
      "building_tension": {
        "behaviors": ["긴장감 조성 행동들"],
        "affection_range": [26, 60],
        "dialogue_style": "대화 스타일"
      },
      "intimate_connection": {
        "behaviors": ["친밀한 연결 행동들"],
        "affection_range": [61, 100],
        "dialogue_style": "대화 스타일"
      }
    }
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 매력적이고 복합적인 성인 여성 캐릭터를 완성하는 전문가입니다. 항상 JSON 형식으로만 응답하세요.'
          },
          {
            role: 'user',
            content: completionPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const result = await response.json();
    const completedCharacter = JSON.parse(result.choices[0].message.content);

    // ID 및 메타데이터 추가
    completedCharacter.id = inputData.id || `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    completedCharacter.created_at = new Date().toISOString();
    completedCharacter.generation_method = 'ai_auto_completion';
    completedCharacter.source = 'auto_complete';

    console.log('✅ OpenAI 기반 캐릭터 자동 완성 성공');
    return completedCharacter;

  } catch (error) {
    console.error('❌ OpenAI 자동 완성 실패:', error.message);
    console.log('🔄 템플릿 기반 완성으로 전환');
    return generateTemplateBasedCompletion(inputData);
  }
}

// 📝 AI 인물 소개 생성 함수 (새로 추가)
async function generateCharacterProfile(characterData) {
  console.log('📝 AI 인물 소개 생성 시작:', characterData.basic_info?.name || characterData.name);

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API 키 없음 - 템플릿 기반 소개 생성');
      return generateTemplateBasedProfile(characterData);
    }

    const profilePrompt = `다음 캐릭터 데이터를 바탕으로 매력적이고 생생한 인물 소개를 작성해주세요:

캐릭터 데이터:
${JSON.stringify(characterData, null, 2)}

요구사항:
1. 📖 시나리오/에피소드 제작 시 AI 프롬프트로 활용 가능한 상세한 인물 소개
2. 🎭 캐릭터의 매력과 개성이 잘 드러나는 생생한 묘사
3. 💬 대화 생성 AI가 참고할 수 있는 구체적인 행동 패턴과 말투 설명
4. 🔥 성인 로맨스 게임에 적합한 매력적인 특성 강조
5. 📝 한국어로 자연스럽게 작성

다음 구조로 인물 소개를 생성해주세요:

**기본 정보**
- 이름, 나이, 직업, MBTI 등 기본 프로필

**외모와 스타일**
- 시각적 특징과 패션 스타일, 매력 포인트

**성격과 매력**
- 유혹 스타일, 성격 특성, 매력적인 행동 패턴

**대화 스타일**
- 말투, 표현 방식, 플러팅 패턴

**심리적 특성**
- 핵심 욕구, 감정 트리거, 취약점

**관계 발전 패턴**
- 단계별 행동 변화, 친밀감 표현 방식

**시나리오 활용 가이드**
- AI 대화 생성 시 참고할 핵심 포인트들

자연스럽고 매력적인 한국어로 작성해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 매력적인 성인 여성 캐릭터의 상세한 인물 소개를 작성하는 전문가입니다. 로맨스 게임의 AI 프롬프트로 활용될 생생하고 구체적인 설명을 제공하세요.'
          },
          {
            role: 'user',
            content: profilePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const result = await response.json();
    const profile = result.choices[0].message.content;

    const profileData = {
      character_id: characterData.id,
      character_name: characterData.basic_info?.name || characterData.name,
      profile_text: profile,
      generated_at: new Date().toISOString(),
      generation_method: 'openai_gpt4o',
      usage_guide: {
        scenario_prompt: `다음 캐릭터로 시나리오를 생성할 때 참고하세요:\n\n${profile}`,
        dialogue_prompt: `${characterData.basic_info?.name || characterData.name}의 특성을 반영한 대화를 생성하세요:\n\n${profile}`,
        episode_context: profile
      }
    };

    console.log('✅ OpenAI 기반 인물 소개 생성 완료');
    return profileData;

  } catch (error) {
    console.error('❌ OpenAI 인물 소개 생성 실패:', error.message);
    console.log('🔄 템플릿 기반 소개 생성으로 전환');
    return generateTemplateBasedProfile(characterData);
  }
}

// 🎲 템플릿 기반 캐릭터 자동 완성 (OpenAI 실패 시 사용)
function generateTemplateBasedCompletion(inputData) {
  console.log('🎲 템플릿 기반 캐릭터 자동 완성');

  const name = inputData.basic_info?.name || inputData.name || generateRandomName();
  const mbti = inputData.basic_info?.mbti || inputData.mbti || randomChoice(['INFP', 'ENFP', 'INTJ', 'ESFJ', 'ISTP']);
  const age = inputData.basic_info?.age || inputData.age || randomChoice([20, 21, 22, 23, 24, 25, 26, 27]);

  // MBTI별 기본 특성
  const mbtiTemplates = {
    'INFP': {
      seduction_style: 'warm_nurturing',
      charm_points: ['infectious_smile', 'gentle_touch', 'expressive_eyes'],
      core_desires: ['meaningful_connection', 'creative_expression'],
      positive_triggers: ['genuine_compliments', 'shared_interests', 'emotional_support'],
      negative_triggers: ['dismissive_behavior', 'shallow_conversation']
    },
    'ENFP': {
      seduction_style: 'playful_confident',
      charm_points: ['infectious_smile', 'witty_banter', 'graceful_movements'],
      core_desires: ['adventure_excitement', 'meaningful_connection'],
      positive_triggers: ['humor', 'new_experiences', 'enthusiasm'],
      negative_triggers: ['boring_routine', 'pessimism']
    },
    'INTJ': {
      seduction_style: 'intellectually_stimulating',
      charm_points: ['mysterious_aura', 'confident_gaze', 'intelligent_conversation'],
      core_desires: ['intellectual_stimulation', 'personal_growth'],
      positive_triggers: ['logical_discussion', 'respect_for_boundaries'],
      negative_triggers: ['emotional_manipulation', 'interruptions']
    },
    'ESFJ': {
      seduction_style: 'warm_nurturing',
      charm_points: ['caring_gestures', 'warm_smile', 'attentive_listening'],
      core_desires: ['meaningful_connection', 'helping_others'],
      positive_triggers: ['appreciation', 'teamwork', 'consideration'],
      negative_triggers: ['selfishness', 'conflict']
    },
    'ISTP': {
      seduction_style: 'mysterious_elegant',
      charm_points: ['confident_independence', 'subtle_touches', 'cool_demeanor'],
      core_desires: ['personal_freedom', 'practical_achievements'],
      positive_triggers: ['respect_for_space', 'practical_help'],
      negative_triggers: ['clingy_behavior', 'pressure']
    }
  };

  const template = mbtiTemplates[mbti] || mbtiTemplates['INFP'];

  const completedCharacter = {
    id: inputData.id || `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    basic_info: {
      name: name,
      age: age,
      mbti: mbti,
      occupation: inputData.basic_info?.occupation || randomChoice(['대학생', '대학원생', '프리랜서', '인턴', '아르바이트생']),
      gender: 'female'
    },
    appeal_profile: {
      seduction_style: inputData.appeal_profile?.seduction_style || template.seduction_style,
      charm_points: inputData.appeal_profile?.charm_points || template.charm_points,
      emotional_intelligence: inputData.appeal_profile?.emotional_intelligence || randomChoice([6, 7, 8, 9]),
      confidence_level: inputData.appeal_profile?.confidence_level || randomChoice([6, 7, 8, 9]),
      mystery_factor: inputData.appeal_profile?.mystery_factor || randomChoice([5, 6, 7, 8])
    },
    physical_allure: {
      signature_features: inputData.physical_allure?.signature_features || ['expressive_eyes', 'gentle_smile'],
      style_preference: inputData.physical_allure?.style_preference || randomChoice(['casual_chic', 'elegant_classic', 'trendy_modern']),
      sensual_habits: inputData.physical_allure?.sensual_habits || ['hair_touch_when_thinking', 'lip_bite_when_concentrating'],
      body_language: inputData.physical_allure?.body_language || 'confident_and_approachable',
      appearance: {
        hair: inputData.physical_allure?.appearance?.hair || randomChoice(['긴 웨이브 머리', '단정한 단발머리', '자연스러운 긴 생머리']),
        eyes: inputData.physical_allure?.appearance?.eyes || randomChoice(['큰 둥근 눈', '또렷한 눈매', '온화한 눈빛']),
        body: inputData.physical_allure?.appearance?.body || '건강하고 균형잡힌 체형',
        bust: inputData.physical_allure?.appearance?.bust || randomChoice(['자연스러운 곡선', '적당한 볼륨']),
        waist_hip: inputData.physical_allure?.appearance?.waist_hip || '슬림한 허리와 자연스러운 힙라인',
        style: inputData.physical_allure?.appearance?.style || randomChoice(['캐주얼하면서 세련된', '우아하고 단정한'])
      }
    },
    psychological_depth: {
      core_desires: inputData.psychological_depth?.core_desires || template.core_desires,
      vulnerabilities: inputData.psychological_depth?.vulnerabilities || ['오해받는 것을 두려워함'],
      boundaries: {
        comfort_level: inputData.psychological_depth?.boundaries?.comfort_level || 'moderate_flirtation',
        escalation_pace: inputData.psychological_depth?.boundaries?.escalation_pace || 'gradual_building'
      },
      emotional_triggers: {
        positive: inputData.psychological_depth?.emotional_triggers?.positive || template.positive_triggers,
        negative: inputData.psychological_depth?.emotional_triggers?.negative || template.negative_triggers
      }
    },
    conversation_dynamics: {
      flirtation_patterns: inputData.conversation_dynamics?.flirtation_patterns || ['subtle_compliments', 'playful_teasing'],
      response_tendencies: {
        to_humor: inputData.conversation_dynamics?.response_tendencies?.to_humor || 'laughs_easily_builds_rapport',
        to_compliments: inputData.conversation_dynamics?.response_tendencies?.to_compliments || 'gracefully_accepts_reciprocates',
        to_interest: inputData.conversation_dynamics?.response_tendencies?.to_interest || 'becomes_more_engaging'
      },
      conversation_hooks: inputData.conversation_dynamics?.conversation_hooks || ['취미 이야기', '일상 경험'],
      speech_style: inputData.conversation_dynamics?.speech_style || `${mbti} 유형의 따뜻하고 자연스러운 말투`,
      speech_quirks: inputData.conversation_dynamics?.speech_quirks || ['이모티콘 사용', '부드러운 어조']
    },
    relationship_progression: {
      stages: {
        initial_attraction: {
          behaviors: ['curious_questions', 'friendly_smiles', 'active_listening'],
          affection_range: [0, 25],
          dialogue_style: 'friendly_and_interested'
        },
        building_tension: {
          behaviors: ['deeper_conversations', 'subtle_touches', 'meaningful_eye_contact'],
          affection_range: [26, 60],
          dialogue_style: 'warm_and_engaging'
        },
        intimate_connection: {
          behaviors: ['personal_sharing', 'affectionate_gestures', 'close_proximity'],
          affection_range: [61, 100],
          dialogue_style: 'intimate_and_trusting'
        }
      }
    },
    created_at: new Date().toISOString(),
    generation_method: 'template_auto_completion',
    source: 'auto_complete_fallback'
  };

  console.log('✅ 템플릿 기반 캐릭터 자동 완성 완료');
  return completedCharacter;
}

// 🎲 템플릿 기반 인물 소개 생성 (OpenAI 실패 시 사용)
function generateTemplateBasedProfile(characterData) {
  console.log('🎲 템플릿 기반 인물 소개 생성');

  const name = characterData.basic_info?.name || characterData.name || '미나';
  const age = characterData.basic_info?.age || characterData.age || 23;
  const mbti = characterData.basic_info?.mbti || characterData.mbti || 'ENFP';
  const occupation = characterData.basic_info?.occupation || '대학생';
  const seductionStyle = characterData.appeal_profile?.seduction_style || 'warm_nurturing';

  const profileTemplate = `**${name} (${age}세, ${mbti})**

**기본 정보**
${name}는 ${age}세의 매력적인 ${occupation}입니다. ${mbti} 성격으로 ${getMBTIDescription(mbti)} 특성을 가지고 있습니다.

**외모와 스타일**
${getAppearanceDescription(characterData)} ${name}의 ${seductionStyle === 'playful_confident' ? '장난스럽고 자신감 있는' :
seductionStyle === 'mysterious_elegant' ? '신비롭고 우아한' :
seductionStyle === 'intellectually_stimulating' ? '지적이고 세련된' : '따뜻하고 포용적인'} 매력이 돋보입니다.

**성격과 매력**
${getPersonalityDescription(characterData, mbti)} ${name}의 주요 매력 포인트는 ${getCharmDescription(characterData)}입니다.

**대화 스타일**
${getSpeechStyleDescription(characterData, mbti)} ${name}는 ${getFlirtationDescription(seductionStyle)} 방식으로 상대방과 소통합니다.

**심리적 특성**
${getPsychologicalDescription(characterData)} 이런 특성들이 ${name}의 독특한 매력을 만들어냅니다.

**관계 발전 패턴**
- **초기 단계**: 호기심 어린 질문과 친근한 미소로 관심을 표현
- **발전 단계**: 더 깊은 대화와 은은한 스킨십으로 친밀감 형성
- **친밀 단계**: 개인적인 이야기 공유와 애정 어린 몸짓으로 깊은 유대감 구축

**시나리오 활용 가이드**
- 대화 생성 시 ${name}의 ${mbti} 특성과 ${seductionStyle} 스타일을 반영
- 호감도에 따른 단계별 반응 패턴 적용
- ${name}의 감정 트리거(긍정: ${(characterData.psychological_depth?.emotional_triggers?.positive || ['genuine_compliments']).join(', ')}, 부정: ${(characterData.psychological_depth?.emotional_triggers?.negative || ['dismissive_behavior']).join(', ')}) 고려
- 자연스러운 ${mbti} 유형의 말투와 행동 패턴 구현`;

  const profileData = {
    character_id: characterData.id,
    character_name: name,
    profile_text: profileTemplate,
    generated_at: new Date().toISOString(),
    generation_method: 'template_based',
    usage_guide: {
      scenario_prompt: `다음 캐릭터로 시나리오를 생성할 때 참고하세요:\n\n${profileTemplate}`,
      dialogue_prompt: `${name}의 특성을 반영한 대화를 생성하세요:\n\n${profileTemplate}`,
      episode_context: profileTemplate
    }
  };

  console.log('✅ 템플릿 기반 인물 소개 생성 완료');
  return profileData;
}

// ✨ 빈 값 처리 헬퍼 함수 (강화된 버전)
function getValueOrDefault(value, defaultValue, fieldName = 'unknown') {
  console.log(`🔍 [${fieldName}] getValueOrDefault 검사: "${JSON.stringify(value)}" (${typeof value})`);

  // 더욱 강화된 빈 값 감지
  const isEmpty = (
    value === null ||
    value === undefined ||
    value === '' ||
    value === 'undefined' ||
    value === 'null' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'string' && value.trim() === '정보 없음') ||
    (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
  );

  if (isEmpty) {
    const finalDefault = Array.isArray(defaultValue) ? [...defaultValue] : defaultValue;
    console.log(`  → [${fieldName}] 빈 값 감지! 기본값 적용: ${JSON.stringify(finalDefault)}`);
    return finalDefault;
  }

  console.log(`  → [${fieldName}] 입력값 사용: ${JSON.stringify(value)}`);
  return value;
}

// 🎯 MBTI별 개성있는 기본값 생성 시스템
function generateMBTIDefaults(mbti) {
  const mbtiMap = {
    'INFP': {
      charm_points: ['순수한 미소', '깊은 눈빛', '감성적인 표현'],
      core_desires: ['진정한 이해', '창의적 표현', '의미있는 연결'],
      speech_style: 'INFP 유형의 감성적이고 따뜻한 말투'
    },
    'ENFP': {
      charm_points: ['밝은 에너지', '재치있는 유머', '감염력있는 웃음'],
      core_desires: ['새로운 경험', '사람들과의 연결', '자유로운 표현'],
      speech_style: 'ENFP 유형의 활발하고 친근한 말투'
    },
    'ENFJ': {
      charm_points: ['따뜻한 카리스마', '공감하는 눈빛', '격려하는 미소'],
      core_desires: ['타인의 성장 돕기', '의미있는 관계', '긍정적 영향력'],
      speech_style: 'ENFJ 유형의 따뜻하고 격려적인 말투'
    },
    'INTJ': {
      charm_points: ['신비로운 아우라', '날카로운 통찰력', '차분한 자신감'],
      core_desires: ['지적 자극', '체계적 성장', '깊이있는 관계'],
      speech_style: 'INTJ 유형의 논리적이고 간결한 말투'
    },
    'ESFJ': {
      charm_points: ['따뜻한 배려', '세심한 관심', '포근한 미소'],
      core_desires: ['타인 돕기', '조화로운 관계', '안정적 연결'],
      speech_style: 'ESFJ 유형의 다정하고 배려깊은 말투'
    },
    'ISTP': {
      charm_points: ['쿨한 매력', '자연스러운 여유', '실용적 센스'],
      core_desires: ['개인적 자유', '실용적 성취', '독립적 생활'],
      speech_style: 'ISTP 유형의 간결하고 직설적인 말투'
    },
    // 🔥 추가된 10개 MBTI 타입
    'INFJ': {
      charm_points: ['신비로운 깊이', '따뜻한 직감', '조용한 카리스마'],
      core_desires: ['깊은 유대감', '의미있는 목적', '타인의 진정한 이해'],
      speech_style: 'INFJ 유형의 신중하고 깊이있는 말투'
    },
    'INTP': {
      charm_points: ['독특한 관점', '지적인 호기심', '창의적 사고'],
      core_desires: ['지적 탐구', '독립적 사고', '창의적 자유'],
      speech_style: 'INTP 유형의 논리적이고 탐구적인 말투'
    },
    'ENTJ': {
      charm_points: ['강한 리더십', '확고한 자신감', '추진력있는 매력'],
      core_desires: ['목표 달성', '조직적 성공', '효율적 성장'],
      speech_style: 'ENTJ 유형의 단호하고 리더십있는 말투'
    },
    'ENTP': {
      charm_points: ['재치있는 유머', '창의적 아이디어', '활발한 토론'],
      core_desires: ['새로운 가능성', '창의적 도전', '지적 자극'],
      speech_style: 'ENTP 유형의 활발하고 창의적인 말투'
    },
    'ISFP': {
      charm_points: ['온화한 미소', '예술적 감성', '자연스러운 매력'],
      core_desires: ['개인적 가치', '예술적 표현', '조화로운 관계'],
      speech_style: 'ISFP 유형의 부드럽고 감성적인 말투'
    },
    'ISFJ': {
      charm_points: ['따뜻한 보살핌', '세심한 배려', '안정감주는 존재감'],
      core_desires: ['타인 보호', '안정적 관계', '봉사와 도움'],
      speech_style: 'ISFJ 유형의 친절하고 배려깊은 말투'
    },
    'ESFP': {
      charm_points: ['밝은 에너지', '순수한 즐거움', '사교적 매력'],
      core_desires: ['즐거운 경험', '사람들과의 연결', '자유로운 표현'],
      speech_style: 'ESFP 유형의 밝고 친근한 말투'
    },
    'ESTJ': {
      charm_points: ['안정감있는 리더십', '책임감있는 모습', '실용적 매력'],
      core_desires: ['질서와 안정', '체계적 성취', '책임있는 역할'],
      speech_style: 'ESTJ 유형의 체계적이고 확실한 말투'
    },
    'ESTP': {
      charm_points: ['역동적 에너지', '순발력있는 재치', '모험적 매력'],
      core_desires: ['즉석 모험', '실용적 경험', '활동적 생활'],
      speech_style: 'ESTP 유형의 활발하고 직설적인 말투'
    },
    'ISTJ': {
      charm_points: ['신뢰할수있는 안정감', '차분한 매력', '성실한 모습'],
      core_desires: ['안정과 질서', '신뢰관계', '체계적 생활'],
      speech_style: 'ISTJ 유형의 신중하고 성실한 말투'
    }
  };

  const defaults = mbtiMap[mbti] || mbtiMap['ENFP']; // 기본값 fallback
  console.log(`🎯 [${mbti}] MBTI 기본값 생성:`, defaults);
  return defaults;
}

// 🔄 프론트엔드 데이터를 v2.0 스키마로 변환 (강화된 기본값 로직)
function convertToV2Schema(frontendData) {
  console.log('🔄 v2.0 스키마 변환 시작:', frontendData);
  console.log('🔍 문제 필드 검사:');
  console.log('  - frontendData.charm_points:', frontendData.charm_points);
  console.log('  - frontendData.core_desires:', frontendData.core_desires);
  console.log('  - frontendData.speech_style:', frontendData.speech_style);

  // MBTI별 개성있는 기본값 생성
  const mbtiDefaults = generateMBTIDefaults(frontendData.mbti);

  // 기본 ID 생성
  const characterId = `${frontendData.name.toLowerCase().replace(/\s+/g, '_')}_${frontendData.mbti.toLowerCase()}_${Date.now()}`;

  // 허어 옵션 배열들
  const hairOptions = ['long_straight', 'long_wavy', 'medium_bob', 'short_cute', 'curly_hair'];
  const eyeOptions = ['round_cute', 'seductive_eyes', 'innocent_eyes', 'mysterious_eyes', 'bright_eyes'];
  const styleOptions = ['cute_casual', 'sexy_chic', 'innocent_style', 'elegant_fashion', 'sporty_style'];
  const occupationOptions = ['art', 'music', 'literature', 'psychology', 'business', 'design'];
  const charmOptions = ['전염성 있는 미소', '예쁘게 웃는 모습', '장난스러운 말투', '사랑스러운 제스쳐'];
  const desireOptions = ['의미있는 연결', '개인적 성장', '새로운 사람들과의 만남', '창의적 표현'];

  const v2Character = {
    id: characterId,
    basic_info: {
      name: frontendData.name,
      age: parseInt(frontendData.age),
      mbti: frontendData.mbti,
      occupation: getValueOrDefault(frontendData.major, randomChoice(occupationOptions)),
      gender: 'female'
    },
    appeal_profile: {
      seduction_style: getValueOrDefault(frontendData.seduction_style, 'playful_confident', 'seduction_style'),
      charm_points: getValueOrDefault(frontendData.charm_points, [...mbtiDefaults.charm_points], 'charm_points'),
      emotional_intelligence: frontendData.emotional_intelligence || randomRange(6, 9),
      confidence_level: frontendData.confidence_level || randomRange(6, 9),
      mystery_factor: frontendData.mystery_factor || randomRange(4, 8),
      sexual_curiosity: frontendData.sexual_curiosity || randomRange(3, 7) // 🔥 새로 추가된 성적 호기심
    },
    physical_allure: {
      appearance: {
        hair: getValueOrDefault(frontendData.appearance?.hair || frontendData.hair, randomChoice(hairOptions)),
        eyes: getValueOrDefault(frontendData.appearance?.eyes || frontendData.eyes, randomChoice(eyeOptions)),
        body: getValueOrDefault(frontendData.appearance?.body || frontendData.body, 'petite_sexy'),
        bust: getValueOrDefault(frontendData.appearance?.bust || frontendData.bust, 'small_cute'),
        waist_hip: getValueOrDefault(frontendData.appearance?.waist_hip || frontendData.waist_hip, 'slim_tight'),
        style: getValueOrDefault(frontendData.appearance?.style || frontendData.style, randomChoice(styleOptions))
      }
    },
    psychological_depth: {
      core_desires: getValueOrDefault(frontendData.core_desires, [...mbtiDefaults.core_desires], 'core_desires'),
      boundaries: {
        comfort_level: getValueOrDefault(frontendData.comfort_level, 'light_flirtation', 'comfort_level'),
        escalation_pace: getValueOrDefault(frontendData.escalation_pace, 'very_gradual', 'escalation_pace')
      }
    },
    conversation_dynamics: {
      speech_style: getValueOrDefault(frontendData.speech_style, mbtiDefaults.speech_style, 'speech_style')
    },
    // 📋 새로운 과거 이력 섹션 (v2.1 확장)
    past_history: {
      boyfriend_count: frontendData.boyfriend_count || randomRange(0, 5),
      preferred_skinship: frontendData.preferred_skinship || null, // 배열 또는 null
      relationship_experience: frontendData.relationship_experience || 'intermediate',
      first_experience_age: frontendData.first_experience_age || 'late_teens'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'api_save',
    active: true,
    version: '2.0'
  };

  console.log('✅ v2.0 스키마 변환 완료 (모든 필드 채울):', v2Character);
  console.log('📈 기본값 적용 필드:');
  console.log('  - occupation:', v2Character.basic_info.occupation);
  console.log('  - hair:', v2Character.physical_allure.appearance.hair);
  console.log('  - eyes:', v2Character.physical_allure.appearance.eyes);
  console.log('  - style:', v2Character.physical_allure.appearance.style);
  console.log('  - charm_points:', v2Character.appeal_profile.charm_points);
  console.log('  - core_desires:', v2Character.psychological_depth.core_desires);

  return v2Character;
}

// 📝 간단한 인물소개 생성 (프롬프트 역할)
function generateSimpleProfile(characterData) {
  const name = characterData.basic_info.name;
  const age = characterData.basic_info.age;
  const mbti = characterData.basic_info.mbti;
  const occupation = characterData.basic_info.occupation;
  const seductionStyle = characterData.appeal_profile.seduction_style;
  const hair = characterData.physical_allure.appearance.hair;
  const body = characterData.physical_allure.appearance.body;
  const comfortLevel = characterData.psychological_depth.boundaries.comfort_level;

  const profileText = `**${name} (${age}세, ${mbti})**

**기본 정보**
${name}는 ${age}세의 매력적인 ${occupation} 전공 여성입니다. ${mbti} 성격으로 ${getMBTIDescription(mbti)} 특성을 가지고 있습니다.

**외모와 매력**
${getPhysicalDescription(hair, body, seductionStyle)} ${name}의 ${getSeductionStyleDescription(seductionStyle)} 매력이 돋보입니다.

**대화 스타일**
${characterData.conversation_dynamics.speech_style}로 대화하며, ${getComfortLevelDescription(comfortLevel)} 수준의 치정을 선호합니다.

**시나리오 활용 가이드**
- ${name}의 ${mbti} 특성과 ${seductionStyle} 스타일을 반영한 대화 생성
- 호감도에 따른 단계별 반응 패턴 적용
- ${name}의 ${comfortLevel} 경계선을 고려한 자연스러운 대화 전개`;

  return {
    character_id: characterData.id,
    character_name: name,
    profile_text: profileText,
    generated_at: new Date().toISOString(),
    generation_method: 'simple_template',
    usage_guide: {
      scenario_prompt: `${name}의 특성을 반영한 시나리오를 생성하세요:\n\n${profileText}`,
      dialogue_prompt: profileText
    }
  };
}

// 헬퍼 함수들
function getMBTIDescription(mbti) {
  const descriptions = {
    'INFP': '감성적이고 이상주의적인',
    'ENFP': '열정적이고 외향적인',
    'INTJ': '논리적이고 독립적인',
    'ESFJ': '사교적이고 배려심 많은',
    'ISTP': '실용적이고 독립적인',
    'INFJ': '직관적이고 이상주의적인',
    'ENTP': '창의적이고 도전적인',
    'ISFJ': '헌신적이고 보호적인'
  };
  return descriptions[mbti] || '매력적이고 독특한';
}

function getPhysicalDescription(hair, body, seductionStyle) {
  const hairDesc = {
    'long_straight': '긴 직모',
    'long_wavy': '긴 웨이브 머리',
    'medium_bob': '단정한 단발머리',
    'short_cute': '짧고 귀여운 머리'
  }[hair] || '아름다운 머리';

  const bodyDesc = {
    'petite': '소귀하고 가녀린',
    'petite_sexy': '소귀하지만 섹시한',
    'average_height': '적당한 키에 균형잡힌',
    'tall_elegant': '키 크고 우아한'
  }[body] || '매력적인';

  return `${hairDesc}과 ${bodyDesc} 체형을 가진`;
}

function getSeductionStyleDescription(style) {
  const styles = {
    'playful_confident': '장난스럽고 자신감 있는',
    'innocent_charming': '순수하고 매력적인',
    'mysterious_alluring': '신비롭고 유혹적인',
    'direct_passionate': '직설적이고 열정적인'
  };
  return styles[style] || '매력적이고 자연스러운';
}

function getComfortLevelDescription(level) {
  const levels = {
    'light_flirtation': '가벼운 치정',
    'moderate_flirtation': '적당한 치정',
    'intimate_conversation': '친밀한 대화'
  };
  return levels[level] || '자연스러운';
}

function generateRandomName() {
  const names = ['미나', '지영', '수진', '하은', '유리', '서현', '예은', '소연', '지은', '민지'];
  return randomChoice(names);
}

// 추가 헬퍼 함수들
function randomSelect(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMBTIDescription(mbti) {
  const descriptions = {
    'INFP': '감성적이고 이상주의적인',
    'ENFP': '열정적이고 외향적인',
    'INTJ': '논리적이고 독립적인',
    'ESFJ': '사교적이고 배려심 많은',
    'ISTP': '실용적이고 독립적인'
  };
  return descriptions[mbti] || '매력적이고 독특한';
}

function getAppearanceDescription(characterData) {
  const hair = characterData.physical_allure?.appearance?.hair || '아름다운 머리카락';
  const eyes = characterData.physical_allure?.appearance?.eyes || '인상 깊은 눈매';
  return `${hair}과 ${eyes}를 가진`;
}

function getPersonalityDescription(characterData, mbti) {
  const coreDesires = characterData.psychological_depth?.core_desires || ['meaningful_connection'];
  return `${mbti} 유형답게 ${coreDesires.join('과 ')}을 중요하게 생각합니다.`;
}

function getCharmDescription(characterData) {
  const charmPoints = characterData.appeal_profile?.charm_points || ['infectious_smile', 'gentle_nature'];
  return charmPoints.join(', ');
}

function getSpeechStyleDescription(characterData, mbti) {
  const speechStyle = characterData.conversation_dynamics?.speech_style || `${mbti} 유형의 자연스러운 말투`;
  return `${speechStyle}로 대화하며`;
}

function getFlirtationDescription(seductionStyle) {
  const descriptions = {
    'playful_confident': '장난스럽고 자신감 있는',
    'mysterious_elegant': '신비롭고 우아한',
    'warm_nurturing': '따뜻하고 보살피는',
    'intellectually_stimulating': '지적이고 자극적인'
  };
  return descriptions[seductionStyle] || '자연스럽고 매력적인';
}

function getPsychologicalDescription(characterData) {
  const vulnerabilities = characterData.psychological_depth?.vulnerabilities || ['오해받는 것을 두려워함'];
  const comfortLevel = characterData.psychological_depth?.boundaries?.comfort_level || 'moderate_flirtation';
  return `${vulnerabilities.join('과 ')} 같은 섬세한 면이 있으며, ${comfortLevel === 'light_flirtation' ? '가벼운 플러팅을' : comfortLevel === 'intense_chemistry' ? '강한 케미를' : '적당한 플러팅을'} 선호합니다.`;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 📸 사진 관리를 위한 GitHub 함수들
async function loadPhotosFromGitHub() {
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    console.log('📸 GitHub에서 사진 데이터 로드 시도...');

    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PHOTOS_FILE_PATH}`;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ChatGame-Photo-Loader'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(getFileUrl, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      console.log('✅ 사진 데이터 로드 성공');
      return JSON.parse(content);
    } else if (response.status === 404) {
      console.log('📸 사진 데이터베이스가 없습니다. 새로 생성합니다.');
      return {
        photos: {},
        metadata: {
          version: "1.0.0",
          total_characters: 0,
          total_photos: 0,
          storage_type: "github_base64",
          max_photo_size: "2MB",
          supported_formats: ["jpeg", "jpg", "png", "webp"],
          categories: PHOTO_CATEGORIES,
          created: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ 사진 데이터 로드 실패:', error.message);
    throw error;
  }
}

async function savePhotosToGitHub(photosData) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'EnmanyProject';
  const REPO_NAME = 'chatgame';

  try {
    console.log('📸 GitHub에 사진 데이터 저장 시도...');

    if (!GITHUB_TOKEN) {
      throw new Error('GitHub 토큰이 설정되지 않았습니다');
    }

    // 현재 파일의 SHA 가져오기
    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PHOTOS_FILE_PATH}`;
    let sha = null;

    try {
      const getResponse = await fetch(getFileUrl, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (error) {
      console.log('📄 기존 파일 없음 - 새 파일 생성');
    }

    // 파일 업데이트/생성
    const content = Buffer.from(JSON.stringify(photosData, null, 2)).toString('base64');

    const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PHOTOS_FILE_PATH}`;
    const updateData = {
      message: `Update character photos database - ${new Date().toISOString()}`,
      content: content
    };

    if (sha) {
      updateData.sha = sha;
    }

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      console.log('✅ 사진 데이터 GitHub 저장 성공');
      return true;
    } else {
      const error = await updateResponse.text();
      throw new Error(`GitHub 저장 실패: ${updateResponse.status} - ${error}`);
    }
  } catch (error) {
    console.error('❌ 사진 데이터 GitHub 저장 실패:', error.message);
    throw error;
  }
}

// 🎭 ================ 캐릭터 프롬프트 생성 함수들 ================

// OpenAI API를 통한 캐릭터 프롬프트 생성
async function generateCharacterPromptWithOpenAI(characterData, model = 'gpt-4o', style, length, systemPrompt) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다');
  }

  console.log('🤖 OpenAI API 프롬프트 생성 시작...');
  console.log('📋 캐릭터:', characterData.basic_info?.name);
  console.log('🎨 스타일:', style);

  // 캐릭터 데이터를 안전하게 요약해서 프롬프트에 포함
  const characterSummary = createCharacterSummary(characterData);

  const userPrompt = `다음 캐릭터에 대한 ${style} 스타일의 상세한 프롬프트를 작성해주세요.

캐릭터 데이터:
${characterSummary}

요구사항:
- 제공된 캐릭터 데이터의 모든 주요 특성을 포함해주세요
- 모든 수치 (감정지능, 자신감, 신비로움 등)를 구체적으로 언급
- 배열 항목들 (매력포인트, 취미, 대화주제 등)을 개별적으로 언급
- 외모, 성격, 대화스타일, 과거경험을 균형있게 다뤄주세요
- MBTI 특성을 자연스럽게 반영
- 한국어로 자연스럽고 매력적으로 작성

작성 형식:
1. 캐릭터 개요 (기본정보, 핵심 특징)
2. 성격과 심리적 특성 (MBTI 특성, 감정지능, 취약점 등)
3. 외모와 매력 포인트 (헤어, 체형, 스타일, 특징적 요소)
4. 대화 스타일과 소통 방식 (말투, 습관, 반응 패턴)
5. 취미와 관심사
6. 과거 경험과 관계 패턴
7. 가치관과 미래 목표

목표 길이: 3000-5000자 정도로 충실하면서도 읽기 좋게 작성해주세요.`;

  try {
    // 타임아웃을 위한 AbortController 설정 (25초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: length === 'short' ? 3000 : length === 'medium' ? 5000 : 7000,
        temperature: 0.7
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `OpenAI API 오류: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.error?.message || '알 수 없는 오류'}`;
      } catch (e) {
        errorMessage += ' - 응답 파싱 실패';
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    const generatedPrompt = result.choices[0]?.message?.content?.trim();

    if (!generatedPrompt) {
      throw new Error('OpenAI API에서 프롬프트를 생성하지 못했습니다');
    }

    console.log('✅ OpenAI API 프롬프트 생성 완료, 길이:', generatedPrompt.length);
    return generatedPrompt;

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error.message);

    // 타임아웃 에러 처리
    if (error.name === 'AbortError') {
      throw new Error('프롬프트 생성 시간이 초과되었습니다. 더 짧은 길이로 다시 시도해주세요.');
    }

    // 기타 네트워크 에러
    if (error.message.includes('fetch')) {
      throw new Error('네트워크 연결 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    throw error;
  }
}

// 캐릭터 데이터 요약 생성
// 영어 키워드를 한글로 번역하는 함수
function translateToKorean(value) {
  const translations = {
    // 매력 포인트
    'infectious_smile': '감염력 있는 미소', 'witty_banter': '재치있는 농담', 'confident_touch': '자신감 있는 스킨십',
    'mysterious_aura': '신비로운 분위기', 'expressive_eyes': '표현력 있는 눈',

    // 외모
    'shoulder_wave': '어깨까지 오는 웨이브 헤어', 'messy_sexy': '섹시한 무질서 헤어', 'ponytail': '포니테일',
    'cat_like': '고양이 같은 눈', 'mysterious_deep': '신비롭고 깊은 눈', 'seductive_eyes': '매혹적인 눈',
    'tall_elegant': '키 크고 우아한 체형', 'model_like': '모델 같은 체형', 'petite_sexy': '작고 섹시한 체형',
    '운동체형': '운동으로 다듬어진 몸매', '슬림': '슬림한 체형', '균형': '균형잡힌 체형', '풍만': '풍만한 체형',
    '섹시': '섹시한 스타일', '트렌디': '트렌디한 스타일', '우아': '우아한 스타일', '캐주얼': '캐주얼한 스타일',

    // 특징
    'beautiful_face': '아름다운 얼굴', 'slim_waist': '슬림한 허리', 'soft_skin': '부드러운 피부',
    'attractive_chest': '매력적인 가슴', 'long_legs': '긴 다리',

    // 습관 및 행동
    '다리꼬기': '다리를 꼬는 습관', '윙크하기': '윙크하는 습관', '입술깨물기': '입술을 깨무는 습관',
    '유혹적시선': '유혹적인 시선', '몸기울이기': '몸을 기울이는 행동',
    '몸떨림': '몸을 떠는 행동', '시선피함': '시선을 피하는 행동', '얼굴발그레짐': '얼굴이 빨개지는 반응',
    '심장두근거림': '심장이 두근거리는 반응', '눈동자흔들림': '눈동자가 흔들리는 행동', '숨소리거칠어짐': '거친 숨소리',

    // 대화 스타일
    'warm_nurturing': '따뜻하고 보살피는', 'sultry_dominant': '섹시하고 주도적인', 'playful_seductive': '장난기 있고 유혹적인',
    'subtle_teasing': '은근한 놀림', 'direct_compliments': '직접적인 칭찬', 'gentle_touches': '부드러운 터치',
    'eye_contact': '눈맞춤', 'mysterious_hints': '신비로운 암시', 'playful_banter': '장난스러운 농담',

    // 반응
    'giggles_easily': '쉽게 깔깔 웃음', 'gracefully_accepts': '우아하게 받아들임', 'enthusiastic_sharing': '열정적으로 공유함',

    // 말 습관
    'whisper_tone': '속삭이는 어조', 'repeat_words': '말을 반복하는 습관', 'polite_ending': '정중한 어미',
    'giggle_often': '자주 킥킥 웃음', 'frequent_emoji': '이모티콘 자주 사용', 'english_mix': '영어 섞어 사용',
    'exclamations': '감탄사 자주 사용',

    // 대화 주제
    'travel_stories': '여행 이야기', 'food_culture': '음식 문화', 'work_passion': '일에 대한 열정',
    'life_philosophy': '인생 철학', 'future_dreams': '미래의 꿈', 'relationships': '인간관계',
    'childhood_memories': '어린 시절 추억', 'music_movies': '음악과 영화',

    // 심리적 특성
    'meaningful_connection': '의미있는 관계', 'personal_growth': '개인적 성장', 'creative_expression': '창의적 표현',
    'intellectual_stimulation': '지적 자극', 'adventure_excitement': '모험과 흥미',
    'perfectionism': '완벽주의', 'commitment_fear': '약속에 대한 두려움',
    'love_family': '사랑과 가족', 'light_flirtation': '가벼운 플러팅', 'very_gradual': '매우 점진적',
    'moderate': '적당한 수준',

    // 취미
    'gaming': '게임', 'dancing': '춤', 'photography': '사진촬영', 'reading': '독서', 'music': '음악',
    'movies': '영화', 'cooking': '요리', 'shopping': '쇼핑', 'cafe': '카페', 'coding': '코딩',

    // 직업
    'student': '학생', 'office_worker': '회사원', 'teacher': '교사', 'designer': '디자이너',
    'art': '예술가', 'artist': '예술가',

    // 스킨십
    'hand_holding': '손잡기', 'head_patting': '머리 쓰다듬기', 'passionate_kiss': '열정적인 키스',
    'shoulder_massage': '어깨 마사지', 'back_rubbing': '등 마사지', 'intimate_cuddling': '친밀한 포옹',
    'cheek_kiss': '볼에 키스',

    // 경험
    'beginner': '초보자', 'early_teens': '10대 초반',

    // 선물
    'flowers': '꽃', 'chocolate': '초콜릿', 'perfume': '향수', 'expensive_car': '고급차',
    'jewelry': '보석', 'luxury_lingerie': '고급 란제리', 'cute_accessories': '귀여운 액세서리',
    'spa_voucher': '스파 이용권',

    // 우선순위
    'humor': '유머', 'communication': '소통능력', 'intelligence': '지성', 'emotional_maturity': '감정적 성숙함',
    'reliability': '신뢰성', 'appearance': '외모', 'personality': '성격',

    // 모티프
    'art_creativity': '예술과 창의성', 'nature_travel': '자연과 여행', 'philosophy': '철학',
    'daily_life': '일상생활', 'friendship': '우정', 'romance_love': '로맨스와 사랑',

    // 금기
    'health': '건강', 'politics': '정치', 'sports': '스포츠', 'military': '군대',
    'past_relationships': '과거 연애', 'finance': '금융', 'family': '가족',

    // 목표
    '1_billion': '10억원', 'freelancer': '프리랜서',

    // 어휘 수준
    'casual_friendly': '친근하고 편안한'
  };

  if (Array.isArray(value)) {
    return value.map(item => translations[item] || item).join(', ');
  }
  return translations[value] || value;
}

function createCharacterSummary(characterData) {
  const basic = characterData.basic_info || {};
  const appeal = characterData.appeal_profile || {};
  const physical = characterData.physical_allure || {};
  const conversation = characterData.conversation_dynamics || {};
  // 안전한 데이터만 사용 - psychological_depth, past_history 제외

  let summary = `==== 📋 기본 정보 ====
이름: ${basic.name || '미정'}
나이: ${basic.age || '미정'}세
MBTI: ${basic.mbti || '미정'}
직업: ${translateToKorean(basic.occupation) || '미정'}
성별: ${basic.gender === 'female' ? '여성' : basic.gender === 'male' ? '남성' : '여성'}

==== ✨ 매력 프로필 ====
매력 스타일: ${translateToKorean(appeal.seduction_style) || '따뜻하고 배려심 많음'}
매력 포인트: ${appeal.charm_points ? translateToKorean(appeal.charm_points) : '자연스러운 매력'}
감정지능: ${appeal.emotional_intelligence || '보통'}점 (10점 만점)
자신감: ${appeal.confidence_level || '보통'}점 (10점 만점)
신비로움: ${appeal.mystery_factor || '보통'}점 (10점 만점)
호기심 정도: ${appeal.sexual_curiosity || '보통'}점 (10점 만점)
개방성 정도: ${appeal.sexual_comfort || '보통'}점 (10점 만점)
취미: ${appeal.hobbies ? translateToKorean(appeal.hobbies) : '독서, 음악감상'}

==== 👄 외모적 매력 ====
헤어스타일: ${translateToKorean(physical.appearance?.hair) || '자연스러운 헤어'}
눈: ${translateToKorean(physical.appearance?.eyes) || '따뜻한 눈'}
체형: ${translateToKorean(physical.appearance?.body) || '자연스러운 체형'}
체격: ${physical.appearance?.bust || '자연스러운'} 타입
허리/힙: ${translateToKorean(physical.appearance?.waist_hip) || '균형잡힌'}
스타일: ${translateToKorean(physical.appearance?.style) || '편안한 스타일'}

특징적 요소: ${physical.feature_elements ? translateToKorean(physical.feature_elements) : '자연스러운 매력'}
매력적 습관: ${physical.sensual_habits ? translateToKorean(physical.sensual_habits) : '자연스러운 행동'}
바디 랭귀지: ${physical.body_language ? translateToKorean(physical.body_language) : '편안한 몸짓'}

==== 🧠 MBTI 성격 특성 ====
MBTI 유형: ${basic.mbti || 'INFP'}
성격 특징: ${getMBTICharacteristics(basic.mbti || 'INFP')}

==== 💬 대화 역학 ====
말투: ${translateToKorean(conversation.speech_style) || '자연스럽고 친근함'}
소통 패턴: ${conversation.flirting_patterns ? translateToKorean(conversation.flirting_patterns) : '자연스러운 소통'}
대화 주제: ${conversation.conversation_hooks ? translateToKorean(conversation.conversation_hooks) : '일상적인 주제들'}
말 습관: ${conversation.speech_habits ? translateToKorean(conversation.speech_habits) : '자연스러운 말투'}
어휘 수준: ${translateToKorean(conversation.vocabulary_register) || '일상적'}
허용 모티프: ${conversation.allowed_motifs ? translateToKorean(conversation.allowed_motifs) : '일반적 주제들'}
금기 단어: ${conversation.forbidden_terms ? translateToKorean(conversation.forbidden_terms) : '없음'}

반응 패턴:
- 유머에 대한 반응: ${translateToKorean(conversation.reaction_tendencies?.humor) || '자연스럽게 웃음'}
- 칭찬에 대한 반응: ${translateToKorean(conversation.reaction_tendencies?.compliment) || '감사히 받아들임'}
- 관심 표현 방식: ${translateToKorean(conversation.reaction_tendencies?.interest_expression) || '열정적으로 공유'}

==== 🎯 취미와 관심사 ====
주요 취미: ${appeal.hobbies ? translateToKorean(appeal.hobbies) : '독서, 음악감상'}
대화 주제: ${conversation.conversation_hooks ? translateToKorean(conversation.conversation_hooks) : '일상, 취미'}

==== 📊 메타데이터 ====
생성일: ${characterData.created_at || '미정'}
업데이트일: ${characterData.updated_at || '미정'}
소스: ${characterData.source || '수동 생성'}
버전: ${characterData.version || '1.0'}
활성 상태: ${characterData.active ? '활성' : '비활성'}`;

  return summary;
}

// Fallback 프롬프트 생성 (OpenAI 실패 시)
function generateFallbackPrompt(characterData, style, length) {
  const basic = characterData.basic_info || {};
  const appeal = characterData.appeal_profile || {};
  const conversation = characterData.conversation_dynamics || {};
  const physical = characterData.physical_allure || {};

  const name = basic.name || '미정';
  const age = basic.age || '20대';
  const mbti = basic.mbti || 'ISFJ';
  const occupation = translateToKorean(basic.occupation) || '학생';

  // Korean translations applied to all fields
  const seductionStyle = translateToKorean(appeal.seduction_style) || '따뜻하고 배려심 많은';
  const speechStyle = translateToKorean(conversation.speech_style) || '자연스럽고 친근한';
  const hobbies = appeal.hobbies ? translateToKorean(appeal.hobbies) : '독서와 음악감상';
  const charmPoints = appeal.charm_points ? translateToKorean(appeal.charm_points) : '자연스러운 매력';
  const featureElements = physical.feature_elements ? translateToKorean(physical.feature_elements) : '';
  const hair = translateToKorean(physical.appearance?.hair) || '자연스러운 헤어';
  const eyes = translateToKorean(physical.appearance?.eyes) || '따뜻한 눈';
  const body = translateToKorean(physical.appearance?.body) || '균형잡힌 체형';

  // 스타일별 템플릿 (Korean translations applied)
  const templates = {
    comprehensive: `${name}는 ${age}세의 ${mbti} 성격을 가진 매력적인 여성입니다. ${occupation} 분야에서 활동하며, ${seductionStyle} 매력을 가지고 있습니다.

외모적으로는 ${hair}, ${eyes}, ${body}의 특징을 가지고 있으며, ${charmPoints}${featureElements ? ', ' + featureElements : ''} 등의 매력 포인트가 있습니다.

그녀의 대화 스타일은 ${speechStyle} 방식이며, ${Array.isArray(conversation.flirting_patterns) ? translateToKorean(conversation.flirting_patterns) : '은은한 티징'}을 통해 상대방과 소통합니다. ${mbti} 특성에 따라 ${getMBTICharacteristics(mbti)}한 면모를 보입니다.

관계에서 중요하게 생각하는 것은 ${translateToKorean(characterData.psychological_depth?.values) || '진정성과 배려'}이며, ${hobbies} 등의 취미를 즐깁니다.`,

    roleplay: `안녕하세요, 저는 ${name}이에요! ${age}세이고 ${occupation}을 하고 있어요. ${mbti} 성격이라서 ${getMBTICharacteristics(mbti)}한 편이에요.

저는 ${seductionStyle} 성격으로, 대화할 때 ${speechStyle} 말하는 편이에요. ${hobbies}을 좋아하고, 특히 ${Array.isArray(conversation.conversation_hooks) ? translateToKorean(conversation.conversation_hooks[0]) : '일상 이야기'}에 대해 이야기하는 걸 즐겨요.`,

    psychological: `${name}의 심리적 프로필:

핵심 성격: ${mbti} 타입으로 ${getMBTICharacteristics(mbti)}한 특성을 보입니다.
내면의 욕구: ${Array.isArray(characterData.psychological_depth?.core_desires) ? translateToKorean(characterData.psychological_depth.core_desires) : '의미있는 관계와 개인적 성장'}
감정적 특성: ${appeal.emotional_intelligence || '7'}/10의 감정지능을 가지며, ${appeal.confidence_level || '5'}/10의 자신감 수준을 보입니다.
대인관계 패턴: ${speechStyle} 소통을 선호하며, ${Array.isArray(conversation.flirting_patterns) ? translateToKorean(conversation.flirting_patterns) : '은은한 매력 어필'}을 통해 관계를 발전시킵니다.`
  };

  let basePrompt = templates[style] || templates.comprehensive;

  // 길이 조정
  if (length === 'short') {
    return basePrompt.substring(0, 300) + '...';
  } else if (length === 'long') {
    return basePrompt + `\n\n추가적으로 ${name}는 ${Array.isArray(characterData.physical_allure?.sensual_habits) ? characterData.physical_allure.sensual_habits.join(', ') : '자연스러운 제스처'}와 같은 특별한 매력을 가지고 있으며, 상대방과의 관계에서 ${characterData.psychological_depth?.boundaries?.comfort_level || '편안한 수준'}의 친밀감을 추구합니다.`;
  }

  return basePrompt;
}

// MBTI 특성 설명
function getMBTICharacteristics(mbti) {
  const characteristics = {
    'ISFJ': '배려심 많고 온화',
    'ISFP': '감성적이고 예술적',
    'INFJ': '직관적이고 이상주의적',
    'INFP': '순수하고 로맨틱',
    'ESFJ': '사교적이고 따뜻',
    'ESFP': '활발하고 즐거움을 추구',
    'ENFJ': '카리스마 있고 영감을 주는',
    'ENFP': '열정적이고 창의적',
    'ISTJ': '신뢰할 수 있고 체계적',
    'ISTP': '실용적이고 독립적',
    'INTJ': '전략적이고 독립적',
    'INTP': '논리적이고 호기심 많은',
    'ESTJ': '리더십 있고 조직적',
    'ESTP': '모험적이고 실용적',
    'ENTJ': '자신감 있고 결단력 있는',
    'ENTP': '혁신적이고 논쟁을 좋아하는'
  };

  return characteristics[mbti] || '독특하고 매력적';
}

// OpenAI 정책 준수를 위한 데이터 sanitization 함수들
function sanitizeValueForOpenAI(value) {
  if (!value) return value;

  const sanitizationMap = {
    // 의류/액세서리 관련
    'luxury_lingerie': 'elegant_accessories',
    'sexy_lingerie': 'elegant_clothing',
    'sensual_lingerie': 'stylish_undergarments',

    // 외모 관련 - 더 강화
    'seductive_eyes': 'expressive_eyes',
    'sultry_dominant': 'confident_charming',
    'passionate_kiss': 'warm_affection',
    'sultry_gaze': 'charming_gaze',
    'seductive_smile': 'attractive_smile',
    'playful_seductive': 'playful_charming',

    // 스킨십 관련 - 더 강화
    'intimate_cuddling': 'close_bonding',
    'passionate_kiss': 'affectionate_gesture',
    'intimate_touch': 'gentle_touch',
    'sensual_massage': 'relaxing_massage',

    // 신체 관련 - 강화
    'D': 'well_proportioned',
    'E': 'full_figured',
    'F': 'curvy',
    'petite_sexy': 'petite_elegant',
    'attractive_chest': 'elegant_posture',

    // 신체 행동 - 새로 추가
    '입술깨물기': '미소짓기',
    '유혹적시선': '따뜻한시선',
    '섹시': '우아',
    '몸기울이기': '자연스럽게기울이기',
    '숨소리거칠어짐': '깊은호흡',

    // 스타일 관련
    'sultry_dominant': 'confident_charming',
    'playful_seductive': 'playful_friendly',

    // 기타 민감한 표현 - 강화
    'sensual_habits': 'charming_habits',
    'sultry': 'charming',
    'seductive': 'attractive',
    'sensual': 'graceful',
    'erotic': 'romantic',
    'sexual': 'intimate',
    'arousing': 'captivating',
    'sexual_curiosity': 'romantic_curiosity',
    'sexual_comfort': 'emotional_comfort',
    'sexual_freedom': 'emotional_openness',
    'sexual_tone_band': 'conversation_tone',
    'early_teens': 'mature_age',
    'first_experience_age': 'maturity_level'
  };

  if (Array.isArray(value)) {
    return value.map(item => sanitizationMap[item] || item);
  } else {
    return sanitizationMap[value] || value;
  }
}

// 🎯 OpenAI 전송용 안전한 구간만 추출하는 함수 (구조적 접근법)
function extractSafeDataForOpenAI(character) {
  if (!character) return character;

  console.log('🎯 안전 구간 추출 시작 - 민감한 필드 완전 제외');

  // ✅ OpenAI에 전송할 안전한 구간만 추출
  const safeData = {
    // 1. ✅ 기본 정보 (완전 안전)
    basic_info: character.basic_info ? {
      name: character.basic_info.name,
      age: character.basic_info.age,
      mbti: character.basic_info.mbti,
      occupation: character.basic_info.occupation,
      gender: character.basic_info.gender
    } : {},

    // 2. ✅ 매력 프로필 (민감한 sexual_ 필드 제외)
    appeal_profile: character.appeal_profile ? {
      seduction_style: character.appeal_profile.seduction_style,
      charm_points: character.appeal_profile.charm_points,
      emotional_intelligence: character.appeal_profile.emotional_intelligence,
      confidence_level: character.appeal_profile.confidence_level,
      mystery_factor: character.appeal_profile.mystery_factor,
      hobbies: character.appeal_profile.hobbies
      // ❌ sexual_curiosity, sexual_comfort 제외
    } : {},

    // 3. ✅ 외모 (민감한 세부사항 제외)
    physical_allure: character.physical_allure ? {
      appearance: character.physical_allure.appearance ? {
        hair: character.physical_allure.appearance.hair,
        eyes: character.physical_allure.appearance.eyes,
        body: character.physical_allure.appearance.body,
        waist_hip: character.physical_allure.appearance.waist_hip,
        style: character.physical_allure.appearance.style
        // ❌ bust 제외
      } : {}
      // ❌ feature_elements, sensual_habits, body_language 제외
    } : {},

    // 4. ✅ 대화 스타일 (안전한 부분만)
    conversation_dynamics: character.conversation_dynamics ? {
      speech_style: character.conversation_dynamics.speech_style,
      flirting_patterns: character.conversation_dynamics.flirting_patterns,
      conversation_hooks: character.conversation_dynamics.conversation_hooks,
      speech_habits: character.conversation_dynamics.speech_habits,
      vocabulary_register: character.conversation_dynamics.vocabulary_register,
      allowed_motifs: character.conversation_dynamics.allowed_motifs
      // ❌ reaction_tendencies, forbidden_terms 제외 (덜 중요)
    } : {}

    // ═══ 여기까지만 OpenAI 전송 ═══
    // ❌ psychological_depth 완전 제외
    // ❌ past_history 완전 제외
    // ❌ favorite_gifts 완전 제외
    // ❌ future_goals 완전 제외
    // ❌ male_priorities 완전 제외
  };

  console.log('🎯 안전 구간 추출 완료:');
  console.log('  ✅ basic_info:', !!safeData.basic_info);
  console.log('  ✅ appeal_profile:', !!safeData.appeal_profile);
  console.log('  ✅ physical_allure:', !!safeData.physical_allure);
  console.log('  ✅ conversation_dynamics:', !!safeData.conversation_dynamics);
  console.log('  ❌ 민감한 필드들 모두 제외됨');

  return safeData;
}