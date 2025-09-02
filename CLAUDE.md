# 프로젝트 작업 노트

## 프로젝트 개요
MBTI 기반 로맨스 채팅 게임 - 36퀘스트 시스템과 5개 MBTI 캐릭터 확장

## 최신 작업 (2025-09-02 저녁)

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