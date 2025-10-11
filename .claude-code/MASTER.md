# 📌 현재 작업 가이드 (MASTER)

**최종 업데이트**: 2025-10-11
**현재 Phase**: 시나리오 AI 생성 시스템 디버깅 (Step 2 empty response 해결)

---

## 🎯 현재 상태

**작업**: 시나리오 AI 생성 Step 2 빈 응답 문제 디버깅 🔧
**버전**: Scenario Manager API / Scenario Admin v1.19.6
**상태**: ❌ **미해결** - 코드 수정 완료했으나 테스트 미완료
**다음**: Vercel 배포 확인 후 시나리오 생성 테스트 필수

**오늘 작업 (2025-10-11)**:
- ✅ Step 2 empty response 근본 원인 발견 (Step 1 구조를 Step 2가 무시)
- ✅ 코드 수정: Step 1 구조를 Step 2 프롬프트에 상세 포함 (Lines 770-814)
- ✅ OpenAI 응답 검증 5개 레이어 추가
- ✅ Git push 완료 (commit f13602a)
- ✅ 3대 문서 백업 시스템 구축
- ❌ **실제 테스트 미완료** - 수정 코드가 실제로 문제를 해결하는지 미확인

---

## ✅ 최근 완료 작업

### 🌟 새벽 작업: AI 대화 생성 시스템 완전 개선 (2025-10-10)

**Episode Manager API v2.2.1 → v2.2.2** - AI 대화 생성 품질 대폭 향상

#### v2.2.2: speaker undefined 수정 + 캐릭터 대사 비중 대폭 증가 (Patch Update)

**핵심 개선**:
1. **speaker 필드 "undefined" 문제 완전 해결**
   - AI 프롬프트에 명확한 경고 추가: `speaker는 반드시 "${characterInfo.name}"`
   - 후처리 검증 시스템 추가: undefined/빈 값 자동 교체
   - 검증 로깅으로 수정 내역 추적

2. **캐릭터 대사 비중 60% → 80%로 대폭 증가**
   - 대화 구조 변경: narration 우선 → character_dialogue 우선
   - 사이클당 대사 개수 증가: 2개 → 3개
   - 총 대화 개수 증가: ~10-16개 → ~16-26개
   - 명시적 지시: "대화의 80%는 캐릭터 대사"

3. **AI 생성 토큰 증가**
   - choice_based: 2000 → 3000 tokens
   - free_input_based: 1800 → 2500 tokens
   - 근거: Vercel 타임아웃 30초 (10초 아님)

4. **필수 구조 강화**
   ```
   반복 N번:
   1. character_dialogue (캐릭터가 먼저)
   2. narration (간단하게)
   3. character_dialogue (추가 대사)
   4. multiple_choice/free_input (선택)
   5. character_dialogue (반응 대사 - 필수!)
   ```

**기술적 세부사항**:
- Lines 1102-1390: AI 프롬프트 완전 개편
- Lines 1428-1458: 후처리 검증 시스템 추가
- Lines 1113-1125: 대화 개수 계산식 변경 (× 3 + 1 → × 5 + 1)
- Line 1407: max_tokens 증가

**Git**: 커밋 `ca8d4cc`, 푸시 완료 ✅

---

#### v2.2.1: AI 대화 생성 시나리오+캐릭터 상세 정보 반영 (Patch Update)

**핵심 개선**:
1. **시나리오 정보 완전 로드 시스템**
   - `loadScenarioInfo()` 함수 신규 추가 (Lines 1461-1504)
   - GitHub API에서 scenario-database.json 실시간 로드
   - 제목, 설명, 장르, 섹시 레벨, 분위기 전달
   - **가장 중요**: ai_generated_context (600-900자 스토리) 포함

