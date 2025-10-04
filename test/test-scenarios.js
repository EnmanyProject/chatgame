/**
 * Phase 1 통합 테스트 시나리오
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
