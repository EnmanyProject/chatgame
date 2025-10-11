# 시나리오 시스템 업그레이드 - 빠른 참조 카드

## 🎯 핵심 개념 (30초 이해)

**기존:** 시나리오 = 소설 텍스트 (600자) → 에피소드마다 AI 생성
**새로:** 시나리오 = 대화 블록 배열 → 에피소드에서 재사용

---

## 📋 dialogue_script 블록 타입 (3가지)

### 1. message (캐릭터 대사)
```javascript
{
  "id": 1,
  "type": "message",
  "speaker": "소라",
  "text": "집에 왔는데 갑자기 네 생각나서 톡해.",
  "emotion": "neutral",
  "timestamp": "19:23"
}
```

### 2. choice (선택지)
```javascript
{
  "id": 4,
  "type": "choice",
  "question": "솔직히 말해봐. 그날 무슨 생각했어?",
  "options": [
    { "id": "A", "text": "너도 나 생각했어?", "affection_change": 3 },
    { "id": "B", "text": "뭐 먹었어?", "affection_change": 0 },
    { "id": "C", "text": "그냥 좀 피곤했어", "affection_change": 1 }
  ]
}
```

### 3. user_input (주관식)
```javascript
{
  "id": 8,
  "type": "user_input",
  "placeholder": "답장을 입력하세요...",
  "evaluation_keywords": ["궁금", "걱정", "관심"]
}
```

---

## 🔢 선택지 개수 → 플레이 시간

| 선택지 | 시간 | 총 블록 수 | 사용 케이스 |
|--------|------|-----------|------------|
| 4개 | 5-10분 | 15-20개 | 짧은 일화 |
| 8개 | 10-15분 | 30-40개 | 보통 대화 |
| 12개 | 15-20분 | 45-55개 | 긴 대화 |
| 20개 | 25-30분 | 75-85개 | 심화 스토리 |
| 36개 | 45-60분 | 135-150개 | 장편 에피소드 |

**공식:** 총 블록 = 선택지 개수 × 5 (대사 3-4개 + 선택지 1개)

---

## 🛠️ 구현 순서 (6 Steps)

```
Step 1 (30분): 데이터 스키마
  └─ scenario-database.json 새 구조

Step 2 (2시간): UI 편집기
  └─ 대화 블록 추가/삭제/편집

Step 3 (1시간): AI 생성 v2
  └─ dialogue_script 자동 생성

Step 4 (1시간): 저장/로드
  └─ GitHub API 연동

Step 5 (30분): 미리보기
  └─ 메신저 스타일 렌더링

Step 6 (10분): 초기화
  └─ 기존 데이터 제거
```

---

## 💻 핵심 함수

### 프론트엔드
```javascript
// 블록 추가
addMessageBlock()
addChoiceBlock()
addUserInputBlock()

// 데이터 수집
collectDialogueScript() → dialogue_script 배열

// 미리보기
previewDialogue() → 메신저 스타일 렌더링

// 저장
saveScenarioWithDialogue() → GitHub API
```

### 백엔드
```javascript
// AI 생성
generateDialogueScript(
  title, description, genre,
  sexyLevel, mood, totalChoices
) → dialogue_script 배열

// 검증
validateDialogueScript(script, expectedChoices)
```

---

## 🔄 API 엔드포인트

### 1. 대화 스크립트 생성
```javascript
POST /api/scenario-manager
{
  "action": "generate_dialogue_script",
  "title": "늦은 밤의 톡",
  "total_choices": 8
}
→ { "dialogue_script": [...] }
```

### 2. 시나리오 저장
```javascript
POST /api/scenario-manager
{
  "action": "save",
  "scenario": {
    "dialogue_script": [...],
    "total_choices": 8
  }
}
→ { "success": true }
```

---

## 🎨 UI 구조

```
시나리오 모달
├─ [📋 기본 정보] 탭
│   ├─ 제목, 설명
│   ├─ 장르, 섹시 레벨, 분위기
│   └─ 선택지 개수 (4~36) ← 신규
│
└─ [📝 대화 스크립트] 탭 ← 신규
    ├─ [💬 대사] [🎯 선택지] [⌨️ 주관식] [👁️ 미리보기]
    └─ 대화 블록 컨테이너
        ├─ #1 💬 대사
        ├─ #2 💬 대사
        ├─ #3 🎯 선택지
        └─ #4 💬 대사
```

