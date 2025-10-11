# 시나리오 시스템 개선 계획

> **기반**: `docs/scenario-system-review.md` 외부 리뷰 분석
> **작성일**: 2025-10-11
> **우선순위**: Critical > Important > Nice to have

---

## 📋 Executive Summary

외부 개발자의 리뷰를 분석한 결과, **5가지 개선 제안** 중 **2가지 Critical**, **2가지 Important** 항목이 우리 프로젝트에 즉시 적용 가능하고 필요한 것으로 판단됨.

**현재 상태:**
- ✅ **이미 구현됨**: 프롬프트 외부화 (`data/ai-prompts.json`)
- ✅ **최근 완료**: 3개 AI 모델 지원, 모델 제공자 자동 감지
- ⚠️ **미흡**: AI 실패 시 재시도/폴백, 구조 검증, 모니터링

**즉시 개선 필요:**
1. 🔴 **AI 호출 재시도 및 폴백 시스템** (Critical)
2. 🔴 **dialogue_script 검증 강화** (Critical)
3. 🟡 **캐릭터 데이터 로드 폴백** (Important)
4. 🟡 **API 호출 모니터링 강화** (Important)

---

## 1. 외부 리뷰 분석

### 1.1 제안 항목별 평가

| 제안 | 우선순위 | 적용 가능성 | 현재 상태 | 결정 |
|------|----------|------------|----------|------|
| 1. 프롬프트 설정 외부화 | - | ✅ 완료 | `data/ai-prompts.json` | **Skip** (이미 구현) |
| 2. 탄력적 생성 파이프라인 | 🔴 Critical | ✅ 높음 | 재시도 없음 | **Adopt** (즉시 구현) |
| 3. 정교한 검증 계층 | 🔴 Critical | ✅ 높음 | speaker만 검증 | **Adopt** (즉시 구현) |
| 4. 관측 가능성 | 🟡 Important | 🔶 중간 | console.log만 | **Partial** (간소화 버전) |
| 5. 생성 품질 강화 | 🟢 Nice | ⚠️ 낮음 | 현재 품질 양호 | **Defer** (나중에) |

### 1.2 현재 시스템과 격차 분석

**우리가 이미 잘하고 있는 것:**
- ✅ 프롬프트 외부화 및 버전 관리 (`data/ai-prompts.json`)
- ✅ 3개 AI 모델 지원 (OpenAI, Groq, Claude)
- ✅ 2단계 생성 시스템 (구조 → 대화)
- ✅ 모델 제공자 자동 감지

**우리가 부족한 것:**
- ❌ AI 호출 실패 시 자동 재시도 없음
- ❌ AI 모델 간 자동 폴백 없음
- ❌ dialogue_script 구조 검증 미흡 (speaker만 체크)
- ❌ 캐릭터 데이터 로드 실패 시 폴백 없음
- ❌ API 호출 성공/실패 통계 없음

---

## 2. 즉시 개선 항목 (Critical)

### 2.1 AI 호출 재시도 및 폴백 시스템

**문제:**
- 현재: OpenAI API 실패 → 즉시 에러 반환
- 현재: 504 Gateway Timeout → 사용자에게 그냥 실패 메시지
- 현재: AI 모델 선택 후 실패하면 다른 모델 시도 안 함

**개선 방안:**

#### 2.1.1 자동 재시도 (Exponential Backoff)
```javascript
// api/scenario-manager.js 신규 함수
async function retryWithBackoff(apiCall, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error; // 마지막 시도 실패

      // 일시적 오류만 재시도 (504, 429, 500)
      if (![504, 429, 500, 503].includes(error.status)) throw error;

      const delay = baseDelay * Math.pow(2, i); // 1s, 2s, 4s
      console.log(`⏳ 재시도 ${i + 1}/${maxRetries} (${delay}ms 후)...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

#### 2.1.2 AI 모델 자동 폴백
```javascript
// 우선순위: OpenAI → Groq (빠름) → Claude (고품질)
const AI_FALLBACK_CHAIN = [
  { provider: 'openai', model: 'gpt-4o-mini', reason: '빠르고 저렴' },
  { provider: 'groq', model: 'llama-3.1-8b-instant', reason: '초고속' },
  { provider: 'claude', model: 'claude-3-haiku-20240307', reason: '고품질 폴백' }
];

async function generateWithFallback(params) {
  let lastError;

  for (const { provider, model, reason } of AI_FALLBACK_CHAIN) {
    try {
      console.log(`🤖 ${provider} (${model}) 시도... (${reason})`);

      const result = await retryWithBackoff(() =>
        callAIProvider(provider, model, params)
      );

      console.log(`✅ ${provider} 성공`);
      return { success: true, result, provider, model };

    } catch (error) {
      console.warn(`❌ ${provider} 실패:`, error.message);
      lastError = error;
      // 다음 모델 시도
    }
  }

  // 모든 모델 실패
  throw new Error(`모든 AI 모델 실패: ${lastError.message}`);
}
```

