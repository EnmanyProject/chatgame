// Korean Translation Accuracy Test
// Tests if the new Korean translation system improves field reflection accuracy

const testCharacterData = {
  "basic_info": {
    "name": "소운",
    "age": 22,
    "mbti": "INTP",
    "occupation": "student",
    "gender": "female"
  },
  "appeal_profile": {
    "seduction_style": "intellectual_cool",
    "charm_points": ["infectious_smile", "witty_banter"],
    "emotional_intelligence": "moderate",
    "confidence_level": "moderate",
    "mystery_factor": "high",
    "sexual_curiosity": "moderate",
    "sexual_comfort": "moderate",
    "hobbies": ["reading", "coding"]
  },
  "physical_allure": {
    "appearance": {
      "hair": "shoulder_wave",
      "eyes": "mysterious_deep",
      "body": "model_like",
      "bust": "D",
      "waist_hip": "24-34",
      "style": "casual_chic"
    },
    "feature_elements": ["confident_touch", "playful_wink"],
    "sensual_habits": ["hair_flip", "lip_bite"],
    "body_language": ["relaxed_posture", "eye_contact"]
  }
};

async function testKoreanAccuracy() {
  console.log('🔍 Korean Translation Accuracy Test Starting...');
  console.log('====================================================');

  try {
    // Test prompt generation
    const response = await fetch('https://chatgame-seven.vercel.app/api/character-ai-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_character_prompt',
        character_data: testCharacterData,
        model: 'gpt-4',
        style: 'comprehensive',
        length: 'medium'
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API call failed');
    }

    console.log('📋 Generated Prompt:');
    console.log('==================');
    console.log(result.prompt);
    console.log('\n');

    // Check for Korean translations
    const prompt = result.prompt.toLowerCase();
    const koreanTranslations = [
      '감염력 있는 미소',    // infectious_smile
      '재치있는 농담',      // witty_banter
      '어깨까지 오는 웨이브', // shoulder_wave
      '신비롭고 깊은',      // mysterious_deep
      '모델 같은',          // model_like
      '자신감 있는',        // confident_touch
      '여성',               // female
      '학생',               // student (if translated)
      '독서',               // reading
      '코딩'                // coding (if kept or translated)
    ];

    console.log('🔍 Checking Korean Translation Accuracy:');
    console.log('========================================');

    let foundCount = 0;
    koreanTranslations.forEach(translation => {
      const found = prompt.includes(translation.toLowerCase());
      console.log(`${found ? '✅' : '❌'} "${translation}": ${found ? '반영됨' : '반영안됨'}`);
      if (found) foundCount++;
    });

    const accuracy = Math.round((foundCount / koreanTranslations.length) * 100);
    console.log('\n📊 Results:');
    console.log('===========');
    console.log(`Accuracy: ${accuracy}% (${foundCount}/${koreanTranslations.length} translations found)`);
    console.log(`Model used: ${result.model_used}`);
    console.log(`Fallback: ${result.fallback ? 'Yes' : 'No'}`);

    if (accuracy >= 80) {
      console.log('🎉 SUCCESS: Korean translation system is working well!');
    } else if (accuracy >= 50) {
      console.log('⚠️  PARTIAL: Some translations working, needs improvement');
    } else {
      console.log('❌ FAILED: Korean translations not being applied properly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testKoreanAccuracy();