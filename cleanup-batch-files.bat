REM 파일 정리 스크립트 - 중복 배치 파일 삭제

echo 🗑️ 오래된 배치 파일들 삭제 중...

del "deploy-dialogue-fix.bat"
del "deploy-v2.1.0.bat" 
del "deploy-claude-api.bat"
del "force-deploy-v2.2.0.bat"
del "deploy-fix.bat"
del "git_commit.bat"
del "replace-main.bat"
del "deploy-simple.bat"
del "deploy-simple-fix.bat"
del "check-git-status.bat"
del "quick-deploy.bat"

echo ✅ 오래된 배치 파일 삭제 완료!