2. **캐릭터 정보 대폭 확장**
   - `loadCharacterInfo()` 개선 (Lines 1506-1559)
   - 4개 필드 → 10+ 필드로 확장
   - 추가된 정보: 나이, 직업, 성격 특성, 취미, 좋아하는 주제, 피하는 주제

3. **AI 프롬프트에 상세 정보 반영**
   ```
   **📖 시나리오 정보:**
   - 제목: ${scenarioInfo.title}
   - 설명: ${scenarioInfo.description}
   - 장르: ${scenarioInfo.genre} (섹시 레벨: ${scenarioInfo.sexy_level}/10)
   - 분위기: ${scenarioInfo.mood}

   **📚 시나리오 배경 스토리:**
   ${scenarioInfo.ai_generated_context}  ← 600-900자 스토리!

   **💁 캐릭터 정보:**
   - 이름: ${characterInfo.name}
   - 나이: ${characterInfo.age}세
   - 직업: ${characterInfo.occupation}
   - MBTI: ${characterInfo.mbti}
   - 성격: ${characterInfo.personality}
   - 성격 특성: ${characterInfo.personality_traits?.join(', ')}
   - 취미: ${characterInfo.hobbies?.join(', ')}
   - 말투: ${characterInfo.speech_style}
   - 좋아하는 주제: ${characterInfo.favorite_topics?.join(', ')}
   - 피하는 주제: ${characterInfo.disliked_topics?.join(', ')}

   🚨 중요: 위의 "시나리오 배경 스토리"를 반드시 참고하여 대화를 생성하세요!
   ```

4. **문제 해결**
   - **이전**: 시나리오 ID만 전달 (예: "scenario_도와줘_1759987337551")
   - **현재**: 전체 스토리 컨텍스트 전달 → AI가 정확히 참고

**기술적 세부사항**:
- Lines 1461-1504: loadScenarioInfo() 함수 추가
- Lines 1506-1559: loadCharacterInfo() 개선
- Lines 910-923: handleGenerateEpisode()에서 시나리오 정보 로드
- Lines 1102-1197: AI 프롬프트 대폭 확장

**사용자 피드백 반영**:
- "시나리오를 참조하지 않고 그냥 만드는 것 같다" ✅ 해결
- "API 응답시간 10초 제한 늘려줘" → Vercel 이미 30초임을 확인

**Git**: 커밋 `f8a5d2a`, 푸시 완료 ✅

---

## ✅ 이전 완료 작업 (2025-10-09)

### 📦 저녁 작업: 3대 문서 백업 시스템 구축 (v1.19.6)

**백업 시스템 완성**
1. **문서 백업 디렉토리 생성** (`.claude-code/backup/`)
   - v1.19.5 마일스톤 시점의 3대 문서 영구 보관
   - 향후 롤백 및 버전 비교 가능

2. **백업 파일 생성**
   - `PROJECT_v1.19.5_2025-10-09.md` (21KB)
   - `MASTER_v1.19.5_2025-10-09.md` (7.1KB)
   - `CLAUDE_v1.19.5_2025-10-09.md` (80KB)
   - **총 크기**: 108KB (2,352줄)

3. **백업 시점 주요 내용**
   - 시나리오 관리 시스템 완성
   - 에피소드 관리 시스템 완성 (dialogue_flow 4가지 타입)
   - 상세보기 모달 연결
   - GitHub API 완전 통합

4. **Git 커밋 및 문서 동기화**
   - CLAUDE.md: v1.19.6 버전 히스토리 추가
   - MASTER.md: 현재 버전 v1.19.6으로 업데이트
   - PROJECT.md: 백업 작업 기록 (예정)

**Git**: 커밋 `24f945b`, 푸시 완료 ✅

---

### 🎯 오후 작업: 에피소드 관리 시스템 완성 (v1.19.2 → v1.19.5)

**총 4개 버전 업데이트** - 에피소드 시스템 완전 구현

