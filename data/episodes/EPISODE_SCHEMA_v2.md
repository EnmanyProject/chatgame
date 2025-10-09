# Episode System v2.0 - Character-Based Architecture

## 📋 Overview
에피소드 시스템 v2.0은 **캐릭터 중심** 구조로, 각 캐릭터가 자신만의 에피소드 풀을 관리합니다.

## 🗂️ File Structure
```
data/episodes/
├── {character_id}_episodes.json  # 캐릭터별 에피소드 파일
├── {character_id}_episodes.json
└── EPISODE_SCHEMA_v2.md          # 이 문서
```

### Legacy (삭제 예정):
- `episode-database.json` - 시나리오 기반 구조 (deprecated)

## 📊 Data Schema

### Character Episode File Format
```json
{
  "character_id": "미화_enfp_12345",
  "character_name": "미화",
  "character_mbti": "ENFP",
  "total_episodes": 3,
  "metadata": {
    "version": "2.0.0",
    "schema_type": "character_based",
    "created_at": "2025-10-09T...",
    "last_updated": "2025-10-09T..."
  },
  "episodes": {
    "ep_미화_술키스_abc123": {
      "id": "ep_미화_술키스_abc123",
      "character_id": "미화_enfp_12345",
      "scenario_template_id": "술김에_한_키스",
      "title": "미화와 술김에 한 키스",
      "description": "술자리 후 어색한 분위기에서...",
      "status": "pending",
      "trigger_conditions": {
        "type": "affection_based",
        "affection_min": 10,
        "affection_max": 30,
        "time_based": "evening_weekend",
        "event_based": null,
        "priority": 5
      },
      "dialogue_count": 5,
      "difficulty": "Medium",
      "created_at": "2025-10-09T...",
      "sent_at": null,
      "completed_at": null,
      "play_stats": {
        "played_count": 0,
        "last_played": null,
        "best_affection_gain": 0
      },
      "dialogues": []
    }
  }
}
```

## 🔄 Episode Lifecycle

```
pending → sent → playing → completed
   ↓        ↓        ↓          ↓
 생성됨   전송됨   플레이중   완료됨
```

### Status Descriptions
- **pending**: 에피소드가 생성되었지만 트리거 조건을 만족하지 않아 대기 중
- **sent**: 트리거 조건 만족, 캐릭터 대화방으로 전송되어 플레이 가능
- **playing**: 유저가 현재 플레이 중
- **completed**: 유저가 에피소드를 완료함

## 🎯 Trigger System

### Trigger Types

#### 1. Affection-Based (호감도 기반)
```json
{
  "type": "affection_based",
  "affection_min": 10,
  "affection_max": 30,
  "priority": 5
}
```
- 현재 호감도가 min~max 범위 내일 때 활성화
- priority가 높을수록 우선 전송

#### 2. Time-Based (시간 기반)
```json
{
  "type": "time_based",
  "time_based": "evening_weekend",
  "affection_min": 5
}
```
Options:
- `morning_weekday` - 평일 아침 (6-11시)
- `lunch_time` - 점심 시간 (11-14시)
- `afternoon` - 오후 (14-18시)
- `evening_weekend` - 주말 저녁 (18-23시)
- `late_night` - 심야 (23-6시)

#### 3. Event-Based (이벤트 기반)
```json
{
  "type": "event_based",
  "event_based": "first_kiss_completed",
  "affection_min": 20
}
```
- 특정 에피소드 완료 후 활성화
- 연속된 스토리라인 구현 가능

#### 4. Combo (복합 조건)
```json
{
  "type": "combo",
  "affection_min": 15,
  "affection_max": 25,
  "time_based": "evening_weekend",
  "event_based": "first_date_completed",
  "priority": 10
}
```

## 📍 Integration Points

### Phase 2 Systems Integration

#### 1. Tone Variation System (톤 변화)
- 호감도에 따라 에피소드 내 대사 톤 자동 조절
- 연동 포인트: `episode.dialogue` 생성 시 현재 호감도 참조

#### 2. Photo Sending System (사진 전송)
- 특정 에피소드 완료 시 사진 전송 트리거
- 연동 포인트: `episode.status = 'completed'` 이벤트

#### 3. First Contact System (먼저 연락)
- 에피소드 pending 상태에서 캐릭터가 먼저 말 걸기 가능
- 연동 포인트: `trigger_conditions` 체크 → 먼저 연락 메시지

## 🔧 API Endpoints (Planned)

### Character-Centric Endpoints
```
GET  /api/episode-manager?action=list&character_id={id}
POST /api/episode-manager?action=create&character_id={id}
PUT  /api/episode-manager?action=update&episode_id={id}
DELETE /api/episode-manager?action=delete&episode_id={id}

GET  /api/episode-manager?action=check_triggers&character_id={id}
POST /api/episode-manager?action=send_to_chatroom&episode_id={id}
POST /api/episode-manager?action=complete_episode&episode_id={id}
```

### Episode Status Management
```
POST /api/episode-manager?action=change_status
Body: {
  "episode_id": "ep_xxx",
  "new_status": "sent|playing|completed",
  "affection_change": 5  // 완료 시 호감도 변화
}
```

## 🎮 UI Workflow (Admin)

```
1. 캐릭터 선택 화면
   └── 미화 (ENFP) - 에피소드 3개
   └── 시은 (ISTP) - 에피소드 5개

2. 캐릭터 에피소드 풀 화면
   └── [pending] 술김에 한 키스 (호감도 10-30)
   └── [sent] 바퀴벌레 소동 (대화방 전송됨)
   └── [completed] 첫 데이트 (2025-10-08 완료)

3. 에피소드 생성/편집 화면
   └── 시나리오 템플릿 선택
   └── 트리거 조건 설정
   └── 대화 생성
```

## 📝 Migration Notes

### From v1.0 (Scenario-Based) to v2.0 (Character-Based)

기존 데이터 구조:
```json
{
  "episodes": {
    "ep_xxx": {
      "scenario_id": "scenario_도와줘_xxx",
      "character_id": null,  // 캐릭터 정보 없음
      ...
    }
  }
}
```

새 데이터 구조:
```json
// 캐릭터별 파일로 분리
{
  "character_id": "미화_enfp",
  "episodes": {
    "ep_미화_도와줘_xxx": {
      "scenario_template_id": "도와줘",  // 템플릿 참조
      "character_id": "미화_enfp",
      ...
    }
  }
}
```

### Migration Script (TODO)
```javascript
// pseudo-code
for each episode in old_database:
  if episode.character_id exists:
    character_file = load(character_id + "_episodes.json")
    character_file.episodes[episode.id] = episode
    save(character_file)
  else:
    // 캐릭터 정보 없는 에피소드는 삭제 또는 수동 할당
```

## 🚀 Next Steps

1. ✅ 데이터 스키마 정의 완료
2. ✅ 캐릭터별 에피소드 파일 생성 완료
3. ⏳ `api/episode-manager.js` 생성 (캐릭터 중심)
4. ⏳ 트리거 체크 시스템 구현
5. ⏳ Admin UI 재설계
6. ⏳ Phase 2 시스템 연동

## 📅 Version History
- **v2.0.0** (2025-10-09): Character-based architecture 도입
- **v1.0.0** (2025-09-29): Initial scenario-based structure (deprecated)
