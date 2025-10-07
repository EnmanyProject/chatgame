# 시나리오 생성 테스트 리포트 (v1.10.3)

**테스트 일시**: 2025-10-07
**테스트 대상**: 기승전결 → 장문 스토리 자동 생성 시스템
**버전**: v1.10.3

---

## 📋 테스트 시나리오

**제목**: "어색한 다음날"
**설명**: "회사 회식 후 술에 취해 가까워진 두 사람. 다음날 아침 서로 어떻게 대해야 할지 모르는 어색한 상황에서 시작되는 메신저 대화"
**장르**: anxiety (불안)

---

## ✅ Step 1: 기승전결 구조 생성 - 성공

### 결과
**상태**: ✅ **성공**

**생성된 구조**:
- **기(起)**: 어젯밤 일이 머리 속을 맴돌며 서로에게 메시지를 보내기 시작한다.
- **승(承)**: 서로가 느꼈던 감정과 생각에 대해 조금씩 이야기하기 시작한다.
- **전(轉)**: 앞으로의 관계에 대해 어떤 결정이 필요한지 고민하며 갈등을 겪는다.
- **결(結)**: 서로의 감정을 정리하고, 다음 만남에 대한 기대를 나눈다.

### 평가
- ✅ 감정 흐름 패턴 적용 (anxiety: 거리감 → 불신 → 대화 → 안도)
- ✅ "이미 벌어진 일" 컨셉 적용 (사건 후 대화)
- ✅ 기승전결 구조 명확
- ✅ 메신저 대화에 적합한 시나리오

---

## ❌ Step 2: 장문 스토리 생성 - 실패 (타임아웃)

### 결과
**상태**: ❌ **실패**

**에러 메시지**:
```
FUNCTION_INVOCATION_TIMEOUT
An error occurred with your deployment
```

### 문제 분석

#### 🔍 근본 원인
1. **Vercel 서버리스 함수 타임아웃**: 기본 10초 제한
2. **OpenAI API 호출 지연**:
   - gpt-4o-mini 모델 응답 시간: ~5-15초
   - 장문 스토리 생성(800-1200자): max_tokens 1500
   - 네트워크 지연 + API 처리 시간 = 10초 초과

#### 📊 타임아웃 발생 시점
- 1단계 구조 생성: ✅ 성공 (~3-5초)
- 2단계 스토리 생성: ❌ 타임아웃 (~10초 이상)

---

## 🐛 발견된 버그

### Bug #1: beats 배열 참조 오류 ✅ 수정 완료
**문제**: `generateStoryFromKiSeungJeonGyeol` 함수가 존재하지 않는 `structure.ki.beats` 배열을 참조
**원인**: `generateKiSeungJeonGyeolStructure`는 beats 배열 없이 title/summary/goal만 반환
**해결**: beats 배열 옵셔널 처리 (v1.10.3)

```javascript
// BEFORE
const kiDescription = `기(起) - ${structure.ki.summary}
  목표: ${structure.ki.goal}
  대화 흐름: ${structure.ki.beats.map(b => b.name).join(' → ')}`;

// AFTER (v1.10.3)
const kiDescription = structure.ki.beats && structure.ki.beats.length > 0
  ? `기(起) - ${structure.ki.summary}\n  목표: ${structure.ki.goal}\n  대화 흐름: ${structure.ki.beats.map(b => b.name).join(' → ')}`
  : `기(起) - ${structure.ki.title || '도입'}\n  요약: ${structure.ki.summary}\n  목표: ${structure.ki.goal}`;
```

### Bug #2: Vercel 서버리스 함수 타임아웃 ⚠️ 해결 필요
**문제**: OpenAI API 호출이 Vercel 10초 제한 초과
**영향**: 장문 스토리 생성 불가
**우선순위**: 🔴 높음 (핵심 기능 차단)

---

## 💡 해결 방안

### Option 1: Vercel 함수 타임아웃 확장 (권장)
```javascript
// vercel.json 추가
{
  "functions": {
    "api/scenario-manager.js": {
      "maxDuration": 30
    }
  }
}
```
**장점**: 간단한 설정 변경만으로 해결
**단점**: Pro 플랜 이상 필요 (Hobby는 10초 고정)

### Option 2: OpenAI API 파라미터 최적화
```javascript
{
  model: 'gpt-4o-mini',
  messages: [...],
  temperature: 0.9,
  max_tokens: 1000  // 1500 → 1000 감소
}
```
**장점**: 무료 플랜에서도 작동
**단점**: 스토리 길이 제한 (800-1200자 → 600-900자)

### Option 3: 비동기 처리 + Polling
1. 클라이언트가 생성 요청
2. 서버가 즉시 job_id 반환
3. 백그라운드에서 스토리 생성
4. 클라이언트가 주기적으로 완료 여부 확인

**장점**: 타임아웃 완전 회피
**단점**: 복잡한 구현, 사용자 대기 시간 증가

### Option 4: 다른 AI 모델 사용
- **groq/llama-3.1-8b-instant**: 초고속 응답 (~1-2초)
- **claude-3-haiku**: 빠르고 저렴 (~3-5초)

**장점**: 타임아웃 회피, 비용 절감
**단점**: 품질 저하 가능성

---

## 📊 권장 해결 순서

### 🥇 1순위: Option 2 (OpenAI 최적화) - 즉시 적용 가능
```javascript
// max_tokens 감소
max_tokens: 1000  // 응답 시간 ~30% 감축
```

### 🥈 2순위: Option 1 (Vercel 타임아웃 확장) - 장기 해결
- Vercel Pro 플랜 고려 (월 $20)
- 또는 Hobby 플랜 유지 + Option 2 적용

### 🥉 3순위: Option 4 (다른 AI 모델) - 품질 테스트 필요
- groq 테스트 (기존 코드에 이미 groq 통합됨)

---

## 🎯 테스트 결론

### 작동하는 것 ✅
1. 기승전결 구조 생성 (OpenAI API)
2. 감정 흐름 패턴 적용
3. "이미 벌어진 일" 컨셉 반영
4. beats 배열 옵셔널 처리 (v1.10.3 수정)

### 작동하지 않는 것 ❌
1. 장문 스토리 생성 (Vercel 타임아웃)

### 다음 작업 🔧
1. **즉시**: max_tokens 1500 → 1000으로 감소 (Option 2)
2. **테스트**: 타임아웃 해결 확인
3. **검토**: Vercel Pro 플랜 필요성 검토
4. **대안**: groq/llama 모델 테스트

---

## 📸 테스트 스크린샷

### Step 1: 구조 생성 성공
```
✅ 기승전결 구조 생성 성공!

📖 생성된 구조:
────────────────────────────────────────────────────────────────────────────────
기(起): 어젯밤 일이 머리 속을 맴돌며 서로에게 메시지를 보내기 시작한다.
승(承): 서로가 느꼈던 감정과 생각에 대해 조금씩 이야기하기 시작한다.
전(轉): 앞으로의 관계에 대해 어떤 결정이 필요한지 고민하며 갈등을 겪는다.
결(結): 서로의 감정을 정리하고, 다음 만남에 대한 기대를 나눈다.
────────────────────────────────────────────────────────────────────────────────
```

### Step 2: 스토리 생성 타임아웃
```
📖 Step 2: 장문 스토리 생성 시작...

📡 API 응답 (raw): An error occurred with your deployment

FUNCTION_INVOCATION_TIMEOUT
```

---

**작성자**: Claude Code
**테스트 파일**: `test_scenario_generation.js`
**Git 커밋**: v1.10.3 (`7507f6b`)
