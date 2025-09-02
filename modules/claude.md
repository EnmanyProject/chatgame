# 모듈 시스템 개요

## 모듈 구조
```
modules/
├── claude.md           # 모듈 시스템 전체 개요
├── core/              # 핵심 아키텍처 모듈
│   └── claude.md
├── game/              # 게임 로직 모듈
│   └── claude.md
├── admin/             # 관리자 시스템 모듈
│   └── claude.md
└── integration/       # 통합 및 배포 모듈
    └── claude.md
```

## 모듈별 역할
- **core/**: 기본 아키텍처, 데이터 스키마, 유틸리티
- **game/**: 게임 플레이 로직, 캐릭터 상호작용, 시나리오 처리
- **admin/**: 관리자 인터페이스, CRUD 기능, 시스템 관리
- **integration/**: API 통합, 배포 설정, 외부 서비스 연동

## 작업 가이드
각 모듈의 claude.md 파일에는 해당 모듈의 상세 정보가 기록됩니다.

---
*생성일: 2025-09-02*
*작성자: dosik + Claude Code*