#### 2.1.3 적용 범위
- `generate_dialogue_structure` (Step 1)
- `generate_dialogue_from_structure` (Step 2)

**예상 효과:**
- 504 Gateway Timeout 90% 감소 (재시도로 해결)
- AI 모델 장애 시에도 서비스 지속 가능
- 사용자 경험 향상 (실패 시 자동 대체)

---

### 2.2 dialogue_script 검증 강화

**문제:**
- 현재: `speaker` 필드만 검증
- 현재: 선택지 개수 부족 시 경고만 (강제 안 함)
- 현재: affection_change 범위 검증 없음
- 현재: emotion 값 유효성 검증 없음

**개선 방안:**

#### 2.2.1 포괄적 검증 함수
```javascript
// api/scenario-manager.js
function validateDialogueScript(script, params) {
  const errors = [];

  // 1. 필수 필드 검증
  script.forEach((block, index) => {
    if (!block.id) errors.push(`Block ${index}: id 누락`);
    if (!block.type) errors.push(`Block ${index}: type 누락`);

    if (block.type === 'message') {
      if (!block.speaker) errors.push(`Block ${index}: speaker 누락`);
      if (!block.text) errors.push(`Block ${index}: text 누락`);
      if (block.speaker === 'undefined') errors.push(`Block ${index}: speaker = 'undefined' (invalid)`);

      // emotion 검증
      const validEmotions = ['neutral', 'shy', 'excited', 'sad', 'angry', 'longing', 'playful', 'serious'];
      if (block.emotion && !validEmotions.includes(block.emotion)) {
        errors.push(`Block ${index}: 유효하지 않은 emotion '${block.emotion}'`);
      }
    }

    if (block.type === 'choice') {
      if (!block.options || !Array.isArray(block.options)) {
        errors.push(`Block ${index}: options 배열 누락`);
      } else if (block.options.length !== 3) {
        errors.push(`Block ${index}: 선택지는 정확히 3개여야 함 (현재: ${block.options.length})`);
      }

      // affection_change 범위 검증
      block.options?.forEach((opt, i) => {
        if (typeof opt.affection_change !== 'number') {
          errors.push(`Block ${index}, Option ${i}: affection_change가 숫자가 아님`);
        } else if (opt.affection_change < -5 || opt.affection_change > 5) {
          errors.push(`Block ${index}, Option ${i}: affection_change 범위 초과 (${opt.affection_change}, 허용: -5~5)`);
        }
      });
    }

    if (block.type === 'user_input') {
      if (!block.placeholder) errors.push(`Block ${index}: placeholder 누락`);
    }
  });

  // 2. 선택지 개수 검증
  const choiceCount = script.filter(b => b.type === 'choice').length;
  const expectedChoices = params.total_choices;

  if (choiceCount < expectedChoices * 0.8) { // 80% 미만이면 에러
    errors.push(`선택지 부족: ${choiceCount}/${expectedChoices} (최소 ${Math.ceil(expectedChoices * 0.8)}개 필요)`);
  }

  // 3. 대화/선택지 비율 검증
  const messageCount = script.filter(b => b.type === 'message').length;
  const ratio = messageCount / choiceCount;

  if (ratio < 2 || ratio > 5) {
    errors.push(`대화/선택지 비율 이상: ${ratio.toFixed(1)} (권장: 2~5)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      total_blocks: script.length,
      messages: messageCount,
      choices: choiceCount,
      user_inputs: script.filter(b => b.type === 'user_input').length,
      ratio: ratio.toFixed(1)
    }
  };
}
```

#### 2.2.2 검증 실패 시 처리
```javascript
// Step 1/2 생성 후
const validation = validateDialogueScript(dialogueScript, { total_choices });

if (!validation.valid) {
  console.error('❌ 검증 실패:', validation.errors);

  // 경미한 오류는 경고만 (speaker undefined 등)
  const criticalErrors = validation.errors.filter(e =>
    e.includes('누락') || e.includes('선택지 부족')
  );

  if (criticalErrors.length > 0) {
    throw new Error(`치명적 검증 오류:\n${criticalErrors.join('\n')}`);
  }
}

