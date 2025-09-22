// 온라인 전용 데이터 클라이언트
// LocalStorage 대신 GitHub API를 통한 완전한 온라인 데이터 관리

class OnlineDataClient {
    constructor() {
        this.baseUrl = '/api/github-data-manager';
        this.githubToken = null;
        this.cache = new Map(); // 메모리 캐시 (세션 동안만 유지)
        this.requestQueue = []; // 요청 큐 (네트워크 오류 시 재시도)

        console.log('🌐 온라인 데이터 클라이언트 초기화');
        this.initializeToken();
    }

    // GitHub Token 초기화
    async initializeToken() {
        try {
            // 환경변수에서 토큰 로드 시도
            const response = await fetch('/api/github-token');
            if (response.ok) {
                const data = await response.json();
                this.githubToken = data.token;
                console.log('✅ GitHub 토큰 로드 성공 (환경변수)');
                return;
            }
        } catch (error) {
            console.warn('⚠️ 환경변수 토큰 로드 실패:', error);
        }

        // 사용자에게 토큰 요청
        await this.requestUserToken();
    }

    // 사용자 토큰 입력 요청
    async requestUserToken() {
        const token = prompt(`
🔐 GitHub Personal Access Token이 필요합니다!

📝 설정 방법:
1. GitHub.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Select scopes: 'repo' (Full control)
5. Copy token and paste below:

GitHub Token:`);

        if (token && token.trim().length > 20) {
            this.githubToken = token.trim();

            // 토큰 유효성 검증
            if (await this.validateToken()) {
                console.log('✅ GitHub 토큰 설정 완료');
                return;
            }
        }

        throw new Error('유효한 GitHub 토큰이 필요합니다');
    }

