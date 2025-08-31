/**
 * 텍스트 기반 메신저형 어드벤처 게임 - 전체 아키텍처 설계
 * @version 1.0.0
 * @author dosik + Claude
 */

// 🏗️ 게임 아키텍처 핵심 클래스
class GameArchitecture {
    constructor() {
        this.modules = new Map();
        this.eventBus = new EventEmitter();
        this.state = new GameStateManager();
        this.logger = new GameLogger();
        
        this.initializeModules();
    }

    // 모듈 등록 및 초기화
    initializeModules() {
        // 핵심 모듈 등록 순서 (의존성 고려)
        this.registerModule('dataSchema', new DataSchemaModule());
        this.registerModule('gameLogic', new GameLogicModule());
        this.registerModule('episodeManager', new EpisodeManagerModule());
        this.registerModule('saveSystem', new SaveSystemModule());
        this.registerModule('adminPanel', new AdminPanelModule());
        
        this.logger.info('🏗️ 모든 모듈이 초기화되었습니다');
    }

    // 모듈 등록
    registerModule(name, instance) {
        if (this.modules.has(name)) {
            throw new Error(`모듈 '${name}'이 이미 등록되어 있습니다`);
        }
        
        this.modules.set(name, instance);
        instance.setArchitecture(this);
        
        this.logger.debug(`📦 모듈 등록: ${name}`);
    }

    // 모듈 가져오기
    getModule(name) {
        if (!this.modules.has(name)) {
            throw new Error(`모듈 '${name}'을 찾을 수 없습니다`);
        }
        return this.modules.get(name);
    }

    // 게임 시작
    async startGame() {
        try {
            this.logger.info('🎮 게임 시작...');
            
            // 1. 데이터 초기화
            await this.getModule('dataSchema').initialize();
            
            // 2. 게임 로직 준비
            await this.getModule('gameLogic').prepare();
            
            // 3. 에피소드 매니저 활성화
            await this.getModule('episodeManager').activate();
            
            // 4. 저장 시스템 준비
            await this.getModule('saveSystem').ready();
            
            this.eventBus.emit('game:started');
            return { success: true, message: '게임이 성공적으로 시작되었습니다' };
            
        } catch (error) {
            this.logger.error('❌ 게임 시작 실패:', error);
            return { success: false, error: error.message };
        }
    }
}

// 🎯 게임 상태 관리자
class GameStateManager {
    constructor() {
        this.currentState = 'idle';
        this.gameData = {
            player: null,
            currentEpisode: null,
            affectionLevels: new Map(),
            choices: [],
            flags: new Set()
        };
        this.stateHistory = [];
    }

    // 상태 변경
    setState(newState, data = {}) {
        this.stateHistory.push({
            from: this.currentState,
            to: newState,
            timestamp: Date.now(),
            data: { ...this.gameData }
        });
        
        this.currentState = newState;
        Object.assign(this.gameData, data);
        
        console.log(`🔄 상태 변경: ${this.stateHistory[this.stateHistory.length - 1].from} → ${newState}`);
    }

    // 현재 상태 조회
    getState() {
        return {
            current: this.currentState,
            data: { ...this.gameData },
            canRollback: this.stateHistory.length > 0
        };
    }

    // 상태 롤백
    rollback(steps = 1) {
        if (this.stateHistory.length < steps) {
            throw new Error('롤백할 히스토리가 부족합니다');
        }

        for (let i = 0; i < steps; i++) {
            const previousState = this.stateHistory.pop();
            this.currentState = previousState.from;
            this.gameData = previousState.data;
        }
    }
}

// 📡 이벤트 버스 (간단한 구현)
class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
    }

    emit(eventName, ...args) {
        if (this.events.has(eventName)) {
            this.events.get(eventName).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`❌ 이벤트 ${eventName} 처리 중 오류:`, error);
                }
            });
        }
    }

    off(eventName, callback) {
        if (this.events.has(eventName)) {
            const callbacks = this.events.get(eventName);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
}

// 📋 로깅 시스템
class GameLogger {
    constructor() {
        this.logLevel = 'info'; // debug, info, warn, error
        this.logs = [];
        this.maxLogs = 1000;
    }

    log(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message: typeof message === 'string' ? message : JSON.stringify(message),
            args
        };

        this.logs.push(logEntry);
        
        // 로그 개수 제한
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // 콘솔 출력
        console[level] ? console[level](`[${timestamp}] ${message}`, ...args) 
                       : console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
    }

    debug(message, ...args) { this.log('debug', message, ...args); }
    info(message, ...args) { this.log('info', message, ...args); }
    warn(message, ...args) { this.log('warn', message, ...args); }
    error(message, ...args) { this.log('error', message, ...args); }

    getLogs(level = null) {
        return level ? this.logs.filter(log => log.level === level) : this.logs;
    }
}