#### 핵심 기능 완성
1. **504 타임아웃 에러 처리** (v1.19.2)
   - OpenAI API 10초 초과 시 명확한 에러 메시지
   - 해결 방법 안내 (짧음 선택, gpt-3.5-turbo 사용)
   - JSON 파싱 에러 방지

2. **dialogue_flow 완전 표시** (v1.19.3)
   - 4가지 대화 타입 색상 구분 (narration, character_dialogue, multiple_choice, free_input)
   - 호감도/친밀도 변화량 표시
   - AI 평가 기준 상세 표시
   - 에피소드 통계 표시

3. **에피소드 삭제 오류 수정** (v1.19.4)
   - DELETE 요청 400 Bad Request 해결
   - RESTful API 표준 준수 (쿼리 파라미터)

4. **상세보기 기능 연결** (v1.19.5)
   - stub 함수 → 실제 기능 구현
   - API 통합 및 실시간 데이터 로드
   - 메타데이터 및 상태 라벨 표시

---

### 🚀 오전 작업: 시나리오 생성 시스템 (v1.13.1 → v1.19.1)

**총 10개 버전 업데이트** - 시나리오 생성 시스템 대폭 강화

#### 핵심 기능 추가
1. **분위기 조절 시스템** (v1.14.0)
   - 3단계: 가벼움(light) / 보통(balanced) / 진지함(serious)
   - temperature 자동 조정 (0.7 ~ 0.9)
   - 분위기별 프롬프트 자동 적용

2. **AI 프롬프트 어드민 편집** (v1.16.0)
   - 실시간 프롬프트 수정 및 저장
   - ai-prompts.json 즉시 반영
   - 시나리오 생성에 바로 적용

3. **시간 개념 확장** (v1.17.0)
   - 과거/현재/미래 모두 지원
   - 예: "어제 키스했다" / "지금 데이트 중" / "내일 고백할 예정"
   - 기승전결 구조 상세화 (2-3문장)

4. **섹시 레벨 반영** (v1.18.0)
   - 5단계 자동 프롬프트 조정 (1-2: 순수 ~ 9-10: 매우 관능)
   - AI 생성 시 자동 적용

5. **메신저 대화 중심 전환** (v1.19.0)
   - 소설풍 → 단막극 스타일
   - 400-600자 짧은 배경 스토리
   - 일상 소재 강조

6. **AI 생성 스토리 편집** (v1.19.1)
   - readonly → 편집 가능
   - 생성 후 자유롭게 수정 가능
   - 저장 시 자동 반영

#### 버그 수정
- v1.13.1: 시나리오 생성 null 체크 오류 해결
- v1.14.1: 로그인 401 에러 로그 개선
- v1.15.0: 시나리오 생성 정확도 개선 (제목/설명 무시 문제 해결)
- v1.17.1: JSON 파싱 오류 수정

#### 데이터 작업
- 캐릭터 6개 업데이트 (시은_istp, 미나_isfp 등)
- 시나리오 6개 업데이트
- 사진 5개 추가

---

## 📋 시나리오 관리 시스템 현황

### 완료된 기능 ✅
1. **시나리오 CRUD**: 생성/수정/삭제/조회 완전 구현
2. **AI 자동 생성**: 기승전결 구조 + 장문 스토리 자동 생성
3. **분위기 조절**: 3단계 시스템 (가벼움/보통/진지함)
4. **AI 프롬프트 편집**: 어드민에서 실시간 수정 가능
5. **시간 개념**: 과거/현재/미래 모두 지원
6. **섹시 레벨**: 5단계 자동 프롬프트 반영
7. **GitHub API 통합**: 모든 데이터 GitHub 저장소에 영구 저장
8. **캐시 문제 해결**: 즉시 로컬 업데이트 + 지연 동기화

