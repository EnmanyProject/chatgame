# 캐릭터 생성 시스템 필드 값 완전 참조 문서

> 📅 생성일: 2025-09-30
> 🎯 용도: 캐릭터 생성 시 사용되는 모든 필드 값들의 완전한 참조
> 📋 포함 내용: HTML 폼 옵션, 체크박스 값, API 생성 값, 스키마 정의

---

## 📊 **1. 기본 정보 (Basic Info)**

### 🎂 **나이 (Age)**
```javascript
// HTML Select Options
"20" - 20세 (성인 대학생)
"21" - 21세 (매력적인 대학생)
"22" - 22세 (성숙한 대학 선배)
"23" - 23세 (섹시한 대학원생)
"24" - 24세 (매혹적인 대학원생)
"25" - 25세 (성인 매력의 사회 초년생)
"26" - 26세 (성숙한 사회인)
"27" - 27세 (매력적인 사회인)
"28" - 28세 (섹시한 직장인)
"29" - 29세 (성숙한 매력의 직장인)
"30" - 30세 (완성된 성인 매력)
```

### 🎭 **캐릭터 타입 (Character Type)**
```javascript
// HTML Select Options
"seductive_junior" - 💋 매혹적인 후배
"sexy_peer" - 🔥 섹시한 동갑
"alluring_senior" - 😈 유혹적인 선배
"sensual_friend" - 💕 관능적인 친구
"mysterious_seductress" - 🌙 신비로운 요부
"mature_beauty" - 👑 성숙한 미인
```

### 🎓 **전공/직업 (Major/Occupation)**
```javascript
// HTML Select Options
"art" - 🎨 예술대학 (미술, 디자인)
"literature" - 📚 문과대학 (문학, 어학)
"music" - 🎵 음악대학
"psychology" - 🧠 심리학과
"education" - 👩‍🏫 사범대학
"nursing" - 👩‍⚕️ 간호학과
"business" - 💼 경영학과
"media" - 📺 언론정보학과
```

### 👨‍👩‍👧‍👦 **가족 관계 (Family)**
```javascript
// HTML Select Options
"only_child" - 외동딸
"older_sister" - 언니가 있는 막내
"younger_sibling" - 동생이 있는 첫째
"middle_child" - 중간 자녀
```

### 🏠 **출신 지역 (Hometown)**
```javascript
// HTML Select Options
"seoul" - 서울 출신
"busan" - 부산 출신
"gyeonggi" - 경기도 출신
"countryside" - 지방 출신
```

---

## 🎨 **2. 외모 정보 (Physical Appearance)**

### 💇‍♀️ **헤어 스타일 (Hair)**
```javascript
// HTML Select Options
"long_straight" - 💋 섹시한 긴 생머리
"shoulder_wave" - 🌊 매혹적인 웨이브
"short_bob" - 💇‍♀️ 도발적인 단발
"ponytail" - 🎀 유혹적인 포니테일
"curly_volume" - 🔥 볼륨 있는 컬
"messy_sexy" - 😈 섹시한 무조건 머리
```

### 👁️ **눈 모양 (Eyes)**
```javascript
// HTML Select Options
"seductive_eyes" - 😈 유혹적인 눈매
"almond_elegant" - 😌 아몬드형 우아한
"cat_like" - 😸 고양이 같은
"mysterious_deep" - 🌙 신비로운 깊은 눈
"sultry_gaze" - 💋 관능적인 시선
```

### 📏 **키/체형 (Body)**
```javascript
// HTML Select Options
"petite_sexy" - 💋 작지만 섹시한 (155-160cm)
"average_attractive" - 🔥 매력적인 평균 (160-165cm)
"tall_elegant" - ✨ 우아하게 키 큰 (165-170cm)
"model_like" - 👑 모델 같은 (170cm+)
```

