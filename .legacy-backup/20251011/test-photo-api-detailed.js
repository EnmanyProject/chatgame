// 상세한 사진 API 테스트 스크립트
async function testPhotoAPIDetailed() {
    const characterId = '소운_esfp_1759284829045';

    console.log('=== 상세한 사진 API 디버깅 테스트 ===');
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
            console.log('Profile 빈 객체 여부:', result.data.photos.profile && Object.keys(result.data.photos.profile).length === 0);

            // 각 카테고리 확인
            ['profile', 'casual', 'romantic', 'emotional', 'special'].forEach(category => {
                const value = result.data.photos[category];
                const type = value === null ? 'null' :
                            value === undefined ? 'undefined' :
                            Array.isArray(value) ? `array(${value.length})` :
                            typeof value === 'object' ? `object with keys: ${Object.keys(value).join(', ')}` :
                            typeof value;
                console.log(`  ${category}: ${type}`);
                if (category === 'profile' && value && typeof value === 'object') {
                    console.log(`    Profile object details:`, value);
                }
            });
        }

        // 디버그 정보 출력
        if (result.debug_info) {
            console.log('=== GitHub API 디버그 정보 ===');
            console.log('GitHub 응답 상태:', result.debug_info.github_response_status);
            console.log('총 찾은 파일 수:', result.debug_info.total_files_found);
            console.log('필터된 파일 수:', result.debug_info.filtered_files_count);
            console.log('검색된 캐릭터 ID:', result.debug_info.search_character_id);

            if (result.debug_info.files_searched_in_github) {
                console.log('=== GitHub에서 찾은 파일들 ===');
                result.debug_info.files_searched_in_github.forEach(filename => {
                    console.log(`  - ${filename}`);
                });
            }

            if (result.debug_info.file_processing_summary) {
                console.log('=== 파일 처리 결과 ===');
                result.debug_info.file_processing_summary.forEach(summary => {
                    if (summary.status === 'success') {
                        console.log(`  ✅ ${summary.filename}: 카테고리=${summary.category}, 데이터있음=${summary.has_photo_data}, 데이터크기=${summary.photo_data_length}`);
                    } else {
                        console.log(`  ❌ ${summary.filename}: ${summary.error}`);
                    }
                });
            }
        }

        console.log('=== 전체 결과 ===');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('테스트 오류:', error);
    }
}

// 페이지 로드 후 실행
window.testPhotoAPIDetailed = testPhotoAPIDetailed;
console.log('상세 테스트 함수 로드됨. testPhotoAPIDetailed() 호출하여 테스트하세요.');