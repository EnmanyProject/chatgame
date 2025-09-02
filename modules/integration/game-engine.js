/**
 * 🎮 게임 엔진 통합 모듈 (v2.2.0)
 * - 모든 모듈을 통합하는 메인 엔진
 * - 기존 HTML과의 호환성 보장
 * - 전역 API 노출
 * - 게임 상태 전체 관리
 */

import gameArch from '../core/architecture.js';
import DataSchema from '../core/schema.js';
import choiceLogic from '../game/choice-logic.js';
import freeChat from '../game/free-chat.js';
import episodeFlow from '../game/episode-flow.js';
import adminPanel from '../admin/admin-panel.js';

export class GameEngine {
    constructor() {
        this.initialized = false;
        this.gameState = null;
        this.currentScenario = null;
        this.currentCharacter = null;
        this.legacyCompatMode = true;
        this.globalAPI = {};
        this.eventHandlers = new Map();
    }

    // === 메인 초기화 ===
    async initialize() {
        try {
            console.log('🎮 GameEngine 초기화 시작...');
            
            // 1. 아키텍처 초기화
            await gameArch.initialize();
            
            // 2. 모든 모듈 초기화
            await this.initializeModules();
            
            // 3. 게임 상태 초기화
            this.initializeGameState();
            
            // 4. 전역 API 설정
            this.setupGlobalAPI();
            
            // 5. 이벤트 시스템 설정
            this.setupEventSystem();
            
            // 6. 기존 HTML 호환성 설정
            this.setupLegacyCompatibility();
            
            this.initialized = true;
            console.log('✅ GameEngine 초기화 완료');
            
            // 초기화 완료 이벤트 발송
            gameArch.emit('gameEngineInitialized', { 
                timestamp: Date.now(),
                version: '2.2.0'
            });
            
            return true;
        } catch (error) {
            console.error('❌ GameEngine 초기화 실패:', error);
            return false;
        }
    }

    // 모듈 초기화
    async initializeModules() {
        const modules = [
            { name: 'choiceLogic', instance: choiceLogic },
            { name: 'freeChat', instance: freeChat },
            { name: 'episodeFlow', instance: episodeFlow },
            { name: 'adminPanel', instance: adminPanel }
        ];

        for (const module of modules) {
            try {
                if (module.instance.initialize) {
                    await module.instance.initialize();
                    console.log(`✅ ${module.name} 모듈 초기화 완료`);
                }
            } catch (error) {
                console.error(`❌ ${module.name} 모듈 초기화 실패:`, error);
            }
        }
    }

    // 게임 상태 초기화
    initializeGameState() {
        this.gameState = DataSchema.createDefault('gameState');
        console.log('🎯 기본 게임 상태 생성 완료');
    }

    // === 전역 API 설정 ===
    setupGlobalAPI() {
        this.globalAPI = {
            // 게임 시작
            startGame: (scenarioId, characterId) => this.startGame(scenarioId, characterId),
            
            // 선택지 처리
            processChoice: (choiceData) => this.processChoice(choiceData),
            
            // 자유 채팅
            sendMessage: (message) => this.sendMessage(message),
            
            // 게임 상태 관리
            saveGame: (slotId) => this.saveGame(slotId),
            loadGame: (slotId) => this.loadGame(slotId),
            getGameState: () => this.gameState,
            
            // 모드 전환
            toggleFreeChatMode: (enabled) => this.toggleFreeChatMode(enabled),
            
            // 관리자 기능
            toggleAdminMode: () => this.toggleAdminMode(),
            
            // 에피소드 관리
            getCurrentEpisode: () => episodeFlow.getCurrentEpisode(),
            getProgress: () => episodeFlow.getCurrentProgress(),
            
            // 캐릭터 정보
            getCharacterInfo: (characterId) => this.getCharacterInfo(characterId),
            
            // 통계
            getStatistics: () => this.getStatistics()
        };

        // 전역 window 객체에 API 노출
        window.GameEngine = this.globalAPI;
        console.log('🌐 전역 API 설정 완료');
    }

    // === 이벤트 시스템 ===
    setupEventSystem() {
        // 선택지 처리 완료 이벤트
        gameArch.on('choiceProcessed', (event) => {
            this.handleChoiceProcessed(event.detail);
        });

        // 자유 채팅 메시지 이벤트
        gameArch.on('freeChatMessage', (event) => {
            this.handleFreeChatMessage(event.detail);
        });

        // 에피소드 진행 이벤트
        gameArch.on('episodeChanged', (event) => {
            this.handleEpisodeChanged(event.detail);
        });

        // 관리자 모드 변경 이벤트
        gameArch.on('adminModeToggled', (event) => {
            this.handleAdminModeToggle(event.detail);
        });
    }

