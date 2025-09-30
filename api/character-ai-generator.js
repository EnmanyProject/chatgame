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

    // Base64 데이터 크기 확인 (약 2MB 제한)
    const sizeInBytes = (photoData.length * 3) / 4;
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

    if (sizeInBytes > maxSizeInBytes) {
        throw new Error(`이미지 크기가 너무 큽니다. 최대 2MB까지 지원됩니다. (현재: ${Math.round(sizeInBytes / (1024 * 1024) * 10) / 10}MB)`);
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
      const { character_id } = req.query;
      console.log('📸 캐릭터 사진 조회:', character_id);

      if (!character_id) {
        return res.status(400).json({
          success: false,
          message: '캐릭터 ID가 필요합니다.'
        });
      }

      try {
        const photosData = await loadPhotosFromGitHub();

        const characterPhotos = photosData.photos[character_id] || {
          character_id,
          photos: Object.keys(PHOTO_CATEGORIES).reduce((acc, cat) => {
            acc[cat] = cat === 'profile' ? null : [];
            return acc;
          }, {}),
          photo_count: 0
        };

        return res.status(200).json({
          success: true,
          data: characterPhotos,
          categories: PHOTO_CATEGORIES
        });
      } catch (error) {
        console.error('❌ 캐릭터 사진 조회 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: error.message || '캐릭터 사진 조회 실패',
          error_type: 'character_photos_error'
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
        // 사진 데이터 검증
        validatePhotoData(photo_data, category);

        // 사진 데이터 로드
        const photosData = await loadPhotosFromGitHub();

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

        // GitHub에 저장
        await savePhotosToGitHub(photosData);

        return res.status(200).json({
          success: true,
          message: '사진이 성공적으로 업로드되었습니다.',
          data: charPhotos,
          categories: PHOTO_CATEGORIES
        });

      } catch (error) {
        console.error('❌ 사진 업로드 실패:', error.message);
        return res.status(500).json({
          success: false,
          message: error.message || '사진 업로드 실패',
          error_type: 'photo_upload_error'
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
    console.log('  - upload_photo');
    console.log('  - delete_photo');

    return res.status(400).json({
      success: false,
      message: 'Unknown action. Available: list_characters, save_character, delete_character, reset_all_characters, generate_character, auto_complete_character, generate_character_profile, generate_complete_character_with_profile, list_all_photos, get_character_photos, upload_photo, delete_photo',
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
- 말투 스타일: ${userData.speech_style || '매혹적이고 성인 매력이 넘치는 말투'}
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
            content: '당신은 매력적이고 섹시한 성인 여성 캐릭터를 만드는 전문가입니다. 성숙하고 매혹적인 성인 여성의 매력을 강조하며, 사용자의 요구사항을 정확히 반영하여 완성도 높은 성인 캐릭터를 만들어주세요. 모든 캐릭터는 20세 이상의 성인이며, 성인적 매력과 섹시함을 가진 캐릭터여야 합니다.'
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
    'warm_nurturing': '따뜻하고 배려 깊은',
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