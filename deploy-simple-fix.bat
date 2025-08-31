@echo off
cd /d "C:\Users\dosik\chatgame"

echo Adding files...
git add api/scenario.js

echo Committing changes...
git commit -m "v2.2.0: Natural dialogue improvements"

echo Pushing to GitHub...
git push origin main

echo Deployment completed!
echo Test URL: https://chatgame-seven.vercel.app/multi-scenario-game.html
echo Wait 1-2 minutes for Vercel deployment
pause
