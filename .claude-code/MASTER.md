# 📌 현재 작업 가이드 (MASTER)

**최종 업데이트**: 2025-10-07
**현재 Phase**: 시나리오 생성 시스템 안정화 완료

---

## 🎯 현재 상태

**작업**: 시나리오 생성 시스템 타임아웃 해결 및 AI 프롬프트 개선 완료 ✅
**버전**: v1.10.6
**상태**: 완료
**다음**: 사용자 요청 대기

---

## ✅ 최근 완료 작업

### v1.10.6 - AI 프롬프트 개선 (캐릭터 정보 불필요 명시) ✅ (2025-10-07)
**작업 내용**:
- **문제**: GPT가 "캐릭터 정보가 없다"며 스켈레톤 구조 생성 거부
- **해결**: AI 프롬프트에 "캐릭터 정보 불필요, 일반 표현으로 작성" 지시 추가
- **영향**: 기승전결 구조 및 스토리 생성 시 캐릭터 정보 없이 작동

**Git**: 커밋 `fbe15cb`, 푸시 완료

---

### v1.10.5 - AI 생성 거부 메시지 카드 표시 ✅ (2025-10-07)
**작업 내용**:
- AI가 거부한 경우 시나리오 카드에 빨간색 경고 박스 표시
- 거부 이유 전체 텍스트 표시
- 해결 방법 안내 추가 ("더 완곡한 표현 사용")

**Git**: 커밋 `40a0908` + merge `2a91a64`, 푸시 완료

---

### v1.10.4 - Vercel 타임아웃 문제 해결 ✅ (2025-10-07)
**작업 내용**:
- **문제**: Step 2 (스토리 생성) 시 Vercel 10초 타임아웃 발생
- **해결**: max_tokens 1500→1000, 목표 길이 800-1200자→600-900자
- **결과**: 타임아웃 완전 해결, 10초 이내 정상 응답

**Git**: 커밋 `7a4480c`, 푸시 완료
**테스트**: ✅ 성공 (TEST_REPORT_v1.10.4.md 참조)

---

### v1.10.3 - beats 배열 옵셔널 처리 ✅ (2025-10-07)
**작업 내용**:
- **문제**: `structure.ki.beats.map()` 호출 시 undefined 에러
- **해결**: beats 배열 존재 여부 체크 후 처리
- **영향**: 기승전결 구조 → 스토리 생성 정상 작동

**Git**: 커밋 `7507f6b`, 푸시 완료

---

### v1.10.2 - 기승전결 → 장문 스토리 자동 생성 완성 ✅ (2025-10-07)
**작업 내용**:
- **핵심 개선**: "🤖 AI 자동 생성" 버튼 클릭 시 기승전결 구조 + 장문 소설풍 스토리 모두 자동 생성
  * 1단계: 기승전결 구조 생성 (OpenAI API)
  * 2단계: 구조 → 장문 소설풍 스토리 자동 생성 (800-1200자)
  * 생성된 스토리를 `ai_generated_context` 필드에 자동 저장

**핵심 컨셉**:
- 기승전결 구조는 **편집 도구** (내부 구조)
- 장문 스토리는 **실제 시나리오** (사용자가 보는 것)
- 모든 시나리오는 **"이미 벌어진 일"에 대한 메신저 대화**

**UI 개선**:
- "📚 AI 생성 스토리" 텍스트 영역 (8줄)
- 생성 완료 시 배경색 변경으로 시각적 피드백 (녹색)
- 버튼 상태 표시: "🤖 AI 생성 중..." → "📖 스토리 생성 중..."

**워크플로우 완성**:
```
제목/설명/장르 입력
↓
🤖 AI 자동 생성 클릭
↓
기승전결 구조 생성 (OpenAI)
  → 기(起): 도입
  → 승(承): 전개
  → 전(轉): 위기
  → 결(結): 결말
↓
장문 소설풍 스토리 자동 생성 (OpenAI)
  → 자연스럽게 연결된 한 덩어리 텍스트
  → 사건 후 메신저 대화 컨셉 반영
↓
저장 → 구조 + 스토리 모두 GitHub에 저장
```

**사용자 피드백 반영**:
- "기승전결을 기반으로 시나리오가 필요함 (대화 자체는 아님)"
- "장문으로 표현되어야 함" (연결된 스토리)
- "1번 방식: 기승전결 구조 먼저 생성 → 그 구조를 바탕으로 장문 스토리 자동 생성"

**구현 파일**:
- `scenario-admin.html` (v1.10.2)
  * Line 4340: 버전 v1.10.2
  * Line 9287-9327: generateAIStoryStructure() - 2단계 자동 생성
- `api/scenario-manager.js`
  * Line 1419-1524: generateStoryFromKiSeungJeonGyeol() 함수
  * Line 262-292: generate_story_from_ki_seung_jeon_gyeol API 액션

**Git**: 커밋 `42008c3`, `556cad5`, `27b7033`, 푸시 완료 ✅
**테스트**: https://chatgame-seven.vercel.app/scenario-admin.html