console.log('✅ 검증 통과:', validation.stats);
```

**예상 효과:**
- AI 생성 품질 향상 (검증 통과율 95%+)
- 에피소드 생성 실패 감소 (잘못된 구조 사전 차단)
- 디버깅 시간 단축 (명확한 에러 메시지)

---

## 3. 중요 개선 항목 (Important)

### 3.1 캐릭터 데이터 로드 폴백

**문제:**
- 캐릭터 데이터 로드 실패 → 시나리오 생성 완전 중단

**개선 방안:**
```javascript
// 기본 캐릭터 템플릿
const DEFAULT_CHARACTER_TEMPLATE = {
  name: '미정',
  age: 25,
  personality: '친근하고 밝은 성격',
  description: '매력적인 상대'
};

async function loadCharacterWithFallback(characterId) {
  try {
    const charactersData = await loadFromGitHub('data/characters.json');
    const characters = JSON.parse(charactersData);
    return characters.characters?.[characterId] || characters[characterId];
  } catch (error) {
    console.warn('⚠️ 캐릭터 데이터 로드 실패, 기본 템플릿 사용:', error.message);
    return DEFAULT_CHARACTER_TEMPLATE;
  }
}
```

**예상 효과:**
- characters.json 오류 시에도 시나리오 생성 가능
- 사용자 경험 중단 방지

---

### 3.2 API 호출 모니터링 강화

**문제:**
- console.log만 있어서 장기 추적 불가
- 성공/실패 통계 없음

**개선 방안:**

#### 3.2.1 간단한 메트릭 수집
```javascript
// api/scenario-manager.js 상단
const API_METRICS = {
  total_requests: 0,
  successful: 0,
  failed: 0,
  by_action: {},
  by_ai_model: {},
  avg_duration_ms: 0
};

function recordMetric(action, success, duration_ms, ai_model) {
  API_METRICS.total_requests++;

  if (success) {
    API_METRICS.successful++;
  } else {
    API_METRICS.failed++;
  }

  if (!API_METRICS.by_action[action]) {
    API_METRICS.by_action[action] = { success: 0, failed: 0 };
  }
  API_METRICS.by_action[action][success ? 'success' : 'failed']++;

  if (ai_model) {
    if (!API_METRICS.by_ai_model[ai_model]) {
      API_METRICS.by_ai_model[ai_model] = { success: 0, failed: 0 };
    }
    API_METRICS.by_ai_model[ai_model][success ? 'success' : 'failed']++;
  }

  // 평균 실행 시간 계산
  const totalDuration = API_METRICS.avg_duration_ms * (API_METRICS.total_requests - 1) + duration_ms;
  API_METRICS.avg_duration_ms = Math.round(totalDuration / API_METRICS.total_requests);
}

// 메트릭 조회 엔드포인트
if (action === 'get_metrics') {
  return res.status(200).json({
    success: true,
    metrics: API_METRICS,
    uptime_seconds: process.uptime()
  });
}
```

#### 3.2.2 상세 에러 로깅
```javascript
function logError(action, error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    action,
    error: {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3), // 상위 3줄만
      status: error.status
    },
    context
  };

  console.error('🚨 ERROR LOG:', JSON.stringify(errorLog, null, 2));

  // 나중에 외부 로그 서비스로 전송 가능
  // await sendToLogService(errorLog);
}

