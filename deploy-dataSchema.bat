@echo off
echo 🗃️ Phase 1.2 데이터 스키마 모듈 배포...

echo 📦 파일 추가 중...
git add dataSchema.js
git add dataSchema-test.html
git add architecture.js
git add .claude-code/

echo 💾 커밋 실행 중...
git commit -m "🗃️ Phase 1.2: 데이터 스키마 모듈 완성

✨ DataSchemaModule 클래스 (147줄):
- 4개 핵심 스키마 정의 (Character/Episode/Choice/SaveData)
- 팩토리 함수 시스템 (create 메소드)
- 검증 시스템 (validate 메소드)
- 스키마 등록/조회 시스템

📊 데이터 구조:
- CHARACTER_SCHEMA: MBTI 기반 캐릭터 (윤아 INFP)
- EPISODE_SCHEMA: 36퀘스트 에피소드 관리
- CHOICE_SCHEMA: 호감도 변화 선택지
- SAVE_DATA_SCHEMA: 게임 진행도 저장

🎮 샘플 데이터:
- 윤아(INFP, 20세) 캐릭터 완전 구현
- '어색한 아침 인사' 첫 에피소드
- 호감도 +3 선택지
- 기본 저장 데이터 구조

🧪 테스트 환경:
- dataSchema-test.html (종합 테스트)
- 9개 테스트 버튼 + 실시간 상태 모니터링
- 데이터 생성/검증 결과 표시

🔗 architecture.js 연동:
- DataSchemaModule 기본 구조 업데이트
- BaseModule 상속으로 일관성 유지

🎯 다음: Phase 1.3 게임 로직 모듈"

git tag -a v1.2.0 -m "🗃️ Data Schema Module Complete - 4 schemas + factories + validators + samples"

echo 🚀 GitHub 푸시 중...
git push origin main
git push origin --tags

echo.
echo ✅ 배포 완료! 1-2분 후 사용 가능합니다.
echo.
echo 📍 테스트 URL:
echo    https://chatgame-seven.vercel.app/dataSchema-test.html
echo.
echo 📋 테스트 체크리스트:
echo    1. 페이지 로드 → 자동 스키마 모듈 초기화
echo    2. "스키마 모듈 테스트" 버튼 → 4개 스키마 확인
echo    3. "팩토리 함수 테스트" 버튼 → 데이터 생성 확인
echo    4. "검증기 테스트" 버튼 → 검증 시스템 확인  
echo    5. "윤아 캐릭터 생성" 버튼 → 샘플 데이터 확인
echo    6. 상태 카드에서 진행률 확인
echo.
echo 🔗 Claude Code 작업 가능:
echo    cd C:\Users\dosik\chatgame
echo    claude-code --context=".claude-code/"
echo.
echo 🎯 성공 기준:
echo    - 4개 스키마 모두 등록됨
echo    - 팩토리/검증기 모두 동작
echo    - 윤아 캐릭터 데이터 완전 생성
echo    - 전체 진행률 80%+ 달성
echo.

pause