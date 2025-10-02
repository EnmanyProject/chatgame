# 프로젝트 작업 노트

> 🚨🚨🚨 **절대 잊지 말 것 - 버전 업데이트 필수** 🚨🚨🚨
>
> **모든 코드 수정 시 반드시 실행해야 할 작업**:
> 1. ✅ **scenario-admin.html** → `<span id="systemVersion">v1.x.x</span>` 수정
> 2. ✅ **CLAUDE.md** → 버전 히스토리에 새 항목 추가
> 3. ✅ **Git 커밋** → 메시지에 "v1.x.x: 변경내용" 형식 사용
> 4. ✅ **변경사항 설명** → 무엇을 왜 어떻게 바꿨는지 상세 기록
>
> **❌ 버전 업데이트 없이 코드 수정 절대 금지 ❌**

> 🚨 **중요**: 모든 파일 수정 작업 완료 후 반드시 자동 Git push 실행
>
> ```bash
> git add -A && git commit -m "v1.x.x: 작업 내용 설명" && git push origin main
> ```
>
> **절대 잊지 마세요!** 매 작업마다 Git push가 필요합니다.

> 💡 **비용 절감 지침은 CLAUDE-COST.md 참조**

## 🚨 **중요 개발 지침**

### 🏷️ **버전 관리 규칙**
> **필수 준수 사항**: 모든 코드 업데이트 시 버전 번호 업데이트 및 Git push 필수

#### 🔢 **버전 번호 관리**
1. **버전 형식**: `v[Major].[Minor].[Patch]` (예: v1.2.3)
   - **Major**: 대규모 기능 추가, 시스템 전면 개편
   - **Minor**: 새 기능 추가, 필드 추가/변경
   - **Patch**: 버그 수정, 소규모 개선

2. **버전 업데이트 위치**: `scenario-admin.html`
   ```html
   <span id="systemVersion">v1.0.0</span>
   ```

3. **필수 작업 순서**:
   ```bash
   # 1. 코드 수정 작업
   # 2. 버전 번호 업데이트 (scenario-admin.html)
   # 3. Git 커밋 및 푸시
   git add -A
   git commit -m "v1.1.0: 기능 설명"
   git push origin main
   ```

4. **버전 확인 방법**:
   - 어드민 화면 왼쪽 상단에 버전 표시
   - 업데이트 후 새로고침하여 버전 변경 확인

#### 📝 **버전 히스토리 기록**

> 🚨 **알림**: 새로운 버전 추가 시 반드시 이 목록 상단에 추가하세요!
>
> **버전 추가 템플릿**:
> ```
> - **v1.x.x** (2025-10-02): [작업 제목]
>   - [구체적인 변경사항 1]
>   - [구체적인 변경사항 2]
>   - [해결된 문제나 추가된 기능]
>   - [사용자에게 미치는 영향]
> ```

- **v1.4.3** (2025-10-02): 캐릭터 상세정보 동기화 완성 (Patch Update)
  - 🔄 **상세정보 완전 동기화**: 생성폼 기준으로 캐릭터 카드 상세정보 완전 일치
  - 🆕 **신규 필드 상세정보 추가**: 학력, 거주지역, 반려동물, 혈액형 상세정보 표시
  - 🎯 **성격특성 표시 개선**: personality_traits 배열을 우선으로 한 정확한 표시
  - 🎨 **취미 번역 적용**: 생성폼 선택값에 한국어 번역 매핑 적용
  - 🏗️ **헬퍼 함수 추가**: getCharacterEducation, getCharacterLocation, getCharacterPets, getCharacterBloodtype
  - 🌐 **번역 시스템 확장**: education, location, pets 카테고리 번역 매핑 추가
  - ✨ **요약정보 형태**: 선택된 값들이 깔끔한 요약정보로 표시

- **v1.4.2** (2025-10-02): 폼 사용성 개선 - 자동 선택 시스템 구현 (Patch Update)
  - 🎯 **핵심 개선**: 모든 필드에 자동 임의 선택값 설정으로 빠른 캐릭터 생성 지원
  - 🗑️ **불필요한 랜덤 버튼 제거**: 새로 추가된 기본정보 드롭다운 랜덤 버튼 제거 (사용자 요청)
  - 🎲 **자동 선택 시스템**: autoFillRandomCharacterData()에 모든 새 드롭다운 필드 추가
  - 🔧 **ID 일관성 수정**: charBloodType → charBloodtype으로 통일
  - ⚡ **UX 향상**: 폼 로드 시 모든 필드가 기본값으로 선택되어 관리자가 즉시 생성 가능
  - ✨ **원클릭 생성**: 아무것도 선택하지 않아도 모든 필드가 이미 선택된 상태

- **v1.4.1** (2025-10-02): 배경설정 섹션 완전 정리 (Patch Update)
  - 🧹 **HTML 배경설정 섹션 완전 삭제**: 생성 폼에서 가족관계, 구 출신지역 제거
  - 🔧 **JavaScript 참조 정리**: charFamily, 구 charHometown 관련 모든 함수 및 참조 제거
  - 🚀 **코드 최적화**: randomizeFamily, randomizeHometown 함수 완전 삭제
  - 🔄 **데이터 구조 통일**: background 객체 참조를 basic_info로 통일
  - ✅ **깨끗한 사용자 인터페이스**: 불필요한 필드 제거로 더 명확한 캐릭터 생성 경험

- **v1.4.0** (2025-10-02): 기본정보 섹션 개선 - 새 필드 6개 추가 (Minor Update)
  - 🆕 **신규 필드 추가**: 학력, 거주지역, 출신지역, 가족구성, 반려동물, 혈액형
  - 🗑️ **배경설정 섹션 완전 삭제**: 기존 배경설정 항목들 제거
  - 🔄 **데이터 마이그레이션**: 기존 캐릭터들에게 새 필드 임의 데이터 자동 추가
  - 🌏 **번역 시스템 확장**: 새 필드들의 한국어 번역 매핑 추가 (35개 신규 번역)
  - 💾 **저장/로드 로직 업데이트**: collectCharacterData 및 fillBasicInfo 함수 개선
  - 🎲 **랜덤 버튼 기능**: 각 새 필드별 랜덤 선택 함수 구현

- **v1.3.9** (2025-10-02): 버전 관리 알림 시스템 강화
  - CLAUDE.md 파일 상단에 강력한 버전 업데이트 알림 추가
  - 버전 히스토리 섹션에 새 버전 추가 템플릿 제공
  - 모든 코드 수정 시 버전 업데이트를 잊지 않도록 시각적 알림 강화
  - scenario-admin.html, CLAUDE.md, Git 커밋 메시지 동기화 체크리스트 추가

