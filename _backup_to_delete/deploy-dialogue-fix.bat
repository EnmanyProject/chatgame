@echo off
chcp 65001 > nul
cd /d "C:\Users\dosik\chatgame"

echo ========================
echo 🗣️ Natural Dialogue Update
echo ========================

echo 📁 Adding files...
git add api/scenario.js

echo 💬 Committing changes...
git commit -m "🗣️ v2.2.0: 자연스러운 대화체 선택지 개선

✨ 주요 개선사항:
- 18개 모든 선택지를 액션 명령어에서 자연스러운 대화체로 변경
- 실제 한국 문화에 맞는 대화 표현 적용
- 감정과 뉘앙스가 담긴 자연스러운 말투
- 메신저 대화처럼 자연스러운 흐름

📊 Before: '괜찮아, 별거 아니야'
📊 After: '전혀 신경 안 써도 돼. 우리 사이인데 뭘 그래?'

🎯 다음: Phase 2-1 코드 모듈화"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Deployment completed!
echo 🌐 Test URL: https://chatgame-seven.vercel.app/multi-scenario-game.html
echo ⏰ Wait 1-2 minutes for Vercel deployment
pause