    // === 기존 HTML 호환성 ===
    setupLegacyCompatibility() {
        // 기존 함수들을 전역 스코프에 노출
        window.sendMessage = (message) => this.sendMessage(message);
        window.processChoice = (choiceIndex, choiceText, affectionImpact) => {
            return this.processChoice({
                choiceIndex,
                choiceText,
                affectionImpact
            });
        };
        
        // 기존 전역 변수와의 연결
        window.gameState = this.gameState;
        window.toggleFreeChatMode = (enabled) => this.toggleFreeChatMode(enabled);
        
        console.log('🔄 기존 HTML 호환성 설정 완료');
    }

    // === 게임 플로우 메서드 ===
    
    // 게임 시작
    async startGame(scenarioId, characterId) {
        try {
            console.log(`🎮 게임 시작: ${scenarioId} - ${characterId}`);
            
            // 시나리오 및 캐릭터 로드
            this.currentScenario = await this.loadScenario(scenarioId);
            this.currentCharacter = await this.loadCharacter(characterId);
            
            if (!this.currentScenario || !this.currentCharacter) {
                throw new Error('시나리오 또는 캐릭터 로드 실패');
            }
            
            // 게임 상태 초기화
            this.gameState.currentScenario = scenarioId;
            this.gameState.currentCharacter = characterId;
            this.gameState.choiceNumber = 0;
            this.gameState.affection = 50; // 시작 호감도
            this.gameState.startedAt = Date.now();
            
            // 에피소드 플로우 시작
            episodeFlow.startNewEpisode('ep001_meeting');
            
            // 게임 시작 이벤트
            gameArch.emit('gameStarted', {
                scenario: this.currentScenario,
                character: this.currentCharacter,
                gameState: this.gameState
            });
            
            return {
                success: true,
                scenario: this.currentScenario,
                character: this.currentCharacter
            };
        } catch (error) {
            console.error('❌ 게임 시작 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 선택지 처리
    async processChoice(choiceData) {
        try {
            if (!this.gameState.canInput) {
                return { success: false, error: '현재 입력이 불가능합니다' };
            }
            
            // 입력 잠금
            this.gameState.canInput = false;
            this.gameState.isProcessing = true;
            
            // 선택지 로직 모듈로 처리
            const result = await choiceLogic.processChoice(choiceData, this.gameState);
            
            if (result.success) {
                // 에피소드 진행 체크
                const episodeResult = episodeFlow.checkEpisodeProgress(this.gameState);
                
                // 게임 상태 업데이트
                this.gameState.choiceNumber++;
                this.gameState.messageCount++;
                this.gameState.lastChoiceAt = Date.now();
                
                // 선택지 히스토리 저장
                this.gameState.previousChoices.push({
                    choice: choiceData,
                    result: result,
                    timestamp: Date.now()
                });
            }
            
            // 입력 잠금 해제
            this.gameState.canInput = true;
            this.gameState.isProcessing = false;
            
            return result;
        } catch (error) {
            console.error('❌ 선택지 처리 실패:', error);
            this.gameState.canInput = true;
            this.gameState.isProcessing = false;
            return { success: false, error: error.message };
        }
    }

    // 자유 채팅 메시지 전송
    async sendMessage(message) {
        try {
            if (!this.gameState.canInput || !this.gameState.isFreeChatMode) {
                return { success: false, error: '자유 채팅 모드가 아니거나 입력이 불가능합니다' };
            }
            
            // 자유 채팅 모듈로 처리
            const result = await freeChat.processMessage(message, this.gameState);
            
            if (result.success) {
                // 게임 상태 업데이트
                this.gameState.messageCount++;
                this.gameState.lastMessageAt = Date.now();
            }
            
            return result;
        } catch (error) {
            console.error('❌메시지 전송 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // === 모드 전환 ===
    
    // 자유 채팅 모드 토글
    toggleFreeChatMode(enabled) {
        this.gameState.isFreeChatMode = enabled;
        freeChat.toggleFreeChatMode(enabled);
        
        gameArch.emit('freeChatModeToggled', {
            enabled,
            timestamp: Date.now()
        });
        
        console.log(`💬 자유 채팅 모드: ${enabled ? '활성화' : '비활성화'}`);
        return enabled;
    }

    // 관리자 모드 토글
    toggleAdminMode() {
        const enabled = !adminPanel.adminMode;
        adminPanel.adminMode = enabled;
        adminPanel.updateAdminVisibility();
        
        gameArch.emit('adminModeToggled', {
            enabled,
            timestamp: Date.now()
        });
        
        console.log(`🔧 관리자 모드: ${enabled ? '활성화' : '비활성화'}`);
        return enabled;
    }

    // === 저장/불러오기 ===
    
    // 게임 저장
    saveGame(slotId = 'auto') {
        try {
            const saveData = DataSchema.createDefault('saveData');
            saveData.gameState = { ...this.gameState };
            saveData.currentScenario = this.currentScenario;
            saveData.currentCharacter = this.currentCharacter;
            saveData.episodeProgress = episodeFlow.getCurrentProgress();
            saveData.savedAt = Date.now();
            saveData.slotId = slotId;
            
            // 로컬 스토리지에 저장
            const key = `chatgame_save_${slotId}`;
            localStorage.setItem(key, JSON.stringify(saveData));
            
            console.log(`💾 게임 저장 완료: ${slotId}`);
            
            gameArch.emit('gameSaved', {
                slotId,
                saveData,
                timestamp: Date.now()
            });
            
            return { success: true, slotId, saveData };
        } catch (error) {
            console.error('❌ 게임 저장 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 게임 불러오기
    loadGame(slotId) {
        try {
            const key = `chatgame_save_${slotId}`;
            const savedData = localStorage.getItem(key);
            
            if (!savedData) {
                throw new Error('저장 데이터를 찾을 수 없습니다');
            }
            
            const saveData = JSON.parse(savedData);
            
            // 게임 상태 복원
            this.gameState = { ...saveData.gameState };
            this.currentScenario = saveData.currentScenario;
            this.currentCharacter = saveData.currentCharacter;
            
            // 에피소드 진행 상태 복원
            if (saveData.episodeProgress) {
                episodeFlow.restoreProgress(saveData.episodeProgress);
            }
            
            console.log(`📁 게임 불러오기 완료: ${slotId}`);
            
            gameArch.emit('gameLoaded', {
                slotId,
                saveData,
                timestamp: Date.now()
            });
            
            return { success: true, saveData };
        } catch (error) {
            console.error('❌ 게임 불러오기 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // === 유틸리티 메서드 ===
    
    // 시나리오 로드
    async loadScenario(scenarioId) {
        // adminPanel에서 시나리오 가져오기
        const scenarios = adminPanel.listScenarios();
        return scenarios.find(s => s.id === scenarioId) || null;
    }

    // 캐릭터 로드
    async loadCharacter(characterId) {
        // adminPanel에서 캐릭터 가져오기
        const characters = adminPanel.listCharacters();
        return characters.find(c => c.id === characterId) || null;
    }

    // 캐릭터 정보 조회
    getCharacterInfo(characterId) {
        const characters = adminPanel.listCharacters();
        return characters.find(c => c.id === characterId) || null;
    }

    // 통계 정보
    getStatistics() {
        const adminStats = adminPanel.getStatistics();
        const episodeStats = episodeFlow.getStatistics();
        
        return {
            ...adminStats,
            ...episodeStats,
            gameState: {
                playTime: this.gameState.lastMessageAt - this.gameState.startedAt,
                messageCount: this.gameState.messageCount,
                choiceCount: this.gameState.choiceNumber,
                affection: this.gameState.affection,
                currentMode: this.gameState.isFreeChatMode ? 'free_chat' : 'scenario'
            }
        };
    }

    // === 이벤트 핸들러 ===
    
    handleChoiceProcessed(data) {
        console.log('🎯 선택지 처리 완료:', data);
        // UI 업데이트 로직 추가 가능
    }

    handleFreeChatMessage(data) {
        console.log('💬 자유 채팅 메시지:', data);
        // 추가 처리 로직
    }

    handleEpisodeChanged(data) {
        console.log('📖 에피소드 변경:', data);
        // 에피소드 변경 시 UI 업데이트
    }

    handleAdminModeToggle(data) {
        console.log('🔧 관리자 모드 변경:', data);
        // 관리자 UI 상태 업데이트
    }

    // === 상태 체크 ===
    
    // 게임 엔진 상태 체크
    getEngineStatus() {
        return {
            initialized: this.initialized,
            gameActive: !!this.currentScenario && !!this.currentCharacter,
            freeChatMode: this.gameState?.isFreeChatMode || false,
            adminMode: adminPanel.adminMode,
            canInput: this.gameState?.canInput || false,
            isProcessing: this.gameState?.isProcessing || false,
            moduleStatus: {
                architecture: gameArch.initialized,
                choiceLogic: choiceLogic.initialized,
                freeChat: freeChat.initialized,
                episodeFlow: episodeFlow.initialized,
                adminPanel: adminPanel.initialized
            }
        };
    }

    // 버전 정보
    getVersion() {
        return {
            version: '2.2.0',
            build: Date.now(),
            modules: {
                architecture: gameArch.version || '2.1.0',
                schema: DataSchema.version || '2.1.0',
                choiceLogic: choiceLogic.version || '2.1.0',
                freeChat: freeChat.version || '2.1.0',
                episodeFlow: episodeFlow.version || '2.1.0',
                adminPanel: adminPanel.version || '2.1.0'
            }
        };
    }
}

// 게임 엔진 인스턴스 생성
const gameEngine = new GameEngine();

// 아키텍처에 등록
gameArch.registerModule('gameEngine', gameEngine);

// 자동 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 DOM 로드 완료 - GameEngine 초기화 시작');
    await gameEngine.initialize();
});

export default gameEngine;