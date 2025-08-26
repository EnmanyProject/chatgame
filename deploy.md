# 🚀 배포 가이드

윤아 채팅 게임의 서버-클라이언트 분리 배포 가이드입니다.

## 📋 배포 개요

```
[클라이언트]                    [서버]
GitHub Pages              →    Heroku/Vercel/Railway
- HTML, CSS, JS           →    - Node.js Express
- 게임 UI만 담당           →    - OpenAI API 키 관리
- 서버 API 호출           →    - AI 응답 생성
```

## 🖥️ 서버 배포 (백엔드)

### Option 1: Heroku (추천)

1. **Heroku 계정 생성 및 CLI 설치**
   ```bash
   # Heroku CLI 설치 (Windows)
   # https://devcenter.heroku.com/articles/heroku-cli 에서 다운로드
   ```

2. **서버 배포**
   ```bash
   cd server
   
   # Git 초기화 (server 폴더에서)
   git init
   git add .
   git commit -m "Initial server commit"
   
   # Heroku 앱 생성
   heroku create your-yuna-server
   
   # 환경 변수 설정
   heroku config:set OPENAI_API_KEY=sk-your-api-key-here
   heroku config:set ADMIN_PASSWORD=your-secure-password
   heroku config:set FRONTEND_URL=https://enmanyproject.github.io
   heroku config:set NODE_ENV=production
   
   # 배포
   git push heroku main
   ```

3. **배포 후 URL 기록**
   ```
   서버 URL: https://your-yuna-server.herokuapp.com
   ```

### Option 2: Vercel

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **배포**
   ```bash
   cd server
   vercel
   # 환경 변수는 Vercel 대시보드에서 설정
   ```

## 🌐 클라이언트 수정 (프론트엔드)

서버 배포 후 클라이언트에서 서버 URL을 업데이트해야 합니다.

### 1. AI Manager 수정
```javascript
// js/ai-manager.js 파일에서
this.serverUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-yuna-server.herokuapp.com'; // 👈 실제 서버 URL로 변경
```

### 2. 관리자 패널 수정
```javascript
// scenario-admin.html 파일에서
let serverUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-yuna-server.herokuapp.com'; // 👈 실제 서버 URL로 변경
```

### 3. GitHub에 커밋 및 푸시
```bash
git add .
git commit -m "서버 분리 구조로 업데이트"
git push origin master
```

## ✅ 배포 확인 체크리스트

### 서버 측
- [ ] 서버가 정상적으로 실행되는가?
- [ ] `/health` 엔드포인트가 응답하는가?
- [ ] 환경 변수가 올바르게 설정되었는가?
- [ ] CORS가 프론트엔드 도메인을 허용하는가?

### 클라이언트 측  
- [ ] 서버 URL이 올바르게 설정되었는가?
- [ ] AI 채팅이 정상 작동하는가?
- [ ] 관리자 패널이 서버에 연결되는가?
- [ ] 폴백 응답이 서버 오류 시 작동하는가?

## 🔧 테스트

### 1. 로컬 테스트
```bash
# 서버 실행
cd server
npm run dev

# 브라우저에서 테스트
# http://localhost:3000/health
```

### 2. 프로덕션 테스트
```bash
# 배포된 서버 테스트
curl https://your-yuna-server.herokuapp.com/health

# 클라이언트에서 실제 채팅 테스트
```

## 🚨 주의사항

1. **API 키 보안**
   - `.env` 파일을 Git에 커밋하지 마세요
   - 환경 변수로만 API 키 관리

2. **CORS 설정**
   - `FRONTEND_URL`을 정확한 GitHub Pages 주소로 설정
   - 여러 도메인이 필요하면 배열로 설정

3. **관리자 패스워드**
   - 강력한 패스워드 사용
   - 정기적으로 변경

## 📈 성능 최적화

1. **캐싱 전략**
   - 대화 히스토리 제한 (최근 10개)
   - 토큰 사용량 모니터링

2. **Rate Limiting**
   - 현재: 15분에 100 요청
   - 필요시 조정 가능

3. **모니터링**
   - Heroku 로그 확인: `heroku logs --tail`
   - 관리자 패널에서 통계 확인

## 🔄 업데이트 프로세스

### 서버 업데이트
```bash
cd server
# 코드 수정 후
git add .
git commit -m "서버 업데이트"
git push heroku main
```

### 클라이언트 업데이트
```bash
# 코드 수정 후
git add .
git commit -m "클라이언트 업데이트"
git push origin master
# GitHub Pages 자동 배포됨
```

## 📞 문제 해결

### 자주 발생하는 문제

1. **CORS 오류**
   - `FRONTEND_URL` 환경 변수 확인
   - 서버 재시작 후 테스트

2. **API 키 오류**
   - OpenAI API 키 유효성 확인
   - 사용량 한도 확인

3. **서버 연결 실패**
   - 서버 상태 확인: `/health` 엔드포인트
   - 네트워크 상태 확인

### 로그 확인
```bash
# Heroku 로그
heroku logs --tail --app your-yuna-server

# Vercel 로그
vercel logs your-deployment-url
```