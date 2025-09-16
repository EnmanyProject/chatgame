# 🚀 상용화 배포 가이드

## 1. OpenAI API 키 설정

### 1.1 API 키 발급
1. [OpenAI Platform](https://platform.openai.com) 방문
2. 회원가입 또는 로그인
3. API Keys 섹션에서 새 키 생성
4. 키를 안전한 곳에 저장

### 1.2 Vercel 환경변수 설정
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수 추가:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NODE_ENV=production
   ```

## 2. 로컬 개발환경 설정

### 2.1 환경변수 파일 생성
```bash
# .env 파일 생성 (.env.example 복사)
cp .env.example .env

# .env 파일 편집
OPENAI_API_KEY=your_actual_api_key_here
NODE_ENV=development
```

### 2.2 개발 서버 실행
```bash
# Live Server 또는
vercel dev
```

## 3. AI 시스템 모니터링

### 3.1 로그 확인
- Vercel Functions 로그에서 AI API 호출 상태 확인
- 콘솔에서 `🤖`, `✅`, `❌` 마커로 상태 파악

### 3.2 Fallback 시스템
- API 실패 시 자동으로 템플릿 기반 컨텍스트 생성
- 사용자에게는 끊임없는 서비스 제공

## 4. 상용화 체크리스트

- [x] ✅ OpenAI API 키 설정
- [x] ✅ 환경변수 구성  
- [x] ✅ 오류 처리 시스템
- [x] ✅ 로깅 시스템
- [ ] 🔄 요금 모니터링 알림
- [ ] 🔄 API 사용량 대시보드
- [ ] 🔄 백업 시스템

## 5. 비용 관리 (OpenAI GPT-4o-mini)

### API 사용량 예측
- 시나리오 1개 생성: ~500 토큰 (약 $0.0003)
- 월 1000개 시나리오: ~$0.30
- 월 10,000개 시나리오: ~$3.00
- **매우 경제적**: Claude 대비 약 95% 비용 절감

### 모델 특징
- **GPT-4o-mini**: 빠른 속도, 저렴한 비용
- **한국어 품질**: 우수한 한국어 이해 및 생성
- **로맨스 장르**: 감성적 표현에 특화

### 모니터링 도구
- OpenAI Platform에서 사용량 추적
- Vercel Analytics로 트래픽 모니터링

## 6. 보안

- ✅ API 키는 환경변수로만 관리
- ✅ .env 파일은 Git에 커밋 금지
- ✅ 클라이언트 사이드에 키 노출 금지