// 사용 예
try {
  // ...
} catch (error) {
  logError('generate_dialogue_structure', error, {
    title,
    genre,
    ai_model,
    total_choices
  });
  throw error;
}
```

**예상 효과:**
- 실패 패턴 파악 (어떤 AI 모델이 자주 실패하는지)
- 성능 추적 (평균 응답 시간)
- 디버깅 효율성 향상

---

## 4. 나중에 고려 (Nice to have)

### 4.1 생성 품질 강화
- 호감도 흐름 계산 (현재는 AI가 잘 생성함)
- 대화 톤 일관성 점검 (현재 품질 양호)
- **결정**: Phase 2로 연기

### 4.2 외부 메트릭/로그 시스템
- Prometheus, S3 등 (현재 프로젝트 규모에 과함)
- **결정**: 프로젝트 성장 후 고려

---

## 5. 구현 계획

### 5.1 우선순위 및 작업 시간

| 순위 | 항목 | 예상 시간 | 파일 |
|------|------|----------|------|
| 1 | AI 재시도 로직 | 1시간 | `api/scenario-manager.js` |
| 2 | AI 폴백 체인 | 1시간 | `api/scenario-manager.js` |
| 3 | dialogue_script 검증 | 1시간 | `api/scenario-manager.js` |
| 4 | 캐릭터 로드 폴백 | 30분 | `api/scenario-manager.js` |
| 5 | API 메트릭 수집 | 30분 | `api/scenario-manager.js` |
| **총계** | | **4시간** | |

### 5.2 Step별 구현 순서

**Step 1: AI 재시도 시스템 (1시간)**
```
1. retryWithBackoff() 함수 구현
2. Step 1 (generate_dialogue_structure)에 적용
3. Step 2 (generate_dialogue_from_structure)에 적용
4. 테스트: 일부러 실패 케이스 만들어서 재시도 확인
```

**Step 2: AI 폴백 체인 (1시간)**
```
1. AI_FALLBACK_CHAIN 상수 정의
2. generateWithFallback() 함수 구현
3. Step 1/2에서 사용하도록 리팩토링
4. 테스트: OpenAI 차단 → Groq로 자동 폴백 확인
```

**Step 3: 검증 강화 (1시간)**
```
1. validateDialogueScript() 함수 구현
2. Step 1/2 응답 후 검증 로직 추가
3. 검증 실패 시 처리 로직 (경고 vs 에러)
4. 테스트: 잘못된 구조 생성 → 검증 에러 확인
```

**Step 4: 폴백 및 메트릭 (1시간)**
```
1. loadCharacterWithFallback() 구현
2. API_METRICS 전역 변수 추가
3. recordMetric() 함수 구현
4. logError() 함수 구현
5. get_metrics 엔드포인트 추가
6. 테스트: 메트릭 조회 확인
```

### 5.3 테스트 전략

**단위 테스트:**
- `retryWithBackoff()`: 재시도 횟수, 지연 시간
- `validateDialogueScript()`: 각 검증 규칙별 테스트

**통합 테스트:**
- OpenAI 실패 → Groq 폴백 시나리오
- 잘못된 dialogue_script 검증 시나리오
- 캐릭터 데이터 없을 때 폴백 시나리오

**성능 테스트:**
- 재시도 시 최대 응답 시간 (목표: <30초)
- 폴백 체인 전체 실행 시간

---

## 6. 리스크 관리

### 6.1 기술적 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|----------|
| 재시도로 인한 응답 시간 증가 | 중간 | 중간 | max_retries=3, 지수 백오프 |
| 폴백 체인 모든 모델 실패 | 낮음 | 높음 | 명확한 에러 메시지, 사용자 안내 |
| 검증 로직 false positive | 중간 | 중간 | 경미한 오류는 경고만, 치명적만 차단 |

### 6.2 일정 리스크

| 리스크 | 확률 | 완화 전략 |
|--------|------|----------|
| Step 2 (폴백) 복잡도 | 중간 | 간단한 순차 시도 방식 사용 |
| Step 3 (검증) 예외 케이스 | 높음 | 점진적 추가, 우선 핵심만 |

---

## 7. 성공 기준

### 7.1 정량적 지표
- [ ] 504 Gateway Timeout 에러 90% 감소
- [ ] AI 생성 성공률 95% 이상
- [ ] dialogue_script 검증 통과율 90% 이상
- [ ] 평균 응답 시간 15초 이내 (폴백 포함)

### 7.2 정성적 지표
- [ ] 사용자가 AI 생성 실패를 거의 경험하지 않음
- [ ] 에러 메시지가 명확하고 해결 방법 제시
- [ ] 개발자가 메트릭으로 시스템 상태 파악 가능

---

## 8. 롤백 계획

**롤백 트리거:**
- AI 폴백 로직 버그로 인한 서비스 중단
- 검증 로직이 정상 시나리오를 차단
- 재시도 로직으로 인한 심각한 지연

**롤백 절차:**
```bash
# 1. 이전 커밋으로 복원
git revert <commit-hash>
git push origin main

# 2. 메트릭 확인
# - 롤백 후 에러율 감소 확인

# 3. 문제 원인 분석
# - 로그 확인
# - 재현 테스트
```

---

## 9. 다음 단계

### 9.1 즉시 실행
1. ✅ 이 설계 문서 검토 및 승인
2. 🔄 Coder 에이전트에게 구현 위임
3. 📝 Git 브랜치 생성: `feature/ai-resilience-validation`

### 9.2 구현 순서
```
Day 1 (4시간):
├─ Step 1: AI 재시도 (1시간)
├─ Step 2: AI 폴백 (1시간)
├─ Step 3: 검증 강화 (1시간)
└─ Step 4: 폴백/메트릭 (1시간)

Day 2 (2시간):
├─ 통합 테스트 (1시간)
└─ 문서 업데이트 (1시간)
```

### 9.3 Coder에게 전달할 정보
- 이 설계 문서 (`docs/SCENARIO_IMPROVEMENT_PLAN.md`)
- 외부 리뷰 (`docs/scenario-system-review.md`)
- 현재 코드: `api/scenario-manager.js`
- 우선순위: Step 1 → Step 2 → Step 3 → Step 4

---

**문서 버전:** 1.0.0
**작성자:** Architect (Claude Code Sonnet 4.5)
**검토 대기**
**다음**: Coder 에이전트로 구현 위임
