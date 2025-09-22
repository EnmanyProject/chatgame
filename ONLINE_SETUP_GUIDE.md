# 🌐 온라인 데이터 관리 시스템 설정 가이드

## 📋 개요
기존 LocalStorage 기반 데이터 관리에서 **GitHub API 기반 온라인 데이터 관리**로 완전 전환했습니다.

### ✨ 장점
- **다중 기기 접근**: 어디서든 동일한 데이터 접근
- **영구 보존**: GitHub 저장소에 안전하게 보관
- **협업 지원**: 팀 작업 및 데이터 공유 가능
- **버전 관리**: 모든 변경사항 추적 및 복원 가능
- **백업 자동화**: GitHub의 안정적인 백업 시스템

## 🔧 필수 설정

### 1. GitHub Personal Access Token 생성

#### 📝 단계별 가이드
1. **GitHub.com 로그인** → [Settings](https://github.com/settings)
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)** 클릭
4. **토큰 설정**:
   - Note: `ChatGame Admin`
   - Expiration: `No expiration` (또는 원하는 기간)
   - Select scopes: ✅ **repo** (Full control of private repositories)
5. **Generate token** 클릭
6. **토큰 복사** (⚠️ 한 번만 표시됨)

### 2. Vercel 환경변수 설정

#### 🌐 Vercel 대시보드에서 설정
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **chatgame** 프로젝트 선택
3. **Settings** → **Environment Variables**
4. **새 환경변수 추가**:
   ```
   Name: GITHUB_TOKEN
   Value: [위에서 생성한 GitHub Token]
   Environment: Production, Preview, Development (모두 선택)
   ```
5. **Save** 클릭

### 3. 데이터 저장소 구조

#### 📁 GitHub Repository 구조
```
chatgame/
├── data/
│   ├── characters.json          # 캐릭터 데이터
│   ├── scenarios/
│   │   └── scenario-database.json  # 시나리오 데이터
│   └── episodes/
│       └── episode-database.json   # 에피소드 데이터
└── api/
    └── github-data-manager.js   # 통합 데이터 관리 API
```

## 🚀 시스템 사용법

### 초기 설정 (첫 실행 시)

1. **관리 페이지 접속**: https://chatgame-seven.vercel.app/scenario-admin.html
2. **GitHub Token 입력**: 첫 실행 시 토큰 입력 프롬프트 표시
3. **데이터 마이그레이션**: 기존 로컬 데이터가 있다면 자동 마이그레이션 제안

### 일반 사용

#### 🎭 캐릭터 관리
- **생성**: 캐릭터 탭 → 새 캐릭터 추가 → GitHub에 자동 저장
- **수정**: 캐릭터 목록에서 편집 → GitHub에 자동 업데이트
- **삭제**: 삭제 버튼 → GitHub에서 완전 제거

#### 📖 시나리오 관리
- **생성**: 시나리오 탭 → 새 시나리오 추가 → GitHub에 자동 저장
- **수정**: 시나리오 목록에서 편집 → GitHub에 자동 업데이트
- **삭제**: 삭제 버튼 → GitHub에서 완전 제거

#### 🎬 에피소드 관리
- **생성**: 에피소드 탭 → 새 에피소드 추가 → GitHub에 자동 저장
- **일괄 생성**: 36개 에피소드 자동 생성 → GitHub에 순차 저장

## 📊 실시간 모니터링

### 온라인 상태 표시기
- **🌐 온라인**: GitHub API 연결 정상
- **📴 오프라인**: 네트워크 연결 문제

### 자동 재시도 시스템
- 네트워크 오류 시 요청 큐에 저장
- 연결 복구 시 자동으로 재시도
- 데이터 무손실 보장

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. GitHub Token 오류
```
❌ 오류: GitHub Token 필요
```
**해결책**:
- Vercel 환경변수 `GITHUB_TOKEN` 확인
- GitHub Token 유효성 검증
- 토큰 권한 (`repo` scope) 확인

#### 2. API 요청 제한
```
❌ 오류: GitHub API Error: 403
```
**해결책**:
- GitHub API Rate Limit 확인 (시간당 5,000 요청)
- Personal Access Token 사용 (더 높은 제한)
- 요청 간격 조정

#### 3. 데이터 동기화 문제
```
⚠️ 캐시된 데이터 사용 중
```
**해결책**:
- 브라우저 새로고침
- 캐시 클리어 버튼 사용
- 수동 동기화 실행

### 고급 문제 해결

#### 데이터 복구
1. **GitHub 저장소 확인**: https://github.com/EnmanyProject/chatgame/tree/main/data
2. **커밋 히스토리 확인**: 변경사항 추적
3. **이전 버전 복원**: Git revert 기능 활용

#### 백업 관리
- 자동 백업: GitHub의 영구 저장
- 수동 백업: 관리 페이지에서 JSON 다운로드
- 버전 관리: Git을 통한 모든 변경사항 추적

## 🔄 마이그레이션 가이드

### LocalStorage → GitHub 자동 마이그레이션

시스템이 기존 로컬 데이터를 감지하면 자동으로 마이그레이션을 제안합니다:

1. **마이그레이션 확인 대화상자**: 기존 데이터 이전 여부 선택
2. **자동 업로드**: 로컬 데이터 → GitHub 저장소 자동 전송
3. **백업 생성**: 원본 데이터 JSON 파일로 다운로드
4. **로컬 정리**: 기존 LocalStorage 데이터 제거

### 수동 마이그레이션 (필요 시)

```javascript
// 콘솔에서 수동 실행
await window.onlineDataClient.syncAllData();
```

## 📈 성능 최적화

### 캐싱 전략
- **메모리 캐시**: 세션 동안 데이터 보존
- **요청 최적화**: 중복 요청 방지
- **배치 처리**: 여러 작업 묶어서 처리

### 네트워크 최적화
- **압축**: JSON 데이터 압축 전송
- **에러 핸들링**: 네트워크 오류 자동 처리
- **재시도 로직**: 실패한 요청 자동 재시도

## 🔐 보안 가이드

### GitHub Token 보안
- ⚠️ **토큰 노출 금지**: 토큰을 코드에 하드코딩하지 마세요
- ✅ **환경변수 사용**: Vercel 환경변수로만 관리
- 🔄 **정기 갱신**: 토큰 정기적으로 재생성
- 🗑️ **사용 중단 시**: 즉시 토큰 삭제

### 데이터 보안
- **Repository 권한**: Private 저장소 권장
- **접근 제어**: 필요한 사람만 저장소 접근
- **변경 추적**: Git을 통한 모든 변경사항 기록

## 🎯 다음 단계

### 추가 개선 계획
1. **웹훅 연동**: GitHub 변경사항 실시간 알림
2. **협업 기능**: 다중 사용자 동시 편집
3. **버전 관리**: UI에서 직접 이전 버전 복원
4. **자동 백업**: 주기적 백업 스케줄링

### 문의 및 지원
- **GitHub Issues**: https://github.com/EnmanyProject/chatgame/issues
- **개발자 연락**: dosik + Claude Code 팀

---

> 🚀 **온라인 데이터 관리 시스템으로 더욱 안정적이고 확장 가능한 채팅 훈련 시스템을 경험하세요!**