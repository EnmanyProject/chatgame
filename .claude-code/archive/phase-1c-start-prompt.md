# 🚀 Phase 1-C 작업 시작 프롬프트

---

## 📋 Claude Code 작업 지시

```
안녕 Claude Code! Phase 1-C 작업을 시작하자.

[필수] 먼저 다음 문서들을 읽고 숙지해줘:
1. .claude-code/handoff-to-claude-code.md (전체 프로젝트 개요)
2. .claude-code/phase-1b-start-prompt.md (방금 완료한 작업)
3. claude.md (프로젝트 히스토리)

[완료 확인] Phase 1-B 작업 내역:
✅ js/episode-trigger-engine.js 생성 완료
✅ 시간/호감도/행동/랜덤 트리거 구현
✅ 캐릭터가 자동으로 먼저 연락하는 시스템
✅ Git 커밋 & 푸시 완료
```

---

## 🎯 Phase 1-C 작업 목표

**작업명**: 멀티 캐릭터 동시 채팅 시스템  
**파일 생성**: 
- `character-list-ui.html` (대화방 목록 화면)
- `js/chat-room-manager.js` (대화방 관리 시스템)
- `js/multi-character-state.js` (여러 캐릭터 상태 관리)

**예상 시간**: 1일 작업  
**목표**: 카카오톡처럼 여러 캐릭터와 동시에 채팅하는 시스템

---

## 📱 UI/UX 요구사항

### 화면 구성
```
┌─────────────────────────────────────────┐
│  💬 대화방                    [+] [⚙️]  │ ← 헤더
├─────────────────────────────────────────┤
│  🔍 검색                                │ ← 검색창
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [사진] 윤아 (INFP)          1   │   │ ← 대화방 1
│  │        "오빠 뭐해?"              │   │
│  │                          14:23  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [사진] 미나 (ENFP)          5   │   │ ← 대화방 2
│  │        "오빠~ 놀아줘!"           │   │
│  │                          12:15  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [사진] 서연 (INTJ)              │   │ ← 대화방 3
│  │        "논문 읽는 중..."         │   │
│  │                          어제   │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

카드 클릭 → chat-ui.html?character=yuna_infp
```

---

## 📝 상세 작업 내용

### 1️⃣ character-list-ui.html (50% 비중)