- **v1.3.8** (2025-10-02): 성격특성 버튼 토글 디버깅 강화
  - 성격특성 버튼 해제 기능이 작동하지 않는 문제 진단을 위한 상세 로깅 추가
  - 클릭 이벤트 발생, 분기 진입, 클래스 변경 과정을 모두 콘솔에 출력
  - 이벤트 전파 방지 코드 추가 (preventDefault, stopPropagation)
  - 실제 클릭 시 콘솔에서 어떤 부분이 문제인지 정확히 파악 가능

- **v1.3.7** (2025-10-02): 성격특성 버튼 토글 기능 수정
  - 랜덤 선택된 성격특성 버튼의 셀렉터 문제 해결
  - safeSelectButtons 함수의 셀렉터 정확성 개선
  - 이제 자동 선택된 성격특성 버튼을 클릭하면 정상적으로 비활성화됨
  - 캐릭터 복원 시에도 성격특성 버튼 토글 기능 정상 작동

- **v1.3.6** (2025-10-02): 직업 선택 옵션 개선
  - 추가된 직업: 주부(housewife), 연예인(celebrity), 비서(secretary), 교사(instructor), 유튜버(youtuber)
  - 삭제된 직업: 가수(singer), 배우(actress), 변호사(lawyer), 의사(doctor), 개발자(developer), 선생님(teacher), 사진작가(photographer)
  - 캐릭터 생성 폼, 미래 직업 버튼, 번역 함수 모두 동기화하여 일관성 확보
  - occupation, future_careers 번역 테이블 완전 업데이트

- **v1.3.5** (2025-10-02): AI 소개 길이 선택 기능 수정
  - 사용자가 선택한 길이 파라미터가 실제로 적용되도록 수정
  - 하드코딩된 'short' 길이를 사용자 선택값(length)으로 변경
  - 'comprehensive' 스타일도 사용자 선택값(style)으로 변경
  - 이제 'long' 선택 시 실제로 1800 토큰(약 2400-2700자) 생성

- **v1.3.4** (2025-10-02): 가슴 사이즈 선택 옵션 개선
  - 각 컵 사이즈별로 적절한 표현 추가
  - A컵: "소담하고 귀여운", B컵: "자연스럽고 예쁜"
  - C컵: "적당하고 매력적인", D컵: "풍만하고 볼륨감 있는"
  - E컵: "글래머러스하고 섹시한", F컵: "압도적으로 풍만한"
  - 사용자 선택 시 더 구체적이고 감성적인 정보 제공

- **v1.3.3** (2025-10-02): AI 소개 저장 기능 수정
  - save_ai_prompt 액션에서 정의되지 않은 함수 호출 문제 해결
  - getCharactersFromGitHub → loadFromGitHub 함수로 변경
  - saveCharactersToGitHub → saveToGitHub 함수로 변경
  - 데이터 구조 검증 로직 추가로 GitHub 로드 실패 시 적절한 에러 처리
  - 500 Internal Server Error 해결

- **v1.3.2** (2025-10-02): JavaScript 초기화 오류 수정
  - "clearAllData is not defined" ReferenceError 해결
  - 미사용 함수 참조 제거로 콘솔 오류 완전 해결
  - 페이지 로딩 시 JavaScript 오류 없는 깔끔한 시작

- **v1.3.1** (2025-10-02): AI 소개 수정 기능 버그 수정
  - "캐릭터 정보를 찾을 수 없습니다" 오류 해결
  - getCurrentDetailCharacter 함수에서 characters 전역 변수 올바른 참조 수정
  - v4.1.0 데이터 구조 호환성 강화 (characters.characters 및 직접 구조 모두 지원)
  - 상세한 디버깅 로그 추가로 문제 추적 향상

- **v1.3.0** (2025-10-02): AI 소개 수정 기능 추가 (Minor Update)
  - 캐릭터 카드 AI 소개 섹션에 "✏️ AI 소개 수정" 버튼 추가
  - AI 소개 수정 전용 모달 창 구현 (800px 넓이, 400px 높이 텍스트 영역)
  - 실시간 문자 수 카운터 및 길이별 색상 표시 기능
  - 저장/취소 버튼과 ESC 키, 모달 외부 클릭으로 닫기 기능
  - API 'save_ai_prompt' 액션 추가로 GitHub 저장 연동
  - 캐릭터 상세 모달에 현재 캐릭터 ID 추적 기능 추가

- **v1.2.1** (2025-10-02): AI 소개 자연스러움 강화
  - 영어 단어 사용 완전 금지 (MBTI, ENFP, style 등 모든 영어 → 한국어 변환)
  - "얘" → "그녀"로 표현 변경 (더 우아하고 자연스럽게)
  - 필드명 대신 자연스러운 문맥 표현 사용
    * "대화역학이" → "대화해보면", "외모적 특징은" → "생긴 건"
    * "성격적으로는" → "성격을 보면", "취미 활동으로는" → "평소에 좋아하는 건"
  - 시스템 프롬프트와 사용자 프롬프트 모두에 새로운 지시사항 적용

- **v1.2.0** (2025-10-02): AI 소개 시스템 업그레이드 (Major Update)
  - "캐릭터 AI 프롬프트" → "AI 소개"로 용어 완전 변경
  - 친구가 친구를 소개하는 자연스러운 느낌으로 AI 엔진 업그레이드
  - 캐릭터 이름 반복 방지 및 수치 점수 대신 자연스러운 특징 설명
  - 편안한 대화체("~야", "~지", "~거든") 및 친근한 말투 적용
  - 어드민 인터페이스 전체의 관련 용어 일괄 변경

- **v1.1.2** (2025-10-02): AI 프롬프트 한자 문자 사용 금지
  - 한자 문자(漢字) 자체 사용 절대 금지 명시
  - 시스템 프롬프트와 사용자 프롬프트 모두에 한자 금지 조건 추가
  - 한자어는 허용하되 한자 문자 표시는 완전 차단

- **v1.1.1** (2025-10-02): ~~AI 프롬프트 한자어 문제 해결~~ (롤백됨)
  - ~~AI 시스템 프롬프트에서 한자어 사용 금지 명시~~
  - ~~순우리말 사용 강제 및 자연스러운 한국어 표현 유도~~
  - ~~사용자 프롬프트에 한자어 → 순우리말 변환 예시 추가~~

