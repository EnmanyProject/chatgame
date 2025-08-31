@echo off
echo 🔄 기존 파일을 성능 최적화 버전으로 교체 중...

cd /d "C:\Users\dosik\chatgame"

echo 📋 백업 생성 중...
copy multi-scenario-game.html multi-scenario-game-backup.html

echo 🔄 최적화 버전으로 교체 중...
copy multi-scenario-game-optimized.html multi-scenario-game.html

echo 💾 Git 커밋 중...
git add multi-scenario-game.html
git commit -m "🔄 Replace main file with optimized version (v2.1.0)"
git push origin main

echo.
echo ✅ 교체 완료!
echo 📍 즉시 테스트 가능: https://chatgame-seven.vercel.app/multi-scenario-game.html
echo 📄 백업 파일: multi-scenario-game-backup.html

pause