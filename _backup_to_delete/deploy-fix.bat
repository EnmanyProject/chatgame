cd /d "C:\Users\dosik\chatgame"

echo 📋 Git 상태 확인 중...
git status

echo.
echo 📦 파일 추가 중...
git add multi-scenario-game-optimized.html
git add performance-optimized.js
git add deploy-v2.1.0.bat

echo.
echo 💾 커밋 실행 중...
git commit -m "v2.1.0: Performance optimized version

- Add multi-scenario-game-optimized.html
- Add performance-optimized.js  
- Response caching system
- Memory management
- Error recovery
- Performance monitoring"

echo.
echo 🚀 GitHub에 푸시 중...
git push origin main

echo.
echo ✅ 배포 완료!
echo 📍 테스트 경로: https://chatgame-seven.vercel.app/multi-scenario-game-optimized.html
echo ⏰ 1-2분 후 사용 가능

pause