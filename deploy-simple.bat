@echo off
cd /d "C:\Users\dosik\chatgame"

echo Starting deployment...

git status

echo Adding files...
git add multi-scenario-game-optimized.html
git add performance-optimized.js
git add deploy-v2.1.0.bat

echo Committing changes...
git commit -m "v2.1.0: Performance optimization complete"

echo Pushing to GitHub...
git push origin main

echo.
echo Deployment complete!
echo Test URL: https://chatgame-seven.vercel.app/multi-scenario-game-optimized.html
echo Wait 1-2 minutes for deployment

pause