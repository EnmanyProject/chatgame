@echo off
echo Quick fix for optimized version...

git add multi-scenario-game.html
git commit -m "Quick fix: Update main file to v2.1.0 optimized version"
git push origin main

echo.
echo Deployment complete!
echo Test URL: https://chatgame-seven.vercel.app/multi-scenario-game.html
echo Wait 30 seconds for Vercel deployment

pause