### v1.10.1 - AI 시나리오 생성 엔진 수정 ✅ (2025-10-07)
**작업 내용**:
- AI 프롬프트 핵심 개념 추가: **"이미 벌어진 일"에 대한 대화 생성**
- 사건이 벌어지는 과정(❌) → 사건 후 대화 내용(✅)
- 명확한 예시 추가 및 프롬프트 규칙 강화
- generateScenarioStructure, generateKiSeungJeonGyeolStructure 양쪽 적용

### v1.10.0 - 감정 기반 장르 시스템 도입 ✅ (2025-10-07)
**작업 내용**:
- 15개 감정 기반 장르로 완전 교체 (분노, 질투, 짝사랑, 유혹, 그리움, 화해, 설렘, 불안, 집착, 체념, 용기, 유대, 죄책감, 거절, 회피)
- 각 장르별 감정 흐름 패턴 정의 및 AI 프롬프트 통합
- 장르 표시 한글화 (genreNames 매핑)

---

### v1.7.3 - GitHub API 캐시 문제 해결 ✅ (2025-10-06)
**작업 내용**:
- GitHub API 캐시로 인한 데이터 불일치 문제 해결
  * 저장 후 즉시 로컬 window.scenarios 업데이트
  * GitHub 응답(result.scenario) 사용하여 정확한 데이터 반영
  * 3초 후 GitHub 재로드로 완전 동기화 확인
- 사용자 경험 개선
  * "술김에 한 키스" 저장 시 즉시 화면에 표시
  * 3초 후 GitHub 동기화 완료 메시지
  * 더 이상 이전 데이터 표시 안 됨

**기술적 해결**:
```javascript
// BEFORE: GitHub 캐시된 데이터 표시
await loadScenarios(); // ❌ 즉시 호출하면 캐시된 데이터 로드

// AFTER: 즉시 로컬 업데이트 + 지연된 GitHub 동기화
globalScenarios[scenarioId] = result.scenario; // ✅ API 응답 즉시 반영
displayScenarios(); // ✅ 즉시 UI 업데이트
setTimeout(() => loadScenarios(), 3000); // ✅ 3초 후 GitHub 동기화
```

**Git**: 커밋 `198e19b`, 푸시 완료

---

### v1.7.2 - Acts & Beats 화면 통합 및 AI 자동 생성 ✅ (2025-10-06)
**작업 내용**:
- Acts & Beats 탭 제거 및 한 화면 통합
  * scenario-tab-basic과 scenario-tab-structure 탭 구조 완전 제거
  * Acts & Beats 섹션을 기본 정보 폼 하단에 직접 배치
  * switchScenarioTab() 함수 삭제
- AI 자동 생성 함수 구현 (generateAIStructure())
  * 제목/설명 기반 OpenAI API 호출
  * 생성된 구조를 currentScenarioStructure에 적용
  * renderActsStructure() 즉시 호출하여 화면 표시
  * 버튼 상태 관리 (생성 중... 표시)
- 모달 초기화 로직 개선
  * 생성/편집 모드 모두 자동 렌더링
- CLAUDE.md에 필수 작업 체크리스트 강력 추가
  * 버전 업데이트 절차 명시
  * Git push 및 테스트 URL 안내 필수화

**Git**: 커밋 `f384bcd`, 푸시 완료

---

## 📋 시나리오 관리 시스템 현황

### 완료된 기능 ✅
1. **시나리오 CRUD**: 생성/수정/삭제/조회 완전 구현
2. **AI 자동 생성**: Acts & Beats 구조 자동 생성
3. **AI 스토리 생성**: 구조 기반 소설풍 배경 스토리 생성
4. **GitHub API 통합**: 모든 데이터 GitHub 저장소에 영구 저장
5. **캐시 문제 해결**: 즉시 로컬 업데이트 + 지연 동기화
6. **메타데이터 시스템**: 장르, 섹시 레벨, AI 모델, 태그, 플레이 시간
7. **Acts & Beats 편집**: 인라인 구조 편집 (Act/Beat 추가/삭제/수정)

### 시스템 구조
```
시나리오 생성 워크플로우:
1. 제목/설명/메타데이터 입력
2. 🤖 AI 자동 생성 클릭
   → Acts & Beats 구조 생성
   → 소설풍 스토리 생성
3. 필요시 Acts & Beats 수동 편집
4. 저장 → GitHub API로 영구 저장
```

### 데이터 파일
- `data/scenarios/scenario-database.json`: 시나리오 DB
- `data/characters.json`: 캐릭터 DB
- GitHub API를 통한 실시간 동기화

---

## 🚨 작업 규칙

### 1. 버전 업데이트 필수 체크리스트
```bash
# scenario-admin.html 수정 시 무조건 실행
1. 버전 번호 업데이트 (Line 4340)
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

**작성일**: 2025-10-06
**용도**: 현재 작업 상태 및 완료 내역 추적
