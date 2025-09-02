// 36퀘스트 관리 시스템 - v1.0.0

class QuestManager {
    constructor() {
        this.questData = null;
        this.characterData = null;
        this.currentQuest = null;
        this.currentCharacter = null;
        this.unlockedQuests = ['quest_001']; // 기본적으로 첫 퀘스트만 언락
        this.completedQuests = [];
        this.userProgress = {
            totalAffection: 0,
            questsCompleted: 0,
            currentStreak: 0
        };
    }

    // 퀘스트 데이터 로드
    async loadQuestData() {
        try {
            const response = await fetch('/api/quest-manager?action=list');
            const data = await response.json();
            
            if (data.success) {
                this.questData = data;
                console.log('✅ 퀘스트 데이터 로드 완료:', data.total_quests, '개 퀘스트');
                return true;
            }
        } catch (error) {
            console.error('❌ 퀘스트 데이터 로드 실패:', error);
            // Fallback 데이터 로드
            this.loadFallbackData();
            return false;
        }
    }

    // Fallback 데이터 로드 (오프라인 또는 API 실패 시)
    loadFallbackData() {
        this.questData = {
            metadata: {
                version: "1.0.0",
                total_quests: 36,
                categories: 4
            },
            categories: {
                daily_romance: {
                    id: "daily_romance",
                    name: "일상 로맨스",
                    description: "평범한 일상 속 설렘과 로맨스",
                    difficulty: "easy"
                },
                deep_emotions: {
                    id: "deep_emotions",
                    name: "깊은 감정",
                    description: "서로의 마음을 깊이 이해하는 순간들",
                    difficulty: "medium"
                },
                conflict_resolution: {
                    id: "conflict_resolution",
                    name: "갈등과 화해",
                    description: "오해와 갈등을 극복하며 더 가까워지기",
                    difficulty: "hard"
                },
                ultimate_connection: {
                    id: "ultimate_connection",
                    name: "궁극의 유대",
                    description: "진정한 사랑과 깊은 연결의 순간들",
                    difficulty: "expert"
                }
            }
        };
        console.log('📦 Fallback 데이터 로드됨');
    }

    // 캐릭터별 사용 가능 퀘스트 조회
    async getQuestsForCharacter(characterId) {
        try {
            const response = await fetch(`/api/quest-manager?action=character_quests&character_id=${characterId}`);
            const data = await response.json();
            
            if (data.success) {
                return data.available_quests;
            }
        } catch (error) {
            console.error('❌ 캐릭터 퀘스트 조회 실패:', error);
            return [];
        }
    }

    // 퀘스트 선택 모달 열기
    async openQuestSelection() {
        if (!this.questData) {
            await this.loadQuestData();
        }

        const modal = document.getElementById('questSelectionModal');
        const categoriesDiv = document.getElementById('questCategories');
        
        // 카테고리 버튼 생성
        let categoryHTML = '';
        Object.entries(this.questData.categories).forEach(([id, category]) => {
            const unlockedCount = this.getUnlockedQuestCount(id);
            const totalCount = 9; // 카테고리당 9개 퀘스트
            
            categoryHTML += `
                <div class="category-card ${unlockedCount > 0 ? 'available' : 'locked'}" 
                     onclick="${unlockedCount > 0 ? `questManager.showQuestsInCategory('${id}')` : ''}">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                    <div class="category-progress">
                        <span class="difficulty-badge ${category.difficulty}">${category.difficulty}</span>
                        <span class="progress-text">${unlockedCount}/${totalCount} 해금</span>
                    </div>
                </div>
            `;
        });
        
        categoriesDiv.innerHTML = categoryHTML;
        modal.style.display = 'block';
    }

    // 특정 카테고리의 언락된 퀘스트 수 계산
    getUnlockedQuestCount(categoryId) {
        let count = 0;
        for (let i = 1; i <= 36; i++) {
            const questId = `quest_${String(i).padStart(3, '0')}`;
            if (this.unlockedQuests.includes(questId)) {
                // 카테고리별로 9개씩 분배
                const questCategory = this.getQuestCategory(i);
                if (questCategory === categoryId) {
                    count++;
                }
            }
        }
        return count;
    }

    // 퀘스트 번호로 카테고리 결정
    getQuestCategory(questNumber) {
        if (questNumber <= 9) return 'daily_romance';
        if (questNumber <= 18) return 'deep_emotions';
        if (questNumber <= 27) return 'conflict_resolution';
        return 'ultimate_connection';
    }

