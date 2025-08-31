// 성능 최적화를 위한 추가 기능들 (v2.1.0)

// 1. 응답 캐싱 시스템
class ResponseCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 50;
        this.ttl = 300000; // 5분 TTL
    }
    
    generateKey(messageCount, affectionLevel, lastChoice) {
        return `${messageCount}_${Math.floor(affectionLevel/10)}_${lastChoice || 'none'}`;
    }
    
    set(key, response) {
        // 캐시 크기 제한
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data: response,
            timestamp: Date.now()
        });
        
        console.log(`💾 응답 캐싱: ${key}`);
    }
    
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // TTL 체크
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        console.log(`⚡ 캐시 히트: ${key}`);
        return cached.data;
    }
    
    clear() {
        this.cache.clear();
        console.log('🗑️ 캐시 클리어됨');
    }
}

// 2. 성능 모니터링 시스템
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            apiCalls: 0,
            cacheHits: 0,
            avgResponseTime: 0,
            memoryUsage: 0,
            errorCount: 0
        };
        this.responseTimes = [];
    }
    
    startTimer() {
        return performance.now();
    }
    
    endTimer(startTime, operationType = 'unknown') {
        const duration = performance.now() - startTime;
        this.responseTimes.push(duration);
        
        // 최근 10개 응답시간의 평균 계산
        if (this.responseTimes.length > 10) {
            this.responseTimes.shift();
        }
        
        this.metrics.avgResponseTime = 
            this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
        
        console.log(`⏱️ ${operationType} 소요시간: ${duration.toFixed(2)}ms`);
        
        if (duration > 5000) { // 5초 이상
            console.warn(`🐌 느린 응답 감지: ${operationType} - ${duration.toFixed(2)}ms`);
        }
        
        return duration;
    }
    
    recordApiCall() {
        this.metrics.apiCalls++;
    }
    
    recordCacheHit() {
        this.metrics.cacheHits++;
    }
    
    recordError() {
        this.metrics.errorCount++;
    }
    
    updateMemoryUsage() {
        if (performance.memory) {
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
    }
    
    getStats() {
        this.updateMemoryUsage();
        return {
            ...this.metrics,
            cacheHitRate: this.metrics.apiCalls > 0 ? 
                (this.metrics.cacheHits / this.metrics.apiCalls * 100).toFixed(1) + '%' : '0%'
        };
    }
    
    logStats() {
        const stats = this.getStats();
        console.log('📊 성능 통계:', stats);
    }
}

// 3. 로딩 상태 관리자
class LoadingManager {
    constructor() {
        this.loadingStates = new Set();
        this.loadingElement = null;
    }
    
    start(operationId) {
        this.loadingStates.add(operationId);
        this.showLoading();
        console.log(`⏳ 로딩 시작: ${operationId}`);
    }
    
    end(operationId) {
        this.loadingStates.delete(operationId);
        if (this.loadingStates.size === 0) {
            this.hideLoading();
        }
        console.log(`✅ 로딩 완료: ${operationId}`);
    }
    
    showLoading() {
        // 타이핑 인디케이터 표시
        showTypingIndicator();
        
        // 선택지 버튼들 비활성화
        const choiceButtons = document.querySelectorAll('.choice-button');
        choiceButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        
        // 입력 필드 비활성화
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        if (messageInput) messageInput.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
    }
    
    hideLoading() {
        // 타이핑 인디케이터 숨기기
        hideTypingIndicator();
        
        // 선택지 버튼들 활성화
        const choiceButtons = document.querySelectorAll('.choice-button');
        choiceButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        
        // 입력 필드 활성화
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        if (messageInput) messageInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
    }
}

