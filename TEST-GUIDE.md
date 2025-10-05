# 🎮 Phase 3 완전 통합 테스트 가이드

## 📋 목차
1. [테스트 시작하기](#테스트-시작하기)
2. [시스템별 테스트 방법](#시스템별-테스트-방법)
3. [종합 시나리오 테스트](#종합-시나리오-테스트)
4. [예상 결과 확인](#예상-결과-확인)
5. [문제 해결](#문제-해결)

---

## 🚀 테스트 시작하기

### 1. 테스트 페이지 접속
```
파일 경로: test-phase3-complete.html
브라우저에서 열기: 더블클릭 또는 우클릭 > 연결 프로그램 > 브라우저
```

### 2. 개발자 도구 열기
- **Windows/Linux**: `F12` 또는 `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`
- **Console 탭 확인**: 시스템 초기화 메시지 확인

### 3. 시스템 상태 확인
페이지 상단에 7개 시스템 상태 카드가 표시됩니다:
- ✅ **활성** (보라색 배경) - 정상 작동
- ❌ **비활성** (흰색 배경) - 초기화 실패

**모든 시스템이 활성 상태여야 합니다!**

---

## 🔬 시스템별 테스트 방법

### 1️⃣ 통계 & 업적 시스템 테스트

#### 테스트 순서:
1. **캐릭터 선택**
   - "ENFP 캐릭터" 버튼 클릭
   - 하단에 캐릭터 정보가 표시되는지 확인

2. **통계 조회**
   - "📈 통계 조회" 버튼 클릭
   - 결과 박스에 JSON 형식 통계 표시 확인

   **예상 결과**:
   ```json
   {
     "totalMessages": 0,
     "totalChoices": 0,
     "affectionHistory": [],
     "consecutiveDays": 0
   }
   ```

3. **플레이 세션 시뮬레이션**
   - "🎮 플레이 세션 시뮬레이션" 버튼 클릭
   - 10개 메시지 자동 생성
   - 통계가 업데이트되는지 확인

   **예상 결과**:
   - `totalMessages`: 20 (유저 10 + 캐릭터 10)
   - `affectionHistory`: 배열에 데이터 추가됨
   - 실시간 로그에 "플레이 세션 시뮬레이션 완료" 표시

4. **업적 체크**
   - "🏆 업적 체크" 버튼 클릭
   - 달성한 업적 확인

   **예상 결과**:
   - `first_message` 업적 해제
   - 오른쪽 상단에 업적 알림 팝업 (금색 배경)

---

### 2️⃣ 감정 & 이벤트 시스템 테스트

#### 테스트 순서:
1. **감정 상태 조회**
   - "😊 감정 상태 조회" 버튼 클릭

   **예상 결과**:
   ```json
   {
     "currentEmotion": "calm",
     "emotionIntensity": 0.5,
     "emotionStartTime": 1234567890,
     "mbtiType": "ENFP"
   }
   ```

2. **감정 변경 테스트**
   - "🎭 감정 변경 테스트" 버튼 클릭
   - 랜덤 감정으로 변경됨
   - 다시 "😊 감정 상태 조회" 클릭하여 변경 확인

3. **특별 이벤트 체크**
   - "🎉 특별 이벤트 체크" 버튼 클릭
   - 현재 호감도로는 이벤트 없을 수 있음

   **발동 조건 없을 때**:
   ```
   발동 가능한 이벤트가 없습니다.
   ```

4. **랜덤 이벤트 발동**
   - "🎲 랜덤 이벤트 발동" 버튼 클릭
   - 호감도가 랜덤하게 변경됨
   - 이벤트 발동 가능성 증가

   **이벤트 발동 시**:
   ```json
   {
     "id": "first_date",
     "name": "첫 데이트 제안",
     "message": "저기... 다음 주말에 시간 있어?",
     "choices": [...]
   }
   ```

---

### 3️⃣ 대화 기억 시스템 테스트

#### 테스트 순서:
1. **메시지 추가**
   - 텍스트 영역에 입력: "나는 영화 보는 걸 정말 좋아해"
   - "💬 메시지 추가" 버튼 클릭

   **예상 결과**:
   ```json
   {
     "totalMessages": 1,
     "workingMemory": 1,
     "shortTermMemory": 0,
     "longTermMemory": {
       "preferences": 1,
       "promises": 0,
       "personal_info": 0,
       "shared_experiences": 0
     }
   }
   ```
   - "좋아해" 키워드가 선호도로 분류됨

2. **다양한 메시지 테스트**
   - "내일 같이 영화 보러 가자" 입력 → 약속 감지
   - "나는 서울에 살아" 입력 → 개인정보 감지
   - "미안해 늦어서" 입력 → 감정 감지

3. **메모리 검색**
   - 텍스트 영역에 검색어: "영화"
   - "🔍 메모리 검색" 버튼 클릭

   **예상 결과**:
   - 관련 메시지 목록 반환
   - 관련도 점수와 함께 표시

4. **AI 컨텍스트 생성**
   - "📝 AI 컨텍스트 생성" 버튼 클릭

   **예상 결과**:
   ```json
   {
     "longTermFacts": ["나는 영화 보는 걸 정말 좋아해"],
     "recentContext": ["user: 나는 영화 보는 걸 정말 좋아해"],
     "relevantMemories": []
   }
   ```

---

### 4️⃣ 엔딩 시스템 테스트

#### 테스트 순서:
1. **호감도 설정**
   - 입력 필드에 값 입력: `50`
   - "💕 호감도 설정" 버튼 클릭
   - 캐릭터 정보에서 호감도 변경 확인

2. **엔딩 조건 체크**
   - "🏁 엔딩 조건 체크" 버튼 클릭

   **호감도 30-59일 때**:
   ```json
   {
     "id": "friend_ending",
     "name": "소중한 친구",
     "requiredAffection": { "min": 30, "max": 59 },
     "requiredMessages": 50,
     "requiredEvents": ["first_date"]
   }
   ```
   - 메시지 수가 부족하면 엔딩 없을 수 있음

3. **트루 엔딩 시뮬레이션**
   - "💖 트루 엔딩 시뮬레이션" 버튼 클릭
   - 자동으로 조건 충족 (호감도 95, 메시지 100개)

   **예상 결과**:
   ```json
   {
     "endingId": "true_ending",
     "endingName": "운명적인 사랑",
     "level": 5,
     "story": ["처음 만난 순간부터...", "..."],
     "isFirstTime": true
   }
   ```

4. **엔딩 레벨별 테스트**
   - 호감도 -50 → Bad Ending
   - 호감도 10 → Normal Ending
   - 호감도 40 → Friend Ending
   - 호감도 70 → Romantic Ending
   - 호감도 95 → True Ending

---

### 5️⃣ 통합 관리 시스템 테스트

#### 테스트 순서:
1. **통합 이벤트 처리**
   - "🔄 통합 이벤트 처리" 버튼 클릭
   - 호감도 +5 변경 시 모든 시스템 자동 연동 확인

   **예상 동작**:
   - EmotionStateSystem 감정 업데이트
   - SpecialEventSystem 이벤트 체크
   - AchievementSystem 업적 체크
   - StatisticsManager 통계 기록

2. **전체 게임 상태 조회**
   - "📊 전체 게임 상태" 버튼 클릭

   **예상 결과**:
   ```json
   {
     "character": { ... },
     "statistics": { ... },
     "emotion": { ... },
     "memory": { ... },
     "events": { ... },
     "achievements": { ... },
     "endings": []
   }
   ```
   - 모든 시스템 데이터가 통합되어 표시됨

3. **성능 메트릭**
   - "⚡ 성능 메트릭" 버튼 클릭

   **예상 결과**:
   ```json
   {
     "metrics": {
       "affection_change": {
         "count": 5,
         "avgTime": 2.3,
         "maxTime": 5.1
       }
     },
     "eventLogSize": 15,
     "recentEvents": [...]
   }
   ```

4. **시스템 헬스 체크**
   - "🏥 시스템 헬스 체크" 버튼 클릭

   **예상 결과**:
   ```json
   {
     "healthy": true,
     "systems": {
       "statistics": true,
       "achievements": true,
       "emotions": true,
       "events": true,
       "memory": true,
       "endings": true
     },
     "warnings": []
   }
   ```

---

### 6️⃣ 종합 시나리오 테스트

#### A. 완전한 게임 플로우
1. "🎯 완전한 게임 플로우" 버튼 클릭
2. 자동으로 진행:
   - 1단계: 첫 만남 (호감도 +5)
   - 2단계: 20회 대화 진행
   - 3단계: 감정 변화 (happy)
   - 4단계: 특별 이벤트 체크
   - 5단계: 업적 해제 체크
   - 6단계: 엔딩 조건 확인

**예상 결과 형식**:
```
1️⃣ 첫 만남
   호감도: 5

2️⃣ 대화 진행 (20회)
   호감도: 25

3️⃣ 감정 변화
   현재 감정: happy

4️⃣ 특별 이벤트 체크
   없음

5️⃣ 업적 체크
   해제된 업적: 3개

6️⃣ 엔딩 조건 체크
   아직 없음
```

#### B. 스피드런 시나리오
1. "⚡ 스피드런 시나리오" 버튼 클릭
2. 3일 안에 호감도 80 달성

**예상 결과**:
```
⚡ 스피드런 결과

호감도: 80
메시지: 30
경과 시간: 3일 미만

엔딩: 전격 고백 (히든 엔딩)
```

#### C. 배드엔딩 시나리오
1. "💔 배드엔딩 시나리오" 버튼 클릭
2. 호감도 -50 달성

**예상 결과**:
```
💔 배드엔딩 결과

호감도: -50
메시지: 20

엔딩: 안타까운 이별
관계가 악화되어 더 이상 연락을 주고받지 않게 되었습니다.
```

---

## ✅ 예상 결과 확인

### 정상 작동 시 확인 사항:

#### 1. 실시간 로그 (페이지 하단)
```
[14:23:45] [INFO] 🎮 Phase 3 통합 테스트 시작
[14:23:45] [SUCCESS] ✅ 모든 시스템 초기화 완료
[14:23:50] [INFO] 캐릭터 선택: test_enfp
[14:23:55] [SUCCESS] 통계 조회 완료
[14:24:00] [SUCCESS] 플레이 세션 시뮬레이션 완료
```

#### 2. 브라우저 콘솔
```
🎮 MultiCharacterState 초기화 완료
✅ StatisticsManager 통합 완료
✅ AchievementSystem 통합 완료
✅ 감정/이벤트 시스템 준비 완료
✅ 대화 기억 시스템 준비 완료
✅ EndingManager 통합 완료
✅ GameIntegrationManager 통합 완료
```

#### 3. 시스템 상태 카드
모든 7개 카드가 **보라색 배경**이어야 합니다:
- ✅ StatisticsManager
- ✅ AchievementSystem
- ✅ EmotionSystem
- ✅ EventSystem
- ✅ MemorySystem
- ✅ EndingManager
- ✅ IntegrationManager

---

## 🐛 문제 해결

### 문제 1: 시스템이 비활성 상태
**증상**: 상태 카드가 흰색 배경 (비활성)

**해결 방법**:
1. F12 콘솔에서 에러 확인
2. JavaScript 파일 경로 확인
3. 페이지 새로고침 (F5)

**확인할 파일 경로**:
```html
<script src="js/multi-character-state.js"></script>
<script src="js/statistics-manager.js"></script>
<script src="js/achievement-system.js"></script>
<script src="js/emotion-state-system.js"></script>
<script src="js/special-event-system.js"></script>
<script src="js/conversation-memory-system.js"></script>
<script src="js/memory-keywords.js"></script>
<script src="js/ending-system.js"></script>
<script src="js/game-integration-manager.js"></script>
```

### 문제 2: 버튼 클릭 시 반응 없음
**증상**: 버튼을 눌러도 아무 일도 일어나지 않음

**해결 방법**:
1. 캐릭터를 먼저 선택했는지 확인
2. F12 콘솔에서 에러 메시지 확인
3. 실시간 로그 박스 확인

### 문제 3: 데이터 파일 로드 실패
**증상**: "엔딩 데이터가 로드되지 않음" 등의 메시지

**해결 방법**:
1. 서버 실행 확인 (로컬 서버 필요)
2. 파일 경로 확인: `data/endings.json`, `data/special-events.json`
3. 브라우저 보안 정책 확인 (CORS)

**로컬 서버 실행 방법**:
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 설치 필요)
npx http-server

# 접속
http://localhost:8000/test-phase3-complete.html
```

### 문제 4: 메모리/성능 문제
**증상**: 페이지가 느려지거나 멈춤

**해결 방법**:
1. 로그 박스 초기화 (🗑️ 로그 지우기)
2. 페이지 새로고침
3. 개발자 도구의 Performance 탭 확인

---

## 📊 테스트 체크리스트

완전한 테스트를 위해 다음 항목들을 확인하세요:

### 기본 기능
- [ ] 모든 시스템 상태 카드 활성화 확인
- [ ] 캐릭터 선택 가능
- [ ] 캐릭터 정보 표시 확인
- [ ] 실시간 로그 작동 확인

### 통계 & 업적
- [ ] 통계 조회 정상 작동
- [ ] 플레이 세션 시뮬레이션 후 통계 업데이트
- [ ] 업적 체크 및 알림 표시
- [ ] 업적 진행도 추적

### 감정 & 이벤트
- [ ] 감정 상태 조회
- [ ] 감정 변경 테스트
- [ ] 특별 이벤트 체크
- [ ] 이벤트 발동 확인

### 메모리
- [ ] 메시지 추가 및 분류
- [ ] 키워드 추출 확인
- [ ] 메모리 검색 기능
- [ ] AI 컨텍스트 생성

### 엔딩
- [ ] 호감도 변경
- [ ] 엔딩 조건 체크
- [ ] 각 엔딩 레벨 테스트
- [ ] 히든 엔딩 발견

### 통합 시스템
- [ ] 통합 이벤트 처리
- [ ] 전체 게임 상태 조회
- [ ] 성능 메트릭 확인
- [ ] 시스템 헬스 체크

### 종합 시나리오
- [ ] 완전한 게임 플로우
- [ ] 스피드런 시나리오
- [ ] 배드엔딩 시나리오

---

## 🎯 고급 테스트

### 1. 다중 캐릭터 테스트
1. ENFP 캐릭터로 테스트
2. INFP 캐릭터로 전환
3. INTJ 캐릭터로 전환
4. 각 캐릭터의 독립적인 상태 확인

### 2. 장기 플레이 시뮬레이션
```javascript
// 콘솔에서 실행
for (let i = 0; i < 100; i++) {
    multiCharacterState.notifyUserResponse(
        selectedCharacterId,
        `메시지 ${i}`,
        { affectionChange: Math.random() > 0.5 ? 2 : -1 }
    );
}
```

### 3. 메모리 스트레스 테스트
```javascript
// 1000개 메시지 추가
for (let i = 0; i < 1000; i++) {
    const memorySystem = multiCharacterState.getMemorySystem(selectedCharacterId);
    memorySystem.addMessage('user', `스트레스 테스트 ${i}`, {});
}
```

### 4. 모든 엔딩 달성
각 엔딩 조건에 맞게 호감도와 메시지 수를 설정하여 7가지 엔딩 모두 달성

---

## 📝 테스트 리포트 작성

테스트 완료 후 다음 정보를 기록하세요:

1. **테스트 환경**
   - 브라우저: Chrome / Firefox / Safari / Edge
   - 버전:
   - OS: Windows / Mac / Linux

2. **테스트 결과**
   - 성공한 테스트:
   - 실패한 테스트:
   - 발견된 버그:

3. **성능 메트릭**
   - 페이지 로드 시간:
   - 평균 응답 시간:
   - 메모리 사용량:

4. **개선 제안**
   - UI/UX:
   - 기능:
   - 성능:

---

## 🎉 테스트 완료!

모든 테스트를 통과하면 Phase 3 시스템이 완벽하게 작동하는 것입니다!

다음 단계:
1. 실제 게임 UI에 통합
2. 사용자 테스트 진행
3. 추가 기능 개발

**축하합니다! 🎊**
