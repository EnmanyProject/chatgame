# 📌 현재 작업 가이드 (MASTER)

**최종 업데이트**: 2025-10-06
**현재 Phase**: 시나리오 관리 시스템 고도화

---

## 🎯 현재 상태

**작업**: 시나리오 AI 자동 생성 시스템 완성 ✅
**버전**: v1.7.4
**상태**: 완료
**다음**: 사용자 요청 대기

---

## ✅ 최근 완료 작업

### v1.7.4 - AI 스토리 자동 생성 완성 ✅ (2025-10-06)
**작업 내용**:
- **핵심 개선**: "🤖 AI 자동 생성" 버튼 클릭 시 Acts & Beats + 소설풍 스토리 모두 자동 생성
  * 1단계: Acts & Beats 구조 생성 (OpenAI API)
  * 2단계: 구조 기반 소설풍 스토리 자동 생성 (800-1200자)
  * 생성된 스토리를 `ai_generated_context` 필드에 자동 저장

**UI 개선**:
- "📚 AI 생성 스토리" 텍스트 영역 추가 (readonly, 8줄)
- 생성 완료 시 배경색 변경으로 시각적 피드백 (#e7f3ff)
- 버튼 상태 표시: "🤖 구조 생성 중..." → "📖 스토리 생성 중..."

**워크플로우 완성**:
```
제목/설명 입력
↓
🤖 AI 자동 생성 클릭
↓
Acts & Beats 구조 생성 (백그라운드)
↓
소설풍 스토리 자동 생성 (메인 결과물)
↓
저장 → 구조 + 스토리 모두 GitHub에 저장
```

**사용자 피드백 반영**:
- "스토리 생성이 메인이야, Acts & Beats는 구조일 뿐"
- 별도 버튼이 아닌 자동 생성 프로세스에 통합

**구현 파일**:
- `scenario-admin.html` (v1.7.4)
  * Line 4920-4926: AI 생성 스토리 텍스트 영역 추가
  * Line 8816-8897: generateAIStructure() 함수 - 2단계 자동 생성
  * Line 8919, 8934: saveScenario() - ai_generated_context 저장
- `api/scenario-manager.js`
  * Line 197-227: generate_story_from_structure API 액션
  * Line 1130-1218: generateStoryFromStructure() 함수

**Git**: 커밋 `1ab2198`, `3f5c883`, 푸시 완료 ✅
**테스트**: https://chatgame-seven.vercel.app/scenario-admin.html

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
