@echo off
cd /d "C:\Users\dosik\chatgame"

echo ===============================
echo 🔄 FORCE UPDATE v2.2.0
echo ===============================

echo Adding timestamp to force update...
echo.
echo Force adding files...
git add multi-scenario-game.html

echo.
echo Force committing with timestamp...
git commit -m "🔄 FORCE v2.2.0 - Browser Cache Fix

- Console log: v2.1.0 → v2.2.0 자연스러운 대화체 버전
- Claude API direct input integration
- Fix browser cache issue
- Timestamp: %date% %time%"

echo.
echo Force pushing...
git push origin main --force

echo.
echo ✅ Force deployment completed!
echo 🌐 Clear browser cache and test:
echo    https://chatgame-seven.vercel.app/multi-scenario-game.html
echo.
echo 🔄 Use Ctrl+F5 to force refresh browser cache
echo ⏰ Wait 1-2 minutes for Vercel deployment
pause
