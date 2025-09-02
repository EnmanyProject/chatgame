# ⚠️ Claude 비용 절감 필수 지침

## 🚨 반드시 준수할 사항

### 1. 파일 읽기 규칙
- **절대 금지**: HTML 파일 전체 읽기
- **필수 사용**: `limit` 파라미터 (최대 50줄)
- **우선 사용**: `Grep` 검색 후 필요 부분만 읽기

### 2. Git 명령 최적화
```bash
# ✅ Good (비용 낮음)
git status -s                    # 간단한 상태
git diff --stat                  # 통계만
git log --oneline -5            # 최근 5개만
git pull --quiet                # 조용히 pull
git push --quiet                # 조용히 push

# ❌ Bad (비용 높음)
git status                      # 상세 출력
git diff                        # 전체 내용
git log                         # 전체 히스토리
git pull                        # 상세 병합 정보
```

### 3. 프로젝트 파악 순서
```bash
# 1단계: 구조만
dir /s /b | head -20

# 2단계: 핵심 파일만
Read package.json
Read README.md -limit 30

# 3단계: 필요시만 검색
Grep "function" 파일명
```

### 4. 금지 작업 목록
- ❌ `Read multi-scenario-game*.html` (전체)
- ❌ `Read scenario-admin.html` (전체)
- ❌ `Read test-*.html` (전체)
- ❌ 대화/시나리오 텍스트 분석
- ❌ 동일 파일 반복 읽기
- ❌ 불필요한 파일 탐색

### 5. 캐시 활용
- 이미 읽은 내용은 재사용
- 캐시된 정보 우선 활용
- 변경사항만 확인

## 📊 비용 비교
| 작업 | Bad (높음) | Good (낮음) | 절감률 |
|------|------------|-------------|--------|
| 프로젝트 파악 | $3.00 | $0.30 | 90% |
| 파일 수정 | $1.00 | $0.20 | 80% |
| Git 동기화 | $0.50 | $0.05 | 90% |

## 🎯 목표
- 세션당 비용: **$0.50 이하**
- 작업당 토큰: **10k 이하**
- 캐시 활용률: **80% 이상**