    // 특정 카테고리의 퀘스트 표시
    async showQuestsInCategory(categoryId) {
        const category = this.questData.categories[categoryId];
        const questListDiv = document.getElementById('questList');
        
        let questHTML = `
            <div class="quest-list-header">
                <button onclick="questManager.backToCategories()" class="back-button">← 뒤로</button>
                <h3>${category.name}</h3>
            </div>
            <div class="quest-grid">
        `;
        
        // 카테고리별 퀘스트 범위 계산
        const categoryRanges = {
            'daily_romance': [1, 9],
            'deep_emotions': [10, 18],
            'conflict_resolution': [19, 27],
            'ultimate_connection': [28, 36]
        };
        
        const [start, end] = categoryRanges[categoryId];
        
        for (let i = start; i <= end; i++) {
            const questId = `quest_${String(i).padStart(3, '0')}`;
            const isUnlocked = this.unlockedQuests.includes(questId);
            const isCompleted = this.completedQuests.includes(questId);
            
            let statusClass = 'locked';
            let statusIcon = '🔒';
            let onClick = '';
            
            if (isCompleted) {
                statusClass = 'completed';
                statusIcon = '✅';
                onClick = `questManager.replayQuest('${questId}')`;
            } else if (isUnlocked) {
                statusClass = 'unlocked';
                statusIcon = '🔓';
                onClick = `questManager.selectQuest('${questId}')`;
            }
            
            questHTML += `
                <div class="quest-item ${statusClass}" 
                     ${onClick ? `onclick="${onClick}"` : ''}>
                    <span class="quest-number">${i}</span>
                    <span class="quest-title">퀘스트 ${i}</span>
                    <span class="quest-status">${statusIcon}</span>
                </div>
            `;
        }
        
        questHTML += '</div>';
        questListDiv.innerHTML = questHTML;
        questListDiv.style.display = 'block';
        document.getElementById('questCategories').style.display = 'none';
    }

    // 카테고리 선택으로 돌아가기
    backToCategories() {
        document.getElementById('questList').style.display = 'none';
        document.getElementById('questCategories').style.display = 'grid';
    }

    // 퀘스트 선택
    async selectQuest(questId) {
        this.currentQuest = questId;
        console.log('✅ 퀘스트 선택됨:', questId);
        
        // 퀘스트 정보 로드
        try {
            const response = await fetch(`/api/quest-manager?action=get&quest_id=${questId}`);
            const data = await response.json();
            
            if (data.success) {
                const quest = data.quest;
                
                // 퀘스트 정보를 게임 상태에 저장
                if (window.gameState) {
                    window.gameState.currentQuest = quest;
                    window.gameState.questId = questId;
                }
                
                // 퀘스트 모달 닫고 캐릭터 선택 모달 열기
                this.closeQuestModal();
                this.openCharacterSelection(quest);
            }
        } catch (error) {
            console.error('퀘스트 정보 로드 실패:', error);
            // Fallback 처리
            this.closeQuestModal();
            this.openCharacterSelection();
        }
    }

    // 퀘스트 재플레이
    replayQuest(questId) {
        console.log('🔄 퀘스트 재플레이:', questId);
        this.selectQuest(questId);
    }

    // 캐릭터 선택 모달 열기
    async openCharacterSelection(quest = null) {
        const modal = document.getElementById('characterSelectionModal');
        const characterListDiv = document.getElementById('characterList');
        
        // 5개 MBTI 캐릭터 표시
        const characters = [
            { id: 'yuna_infp', name: '윤아', mbti: 'INFP', status: 'active', description: '감성적이고 이상주의적인 예술 전공 후배' },
            { id: 'mina_enfp', name: '미나', mbti: 'ENFP', status: 'active', description: '밝고 활발한 학생회장 선배' },
            { id: 'seoyeon_intj', name: '서연', mbti: 'INTJ', status: 'active', description: '논리적이고 지적인 대학원생 선배' },
            { id: 'jihye_esfj', name: '지혜', mbti: 'ESFJ', status: 'active', description: '따뜻하고 배려심 많은 동갑 친구' },
            { id: 'hyejin_istp', name: '혜진', mbti: 'ISTP', status: 'active', description: '쿨하고 현실적인 공학과 선배' }
        ];
        
        let characterHTML = '<div class="character-grid">';
        
        characters.forEach(char => {
            const isAvailable = char.status === 'active';
            
            characterHTML += `
                <div class="character-card ${isAvailable ? 'available' : 'locked'}" 
                     ${isAvailable ? `onclick="questManager.selectCharacter('${char.id}')"` : ''}>
                    <div class="character-avatar">
                        <span class="avatar-emoji">${this.getCharacterEmoji(char.mbti)}</span>
                    </div>
                    <h4>${char.name}</h4>
                    <span class="mbti-badge">${char.mbti}</span>
                    <p class="character-desc">${char.description}</p>
                    ${!isAvailable ? '<span class="coming-soon">Coming Soon</span>' : ''}
                </div>
            `;
        });
        
        characterHTML += '</div>';
        characterListDiv.innerHTML = characterHTML;
        modal.style.display = 'block';
    }

