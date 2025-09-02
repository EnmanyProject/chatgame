# 시나리오 관리 시스템 수정 작업 계획

## 📅 작업 일자: 2025-09-02
## 🎯 목표: 시나리오 생성/수정, 대화 생성/저장/보기 기능 완전 구현

### 🔍 문제 분석
1. **시나리오 생성 문제**: scenario-admin.html에서 "새 시나리오 추가" 버튼 클릭시 저장되지 않음
2. **대화 생성 문제**: 대화 생성 후 data/dialogues.json에 저장되지 않음  
3. **대화 보기 문제**: 대화 보기에서 빈 데이터만 표시됨

### 🛠️ 해결 방안

#### Phase 1: API 시나리오 생성/저장 기능 구현 ✅
- [ ] api/scenario.js에 POST, PUT, DELETE 핸들러 추가
- [ ] data/scenarios.json 파일 직접 수정 가능하도록 구현
- [ ] 에러 처리 및 검증 로직 추가

#### Phase 2: 대화 생성 및 저장 시스템 구현 
- [ ] 대화 생성 시 data/dialogues.json에 저장하도록 수정
- [ ] 시나리오별 대화 관리 구조 구현
- [ ] 대화 ID 체계 정립

#### Phase 3: 대화 보기 기능 개선
- [ ] GET /api/scenario?action=get&type=dialogues&id={scenarioId} 구현
- [ ] data/dialogues.json에서 실제 데이터 읽어오기
- [ ] 편집 기능 연동

#### Phase 4: 테스트 및 검증
- [ ] 더미 시나리오 생성 테스트
- [ ] 대화 생성 및 저장 테스트
- [ ] 대화 보기 및 편집 테스트

### 📁 작업 파일들
- `api/scenario.js` - 메인 API 로직
- `data/scenarios.json` - 시나리오 데이터
- `data/dialogues.json` - 대화 데이터  
- `data/characters.json` - 캐릭터 데이터

### 🚀 실행 순서
1. Phase 1 → Phase 2 → Phase 3 → Phase 4
2. 각 Phase별로 완료 후 테스트 진행
3. 문제 발견시 즉시 수정

---
*작성자: Claude Sonnet 4*
*최종 수정: 2025-09-02*