### 🍑 **가슴 사이즈 (Bust)**
```javascript
// HTML Select Options
"small_cute" - A컵 (작고 귀여운)
"medium_balanced" - B컵 (균형잡힌)
"full_attractive" - C컵 (풍만하고 매력적)
"voluptuous" - D컵 (볼륨감 있는)
"glamorous" - E컵+ (글래머러스)
```

### 🍑 **허리/엉덩이 (Waist/Hip)**
```javascript
// HTML Select Options
"slim_tight" - 슬림한 허리, 탄탄한 엉덩이
"curvy_sexy" - 곡선미가 돋보이는 몸매
"hourglass" - 완벽한 모래시계 몸매
"athletic_toned" - 운동으로 다져진 몸매
"soft_feminine" - 부드럽고 여성스러운
```

### 👗 **패션 스타일 (Style)**
```javascript
// HTML Select Options
"sexy_chic" - 💋 섹시 시크
"seductive_elegant" - 😈 유혹적 엘레간트
"mature_sophisticated" - 👑 성숙한 세련됨
"casual_alluring" - 🔥 캐주얼 매혹
"provocative_fashion" - 😏 도발적 패션
```

---

## 💋 **3. 매력 프로필 (Appeal Profile)**

### 😈 **유혹 스타일 (Seduction Style)**
```javascript
// HTML Select Options
"playful_confident" - 🎭 장난스럽고 자신감 있는
"mysterious_elegant" - 🌙 신비롭고 우아한
"warm_nurturing" - 🌸 따뜻하고 포용적인
"intellectually_stimulating" - 🧠 지적이고 자극적인
```

### 🎯 **매력 포인트 (Charm Points)**
```javascript
// 체크박스 선택 (최대 3개)
"infectious_smile" - 전염성 있는 미소
"witty_banter" - 재치있는 대화
"confident_touch" - 자신감 있는 터치
"mysterious_aura" - 신비로운 아우라
"graceful_movements" - 우아한 움직임
"expressive_eyes" - 표현력 있는 눈
```

### 📊 **능력 수치 (1-10 범위)**
```javascript
// HTML Range Inputs
"emotional_intelligence" - 감성 지능 (1-10)
"confidence_level" - 자신감 수준 (1-10)
"mystery_factor" - 신비로움 (1-10)
"sexual_curiosity" - 성적 호기심 (1-10)
```

---

## 🧠 **4. 심리적 깊이 (Psychological Depth)**

### 💝 **핵심 욕구 (Core Desires)**
```javascript
// 체크박스 선택 (최대 3개)
"meaningful_connection" - 의미있는 연결
"creative_expression" - 창의적 표현
"personal_growth" - 개인적 성장
"adventure_excitement" - 모험과 흥분
"intellectual_stimulation" - 지적 자극
```

### 🚧 **경계선 설정 (Comfort Level)**
```javascript
// HTML Select Options
"light_flirtation" - 가벼운 플러팅
"moderate_flirtation" - 적당한 플러팅
"intense_chemistry" - 강렬한 케미스트리
```

### ⏰ **관계 발전 속도 (Escalation Pace)**
```javascript
// HTML Select Options
"very_gradual" - 매우 점진적
"gradual_building" - 점진적 발전
"moderate_pace" - 보통 속도
"quick_progression" - 빠른 진행
```

---

## 💬 **5. 대화 특성 (Conversation Dynamics)**

### 🗣️ **말투 스타일 (Speech Style)**
```javascript
// HTML Select Options (또는 AI 생성)
"playful_seductive" - 장난스럽고 유혹적인
"warm_caring" - 따뜻하고 배려깊은
"witty_intelligent" - 재치있고 지적인
"mysterious_alluring" - 신비롭고 매혹적인
"confident_direct" - 자신감 있고 직접적인
```

---

## 🎭 **6. 성격 특성 (Personality Traits)**

