@echo off
REM 빠른 상태 확인 (비용 절감)

echo 📊 Quick Status Check
echo ====================
echo.
echo Files:
git status -s
echo.
echo Last commit:
git log --oneline -1
echo.
echo Branch:
git branch --show-current