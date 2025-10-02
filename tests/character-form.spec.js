const { test, expect } = require('@playwright/test');

test('캐릭터 생성 폼 버튼 이벤트 테스트', async ({ page }) => {
  console.log('🎭 캐릭터 생성 폼 테스트 시작...');

  // 콘솔 로그 캡처
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    console.log(`브라우저 콘솔: ${msg.type()}: ${msg.text()}`);
  });

  // 1. 페이지 접속
  console.log('📍 사이트 접속 중...');
  await page.goto('https://chatgame-seven.vercel.app/scenario-admin.html');

  // 페이지 로드 대기
  await page.waitForLoadState('networkidle');

  // 2. 캐릭터 탭 활성화
  console.log('📂 캐릭터 탭 클릭...');
  await page.waitForSelector('text=캐릭터 관리', { timeout: 10000 });
  await page.click('text=캐릭터 관리');

  // 탭 전환 대기
  await page.waitForTimeout(1000);

  // 3. "AI 캐릭터 생성기" 버튼 찾기 및 클릭
  console.log('🔍 AI 캐릭터 생성기 버튼 찾는 중...');
  await page.waitForSelector('text=🎭✨ AI 캐릭터 생성기', { timeout: 10000 });
  await page.click('text=🎭✨ AI 캐릭터 생성기');

  // 모달 로드 대기
  console.log('⏳ 캐릭터 생성 모달 로드 대기...');
  await page.waitForSelector('#characterModal', { timeout: 5000 });

  // 3. 임의 선택 상태 확인
  console.log('🎲 임의 선택 상태 확인 중...');

  // 성격특성 버튼들 확인
  const selectedTraits = await page.$$('.trait-btn.selected');
  console.log(`✅ 선택된 성격특성 버튼: ${selectedTraits.length}개`);

  // 취미 버튼들 확인
  const selectedHobbies = await page.$$('.hobby-btn.selected');
  console.log(`✅ 선택된 취미 버튼: ${selectedHobbies.length}개`);

  // 자신있는 부위 버튼들 확인
  const selectedFeatures = await page.$$('.confident-part-btn.selected');
  console.log(`✅ 선택된 자신있는 부위 버튼: ${selectedFeatures.length}개`);

  // 섹시포즈 버튼들 확인
  const selectedPoses = await page.$$('.seductive-pose-btn.selected');
  console.log(`✅ 선택된 섹시포즈 버튼: ${selectedPoses.length}개`);

  // 흥분시 반응 버튼들 확인
  const selectedLanguages = await page.$$('.body-language-btn.selected');
  console.log(`✅ 선택된 흥분시 반응 버튼: ${selectedLanguages.length}개`);

  // 4. 성격특성 버튼 클릭 테스트
  console.log('🎯 성격특성 버튼 클릭 테스트...');
  const traitButtons = await page.$$('.trait-btn');
  if (traitButtons.length > 0) {
    // 첫 번째 버튼이 선택되어 있다면 해제, 아니면 선택
    const firstTraitButton = traitButtons[0];
    const isSelected = await firstTraitButton.evaluate(btn => btn.classList.contains('selected'));

    console.log(`첫 번째 성격특성 버튼 현재 상태: ${isSelected ? '선택됨' : '선택안됨'}`);

    // 클릭 전 hidden input 값 확인
    const hiddenValueBefore = await page.evaluate(() => {
      const input = document.getElementById('charPersonalityTraits');
      return input ? input.value : 'null';
    });
    console.log(`클릭 전 hidden input 값: ${hiddenValueBefore}`);

    // 버튼 클릭
    await firstTraitButton.click();

    // 잠시 대기 (이벤트 처리 시간)
    await page.waitForTimeout(100);

    // 클릭 후 상태 확인
    const isSelectedAfter = await firstTraitButton.evaluate(btn => btn.classList.contains('selected'));
    console.log(`첫 번째 성격특성 버튼 클릭 후 상태: ${isSelectedAfter ? '선택됨' : '선택안됨'}`);

    // 클릭 후 hidden input 값 확인
    const hiddenValueAfter = await page.evaluate(() => {
      const input = document.getElementById('charPersonalityTraits');
      return input ? input.value : 'null';
    });
    console.log(`클릭 후 hidden input 값: ${hiddenValueAfter}`);
  }

  // 5. 취미 버튼 클릭 테스트
  console.log('🎨 취미 버튼 클릭 테스트...');
  const hobbyButtons = await page.$$('.hobby-btn');
  if (hobbyButtons.length > 0) {
    const firstHobbyButton = hobbyButtons[0];
    const isSelected = await firstHobbyButton.evaluate(btn => btn.classList.contains('selected'));

    console.log(`첫 번째 취미 버튼 현재 상태: ${isSelected ? '선택됨' : '선택안됨'}`);

    // 클릭 전후 hidden input 값 비교
    const hiddenValueBefore = await page.evaluate(() => {
      const input = document.getElementById('charHobbies');
      return input ? input.value : 'null';
    });

    await firstHobbyButton.click();
    await page.waitForTimeout(100);

    const hiddenValueAfter = await page.evaluate(() => {
      const input = document.getElementById('charHobbies');
      return input ? input.value : 'null';
    });

    console.log(`취미 - 클릭 전: ${hiddenValueBefore}`);
    console.log(`취미 - 클릭 후: ${hiddenValueAfter}`);
  }

  // 6. 자신있는 부위 버튼 클릭 테스트
  console.log('✨ 자신있는 부위 버튼 클릭 테스트...');
  const featureButtons = await page.$$('.confident-part-btn');
  if (featureButtons.length > 0) {
    const firstFeatureButton = featureButtons[0];

    const hiddenValueBefore = await page.evaluate(() => {
      const input = document.getElementById('charFeatureElements');
      return input ? input.value : 'null';
    });

    await firstFeatureButton.click();
    await page.waitForTimeout(100);

    const hiddenValueAfter = await page.evaluate(() => {
      const input = document.getElementById('charFeatureElements');
      return input ? input.value : 'null';
    });

    console.log(`자신있는 부위 - 클릭 전: ${hiddenValueBefore}`);
    console.log(`자신있는 부위 - 클릭 후: ${hiddenValueAfter}`);
  }

  // 7. 최대 선택 개수 제한 테스트
  console.log('🚫 최대 선택 개수 제한 테스트...');
  const allTraitButtons = await page.$$('.trait-btn');

  // 모든 성격특성 버튼을 선택해보기 (최대 3개까지만 가능해야 함)
  for (let i = 0; i < Math.min(5, allTraitButtons.length); i++) {
    await allTraitButtons[i].click();
    await page.waitForTimeout(50);
  }

  const finalSelectedTraits = await page.$$('.trait-btn.selected');
  console.log(`최대 제한 테스트 후 선택된 성격특성: ${finalSelectedTraits.length}개 (최대 3개여야 함)`);

  // 8. 콘솔 로그에서 hidden input 업데이트 메시지 확인
  console.log('📝 콘솔 로그 분석...');
  const hiddenInputLogs = consoleMessages.filter(msg =>
    msg.includes('hidden input 업데이트') ||
    msg.includes('동기화')
  );

  console.log(`Hidden input 관련 로그 ${hiddenInputLogs.length}개 발견:`);
  hiddenInputLogs.forEach(log => console.log(`  ${log}`));

  // 9. 모든 hidden input 최종 값 확인
  console.log('📋 모든 hidden input 최종 값 확인...');
  const allHiddenValues = await page.evaluate(() => {
    return {
      personalityTraits: document.getElementById('charPersonalityTraits')?.value || 'null',
      hobbies: document.getElementById('charHobbies')?.value || 'null',
      featureElements: document.getElementById('charFeatureElements')?.value || 'null',
      sensualHabits: document.getElementById('charSensualHabits')?.value || 'null',
      bodyLanguage: document.getElementById('charBodyLanguage')?.value || 'null'
    };
  });

  console.log('🔍 최종 Hidden Input 값들:');
  Object.entries(allHiddenValues).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  console.log('✅ 캐릭터 생성 폼 테스트 완료!');
});