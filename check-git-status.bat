@echo off
cd /d "C:\Users\dosik\chatgame"

echo Checking git status...
git status

echo.
echo Current commit log...
git log --oneline -5

echo.
echo Checking if file is tracked...
git ls-files | grep multi-scenario-game.html

echo.
echo File content verification...
findstr /n "v2.1.0" multi-scenario-game.html
findstr /n "v2.2.0" multi-scenario-game.html

pause