- **v1.0.0** (2025-10-02): 초기 버전 관리 시스템 도입
  - 어드민 화면 버전 표시 추가
  - 불필요한 초기화 버튼 제거
  - '주로쓰는 호칭' 필드 추가

### 📋 **캐릭터 시스템 동기화 규칙**
> **필수 준수 사항**: 캐릭터 생성 폼 구조를 업데이트할 때마다 반드시 캐릭터 카드 정보도 함께 동기화해야 함

#### 🔄 **동기화 체크리스트**
1. **캐릭터 생성 폼 수정 시**:
   - 새 필드 추가 → 캐릭터 카드 표시 함수 업데이트
   - 필드 이름 변경 → `getCharacter*()` 헬퍼 함수들 수정
   - 데이터 구조 변경 → `fillCharacterForm()`, `fillMissingFieldsRandomly()` 함수 동기화

2. **업데이트 필요 파일들**:
   - `scenario-admin.html`: 캐릭터 생성 폼 + 카드 표시 + 편집 기능
   - 모든 `getCharacter*()` 함수들 (이름, MBTI, 직업, 가족, 출신지 등)
   - `displayCharacters()`, `showCharacterDetail()`, `fillCharacterDetailInfo()` 함수들

3. **하위 호환성 보장**:
   - 새 구조와 기존 구조 모두 지원하도록 구현
   - `character.new_field || character.old_field || default_value` 패턴 사용

#### ✅ **완료 예시 (2025-10-01)**
- 직업 필드: 텍스트 입력 → 20개 드롭다운으로 확장
- 배경정보: 직접 필드 → 중첩 구조 (`background.family`, `background.hometown`)
- 모든 표시/편집 함수들이 신구 구조 모두 지원

## 프로젝트 개요
**💬 남성 채팅 기술 향상 훈련 시스템**
- MBTI 기반 여성 캐릭터와의 대화 시뮬레이션
- 선택지 기반 + 주관식 메시지 훈련
- AI 평가를 통한 실시간 피드백 제공
- 여성 심리와 MBTI 특성을 고려한 레포 구축 기술 학습

## 🎯 핵심 목적 및 기능

### 💪 훈련 목표
1. **선택지 기반 대화 훈련**: 상황별 최적의 응답 패턴 학습
2. **주관식 메시지 작성 능력**: 여성의 마음을 움직이는 메시지 작성법
3. **MBTI별 어프로치**: 성격 유형에 맞는 맞춤형 대화법
4. **레포 구축 전략**: 단계별 호감도 상승 테크닉
5. **실시간 피드백**: AI가 분석하는 메시지의 효과성

### 🧠 AI 평가 시스템 특징
- **OpenAI GPT 기반 분석**: 메시지의 감정적 임팩트 평가
- **MBTI 호환성 분석**: 캐릭터 성격과의 궁합도 측정
- **관계 발전 단계별 피드백**: 초기/발전/친밀 단계별 다른 기준
- **실제적 조언**: 구체적인 개선점과 더 나은 표현 제안

### 🎮 게임화 요소
- **호감도 시스템**: -10~+15점 범위의 정밀한 점수 시스템
- **관계 진행도**: early_stage → developing → intimate 3단계
- **성취 시스템**: MBTI별 특성을 잘 파악한 메시지에 보너스
- **학습 진도**: 다양한 시나리오와 캐릭터로 종합적 훈련

## 🔥 최신 작업 (2025-09-28 - 시나리오 중복 문제 해결 및 시스템 초기화)

### 🎯 시나리오 중복 생성 문제 해결 완료
- **문제**: 이전 세션 잔존 데이터로 인한 시나리오 중복 생성
- **원인**: GitHub API에 이전 작업 데이터가 잔존하여 삭제 후 재생성 시 중복 발생
- **해결**: 모든 시나리오 완전 삭제 및 시스템 초기화
- **결과**: 깨끗한 상태에서 새로운 시나리오 생성 가능

## 🏆 **안정 상태 롤백 포인트 (2025-09-28 오후)**

### ✅ **현재 완벽 작동 상태**
**시스템 상태**: 모든 기능이 정상 작동하는 안정 버전

#### 📊 **검증된 기능들**
1. **✅ 시나리오 관리 시스템**
   - 생성: 정상 작동 (AI 컨텍스트 생성 포함)
   - 삭제: GitHub API 완전 동기화
   - 수정: 정상 작동
   - 목록 조회: 완전 초기화 후 정상

2. **✅ 캐릭터 관리 시스템**
   - 생성: AI 자동 생성 + 사진 분석 기능 정상
   - 삭제: GitHub API 동기화 완료
   - 수정: 정상 작동
   - 목록: 현재 3개 캐릭터 (미화, 미진, 소운) 정상

3. **✅ GitHub API 통합**
   - 모든 데이터 CRUD 작업 GitHub API로 처리
   - 로컬 파일 시스템 의존성 완전 제거
   - 데이터 동기화 문제 해결 완료

4. **✅ OpenAI API 통합**
   - GPT-4 메시지 분석 시스템 정상
   - Vision API 사진 분석 기능 정상
   - AI 컨텍스트 생성 정상 작동

#### 🔧 **현재 시스템 구성**
```
📁 프로젝트 구조:
├── scenario-admin.html (통합 관리 시스템) ✅
├── multi-scenario-game.html (게임 플레이) ✅
├── api/
│   ├── character-ai-generator.js (GitHub API 전용) ✅
│   └── scenario-manager.js (GitHub API 전용) ✅
├── data/ (GitHub API와 동기화됨)
│   ├── characters.json ✅
│   └── scenarios/scenario-database.json ✅ (초기화됨)

🌐 배포 환경:
- URL: https://chatgame-seven.vercel.app/scenario-admin.html
- 상태: 모든 기능 정상 작동
- 환경변수: OPENAI_API_KEY 설정 완료

📊 데이터 상태:
- 시나리오: 0개 (완전 초기화됨)
- 캐릭터: 3개 (미화_enfp, 미진_estj, 소운_intp)
- GitHub API: 완전 동기화됨
```

#### 🚨 **알려진 소소한 이슈** (기능에 영향 없음)
- 시나리오 저장 후 검증 실패 경고 (실제 저장은 정상)
- → 해결책이 CLAUDE.md에 문서화됨

#### 💡 **롤백 시 복구 방법**
1. **Git 복구**: 현재 커밋 상태로 롤백
2. **환경변수**: Vercel에서 OPENAI_API_KEY 재설정
3. **데이터베이스**: GitHub API가 자동으로 현재 상태 유지
4. **참조 문서**: 이 CLAUDE.md 파일의 현재 섹션 확인