    // 토큰 유효성 검증
    async validateToken() {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: { 'Authorization': `token ${this.githubToken}` }
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    // 공통 요청 헤더
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-github-token': this.githubToken
        };
    }

    // === 캐릭터 관리 ===
    async loadCharacters() {
        console.log('📥 온라인에서 캐릭터 로드...');

        try {
            const response = await fetch(`${this.baseUrl}?action=load&type=characters`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                this.cache.set('characters', result.data);
                console.log(`✅ 캐릭터 ${result.count}개 로드 완료 (온라인)`);
                return result.data;
            } else {
                throw new Error(result.error || '캐릭터 로드 실패');
            }

        } catch (error) {
            console.error('❌ 캐릭터 온라인 로드 실패:', error);

            // 캐시된 데이터 반환 (있는 경우)
            const cached = this.cache.get('characters');
            if (cached) {
                console.log('💾 캐시된 캐릭터 데이터 사용');
                return cached;
            }

            throw error;
        }
    }

    async saveCharacter(characterData) {
        console.log('💾 온라인에 캐릭터 저장:', characterData.name);

        try {
            const response = await fetch(`${this.baseUrl}?action=save&type=characters`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(characterData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                // 캐시 업데이트
                const cached = this.cache.get('characters') || {};
                cached[result.id] = result.data;
                this.cache.set('characters', cached);

                console.log(`✅ 캐릭터 '${characterData.name}' 저장 완료 (온라인)`);
                return result;
            } else {
                throw new Error(result.error || '캐릭터 저장 실패');
            }

        } catch (error) {
            console.error('❌ 캐릭터 온라인 저장 실패:', error);

            // 요청 큐에 추가 (나중에 재시도)
            this.requestQueue.push({
                type: 'saveCharacter',
                data: characterData,
                timestamp: Date.now()
            });

            throw error;
        }
    }

    async deleteCharacter(characterId) {
        console.log('🗑️ 온라인에서 캐릭터 삭제:', characterId);

        try {
            const response = await fetch(`${this.baseUrl}?action=delete&type=characters&id=${characterId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                // 캐시에서 제거
                const cached = this.cache.get('characters') || {};
                delete cached[characterId];
                this.cache.set('characters', cached);

                console.log(`✅ 캐릭터 ${characterId} 삭제 완료 (온라인)`);
                return result;
            } else {
                throw new Error(result.error || '캐릭터 삭제 실패');
            }

        } catch (error) {
            console.error('❌ 캐릭터 온라인 삭제 실패:', error);
            throw error;
        }
    }

    // === 시나리오 관리 ===
    async loadScenarios() {
        console.log('📥 온라인에서 시나리오 로드...');

        try {
            const response = await fetch(`${this.baseUrl}?action=load&type=scenarios`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                this.cache.set('scenarios', result.data);
                console.log(`✅ 시나리오 ${result.count}개 로드 완료 (온라인)`);
                return result.data;
            } else {
                throw new Error(result.error || '시나리오 로드 실패');
            }

        } catch (error) {
            console.error('❌ 시나리오 온라인 로드 실패:', error);

            // 캐시된 데이터 반환 (있는 경우)
            const cached = this.cache.get('scenarios');
            if (cached) {
                console.log('💾 캐시된 시나리오 데이터 사용');
                return cached;
            }

            throw error;
        }
    }

    async saveScenario(scenarioData) {
        console.log('💾 온라인에 시나리오 저장:', scenarioData.title);

        try {
            const response = await fetch(`${this.baseUrl}?action=save&type=scenarios`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(scenarioData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                // 캐시 업데이트
                const cached = this.cache.get('scenarios') || {};
                cached[result.id] = result.data;
                this.cache.set('scenarios', cached);

                console.log(`✅ 시나리오 '${scenarioData.title}' 저장 완료 (온라인)`);
                return result;
            } else {
                throw new Error(result.error || '시나리오 저장 실패');
            }

        } catch (error) {
            console.error('❌ 시나리오 온라인 저장 실패:', error);

            // 요청 큐에 추가 (나중에 재시도)
            this.requestQueue.push({
                type: 'saveScenario',
                data: scenarioData,
                timestamp: Date.now()
            });

            throw error;
        }
    }

    // === 에피소드 관리 ===
    async loadEpisodes() {
        console.log('📥 온라인에서 에피소드 로드...');

        try {
            const response = await fetch(`${this.baseUrl}?action=load&type=episodes`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                this.cache.set('episodes', result.data);
                console.log(`✅ 에피소드 ${result.count}개 로드 완료 (온라인)`);
                return result.data;
            } else {
                throw new Error(result.error || '에피소드 로드 실패');
            }

        } catch (error) {
            console.error('❌ 에피소드 온라인 로드 실패:', error);

            // 캐시된 데이터 반환 (있는 경우)
            const cached = this.cache.get('episodes');
            if (cached) {
                console.log('💾 캐시된 에피소드 데이터 사용');
                return cached;
            }

            throw error;
        }
    }

    // === 유틸리티 ===

    // 네트워크 상태 확인
    async checkOnlineStatus() {
        try {
            const response = await fetch('/api/test', { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    // 요청 큐 재시도
    async retryQueuedRequests() {
        if (this.requestQueue.length === 0) return;

        console.log(`🔄 큐 대기 중인 요청 ${this.requestQueue.length}개 재시도...`);

        const failedRequests = [];

        for (const request of this.requestQueue) {
            try {
                if (request.type === 'saveCharacter') {
                    await this.saveCharacter(request.data);
                } else if (request.type === 'saveScenario') {
                    await this.saveScenario(request.data);
                }
                console.log(`✅ 큐 요청 재시도 성공: ${request.type}`);
            } catch (error) {
                console.error(`❌ 큐 요청 재시도 실패: ${request.type}`, error);
                failedRequests.push(request);
            }
        }

        this.requestQueue = failedRequests;
    }

    // 캐시 클리어
    clearCache() {
        this.cache.clear();
        console.log('🧹 메모리 캐시 클리어됨');
    }

    // 전체 데이터 동기화
    async syncAllData() {
        console.log('🔄 전체 데이터 온라인 동기화 시작...');

        try {
            const [characters, scenarios, episodes] = await Promise.all([
                this.loadCharacters(),
                this.loadScenarios(),
                this.loadEpisodes()
            ]);

            console.log('✅ 전체 데이터 동기화 완료');
            return { characters, scenarios, episodes };

        } catch (error) {
            console.error('❌ 데이터 동기화 실패:', error);
            throw error;
        }
    }
}

// 전역 인스턴스 생성
window.onlineDataClient = new OnlineDataClient();