#### 구현 요구사항:
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>대화방 - 연애 시뮬레이션</title>
  <style>
    /* 카카오톡 스타일 CSS */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #b2c7d9;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .container {
      width: 100%;
      max-width: 480px;
      height: 100vh;
      background-color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }

    /* 헤더 */
    .header {
      background-color: #3a5068;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      font-size: 20px;
      font-weight: bold;
    }

    .header-buttons {
      display: flex;
      gap: 15px;
    }

    .header-button {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }

    /* 검색창 */
    .search-bar {
      padding: 10px 20px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }

    .search-input {
      width: 100%;
      padding: 10px 15px;
      border: none;
      border-radius: 20px;
      background-color: white;
      font-size: 14px;
    }

    /* 대화방 리스트 */
    .chat-list {
      flex: 1;
      overflow-y: auto;
      background-color: white;
    }

    .chat-room {
      display: flex;
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .chat-room:hover {
      background-color: #f8f8f8;
    }

    .chat-room.has-unread {
      background-color: #fef9e7;
    }

    /* 프로필 사진 */
    .profile-pic {
      width: 50px;
      height: 50px;
      border-radius: 25px;
      background-color: #ddd;
      margin-right: 15px;
      object-fit: cover;
    }

    /* 대화방 정보 */
    .chat-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .chat-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mbti-badge {
      font-size: 11px;
      padding: 2px 6px;
      background-color: #3a5068;
      color: white;
      border-radius: 10px;
      font-weight: normal;
    }

    .last-message {
      font-size: 14px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* 메타 정보 */
    .chat-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      gap: 5px;
    }

    .last-time {
      font-size: 12px;
      color: #999;
    }

    .unread-badge {
      background-color: #ff6b6b;
      color: white;
      border-radius: 12px;
      padding: 3px 8px;
      font-size: 12px;
      font-weight: bold;
      min-width: 20px;
      text-align: center;
    }

    /* 플로팅 버튼 */
    .fab {
      position: absolute;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background-color: #ffeb3b;
      color: #3a5068;
      font-size: 28px;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: transform 0.2s;
    }

    .fab:hover {
      transform: scale(1.1);
    }

    /* 빈 상태 */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .empty-state-text {
      font-size: 16px;
      margin-bottom: 10px;
    }

    .empty-state-button {
      margin-top: 20px;
      padding: 12px 30px;
      background-color: #ffeb3b;
      color: #3a5068;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }

    /* 로딩 */
    .loading {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    /* 모바일 최적화 */
    @media (max-width: 480px) {
      .container {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 헤더 -->
    <div class="header">
      <div class="header-title">💬 대화방</div>
      <div class="header-buttons">
        <button class="header-button" onclick="openSearch()">🔍</button>
        <button class="header-button" onclick="openSettings()">⚙️</button>
      </div>
    </div>

    <!-- 검색창 -->
    <div class="search-bar">
      <input 
        type="text" 
        class="search-input" 
        placeholder="대화방 검색"
        id="searchInput"
        oninput="filterChatRooms()"
      >
    </div>

    <!-- 대화방 리스트 -->
    <div class="chat-list" id="chatList">
      <!-- 로딩 -->
      <div class="loading" id="loadingIndicator">
        대화방을 불러오는 중...
      </div>

      <!-- 대화방이 없을 때 -->
      <div class="empty-state" id="emptyState" style="display: none;">
        <div class="empty-state-icon">💔</div>
        <div class="empty-state-text">아직 대화 중인 캐릭터가 없어요</div>
        <div class="empty-state-text" style="font-size: 14px; color: #ccc;">
          새 캐릭터를 추가해서 대화를 시작해보세요!
        </div>
        <button class="empty-state-button" onclick="addNewCharacter()">
          + 새 캐릭터 추가
        </button>
      </div>
    </div>

    <!-- 새 대화 버튼 (플로팅) -->
    <button class="fab" onclick="addNewCharacter()" title="새 대화 시작">
      +
    </button>
  </div>

  <script src="js/chat-room-manager.js"></script>
  <script src="js/multi-character-state.js"></script>
  <script>
    // 페이지 로드 시 대화방 목록 로드
    document.addEventListener('DOMContentLoaded', () => {
      loadChatRooms();
      
      // 30초마다 업데이트 (새 메시지 확인)
      setInterval(() => {
        updateChatRoomList();
      }, 30000);
    });

    // 대화방 목록 로드
    async function loadChatRooms() {
      try {
        const chatRooms = await ChatRoomManager.getAllChatRooms();
        renderChatRooms(chatRooms);
      } catch (error) {
        console.error('대화방 로드 실패:', error);
        showError('대화방을 불러오는데 실패했습니다.');
      }
    }

    // 대화방 렌더링
    function renderChatRooms(chatRooms) {
      const chatList = document.getElementById('chatList');
      const loading = document.getElementById('loadingIndicator');
      const emptyState = document.getElementById('emptyState');

      loading.style.display = 'none';

      if (chatRooms.length === 0) {
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';

      // 마지막 메시지 시간 순으로 정렬
      chatRooms.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      chatList.innerHTML = chatRooms.map(room => `
        <div 
          class="chat-room ${room.unreadCount > 0 ? 'has-unread' : ''}"
          onclick="openChatRoom('${room.characterId}')"
        >
          <img 
            src="${room.profilePic || 'assets/default-profile.png'}" 
            alt="${room.characterName}"
            class="profile-pic"
            onerror="this.src='assets/default-profile.png'"
          >
          <div class="chat-info">
            <div class="chat-name">
              ${room.characterName}
              <span class="mbti-badge">${room.mbti}</span>
            </div>
            <div class="last-message">${room.lastMessage || '대화를 시작해보세요'}</div>
          </div>
          <div class="chat-meta">
            <div class="last-time">${formatTime(room.lastMessageTime)}</div>
            ${room.unreadCount > 0 ? `
              <div class="unread-badge">${room.unreadCount > 99 ? '99+' : room.unreadCount}</div>
            ` : ''}
          </div>
        </div>
      `).join('');
    }

    // 시간 포맷
    function formatTime(timestamp) {
      if (!timestamp) return '';

      const now = Date.now();
      const diff = now - timestamp;
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

    // 대화방 열기
    function openChatRoom(characterId) {
      // 읽음 처리
      ChatRoomManager.markAsRead(characterId);
      
      // chat-ui.html로 이동
      window.location.href = `chat-ui.html?character=${characterId}`;
    }

    // 대화방 검색
    function filterChatRooms() {
      const searchText = document.getElementById('searchInput').value.toLowerCase();
      const chatRooms = document.querySelectorAll('.chat-room');

      chatRooms.forEach(room => {
        const name = room.querySelector('.chat-name').textContent.toLowerCase();
        const message = room.querySelector('.last-message').textContent.toLowerCase();
        
        if (name.includes(searchText) || message.includes(searchText)) {
          room.style.display = 'flex';
        } else {
          room.style.display = 'none';
        }
      });
    }

    // 대화방 목록 업데이트 (새 메시지 확인)
    async function updateChatRoomList() {
      const chatRooms = await ChatRoomManager.getAllChatRooms();
      renderChatRooms(chatRooms);
    }

    // 새 캐릭터 추가
    function addNewCharacter() {
      // 캐릭터 선택 모달 열기
      window.location.href = 'character-select.html';
    }

    // 검색 열기
    function openSearch() {
      document.getElementById('searchInput').focus();
    }

    // 설정 열기
    function openSettings() {
      window.location.href = 'settings.html';
    }

    // 에러 표시
    function showError(message) {
      alert(message);
    }
  </script>
</body>
</html>
```

---

### 2️⃣ js/chat-room-manager.js (30% 비중)

#### 구현 요구사항:
```javascript
/**
 * Chat Room Manager
 * 여러 캐릭터와의 대화방을 관리
 */

class ChatRoomManager {
  constructor() {
    this.chatRooms = this.loadFromStorage();
  }

  // 모든 대화방 가져오기
  static async getAllChatRooms() {
    const manager = new ChatRoomManager();
    return manager.chatRooms;
  }

  // 대화방 생성/업데이트
  static createOrUpdateRoom(characterId, data) {
    const manager = new ChatRoomManager();
    
    const existingRoom = manager.chatRooms.find(
      room => room.characterId === characterId
    );

    if (existingRoom) {
      // 기존 대화방 업데이트
      Object.assign(existingRoom, data);
      existingRoom.lastMessageTime = Date.now();
    } else {
      // 새 대화방 생성
      manager.chatRooms.push({
        characterId: characterId,
        characterName: data.characterName,
        mbti: data.mbti,
        profilePic: data.profilePic,
        lastMessage: data.lastMessage || '',
        lastMessageTime: Date.now(),
        unreadCount: 0,
        isPinned: false,
        isMuted: false
      });
    }

    manager.saveToStorage();
    return manager.chatRooms;
  }

  // 마지막 메시지 업데이트
  static updateLastMessage(characterId, message, isFromUser = false) {
    const manager = new ChatRoomManager();
    const room = manager.chatRooms.find(
      room => room.characterId === characterId
    );

    if (room) {
      room.lastMessage = message;
      room.lastMessageTime = Date.now();
      
      // 캐릭터가 보낸 메시지면 읽지 않음 카운트 증가
      if (!isFromUser) {
        room.unreadCount = (room.unreadCount || 0) + 1;
      }

      manager.saveToStorage();
    }
  }

  // 읽음 처리
  static markAsRead(characterId) {
    const manager = new ChatRoomManager();
    const room = manager.chatRooms.find(
      room => room.characterId === characterId
    );

    if (room) {
      room.unreadCount = 0;
      manager.saveToStorage();
    }
  }

  // 대화방 삭제
  static deleteRoom(characterId) {
    const manager = new ChatRoomManager();
    manager.chatRooms = manager.chatRooms.filter(
      room => room.characterId !== characterId
    );
    manager.saveToStorage();
  }

  // 대화방 고정/해제
  static togglePin(characterId) {
    const manager = new ChatRoomManager();
    const room = manager.chatRooms.find(
      room => room.characterId === characterId
    );

    if (room) {
      room.isPinned = !room.isPinned;
      manager.saveToStorage();
    }
  }

  // 알림 음소거/해제
  static toggleMute(characterId) {
    const manager = new ChatRoomManager();
    const room = manager.chatRooms.find(
      room => room.characterId === characterId
    );

    if (room) {
      room.isMuted = !room.isMuted;
      manager.saveToStorage();
    }
  }

  // 특정 대화방 정보 가져오기
  static getRoom(characterId) {
    const manager = new ChatRoomManager();
    return manager.chatRooms.find(
      room => room.characterId === characterId
    );
  }

  // 읽지 않은 메시지 총 개수
  static getTotalUnreadCount() {
    const manager = new ChatRoomManager();
    return manager.chatRooms.reduce(
      (total, room) => total + (room.unreadCount || 0),
      0
    );
  }

  // localStorage에서 로드
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('chatRooms');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('대화방 로드 실패:', error);
      return [];
    }
  }

  // localStorage에 저장
  saveToStorage() {
    try {
      localStorage.setItem('chatRooms', JSON.stringify(this.chatRooms));
      
      // 총 읽지 않은 개수를 브라우저 타이틀에 표시
      const totalUnread = this.chatRooms.reduce(
        (total, room) => total + (room.unreadCount || 0),
        0
      );
      
      if (totalUnread > 0) {
        document.title = `(${totalUnread}) 대화방`;
      } else {
        document.title = '대화방';
      }
    } catch (error) {
      console.error('대화방 저장 실패:', error);
    }
  }
}

// 전역 접근 가능하게
window.ChatRoomManager = ChatRoomManager;
```

---

### 3️⃣ js/multi-character-state.js (20% 비중)

#### 구현 요구사항:
```javascript
/**
 * Multi Character State Manager
 * 여러 캐릭터의 상태를 독립적으로 관리
 */

class MultiCharacterState {
  constructor() {
    this.states = this.loadAllStates();
  }

  // 특정 캐릭터 상태 가져오기
  static getState(characterId) {
    const manager = new MultiCharacterState();
    
    if (!manager.states[characterId]) {
      // 새 캐릭터면 초기 상태 생성
      manager.states[characterId] = manager.createInitialState(characterId);
      manager.saveAllStates();
    }

    return manager.states[characterId];
  }

  // 특정 캐릭터 상태 업데이트
  static updateState(characterId, updates) {
    const manager = new MultiCharacterState();
    
    if (!manager.states[characterId]) {
      manager.states[characterId] = manager.createInitialState(characterId);
    }

    Object.assign(manager.states[characterId], updates);
    manager.saveAllStates();

    return manager.states[characterId];
  }

  // 호감도 업데이트
  static updateAffection(characterId, delta) {
    const state = MultiCharacterState.getState(characterId);
    const oldAffection = state.affection;
    
    state.affection = Math.max(1, Math.min(10, state.affection + delta));
    
    // 호감도 변화 이벤트 발생
    if (state.affection !== oldAffection) {
      const event = new CustomEvent('affectionChanged', {
        detail: {
          characterId: characterId,
          old: oldAffection,
          new: state.affection,
          delta: delta
        }
      });
      window.dispatchEvent(event);
    }

    MultiCharacterState.updateState(characterId, { affection: state.affection });
    return state.affection;
  }

  // 애정도 업데이트
  static updateLove(characterId, delta) {
    const state = MultiCharacterState.getState(characterId);
    state.love = Math.max(1, Math.min(10, state.love + delta));
    MultiCharacterState.updateState(characterId, { love: state.love });
    return state.love;
  }

  // 감정 상태 설정
  static setEmotion(characterId, emotion) {
    MultiCharacterState.updateState(characterId, { emotion: emotion });
  }

  // 대화 톤 레벨 계산
  static getToneLevel(characterId) {
    const state = MultiCharacterState.getState(characterId);
    
    if (state.affection <= 2) return 1; // 존댓말
    if (state.affection <= 4) return 2; // 반말
    if (state.affection <= 6) return 3; // 애교
    if (state.affection <= 8) return 4; // 애정표현
    return 5; // 적극적
  }

  // 답장 속도 계산
  static getResponseSpeed(characterId) {
    const state = MultiCharacterState.getState(characterId);
    
    // 호감도와 감정 상태에 따라 답장 속도 결정
    if (state.emotion === 'angry') return 5; // 매우 느림
    if (state.emotion === 'sad') return 4;
    if (state.affection <= 3) return 3; // 보통
    if (state.affection <= 6) return 2; // 빠름
    return 1; // 매우 빠름
  }

  // 먼저 연락 확률 계산
  static getContactProbability(characterId) {
    const state = MultiCharacterState.getState(characterId);
    
    if (state.affection <= 2) return 0;
    if (state.affection <= 4) return 10;
    if (state.affection <= 6) return 30;
    if (state.affection <= 8) return 60;
    return 90;
  }

  // 사진 레어도 계산
  static getPhotoRarity(characterId) {
    const state = MultiCharacterState.getState(characterId);
    
    if (state.affection <= 3) return 1; // Common만
    if (state.affection <= 6) return 2; // Rare까지
    if (state.affection <= 8) return 3; // Epic까지
    return 4; // Legendary까지
  }

  // 마지막 유저 응답 시간 업데이트
  static updateLastReply(characterId) {
    MultiCharacterState.updateState(characterId, {
      lastUserReply: Date.now()
    });
  }

  // 대화 히스토리 추가
  static addToHistory(characterId, message) {
    const state = MultiCharacterState.getState(characterId);
    
    if (!state.conversationHistory) {
      state.conversationHistory = [];
    }

    state.conversationHistory.push({
      ...message,
      timestamp: Date.now()
    });

    // 최근 50개만 유지 (메모리 절약)
    if (state.conversationHistory.length > 50) {
      state.conversationHistory = state.conversationHistory.slice(-50);
    }

    MultiCharacterState.updateState(characterId, {
      conversationHistory: state.conversationHistory
    });
  }

  // 대화 히스토리 가져오기
  static getHistory(characterId, limit = 50) {
    const state = MultiCharacterState.getState(characterId);
    const history = state.conversationHistory || [];
    return history.slice(-limit);
  }

  // 캐릭터 상태 초기화
  static resetState(characterId) {
    const manager = new MultiCharacterState();
    manager.states[characterId] = manager.createInitialState(characterId);
    manager.saveAllStates();
  }

  // 캐릭터 삭제
  static deleteCharacter(characterId) {
    const manager = new MultiCharacterState();
    delete manager.states[characterId];
    manager.saveAllStates();
  }

  // 초기 상태 생성
  createInitialState(characterId) {
    return {
      characterId: characterId,
      affection: 1,
      love: 1,
      emotion: 'normal',
      lastUserReply: Date.now(),
      conversationHistory: [],
      createdAt: Date.now()
    };
  }

  // 모든 상태 로드
  loadAllStates() {
    try {
      const stored = localStorage.getItem('multiCharacterStates');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('캐릭터 상태 로드 실패:', error);
      return {};
    }
  }

  // 모든 상태 저장
  saveAllStates() {
    try {
      localStorage.setItem(
        'multiCharacterStates',
        JSON.stringify(this.states)
      );
    } catch (error) {
      console.error('캐릭터 상태 저장 실패:', error);
    }
  }

  // 모든 캐릭터 ID 가져오기
  static getAllCharacterIds() {
    const manager = new MultiCharacterState();
    return Object.keys(manager.states);
  }

  // 통계 정보
  static getStatistics() {
    const manager = new MultiCharacterState();
    const characterIds = Object.keys(manager.states);

    return {
      totalCharacters: characterIds.length,
      averageAffection: characterIds.reduce((sum, id) => 
        sum + manager.states[id].affection, 0
      ) / characterIds.length || 0,
      highestAffection: Math.max(...characterIds.map(id => 
        manager.states[id].affection
      ), 0),
      totalMessages: characterIds.reduce((sum, id) => 
        sum + (manager.states[id].conversationHistory?.length || 0), 0
      )
    };
  }
}

// 전역 접근 가능하게
window.MultiCharacterState = MultiCharacterState;
```

---

## 🔗 기존 시스템 연동

### chat-ui.html 수정사항:

```javascript
// chat-ui.html 시작 부분에 추가

// URL에서 캐릭터 ID 가져오기
function getCharacterIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('character');
}

// 채팅 시작
function startChat() {
  const characterId = getCharacterIdFromURL();
  
  if (!characterId) {
    alert('캐릭터를 선택해주세요.');
    window.location.href = 'character-list-ui.html';
    return;
  }

  // 대화방에 추가 (없으면 생성)
  const characterData = loadCharacterData(characterId);
  ChatRoomManager.createOrUpdateRoom(characterId, {
    characterName: characterData.name,
    mbti: characterData.mbti,
    profilePic: characterData.photo
  });

  // 캐릭터 상태 로드
  const state = MultiCharacterState.getState(characterId);
  
  // 기존 대화 히스토리 로드
  const history = MultiCharacterState.getHistory(characterId);
  renderHistory(history);

  // 트리거 엔진 시작
  startTriggerEngine(characterId);
  
  // 읽음 처리
  ChatRoomManager.markAsRead(characterId);
}

// 메시지 전송 시
function sendMessage(message, isFromUser) {
  const characterId = getCharacterIdFromURL();

  // 대화 히스토리에 추가
  MultiCharacterState.addToHistory(characterId, {
    type: isFromUser ? 'user' : 'character',
    text: message
  });

  // 대화방 마지막 메시지 업데이트
  ChatRoomManager.updateLastMessage(characterId, message, isFromUser);

  // 유저 메시지면 마지막 응답 시간 업데이트
  if (isFromUser) {
    MultiCharacterState.updateLastReply(characterId);
  }
}

// 뒤로가기 버튼
function goBack() {
  window.location.href = 'character-list-ui.html';
}
```

### episode-trigger-engine.js 수정사항:

```javascript
// 각 트리거 클래스의 생성자에서 MultiCharacterState 사용

class TimeBasedTrigger {
  constructor(characterId) {
    this.characterId = characterId;
    this.state = MultiCharacterState.getState(characterId);
    // ...
  }

  sendMessage(timeSlot) {
    const message = this.getRandomMessage(timeSlot);
    
    // 메시지 전송
    episodeDelivery.addToQueue({
      type: 'character_message',
      text: message,
      delay: 0
    });

    // 대화방 업데이트
    ChatRoomManager.updateLastMessage(this.characterId, message, false);
    
    this.saveLastSent(timeSlot);
  }
}
```

---

## ✅ 완료 기준

### 테스트 체크리스트:
```
□ character-list-ui.html 생성
  - 카카오톡 스타일 UI
  - 대화방 카드 표시
  - 읽지 않은 메시지 배지
  - 검색 기능

□ chat-room-manager.js 생성
  - 대화방 생성/업데이트
  - 마지막 메시지 관리
  - 읽음/안읽음 처리
  - localStorage 저장

□ multi-character-state.js 생성
  - 캐릭터별 독립 상태
  - 호감도/애정도 관리
  - 대화 히스토리 저장
  - 통계 기능

□ 기존 시스템 연동
  - chat-ui.html URL 파라미터
  - 대화방 ↔ 채팅 화면 이동
  - 트리거 엔진 연동

□ 멀티 캐릭터 테스트
  - 3명 캐릭터 동시 진행
  - 각각 다른 호감도
  - 독립적인 대화 히스토리
  - 트리거 독립 작동

□ UI/UX
  - 모바일 반응형
  - 시간 포맷팅
  - 읽지 않은 배지
  - 빈 상태 처리
```

---

## 📦 최종 파일 구조

```
chatgame/
├── character-list-ui.html (신규 - 대화방 목록)
├── chat-ui.html (수정 - URL 파라미터 처리)
├── js/
│   ├── chat-room-manager.js (신규)
│   ├── multi-character-state.js (신규)
│   ├── character-state-manager.js (기존 - 단일 캐릭터용, 유지)
│   ├── episode-trigger-engine.js (수정)
│   └── episode-delivery-system.js (유지)
└── assets/
    └── default-profile.png (기본 프로필 사진)
```

---

## 🚀 Git 작업

### 작업 완료 후:
```bash
# 1. 파일 스테이징
git add character-list-ui.html
git add js/chat-room-manager.js
git add js/multi-character-state.js
git add chat-ui.html
git add js/episode-trigger-engine.js

# 2. 커밋
git commit -m "Phase 1-C: 멀티 캐릭터 동시 채팅 시스템 완성

- character-list-ui.html (카카오톡 스타일)
- chat-room-manager.js (대화방 관리)
- multi-character-state.js (캐릭터별 독립 상태)
- 읽지 않은 메시지 배지
- 대화방 검색 기능
- 기존 시스템 완전 연동"

# 3. 푸시
git push origin main
```

---

## 📝 완료 보고 양식

```markdown
Phase 1-C 완료 보고

✅ 생성 파일:
- character-list-ui.html (~400줄)
- js/chat-room-manager.js (~250줄)
- js/multi-character-state.js (~300줄)

✅ 수정 파일:
- chat-ui.html (URL 파라미터 처리)
- js/episode-trigger-engine.js (멀티 캐릭터 지원)

🧪 테스트 결과:
- 대화방 리스트 UI: ✅ 통과
- 대화방 관리: ✅ 통과
- 멀티 상태 관리: ✅ 통과
- 읽음/안읽음: ✅ 통과
- 검색 기능: ✅ 통과
- 독립 작동: ✅ 통과

📊 코드 품질:
- 총 코드: ~950줄
- 주석 포함: 80%+
- 에러 처리: 완료
- 모바일 반응형: 완료

🔄 Git:
- 커밋: "Phase 1-C: 멀티 캐릭터 동시 채팅 시스템 완성"
- 푸시: 완료
- Vercel 배포: 자동 완료

🎯 다음: Phase 1-D (통합 테스트 및 버그 수정)
```

---

## 💡 개발 팁

### 디버깅:
```javascript
// 콘솔에서 테스트
ChatRoomManager.getAllChatRooms(); // 모든 대화방
MultiCharacterState.getStatistics(); // 통계
MultiCharacterState.getState('yuna_infp'); // 특정 캐릭터 상태
```

### 더미 데이터 생성 (테스트용):
```javascript
// 3명 캐릭터 더미 데이터
ChatRoomManager.createOrUpdateRoom('yuna_infp', {
  characterName: '윤아',
  mbti: 'INFP',
  profilePic: 'assets/yuna.jpg',
  lastMessage: '오빠 뭐해?'
});

ChatRoomManager.createOrUpdateRoom('mina_enfp', {
  characterName: '미나',
  mbti: 'ENFP',
  profilePic: 'assets/mina.jpg',
  lastMessage: '오빠~ 놀아줘!'
});

ChatRoomManager.createOrUpdateRoom('seoyeon_intj', {
  characterName: '서연',
  mbti: 'INTJ',
  profilePic: 'assets/seoyeon.jpg',
  lastMessage: '논문 읽는 중...'
});
```

---

## 🎯 최종 목표

사용자가 character-list-ui.html에 접속하면:
1. **카카오톡처럼 대화방 목록 표시** ✨
2. 각 대화방마다 마지막 메시지/시간/안 읽은 개수
3. 대화방 클릭 → 해당 캐릭터와 채팅
4. 여러 캐릭터와 동시 채팅 가능
5. 각 캐릭터 독립적인 호감도/상태 관리

---

**작업 시작하자! 화이팅! 🚀**
