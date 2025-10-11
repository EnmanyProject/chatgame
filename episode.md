# 에피소드 생성 시스템 설계

**버전**: v2.3.0 (대사 품질 향상 업그레이드)
**작성일**: 2025-10-11
**최종 업데이트**: 2025-10-11 23:00

---

## 🚨 긴급 업그레이드 계획 - AI 대사 품질 향상 v2.3.0

### 📋 업그레이드 배경

**현재 문제점:**
1. ❌ 대사가 너무 짧음 (평균 20-40자)
2. ❌ 시나리오 내용(600-900자) 대비 대화 내용이 빈약
3. ❌ 캐릭터 대사량이 부족 (현재 80% 목표이나 실제로는 부족)
4. ❌ 감정/행동 묘사가 부실

**목표:**
- 캐릭터 대사 길이: 20-40자 → **100-200자** (3-5문장)
- narration 길이: 30-50자 → **80-150자** (2-4문장)
- 연속 대사: 없음 → **3-4개씩 필수**
- 감정 묘사: 간단 → **상세 (표정/몸짓/심리)**

### 📊 작업 계획 (5단계)

#### **Phase 1: AI 프롬프트 재설계** ⭐ 최우선
**파일**: `api/episode-manager.js` (Lines 1143-1403)
**예상 시간**: 30분
**백업 위치**: `episode-upgrade-backup-phase1.md`

**변경 사항:**
```javascript
// 기존 프롬프트 (짧고 간단)
"메신저 대화 형식으로 최소 4번의 선택지를 포함한 대화를 만들어주세요."

// 개선 프롬프트 (풍부하고 상세)
"풍부하고 몰입감 있는 메신저 대화 시뮬레이션을 만들어주세요.

✅ 필수 요구사항:
1. **캐릭터 대사 길이**: 최소 3문장, 평균 100-200자
   - 예시: "안녕 ☀️ 어제 그 메시지… 다들 붙잡고 잔소리하더라고! 😅 친구들이 '너 완전히 정신 나갔어?'라면서 한참 놀렸어."
   
2. **narration 길이**: 2-4문장, 80-150자
   - 행동 묘사: "볼을 살짝 붉히며", "손가락으로 입을 가린다"
   - 심리 묘사: "메시지를 보내고 나서도 계속 화면을 응시한다"
   - 환경 묘사: "아침 햇살이 창문을 비춘다"

3. **연속 대화 패턴** (필수):
   character_dialogue (3문장) 
   → narration (심리묘사 2문장)
   → character_dialogue (2문장 + 이모티콘)
   → character_dialogue (추가 대사)
   → narration (행동묘사)
   → multiple_choice

4. **구체적 묘사 필수**:
   ❌ "시은이 메시지를 보낸다"
   ✅ "시은이 볼을 살짝 붉히며 손가락으로 입을 가리고 메시지를 타이핑한다"

5. **시나리오 배경 스토리 완전 반영**:
   ${scenarioInfo.ai_generated_context}
   위 600-900자 스토리의 모든 요소를 대화에 자연스럽게 녹여내세요!"
```

#### **Phase 2: dialogue_flow 구조 확장**
**파일**: `api/episode-manager.js`
**예상 시간**: 20분
**백업 위치**: `episode-upgrade-backup-phase2.md`

**새로운 타입 추가**: `character_dialogue_group`

```javascript
{
  "sequence": 1,
  "type": "character_dialogue_group",  // 🆕 그룹화
  "messages": [
    {
      "text": "안녕 ☀️ 어제 그 메시지… 다들 붙잡고 잔소리하더라고! 😅",
      "delay_ms": 0,
      "emotion": "embarrassed",
      "actions": ["볼을 살짝 붉히며", "휴대폰을 꼭 쥐고"]
    },
    {
      "text": "친구들이 '너 완전히 정신 나갔어?'라면서 한참 놀렸어.",
      "delay_ms": 2000,
      "emotion": "shy",
      "actions": ["고개를 살짝 숙인다"]
    },
    {
      "text": "에이, 진짜 실수였어! 그냥 장난이었는데 말이야 😳",
      "delay_ms": 1500,
      "emotion": "defensive",
      "actions": ["손가락으로 입을 가린다"]
    }
  ],
  "narration": {
    "before": "아침 햇살이 창문을 비추는 시간. 시은은 여전히 전날 보낸 메시지를 떠올리며 휴대폰을 켠다.",
    "during": "그녀의 손가락이 화면 위를 빠르게 움직인다. 메시지를 보내고 나서도 계속 화면을 응시한다.",
    "after": "답장을 기다리며 입술을 깨문다. 창밖의 햇살이 그녀의 얼굴을 비춘다."
  }
}
```