---

## ✅ 체크리스트 (구현 시)

**각 Step 완료 후:**
- [ ] 기능 테스트 통과
- [ ] Git 커밋 (`Step X: [작업 내용]`)
- [ ] 다음 Step 진행

**Step 1:**
- [ ] scenario-database.json 백업
- [ ] 새 스키마 적용
- [ ] 예시 시나리오 1개 생성

**Step 2:**
- [ ] 탭 전환 작동
- [ ] 블록 추가 버튼 작동
- [ ] collectDialogueScript() 정상 반환

**Step 3:**
- [ ] AI 생성 버튼 클릭 → dialogue_script 생성
- [ ] 선택지 개수 정확
- [ ] speaker 필드 모두 존재

**Step 4:**
- [ ] 저장 → 로드 플로우 정상
- [ ] 시나리오 카드 대화 미리보기 표시

**Step 5:**
- [ ] 미리보기 모달 표시
- [ ] 메신저 스타일 렌더링

**Step 6:**
- [ ] 기존 시나리오 삭제
- [ ] 새 시나리오 생성 정상

---

## 🚨 자주 하는 실수

### 1. speaker 필드 누락
❌ `"speaker": "undefined"`
✅ `"speaker": "소라"`

**해결:** AI 응답 후처리에서 자동 교체

### 2. 선택지 개수 부족
❌ 요청 8개 → 생성 3개
✅ 요청 8개 → 생성 8개 이상

**해결:** validateDialogueScript() 검증

### 3. JSON 파싱 실패
❌ AI가 JSON이 아닌 텍스트 반환
✅ JSON Mode 사용

**해결:** `response_format: { type: "json_object" }`

---

## 📊 성능 지표

**목표:**
- 시나리오 생성 시간: 10분 → 5분 (50% 단축)
- 에피소드 생성 비용: 매번 AI 호출 → 재사용 (90% 절감)
- 에피소드 생성 속도: 10-15초 → 1-2초 (85% 단축)

**측정:**
- 시나리오 생성: 기본 정보 입력 → 저장 완료 시간
- AI 생성 응답 시간: API 호출 → dialogue_script 반환
- 에피소드 생성: 시나리오 선택 → 에피소드 저장 완료

---

## 🔗 관련 파일

**주요 파일:**
- `upgrade.md` - 요구사항
- `docs/SCENARIO_SYSTEM_UPGRADE_DESIGN.md` - 상세 설계 (52KB)
- `docs/UPGRADE_SUMMARY.md` - 요약 (6.5KB)
- `scenario-admin.html` - 프론트엔드
- `api/scenario-manager.js` - 백엔드

**참고 파일:**
- `api/episode-manager.js` - AI 생성 참고 (Lines 1169-1674)
- `data/ai-prompts.json` - 프롬프트 설정
- `CLAUDE.md` - 프로젝트 히스토리

---

## 💡 유용한 팁

### AI 생성 품질 향상
1. 제목/설명을 구체적으로 작성
2. 선택지 개수는 4의 배수 추천 (4, 8, 12, 16...)
3. 섹시 레벨 너무 높으면 AI 거부 가능 (6 이하 추천)

### 대화 블록 편집
1. 메시지는 2-3문장이 적절
2. 선택지는 짧고 명확하게 (10-20자)
3. emotion 태그로 감정 흐름 표현

### 디버깅
1. 콘솔에서 `collectDialogueScript()` 직접 호출
2. AI 응답 전체 로그 확인 (첫 500자, 마지막 500자)
3. JSON 파싱 실패 시 위치 확인 (`position N`)

---

**빠른 시작:**
1. 상세 설계 문서 읽기 (10분)
2. Step 1 시작 (30분)
3. 각 Step 완료 후 체크리스트 확인
4. 문제 발생 시 리스크 관리 섹션 참조

**문서 버전:** 1.0.0
**업데이트:** 2025-10-11