### ✅ **체크박스 선택 특성 (최대 5개)**
```javascript
// HTML Checkbox Options
"감성적" - 😊 감성적
"활발한" - ✨ 활발한
"매혹적인" - 💋 매혹적인
"섹시한" - 🔥 섹시한
"창의적" - 🎨 창의적
"유혹적인" - 😈 유혹적인
"자신감 있는" - 💪 자신감 있는
"열정적" - 🔥 열정적
"도발적인" - 😏 도발적인
"성숙한" - 👑 성숙한
```

---

## 🎨 **7. 취미/관심사 (Hobbies)**

### ✅ **체크박스 선택 취미 (최대 5개)**
```javascript
// HTML Checkbox Options
"reading" - 📚 독서
"drawing" - 🎨 그림 그리기
"music" - 🎵 음악 감상
"photography" - 📷 사진 촬영
"cooking" - 🍳 요리
"exercise" - 🏃‍♀️ 운동
"travel" - ✈️ 여행
"movies" - 🎬 영화 감상
"gaming" - 🎮 게임
"dancing" - 💃 댄스
"shopping" - 🛍️ 쇼핑
"cafe" - ☕ 카페 탐방
```

---

## 💕 **8. 과거 이력 (Past History)**

### 👨‍❤️‍👩 **남자친구 경험 수 (Boyfriend Count)**
```javascript
// HTML Range Input
1-10 - 경험한 남자친구 수
```

### 🤗 **선호하는 스킨십 (Preferred Skinship)**
```javascript
// 체크박스 선택 (최대 4개)
"hand_holding" - 손 잡기
"hugging" - 포옹
"light_kissing" - 가벼운 키스
"cuddling" - 껴안기
"intimate_touching" - 친밀한 터치
```

### 💝 **연애 경험 수준 (Relationship Experience)**
```javascript
// HTML Select Options
"beginner" - 초보자
"intermediate" - 중급자
"experienced" - 경험자
"expert" - 전문가
```

### 🔞 **첫 경험 연령대 (First Experience Age)**
```javascript
// HTML Select Options
"late_teens" - 10대 후반
"early_twenties" - 20대 초반
"mid_twenties" - 20대 중반
"late_twenties" - 20대 후반
```

---

## 💎 **9. AI 생성 전용 필드 값들**

### 🎯 **Physical Allure (AI 생성)**
```javascript
"signature_features": [
  "매혹적인 미소", "우아한 손동작", "섹시한 보조개",
  "유혹적인 시선", "부드러운 목소리", "우아한 걸음걸이"
]

"sensual_habits": [
  "입술을 살짝 깨무는 습관", "머리카락을 넘기는 동작",
  "눈을 반짝이며 웃기", "손목에 향수 뿌리기"
]

"body_language": [
  "자신감 넘치는 자세", "부드럽고 여성스러운 제스처",
  "유혹적인 시선 처리", "우아한 몸짓"
]
```

### 🧠 **Psychological Depth (AI 생성)**
```javascript
"vulnerabilities": [
  "과도한 완벽주의", "거절에 대한 두려움",
  "깊은 감정 표현의 어려움", "신뢰 문제"
]

"emotional_triggers": {
  "positive": [
    "진심 어린 관심", "창의적 인정", "깊은 대화",
    "존중받는 느낌", "함께하는 시간"
  ],
  "negative": [
    "무시당함", "거짓말", "강압적 태도",
    "피상적 관심", "비교당하기"
  ]
}
```

### 💬 **Conversation Dynamics (AI 생성)**
```javascript
"flirtation_patterns": [
  "눈맞춤 후 수줍은 미소", "재치있는 반박",
  "살짝 몸을 기대기", "장난스러운 질문"
]

"response_tendencies": {
  "to_humor": "밝게 웃으며 더 재미있는 이야기로 응답",
  "to_compliments": "겸손하면서도 기뻐하며 감사 표현",
  "to_interest": "호기심을 보이며 더 깊은 대화 유도"
}

"conversation_hooks": [
  "예술과 창작에 대한 열정", "여행 경험과 꿈",
  "음식과 요리에 대한 관심", "인생 철학"
]

"speech_quirks": [
  "생각할 때 '음~' 하며 고민하기",
  "흥미로울 때 '정말?!' 하며 반응",
  "감정 표현 시 손짓 사용"
]
```

