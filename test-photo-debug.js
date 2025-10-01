// 사진 API 디버깅 테스트 스크립트
async function testPhotoAPI() {
    const characterId = '나연_enfp_1759240894283';

    console.log('=== 사진 API 디버깅 테스트 ===');
    console.log(`테스트 캐릭터 ID: ${characterId}`);

    try {
        const encodedCharacterId = encodeURIComponent(characterId);
        const apiUrl = `/api/character-ai-generator?action=get_character_photos_v2&character_id=${encodedCharacterId}&_t=${Date.now()}`;

        console.log(`API URL: ${apiUrl}`);

        const response = await fetch(apiUrl);
        const result = await response.json();

        console.log('=== API 응답 분석 ===');
        console.log('Status:', response.status);
        console.log('Success:', result.success);
        console.log('Data:', result.data);

        if (result.data && result.data.photos) {
            console.log('=== Photos 객체 상세 분석 ===');
            console.log('Photos 객체:', result.data.photos);
            console.log('Profile 속성:', result.data.photos.profile);
            console.log('Profile 타입:', typeof result.data.photos.profile);
            console.log('Profile null 여부:', result.data.photos.profile === null);
            console.log('Profile undefined 여부:', result.data.photos.profile === undefined);

            // 각 카테고리 확인
            ['profile', 'casual', 'romantic', 'emotional', 'special'].forEach(category => {
                console.log(`${category}:`, result.data.photos[category]);
            });
        }

        console.log('=== 전체 결과 ===');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('테스트 오류:', error);
    }
}

// 페이지 로드 후 실행
window.testPhotoAPI = testPhotoAPI;
console.log('테스트 함수 로드됨. testPhotoAPI() 호출하여 테스트하세요.');