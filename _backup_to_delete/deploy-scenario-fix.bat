git add -A
git commit -m "✨ Fix scenario admin system - Implement full CRUD API

🔧 Major fixes:
- ✅ Fix scenario creation/edit/delete functionality
- ✅ Implement dialogue generation and storage system  
- ✅ Add dialogue viewing with real data from dialogues.json
- ✅ Add comprehensive error handling and logging

🆕 New API endpoints (v2.1.0):
- POST /api/scenario (action=create, type=scenario) - Create scenario
- PUT /api/scenario?type=scenario&id={id} - Update scenario
- DELETE /api/scenario?action=delete&type=scenario&id={id} - Delete scenario
- GET /api/scenario?action=get&type=dialogues&id={id} - Get dialogues
- POST /api/scenario (action=generate_dialogue) - Generate & save dialogue

📊 Test data:
- Added test scenario '🧪 테스트 시나리오' 
- Added 3 sample dialogues for testing
- Updated project documentation

Ready for testing at https://chatgame-seven.vercel.app/scenario-admin.html"
git push origin main