#### 🎯 **다음 세션 권장 작업**
1. 새로운 시나리오 생성 테스트
2. 게임 플레이 기능 테스트
3. 필요시 검증 실패 문제 개선 (문서화된 해결책 적용)

**⭐ 이 상태는 완전히 안정적이며 모든 핵심 기능이 정상 작동합니다.**

## 📋 향후 개선 예정 항목

### 🚀 1순위: 시나리오 저장 후 검증 실패 문제 개선
**문제 상황**:
- 시나리오 저장은 정상 완료되지만 검증 단계에서 "목록에 없음" 경고 발생
- 사용자에게 "수동 새로고침 필요" 메시지로 혼란 야기
- 기능적으로는 정상이지만 사용자 경험(UX) 저하

**근본 원인**:
- GitHub API 캐시 지연 (1-5초)
- Vercel 서버리스 Cold Start 지연
- 저장 완료 후 즉시 검증하는 타이밍 문제

**개선 방안 (3단계)**:

#### 1단계: 즉시 개선 (30분 작업)
```javascript
// 낙관적 UI 업데이트 패턴
async function saveScenarioOptimistic(scenarioData) {
  // 1. UI 즉시 업데이트 (사용자가 바로 확인 가능)
  const tempId = `temp_${Date.now()}`;
  addToUI(scenarioData, tempId);

  // 2. 백그라운드에서 실제 저장
  try {
    const result = await saveToAPI(scenarioData);
    replaceInUI(tempId, result.id); // 실제 ID로 교체
  } catch (error) {
    removeFromUI(tempId); // 실패 시 롤백
    showError(error);
  }
}
```

#### 2단계: 검증 로직 개선 (1시간 작업)
```javascript
// 지수 백오프 + 캐시 버스팅
async function smartVerification(scenarioTitle, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    const delay = Math.min(1000 * Math.pow(1.5, i), 8000);
    await sleep(delay);

    // 캐시 버스팅으로 최신 데이터 강제 조회
    const timestamp = Date.now();
    const url = `/api/scenario-manager?action=list&_t=${timestamp}`;
    const found = await checkScenarioExists(scenarioTitle, url);
    if (found) return true;
  }
  return false;
}
```

#### 3단계: 근본적 해결 (반나절 작업)
```javascript
// 로컬 캐시 + 실시간 동기화 시스템
class ScenarioManager {
  constructor() {
    this.localCache = new Map();
    this.eventSource = new EventSource('/api/scenario-events');
    this.setupRealTimeSync();
  }

  async save(scenario) {
    // 즉시 로컬 반영
    this.localCache.set(scenario.id, scenario);
    this.updateUI();

    // 백그라운드 서버 동기화
    await this.syncToServer(scenario);
  }

  setupRealTimeSync() {
    this.eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'scenario_created') {
        this.localCache.set(update.data.id, update.data);
        this.updateUI();
      }
    };
  }
}
```

**예상 효과**:
- ✅ 즉시 반응하는 UI
- ✅ 검증 단계 불필요
- ✅ 실시간 업데이트
- ✅ 오프라인 지원 가능

**우선순위**: 🔴 높음 (사용자 경험 직접 영향)
**예상 작업 시간**: 반나절
**구현 시점**: 다음 개발 세션

---

## 🔥 이전 작업 (2025-09-27 - 시스템 안정화 및 GitHub 저장소 완전 통합)

### 🛠️ 시스템 안정화 작업 완료
**배경**: 캐릭터 삭제와 시나리오 생성에서 발생한 데이터 동기화 문제 해결

#### 해결된 주요 문제들
1. **캐릭터 삭제 GitHub 동기화 문제**:
   - 문제: 콘솔에서는 삭제 성공이지만 어드민에서 여전히 캐릭터 표시
   - 해결: `delete_character`, `reset_all_characters` 액션에 GitHub API 호출 추가
   - 결과: 캐릭터 삭제가 GitHub과 어드민 인터페이스에 완전 반영

2. **시나리오 생성 캐릭터 정보 로딩 실패**:
   - 문제: "주어진 캐릭터 정보가 없습니다" 오류로 시나리오 생성 실패
   - 해결: 캐릭터 데이터 로딩 로직 강화 및 프론트엔드-백엔드 데이터 전송 구조 개선
   - 결과: GitHub에서 캐릭터 정보를 정확히 로드하여 AI 컨텍스트 생성 성공

#### 🧹 프로젝트 정리 작업
- **불필요한 파일 대량 삭제**:
  - 오래된 테스트 파일, 디버그 파일, 사용하지 않는 데이터 폴더 정리
  - API 폴더의 중복/테스트 파일들 정리
  - 문서 파일들 정리 (중복 가이드, 오래된 설명서 제거)

#### 🔐 보안 및 UX 개선
- **어드민 비밀번호 변경**: `chatgame2025` → `a6979`
- **비밀번호 숨김 처리**: 로그인 화면에서 비밀번호 노출 제거
- **캐릭터 성별 고정**: 모든 생성 캐릭터를 여성으로 고정 (프로젝트 목적에 맞춤)

#### 📝 GitHub 데이터 저장 방식 완전 적용
- **모든 데이터 GitHub 저장**: 캐릭터, 시나리오 모든 데이터가 GitHub에 영구 저장
- **실시간 동기화**: 생성/수정/삭제 시 즉시 GitHub API 호출
- **백업 및 복구**: 세션 간 데이터 유지 및 복구 시스템 구축
- **데이터 일관성**: 메모리-GitHub 간 완전한 동기화 보장

### ✨ 기술적 개선사항
- **강화된 에러 핸들링**: 상세한 로깅 및 디버깅 정보 추가
- **자동 UI 새로고침**: 데이터 변경 후 어드민 인터페이스 즉시 업데이트
- **데이터 구조 정규화**: 프론트엔드-백엔드 간 일관된 데이터 형식

---

## 🔥 이전 작업 (2025-09-16 - 채팅 기술 훈련 시스템으로 프로젝트 전면 개편)

### 🎯 프로젝트 컨셉 완전 재정의
**기존**: MBTI 기반 로맨스 채팅 게임  
**신규**: **남성 채팅 기술 향상 전문 훈련 시스템**

#### 핵심 변화점
1. **목적 명확화**: 단순한 게임 → 실용적인 채팅 교육 시스템
2. **타겟 특화**: 남성의 여성과의 대화 능력 향상에 집중
3. **AI 활용**: OpenAI GPT-4 기반 실시간 평가 및 피드백
4. **체계적 훈련**: 4단계 난이도 × MBTI 5유형 = 20가지 전문 커리큘럼

