@echo off
echo Fix: DataSchemaModule Conflict Resolution...

echo Adding files...
git add architecture.js
git add dataSchema-test.html

echo Committing...
git commit -m "Fix: Resolve DataSchemaModule class conflict

- Remove duplicate DataSchemaModule from architecture.js  
- Add dynamic module replacement in dataSchema-test.html
- Fix SAMPLE_DATA undefined error
- Ensure proper module loading order"

echo Pushing to GitHub...  
git push origin main

echo.
echo Fix deployed! Available in 1-2 minutes.
echo Test URL: https://chatgame-seven.vercel.app/dataSchema-test.html
echo.

pause