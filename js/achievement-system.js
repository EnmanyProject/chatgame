/**
 * Achievement System
 * @description 업적 시스템 (Phase 3 Milestone 1)
 * @version 3.1.0
 */

class AchievementSystem {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
        this.achievements = null;
        this.loadAchievements();
        console.log('🏆 AchievementSystem 초기화 완료');
    }

    /**
     * 업적 정의 로드
     */
    async loadAchievements() {
        try {
            const response = await fetch('/data/achievements.json');
            this.achievements = await response.json();
            console.log(`✅ ${this.achievements.achievements.length}개 업적 로드 완료`);
        } catch (error) {
            console.error('❌ 업적 로드 실패:', error);
            this.achievements = { achievements: [] };
        }
    }

    /**
     * 업적 체크
     */
    checkAchievement(achievementId) {
        const stats = this.statisticsManager.stats;

        // 이미 해금된 업적인지 확인
        if (stats.achievements.unlocked.includes(achievementId)) {
            return false;
        }

        const achievement = this.achievements.achievements.find(a => a.id === achievementId);
        if (!achievement) {
            return false;
        }

        // 조건 체크
        if (this.checkCondition(achievement.condition)) {
            this.unlockAchievement(achievementId);
            return true;
        }

        return false;
    }

    /**
     * 조건 체크
     */
    checkCondition(condition) {
        const stats = this.statisticsManager.stats;

        switch (condition.type) {
            case 'first_message':
                // 첫 메시지 전송
                return true; // 이 함수가 호출되었다는 것 자체가 조건 충족

            case 'affection_milestone':
                // 특정 호감도 달성
                const characterId = condition.characterId || Object.keys(stats.characters)[0];
                if (!characterId) return false;
                const charStats = stats.characters[characterId];
                if (!charStats) return false;
                return charStats.affectionHistory[charStats.affectionHistory.length - 1].value >= condition.value;

            case 'total_messages':
                // 총 메시지 수
                const totalMsg = Object.values(stats.characters).reduce(
                    (sum, char) => sum + char.totalMessages, 0
                );
                return totalMsg >= condition.value;

            case 'photo_received':
                // 사진 수신
                return Object.values(stats.characters).some(char => char.photosReceived >= condition.value);

            case 'proactive_contact':
                // 먼저 연락 받기
                return Object.values(stats.characters).some(char => char.proactiveContactsReceived >= condition.value);

            case 'consecutive_days':
                // 연속 플레이
                return Object.values(stats.characters).some(char => char.consecutiveDays >= condition.value);

            case 'play_time':
                // 플레이 시간
                return stats.global.totalPlayTime >= condition.value;

            case 'multiple_characters':
                // 여러 캐릭터와 대화
                return Object.keys(stats.characters).length >= condition.value;

            case 'positive_choices':
                // 긍정 선택 비율
                const allChoices = Object.values(stats.characters).reduce(
                    (sum, char) => sum + char.totalChoices, 0
                );
                const positiveChoices = Object.values(stats.characters).reduce(
                    (sum, char) => sum + char.positiveChoices, 0
                );
                if (allChoices === 0) return false;
                return (positiveChoices / allChoices) >= (condition.value / 100);

            case 'tone_level':
                // 톤 레벨 달성
                // 호감도 9-10이면 톤 레벨 5
                return Object.values(stats.characters).some(char => {
                    const lastAffection = char.affectionHistory[char.affectionHistory.length - 1].value;
                    return lastAffection >= 9; // 톤 레벨 5
                });

            default:
                return false;
        }
    }

    /**
     * 업적 해금
     */
    unlockAchievement(achievementId) {
        const stats = this.statisticsManager.stats;

        if (!stats.achievements.unlocked.includes(achievementId)) {
            stats.achievements.unlocked.push(achievementId);
            stats.achievements.unlocked.sort(); // 정렬
            this.statisticsManager.saveStats();

            const achievement = this.achievements.achievements.find(a => a.id === achievementId);
            if (achievement) {
                console.log(`🏆 업적 해금: ${achievement.name}`);
                this.showAchievementNotification(achievement);
            }
        }
    }

    /**
     * 업적 알림 표시
     */
    showAchievementNotification(achievement) {
        // 알림 컨테이너 생성 (없으면)
        let container = document.getElementById('achievement-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'achievement-notifications';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }

        // 알림 요소 생성
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            min-width: 300px;
            animation: slideInRight 0.5s ease-out;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 32px;">${achievement.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">🏆 업적 달성!</div>
                    <div style="font-size: 14px; opacity: 0.9;">${achievement.name}</div>
                    <div style="font-size: 12px; opacity: 0.7; margin-top: 2px;">${achievement.description}</div>
                </div>
            </div>
        `;

        container.appendChild(notification);

        // 3초 후 제거
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                container.removeChild(notification);
            }, 500);
        }, 3000);
    }

    /**
     * 모든 업적 체크 (진행 상황 업데이트)
     */
    checkAllAchievements() {
        if (!this.achievements) return;

        this.achievements.achievements.forEach(achievement => {
            this.checkAchievement(achievement.id);
        });
    }

    /**
     * 해금된 업적 목록
     */
    getUnlockedAchievements() {
        const stats = this.statisticsManager.stats;
        if (!this.achievements) return [];

        return stats.achievements.unlocked.map(id => {
            return this.achievements.achievements.find(a => a.id === id);
        }).filter(a => a !== undefined);
    }

    /**
     * 미해금 업적 목록
     */
    getLockedAchievements() {
        const stats = this.statisticsManager.stats;
        if (!this.achievements) return [];

        return this.achievements.achievements.filter(achievement => {
            return !stats.achievements.unlocked.includes(achievement.id);
        });
    }

    /**
     * 업적 진행률
     */
    getProgress() {
        if (!this.achievements) return 0;

        const total = this.achievements.achievements.length;
        const unlocked = this.statisticsManager.stats.achievements.unlocked.length;

        return {
            total,
            unlocked,
            percentage: Math.round((unlocked / total) * 100)
        };
    }

    /**
     * 특정 업적 정보
     */
    getAchievement(achievementId) {
        if (!this.achievements) return null;
        return this.achievements.achievements.find(a => a.id === achievementId);
    }

    /**
     * 카테고리별 업적
     */
    getAchievementsByCategory(category) {
        if (!this.achievements) return [];
        return this.achievements.achievements.filter(a => a.category === category);
    }

    /**
     * 업적 리셋 (개발/테스트용)
     */
    resetAchievements() {
        if (confirm('정말로 모든 업적을 초기화하시겠습니까?')) {
            this.statisticsManager.stats.achievements = {
                unlocked: [],
                progress: {}
            };
            this.statisticsManager.saveStats();
            console.log('🗑️ 업적 초기화 완료');
            return true;
        }
        return false;
    }

    /**
     * 디버깅용 업적 출력
     */
    debugAchievements() {
        console.log('=== 🏆 업적 현황 ===');
        console.log('전체:', this.achievements?.achievements.length || 0);
        console.log('해금:', this.getUnlockedAchievements().length);
        console.log('진행률:', this.getProgress());
        console.log('해금 목록:', this.getUnlockedAchievements().map(a => a.name));
    }
}

// CSS 애니메이션 추가
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}