### 시스템 구조
```
시나리오 생성 워크플로우:
1. 제목/설명/메타데이터 입력
   - 장르 선택 (15개 감정 기반)
   - 섹시 레벨 선택 (1-10)
   - 분위기 선택 (가벼움/보통/진지함)

2. 🤖 AI 자동 생성 클릭
   → 기승전결 구조 생성 (OpenAI)
   → 장문 스토리 생성 (400-600자, 메신저 대화 배경)
   → 생성된 스토리 편집 가능

3. 저장 → GitHub API로 영구 저장
```

### 주요 파일
- `scenario-admin.html`: 통합 관리 시스템 (v1.19.5)
- `api/scenario-manager.js`: 시나리오 API
- `data/ai-prompts.json`: AI 프롬프트 설정 (v1.6.0)
- `data/scenarios/scenario-database.json`: 시나리오 DB
- `data/characters.json`: 캐릭터 DB

---

## 🎬 에피소드 관리 시스템 현황

### 완료된 기능 ✅
1. **에피소드 AI 생성**: OpenAI 기반 dialogue_flow 자동 생성
2. **에피소드 CRUD**: 생성/수정/삭제/조회 완전 구현
3. **dialogue_flow 표시**: 4가지 대화 타입 색상 구분 시스템
4. **시나리오 연동**: 시나리오 선택 시 상세 정보 미리보기
5. **상세보기 모달**: 에피소드 전체 내용 및 통계 표시
6. **호감도/친밀도 시스템**: 선택지별 변화량 표시
7. **AI 평가 기준**: 주관식 입력 평가 기준 상세 표시
8. **GitHub API 통합**: 캐릭터별 에피소드 파일 관리

### 시스템 구조
```
에피소드 생성 워크플로우:
1. 캐릭터 선택
2. 시나리오 템플릿 선택
   - 시나리오 상세 정보 미리보기
3. 생성 컨텍스트 설정
   - 기본 호감도/친밀도
   - 시나리오 길이 (짧음/보통/김)
   - AI 모델 선택
4. 🤖 AI 자동 생성 클릭
   → dialogue_flow 생성 (3-5개 대화)
   → 4가지 타입: narration, character_dialogue, multiple_choice, free_input
5. 저장 → GitHub API로 캐릭터별 에피소드 파일에 저장
```

### dialogue_flow 구조
- **narration** (노란색): 상황 설명
- **character_dialogue** (파란색): 캐릭터 대사 + 감정 + 나레이션
- **multiple_choice** (보라색): 객관식 선택지 + 호감도/친밀도 변화
- **free_input** (초록색): 주관식 입력 + AI 평가 기준

### 주요 파일
- `scenario-admin.html`: 에피소드 관리 탭 (v1.19.5)
- `api/episode-manager.js`: 에피소드 API (v2.1.0)
- `data/episodes/`: 캐릭터별 에피소드 파일 (`{character_id}_episodes.json`)

---

## 🚨 작업 규칙

### 1. 버전 업데이트 필수 체크리스트
```bash
# scenario-admin.html 수정 시 무조건 실행
1. 버전 번호 업데이트 (Line 4560)
   <span id="systemVersion">v1.x.x</span>

2. Git 커밋 및 푸시
   git add -A
   git commit -m "v1.x.x: [변경 내용]"
   git push origin main

3. CLAUDE.md 히스토리 추가

4. 테스트 URL 안내
   https://chatgame-seven.vercel.app/scenario-admin.html
```

### 2. 문서 동기화
- **PROJECT.md**: 큰 변화 시에만 수정
- **MASTER.md** (이 파일): 매 작업마다 업데이트
- **CLAUDE.md**: 버전 히스토리 추가 (append only)

---

## 🔗 중요 링크

- **배포**: https://chatgame-seven.vercel.app
- **어드민**: https://chatgame-seven.vercel.app/scenario-admin.html (비번: a6979)
- **Git**: https://github.com/EnmanyProject/chatgame

---

**작성일**: 2025-10-09
**용도**: 현재 작업 상태 및 완료 내역 추적
