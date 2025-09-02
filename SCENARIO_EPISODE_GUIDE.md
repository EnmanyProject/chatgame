# 시나리오-에피소드 시스템 사용 가이드

## 📋 시스템 개요

MBTI 로맨스 게임의 시나리오-에피소드 분리형 36퀘스트 시스템입니다.

### 주요 특징
- **시나리오**: 게임의 배경 스토리와 전체적인 컨텍스트를 관리
- **에피소드**: 각 시나리오당 36개의 대화 퀘스트를 관리
- **AI 자동 생성**: Claude 3.5 Sonnet을 활용한 자동 컨텍스트/대화 생성
- **MBTI 캐릭터**: 5명의 MBTI 성격별 캐릭터 지원

## 🚀 빠른 시작

### 1. 시나리오 관리 페이지 접속
```
/admin/scenario-management.html
```

### 2. 에피소드 관리 페이지 접속
```
/admin/episode-management.html
```

## 📝 시나리오 관리

### 새 시나리오 생성
1. "✨ 새 시나리오 만들기" 버튼 클릭
2. 필수 정보 입력:
   - **제목**: 시나리오의 제목
   - **설명**: 기본 설정과 상황 설명
   - **배경 설정**: 장소와 시간대
   - **분위기/무드**: 전체적인 감정톤
3. 사용 가능한 캐릭터 선택
4. "🤖 AI 컨텍스트 생성" 클릭하여 자동 생성
5. 저장

### 시나리오 수정
1. 시나리오 카드에서 "수정" 버튼 클릭
2. 정보 수정 후 저장

## 🎮 에피소드 관리 

### 에피소드 구조
- 총 36개 에피소드 (시나리오당)
- 난이도별 구성:
  - **Easy (1-9)**: 기본 호감도 0
  - **Medium (10-18)**: 기본 호감도 10
  - **Hard (19-27)**: 기본 호감도 20
  - **Expert (28-36)**: 기본 호감도 30

### 새 에피소드 생성
1. 시나리오 선택
2. "✨ 새 에피소드 생성" 또는 빈 에피소드 카드 클릭
3. 필수 정보 입력:
   - **에피소드 번호**: 1-36
   - **캐릭터 선택**: 5명 중 선택
   - **난이도**: 자동 설정됨
   - **상황 프롬프트**: 에피소드의 상황 설명
4. "🤖 AI 대화 생성" 클릭
5. 생성된 대화 확인 후 저장

### 캐릭터별 특성

#### 윤아 (INFP)
- 성격: 감성적, 내향적, 이상주의적, 창의적
- 말투: 부드럽고 따뜻한 말투, 이모티콘 자주 사용

#### 미나 (ENFP)
- 성격: 외향적, 열정적, 창의적, 자유로운
- 말투: 밝고 에너지 넘치는 말투, 격려 표현

#### 서연 (INTJ)
- 성격: 논리적, 독립적, 완벽주의, 전략적
- 말투: 간결하고 정확한 말투, 가끔 따뜻함

#### 지혜 (ESFJ)
- 성격: 사교적, 배려심 많은, 책임감 강한, 감정적
- 말투: 따뜻하고 배려깊은 말투, 걱정하는 표현

#### 혜진 (ISTP)
- 성격: 실용적, 독립적, 논리적, 적응적
- 말투: 간결하고 실용적인 말투, 필요한 말만

## 🔧 API 엔드포인트

### 시나리오 관리 API
```javascript
// 시나리오 목록 조회
GET /api/scenario-manager?action=list

// 시나리오 생성
POST /api/scenario-manager
{
  "action": "create",
  "scenario_id": "scenario_xxx",
  "title": "제목",
  "description": "설명",
  "background_setting": "배경",
  "mood": "분위기",
  "available_characters": ["yuna_infp", "mina_enfp"]
}

// AI 컨텍스트 재생성
POST /api/scenario-manager
{
  "action": "regenerate_context",
  "scenario_id": "scenario_xxx",
  ...
}
```

### 에피소드 관리 API
```javascript
// 에피소드 목록 조회
GET /api/episode-manager?action=list&scenario_id=xxx

// 에피소드 생성
POST /api/episode-manager
{
  "action": "create",
  "scenario_id": "scenario_xxx",
  "episode_number": 1,
  "character_id": "yuna_infp",
  "character_name": "윤아",
  "difficulty": "easy",
  "user_input_prompt": "상황 설명"
}

// AI 대화 재생성
POST /api/episode-manager
{
  "action": "regenerate_dialogue",
  "episode_id": "episode_xxx",
  ...
}
```

## 📁 파일 구조

```
chatgame/
├── api/
│   ├── scenario-manager.js    # 시나리오 관리 API
│   └── episode-manager.js     # 에피소드 관리 API
├── admin/
│   ├── scenario-management.html  # 시나리오 관리 UI
│   └── episode-management.html   # 에피소드 관리 UI
├── data/
│   ├── scenarios/
│   │   └── scenario-database.json  # 시나리오 데이터
│   └── episodes/
│       └── episode-database.json   # 에피소드 데이터
└── SCENARIO_EPISODE_GUIDE.md      # 이 문서
```

## 🌟 주요 기능

### AI 자동 생성
- **시나리오 컨텍스트**: 소설풍의 로맨틱한 배경 스토리 자동 생성
- **에피소드 대화**: 캐릭터 성격에 맞는 대화와 선택지 자동 생성
- **Fallback 시스템**: API 실패 시 템플릿 기반 대체 콘텐츠 제공

### 데이터 관리
- JSON 파일 기반 데이터베이스
- 실시간 저장 및 업데이트
- 메타데이터 자동 관리

### UI/UX 특징
- 반응형 디자인
- 직관적인 카드 기반 인터페이스
- 실시간 통계 및 진행률 표시
- 난이도별 필터링

## ⚙️ 환경 설정

### 필수 환경변수
```env
CLAUDE_API_KEY=your_claude_api_key_here
```

### Vercel 배포 설정
1. Vercel 대시보드에서 환경변수 설정
2. `api/` 폴더의 서버리스 함수 자동 인식
3. Git push 시 자동 배포

## 🐛 문제 해결

### AI 생성 실패 시
- Fallback 템플릿이 자동으로 사용됨
- 환경변수 확인 필요
- API 키 유효성 검증

### 데이터 저장 실패 시
- 파일 권한 확인
- 경로 존재 여부 확인
- JSON 형식 검증

## 📈 향후 개선 계획

1. **일괄 생성 기능**: 여러 에피소드 동시 생성
2. **캐릭터 커스터마이징**: 새로운 MBTI 캐릭터 추가
3. **대화 편집기**: 비주얼 대화 편집 도구
4. **플레이 테스트**: 관리자 페이지에서 직접 테스트
5. **분석 대시보드**: 플레이 통계 및 인기 경로 분석

## 📞 지원

문제가 발생하거나 도움이 필요한 경우:
- GitHub Issues 생성
- 프로젝트 문서 참조
- API 로그 확인

---

*최종 업데이트: 2025-01-02*
*버전: 1.0.0*
*제작: MBTI Romance Game Team*