// 4. 메모리 관리자
class MemoryManager {
    constructor() {
        this.maxMessages = 100; // 최대 메시지 수
        this.cleanupInterval = 60000; // 1분마다 정리
        this.startCleanupTimer();
    }
    
    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }
    
    cleanup() {
        try {
            // 오래된 메시지 제거
            this.cleanupMessages();
            
            // 대화 히스토리 압축
            this.compressConversationHistory();
            
            // 가비지 컬렉션 힌트 (Chrome)
            if (window.gc) {
                window.gc();
            }
            
            console.log('🧹 메모리 정리 완료');
        } catch (error) {
            console.error('❌ 메모리 정리 실패:', error);
        }
    }
    
    cleanupMessages() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        const messages = container.children;
        const messageCount = messages.length;
        
        if (messageCount > this.maxMessages) {
            // 오래된 메시지 제거 (첫 20개 제거)
            for (let i = 0; i < 20; i++) {
                if (messages[0]) {
                    container.removeChild(messages[0]);
                }
            }
            console.log(`🗑️ 오래된 메시지 20개 제거됨 (총 ${messageCount}개 중)`);
        }
    }
    
    compressConversationHistory() {
        if (gameState.previousChoices && gameState.previousChoices.length > 50) {
            // 오래된 선택 기록 압축 (최근 30개만 유지)
            gameState.previousChoices = gameState.previousChoices.slice(-30);
            console.log('💿 대화 히스토리 압축됨');
        }
    }
}

