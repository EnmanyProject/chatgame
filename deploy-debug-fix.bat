@echo off
cd /d "C:\Users\dosik\chatgame"

echo Adding files...
git add multi-scenario-game.html

echo Committing changes...
git commit -m "🐛 v2.2.1: Fix scroll & input issues

✅ Fixed Issues:
- Improved scrollToBottom() with 3-stage scrolling
- Enhanced displaySubjectiveQuestion() input activation
- Added comprehensive debugging logs
- Fixed gameState flags for proper input handling

🔧 Technical Improvements:
- Immediate + delayed + final scroll system
- Clear state management for input container
- Focus and scroll coordination
- Input validation and error prevention

🧪 Debug Features:
- Console logs for troubleshooting
- Real-time state tracking
- Step-by-step process monitoring"

echo Pushing to GitHub...
git push origin main

echo Deployment completed!
echo Test URL: https://chatgame-seven.vercel.app/multi-scenario-game.html
echo Wait 1-2 minutes for Vercel deployment

echo.
echo 🧪 Test Instructions:
echo 1. Play until 4th turn (subjective question)
echo 2. Check console logs (F12)
echo 3. Verify complete scroll to top when input appears
echo 4. Verify input field activation and focus
echo 5. Test direct input with Claude API
pause