#### **Phase 3: AI 파라미터 조정**
**파일**: `api/episode-manager.js` (Lines 1300-1350)
**예상 시간**: 10분

```javascript
// 기존 파라미터
{
  model: 'gpt-4o-mini',
  temperature: 0.7,
  max_tokens: 3000
}

// 개선 파라미터
{
  model: 'gpt-4o',  // 더 강력한 모델 (옵션)
  temperature: 0.85,  // 창의성 증가
  max_tokens: 6000,  // 토큰 2배 증가 ⭐
  presence_penalty: 0.6,  // 반복 방지
  frequency_penalty: 0.3  // 다양성 증가
}
```

#### **Phase 4: 검증 로직 추가**
**파일**: `api/episode-manager.js` (새 함수 추가)
**예상 시간**: 20분

```javascript
// 대사 품질 검증 함수
function validateDialogueQuality(dialogueFlow, characterName) {
  const warnings = [];
  
  dialogueFlow.forEach(d => {
    if (d.type === 'character_dialogue') {
      // 1. 길이 체크
      if (d.text && d.text.length < 50) {
        warnings.push(`⚠️ [Seq ${d.sequence}] 대사 너무 짧음: ${d.text.length}자 (목표: 100-200자)`);
      }
      
      // 2. 이모티콘 체크
      if (!d.text || !d.text.match(/[😀-🙏]/)) {
        warnings.push(`⚠️ [Seq ${d.sequence}] 이모티콘 없음`);
      }
      
      // 3. narration 상세도 체크
      if (!d.narration || d.narration.length < 40) {
        warnings.push(`⚠️ [Seq ${d.sequence}] narration 부족: ${d.narration?.length || 0}자 (목표: 80-150자)`);
      }
      
      // 4. 행동 묘사 체크
      const hasAction = d.narration && (
        d.narration.includes('며') ||
        d.narration.includes('하며') ||
        d.narration.includes('보며')
      );
      if (!hasAction) {
        warnings.push(`⚠️ [Seq ${d.sequence}] 행동 묘사 없음`);
      }
    }
  });
  
  // 캐릭터 대사 비율 체크
  const characterDialogues = dialogueFlow.filter(d => d.type === 'character_dialogue').length;
  const total = dialogueFlow.length;
  const ratio = characterDialogues / total;
  
  if (ratio < 0.7) {
    warnings.push(`⚠️ 캐릭터 대사 비율 부족: ${(ratio*100).toFixed(1)}% (목표: 70%↑)`);
  }
  
  // 통계
  const avgTextLength = dialogueFlow
    .filter(d => d.type === 'character_dialogue' && d.text)
    .reduce((sum, d) => sum + d.text.length, 0) / characterDialogues;
  
  const avgNarrationLength = dialogueFlow
    .filter(d => d.type === 'character_dialogue' && d.narration)
    .reduce((sum, d) => sum + (d.narration?.length || 0), 0) / characterDialogues;
  
  console.log(`📊 대사 품질 통계:
  - 평균 대사 길이: ${avgTextLength.toFixed(0)}자 (목표: 100-200자)
  - 평균 narration 길이: ${avgNarrationLength.toFixed(0)}자 (목표: 80-150자)
  - 캐릭터 대사 비율: ${(ratio*100).toFixed(1)}%
  - 총 경고: ${warnings.length}개`);
  
  return { warnings, stats: { avgTextLength, avgNarrationLength, ratio } };
}
```

#### **Phase 5: 테스트 및 문서화**
**예상 시간**: 30분

1. 실제 에피소드 생성 테스트
2. 품질 비교 (Before/After)
3. Admin UI에 통계 표시
4. episode.md 문서 업데이트

---

### 💾 백업 전략

각 Phase마다 별도 백업 파일 생성:
- `episode-upgrade-backup-phase1.md` - 프롬프트 재설계
- `episode-upgrade-backup-phase2.md` - 스키마 확장
- `episode-upgrade-backup-phase3.md` - AI 파라미터
- `episode-upgrade-backup-phase4.md` - 검증 로직
- `episode-upgrade-backup-phase5.md` - 테스트 결과

**백업 내용:**
- 변경 전 코드 스냅샷
- 변경 후 코드
- 테스트 결과
- 다음 Phase 준비사항

---

### 📈 예상 결과 (Before → After)

#### Before (현재)
```json
{
  "type": "character_dialogue",
  "text": "안녕! 오늘 뭐해?",
  "narration": "시은이 메시지를 보낸다."
}
```
- 대사 길이: 11자
- narration 길이: 15자
- 감정 묘사: 없음

