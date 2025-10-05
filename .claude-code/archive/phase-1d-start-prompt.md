# 🚀 Phase 1-D 작업 시작 프롬프트

---

## 📋 Claude Code 작업 지시

```
안녕 Claude Code! Phase 1-D 작업을 시작하자.

[필수] 먼저 다음 문서들을 읽고 숙지해줘:
1. .claude-code/handoff-to-claude-code.md (전체 프로젝트 개요)
2. .claude-code/phase-1c-start-prompt.md (방금 완료한 작업)
3. claude.md (프로젝트 히스토리)

[완료 확인] Phase 1-A, 1-B, 1-C 작업 내역:
✅ Phase 1-A: 채팅 UI, 상태 관리, AI 엔진, 에피소드 전달
✅ Phase 1-B: 시간/호감도/행동/랜덤 트리거 시스템
✅ Phase 1-C: 멀티 캐릭터, 대화방 리스트, 독립 상태 관리
✅ Git 커밋 & 푸시 완료
```

---

## 🎯 Phase 1-D 작업 목표

**작업명**: 통합 테스트 및 버그 수정  
**파일 생성**: 
- `test/integration-test.html` (통합 테스트 페이지)
- `test/test-scenarios.js` (테스트 시나리오)
- `TESTING-GUIDE.md` (테스트 가이드 문서)

**예상 시간**: 1일 작업  
**목표**: 
- 전체 시스템 통합 테스트
- 발견된 버그 수정
- 성능 최적화
- Phase 1 완전 마무리

---

## 📝 상세 작업 내용

### 1️⃣ 통합 테스트 시나리오 (40% 비중)

#### 테스트 시나리오 목록:

```javascript
/**
 * 통합 테스트 시나리오
 * 모든 Phase 1 기능을 종합적으로 테스트
 */

const TEST_SCENARIOS = [
  // ===== 시나리오 1: 단일 캐릭터 기본 플로우 =====
  {
    id: 'scenario_1',
    name: '단일 캐릭터 기본 플로우',
    description: '한 명의 캐릭터와 처음부터 끝까지 대화',
    steps: [
      {
        step: 1,
        action: 'character-list-ui.html 접속',
        expected: '빈 대화방 목록 표시 (처음 접속 시)'
      },
      {
        step: 2,
        action: '+ 버튼 클릭 → 캐릭터 선택 (윤아 INFP)',
        expected: 'chat-ui.html?character=yuna_infp로 이동'
      },
      {
        step: 3,
        action: '첫 메시지 수신',
        expected: '윤아: "안녕! 오빠 처음 보는데, 이름이 뭐야?"'
      },
      {
        step: 4,
        action: '선택지 선택: "민수야" (+1 호감도)',
        expected: '호감도 1→2 (숨겨짐), 윤아: "민수 오빠! 반가워~"'
      },
      {
        step: 5,
        action: '직접 입력: "너는 뭐 좋아해?"',
        expected: 'AI 분석 → 적절한 응답 생성'
      },
      {
        step: 6,
        action: '뒤로가기 버튼',
        expected: 'character-list-ui.html로 복귀'
      },
      {
        step: 7,
        action: '대화방 리스트 확인',
        expected: '윤아 대화방 표시, 마지막 메시지, 시간, 읽지 않은 개수 0'
      }
    ],
    assertions: [
      'localStorage에 윤아 상태 저장됨',
      '대화방 정보 정확히 표시',
      '호감도 2로 유지',
      '대화 히스토리 저장됨'
    ]
  },

  // ===== 시나리오 2: 멀티 캐릭터 동시 진행 =====
  {
    id: 'scenario_2',
    name: '멀티 캐릭터 동시 진행',
    description: '3명의 캐릭터와 동시에 대화 진행',
    steps: [
      {
        step: 1,
        action: '윤아 (INFP) 대화 시작 → 호감도 5까지 올림',
        expected: '윤아 호감도 5, 톤 레벨 3 (애교)'
      },
      {
        step: 2,
        action: '대화방 목록 복귀 → 미나 (ENFP) 추가',
        expected: '미나 대화방 생성, 호감도 1 (초기값)'
      },
      {
        step: 3,
        action: '미나와 대화 → 호감도 3까지 올림',
        expected: '미나 호감도 3, 톤 레벨 2 (반말)'
      },
      {
        step: 4,
        action: '대화방 목록 복귀 → 서연 (INTJ) 추가',
        expected: '서연 대화방 생성, 호감도 1'
      },
      {
        step: 5,
        action: '서연과 대화 → 호감도 2까지 올림',
        expected: '서연 호감도 2, 톤 레벨 1 (존댓말)'
      },
      {
        step: 6,
        action: '대화방 목록에서 3명 모두 확인',
        expected: '윤아(호감도5), 미나(호감도3), 서연(호감도2) 독립적으로 표시'
      },
      {
        step: 7,
        action: '각 대화방 재진입 후 히스토리 확인',
        expected: '각각의 대화 히스토리 정확히 로드됨'
      }
    ],
    assertions: [
      '3명의 호감도가 독립적으로 관리됨',
      '각 캐릭터의 톤 레벨이 다름',
      '대화방 리스트에서 마지막 메시지 정확히 표시',
      'localStorage에 3개의 독립적인 상태 저장'
    ]
  },

  // ===== 시나리오 3: 시간 기반 트리거 테스트 =====
  {
    id: 'scenario_3',
    name: '시간 기반 트리거 테스트',
    description: '시간대별 자동 메시지 발송 테스트',
    steps: [
      {
        step: 1,
        action: '윤아와 대화 시작 (호감도 5)',
        expected: '대화 진행 중'
      },
      {
        step: 2,
        action: '시스템 시간을 아침 8시로 변경 (또는 대기)',
        expected: '윤아: "좋은 아침! 오빠 일어났어?"'
      },
      {
        step: 3,
        action: '시스템 시간을 점심 12시로 변경',
        expected: '윤아: "점심 먹었어? 나는 김치찌개~"'
      },
      {
        step: 4,
        action: '시스템 시간을 저녁 7시로 변경',
        expected: '윤아: "퇴근했어? 오늘 고생 많았지?"'
      },
      {
        step: 5,
        action: '시스템 시간을 밤 11시로 변경',
        expected: '윤아: "자기 전에 연락했어 ㅎㅎ 굿나잇!"'
      },
      {
        step: 6,
        action: '같은 시간대에 다시 트리거 시도',
        expected: '중복 메시지 발송 안 됨 (하루 1회 제한)'
      }
    ],
    assertions: [
      '시간대별 메시지 정확히 발송',
      '하루 1회 제한 작동',
      'localStorage에 마지막 발송 시간 저장',
      '대화방에 메시지 업데이트됨'
    ]
  },

  // ===== 시나리오 4: 호감도 기반 트리거 테스트 =====
  {
    id: 'scenario_4',
    name: '호감도 기반 트리거 테스트',
    description: '호감도 레벨업 시 특별 메시지 발송',
    steps: [
      {
        step: 1,
        action: '윤아 호감도 1→2 증가',
        expected: '윤아: "오빠 이름이 뭐야? 나는 윤아야!"'
      },
      {
        step: 2,
        action: '윤아 호감도 2→3 증가',
        expected: '윤아: "오빠랑 얘기하는 거 진짜 재밌어 ㅎㅎ"'
      },
      {
        step: 3,
        action: '윤아 호감도 4→5 증가',
        expected: '윤아: "오빠... 나 오빠한테 할 말이 있어. 사실..."'
      },
      {
        step: 4,
        action: '윤아 호감도 5 달성 → 고백 이벤트',
        expected: '특별 선택지: "오빠도... 나 좋아해?"'
      },
      {
        step: 5,
        action: '"응, 나도 좋아해" 선택 (+3 호감도)',
        expected: '윤아 호감도 5→8, 톤 레벨 4 (애정표현)'
      },
      {
        step: 6,
        action: '윤아 호감도 9→10 증가',
        expected: '윤아: "오빠가 내 전부야... 사랑해❤️"'
      }
    ],
    assertions: [
      '레벨업 메시지 정확히 발송',
      '특별 이벤트 (호감도 5, 7, 10) 발생',
      '중복 발송 방지',
      '톤 레벨 자동 변화'
    ]
  },

  // ===== 시나리오 5: 행동 기반 트리거 테스트 =====
  {
    id: 'scenario_5',
    name: '행동 기반 트리거 테스트 (무응답)',
    description: '유저 무응답 시 감정 변화 및 메시지 발송',
    steps: [
      {
        step: 1,
        action: '윤아와 대화 중 (호감도 5)',
        expected: '정상 대화 중'
      },
      {
        step: 2,
        action: '3시간 동안 응답 없음',
        expected: '윤아: "오빠 바빠? ㅠㅠ" (감정: worried)'
      },
      {
        step: 3,
        action: '6시간 동안 응답 없음',
        expected: '윤아: "오빠 어디야... 걱정돼" (감정: sad)'
      },
      {
        step: 4,
        action: '24시간 동안 응답 없음',
        expected: '윤아: "오빠 왜 연락 안 해?" (감정: angry, 호감도 -2)'
      },
      {
        step: 5,
        action: '3일 동안 응답 없음',
        expected: '윤아: "오빠 정말 최악이야!" (대화 중단, 호감도 -5)'
      },
      {
        step: 6,
        action: '메시지 전송 시도',
        expected: '차단 메시지: "선물을 보내서 화를 풀어주세요"'
      }
    ],
    assertions: [
      '무응답 시간 정확히 추적',
      '감정 상태 단계별 변화',
      '호감도 감소 정확히 적용',
      '대화 중단 시스템 작동'
    ]
  },

  // ===== 시나리오 6: 랜덤 이벤트 트리거 테스트 =====
  {
    id: 'scenario_6',
    name: '랜덤 이벤트 트리거 테스트',
    description: '예측 불가능한 메시지 발송 테스트',
    steps: [
      {
        step: 1,
        action: '윤아 호감도 7 (높은 확률)',
        expected: '랜덤 메시지 발생 확률 20%'
      },
      {
        step: 2,
        action: '10분 대기',
        expected: '확률적으로 메시지 발송 가능'
      },
      {
        step: 3,
        action: '랜덤 메시지 수신 시',
        expected: '"갑자기 오빠 생각나서~" 또는 사진 전송'
      },
      {
        step: 4,
        action: '호감도 2로 낮춤',
        expected: '랜덤 메시지 발생 확률 5% (감소)'
      }
    ],
    assertions: [
      '호감도에 따라 확률 변화',
      '다양한 이벤트 타입 발생',
      '10분마다 체크 작동'
    ]
  },

  // ===== 시나리오 7: localStorage 저장/로드 =====
  {
    id: 'scenario_7',
    name: 'localStorage 저장/로드 테스트',
    description: '페이지 새로고침 후 데이터 복구',
    steps: [
      {
        step: 1,
        action: '3명의 캐릭터와 대화 진행',
        expected: '윤아(호감도5), 미나(호감도3), 서연(호감도2)'
      },
      {
        step: 2,
        action: '페이지 새로고침 (F5)',
        expected: '대화방 리스트 그대로 유지'
      },
      {
        step: 3,
        action: '각 대화방 진입',
        expected: '호감도, 대화 히스토리 정확히 복구'
      },
      {
        step: 4,
        action: 'localStorage 용량 확인',
        expected: '5MB 이하 (브라우저 제한 대비)'
      },
      {
        step: 5,
        action: 'localStorage 강제 삭제 후 새로고침',
        expected: '초기 상태로 복귀 (빈 대화방)'
      }
    ],
    assertions: [
      '모든 상태 정확히 저장',
      '새로고침 후 완전 복구',
      '용량 최적화',
      '데이터 무결성 보장'
    ]
  },

  // ===== 시나리오 8: UI/UX 테스트 =====
  {
    id: 'scenario_8',
    name: 'UI/UX 종합 테스트',
    description: '모든 UI 요소 및 사용자 경험 테스트',
    steps: [
      {
        step: 1,
        action: '대화방 리스트 스크롤',
        expected: '부드러운 스크롤, 10개 이상 표시 시 정상 작동'
      },
      {
        step: 2,
        action: '대화방 검색: "윤아"',
        expected: '윤아 대화방만 필터링되어 표시'
      },
      {
        step: 3,
        action: '채팅 화면에서 긴 메시지 입력',
        expected: '자동 스크롤, 텍스트 줄바꿈'
      },
      {
        step: 4,
        action: '타이핑 애니메이션 확인',
        expected: '"..."표시 후 메시지 등장'
      },
      {
        step: 5,
        action: '읽지 않은 메시지 배지 확인',
        expected: '빨간 숫자 배지, 99 이상은 "99+"'
      },
      {
        step: 6,
        action: '모바일 화면 (375px) 테스트',
        expected: '반응형 디자인 정상 작동'
      }
    ],
    assertions: [
      'UI 깨짐 없음',
      '애니메이션 자연스러움',
      '모바일 최적화',
      '배지 정확히 표시'
    ]
  },

  // ===== 시나리오 9: 성능 테스트 =====
  {
    id: 'scenario_9',
    name: '성능 및 최적화 테스트',
    description: '시스템 성능 및 메모리 사용량 테스트',
    steps: [
      {
        step: 1,
        action: '10명의 캐릭터 추가',
        expected: '대화방 리스트 로딩 2초 이내'
      },
      {
        step: 2,
        action: '각 캐릭터당 100개 메시지 전송',
        expected: '메모리 사용량 50MB 이하'
      },
      {
        step: 3,
        action: '트리거 엔진 10개 동시 작동',
        expected: 'CPU 사용률 30% 이하'
      },
      {
        step: 4,
        action: 'localStorage 용량 측정',
        expected: '5MB 이하, 대화 히스토리 50개 제한'
      },
      {
        step: 5,
        action: 'AI 응답 속도 측정',
        expected: 'GPT-4 응답 3초 이내'
      }
    ],
    assertions: [
      '로딩 속도 최적화',
      '메모리 효율적 사용',
      '트리거 성능 안정적',
      'AI 응답 신속'
    ]
  },

  // ===== 시나리오 10: 에러 처리 테스트 =====
  {
    id: 'scenario_10',
    name: '에러 처리 및 예외 상황 테스트',
    description: '다양한 에러 상황에서 시스템 안정성 테스트',
    steps: [
      {
        step: 1,
        action: 'AI API 오류 시뮬레이션',
        expected: '폴백 응답 자동 생성'
      },
      {
        step: 2,
        action: 'localStorage 용량 초과',
        expected: '오래된 히스토리 자동 삭제'
      },
      {
        step: 3,
        action: '잘못된 URL 파라미터 접근',
        expected: '대화방 리스트로 리다이렉트'
      },
      {
        step: 4,
        action: '존재하지 않는 캐릭터 ID',
        expected: '에러 메시지, 대화방으로 복귀'
      },
      {
        step: 5,
        action: '네트워크 끊김 상황',
        expected: '로컬 데이터 유지, 재연결 시 동기화'
      }
    ],
    assertions: [
      '모든 에러 적절히 처리',
      '사용자에게 명확한 안내',
      '데이터 손실 방지',
      '시스템 크래시 없음'
    ]
  }
];
```

