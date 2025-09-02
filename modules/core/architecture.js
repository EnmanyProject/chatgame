/**
 * 🏗️ 게임 아키텍처 코어 모듈 (v2.1.0)
 * - 전체 시스템 구조 정의
 * - 모듈 간 통신 인터페이스
 * - 이벤트 시스템
 * - 의존성 관리
 */

class GameArchitecture {
    constructor() {
        this.modules = new Map();
        this.events = new EventTarget();
        this.config = this.getDefaultConfig();
        this.initialized = false;
        this.startTime = Date.now();
        
        console.log('🚀 GameArchitecture 인스턴스 생성됨 (v2.1.0)');
    }

    // 기본 설정 반환
    getDefaultConfig() {
        return {
            version: '2.1.0',
            maxChoices: 36,
            maxAffection: 100,
            saveSlots: 10,
            cacheTTL: 300000, // 5분
            apiEndpoint: '/api/scenario',
            memoryLimit: 50, // 최대 상태 기록 수
            autoSave: true,
            debugMode: false
        };
    }

    // 모듈 등록
    registerModule(name, moduleInstance) {
        if (!name || !moduleInstance) {
            throw new Error('모듈 이름과 인스턴스가 필요합니다');
        }
        
        this.modules.set(name, moduleInstance);
        console.log(`📦 모듈 등록됨: ${name}`);
        
        this.emit('moduleRegistered', { 
            name, 
            module: moduleInstance,
            timestamp: Date.now()
        });
        
        return this;
    }

    // 모듈 가져오기
    getModule(name) {
        const module = this.modules.get(name);
        if (!module) {
            console.warn(`⚠️ 모듈을 찾을 수 없음: ${name}`);
        }
        return module;
    }

    // 모든 모듈 목록
    getAllModules() {
        return Array.from(this.modules.entries()).map(([name, module]) => ({
            name,
            module,
            initialized: module.initialized || false
        }));
    }

    // 이벤트 발생
    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, { 
            detail: {
                ...data,
                timestamp: Date.now(),
                source: 'GameArchitecture'
            }
        });
        
        this.events.dispatchEvent(event);
        
        if (this.config.debugMode) {
            console.log(`📡 이벤트 발생: ${eventName}`, data);
        }
    }

    // 이벤트 구독
    on(eventName, callback) {
        if (typeof callback !== 'function') {
            throw new Error('콜백은 함수여야 합니다');
        }
        
        this.events.addEventListener(eventName, callback);
        
        if (this.config.debugMode) {
            console.log(`👂 이벤트 구독: ${eventName}`);
        }
        
        return this;
    }

    // 이벤트 구독 해제
    off(eventName, callback) {
        this.events.removeEventListener(eventName, callback);
        return this;
    }

    // 설정 업데이트
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.emit('configUpdated', { config: this.config });
        console.log('⚙️ 설정 업데이트됨:', updates);
        return this;
    }

    // 시스템 초기화
    async initialize() {
        if (this.initialized) {
            console.warn('⚠️ 시스템이 이미 초기화되었습니다');
            return true;
        }

        try {
            console.log('🔧 게임 아키텍처 초기화 시작...');
            
            // 모듈 순서대로 초기화
            const initOrder = ['schema', 'choiceLogic', 'episodeFlow', 'saveSystem', 'adminPanel'];
            const initResults = [];
            
            for (const moduleName of initOrder) {
                const module = this.getModule(moduleName);
                if (module && typeof module.initialize === 'function') {
                    try {
                        const result = await module.initialize();
                        initResults.push({ module: moduleName, success: true, result });
                        console.log(`✅ ${moduleName} 모듈 초기화 완료`);
                    } catch (error) {
                        initResults.push({ module: moduleName, success: false, error });
                        console.error(`❌ ${moduleName} 모듈 초기화 실패:`, error);
                    }
                } else {
                    console.log(`⏭️ ${moduleName} 모듈 없음 또는 초기화 불필요`);
                }
            }
            
            this.initialized = true;
            const initTime = Date.now() - this.startTime;
            
            this.emit('systemInitialized', { 
                timestamp: Date.now(),
                initTime,
                results: initResults,
                version: this.config.version
            });
            
            console.log(`🎉 시스템 초기화 완료 (${initTime}ms)`);
            return true;
            
        } catch (error) {
            console.error('❌ 시스템 초기화 실패:', error);
            this.emit('systemInitializationFailed', { error: error.message });
            return false;
        }
    }

    // 시스템 상태 확인
    getStatus() {
        return {
            initialized: this.initialized,
            moduleCount: this.modules.size,
            uptime: Date.now() - this.startTime,
            version: this.config.version,
            modules: this.getAllModules()
        };
    }

    // 메모리 정리
    cleanup() {
        console.log('🧹 시스템 정리 시작...');
        
        // 모듈별 정리
        for (const [name, module] of this.modules) {
            if (typeof module.cleanup === 'function') {
                try {
                    module.cleanup();
                    console.log(`🧹 ${name} 모듈 정리 완료`);
                } catch (error) {
                    console.error(`❌ ${name} 모듈 정리 실패:`, error);
                }
            }
        }
        
        this.emit('systemCleanup', { timestamp: Date.now() });
        console.log('✅ 시스템 정리 완료');
    }

    // 디버그 모드 토글
    toggleDebug() {
        this.config.debugMode = !this.config.debugMode;
        console.log(`🐛 디버그 모드: ${this.config.debugMode ? 'ON' : 'OFF'}`);
        return this.config.debugMode;
    }

    // 모듈 간 통신 헬퍼
    async callModule(moduleName, methodName, ...args) {
        const module = this.getModule(moduleName);
        if (!module) {
            throw new Error(`모듈을 찾을 수 없음: ${moduleName}`);
        }
        
        if (typeof module[methodName] !== 'function') {
            throw new Error(`메소드를 찾을 수 없음: ${moduleName}.${methodName}`);
        }
        
        try {
            const result = await module[methodName](...args);
            this.emit('moduleMethodCalled', {
                module: moduleName,
                method: methodName,
                args,
                success: true
            });
            return result;
        } catch (error) {
            this.emit('moduleMethodError', {
                module: moduleName,
                method: methodName,
                args,
                error: error.message
            });
            throw error;
        }
    }
}

// 전역 아키텍처 인스턴스
const gameArch = new GameArchitecture();

// Node.js 환경에서는 exports, 브라우저에서는 window에 할당
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameArch;
} else if (typeof window !== 'undefined') {
    window.gameArch = gameArch;
}

// ES6 모듈 환경 지원
if (typeof export !== 'undefined') {
    export default gameArch;
}