// 🧩 베이스 모듈 클래스
class BaseModule {
    constructor(name) {
        this.name = name;
        this.architecture = null;
        this.isInitialized = false;
    }

    setArchitecture(architecture) {
        this.architecture = architecture;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log(`🔧 모듈 초기화: ${this.name}`);
        await this.onInitialize();
        this.isInitialized = true;
    }

    async onInitialize() {
        // 서브클래스에서 구현
    }

    getModule(name) {
        return this.architecture.getModule(name);
    }

    emit(eventName, ...args) {
        this.architecture.eventBus.emit(eventName, ...args);
    }

    on(eventName, callback) {
        this.architecture.eventBus.on(eventName, callback);
    }
}

// 📄 임시 모듈 클래스들 (각각 별도 파일로 분리 예정)
// DataSchemaModule은 dataSchema.js에서 실제 구현됨
class DataSchemaModule extends BaseModule {
    constructor() { 
        super('dataSchema'); 
        this.schemas = new Map();
        this.validators = new Map();
        this.factories = new Map();
    }
    async onInitialize() { 
        console.log('📊 데이터 스키마 준비됨 (임시 버전)');
        console.log('ℹ️ 실제 구현은 dataSchema.js를 참조하세요');
    }
}

class GameLogicModule extends BaseModule {
    constructor() { super('gameLogic'); }
    async prepare() { console.log('⚙️ 게임 로직 준비됨'); }
}

class EpisodeManagerModule extends BaseModule {
    constructor() { super('episodeManager'); }
    async activate() { console.log('📖 에피소드 매니저 활성화됨'); }
}

class SaveSystemModule extends BaseModule {
    constructor() { super('saveSystem'); }
    async ready() { console.log('💾 저장 시스템 준비됨'); }
}

class AdminPanelModule extends BaseModule {
    constructor() { super('adminPanel'); }
    async onInitialize() { console.log('👨‍💼 관리자 패널 초기화됨'); }
}

// 🚀 전역 게임 인스턴스 및 시작 함수
let gameArchitecture = null;

async function initializeGame() {
    try {
        console.log('🎮 게임 아키텍처 초기화 시작...');
        
        gameArchitecture = new GameArchitecture();
        const result = await gameArchitecture.startGame();
        
        if (result.success) {
            console.log('✅ 게임 초기화 성공!');
            window.gameArchitecture = gameArchitecture; // 디버깅용 전역 접근
            return gameArchitecture;
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('❌ 게임 초기화 실패:', error);
        throw error;
    }
}

// 🔍 샘플 실행 및 테스트 함수
async function runArchitectureTest() {
    console.log('🧪 아키텍처 테스트 시작...');
    
    try {
        // 1. 게임 초기화
        const game = await initializeGame();
        
        // 2. 상태 관리 테스트
        game.state.setState('playing', { 
            player: { name: '플레이어', id: 1 },
            currentEpisode: 'ep001'
        });
        
        // 3. 이벤트 시스템 테스트
        game.eventBus.on('test:event', (data) => {
            console.log('📡 이벤트 수신:', data);
        });
        game.eventBus.emit('test:event', { message: 'Hello Architecture!' });
        
        // 4. 모듈 조회 테스트
        const dataModule = game.getModule('dataSchema');
        console.log('📦 모듈 조회 성공:', dataModule.name);
        
        // 5. 상태 조회
        console.log('🎯 현재 게임 상태:', game.state.getState());
        
        console.log('✅ 모든 아키텍처 테스트 통과!');
        
        return {
            success: true,
            modules: Array.from(game.modules.keys()),
            currentState: game.state.getState(),
            logCount: game.logger.getLogs().length
        };
        
    } catch (error) {
        console.error('❌ 아키텍처 테스트 실패:', error);
        return { success: false, error: error.message };
    }
}

// 브라우저 환경에서 자동 실행
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('🌐 브라우저에서 아키텍처 테스트 실행');
        runArchitectureTest().then(result => {
            console.log('📊 테스트 결과:', result);
        });
    });
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameArchitecture,
        GameStateManager,
        EventEmitter,
        GameLogger,
        BaseModule,
        initializeGame,
        runArchitectureTest
    };
}