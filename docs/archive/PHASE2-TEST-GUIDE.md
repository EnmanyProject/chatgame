# 🎮 Phase 2 실제 테스트 가이드

> **목적**: Phase 2 시스템 (톤 변화, 사진 전송, 먼저 연락)을 실제로 체험하는 방법

---

## 🚀 빠른 시작 (5분 테스트)

### 1단계: 통합 테스트 페이지
```
파일 열기: test-phase2-integration.html
브라우저: Chrome/Edge 권장
```

**테스트 순서**:
1. ✅ "시스템 로딩 체크" 클릭 → 모든 시스템 로드 확인
2. ✅ "톤 시스템 테스트" 클릭 → 호감도별 톤 레벨 확인
3. ✅ "사진 시스템 테스트" 클릭 → 사진 DB 로드 확인
4. ✅ "먼저 연락 시스템 테스트" 클릭 → 연락 주기 확인
5. ✅ "전체 워크플로우 실행" 클릭 → 통합 동작 확인

**예상 결과**:
- 모든 테스트에 ✅ 표시
- 콘솔에 상세 로그 출력

---

## 🎯 실제 게임 플레이 테스트 (30분 테스트)

### 준비 단계

**1. 로컬 서버 실행 (필수)**
```bash
# PowerShell에서
cd C:\Users\dosik\chatgame
python -m http.server 8000
# 또는
npx http-server -p 8000
```

**2. 브라우저 접속**
```
http://localhost:8000
```

---

## 📋 테스트 시나리오

### 시나리오 1: 톤 변화 시스템 테스트 (Phase 2-A)

**목표**: 호감도 상승에 따른 말투 변화 확인

**단계**:
1. `http://localhost:8000/character-list-ui.html` 접속
2. 캐릭터 한 명 선택 (예: 미화_enfp)
3. 대화 시작
4. 호감도 0 → 반말/존댓말 확인
5. 선택지로 호감도 상승 (목표: 호감도 5)
6. 호감도 5 → 애교 톤 확인
7. 계속 진행 (목표: 호감도 10)
8. 호감도 10 → 적극적 톤 확인

**확인 포인트**:
- [ ] 호감도 1-2: "~요", "~해요" (존댓말)
- [ ] 호감도 3-4: "~야", "~해" (반말)
- [ ] 호감도 5-6: "~해~", "좋아아" (애교)
- [ ] 호감도 7-8: "그래♡", "응♥" (애정표현)
- [ ] 호감도 9-10: "사랑해", "너무너무 보고싶어" (적극적)

**F12 콘솔 확인**:
```
✅ 톤 레벨: X → Y
✅ 호감도: X → Y
```

---

### 시나리오 2: 사진 전송 시스템 테스트 (Phase 2-B)

**목표**: 호감도에 따른 사진 전송 확인

**단계**:
1. 호감도 5 이상 달성 (시나리오 1 계속)
2. 대화 계속 진행
3. 사진 전송 메시지 대기
4. 사진 클릭하여 확대 보기
5. 사진 카테고리 확인 (daily/special/intimate)

**확인 포인트**:
- [ ] 호감도 3+: daily 사진 (일상 사진)
- [ ] 호감도 5+: special 사진 (특별한 순간)
- [ ] 호감도 7+: intimate 사진 (친밀한 사진)
- [ ] 사진 모달 정상 작동
- [ ] 사진과 함께 메시지 전송

**F12 콘솔 확인**:
```
[사진 트리거] 사진 전송 조건 충족
[사진 트리거] 사진 전송: [파일명]
```

---

### 시나리오 3: 먼저 연락 시스템 테스트 (Phase 2-C)

**목표**: 캐릭터가 먼저 연락하는 기능 확인

**방법 A: 빠른 테스트 (LocalStorage 조작)**

1. `http://localhost:8000/character-list-ui.html` 접속
2. F12 콘솔 열기
3. 다음 코드 실행:

```javascript
// 먼저 연락 시스템 강제 트리거
const testCharId = 'character_mihwa_enfp'; // 또는 다른 캐릭터 ID

// 1. 호감도 5로 설정 (30분 주기)
const multiState = new MultiCharacterState();
multiState.initializeCharacter(testCharId);
multiState.changeAffection(testCharId, 5);

// 2. 마지막 연락 시간을 31분 전으로 설정
const proactiveSystem = new ProactiveContactSystem(testCharId);
proactiveSystem.state.lastContactTime = Date.now() - (31 * 60 * 1000);
proactiveSystem.state.lastUserResponseTime = Date.now() - (31 * 60 * 1000);
proactiveSystem.saveState();

// 3. 트리거 엔진 강제 실행
const triggerEngine = new EpisodeTriggerEngine(testCharId, multiState);
await triggerEngine.checkProactiveContact();

console.log('✅ 먼저 연락 트리거 강제 실행 완료!');
console.log('character-list-ui.html에서 새 메시지 확인하세요.');
```

4. `character-list-ui.html` 새로고침
5. 캐릭터 리스트에 새 메시지 확인

**방법 B: 실제 대기 테스트 (시간 소요)**

1. 캐릭터와 대화 시작
2. 호감도 5 달성
3. 대화창 닫기 (답장 안 함)
4. 30분 대기
5. `character-list-ui.html` 확인 → 새 메시지 표시

**확인 포인트**:
- [ ] 캐릭터 리스트에 안읽은 메시지 수 (빨간 뱃지)
- [ ] 메시지 미리보기 (최대 30자)
- [ ] 메시지 내용: 시간대별 템플릿
- [ ] 호감도별 연락 주기:
  * 호감도 1-2: 60분
  * 호감도 3-4: 45분
  * 호감도 5-6: 30분
  * 호감도 7-8: 20분
  * 호감도 9-10: 10분

**F12 콘솔 확인**:
```
[먼저 연락] 체크 시작...
[먼저 연락] 연락 주기 충족
[먼저 연락] 메시지 생성: [내용]
```

---

### 시나리오 4: 무응답 반응 메시지 테스트

**목표**: 답장 안 할 때 MBTI별 반응 확인

**단계**:

1. F12 콘솔에서 무응답 시간 조작:

```javascript
const testCharId = 'character_mihwa_enfp';

// 1. 호감도 5 설정
const multiState = new MultiCharacterState();
multiState.changeAffection(testCharId, 5);

// 2. 먼저 연락 후 3시간 무응답 설정
const proactiveSystem = new ProactiveContactSystem(testCharId);
proactiveSystem.state.lastContactTime = Date.now() - (10 * 60 * 1000); // 10분 전 연락
proactiveSystem.state.lastUserResponseTime = Date.now() - (3 * 60 * 60 * 1000); // 3시간 전 응답
proactiveSystem.saveState();

// 3. 반응 메시지 확인
const reaction = proactiveSystem.checkReactionMessage(5, 'ENFP');
console.log('반응 메시지:', reaction);
```

**MBTI별 반응 패턴**:
- **ENFP** (활발형): 3시간 후 "오빠!! 왜 답 없어?? 😢"
- **INFP** (감성형): 6시간 후 "오빤 바쁜가봐... ㅠㅠ"
- **INTJ** (전략형): 12시간 후 "바쁘신가 보네요. 나중에 연락 주세요."
- **ESFJ** (친화형): 2시간 후 "혹시 내가 뭘 잘못했나...? 😢"

**확인 포인트**:
- [ ] MBTI별 다른 반응 시간
- [ ] MBTI별 다른 메시지 톤
- [ ] 호감도 감소 (일부 반응에서)

---

### 시나리오 5: 전체 통합 테스트

**목표**: 3개 시스템이 함께 작동하는 것 확인

**단계**:
1. 새 캐릭터로 시작
2. 호감도 0 → 10까지 진행
3. 과정에서 확인:
   - 톤 변화 (5단계)
   - 사진 전송 (3가지 카테고리)
   - 먼저 연락 (연락 주기 변화)
   - 무응답 반응 (대기 시)

**완전한 플레이 흐름**:
```
호감도 0-2 (존댓말)
→ 호감도 3-4 (반말) + daily 사진
→ 호감도 5-6 (애교) + special 사진 + 30분 주기 연락
→ 호감도 7-8 (애정표현) + intimate 사진 + 20분 주기 연락
→ 호감도 9-10 (적극적) + 10분 주기 연락
```

