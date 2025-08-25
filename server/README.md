# 🚀 윤아 채팅 게임 서버

Node.js Express 기반의 AI 채팅 게임 백엔드 서버입니다.

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
cd server
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# 서버 설정
PORT=3000
NODE_ENV=production

# CORS 설정
FRONTEND_URL=https://enmanyproject.github.io

# 관리자 인증
ADMIN_PASSWORD=your_secure_admin_password

# AI 설정
AI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.8
AI_MAX_TOKENS=150
```

### 3. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

## 📡 API 엔드포인트

### 사용자 API
- `POST /api/chat` - AI 채팅 메시지 생성
- `GET /health` - 서버 상태 확인

### 관리자 API (인증 필요)
- `GET /api/admin/settings` - AI 설정 조회
- `POST /api/admin/settings` - AI 설정 변경
- `GET /api/admin/stats` - 서버 통계 조회
- `POST /api/admin/reset-stats` - 통계 초기화

## 🔐 보안 기능

- **API 키 보안**: OpenAI API 키를 서버에서만 관리
- **관리자 인증**: 관리 기능에 패스워드 기반 인증
- **Rate Limiting**: DDoS 방지를 위한 요청 제한
- **CORS 설정**: 허용된 도메인에서만 접근 가능
- **Helmet**: 기본 보안 헤더 설정

## 🌐 배포 옵션

### 1. Heroku 배포
```bash
# Heroku CLI 설치 후
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_key_here
heroku config:set ADMIN_PASSWORD=your_password
heroku config:set FRONTEND_URL=https://enmanyproject.github.io
git push heroku main
```

### 2. Vercel 배포
```bash
# Vercel CLI 설치 후
vercel
# 환경 변수를 Vercel 대시보드에서 설정
```

### 3. Railway 배포
```bash
# Railway CLI 설치 후
railway login
railway init
railway up
# 환경 변수를 Railway 대시보드에서 설정
```

## 📊 모니터링

서버는 다음 메트릭을 추적합니다:
- 총 API 요청 수
- 사용된 토큰 수
- 고유 사용자 수
- 서버 가동 시간

관리자 패널(`scenario-admin.html`)에서 확인할 수 있습니다.

## 🔧 개발

### 폴더 구조
```
server/
├── routes/
│   ├── api.js          # 사용자 API
│   └── admin.js        # 관리자 API
├── server.js           # 메인 서버 파일
├── package.json        # 의존성 및 스크립트
├── .env.example        # 환경 변수 예시
└── README.md          # 이 파일
```

### 환경 변수
- `OPENAI_API_KEY`: OpenAI API 키 (필수)
- `PORT`: 서버 포트 (기본값: 3000)
- `FRONTEND_URL`: 프론트엔드 URL (CORS용)
- `ADMIN_PASSWORD`: 관리자 패스워드 (필수)
- `AI_MODEL`: 사용할 AI 모델
- `AI_TEMPERATURE`: AI 응답 창의성 (0.0-2.0)
- `AI_MAX_TOKENS`: 최대 토큰 수