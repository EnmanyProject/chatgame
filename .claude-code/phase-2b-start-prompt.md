# 🚀 Phase 2-B 작업 시작 프롬프트

---

## 📋 Claude Code 작업 지시

```
안녕 Claude Code! Phase 2-B 작업을 시작하자.

[필수] 먼저 다음 문서들을 읽고 숙지해줘:
1. PHASE-1-COMPLETION-REPORT.md (Phase 1 완료 내역)
2. .claude-code/phase-2a-start-prompt.md (Phase 2-A 완료 내역)
3. .claude-code/handoff-to-claude-code.md (전체 프로젝트 개요)

[완료 확인] Phase 2-A 작업 완료:
✅ js/tone-variation-engine.js (톤 변화 엔진)
✅ data/tone-templates.json (톤 템플릿)
✅ 호감도 기반 자동 톤 변화
✅ MBTI별 스타일 적용

[Phase 2-B 목표]
사진 전송 시스템으로 시각적 보상 제공
```

---

## 🎯 Phase 2-B 작업 목표

**작업명**: 사진 전송 시스템  
**파일 생성**: 
- `js/photo-sending-system.js` (사진 전송 엔진)
- `data/photo-database.json` (사진 데이터베이스)
- `assets/photos/` (사진 저장 폴더)

**예상 시간**: 2일 작업  
**목표**: 호감도와 상황에 따라 캐릭터가 자발적으로 사진을 전송

---

## 📸 사진 전송 시스템 설계

### 사진 카테고리 (7가지)

```javascript
1. daily (일상): 카페, 음식, 풍경, 책 등
2. selfie (셀카): 가벼운 표정, 미소, 윙크 등
3. fashion (패션): 오늘의 옷, 코디, 액세서리
4. mood (무드): 분위기샷, 예술적 사진
5. intimate (친밀): 가까운 거리 셀카, 침대 등
6. sexy (섹시): 노출 높은 사진 (호감도 9+)
7. special (특별): 이벤트, 기념일, 선물 등
```

### 호감도별 사진 해금

```javascript
호감도 1-2: 사진 전송 없음
호감도 3-4: daily (20%)
호감도 5-6: daily (40%), selfie (20%), fashion (20%)
호감도 7-8: daily (20%), selfie (30%), fashion (20%), mood (20%), intimate (10%)
호감도 9-10: 모든 카테고리 (sexy 포함)
```

---

## 📝 상세 작업 내용

### 1️⃣ js/photo-sending-system.js

전체 코드는 프롬프트에 포함되어 있으며, 다음 기능을 구현:

- PhotoSendingSystem 클래스
- 사진 DB 로드 및 관리
- 호감도 기반 확률 계산
- 카테고리 선택 로직
- MBTI별 메시지 스타일
- 시간/상황 기반 트리거
- localStorage 히스토리 관리

### 2️⃣ data/photo-database.json

26장의 사진 정의:
- daily: 5장
- selfie: 4장
- fashion: 3장
- mood: 3장
- intimate: 4장
- sexy: 4장
- special: 3장

각 사진마다:
- id, category, url
- caption, min_affection
- tags, mbti_preference

### 3️⃣ assets/photos/ 폴더 구조

```
assets/photos/
├── daily/
├── selfie/
├── fashion/
├── mood/
├── intimate/
├── sexy/
└── special/
```

---

## 🔗 기존 시스템 연동

### 1. episode-delivery-system.js 수정
- 사진 메시지 타입 추가
- displayPhoto() 메서드 구현

### 2. chat-ui.html 수정
- 사진 모달 HTML 추가
- CSS 스타일 추가
- 모달 열기/닫기 함수

### 3. episode-trigger-engine.js 연동
- 사진 트리거 초기화
- 호감도 증가 시 사진 전송

---

## ✅ 완료 기준

```
□ photo-sending-system.js 생성 (~700줄)
□ photo-database.json 생성 (~600줄)
□ assets/photos/ 폴더 구조
□ 기존 시스템 완전 연동
□ 사진 전송 테스트 통과
□ 사진 모달 UI 동작
```

---

## 🚀 Git 작업

```bash
git add js/photo-sending-system.js
git add data/photo-database.json
git add assets/photos/
git add js/episode-delivery-system.js
git add chat-ui.html

git commit -m "Phase 2-B: 사진 전송 시스템 완성"

git push origin main
```

---

**작업 시작하자! Phase 2-B 화이팅! 🚀📸**
