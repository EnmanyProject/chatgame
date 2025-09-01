@echo off
cd /d "C:\Users\dosik\chatgame"

echo 🚀 GameLogic v3.0.0 즉시 배포 시작...
echo.

echo 📋 Git 상태 확인...
git status

echo.
echo 📦 파일 추가...
git add modules/GameLogic.js
git add multi-scenario-game-gamelogic.html

echo.
echo 💾 커밋 실행...
git commit -m "🎮 GameLogic v3.0.0 통합 완료

✨ 핵심 기능:
- 시간 보너스 시스템 (3초 이내 +2점)
- 연속 선택 보너스 (3연속 이상)
- AI 감정 분석 자유입력 (5가지 감정)
- 친밀도 독립 시스템 (호감도와 별개)
- 특별 이벤트 트리거 (임계점 달성시)
- 게임 단계별 가중치 (초기→발전→심화→결말)

📁 신규 파일:
- modules/GameLogic.js (핵심 로직 모듈)
- multi-scenario-game-gamelogic.html (통합 게임)

🎯 성능 향상:
- 호감도 계산: 단순 증감 → 다층 보너스 시스템
- 사용자 참여: 선택지만 → 선택지 + 감정분석 자유입력
- 게임 깊이: 일차원 → 다차원 관계 발전"

echo.
echo 🏷️ 버전 태그 생성...
git tag -a v3.0.0 -m "🎮 GameLogic Module v3.0.0 Integration

Major Features:
- Time-based bonus system
- Streak bonus calculation
- AI emotion analysis for free input  
- Independent intimacy system
- Special event triggers
- Phase-based weight multipliers

Technical Improvements:
- Modular architecture
- Enhanced error handling
- Real-time debug system
- Performance optimized UI updates"

echo.
echo 🚀 GitHub 푸시...
git push origin main

echo.
echo 🏷️ 태그 푸시...
git push origin --tags

echo.
echo ✅ 배포 완료!
echo.
echo 🔗 테스트 URL (1-2분 후 사용 가능):
echo 📍 GameLogic 통합: https://chatgame-seven.vercel.app/multi-scenario-game-gamelogic.html
echo 📍 기존 버전 비교: https://chatgame-seven.vercel.app/multi-scenario-game.html
echo.
echo 🎯 새 기능 테스트 가이드:
echo - Ctrl+Shift+D: 디버그 패널
echo - 4번째마다: 자유입력 모드
echo - 3초 이내 선택: 시간 보너스
echo - 연속 긍정 선택: 연속 보너스
echo.

pause
