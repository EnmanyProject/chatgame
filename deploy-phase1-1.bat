@echo off
echo 🏗️ Phase 1.1 + Claude Code 연동 시스템 배포...

echo 📦 파일 추가 중...
git add architecture.js
git add architecture-test.html  
git add .claude-code/
git add docs/
git add package.json

echo 💾 커밋 실행 중...
git commit -m "🏗️ Phase 1.1: 아키텍처 + Claude Code 연동 완성

✨ 아키텍처 모듈 (architecture.js):
- GameArchitecture 메인 클래스 (149줄)
- GameStateManager (상태 관리 + 히스토리)
- EventEmitter (이벤트 버스 시스템)  
- GameLogger (로깅 시스템)
- BaseModule (모듈 베이스 클래스)

🔗 Claude Code 연동 시스템:
- .claude-code/ 워크스페이스 구성
- 프로젝트 컨텍스트 문서화
- 단계별 작업 가이드
- 양방향 협업 플로우

🧪 테스트 환경:
- architecture-test.html (종합 테스트)
- 5개 자동 테스트 시나리오
- 실시간 로그 모니터링

📋 개발 도구:
- package.json 스크립트 추가
- 모듈 진행 상황 추적
- 자동 배포 스크립트

🎯 다음: Phase 1.2 데이터 스키마 (Claude Code 작업 가능)"

git tag -a v1.1.0 -m "🏗️ Architecture + Claude Code Integration"

echo 🚀 GitHub 푸시 중...
git push origin main
git push origin --tags

echo.
echo ✅ 배포 완료! 1-2분 후 사용 가능합니다.
echo.
echo 📍 테스트 URL: 
echo    https://chatgame-seven.vercel.app/architecture-test.html
echo.
echo 🔗 Claude Code 시작 방법:
echo    cd C:\Users\dosik\chatgame
echo    claude-code --context=".claude-code/"
echo.
echo 📋 테스트 체크리스트:
echo    1. 페이지 로드 → 자동 초기화 확인
echo    2. "전체 아키텍처 테스트" 버튼 클릭
echo    3. 모든 테스트 버튼 실행
echo    4. F12 개발자 도구에서 window.gameArchitecture 확인
echo.

pause