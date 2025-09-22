# 🔐 Secure API Key Storage Setup Guide

## 개요
Vercel 서버리스 환경에서 API 키를 안전하게 저장하고 관리하는 시스템입니다.
GitHub를 영구 저장소로 사용하여 AES-256 암호화로 API 키를 보호합니다.

## 🔧 Vercel 환경 변수 설정 (필수)

Vercel 대시보드에서 다음 환경변수를 설정해야 합니다:

### 1. GitHub Personal Access Token
```
변수명: GITHUB_TOKEN
값: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
권한: Contents (read/write), Metadata (read)
```

**토큰 생성 방법:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. 권한 선택:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `write:repo_hook` (Write repository hooks)
4. 생성된 토큰을 복사하여 Vercel 환경변수에 설정

### 2. API 암호화 키
```
변수명: API_ENCRYPTION_KEY
값: (32자 이상의 랜덤 문자열)
예시: my-super-secret-encryption-key-2025-chatgame-secure
```

**키 생성 방법:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# 또는 수동으로 32자 이상의 복잡한 문자열 생성
```

## 📁 데이터 저장 구조

API 키는 GitHub 저장소의 다음 위치에 암호화되어 저장됩니다:
```
chatgame/data/secure/api-keys.json
```

**파일 구조:**
```json
{
  "admin": {
    "encrypted": "abc123...",
    "iv": "def456...",
    "timestamp": "2025-09-23T10:00:00.000Z",
    "lastUpdated": "2025-09-23T10:00:00.000Z",
    "keyPreview": "sk-XX...XX"
  },
  "default": {
    "encrypted": "xyz789...",
    "iv": "uvw012...",
    "timestamp": "2025-09-23T10:00:00.000Z",
    "lastUpdated": "2025-09-23T10:00:00.000Z",
    "keyPreview": "sk-YY...YY"
  }
}
```

## 🔒 보안 특징

### 암호화
- **알고리즘**: AES-256-GCM
- **키 관리**: Vercel 환경변수로 분리 저장
- **IV (Initialization Vector)**: 각 암호화마다 랜덤 생성

### 접근 제어
- **로그인 기반**: 관리자 인증 후에만 API 키 접근 가능
- **세션 관리**: 암호화된 세션 ID로 임시 접근 권한 부여
- **자동 만료**: 1시간 비활성 세션 자동 삭제

### 데이터 보호
- **Git 암호화**: API 키가 암호화된 상태로만 저장
- **환경 분리**: 암호화 키는 Vercel에, 데이터는 GitHub에 분리
- **키 미리보기**: 실제 키 노출 없이 `sk-XX...XX` 형태로만 표시

## 🚀 사용 방법

### 1. 관리자 로그인
```
URL: https://chatgame-seven.vercel.app/scenario-admin.html
계정: admin / chatgame2025
```

### 2. API 키 저장
1. 로그인 후 "설정" 탭으로 이동
2. OpenAI API 키 입력 (sk-로 시작하는 형태)
3. "💾 API 키 저장" 버튼 클릭
4. 자동으로 GitHub에 암호화되어 저장됨

### 3. API 키 조회
- 로그인 시 자동으로 저장된 API 키 로드
- 세션 스토리지에 임시 캐시되어 빠른 접근 가능

### 4. API 키 삭제
1. "🗑️ API 키 삭제" 버튼 클릭
2. GitHub 저장소에서 완전 삭제
3. 모든 캐시에서 즉시 제거

## 🔧 API 엔드포인트

### 인증 관련
- `POST /api/admin-auth?action=login` - 로그인
- `POST /api/admin-auth?action=logout` - 로그아웃
- `GET /api/admin-auth?action=check-session` - 세션 확인

### API 키 관리
- `POST /api/admin-auth?action=save-api-key` - API 키 저장 (로그인 기반)
- `GET /api/admin-auth?action=get-api-key` - API 키 조회 (로그인 기반)
- `POST /api/admin-auth?action=delete-api-key` - API 키 삭제 (로그인 기반)

### 일반 API (Fallback)
- `POST /api/save-api-key` - 일반 API 키 저장
- `POST /api/clear-api-key` - 일반 API 키 삭제
- `GET /api/test-env` - 환경 상태 확인

## 🐛 문제 해결

### 환경변수 미설정
```
에러: GitHub Token이 설정되지 않음
해결: Vercel 대시보드에서 GITHUB_TOKEN 환경변수 설정
```

### 권한 오류
```
에러: GitHub API 오류: 403 Forbidden
해결: GitHub Token의 repo 권한 확인 및 재생성
```

### 암호화 오류
```
에러: API 키 암호화 실패
해결: API_ENCRYPTION_KEY 환경변수 확인 (32자 이상)
```

### 세션 만료
```
에러: 인증되지 않은 요청입니다
해결: 다시 로그인 (세션은 1시간 후 자동 만료)
```

## 📊 모니터링

### 콘솔 로그 확인
브라우저 F12 콘솔에서 다음과 같은 로그를 확인할 수 있습니다:

```
🔐 API 키 저장 시작: admin
✅ API 키 저장 완료: admin (sk-XX...XX)
🔍 API 키 조회: admin
✅ API 키 조회 완료: admin (sk-XX...XX)
🗑️ API 키 삭제: admin
✅ API 키 삭제 완료: admin
```

### API 상태 확인
- 실시간 API 키 상태 표시
- 저장소 유형 표시: `secure-encrypted-github`
- 키 미리보기로 현재 활성 키 확인

## 🔄 마이그레이션

기존 시스템에서 새 Secure Storage로 마이그레이션:

1. **기존 API 키 백업** (필요시)
2. **Vercel 환경변수 설정** (GITHUB_TOKEN, API_ENCRYPTION_KEY)
3. **새 시스템으로 API 키 재등록**
4. **기존 캐시 클리어** (`sessionStorage.clear()`)

## 🔐 보안 권장사항

1. **정기적인 API 키 교체** (월 1회 권장)
2. **GitHub Token 권한 최소화** (필요한 권한만 부여)
3. **암호화 키 정기 변경** (분기별 권장)
4. **접근 로그 모니터링** (비정상적인 접근 감지)
5. **HTTPS 강제 사용** (Vercel에서 자동 적용)

---

**마지막 업데이트**: 2025-09-23
**버전**: 1.0.0
**개발자**: Claude Code + dosik
**지원**: GitHub Issues 또는 scenario-admin.html 관리 인터페이스