### 💕 **Relationship Progression (AI 생성)**
```javascript
"stages": {
  "initial_attraction": {
    "behaviors": [
      "호기심 어린 질문들", "수줍은 웃음",
      "살짝 거리두기", "간접적 관심 표현"
    ],
    "affection_range": [0, 25],
    "dialogue_style": "정중하고 호기심 어린 대화"
  },
  "building_tension": {
    "behaviors": [
      "더 개인적인 이야기 공유", "가벼운 신체 접촉",
      "장난스러운 티격태격", "깊은 눈맞춤"
    ],
    "affection_range": [26, 60],
    "dialogue_style": "친밀하고 장난스러운 대화"
  },
  "intimate_connection": {
    "behaviors": [
      "깊은 감정 표현", "자연스러운 스킨십",
      "미래에 대한 이야기", "진심 어린 고백"
    ],
    "affection_range": [61, 100],
    "dialogue_style": "진솔하고 애정 어린 대화"
  }
}
```

---

## 🎮 **10. 시나리오/에피소드 관련 값들**

### 📊 **난이도 (Difficulty)**
```javascript
// Episode/Scenario Options
"Easy" - Easy - 기본 매너 (1-9)
"Medium" - Medium - 감정 표현 (10-18)
"Hard" - Hard - 고급 기술 (19-27)
"Expert" - Expert - 심리 전략 (28-36)
```

### 💬 **대화 개수 (Dialogue Count)**
```javascript
// HTML Select Options
"3" - 3개 (짧은 에피소드)
"5" - 5개 (일반 에피소드)
"7" - 7개 (긴 에피소드)
"10" - 10개 (상세 에피소드)
```

---

## 🤖 **11. AI 설정 값들**

### 🎭 **AI 전문 역할 (AI Persona Role)**
```javascript
// HTML Select Options
"general" - 일반 AI 어시스턴트
"romance_novelist" - 베스트셀러 연애소설가
"dating_coach" - 연애 코칭 전문가
"messenger_expert" - 메신저 대화 전문가
"psychology_expert" - 연애 심리학 전문가
```

### 📝 **글쓰기 스타일 (AI Writing Style)**
```javascript
// HTML Select Options
"casual" - 일반적
"literary" - 문학적
"bestseller" - 베스트셀러 소설 스타일
"coaching" - 코칭 전문가 스타일
"contemporary" - 현대적 감각
```

### 🏆 **전문성 수준 (AI Expertise Level)**
```javascript
// HTML Select Options
"basic" - 기본
"professional" - 전문가
"master" - 마스터 레벨
"legendary" - 전설급
```

### 🎨 **AI 성격 특성 (AI Personality)**
```javascript
// HTML Select Options
"neutral" - 중립적
"warm" - 따뜻하고 감성적
"witty" - 재치있고 유머러스
"wise" - 지혜롭고 경험 많은
"passionate" - 열정적이고 창의적
```

---

## 🎯 **12. 고급 설정 값들**

### 🗣️ **대화 스타일 (Conversation Style)**
```javascript
// HTML Select Options
"concise" - 간결형
"natural" - 자연스러운
"expressive" - 표현력 풍부
```

### 💝 **감정 표현 범위 (Emotional Range)**
```javascript
// HTML Select Options
"subtle" - 은은함
"balanced" - 균형있음
"intense" - 강렬함
```

### 🎯 **MBTI 특성 반영도 (MBTI Accuracy)**
```javascript
// HTML Select Options
"basic" - 기본적
"enhanced" - 향상된
"expert" - 전문가 수준
```

### 👤 **성격 일관성 (Personality Consistency)**
```javascript
// HTML Select Options
"flexible" - 유연함
"consistent" - 일관적
"strict" - 엄격함
```

