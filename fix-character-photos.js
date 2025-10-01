// 캐릭터 카드 사진 표시 문제 수정 스크립트

// 강화된 프로필 이미지 로드 함수
async function loadCharacterProfileImageFixed(characterId) {
    console.log(`🔍 [FIXED] 프로필 이미지 로드 시작: ${characterId}`);

    try {
        const encodedCharacterId = encodeURIComponent(characterId);
        const apiUrl = `/api/character-ai-generator?action=get_character_photos_v2&character_id=${encodedCharacterId}&_t=${Date.now()}`;
        console.log(`📡 [FIXED] API 호출: ${apiUrl}`);

        const response = await fetch(apiUrl);
        console.log(`📥 [FIXED] API 응답 상태: ${response.status}`);

        if (!response.ok) {
            console.error(`❌ [FIXED] API 응답 오류: ${response.status}`);
            return false;
        }

        const result = await response.json();
        console.log(`📊 [FIXED] API 응답 데이터:`, result);

        // 더 상세한 API 응답 분석
        console.log(`🔍 [FIXED] 완전한 API 응답 분석:`, {
            success: result.success,
            hasData: !!result.data,
            dataType: typeof result.data,
            hasPhotos: !!(result.data && result.data.photos),
            photosType: result.data && result.data.photos ? typeof result.data.photos : 'undefined',
            hasProfile: !!(result.data && result.data.photos && result.data.photos.profile),
            profileValue: result.data && result.data.photos ? result.data.photos.profile : 'no photos object'
        });

        if (result.success && result.data && result.data.photos && result.data.photos.profile) {
            const profileData = result.data.photos.profile;
            console.log(`📷 [FIXED] 프로필 사진 데이터 확인:`, {
                hasId: !!profileData.id,
                hasData: !!profileData.data,
                dataSize: profileData.data ? profileData.data.length : 0,
                dataPrefix: profileData.data ? profileData.data.substring(0, 50) : 'none'
            });

            const profileContainer = document.getElementById(`profile-image-${characterId}`);
            console.log(`🎯 [FIXED] 프로필 컨테이너 확인:`, {
                found: !!profileContainer,
                id: `profile-image-${characterId}`,
                currentHTML: profileContainer ? profileContainer.innerHTML.substring(0, 100) : 'not found'
            });

            if (profileContainer && profileData.data) {
                profileContainer.innerHTML = `
                    <img src="${profileData.data}"
                         alt="프로필 사진"
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                         onload="console.log('✅ [FIXED] 프로필 이미지 로드 성공: ${characterId}')"
                         onerror="console.log('❌ [FIXED] 프로필 이미지 로드 실패: ${characterId}'); this.parentElement.innerHTML='<div class=\\"no-image\\">${characterId.split('_')[0].charAt(0)}</div>'"/>
                `;
                console.log(`✅ [FIXED] 프로필 이미지 HTML 설정 완료: ${characterId}`);
                return true;
            } else {
                console.log(`❌ [FIXED] 컨테이너 또는 이미지 데이터 없음`);
                return false;
            }
        } else {
            console.log(`❌ [FIXED] API 응답에 프로필 사진 데이터 없음`, {
                success: result.success,
                hasData: !!result.data,
                hasPhotos: !!(result.data && result.data.photos),
                hasProfile: !!(result.data && result.data.photos && result.data.photos.profile)
            });
            return false;
        }
    } catch (error) {
        console.error(`❌ [FIXED] 프로필 이미지 로드 오류:`, error);
        return false;
    }
}

// displayCharacters 함수에 추가할 프로필 이미지 로드 로직
function loadAllCharacterPhotos() {
    console.log('🔄 [FIXED] 모든 캐릭터 프로필 이미지 로드 시작');

    const characterCards = document.querySelectorAll('.character-card');
    console.log(`📊 [FIXED] 찾은 캐릭터 카드 수: ${characterCards.length}`);

    characterCards.forEach((card, index) => {
        const profileImageContainer = card.querySelector('[id^="profile-image-"]');
        if (profileImageContainer) {
            const characterId = profileImageContainer.id.replace('profile-image-', '');
            console.log(`📸 [FIXED] ${index + 1}/${characterCards.length} 캐릭터 이미지 로드: ${characterId}`);

            setTimeout(() => {
                loadCharacterProfileImageFixed(characterId);
            }, index * 100); // 100ms 간격으로 순차 로드
        }
    });
}

// 즉시 실행
if (typeof window !== 'undefined') {
    // 기존 함수 오버라이드
    window.loadCharacterProfileImageFixed = loadCharacterProfileImageFixed;
    window.loadAllCharacterPhotos = loadAllCharacterPhotos;

    console.log('✅ [FIXED] 캐릭터 사진 수정 스크립트 로드 완료');
    console.log('💡 [FIXED] 사용법: loadAllCharacterPhotos() 호출');
}

// Node.js 환경에서도 사용 가능하도록
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadCharacterProfileImageFixed,
        loadAllCharacterPhotos
    };
}