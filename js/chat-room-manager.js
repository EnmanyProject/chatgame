/**
 * ChatRoomManager - 다중 대화방 관리 시스템
 *
 * 주요 기능:
 * - 캐릭터별 독립적인 대화방 생성/관리
 * - 안읽은 메시지 수 추적
 * - 마지막 메시지 및 시간 저장
 * - LocalStorage 기반 영구 저장
 */

class ChatRoomManager {
    constructor() {
        this.STORAGE_KEY = 'chatgame_chat_rooms';
        this.rooms = this.loadRooms();
        console.log('💬 ChatRoomManager 초기화 완료');
    }

    /**
     * LocalStorage에서 대화방 목록 로드
     */
    loadRooms() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const rooms = JSON.parse(data);
                console.log(`📥 ${Object.keys(rooms).length}개의 대화방 로드 완료`);
                return rooms;
            }
        } catch (error) {
            console.error('❌ 대화방 목록 로드 실패:', error);
        }
        return {};
    }

    /**
     * LocalStorage에 대화방 목록 저장
     */
    saveRooms() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.rooms));
            console.log('💾 대화방 목록 저장 완료');
        } catch (error) {
            console.error('❌ 대화방 목록 저장 실패:', error);
        }
    }

    /**
     * 새 대화방 생성
     * @param {string} characterId - 캐릭터 ID
     */
    createRoom(characterId) {
        if (this.rooms[characterId]) {
            console.log(`⚠️ 이미 존재하는 대화방: ${characterId}`);
            return this.rooms[characterId];
        }

        this.rooms[characterId] = {
            characterId,
            createdAt: Date.now(),
            lastMessageTime: Date.now(),
            lastMessage: '대화를 시작해보세요!',
            unreadCount: 0,
            isActive: true
        };

        this.saveRooms();
        console.log(`✅ 새 대화방 생성: ${characterId}`);
        return this.rooms[characterId];
    }

    /**
     * 대화방 정보 가져오기
     * @param {string} characterId - 캐릭터 ID
     */
    getRoom(characterId) {
        return this.rooms[characterId] || null;
    }

    /**
     * 모든 대화방 목록 가져오기 (최신순 정렬)
     */
    getAllRooms() {
        return Object.values(this.rooms).sort((a, b) => {
            return b.lastMessageTime - a.lastMessageTime;
        });
    }

    /**
     * 활성 대화방만 가져오기
     */
    getActiveRooms() {
        return this.getAllRooms().filter(room => room.isActive);
    }

    /**
     * 마지막 메시지 업데이트
     * @param {string} characterId - 캐릭터 ID
     * @param {string} message - 메시지 내용
     * @param {boolean} isUserMessage - 사용자 메시지 여부
     */
    updateLastMessage(characterId, message, isUserMessage = false) {
        if (!this.rooms[characterId]) {
            this.createRoom(characterId);
        }

        this.rooms[characterId].lastMessage = message;
        this.rooms[characterId].lastMessageTime = Date.now();

        // 사용자 메시지가 아니면 (= 캐릭터 메시지면) 안읽은 수 증가
        if (!isUserMessage) {
            this.incrementUnread(characterId);
        }

        this.saveRooms();
        console.log(`📨 ${characterId} 마지막 메시지 업데이트: "${message}"`);
    }

    /**
     * 안읽은 메시지 수 증가
     * @param {string} characterId - 캐릭터 ID
     */
    incrementUnread(characterId) {
        if (!this.rooms[characterId]) {
            this.createRoom(characterId);
        }

        this.rooms[characterId].unreadCount++;
        this.saveRooms();
        console.log(`🔔 ${characterId} 안읽은 메시지: ${this.rooms[characterId].unreadCount}`);
    }

    /**
     * 안읽은 메시지 초기화 (대화방 입장 시)
     * @param {string} characterId - 캐릭터 ID
     */
    clearUnread(characterId) {
        if (!this.rooms[characterId]) {
            return;
        }

        const previousCount = this.rooms[characterId].unreadCount;
        this.rooms[characterId].unreadCount = 0;
        this.saveRooms();

        if (previousCount > 0) {
            console.log(`✅ ${characterId} 안읽은 메시지 ${previousCount}개 읽음 처리`);
        }
    }

    /**
     * 전체 안읽은 메시지 수
     */
    getTotalUnreadCount() {
        return Object.values(this.rooms).reduce((sum, room) => {
            return sum + room.unreadCount;
        }, 0);
    }

    /**
     * 대화방 삭제
     * @param {string} characterId - 캐릭터 ID
     */
    deleteRoom(characterId) {
        if (!this.rooms[characterId]) {
            console.log(`⚠️ 존재하지 않는 대화방: ${characterId}`);
            return false;
        }

        delete this.rooms[characterId];
        this.saveRooms();
        console.log(`🗑️ 대화방 삭제: ${characterId}`);
        return true;
    }

    /**
     * 대화방 비활성화 (삭제 대신 숨김)
     * @param {string} characterId - 캐릭터 ID
     */
    deactivateRoom(characterId) {
        if (!this.rooms[characterId]) {
            return false;
        }

        this.rooms[characterId].isActive = false;
        this.saveRooms();
        console.log(`🔒 대화방 비활성화: ${characterId}`);
        return true;
    }

    /**
     * 대화방 활성화
     * @param {string} characterId - 캐릭터 ID
     */
    activateRoom(characterId) {
        if (!this.rooms[characterId]) {
            this.createRoom(characterId);
            return;
        }

        this.rooms[characterId].isActive = true;
        this.saveRooms();
        console.log(`🔓 대화방 활성화: ${characterId}`);
    }

    /**
     * 모든 대화방 초기화 (개발/테스트용)
     */
    clearAllRooms() {
        this.rooms = {};
        this.saveRooms();
        console.log('🗑️ 모든 대화방 초기화 완료');
    }

    /**
     * 대화방 통계 정보
     */
    getStats() {
        const totalRooms = Object.keys(this.rooms).length;
        const activeRooms = this.getActiveRooms().length;
        const totalUnread = this.getTotalUnreadCount();

        return {
            totalRooms,
            activeRooms,
            inactiveRooms: totalRooms - activeRooms,
            totalUnread
        };
    }

    /**
     * 대화방 정보 출력 (디버깅용)
     */
    debugRooms() {
        console.log('=== 대화방 목록 ===');
        Object.values(this.rooms).forEach(room => {
            console.log(`${room.characterId}:`, {
                마지막메시지: room.lastMessage,
                시간: new Date(room.lastMessageTime).toLocaleString(),
                안읽음: room.unreadCount,
                활성: room.isActive
            });
        });
        console.log('통계:', this.getStats());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatRoomManager;
}
