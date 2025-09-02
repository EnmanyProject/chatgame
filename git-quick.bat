@echo off
REM 빠른 Git 동기화 스크립트 (비용 절감용)

echo 🚀 Quick Git Sync (Cost-Optimized)
echo =====================================

REM 1. 간단한 상태 확인
echo [1/4] Checking status...
git status -s

REM 2. 변경사항이 있으면 추가
echo.
echo [2/4] Adding changes...
git add -A

REM 3. 커밋 (메시지 인자 받기)
if "%1"=="" (
    set COMMIT_MSG=Quick update
) else (
    set COMMIT_MSG=%*
)

echo [3/4] Committing: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%" --quiet

REM 4. 조용히 동기화
echo [4/4] Syncing with remote...
git pull --quiet --no-edit
git push --quiet

echo.
echo ✅ Done! Sync completed with minimal output.
echo 💰 Cost saved by using quiet mode