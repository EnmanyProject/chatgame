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
            
            const modules = [
                { name: 'dataSchema', method: 'initialize' },
                { name: 'gameLogic', method: 'prepare' },
                { name: 'episodeManager', method: 'activate' },
                { name: 'saveSystem', method: 'ready' }
            ];
            
            // 모듈별 초기화 with 에러 처리
            for (const { name, method } of modules) {
                try {
                    this.logger.info(`🔧 모듈 ${name} 초기화 중...`);
                    const module = this.getModule(name);
                    
                    if (typeof module[method] === 'function') {
                        await module[method]();
                    } else {
                        await module.initialize();
                    }
                    
                    this.logger.info(`✅ 모듈 ${name} 초기화 완료`);
                } catch (error) {
                    this.logger.error(`❌ 모듈 ${name} 초기화 실패:`, error.message);
                    // 치명적이지 않은 경우 계속 진행
                    if (name === 'dataSchema') {
                        throw new Error(`필수 모듈 ${name} 초기화 실패: ${error.message}`);
                    }
                }
            }
            
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
        
        // 히스토리 제한 (최근 50개만 유지)
        if (this.stateHistory.length > 50) {
            this.stateHistory = this.stateHistory.slice(-50);
            console.log('📚 상태 히스토리 정리됨 (50개 제한)');
        }
        
        this.currentState = newState;
        
        // 데이터 유효성 검사 (기본적인 타입 체크)
        if (data && typeof data === 'object') {
            Object.assign(this.gameData, data);
        } else if (data !== undefined) {
            console.warn('⚠️ 잘못된 상태 데이터 타입:', typeof data);
        }
        
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
class DataSchemaModule extends BaseModule {
    constructor() { 
        super('dataSchema'); 
        this.schemas = new Map();
        this.validators = new Map();
    }
    
    async initialize() {
        console.log('📊 데이터 스키마 모듈 초기화...');
        
        // 기본 스키마 정의
        this.defineSchemas();
        
        await super.initialize();
        console.log('✅ 데이터 스키마 초기화 완료');
    }
    
    defineSchemas() {
        // 플레이어 스키마
        this.schemas.set('player', {
            name: { type: 'string', required: true },
            id: { type: 'number', required: true },
            affection: { type: 'number', default: 0 },
            choices: { type: 'array', default: [] }
        });
        
        // 에피소드 스키마
        this.schemas.set('episode', {
            id: { type: 'string', required: true },
            title: { type: 'string', required: true },
            character: { type: 'string', required: true },
            scenario: { type: 'string', required: true }
        });
        
        console.log('📋 기본 스키마 정의 완료');
    }
    
    validate(schemaName, data) {
        const schema = this.schemas.get(schemaName);
        if (!schema) {
            throw new Error(`스키마 '${schemaName}'를 찾을 수 없습니다`);
        }
        
        // 간단한 유효성 검사
        for (const [field, rules] of Object.entries(schema)) {
            if (rules.required && !data.hasOwnProperty(field)) {
                throw new Error(`필수 필드 '${field}'가 누락되었습니다`);
            }
        }
        
        return true;
    }
}

class GameLogicModule extends BaseModule {
    constructor() { 
        super('gameLogic'); 
        this.rules = new Map();
    }
    
    async prepare() { 
        console.log('⚙️ 게임 로직 모듈 초기화...');
        this.initializeRules();
        await super.initialize();
        console.log('✅ 게임 로직 준비 완료'); 
    }
    
    initializeRules() {
        // 기본 게임 규칙 정의
        this.rules.set('affection_change', { min: -10, max: 10 });
        this.rules.set('max_choices', 50);
        console.log('📜 게임 규칙 초기화 완료');
    }
}

class EpisodeManagerModule extends BaseModule {
    constructor() { 
        super('episodeManager'); 
        this.episodes = new Map();
        this.currentEpisode = null;
    }
    
    async activate() { 
        console.log('📖 에피소드 매니저 모듈 초기화...');
        this.loadDefaultEpisodes();
        await super.initialize();
        console.log('✅ 에피소드 매니저 활성화 완료'); 
    }
    
    loadDefaultEpisodes() {
        // 기본 에피소드 정의
        this.episodes.set('ep001', {
            id: 'ep001',
            title: '어제 밤의 기억',
            character: 'yoona',
            scenario: 'romantic'
        });
        console.log('📚 기본 에피소드 로드 완료');
    }
}

class SaveSystemModule extends BaseModule {
    constructor() { 
        super('saveSystem'); 
        this.saves = new Map();
    }
    
    async ready() { 
        console.log('💾 저장 시스템 모듈 초기화...');
        this.initializeStorage();
        await super.initialize();
        console.log('✅ 저장 시스템 준비 완료'); 
    }
    
    initializeStorage() {
        // 로컬스토리지 지원 확인
        try {
            if (typeof localStorage !== 'undefined') {
                console.log('💿 로컬스토리지 사용 가능');
            } else {
                console.warn('⚠️ 로컬스토리지 사용 불가능');
            }
        } catch (error) {
            console.warn('⚠️ 스토리지 초기화 경고:', error.message);
        }
    }
}

class AdminPanelModule extends BaseModule {
    constructor() { 
        super('adminPanel'); 
        this.isEnabled = false;
    }
    
    async onInitialize() { 
        console.log('👨‍💼 관리자 패널 모듈 초기화...');
        this.checkAdminAccess();
        console.log('✅ 관리자 패널 초기화 완료'); 
    }
    
    checkAdminAccess() {
        // 개발 환경에서만 활성화
        this.isEnabled = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('127.0.0.1');
        console.log(`🔐 관리자 패널 ${this.isEnabled ? '활성화' : '비활성화'}`);
    }
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