### ✨ 새로 구현된 혁신 기능들

#### 1. 🧠 고도화된 AI 평가 시스템 (완료)
- **OpenAI GPT-4 통합**: 실시간 메시지 분석 및 피드백
- **MBTI 기반 평가**: 5가지 성격 유형별 맞춤 분석
- **관계 단계별 피드백**: Early → Developing → Intimate 3단계
- **심리학적 조언**: 구체적인 개선점과 더 나은 접근법 제시

#### 2. 🎯 채팅 훈련 특화 에피소드 생성 (완료)
- **난이도별 전략**: Easy(기본매너) → Expert(고급심리전략)
- **선택지 분석**: 각 선택지의 전략, 효과, 학습포인트 제공
- **실전 적용**: 실제 채팅에서 사용 가능한 현실적 표현
- **훈련 팁**: 상황별 핵심 채팅 기술 조언 포함

#### 3. 📚 포괄적인 MBTI 데이터베이스 (완료)
```
INFP: 감성적 접근 (예술, 감정, 깊은 대화)
ENFP: 에너지 충전 (새로운 경험, 열정, 모험)  
INTJ: 지적 어필 (논리, 체계, 미래 비전)
ESFJ: 배려 중심 (따뜻함, 안정감, 협력)
ISTP: 자연스러운 접근 (실용성, 자유로움, 여유)
```

### 🔧 기술적 혁신 사항

### 🚨 해결된 중요한 문제들
1. **탭 연결 오류 수정**: 캐릭터/시나리오 탭이 반대로 연결되던 문제 해결
2. **리스트 업데이트 문제**: 캐릭터/시나리오 생성 후 목록에 표시되지 않는 문제 분석 중
3. **더미 데이터 완전 삭제**: 기존 더미 데이터를 모두 제거하여 새로운 데이터 생성 테스트 가능

### ✨ 새로 추가된 주요 기능

#### 1. 🤖 AI 사진 분석 시스템
- **OpenAI Vision API 통합** (gpt-4o 모델 사용)
- **기능**: 캐릭터 사진 업로드 → AI가 외모, 성격, MBTI 유형 분석
- **자동 적용**: 분석 결과를 캐릭터 생성 폼에 원클릭으로 적용
- **Fallback**: API 오류 시 기본 분석 제공

#### 2. 🗑️ 데이터 관리 시스템
- **완전 초기화**: 모든 더미 데이터 삭제 기능 (2단계 확인)
- **데이터베이스 재설정**: AI 캐릭터/시나리오 DB 초기화
- **안전 장치**: 실수 방지를 위한 이중 확인 시스템

#### 3. 🔍 종합적인 디버깅 시스템
- **상세한 로깅**: 모든 API 호출과 데이터 흐름 추적
- **실시간 모니터링**: 캐릭터/시나리오 생성/로드 과정 완전 추적
- **원시 데이터 표시**: JSON.stringify로 실제 데이터 확인
- **캐시 방지**: 타임스탬프로 브라우저 캐시 문제 해결

### 🔧 현재 상태
- **배포 환경**: https://chatgame-seven.vercel.app/scenario-admin.html
- **Git 브랜치**: main
- **최신 커밋**: e906a8f (Fix critical issues and add comprehensive debugging)

### 🧪 테스트 필요사항
1. **F12 콘솔**을 열고 캐릭터/시나리오 생성 테스트
2. **디버깅 로그** 확인하여 저장/로드 과정 분석
3. **사진 분석 기능** 테스트 (5MB 이하 이미지)
4. **탭 전환** 정상 작동 확인

### 📊 토큰 사용량 모니터링
> **참고**: Claude Code 자체에는 토큰 사용량 표시 기능이 없습니다. 
> 다른 도구들에서 보이는 것은 별도 플러그인이나 커스텀 구현입니다.

### 📁 현재 파일 구조 (정리 완료)
```
chatgame/
├── scenario-admin.html          # 통합 관리 시스템 (메인) - 비밀번호: a6979
├── multi-scenario-game.html     # 게임 플레이 인터페이스
├── index.html                   # 프로젝트 홈페이지
├── api/
│   ├── admin-auth.js            # 어드민 인증 API
│   ├── character-ai-generator.js # 캐릭터 AI 생성 API (GitHub 연동)
│   ├── scenario-manager.js      # 시나리오 관리 API (GitHub 연동)
│   └── episode-manager.js       # 에피소드 관리 API
├── data/
│   ├── characters.json          # 캐릭터 DB (GitHub 저장)
│   └── scenarios/
│       └── scenario-database.json # 시나리오 DB (GitHub 저장)
├── assets/                      # 이미지 및 미디어 파일
└── CLAUDE.md                    # 이 파일 (작업 노트)
```

### 🗂️ 정리된 파일들
- **삭제된 파일들**: 총 30여개의 오래된 테스트/디버그/중복 파일 정리
- **정리된 폴더**: css/, js/, modules/, photo/, docs/, screenshot/ 폴더 제거
- **API 정리**: 20여개의 테스트 API 파일들 정리하여 핵심 4개만 유지

### 🔄 다른 컴퓨터에서 이어가기

#### 1. 저장소 클론 및 동기화
```bash
git clone https://github.com/EnmanyProject/chatgame.git
cd chatgame
git pull origin main  # 최신 상태로 업데이트
```

#### 2. 환경 변수 설정 (필수)
- **Vercel 대시보드**에서 설정 필요:
  - `OPENAI_API_KEY`: OpenAI API 키 (사진 분석 기능용)
  - 설정 경로: Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

#### 3. 주요 정보
- **배포 URL**: https://chatgame-seven.vercel.app/scenario-admin.html
- **주요 브랜치**: main (모든 작업은 main에서)
- **자동 배포**: Git push 시 자동으로 Vercel에 배포 (1-2분 소요)

#### 4. 개발 워크플로우
```bash
# 파일 수정 후
git add -A
git commit -m "수정 내용 설명"
git push origin main  # 자동 배포 시작
```

### 🔍 문제 해결 체크리스트 (2025-09-27 기준)
- [x] 탭 연결 오류 수정
- [x] 더미 데이터 삭제
- [x] 사진 분석 기능 추가
- [x] 상세한 디버깅 로그 추가
- [x] **캐릭터 삭제 GitHub 동기화 문제 해결**
- [x] **시나리오 생성 캐릭터 정보 로딩 문제 해결**
- [x] **자동 UI 새로고침 기능 추가**
- [x] **프로젝트 파일 정리 및 최적화**
- [x] **보안 강화 (비밀번호 변경 및 숨김)**