#### After (목표)
```json
{
  "type": "character_dialogue_group",
  "messages": [
    {
      "text": "안녕 ☀️ 어제 그 메시지… 다들 붙잡고 잔소리하더라고! 😅",
      "emotion": "embarrassed",
      "actions": ["볼을 살짝 붉히며", "휴대폰을 꼭 쥐고"]
    },
    {
      "text": "친구들이 '너 완전히 정신 나갔어?'라면서 한참 놀렸어.",
      "emotion": "shy",
      "actions": ["고개를 살짝 숙인다"]
    },
    {
      "text": "에이, 진짜 실수였어! 그냥 장난이었는데 말이야 😳",
      "emotion": "defensive"
    }
  ],
  "narration": {
    "before": "아침 햇살이 창문을 비추는 시간. 시은은 여전히 전날 보낸 메시지를 떠올리며 휴대폰을 켠다.",
    "during": "그녀의 손가락이 화면 위를 빠르게 움직인다.",
    "after": "답장을 기다리며 입술을 깨문다."
  }
}
```
- 총 대사 길이: 98자 (3문장)
- narration 길이: 124자 (3문장)
- 감정/행동 묘사: 상세

---

### ✅ Phase 체크리스트

- [x] **Phase 1: 프롬프트 재설계 완료** ✅ (2025-10-11 23:10)
  - 대사 길이 요구사항 명시 (최소 3문장, 100-200자)
  - narration 상세도 강화 (2-4문장, 80-150자)
  - 구체적 표현 가이드 추가
  - 좋은/나쁜 예시 명확화

- [x] **Phase 2: AI 파라미터 조정 완료** ✅ (2025-10-11 23:15)
  - temperature: 0.7 → 0.85 (창의성 증가)
  - max_tokens: 3000 → 6000 (토큰 2배 증가)
  - presence_penalty: 0.6 추가 (반복 방지)
  - frequency_penalty: 0.3 추가 (다양성 증가)

- [ ] Phase 3: 검증 로직 추가 (선택 사항)
- [ ] Phase 4: 테스트 및 품질 확인 ⏳ **다음 단계**
- [ ] Admin UI 업데이트 (필요 시)
- [ ] Git 커밋 ⏳ **다음 단계**
- [ ] 최종 배포 ⏳ **다음 단계**

---

## 🔄 기존 문서 내용 (v2.2.2)

---

## 📋 목차

1. [시스템 개요](#1-시스템-개요)
2. [아키텍처 다이어그램](#2-아키텍처-다이어그램)
3. [에피소드 생성 프로세스](#3-에피소드-생성-프로세스)
4. [dialogue_flow 구조](#4-dialogue_flow-구조)
5. [AI 생성 시스템](#5-ai-생성-시스템)
6. [데이터 스키마](#6-데이터-스키마)
7. [API 엔드포인트](#7-api-엔드포인트)
8. [통합 및 의존성](#8-통합-및-의존성)
9. [확장성 및 유지보수](#9-확장성-및-유지보수)

---

## 1. 시스템 개요

### 1.1 핵심 목적

에피소드 생성 시스템은 **캐릭터와 시나리오 정보를 기반으로 AI가 자동으로 대화 콘텐츠를 생성**하는 시스템입니다.

**주요 목표**:
- 🤖 **AI 기반 자동 생성**: OpenAI/Groq/Claude를 활용한 자연스러운 대화 생성
- 💕 **호감도/애정도 시스템**: 관계 수치에 따른 톤과 호칭 자동 조절
- 🎯 **시나리오 기반 콘텍스트**: 600-900자 시나리오 배경 스토리를 AI가 정확히 참고
- 📊 **다양한 대화 타입**: narration, character_dialogue, multiple_choice, free_input

### 1.2 시스템 특징

```
📖 입력: 캐릭터 정보 + 시나리오 정보 + 호감도/애정도
      ↓
🤖 AI 프로세싱: 멀티 AI 제공자 지원 (OpenAI/Groq/Claude)
      ↓
💬 출력: dialogue_flow (15-25개 대화 구성)
      ↓
💾 저장: GitHub API 캐릭터별 에피소드 파일
```

**핵심 가치**:
1. **시나리오 완전 반영**: AI가 시나리오 배경 스토리를 100% 참고
2. **캐릭터 성격 구현**: MBTI, 성격 특성, 말투, 취미를 대사에 녹여냄
3. **관계 기반 톤 조절**: 호감도/애정도에 따른 자연스러운 대화 변화
4. **캐릭터 대사 중심**: 전체 대화의 80%가 캐릭터의 대사

---

*[이하 기존 문서 내용 계속...]*

---

**작성자**: Claude Code (Sonnet 4)
**최종 검토**: 2025-10-11
**버전**: v2.3.0 (대사 품질 향상 업그레이드)