    // MBTI별 이모지 반환
    getCharacterEmoji(mbti) {
        const emojis = {
            'INFP': '🎨',
            'ENFP': '🌟',
            'INTJ': '🧠',
            'ESFJ': '💖',
            'ISTP': '⚙️'
        };
        return emojis[mbti] || '👤';
    }

    // 캐릭터 선택
    selectCharacter(characterId) {
        this.currentCharacter = characterId;
        console.log('✅ 캐릭터 선택됨:', characterId);
        
        // 게임 상태에 캐릭터 정보 저장
        if (window.gameState) {
            window.gameState.currentCharacter = characterId;
        }
        
        // 모달 닫고 게임 시작
        this.closeCharacterModal();
        this.startQuestWithCharacter();
    }

    // 퀘스트와 캐릭터로 게임 시작
    startQuestWithCharacter() {
        console.log('🎮 게임 시작:', this.currentQuest, 'with', this.currentCharacter);
        
        // 기존 게임 로직 호출
        if (window.startGame) {
            window.startGame(this.currentQuest, this.currentCharacter);
        } else {
            console.error('게임 시작 함수를 찾을 수 없습니다.');
        }
    }

    // 퀘스트 완료 처리
    completeQuest(questId, affectionGained) {
        if (!this.completedQuests.includes(questId)) {
            this.completedQuests.push(questId);
            this.userProgress.questsCompleted++;
            this.userProgress.totalAffection += affectionGained;
            
            // 다음 퀘스트 해금
            this.unlockNextQuest(questId);
            
            // 진행도 저장
            this.saveProgress();
            
            console.log('🎉 퀘스트 완료:', questId);
            console.log('📈 총 호감도:', this.userProgress.totalAffection);
        }
    }

    // 다음 퀘스트 해금
    unlockNextQuest(completedQuestId) {
        const questNumber = parseInt(completedQuestId.split('_')[1]);
        const nextQuestId = `quest_${String(questNumber + 1).padStart(3, '0')}`;
        
        if (questNumber < 36 && !this.unlockedQuests.includes(nextQuestId)) {
            this.unlockedQuests.push(nextQuestId);
            console.log('🔓 새 퀘스트 해금:', nextQuestId);
            
            // UI 알림 표시
            this.showUnlockNotification(nextQuestId);
        }
    }

    // 퀘스트 해금 알림 표시
    showUnlockNotification(questId) {
        const notification = document.createElement('div');
        notification.className = 'quest-unlock-notification';
        notification.innerHTML = `
            <div class="unlock-content">
                <span class="unlock-icon">🔓</span>
                <span class="unlock-text">새 퀘스트가 해금되었습니다!</span>
                <span class="unlock-quest">퀘스트 ${parseInt(questId.split('_')[1])}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // 진행도 저장
    saveProgress() {
        const progressData = {
            unlockedQuests: this.unlockedQuests,
            completedQuests: this.completedQuests,
            userProgress: this.userProgress,
            lastSaved: new Date().toISOString()
        };
        
        // 로컬 스토리지에 저장
        localStorage.setItem('questProgress', JSON.stringify(progressData));
        
        // 서버에도 저장 시도
        fetch('/api/quest-manager?action=save_progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(progressData)
        }).catch(error => console.error('서버 저장 실패:', error));
    }

    // 진행도 로드
    loadProgress() {
        const saved = localStorage.getItem('questProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.unlockedQuests = data.unlockedQuests || ['quest_001'];
            this.completedQuests = data.completedQuests || [];
            this.userProgress = data.userProgress || {
                totalAffection: 0,
                questsCompleted: 0,
                currentStreak: 0
            };
            console.log('📂 진행도 로드됨:', data.lastSaved);
        }
    }

    // 모달 닫기 함수들
    closeQuestModal() {
        const modal = document.getElementById('questSelectionModal');
        if (modal) modal.style.display = 'none';
    }

    closeCharacterModal() {
        const modal = document.getElementById('characterSelectionModal');
        if (modal) modal.style.display = 'none';
    }

    // 진행 상태 표시
    showProgressStatus() {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'progress-status';
        statusDiv.innerHTML = `
            <h3>📊 진행 상태</h3>
            <div class="status-item">
                <span>완료한 퀘스트:</span>
                <span>${this.userProgress.questsCompleted}/36</span>
            </div>
            <div class="status-item">
                <span>총 호감도:</span>
                <span>${this.userProgress.totalAffection}</span>
            </div>
            <div class="status-item">
                <span>해금된 퀘스트:</span>
                <span>${this.unlockedQuests.length}/36</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(this.userProgress.questsCompleted / 36) * 100}%"></div>
            </div>
        `;
        
        return statusDiv;
    }
}

// 전역 인스턴스 생성
window.questManager = new QuestManager();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.questManager.loadProgress();
    window.questManager.loadQuestData();
});