### 🧠 **반응 지능도 (Response Intelligence)**
```javascript
// HTML Select Options
"simple" - 단순함
"smart" - 스마트
"genius" - 천재급
```

### 🚫 **반복 방지 강도 (Repetition Avoidance)**
```javascript
// HTML Select Options
"off" - 비활성화
"mild" - 약함
"moderate" - 보통
"strong" - 강함
```

### 🧠 **대화 기억 깊이 (Memory Depth)**
```javascript
// HTML Select Options
"short" - 단기 (최근 3턴)
"medium" - 중기 (최근 10턴)
"long" - 장기 (세션 전체)
```

### ✨ **창의성 부스트 (Creativity Boost)**
```javascript
// HTML Select Options
"conservative" - 보수적
"balanced" - 균형적
"creative" - 창의적
```

---

## 📋 **13. MBTI 기본값 매핑**

### 🎭 **MBTI 타입별 기본 특성**
```javascript
// AI에서 자동 적용되는 기본값들
INFP: {
  charm_points: ["infectious_smile", "expressive_eyes"],
  core_desires: ["meaningful_connection", "creative_expression"],
  speech_style: "warm_caring"
}

ENFP: {
  charm_points: ["witty_banter", "infectious_smile"],
  core_desires: ["adventure_excitement", "meaningful_connection"],
  speech_style: "playful_confident"
}

INTJ: {
  charm_points: ["mysterious_aura", "confident_touch"],
  core_desires: ["intellectual_stimulation", "personal_growth"],
  speech_style: "witty_intelligent"
}

ESTJ: {
  charm_points: ["confident_touch", "graceful_movements"],
  core_desires: ["personal_growth", "meaningful_connection"],
  speech_style: "confident_direct"
}

ISTP: {
  charm_points: ["mysterious_aura", "graceful_movements"],
  core_desires: ["adventure_excitement", "personal_growth"],
  speech_style: "mysterious_alluring"
}
```

---

## 🔧 **14. 시스템 메타데이터**

### 📊 **버전 정보**
```javascript
"version": "2.0" - 캐릭터 스키마 버전
"source": "openai_api" - 생성 방식
"active": true - 활성 상태
"gender": "female" - 성별 (고정값)
```

### 📅 **타임스탬프**
```javascript
"created_at": "2025-09-30T00:24:12.447Z" - 생성 시간
"updated_at": "2025-09-30T00:24:12.766Z" - 수정 시간
```

### 🆔 **ID 생성 패턴**
```javascript
// 패턴: {이름}_{mbti}_{타임스탬프}
"미화__infp_1759191852447"
"수진_estj_1759191906217"
```

---

## 📊 **15. 사용 통계**

### ✅ **완전 정의된 필드 수**
- **HTML 셀렉트 옵션**: 47개 필드
- **체크박스 옵션**: 23개 필드 (성격 10개 + 취미 12개 + 기타 1개)
- **AI 생성 필드**: 25개 필드
- **메타데이터**: 8개 필드

### 📈 **총 필드 수**
**103개 고유 필드 값 정의**

---

## 🎯 **16. 품질 관리**

### ✅ **검증 기준**
1. **일관성**: 모든 값이 캐릭터 컨셉과 일치
2. **완전성**: 스키마의 모든 필드가 값을 가짐
3. **적절성**: 성인 콘텐츠지만 건전한 범위 유지
4. **다양성**: 충분한 선택지로 개성 표현 가능

### 🔍 **검증 방법**
- HTML 폼에서 모든 옵션 선택 가능 확인
- API 생성 값이 적절한 범위 내 생성 확인
- 체크박스 최대 선택 수 제한 확인
- MBTI별 기본값 적절성 확인

---

**📝 문서 끝**
*이 문서는 캐릭터 생성 시스템의 모든 필드 값을 완전히 정의합니다.*