// 5. 에러 복구 시스템
class ErrorRecoverySystem {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1초
    }
    
    async withRetry(operation, context = 'unknown') {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔄 시도 ${attempt}/${this.maxRetries}: ${context}`);
                const result = await operation();
                
                if (attempt > 1) {
                    console.log(`✅ ${context} 재시도 성공!`);
                }
                
                return result;
            } catch (error) {
                console.error(`❌ 시도 ${attempt} 실패:`, error.message);
                
                if (attempt === this.maxRetries) {
                    console.error(`💥 최대 재시도 횟수 초과: ${context}`);
                    throw new Error(`${context} 실패: ${error.message}`);
                }
                
                // 지수 백오프 지연
                const delay = this.retryDelay * Math.pow(2, attempt - 1);
                await this.sleep(delay);
            }
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async handleApiError(error, fallbackFunction) {
        console.warn('🚑 API 에러 발생, Fallback 실행:', error.message);
        
        try {
            return await fallbackFunction();
        } catch (fallbackError) {
            console.error('💥 Fallback마저 실패:', fallbackError);
            throw fallbackError;
        }
    }
}

// 6. 전역 성능 최적화 인스턴스들
window.responseCache = new ResponseCache();
window.performanceMonitor = new PerformanceMonitor();
window.loadingManager = new LoadingManager();
window.memoryManager = new MemoryManager();
window.errorRecovery = new ErrorRecoverySystem();

// 7. 향상된 Claude API 호출 함수
async function callClaudeAPIWithOptimization(requestData) {
    const timer = performanceMonitor.startTimer();
    const operationId = 'claude-api-call';
    
    try {
        loadingManager.start(operationId);
        performanceMonitor.recordApiCall();
        
        // 캐시 확인
        const cacheKey = responseCache.generateKey(
            requestData.message_count || 0,
            requestData.affection || 0,
            requestData.user_choice
        );
        
        const cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse) {
            performanceMonitor.recordCacheHit();
            performanceMonitor.endTimer(timer, 'cached-response');
            return cachedResponse;
        }
        
        // 실제 API 호출을 재시도 로직으로 래핑
        const response = await errorRecovery.withRetry(async () => {
            const result = await fetch('/api/scenario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'generate',
                    ...requestData
                }),
                signal: AbortSignal.timeout(10000) // 10초 타임아웃
            });
            
            if (!result.ok) {
                throw new Error(`HTTP ${result.status}: ${result.statusText}`);
            }
            
            return result.json();
        }, 'Claude API 호출');
        
        if (response.success && response.generated) {
            // 성공한 응답 캐싱
            responseCache.set(cacheKey, response.generated);
            performanceMonitor.endTimer(timer, 'api-success');
            return response.generated;
        } else {
            throw new Error('API 응답 형식 오류');
        }
        
    } catch (error) {
        performanceMonitor.recordError();
        performanceMonitor.endTimer(timer, 'api-error');
        
        // Fallback 응답 사용
        return await errorRecovery.handleApiError(error, async () => {
            console.log('🚑 Fallback 응답 사용');
            return getFallbackResponseData(requestData.message_count || 0);
        });
        
    } finally {
        loadingManager.end(operationId);
    }
}

// 8. Fallback 응답 데이터
function getFallbackResponseData(messageCount) {
    const fallbackResponses = [
        {
            dialogue: "오빠... 어제는 정말 미안해 😳 취해서 그런 말까지 했는데, 기억나지도 않아서 더 부끄러워 💦",
            narration: "윤아가 얼굴을 붉히며 손으로 얼굴을 가린다. 진심이었지만 용기가 나지 않는 것 같다.",
            choices: [
                {"text": "괜찮다고 다정하게 말해준다", "affection_impact": 2},
                {"text": "어떤 말을 했는지 궁금하다고 한다", "affection_impact": 0},
                {"text": "진심이었는지 조심스럽게 물어본다", "affection_impact": 1}
            ]
        },
        {
            dialogue: "사실은... 술 핑계였어 😔 평소에 말 못했던 진심이었는데, 이렇게 어색해질까봐 무서워",
            narration: "윤아의 목소리가 떨리며, 눈물이 살짝 맺힌다. 1년 동안 숨겨왔던 마음을 털어놓고 있다.",
            choices: [
                {"text": "나도 같은 마음이었다고 고백한다", "affection_impact": 3},
                {"text": "용기내줘서 고맙다고 말한다", "affection_impact": 2},
                {"text": "시간을 두고 생각해보자고 한다", "affection_impact": -1}
            ]
        },
        {
            dialogue: "오빠가 싫어할까봐 걱정했는데... 이렇게 말해주니까 마음이 좀 놓여 😌 고마워",
            narration: "윤아가 안도의 표정을 지으며 작은 미소를 짓는다. 차분해진 분위기가 따뜻하게 느껴진다.",
            choices: [
                {"text": "앞으로 더 많이 대화하자고 제안한다", "affection_impact": 2},
                {"text": "언제든 편하게 말하라고 격려한다", "affection_impact": 1},
                {"text": "커피라도 한잔 하자고 제안한다", "affection_impact": 2}
            ]
        }
    ];
    
    return fallbackResponses[messageCount % fallbackResponses.length];
}

// 9. 성능 모니터링 UI
function showPerformanceStats() {
    const stats = performanceMonitor.getStats();
    
    // 기존 성능 패널 제거
    const existingPanel = document.getElementById('performancePanel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'performancePanel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 10000;
        max-width: 200px;
    `;
    
    panel.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">⚡ 성능 통계</div>
        <div>API 호출: ${stats.apiCalls}</div>
        <div>캐시 적중률: ${stats.cacheHitRate}</div>
        <div>평균 응답시간: ${stats.avgResponseTime.toFixed(0)}ms</div>
        <div>메모리: ${stats.memoryUsage.toFixed(1)}MB</div>
        <div>에러: ${stats.errorCount}</div>
        <button onclick="hidePerformanceStats()" style="margin-top: 5px; padding: 2px 6px;">닫기</button>
    `;
    
    document.body.appendChild(panel);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (document.getElementById('performancePanel')) {
            hidePerformanceStats();
        }
    }, 5000);
}

function hidePerformanceStats() {
    const panel = document.getElementById('performancePanel');
    if (panel) panel.remove();
}

// 10. 전역 이벤트 리스너 (개발 모드)
if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
    // 개발 모드에서만 성능 통계 단축키
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            showPerformanceStats();
        }
    });
    
    // 주기적으로 성능 로그 출력
    setInterval(() => {
        performanceMonitor.logStats();
    }, 30000); // 30초마다
}

console.log('✅ 성능 최적화 모듈 로드됨 (v2.1.0)');
