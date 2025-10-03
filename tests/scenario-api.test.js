/**
 * Scenario API Test Suite
 * @version 1.0.0
 * @description Tests for scenario API endpoints
 */

// Mock data
const mockScenario = {
  metadata: {
    title: "Test Scenario",
    description: "A test scenario for API testing",
    genre: "sweet_romance",
    sexy_level: 5,
    estimated_playtime: 10,
    tags: ["test", "romance"]
  },
  structure: {
    acts: [
      {
        act_number: 1,
        act_title: "Introduction",
        act_description: "The beginning",
        beats: [
          {
            beat_number: 1,
            beat_type: "introduction",
            template: {
              npc_dialogue_template: "안녕, ${user_name}! 오늘 기분이 어때?",
              narration_template: "${char_name}가 밝게 웃으며 다가온다.",
              choice_templates: [
                {
                  text_template: "좋아! 너를 만나서 더 좋아졌어",
                  affection_range: "medium",
                  tone: "playful"
                },
                {
                  text_template: "그냥 그래. 너는?",
                  affection_range: "neutral",
                  tone: "casual"
                }
              ],
              emotion_hint: "밝고 활기찬"
            }
          }
        ]
      }
    ]
  },
  compatibility: {
    mbti_compatibility: ["INFP", "ENFP", "ISFP"],
    character_requirements: {
      min_affection: 0,
      required_traits: []
    }
  }
};

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

/**
 * Test helper function
 */
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n🧪 Running: ${name}`);

  try {
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.error(error);
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Test: Create Scenario
 */
async function testCreateScenario() {
  const response = await fetch('/api/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockScenario)
  });

  const result = await response.json();

  assert(response.status === 201, 'Should return 201 status');
  assert(result.success === true, 'Should be successful');
  assert(result.data.id, 'Should have scenario ID');
  assert(result.data.metadata.title === mockScenario.metadata.title, 'Should have correct title');

  // Store ID for other tests
  window.testScenarioId = result.data.id;
}

/**
 * Test: List Scenarios
 */
async function testListScenarios() {
  const response = await fetch('/api/scenarios');
  const result = await response.json();

  assert(response.status === 200, 'Should return 200 status');
  assert(result.success === true, 'Should be successful');
  assert(Array.isArray(result.data), 'Should return array');
  assert(result.data.length > 0, 'Should have at least one scenario');
}

/**
 * Test: Get Scenario by ID
 */
async function testGetScenario() {
  const scenarioId = window.testScenarioId;
  const response = await fetch(`/api/scenarios?id=${scenarioId}`);
  const result = await response.json();

  assert(response.status === 200, 'Should return 200 status');
  assert(result.success === true, 'Should be successful');
  assert(result.data.id === scenarioId, 'Should return correct scenario');
  assert(result.data.metadata.title === mockScenario.metadata.title, 'Should have correct title');
}

/**
 * Test: Update Scenario
 */
async function testUpdateScenario() {
  const scenarioId = window.testScenarioId;
  const updatedData = {
    ...mockScenario,
    metadata: {
      ...mockScenario.metadata,
      title: "Updated Test Scenario"
    }
  };

  const response = await fetch(`/api/scenarios?id=${scenarioId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });

  const result = await response.json();

  assert(response.status === 200, 'Should return 200 status');
  assert(result.success === true, 'Should be successful');
  assert(result.data.metadata.title === "Updated Test Scenario", 'Should have updated title');
  assert(result.data.version === 2, 'Should increment version');
}

/**
 * Test: Add Act
 */
async function testAddAct() {
  const scenarioId = window.testScenarioId;
  const newAct = {
    act_title: "New Act",
    act_description: "A new act added via API",
    beats: []
  };

  const response = await fetch(`/api/scenarios-acts?scenarioId=${scenarioId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAct)
  });

  const result = await response.json();

  assert(response.status === 201, 'Should return 201 status');
  assert(result.success === true, 'Should be successful');
  assert(result.data.act_number === 2, 'Should be act number 2');
  assert(result.data.act_title === "New Act", 'Should have correct title');
}

/**
 * Test: Add Beat
 */
async function testAddBeat() {
  const scenarioId = window.testScenarioId;
  const actIndex = 0;
  const newBeat = {
    beat_type: "flirtation",
    template: {
      npc_dialogue_template: "테스트 대화",
      narration_template: "테스트 상황 설명",
      choice_templates: [
        {
          text_template: "테스트 선택지",
          affection_range: "low",
          tone: "caring"
        }
      ],
      emotion_hint: "테스트 감정"
    }
  };

  const response = await fetch(`/api/scenarios-beats?scenarioId=${scenarioId}&actIndex=${actIndex}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newBeat)
  });

  const result = await response.json();

  assert(response.status === 201, 'Should return 201 status');
  assert(result.success === true, 'Should be successful');
  assert(result.data.beat_number === 2, 'Should be beat number 2');
  assert(result.data.beat_type === "flirtation", 'Should have correct beat type');
}

/**
 * Test: Validate Scenario
 */
async function testValidateScenario() {
  const response = await fetch('/api/scenarios-validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'scenario',
      data: mockScenario
    })
  });

  const result = await response.json();

  assert(response.status === 200, 'Should return 200 status');
  assert(result.success === true, 'Should be successful');
  assert(result.validation.valid === true, 'Should validate successfully');
}

/**
 * Test: Delete Scenario
 */
async function testDeleteScenario() {
  const scenarioId = window.testScenarioId;
  const response = await fetch(`/api/scenarios?id=${scenarioId}`, {
    method: 'DELETE'
  });

  const result = await response.json();

  assert(response.status === 200, 'Should return 200 status');
  assert(result.success === true, 'Should be successful');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Scenario API Tests...\n');

  await runTest('Create Scenario', testCreateScenario);
  await runTest('List Scenarios', testListScenarios);
  await runTest('Get Scenario by ID', testGetScenario);
  await runTest('Update Scenario', testUpdateScenario);
  await runTest('Add Act', testAddAct);
  await runTest('Add Beat', testAddBeat);
  await runTest('Validate Scenario', testValidateScenario);
  await runTest('Delete Scenario', testDeleteScenario);

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`Total: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);

  if (testResults.failed > 0) {
    console.log('\nFailed tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
  }

  return testResults;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testResults };
}

// Browser export
if (typeof window !== 'undefined') {
  window.ScenarioAPITests = { runAllTests, testResults };
}

// Auto-run if in browser and explicitly called
if (typeof window !== 'undefined' && window.location.search.includes('autorun=true')) {
  runAllTests();
}
