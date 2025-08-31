@echo off
echo 🏗️ 아키텍처 모듈 v1.0.0 배포 시작...

git add architecture.js
git add architecture-test.html

git commit -m "🏗️ Phase 1-1: 게임 아키텍처 모듈 완성

✨ 주요 기능:
- GameArchitecture 핵심 클래스 구현
- GameStateManager (상태 관리, 히스토리, 롤백)
- EventEmitter (이벤트 버스 시스템) 
- GameLogger (로깅 시스템)
- BaseModule (모듈 베이스 클래스)
- 5개 핵심 모듈 인터페이스 정의

📁 새 파일:
- architecture.js (아키텍처 모듈)
- architecture-test.html (테스트 페이지)

🎯 다음: Phase 1-2 데이터 스키마 모듈"

git push origin main

echo ✅ 배포 완료! 1-2분 후 사용 가능합니다.
echo 📍 테스트 URL: https://chatgame-seven.vercel.app/architecture-test.html

pause