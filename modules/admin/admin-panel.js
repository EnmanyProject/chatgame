/**
 * 🛠️ 관리자 패널 모듈 (v2.1.0)
 * - 시나리오 관리 (CRUD)
 * - 캐릭터 관리 (CRUD)
 * - 호감도 관리 및 조정
 * - 대화 데이터 관리
 */

import gameArch from '../core/architecture.js';
import DataSchema from '../core/schema.js';

export class AdminPanel {
    constructor() {
        this.scenarios = new Map();
        this.characters = new Map();
        this.dialogues = new Map();
        this.adminMode = false;
        this.currentEditTarget = null;
        this.initialized = false;
    }

    // 모듈 초기화
    async initialize() {
        try {
            console.log('🛠️ AdminPanel 모듈 초기화 중...');
            
            // 기본 데이터 로드
            await this.loadDefaultData();
            
            // 관리자 인터페이스 설정
            this.setupAdminInterface();
            
            // 이벤트 리스너 등록
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ AdminPanel 모듈 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ AdminPanel 초기화 실패:', error);
            return false;
        }
    }

    // 기본 데이터 로드
    async loadDefaultData() {
        // 기본 시나리오 설정
        this.scenarios.set('hangover_confession', {
            id: 'hangover_confession',
            title: '어제 밤의 기억',
            description: '어제 술 먹고 고백한 후 부끄러워하는 상황',
            setting: '다음날 아침, 메신저로 연락',
            mood: '부끄러움, 설렘, 긴장감',
            character_id: 'yuna_infp',
            active: true,
            created_at: Date.now(),
            updated_at: Date.now()
        });

        // 기본 캐릭터 설정
        this.characters.set('yuna_infp', {
            id: 'yuna_infp',
            name: '윤아',
            age: 20,
            mbti: 'INFP',
            personality: '감성적, 이상주의적, 창의적, 내향적',
            relationship: '시우 오빠를 1년 넘게 좋아하는 후배',
            background: '예술 전공 대학생, 감수성이 풍부함',
            avatar_url: '/photo/윤아.jpg',
            active: true,
            dialogue_style: {
                casual: ['안녕하세요~ 😊', '어떻게 지내세요?', '오늘 날씨 좋네요 ㅎㅎ'],
                romantic: ['오빠... 💕', '정말 고마워요 😳', '같이 있으니까 좋아요...'],
                shy: ['아... 부끄러워요 😅', '그런 말 하시면... 🫣', '어떻게 대답해야 할지...']
            }
        });

        console.log('📊 기본 데이터 로드 완료');
    }

    // 관리자 인터페이스 설정
    setupAdminInterface() {
        // 관리자 모드 토글 함수
        window.toggleAdminMode = () => {
            this.adminMode = !this.adminMode;
            this.updateAdminVisibility();
            console.log(`🔧 관리자 모드: ${this.adminMode ? '활성화' : '비활성화'}`);
        };

        // 전역 관리자 함수들 등록
        window.adminPanel = {
            listScenarios: () => this.listScenarios(),
            listCharacters: () => this.listCharacters(),
            editScenario: (id) => this.editScenario(id),
            editCharacter: (id) => this.editCharacter(id),
            deleteScenario: (id) => this.deleteScenario(id),
            deleteCharacter: (id) => this.deleteCharacter(id),
            exportData: () => this.exportAllData(),
            importData: (data) => this.importAllData(data)
        };
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        gameArch.on('adminModeToggled', (event) => {
            this.adminMode = event.detail.enabled;
            this.updateAdminVisibility();
        });

        gameArch.on('dataModified', (event) => {
            this.handleDataModification(event.detail);
        });
    }

    // === 시나리오 관리 ===
    
    // 시나리오 목록 조회
    listScenarios() {
        const scenarios = Array.from(this.scenarios.values());
        console.log('📚 시나리오 목록:', scenarios);
        return scenarios;
    }

