# Integration 모듈 - 통합 및 배포

## 담당 범위
- API 서버 (`api/scenario.js`)
- Vercel 서버리스 함수 관리
- Claude 3.5 Sonnet API 통합
- 자동 배포 시스템
- 환경 설정 관리

## 주요 파일
- `api/scenario.js`: 메인 API 서버
- `api/test.js`: API 테스트 엔드포인트
- `.env`: 환경변수 (Git 제외)
- `vercel.json`: 배포 설정

## API 아키텍처

### 메모리 기반 스토리지
```javascript
// Vercel 서버리스 환경 최적화
let scenarios = []; // 메모리 내 시나리오 저장
let characters = []; // 메모리 내 캐릭터 저장
```

### Claude 3.5 Sonnet 통합
- **현재**: 하드코딩된 고품질 응답 시스템
- **목표**: 실제 Claude API 연동
- **특징**: MBTI 기반 감정 표현 최적화

### API 엔드포인트
```javascript
// RESTful API 설계
GET  /api/scenario?action=list&type=[scenarios|characters]
GET  /api/scenario?action=get&id=[ID]
POST /api/scenario (action=create, update, generate_character_dialogue)
```

## 배포 환경

### Vercel 설정
- **플랫폼**: Vercel 서버리스
- **자동 배포**: Git push → 자동 빌드/배포
- **환경변수**: Vercel 대시보드에서 관리
- **도메인**: https://chatgame-seven.vercel.app

### 개발 워크플로우
```bash
# 표준 배포 과정
git add .
git commit -m "작업 내용"
git push origin main
# → Vercel 자동 배포 (1-2분)
```

## 환경 최적화

### Vercel 서버리스 한계 대응
- **문제**: 복잡한 외부 API 호출 시 500 에러
- **해결**: 메모리 기반 저장소 + 동기식 처리
- **결과**: 안정적인 API 응답 보장

### 성능 최적화
- 메모리 사용량 제한
- API 응답 캐싱
- 에러 핸들링 강화

## 보안 설정
- `.env` 파일을 통한 환경변수 관리
- `.gitignore`로 민감 정보 보호
- API 키 Vercel 환경변수 설정

## 최근 개선사항
- API 안정성 대폭 향상
- 메모리 기반 스토리지 구현
- 동기식 처리로 전환

## 다음 작업 계획
- 실제 Claude API 통합
- 데이터베이스 연동 검토
- CDN 최적화
- 모니터링 시스템 구축

---
*업데이트: 2025-09-02*
*상태: 안정적 운영 중*