@echo off
cd /d "C:\Users\dosik\chatgame"

echo Adding files...
git add multi-scenario-game.html

echo Committing changes...
git commit -m "v2.2.0: Claude API direct input integration

✨ Major Improvements:
- Direct input now uses Claude 3.5 Sonnet API (not GPT)
- Real-time AI conversation for subjective questions
- MBTI-based response generation for INFP character
- Smart affection calculation (+20 max points)
- Version display updated to v2.2.0

🔧 Technical Changes:
- handleSubjectiveResponse() now calls Claude API
- Removed GPT dependency for user input
- Enhanced error handling with fallback system
- Updated console logs and UI messages

🎯 Next: Phase 2-1 Code Modularization"

echo Pushing to GitHub...
git push origin main

echo Deployment completed!
echo Test URL: https://chatgame-seven.vercel.app/multi-scenario-game.html
echo Wait 1-2 minutes for Vercel deployment
pause