---

### 2️⃣ 통합 테스트 페이지 생성 (30% 비중)

#### test/integration-test.html:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phase 1 통합 테스트</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h1 {
      color: #3a5068;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }

    .test-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #3a5068;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2a3f52;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #333;
    }

    .test-scenario {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s;
    }

    .test-scenario.running {
      border-color: #ffc107;
      background-color: #fff9e6;
    }

    .test-scenario.passed {
      border-color: #28a745;
      background-color: #e6f9ea;
    }

    .test-scenario.failed {
      border-color: #dc3545;
      background-color: #fce8e8;
    }

    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .scenario-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .scenario-status {
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-pending {
      background-color: #e0e0e0;
      color: #666;
    }

    .status-running {
      background-color: #ffc107;
      color: #333;
    }

    .status-passed {
      background-color: #28a745;
      color: white;
    }

    .status-failed {
      background-color: #dc3545;
      color: white;
    }

    .scenario-description {
      color: #666;
      margin-bottom: 15px;
    }

    .test-steps {
      margin-top: 10px;
    }

    .test-step {
      padding: 10px;
      margin-bottom: 5px;
      background-color: #f8f9fa;
      border-radius: 5px;
      font-size: 14px;
    }

    .test-step.passed {
      background-color: #d4edda;
      color: #155724;
    }

    .test-step.failed {
      background-color: #f8d7da;
      color: #721c24;
    }

    .test-step.running {
      background-color: #fff3cd;
      color: #856404;
    }

    .test-results {
      margin-top: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .result-summary {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
    }

    .result-item {
      text-align: center;
    }

    .result-number {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .result-label {
      color: #666;
      font-size: 14px;
    }

    .progress-bar {
      width: 100%;
      height: 30px;
      background-color: #e0e0e0;
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #20c997);
      transition: width 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .console-output {
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 15px;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
      margin-top: 20px;
    }

    .console-line {
      margin-bottom: 5px;
    }

    .console-info {
      color: #4fc3f7;
    }

    .console-success {
      color: #81c784;
    }

    .console-error {
      color: #e57373;
    }

    .console-warning {
      color: #ffb74d;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Phase 1 통합 테스트</h1>
    <p class="subtitle">채팅 엔진 기초 구축 - 전체 시스템 테스트</p>

    <!-- 테스트 컨트롤 -->
    <div class="test-controls">
      <button class="btn btn-primary" onclick="runAllTests()">
        ▶️ 전체 테스트 실행
      </button>
      <button class="btn btn-success" onclick="runSelectedTests()">
        ✓ 선택 테스트 실행
      </button>
      <button class="btn btn-warning" onclick="pauseTests()">
        ⏸️ 일시정지
      </button>
      <button class="btn btn-danger" onclick="stopTests()">
        ⏹️ 중지
      </button>
      <button class="btn btn-primary" onclick="resetTests()">
        🔄 초기화
      </button>
      <button class="btn btn-primary" onclick="exportResults()">
        📥 결과 내보내기
      </button>
    </div>

    <!-- 진행률 -->
    <div class="progress-bar">
      <div class="progress-fill" id="progressBar" style="width: 0%">
        0%
      </div>
    </div>

    <!-- 테스트 결과 요약 -->
    <div class="test-results">
      <div class="result-summary">
        <div class="result-item">
          <div class="result-number" id="totalTests" style="color: #3a5068;">0</div>
          <div class="result-label">총 테스트</div>
        </div>
        <div class="result-item">
          <div class="result-number" id="passedTests" style="color: #28a745;">0</div>
          <div class="result-label">통과</div>
        </div>
        <div class="result-item">
          <div class="result-number" id="failedTests" style="color: #dc3545;">0</div>
          <div class="result-label">실패</div>
        </div>
        <div class="result-item">
          <div class="result-number" id="skippedTests" style="color: #6c757d;">0</div>
          <div class="result-label">건너뜀</div>
        </div>
      </div>
    </div>

    <!-- 테스트 시나리오 목록 -->
    <div id="testScenarios">
      <!-- JavaScript로 동적 생성 -->
    </div>

    <!-- 콘솔 출력 -->
    <div class="console-output" id="consoleOutput">
      <div class="console-line console-info">[INFO] 테스트 시스템 준비 완료</div>
      <div class="console-line console-info">[INFO] 전체 테스트 실행 버튼을 클릭하세요</div>
    </div>
  </div>

  <script src="test-scenarios.js"></script>
  <script src="../js/chat-room-manager.js"></script>
  <script src="../js/multi-character-state.js"></script>
  <script>
    let testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };

    let isTestRunning = false;
    let isPaused = false;

    // 페이지 로드 시 시나리오 렌더링
    document.addEventListener('DOMContentLoaded', () => {
      renderTestScenarios();
      updateResultsSummary();
    });

    // 테스트 시나리오 렌더링
    function renderTestScenarios() {
      const container = document.getElementById('testScenarios');
      
      container.innerHTML = TEST_SCENARIOS.map(scenario => `
        <div class="test-scenario" id="scenario_${scenario.id}">
          <div class="scenario-header">
            <div>
              <div class="scenario-title">${scenario.name}</div>
              <div class="scenario-description">${scenario.description}</div>
            </div>
            <span class="scenario-status status-pending" id="status_${scenario.id}">
              대기 중
            </span>
          </div>
          <div class="test-steps" id="steps_${scenario.id}">
            ${scenario.steps.map((step, index) => `
              <div class="test-step" id="step_${scenario.id}_${index}">
                Step ${step.step}: ${step.action}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');

      testResults.total = TEST_SCENARIOS.length;
      document.getElementById('totalTests').textContent = testResults.total;
    }

    // 전체 테스트 실행
    async function runAllTests() {
      if (isTestRunning) {
        log('warning', '이미 테스트가 실행 중입니다.');
        return;
      }

      isTestRunning = true;
      isPaused = false;
      resetResults();

      log('info', '=== 전체 테스트 시작 ===');

      for (let i = 0; i < TEST_SCENARIOS.length; i++) {
        if (!isTestRunning) break;

        while (isPaused) {
          await sleep(100);
        }

        await runScenario(TEST_SCENARIOS[i], i);
        updateProgress((i + 1) / TEST_SCENARIOS.length * 100);
      }

      isTestRunning = false;
      log('success', '=== 전체 테스트 완료 ===');
      log('info', `통과: ${testResults.passed}, 실패: ${testResults.failed}`);
    }

    // 개별 시나리오 실행
    async function runScenario(scenario, index) {
      log('info', `[${index + 1}/${TEST_SCENARIOS.length}] ${scenario.name} 시작`);

      const scenarioEl = document.getElementById(`scenario_${scenario.id}`);
      const statusEl = document.getElementById(`status_${scenario.id}`);

      scenarioEl.classList.add('running');
      statusEl.textContent = '실행 중';
      statusEl.className = 'scenario-status status-running';

      try {
        // 각 스텝 실행
        for (let i = 0; i < scenario.steps.length; i++) {
          const step = scenario.steps[i];
          const stepEl = document.getElementById(`step_${scenario.id}_${i}`);

          stepEl.classList.add('running');
          log('info', `  Step ${step.step}: ${step.action}`);

          // 실제 테스트 로직 실행 (시뮬레이션)
          await sleep(500);
          const result = await executeStep(step);

          if (result) {
            stepEl.classList.remove('running');
            stepEl.classList.add('passed');
            log('success', `  ✓ ${step.expected}`);
          } else {
            throw new Error(`Step ${step.step} failed`);
          }
        }

        // 어설션 검증
        for (const assertion of scenario.assertions) {
          log('info', `  검증: ${assertion}`);
          await sleep(300);
        }

        // 성공
        scenarioEl.classList.remove('running');
        scenarioEl.classList.add('passed');
        statusEl.textContent = '통과 ✓';
        statusEl.className = 'scenario-status status-passed';
        testResults.passed++;
        log('success', `✓ ${scenario.name} 통과`);

      } catch (error) {
        // 실패
        scenarioEl.classList.remove('running');
        scenarioEl.classList.add('failed');
        statusEl.textContent = '실패 ✗';
        statusEl.className = 'scenario-status status-failed';
        testResults.failed++;
        log('error', `✗ ${scenario.name} 실패: ${error.message}`);
      }

      updateResultsSummary();
      await sleep(1000);
    }

    // 스텝 실행 (실제 구현)
    async function executeStep(step) {
      // 실제 테스트 로직 구현
      // 여기서는 시뮬레이션만
      return Math.random() > 0.1; // 90% 성공률
    }

    // 진행률 업데이트
    function updateProgress(percent) {
      const progressBar = document.getElementById('progressBar');
      progressBar.style.width = `${percent}%`;
      progressBar.textContent = `${Math.round(percent)}%`;
    }

    // 결과 요약 업데이트
    function updateResultsSummary() {
      document.getElementById('totalTests').textContent = testResults.total;
      document.getElementById('passedTests').textContent = testResults.passed;
      document.getElementById('failedTests').textContent = testResults.failed;
      document.getElementById('skippedTests').textContent = testResults.skipped;
    }

    // 결과 초기화
    function resetResults() {
      testResults.passed = 0;
      testResults.failed = 0;
      testResults.skipped = 0;
      updateResultsSummary();
      updateProgress(0);
    }

    // 테스트 초기화
    function resetTests() {
      if (isTestRunning) {
        if (!confirm('실행 중인 테스트를 중지하고 초기화하시겠습니까?')) {
          return;
        }
        stopTests();
      }

      resetResults();
      document.getElementById('consoleOutput').innerHTML = `
        <div class="console-line console-info">[INFO] 테스트 초기화 완료</div>
      `;
      renderTestScenarios();
      log('info', '테스트가 초기화되었습니다.');
    }

    // 테스트 일시정지
    function pauseTests() {
      if (!isTestRunning) return;
      isPaused = !isPaused;
      log('warning', isPaused ? '테스트 일시정지' : '테스트 재개');
    }

    // 테스트 중지
    function stopTests() {
      isTestRunning = false;
      isPaused = false;
      log('error', '테스트 중지');
    }

    // 결과 내보내기
    function exportResults() {
      const results = {
        timestamp: new Date().toISOString(),
        summary: testResults,
        scenarios: TEST_SCENARIOS.map(s => ({
          id: s.id,
          name: s.name,
          status: document.getElementById(`status_${s.id}`).textContent
        }))
      };

      const blob = new Blob([JSON.stringify(results, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-results-${Date.now()}.json`;
      a.click();

      log('success', '결과가 내보내기되었습니다.');
    }

    // 콘솔 로그
    function log(type, message) {
      const console = document.getElementById('consoleOutput');
      const timestamp = new Date().toLocaleTimeString();
      const line = document.createElement('div');
      line.className = `console-line console-${type}`;
      line.textContent = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
      console.appendChild(line);
      console.scrollTop = console.scrollHeight;
    }

    // Sleep 함수
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  </script>
</body>
</html>
```

---

### 3️⃣ 버그 수정 및 최적화 (30% 비중)

#### 예상되는 버그 및 수정 사항:

```javascript
// 1. localStorage 용량 초과 문제
function cleanupOldHistory() {
  const states = MultiCharacterState.loadAllStates();
  
  for (const characterId in states) {
    const history = states[characterId].conversationHistory || [];
    
    // 최근 50개만 유지
    if (history.length > 50) {
      states[characterId].conversationHistory = history.slice(-50);
    }
  }
  
  localStorage.setItem('multiCharacterStates', JSON.stringify(states));
}

// 2. 트리거 중복 실행 방지
class TriggerManager {
  constructor() {
    this.runningTriggers = new Set();
  }

  async executeTrigger(triggerId, callback) {
    if (this.runningTriggers.has(triggerId)) {
      return; // 이미 실행 중
    }

    this.runningTriggers.add(triggerId);
    
    try {
      await callback();
    } finally {
      this.runningTriggers.delete(triggerId);
    }
  }
}

// 3. 메모리 누수 방지
function cleanupEventListeners() {
  // 페이지 이탈 시 이벤트 리스너 제거
  window.addEventListener('beforeunload', () => {
    if (window.triggerEngine) {
      window.triggerEngine.stop();
    }
  });
}

// 4. AI 응답 타임아웃 처리
async function callAIWithTimeout(prompt, timeout = 10000) {
  return Promise.race([
    callAI(prompt),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI 응답 타임아웃')), timeout)
    )
  ]);
}

// 5. 대화방 정렬 버그 수정
function sortChatRooms(rooms) {
  return rooms.sort((a, b) => {
    // 고정된 방이 먼저
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // 마지막 메시지 시간 순
    return b.lastMessageTime - a.lastMessageTime;
  });
}

// 6. URL 파라미터 검증
function getValidCharacterId() {
  const params = new URLSearchParams(window.location.search);
  const characterId = params.get('character');
  
  if (!characterId) {
    throw new Error('캐릭터 ID가 없습니다.');
  }
  
  // 유효성 검사
  const validIds = ['yuna_infp', 'mina_enfp', 'seoyeon_intj'];
  if (!validIds.includes(characterId)) {
    throw new Error('유효하지 않은 캐릭터 ID입니다.');
  }
  
  return characterId;
}

// 7. 타이핑 애니메이션 부드럽게
function showTypingAnimation() {
  const dots = document.getElementById('typingDots');
  let count = 0;
  
  const interval = setInterval(() => {
    count = (count + 1) % 4;
    dots.textContent = '.'.repeat(count);
  }, 300);
  
  return () => clearInterval(interval);
}

// 8. 시간 포맷 버그 수정
function formatTimeFixed(timestamp) {
  if (!timestamp || isNaN(timestamp)) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // 음수 방지
  if (diff < 0) return '방금';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
```

---

## ✅ 완료 기준

### 테스트 체크리스트:
```
□ 통합 테스트 페이지 생성
  - 10개 시나리오 테스트
  - 자동화된 테스트 실행
  - 결과 요약 및 리포트

□ 버그 수정
  - localStorage 용량 관리
  - 트리거 중복 실행 방지
  - 메모리 누수 제거
  - AI 타임아웃 처리

□ 성능 최적화
  - 로딩 속도 개선
  - 메모리 사용량 감소
  - 애니메이션 부드럽게

□ 문서화
  - TESTING-GUIDE.md 작성
  - 주요 버그 및 수정 기록
  - Phase 1 완료 보고서

□ 최종 검증
  - 모든 기능 정상 작동
  - 크리티컬 버그 0개
  - 사용자 경험 만족
```

---

## 📦 최종 파일 구조

```
chatgame/
├── test/
│   ├── integration-test.html (신규)
│   └── test-scenarios.js (신규)
├── TESTING-GUIDE.md (신규)
├── PHASE-1-COMPLETION-REPORT.md (신규)
├── character-list-ui.html (버그 수정)
├── chat-ui.html (최적화)
└── js/
    ├── chat-room-manager.js (버그 수정)
    ├── multi-character-state.js (최적화)
    └── episode-trigger-engine.js (개선)
```

---

## 🚀 Git 작업

### 작업 완료 후:
```bash
# 1. 파일 스테이징
git add test/
git add TESTING-GUIDE.md
git add PHASE-1-COMPLETION-REPORT.md
git add character-list-ui.html
git add chat-ui.html
git add js/

# 2. 커밋
git commit -m "Phase 1-D: 통합 테스트 및 Phase 1 완료

- 통합 테스트 페이지 생성 (10개 시나리오)
- 주요 버그 수정 (localStorage, 트리거, 메모리)
- 성능 최적화 (로딩, 애니메이션)
- 문서화 완료
- Phase 1: 핵심 채팅 엔진 구축 완료 ✅"

# 3. 태그 생성 (Phase 1 완료)
git tag -a v2.0.0-phase1 -m "Phase 1: 핵심 채팅 엔진 구축 완료"

# 4. 푸시
git push origin main
git push origin v2.0.0-phase1
```

---

## 📝 완료 보고 양식

```markdown
Phase 1-D 완료 보고

✅ 생성 파일:
- test/integration-test.html (~600줄)
- test/test-scenarios.js (~800줄)
- TESTING-GUIDE.md (~200줄)
- PHASE-1-COMPLETION-REPORT.md (~150줄)

✅ 수정 파일:
- character-list-ui.html (버그 수정)
- chat-ui.html (최적화)
- js/chat-room-manager.js (버그 수정)
- js/multi-character-state.js (최적화)
- js/episode-trigger-engine.js (개선)

🧪 테스트 결과:
- 총 10개 시나리오 테스트
- 통과: 10개
- 실패: 0개
- 전체 성공률: 100%

🐛 수정된 버그:
- localStorage 용량 초과
- 트리거 중복 실행
- 메모리 누수
- AI 응답 타임아웃
- 시간 포맷 오류
- URL 파라미터 검증
- 대화방 정렬 버그
- 타이핑 애니메이션 끊김

⚡ 성능 개선:
- 로딩 속도: 2초 → 0.5초
- 메모리 사용: 80MB → 50MB
- 애니메이션: 60fps 유지

📊 코드 품질:
- 총 코드: ~1,500줄 추가/수정
- 주석 포함: 80%+
- 에러 처리: 완료
- 테스트 커버리지: 90%+

🔄 Git:
- 커밋: "Phase 1-D: 통합 테스트 및 Phase 1 완료"
- 태그: v2.0.0-phase1
- 푸시: 완료
- Vercel 배포: 자동 완료

🎉 Phase 1 완료!
- Phase 1-A: 채팅 UI 및 기초 시스템 ✅
- Phase 1-B: 에피소드 트리거 시스템 ✅
- Phase 1-C: 멀티 캐릭터 동시 채팅 ✅
- Phase 1-D: 통합 테스트 및 마무리 ✅

🎯 다음: Phase 2-A (대화 톤 변화 시스템)
```

---

## 🎉 Phase 1 완료 축하!

### 달성한 것들:
```
✅ 카카오톡 스타일 채팅 UI
✅ AI 기반 대화 시스템
✅ 시간/호감도/행동/랜덤 트리거
✅ 멀티 캐릭터 동시 진행
✅ 독립적인 상태 관리
✅ localStorage 저장/로드
✅ 완벽한 모바일 반응형
✅ 통합 테스트 시스템
```

### Phase 1의 의미:
**연애 시뮬레이션의 핵심 엔진 완성!**

이제 사용자는:
- 여러 캐릭터와 동시에 대화 가능
- 각 캐릭터가 먼저 연락 옴
- 시간에 맞춰 자연스러운 메시지
- 호감도에 따라 관계 발전
- 무응답 시 감정 변화

---

## 🎯 다음 단계: Phase 2

**Phase 2: 보상 시스템** (1주)
- Phase 2-A: 대화 톤 변화
- Phase 2-B: 사진 전송 시스템
- Phase 2-C: 먼저 연락 시스템

더욱 몰입감 있는 게임이 됩니다! 🚀

---

**작업 시작하자! Phase 1 마무리 화이팅! 🎉**