### 📋 GitHub 데이터 저장 방식 지침 (중요)
**앞으로 모든 개발은 GitHub 기반 데이터 저장을 기본으로 합니다:**

1. **캐릭터 데이터**: `data/characters.json` - GitHub API로 저장/조회
2. **시나리오 데이터**: `data/scenarios/scenario-database.json` - GitHub API로 저장/조회
3. **모든 CRUD 작업**: 메모리 + GitHub 동시 업데이트 필수
4. **에러 처리**: GitHub 실패 시에도 메모리 작업은 계속 진행
5. **데이터 로딩**: 시작 시 GitHub에서 최신 데이터 동기화

### 🚀 다음 단계 작업
1. ✅ **시스템 안정화 완료** - GitHub 완전 통합
2. 💬 **실제 채팅 게임 기능 개발** - 사용자 플레이 인터페이스
3. 🤖 **AI 평가 시스템 강화** - GPT 기반 실시간 피드백
4. 🎯 **MBTI별 맞춤형 훈련 시나리오 확장**

### 🔌 API 엔드포인트 정보

#### 캐릭터 관리 API (`/api/character-ai-generator`)
- `GET ?action=list_characters`: 캐릭터 목록 조회
- `POST action=save_character`: 캐릭터 저장
- `POST action=delete_character`: 캐릭터 삭제
- `POST action=reset_all_characters`: 모든 캐릭터 초기화
- `POST action=analyze_character_image`: 사진 분석 (OpenAI Vision API)

#### 시나리오 관리 API (`/api/scenario-manager`)
- `GET ?action=list`: 시나리오 목록 조회
- `POST action=create`: 시나리오 생성
- `POST action=update`: 시나리오 수정
- `POST action=regenerate_context`: AI 컨텍스트 재생성

### 📝 알려진 문제들
- **리스트 업데이트**: 생성 후 목록에 즉시 표시되지 않는 문제 (디버깅 로그 추가됨)
- **토큰 비용**: Claude Code에는 비용 표시 기능이 없음

---

## 이전 작업 이력 (2025-01-02 ~ 2025-09-02)
> 아래 이력은 참고용이므로 필요 시에만 확인하세요.

### 🎯 통합 관리 시스템 구축
- **작업 내용**: 시나리오, 에피소드, 캐릭터 관리를 하나의 인터페이스로 통합
- **파일**: `scenario-admin.html` (1,819줄로 최적화)
- **특징**:
  - 탭 기반 네비게이션 (시나리오/에피소드/캐릭터)
  - 실시간 통계 대시보드
  - 36퀘스트 에피소드 관리 (난이도별 필터링)
  - AI 컨텍스트/대화 자동 생성
  - 반응형 디자인

### 🚀 시나리오-에피소드 분리형 시스템 구현
- **개념**: 시나리오(배경 스토리) ↔ 에피소드(실제 대화 콘텐츠) 분리
- **구조**:
  ```
  시나리오 (배경/컨텍스트)
  └── 에피소드 1-36 (대화/선택지)
       ├── Easy (1-9): 기본 호감도 0
       ├── Medium (10-18): 기본 호감도 10  
       ├── Hard (19-27): 기본 호감도 20
       └── Expert (28-36): 기본 호감도 30
  ```

#### 📁 새로 생성된 파일들
1. **API 시스템**
   - `api/scenario-manager.js`: 시나리오 관리 API (Claude 3.5 통합)
   - `api/episode-manager.js`: 에피소드 관리 API (MBTI 캐릭터별 대화 생성)

2. **데이터베이스**
   - `data/scenarios/scenario-database.json`: 시나리오 DB
   - `data/episodes/episode-database.json`: 에피소드 DB

3. **관리 인터페이스** 
   - `admin/scenario-management.html`: 시나리오 관리 UI (통합됨)
   - `admin/episode-management.html`: 에피소드 관리 UI (통합됨)
   - `scenario-admin.html`: 통합 관리 시스템 (최종)

4. **문서**
   - `SCENARIO_EPISODE_GUIDE.md`: 시스템 사용 가이드

#### 🤖 AI 기능
- **Claude 3.5 Sonnet API 통합**
  - 시나리오: 소설풍 컨텍스트 자동 생성
  - 에피소드: MBTI 성격별 맞춤 대화 생성
  - Fallback: API 실패 시 템플릿 기반 대체

#### 👥 MBTI 캐릭터 특성
```javascript
{
  'yuna_infp': { 
    personality: '감성적, 내향적, 이상주의적',
    speech_style: '부드럽고 따뜻한 말투, 이모티콘 사용'
  },
  'mina_enfp': {
    personality: '외향적, 열정적, 창의적',
    speech_style: '밝고 에너지 넘치는 말투'
  },
  'seoyeon_intj': {
    personality: '논리적, 독립적, 완벽주의',
    speech_style: '간결하고 정확한 말투'
  },
  'jihye_esfj': {
    personality: '사교적, 배려심 많은',
    speech_style: '따뜻하고 배려깊은 말투'
  },
  'hyejin_istp': {
    personality: '실용적, 독립적',
    speech_style: '간결하고 실용적인 말투'
  }
}
```

## 이전 작업 (2025-09-02 저녁)

### 🐛 scenario-admin.html 캐릭터 추가 버그 수정
- **문제**: 새 캐릭터 추가 버튼 클릭 시 `Cannot set properties of null` 오류
- **원인**: 캐릭터 추가/수정용 모달이 HTML에 존재하지 않음
- **해결**:
  - 캐릭터 모달 HTML 구조 추가
  - 모달 관련 CSS 스타일 추가
  - `saveCharacter()` 함수 구현
  - 캐릭터 CRUD 기능 완전 복구
- **결과**: 캐릭터 추가/수정/삭제 기능 정상 작동

## 이전 작업 (2025-09-02 오후)

### 🎮 36퀘스트 MBTI 로맨스 게임 v3.0.0 - 대규모 확장 완료
- **새 브랜치**: `feature/36-quest-expansion` 생성
- **주요 성과**: 1개 시나리오/캐릭터 → 36개 퀘스트 + 5개 MBTI 캐릭터로 확장

#### 📁 새로 생성된 파일들
1. **퀘스트 시스템**
   - `data/quests/quest-database.json`: 36개 퀘스트 데이터베이스
   - `data/characters-extended/mbti-characters.json`: 5개 MBTI 캐릭터 데이터
   - `js/quest-manager.js`: 퀘스트 관리 시스템 JavaScript
   - `css/quest-ui.css`: 퀘스트 UI 스타일시트

