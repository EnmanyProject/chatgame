// 시나리오 생성 테스트 스크립트
const testScenarioGeneration = async () => {
  const API_URL = 'https://chatgame-seven.vercel.app/api/scenario-manager';

  // 테스트 데이터 (완곡한 표현)
  const testData = {
    title: '어색한 다음날',
    description: '회사 회식 후 술에 취해 가까워진 두 사람. 다음날 아침 서로 어떻게 대해야 할지 모르는 어색한 상황에서 시작되는 메신저 대화',
    genre: 'anxiety'
  };

  console.log('📋 테스트 시나리오 정보:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // Step 1: 기승전결 구조 생성
  console.log('🤖 Step 1: 기승전결 구조 생성 시작...\n');

  try {
    const structureResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_story_structure',
        title: testData.title,
        description: testData.description,
        genre: testData.genre
      })
    });

    const structureResult = await structureResponse.json();

    if (!structureResult.success) {
      console.error('❌ 구조 생성 실패:', structureResult.message);
      return;
    }

    console.log('✅ 기승전결 구조 생성 성공!\n');
    console.log('📖 생성된 구조:');
    console.log('─'.repeat(80));
    console.log('기(起):', structureResult.structure.ki.summary);
    console.log('승(承):', structureResult.structure.seung.summary);
    console.log('전(轉):', structureResult.structure.jeon.summary);
    console.log('결(結):', structureResult.structure.gyeol.summary);
    console.log('─'.repeat(80) + '\n');

    // Step 2: 장문 스토리 생성
    console.log('📖 Step 2: 장문 스토리 생성 시작...\n');

    const storyResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_story_from_ki_seung_jeon_gyeol',
        title: testData.title,
        description: testData.description,
        structure: structureResult.structure
      })
    });

    const responseText = await storyResponse.text();
    console.log('📡 API 응답 (raw):', responseText.substring(0, 500));

    let storyResult;
    try {
      storyResult = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ JSON 파싱 실패. 전체 응답:');
      console.error(responseText);
      throw new Error('API가 유효한 JSON을 반환하지 않았습니다');
    }

    if (!storyResult.success) {
      console.error('❌ 스토리 생성 실패:', storyResult.message);
      return;
    }

    console.log('✅ 장문 스토리 생성 성공!\n');
    console.log('📚 생성된 스토리:');
    console.log('═'.repeat(80));
    console.log(storyResult.story);
    console.log('═'.repeat(80) + '\n');

    // 통계
    console.log('📊 생성 결과 통계:');
    console.log('─'.repeat(80));
    console.log('- 스토리 길이:', storyResult.story.length, '자');
    console.log('- 목표 범위: 800-1200자');
    console.log('- 범위 충족:', storyResult.story.length >= 800 && storyResult.story.length <= 1200 ? '✅' : '⚠️');
    console.log('─'.repeat(80) + '\n');

    console.log('✅ 전체 테스트 성공!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    console.error(error.stack);
  }
};

// 실행
testScenarioGeneration();