    // 시나리오 생성
    createScenario(scenarioData) {
        try {
            const id = scenarioData.id || `scenario_${Date.now()}`;
            const newScenario = {
                ...DataSchema.createDefault('scenario'),
                ...scenarioData,
                id: id,
                created_at: Date.now(),
                updated_at: Date.now()
            };

            this.scenarios.set(id, newScenario);
            gameArch.emit('scenarioCreated', { scenario: newScenario });
            
            console.log('✅ 시나리오 생성 완료:', id);
            return { success: true, scenario: newScenario };
        } catch (error) {
            console.error('❌ 시나리오 생성 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 시나리오 수정
    editScenario(id, updates) {
        try {
            if (!this.scenarios.has(id)) {
                throw new Error(`시나리오를 찾을 수 없습니다: ${id}`);
            }

            const scenario = this.scenarios.get(id);
            const updatedScenario = {
                ...scenario,
                ...updates,
                updated_at: Date.now()
            };

            this.scenarios.set(id, updatedScenario);
            gameArch.emit('scenarioUpdated', { scenario: updatedScenario });

            console.log('✅ 시나리오 수정 완료:', id);
            return { success: true, scenario: updatedScenario };
        } catch (error) {
            console.error('❌ 시나리오 수정 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 시나리오 삭제
    deleteScenario(id) {
        try {
            if (!this.scenarios.has(id)) {
                throw new Error(`시나리오를 찾을 수 없습니다: ${id}`);
            }

            const scenario = this.scenarios.get(id);
            this.scenarios.delete(id);
            gameArch.emit('scenarioDeleted', { id, scenario });

            console.log('✅ 시나리오 삭제 완료:', id);
            return { success: true, id };
        } catch (error) {
            console.error('❌ 시나리오 삭제 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // === 캐릭터 관리 ===

    // 캐릭터 목록 조회
    listCharacters() {
        const characters = Array.from(this.characters.values());
        console.log('👥 캐릭터 목록:', characters);
        return characters;
    }

    // 캐릭터 생성
    createCharacter(characterData) {
        try {
            const id = characterData.id || `character_${Date.now()}`;
            const newCharacter = {
                ...DataSchema.createDefault('character'),
                ...characterData,
                id: id,
                created_at: Date.now(),
                updated_at: Date.now()
            };

            this.characters.set(id, newCharacter);
            gameArch.emit('characterCreated', { character: newCharacter });

            console.log('✅ 캐릭터 생성 완료:', id);
            return { success: true, character: newCharacter };
        } catch (error) {
            console.error('❌ 캐릭터 생성 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 캐릭터 수정
    editCharacter(id, updates) {
        try {
            if (!this.characters.has(id)) {
                throw new Error(`캐릭터를 찾을 수 없습니다: ${id}`);
            }

            const character = this.characters.get(id);
            const updatedCharacter = {
                ...character,
                ...updates,
                updated_at: Date.now()
            };

            this.characters.set(id, updatedCharacter);
            gameArch.emit('characterUpdated', { character: updatedCharacter });

            console.log('✅ 캐릭터 수정 완료:', id);
            return { success: true, character: updatedCharacter };
        } catch (error) {
            console.error('❌ 캐릭터 수정 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 캐릭터 삭제
    deleteCharacter(id) {
        try {
            if (!this.characters.has(id)) {
                throw new Error(`캐릭터를 찾을 수 없습니다: ${id}`);
            }

            const character = this.characters.get(id);
            this.characters.delete(id);
            gameArch.emit('characterDeleted', { id, character });

            console.log('✅ 캐릭터 삭제 완료:', id);
            return { success: true, id };
        } catch (error) {
            console.error('❌ 캐릭터 삭제 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // === 호감도 관리 ===

    // 호감도 직접 조정
    adjustAffection(gameState, newAffection, reason = '관리자 조정') {
        try {
            const oldAffection = gameState.affection;
            gameState.affection = Math.max(0, Math.min(100, newAffection));
            
            const change = gameState.affection - oldAffection;
            
            gameArch.emit('affectionAdjusted', {
                oldValue: oldAffection,
                newValue: gameState.affection,
                change: change,
                reason: reason,
                timestamp: Date.now()
            });

            console.log(`💕 호감도 조정: ${oldAffection} → ${gameState.affection} (${reason})`);
            return { success: true, oldValue: oldAffection, newValue: gameState.affection };
        } catch (error) {
            console.error('❌ 호감도 조정 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // === 데이터 내보내기/가져오기 ===

    // 모든 데이터 내보내기
    exportAllData() {
        try {
            const exportData = {
                version: '2.1.0',
                timestamp: Date.now(),
                scenarios: Object.fromEntries(this.scenarios),
                characters: Object.fromEntries(this.characters),
                dialogues: Object.fromEntries(this.dialogues)
            };

            const jsonData = JSON.stringify(exportData, null, 2);
            
            // 파일 다운로드 트리거
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chatgame_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log('📤 데이터 내보내기 완료');
            return { success: true, data: exportData };
        } catch (error) {
            console.error('❌ 데이터 내보내기 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 데이터 가져오기
    importAllData(importData) {
        try {
            if (importData.scenarios) {
                this.scenarios = new Map(Object.entries(importData.scenarios));
            }
            
            if (importData.characters) {
                this.characters = new Map(Object.entries(importData.characters));
            }
            
            if (importData.dialogues) {
                this.dialogues = new Map(Object.entries(importData.dialogues));
            }

            gameArch.emit('dataImported', { importData });
            
            console.log('📥 데이터 가져오기 완료');
            return { success: true };
        } catch (error) {
            console.error('❌ 데이터 가져오기 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 관리자 모드 UI 표시/숨김
    updateAdminVisibility() {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = this.adminMode ? 'block' : 'none';
        });
    }

    // 통계 정보 조회
    getStatistics() {
        return {
            totalScenarios: this.scenarios.size,
            activeScenarios: Array.from(this.scenarios.values()).filter(s => s.active).length,
            totalCharacters: this.characters.size,
            activeCharacters: Array.from(this.characters.values()).filter(c => c.active).length,
            totalDialogues: this.dialogues.size,
            lastUpdate: Math.max(
                ...Array.from(this.scenarios.values()).map(s => s.updated_at || 0),
                ...Array.from(this.characters.values()).map(c => c.updated_at || 0)
            )
        };
    }
}

// 모듈 인스턴스 생성 및 등록
const adminPanel = new AdminPanel();
gameArch.registerModule('adminPanel', adminPanel);

export default adminPanel;