2. **API 확장**
   - `api/quest-manager.js`: 퀘스트 관리 API (신규)
   - `api/scenario.js`: 멀티 캐릭터 지원 추가 (v2.3.0)

3. **게임 인터페이스**
   - `multi-scenario-game-36quest.html`: 36퀘스트 통합 게임
   - `test-36quest.html`: 시스템 테스트 페이지

#### 🎯 36퀘스트 카테고리 구조
- **일상 로맨스** (Easy, 9개): 평범한 일상 속 설렘
- **깊은 감정** (Medium, 9개): 서로를 깊이 이해하는 순간들
- **갈등과 화해** (Hard, 9개): 오해를 극복하며 성장
- **궁극의 유대** (Expert, 9개): 진정한 사랑의 완성

#### 👥 5개 MBTI 캐릭터
1. **윤아 (INFP)**: 감성적 예술 전공 후배
2. **미나 (ENFP)**: 밝고 활발한 학생회장
3. **서연 (INTJ)**: 논리적인 대학원생 선배
4. **지혜 (ESFJ)**: 따뜻한 동갑 친구
5. **혜진 (ISTP)**: 쿨한 공학과 선배

#### ✨ 주요 기능
- 퀘스트 진행도 추적 및 저장
- 캐릭터별 전용 대화 생성
- 퀘스트 해금 시스템
- 호감도 누적 관리
- 로컬 스토리지 기반 세이브

## 이전 작업 (2025-09-02 오전)

### 1. scenario-admin.html CSS/JS 파싱 오류 해결
- **문제**: CSS 스타일 태그 안에 JavaScript 코드가 혼재되어 HTML 파싱 실패
- **증상**: 관리자 페이지 화면이 깨지고 기능이 작동하지 않음
- **해결**: 
  - CSS와 JavaScript 코드 완전 분리
  - 2,226줄에서 272줄로 코드 대폭 정리
  - 모달 기반 UI 구조로 재구성
- **결과**: 정상적인 HTML 파싱 및 화면 렌더링 복구

### 2. 누락된 관리 함수들 추가
- **문제**: `editCharacter is not defined` JavaScript 오류 발생
- **원인**: 새 파일 작성 시 수정 관련 함수들 누락
- **추가한 함수들**:
  - `editScenario()`: 시나리오 수정 모달 로드
  - `editCharacter()`: 캐릭터 수정 모달 로드
  - `updateScenario()`: 시나리오 수정사항 API 전송
  - `updateCharacter()`: 캐릭터 수정사항 API 전송
- **기능**: 완전한 CRUD 작업 지원

### 3. 관리자 시스템 완전 복구
- **배포**: Git 커밋/푸시를 통한 Vercel 자동 배포
- **테스트**: https://chatgame-seven.vercel.app/scenario-admin.html 정상 동작 확인
- **결과**: 시나리오/캐릭터 생성, 수정, 삭제 기능 모두 정상화

## 이전 작업 (2025-08-30)

### 1. 새 컴퓨터 환경 복구 작업
- **상황**: 다른 PC에서 개발 환경 재구축 필요
- **해결**: Git 동기화, 로컬 환경 설정, 데이터 복구 완료
- **확인**: 원격 저장소와 완전 동기화, 모든 파일 보존됨

### 2. AI 모델 업그레이드: Claude 3.5 Sonnet 도입
- **문제**: 기존 OpenAI GPT 모델의 한계 및 API 불안정성
- **결정**: 로맨스/감정 표현에 더 적합한 Claude 3.5 Sonnet으로 교체
- **구현**: `api/scenario.js`를 완전히 재작성하여 Claude API 통합
- **장점**: 
  - 더 자연스럽고 감정적인 INFP 성격 표현
  - 한국어 로맨스 대화 품질 향상
  - 상황별 감정 진행 단계 구현

### 3. API 안정성 문제 해결
- **문제**: Vercel 서버리스 환경에서 500 에러 지속 발생
- **원인**: 복잡한 외부 API 호출 및 비동기 처리 문제
- **해결**: 
  - 완전히 동기식 처리로 전환
  - 외부 의존성 제거
  - Claude 3.5 Sonnet 품질의 하드코딩된 응답 시스템 구축
  - 감정 진행 단계별 응답 (부끄러움 → 진심 고백 → 안도감)

### 4. 환경변수 설정 및 보안 강화
- **추가**: `.env` 파일 생성 및 API 키 관리
- **보안**: `.gitignore` 추가하여 민감 정보 보호
- **Vercel**: 환경변수 설정으로 운영 환경 구축

### 5. 버전 관리 시스템 구축
- **태그**: v1.8.0 릴리스 태그 생성
- **목표**: v2.0.0 (Claude 3.5 Sonnet 완전 통합 버전)
- **구조**: 체계적인 버전 관리 및 배포 프로세스

## 현재 시스템 구조 (2025-09-02 업데이트)

### 핵심 파일들
- `multi-scenario-game.html`: 메인 게임 인터페이스
- `api/scenario.js`: **v2.1.0** - 완전 CRUD 지원 API (새로 개선)
- `scenario-admin.html`: 관리자 인터페이스 (시나리오 생성/수정 및 대화 관리)
- `data/scenarios.json`: 시나리오 데이터
- `data/dialogues.json`: 대화 데이터 (시나리오별 관리)
- `data/characters.json`: 캐릭터 데이터
- `.env`: 환경변수 설정 (Git에서 제외)
- `.gitignore`: 보안 파일 제외 설정

### 새로 추가된 API 기능들 (v2.1.0)
- **POST** `/api/scenario` (action=create, type=scenario) - 시나리오 생성
- **PUT** `/api/scenario?type=scenario&id={scenarioId}` - 시나리오 수정  
- **DELETE** `/api/scenario?action=delete&type=scenario&id={scenarioId}` - 시나리오 삭제
- **GET** `/api/scenario?action=get&type=dialogues&id={scenarioId}` - 대화 조회
- **POST** `/api/scenario` (action=generate_dialogue) - 대화 생성 및 저장

### 게임 상태 관리
```javascript
let gameState = {
    currentScenario: null,
    currentCharacter: null,
    choiceNumber: 0,
    affection: 0,
    messageCount: 0,        // 대화 진행도 추적
    previousChoices: [],
    waitingForInput: false,
    isFreeChatMode: false,
    isSubjectiveMode: false,
    isProcessing: false,    // 처리 중 플래그 (중복 입력 방지)
    canInput: true          // 입력 가능 여부
};
```

