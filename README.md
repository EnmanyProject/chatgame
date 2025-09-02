# 🎮 MBTI 로맨스 채팅 게임 v2.2.0

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black)](https://chatgame-seven.vercel.app)
[![Version](https://img.shields.io/badge/version-v2.2.0-blue)](https://github.com/EnmanyProject/chatgame)
[![Claude Powered](https://img.shields.io/badge/AI-Claude%203.5%20Sonnet-orange)](https://claude.ai)

> **MBTI 기반 AI 캐릭터와의 로맨스 채팅 게임**  
> 감정적 깊이와 개성을 가진 캐릭터와 대화하며 관계를 발전시키는 인터랙티브 게임

## 🌟 주요 특징

### 🧠 MBTI 기반 캐릭터 시스템
- **윤아 (INFP)**: 감성적이고 이상주의적인 20세 예술 전공생
- 성격 유형별 고유한 대화 패턴과 감정 반응
- 상황별 자연스러운 감정 변화 (부끄러움 → 진심 고백 → 안도감)

### 💬 듀얼 대화 시스템
- **선택지 모드**: 미리 정의된 선택지로 안전한 대화 진행
- **자유 채팅 모드**: 직접 입력으로 자유로운 대화 가능
- 실시간 모드 전환으로 유연한 게임플레이

### 💕 동적 호감도 시스템
- 선택과 대화에 따른 실시간 호감도 변화
- MBTI 성격 특성을 반영한 호감도 계산
- 시각적 호감도 바와 수치 표시

### 🎭 다양한 시나리오
- **어제 밤의 기억**: 술 먹고 고백한 후의 당황스러운 상황
- 각 시나리오별 고유한 스토리라인과 감정 곡선
- 36개 에피소드로 구성된 풍부한 스토리

## 🏗️ 시스템 아키텍처

### 📁 모듈 구조
```
modules/
├── core/                 # 핵심 시스템
│   ├── architecture.js   # 전체 아키텍처 관리 (302줄)
│   └── schema.js        # 데이터 스키마 & 검증 (476줄)
├── game/                # 게임 로직
│   ├── choice-logic.js  # 선택지 처리 (200줄)
│   ├── free-chat.js     # 자유 채팅 (350줄)
│   └── episode-flow.js  # 에피소드 관리 (300줄)
├── admin/               # 관리자 도구
│   └── admin-panel.js   # CRUD 관리 (350줄)
└── integration/         # 통합 시스템
    └── game-engine.js   # 메인 엔진 (400줄)
```

### 🔧 기술 스택
- **프론트엔드**: Vanilla JavaScript (ES6+ 모듈), HTML5, CSS3
- **백엔드**: Vercel Serverless Functions
- **AI 모델**: Claude 3.5 Sonnet (하드코딩된 고품질 응답)
- **배포**: Vercel + GitHub 자동 배포
- **저장**: LocalStorage + 10슬롯 저장 시스템

## 🚀 시작하기

### 온라인 플레이
바로 플레이하기: **https://chatgame-seven.vercel.app/multi-scenario-game.html**

### 로컬 개발 환경
```bash
# 저장소 클론
git clone https://github.com/EnmanyProject/chatgame.git
cd chatgame

# 로컬 서버 실행 (포트 3000)
python -m http.server 3000
# 또는 Node.js 사용시
npx serve -s . -l 3000

# 브라우저에서 접속
http://localhost:3000/multi-scenario-game-modular.html
```

## 🎯 게임플레이 가이드

### 1. 게임 시작
1. 시나리오 선택 ("어제 밤의 기억")
2. 캐릭터 선택 ("윤아 - INFP")
3. 대화 시작

### 2. 대화하기
- **선택지 모드**: 제시된 선택지 중 하나 클릭
- **자유 채팅 모드**: 직접 메시지 입력 후 전송
- 모드 전환은 언제든지 가능

### 3. 관계 발전
- 선택과 대화에 따라 호감도 변화
- 호감도에 따른 캐릭터 반응 차이
- 다양한 엔딩 달성 가능

### 4. 저장/불러오기
- 10개 저장 슬롯 + 자동 저장
- 언제든지 이전 시점으로 복원 가능

## 🛠️ 관리자 기능

### 시나리오 관리
```javascript
// 새 시나리오 생성
adminPanel.createScenario({
    title: "새로운 만남",
    description: "우연한 만남에서 시작되는 로맨스",
    setting: "카페에서의 첫 만남"
});

// 시나리오 수정
adminPanel.editScenario("scenario_id", { title: "수정된 제목" });
```

### 캐릭터 관리
```javascript
// 새 캐릭터 생성
adminPanel.createCharacter({
    name: "민지",
    mbti: "ENFP",
    personality: "밝고 활발한 성격",
    age: 22
});
```

## 🧪 테스트 시스템

### 모듈 테스트
```bash
# 전체 테스트 실행
브라우저에서 /test-final-integration.html 접속

# 개별 모듈 테스트
/test-modules.html
```

### 성능 테스트
- 모듈 로드 시간: < 1초 (우수)
- 메모리 사용량 모니터링
- API 응답 시간 측정

## 📊 버전 히스토리

### v2.2.0 (2025-09-02) - 모듈러 시스템 완성
✨ **새로운 기능**
- 완전한 모듈화 아키텍처 구현
- GameEngine 통합 엔진 시스템
- 모듈별 독립적 테스트 시스템
- 관리자 CRUD 시스템 완성

🔧 **개선사항**
- ES6+ 모듈 시스템으로 전면 전환
- 이벤트 기반 모듈간 통신
- 성능 최적화 및 메모리 관리
- 포괄적인 에러 핸들링

### v2.1.0 (2025-08-30) - Claude 3.5 Sonnet 통합
✨ **새로운 기능**
- Claude 3.5 Sonnet 품질의 대화 시스템
- MBTI 기반 감정 표현 최적화
- 체계적인 감정 진행 단계
- 향상된 한국어 로맨스 대화

🔧 **개선사항**
- API 안정성 대폭 향상
- Vercel 서버리스 환경 최적화
- 메모리 기반 스토리지 구현
- 중복 입력 방지 시스템

### v1.8.0 - 기본 게임 시스템
- 기본적인 채팅 게임 인터페이스
- 선택지 기반 대화 시스템
- LocalStorage 저장 기능
- OpenAI GPT 모델 연동

## 🔮 향후 계획

### Phase 3.0 - AI 고도화
- [ ] 실제 Claude API 통합
- [ ] 다중 캐릭터 시스템 (ENFP, INTJ, ESFJ 등)
- [ ] 컨텍스트 기반 대화 메모리
- [ ] 개인화된 대화 스타일 학습

### Phase 3.1 - 콘텐츠 확장
- [ ] 20+ 다양한 시나리오
- [ ] 계절별/상황별 특별 이벤트
- [ ] 미니게임 및 데이트 시뮬레이션
- [ ] 소셜 기능 (친구와 진행도 공유)

### Phase 3.2 - 플랫폼 확장
- [ ] 모바일 앱 (React Native)
- [ ] 데스크톱 앱 (Electron)
- [ ] 멀티플레이어 모드
- [ ] 클라우드 저장 시스템

## 🤝 기여하기

### 개발 참여
1. 이 저장소를 Fork
2. 새 브랜치 생성 (`git checkout -b feature/새기능`)
3. 변경사항 커밋 (`git commit -m '새 기능 추가'`)
4. 브랜치에 Push (`git push origin feature/새기능`)
5. Pull Request 생성

### 버그 리포트
이슈는 [GitHub Issues](https://github.com/EnmanyProject/chatgame/issues)에 등록해 주세요.

### 코드 컨벤션
- ES6+ 모듈 시스템 사용
- 한국어 코멘트 지원
- JSDoc 형식 문서화
- 에러 핸들링 필수

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

## 🙋‍♂️ 지원 및 문의

- **개발자**: dosik + Claude Code
- **AI 모델**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **이메일**: [프로젝트 이메일]
- **Discord**: [커뮤니티 서버]

## 🏆 특별 감사

- **Anthropic**: Claude 3.5 Sonnet 모델 제공
- **Vercel**: 무료 호스팅 서비스
- **GitHub**: 저장소 및 협업 도구
- **오픈소스 커뮤니티**: 다양한 라이브러리와 영감

---

<div align="center">

**💖 감정을 담은 대화, 기술로 구현하다 💖**

[게임하러 가기](https://chatgame-seven.vercel.app/multi-scenario-game.html) · 
[관리자 패널](https://chatgame-seven.vercel.app/scenario-admin.html) · 
[테스트 페이지](https://chatgame-seven.vercel.app/test-final-integration.html)

*마지막 업데이트: 2025-09-02*

</div>