---

## 🔧 디버깅 도구

### LocalStorage 상태 확인

```javascript
// F12 콘솔에서

// 1. 모든 캐릭터 상태 확인
const multiState = new MultiCharacterState();
multiState.debugStates();

// 2. 특정 캐릭터 먼저 연락 상태 확인
const testCharId = 'character_mihwa_enfp';
const proactiveSystem = new ProactiveContactSystem(testCharId);
console.log('먼저 연락 상태:', proactiveSystem.state);

// 3. 사진 시스템 상태 확인
const photoSystem = new PhotoSendingSystem();
console.log('사진 DB:', photoSystem.photoDB);
console.log('전송 이력:', photoSystem.sendHistory);
```

### 강제 리셋

```javascript
// 모든 상태 초기화 (주의: 모든 데이터 삭제)
localStorage.clear();
location.reload();
```

### 특정 캐릭터만 리셋

```javascript
const testCharId = 'character_mihwa_enfp';

// 캐릭터 상태 삭제
const multiState = new MultiCharacterState();
multiState.deleteCharacter(testCharId);

// 먼저 연락 상태 삭제
localStorage.removeItem(`proactive_contact_${testCharId}`);

location.reload();
```

---

## 📊 체크리스트

### Phase 2-A: 톤 변화 시스템
- [ ] 호감도 1-2 → 존댓말
- [ ] 호감도 3-4 → 반말
- [ ] 호감도 5-6 → 애교
- [ ] 호감도 7-8 → 애정표현
- [ ] 호감도 9-10 → 적극적
- [ ] MBTI별 말투 차이 (선택)

### Phase 2-B: 사진 전송 시스템
- [ ] 호감도 3+ → daily 사진
- [ ] 호감도 5+ → special 사진
- [ ] 호감도 7+ → intimate 사진
- [ ] 사진 모달 클릭 확대
- [ ] 사진과 함께 메시지

### Phase 2-C: 먼저 연락 시스템
- [ ] 호감도별 연락 주기 (10~60분)
- [ ] 시간대별 메시지 템플릿
- [ ] 캐릭터 리스트 안읽은 수
- [ ] 메시지 미리보기 (30자)
- [ ] 1분 자동 업데이트
- [ ] MBTI별 무응답 반응
- [ ] 호감도 0 → 연락 중지

### 통합 테스트
- [ ] 3개 시스템 동시 작동
- [ ] 콘솔 에러 없음
- [ ] 트리거 엔진 정상 작동
- [ ] LocalStorage 저장/로드

---

## 🐛 문제 해결

### 문제 1: 시스템 로드 안 됨
**증상**: 테스트 페이지에서 ❌ 표시
**해결**:
```bash
# 로컬 서버 실행 필수
python -m http.server 8000
# 브라우저: http://localhost:8000/test-phase2-integration.html
```

### 문제 2: 먼저 연락 안 옴
**원인**: 연락 주기 미충족
**해결**:
```javascript
// F12 콘솔에서 강제 트리거 (위 시나리오 3 참고)
```

### 문제 3: 사진 전송 안 됨
**원인**: 호감도 부족 또는 사진 DB 로드 실패
**해결**:
```javascript
// 사진 DB 확인
const photoSystem = new PhotoSendingSystem();
console.log('사진 DB 로드:', photoSystem.photoDB !== null);
```

### 문제 4: 톤 변화 안 됨
**원인**: ToneVariationEngine 미로드
**해결**:
```javascript
// 톤 엔진 확인
console.log('톤 엔진:', typeof ToneVariationEngine !== 'undefined');
```

---

## 📹 비디오 가이드 (선택)

실제 플레이 녹화를 원하시면:
```
1. OBS Studio 설치
2. 브라우저 캡처
3. F12 콘솔도 함께 녹화
4. 전체 워크플로우 시연
```

---

**작성일**: 2025-10-05
**대상**: Phase 2 시스템 테스트
**예상 시간**:
- 빠른 테스트: 5분
- 전체 테스트: 30분