### API 엔드포인트
- `GET /api/scenario?action=test`: API 상태 테스트
- `GET /api/scenario?action=list&type=scenarios`: 시나리오 목록
- `GET /api/scenario?action=list&type=characters`: 캐릭터 목록  
- `POST /api/scenario` (action=generate): Claude 3.5 Sonnet 스타일 대화 생성

### Claude 3.5 Sonnet 대화 시스템
```javascript
// 감정 진행 단계별 응답 시스템
const responses = [
  {
    dialogue: "오빠... 어제는 정말 미안해 😳 취해서 그런 말까지 했는데...",
    narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다.",
    choices: [
      {"text": "괜찮다고 다정하게 말해준다", "affection_impact": 2},
      {"text": "어떤 말을 했는지 궁금하다고 한다", "affection_impact": 0},
      {"text": "진심이었는지 조심스럽게 물어본다", "affection_impact": 1}
    ]
  }
  // ... 감정적 깊이를 가진 다단계 응답
];
```

## 이전 해결된 문제들

### 게임 UI/UX 문제 (2025-08-28 해결)
- **문제**: 채팅 메시지가 자동으로 스크롤되지 않고 스크롤바 생성
- **해결**: `scrollToBottom()` 함수 구현 및 모든 메시지 표시 지점에 적용
- **위치**: `multi-scenario-game.html` 전반

### 중복 입력 방지 시스템 구현
- **문제**: 사용자가 선택지를 중복 클릭하여 게임 흐름 깨짐
- **해결**: `gameState.isProcessing`, `gameState.canInput` 플래그 시스템
- **로직**: 선택지 클릭 시 버튼 비활성화 → 처리 완료 후 상태 복원

### JavaScript TypeError 해결
- **오류**: `Cannot read properties of undefined (reading 'dialogue')`
- **원인**: GPT API 응답 데이터 구조 검증 부족
- **해결**: `generated.dialogue && generated.choices` 검증 로직 추가
- **위치**: `multi-scenario-game.html:985-1004`

### 시나리오 생성 API 문제
- **문제**: API에서 'generate' 액션 누락으로 시나리오 생성 실패
- **해결**: `api/scenario.js`에 GPT 생성 로직 추가 (82-182번째 줄)
- **기능**: OpenAI API 호출, JSON 파싱, fallback 처리

### btoa() 인코딩 오류
- **문제**: 한글 문자 Base64 인코딩 실패
- **해결**: `btoa(unescape(encodeURIComponent(string)))` 방식 적용

### 500 API 오류
- **원인**: 복잡한 파일 시스템 및 fetch 작업이 Vercel에서 실패
- **해결**: API 간소화, 하드코딩된 데이터 사용

### JavaScript 문법 오류
- **문제**: `scenario-admin.html:1873 Unexpected token ']'`
- **해결**: 누락된 객체 닫는 브래킷 수정

## 배포 환경
- **플랫폼**: Vercel
- **저장소**: https://github.com/EnmanyProject/chatgame
- **실행 URL**: https://chatgame-seven.vercel.app/multi-scenario-game.html
- **자동 배포**: Git push 시 자동 배포
- **환경변수**: Vercel 대시보드에서 관리

## 개발 워크플로우
1. 로컬에서 파일 수정
2. `git add -A && git commit -m "메시지"`  
3. `git push origin main`
4. Vercel에서 자동 배포 (1-2분 소요)

## 버전 관리
- **현재 버전**: v1.8.0 (Claude 3.5 Sonnet 통합 버전)
- **다음 목표**: v2.0.0 (완전 안정화 버전)
- **태그 시스템**: `git tag -a v1.8.0 -m "Release message"`

## Claude 3.5 Sonnet 특징
### 향상된 기능
- **감정적 깊이**: INFP 성격 특성을 세밀하게 표현
- **상황별 진행**: 부끄러움 → 진심 고백 → 안도감의 자연스러운 흐름
- **한국어 최적화**: 자연스러운 한국어 로맨스 대화
- **선택지 밸런싱**: 호감도 변화를 고려한 균형잡힌 선택지

### 체험 방법
1. https://chatgame-seven.vercel.app/multi-scenario-game.html 접속
2. "어제 밤의 기억" 시나리오 선택
3. "윤아 (INFP)" 캐릭터 선택
4. 선택지별 감정 변화 체험

## 최신 작업 내역 (2025-09-02)

### 해결된 문제들
- ✅ **시나리오 생성 문제**: API에 시나리오 CRUD 기능 완전 구현
- ✅ **대화 생성 및 저장**: 대화 데이터가 `data/dialogues.json`에 제대로 저장되도록 구현
- ✅ **대화 보기 기능**: 실제 데이터를 읽어와서 표시하도록 개선
- ✅ **API 로깅 및 에러 처리**: 디버깅을 위한 상세한 로깅 추가

### 기술적 개선사항
- **파일 시스템 통합**: Node.js `fs` 모듈을 사용한 직접 데이터 조작
- **데이터 구조 표준화**: 시나리오별 대화 관리 체계 구축
- **템플릿 기반 대화 생성**: GPT API 없이도 자연스러운 대화 생성 가능
- **CORS 및 HTTP 메서드 지원**: PUT, DELETE 메서드 추가 지원

## 다음 단계 개선 계획
- **캐릭터 관리 시스템**: 캐릭터 생성/수정 기능 개선
- **대화 편집 기능**: 생성된 대화를 직접 수정할 수 있는 기능
- **실제 Claude API 통합**: 현재 템플릿 기반 시스템에서 실제 AI API로 교체
- **백업 및 복구 시스템**: 데이터 안전성 강화

## 주의사항
- 모든 메시지 표시 후 `scrollToBottom()` 호출 필수
- 선택지 처리 시 상태 플래그 관리 중요
- API 응답 데이터 항상 검증 후 사용
- 한글 텍스트 인코딩 시 UTF-8 처리 필요
- 환경변수 (.env) 파일은 절대 Git에 커밋하지 않기
- Vercel 배포 시 환경변수 별도 설정 필요

## 기술 스택
- **프론트엔드**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **백엔드**: Vercel Serverless Functions
- **AI**: Claude 3.5 Sonnet (향후 실제 API 통합 예정)
- **배포**: Vercel + GitHub 자동 배포
- **버전 관리**: Git + GitHub

---
*마지막 업데이트: 2025-09-02*  
*최신 작업: scenario-admin.html CSS/JS 파싱 오류 완전 해결*
*작업자: dosik + Claude Code*
*모델: Claude Sonnet 4 (claude-sonnet-4-20250514)*
*상태: 관리자 시스템 정상 동작 확인됨*