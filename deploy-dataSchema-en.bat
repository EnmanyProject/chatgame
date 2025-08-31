@echo off
echo Phase 1.2: Data Schema Module Deployment...

echo Adding files...
git add dataSchema.js
git add dataSchema-test.html
git add architecture.js
git add .claude-code/

echo Committing...
git commit -m "Phase 1.2: Data Schema Module Complete

- DataSchemaModule class (147 lines)
- 4 core schemas (Character/Episode/Choice/SaveData)  
- Factory functions system
- Validation system
- Sample data with Yuna character
- Comprehensive test page"

git tag -a v1.2.0 -m "Data Schema Module Complete"

echo Pushing to GitHub...
git push origin main
git push origin --tags

echo.
echo Deployment complete! Available in 1-2 minutes.
echo Test URL: https://chatgame-seven.vercel.app/dataSchema-test.html
echo.

pause