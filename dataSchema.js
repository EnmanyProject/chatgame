/**
 * 텍스트 기반 메신저형 어드벤처 게임 - 데이터 스키마 모듈
 * @version 1.0.0
 * @author dosik + Claude
 */

// 🗃️ 데이터 스키마 모듈 클래스
class DataSchemaModule extends BaseModule {
    constructor() {
        super('dataSchema');
        this.schemas = new Map();
        this.validators = new Map();
        this.factories = new Map();
        
        this.initializeSchemas();
    }

    async onInitialize() {
        console.log('📊 데이터 스키마 모듈 초기화됨');
        this.validateAllSchemas();
        return true;
    }

    // 스키마 초기화
    initializeSchemas() {
        // 4개 핵심 스키마 등록
        this.registerSchema('character', CHARACTER_SCHEMA, this.validateCharacter.bind(this));
        this.registerSchema('episode', EPISODE_SCHEMA, this.validateEpisode.bind(this));
        this.registerSchema('choice', CHOICE_SCHEMA, this.validateChoice.bind(this));
        this.registerSchema('saveData', SAVE_DATA_SCHEMA, this.validateSaveData.bind(this));

        // 팩토리 함수 등록
        this.factories.set('character', createCharacter);
        this.factories.set('episode', createEpisode);
        this.factories.set('choice', createChoice);
        this.factories.set('saveData', createSaveData);
    }

    // 스키마 등록
    registerSchema(name, schema, validator) {
        this.schemas.set(name, schema);
        this.validators.set(name, validator);
        this.logger?.debug(`📋 스키마 등록: ${name}`);
    }

    // 스키마 조회
    getSchema(name) {
        if (!this.schemas.has(name)) {
            throw new Error(`스키마 '${name}'을 찾을 수 없습니다`);
        }
        return this.schemas.get(name);
    }

    // 데이터 생성
    create(type, data = {}) {
        const factory = this.factories.get(type);
        if (!factory) {
            throw new Error(`팩토리 '${type}'을 찾을 수 없습니다`);
        }
        return factory(data);
    }

    // 데이터 검증
    validate(type, data) {
        const validator = this.validators.get(type);
        if (!validator) {
            throw new Error(`검증기 '${type}'을 찾을 수 없습니다`);
        }
        return validator(data);
    }

    // 모든 스키마 검증
    validateAllSchemas() {
        let validCount = 0;
        for (const [name, schema] of this.schemas) {
            try {
                if (schema && typeof schema === 'object') {
                    validCount++;
                    this.logger?.debug(`✅ 스키마 검증 성공: ${name}`);
                }
            } catch (error) {
                this.logger?.error(`❌ 스키마 검증 실패: ${name}`, error);
            }
        }
        console.log(`📊 스키마 검증 완료: ${validCount}/${this.schemas.size}개 통과`);
    }
}

// 🧑‍🎨 캐릭터 데이터 스키마
const CHARACTER_SCHEMA = {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    mbti: { type: 'string', required: true, pattern: /^[IE][SN][TF][JP]$/ },
    age: { type: 'number', required: true, min: 15, max: 30 },
    personality: {
        type: 'object',
        required: true,
        properties: {
            traits: { type: 'array', items: { type: 'string' } },
            speech_pattern: { type: 'string' },
            emoji_usage: { type: 'string' }
        }
    },
    relationships: {
        type: 'object',
        properties: {
            player: { type: 'string' },
            background: { type: 'string' }
        }
    },
    affection: {
        type: 'object',
        properties: {
            initial: { type: 'number', default: 0 },
            current: { type: 'number', default: 0 },
            max: { type: 'number', default: 100 },
            min: { type: 'number', default: -100 },
            history: { type: 'array', items: { type: 'object' } }
        }
    }
};

// 📖 에피소드 데이터 스키마  
const EPISODE_SCHEMA = {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true },
    scenario_id: { type: 'string', required: true },
    order: { type: 'number', required: true, min: 1, max: 36 },
    trigger: {
        type: 'object',
        properties: {
            affection_min: { type: 'number', default: -100 },
            required_flags: { type: 'array', items: { type: 'string' } },
            previous_episodes: { type: 'array', items: { type: 'string' } }
        }
    },
    content: {
        type: 'object',
        required: true,
        properties: {
            initial_message: { type: 'string', required: true },
            context: { type: 'string' },
            mood: { type: 'string', enum: ['shy', 'happy', 'sad', 'excited', 'nervous', 'romantic'] }
        }
    },
    choices: { type: 'array', items: { type: 'string' } }, // choice IDs
    outcomes: {
        type: 'object',
        properties: {
            success_condition: { type: 'object' },
            failure_condition: { type: 'object' },
            next_episodes: { type: 'array', items: { type: 'string' } }
        }
    }
};

// 🎯 선택지 데이터 스키마
const CHOICE_SCHEMA = {
    id: { type: 'string', required: true },
    text: { type: 'string', required: true },
    type: { type: 'string', enum: ['choice', 'input', 'auto'], default: 'choice' },
    effects: {
        type: 'object',
        properties: {
            affection_change: { type: 'number', default: 0 },
            flags_add: { type: 'array', items: { type: 'string' } },
            flags_remove: { type: 'array', items: { type: 'string' } }
        }
    },
    conditions: {
        type: 'object',
        properties: {
            min_affection: { type: 'number', default: -100 },
            required_flags: { type: 'array', items: { type: 'string' } }
        }
    },
    response: {
        type: 'object',
        properties: {
            immediate: { type: 'string' },
            delayed: { type: 'string' },
            ai_generated: { type: 'boolean', default: false }
        }
    }
};

// 💾 저장 데이터 스키마
const SAVE_DATA_SCHEMA = {
    player: {
        type: 'object',
        required: true,
        properties: {
            name: { type: 'string', default: '플레이어' },
            created_at: { type: 'string' }, // ISO Date
            last_played: { type: 'string' }, // ISO Date
            play_time: { type: 'number', default: 0 } // 분 단위
        }
    },
    progress: {
        type: 'object',
        properties: {
            current_scenario: { type: 'string' },
            current_episode: { type: 'string' },
            completed_episodes: { type: 'array', items: { type: 'string' } },
            unlocked_scenarios: { type: 'array', items: { type: 'string' } }
        }
    },
    relationships: { type: 'object' }, // Map을 객체로 저장
    choices_history: { type: 'array', items: { type: 'object' } },
    flags: { type: 'array', items: { type: 'string' } }, // Set을 배열로 저장
    settings: {
        type: 'object',
        properties: {
            auto_save: { type: 'boolean', default: true },
            text_speed: { type: 'number', default: 50 },
            sound_enabled: { type: 'boolean', default: true }
        }
    }
};

// 🏭 팩토리 함수들
function createCharacter(data = {}) {
    const now = new Date().toISOString();
    return {
        id: data.id || `char_${Date.now()}`,
        name: data.name || '새 캐릭터',
        mbti: data.mbti || 'INFP',
        age: data.age || 20,
        personality: {
            traits: data.personality?.traits || ['감성적', '창의적', '내향적'],
            speech_pattern: data.personality?.speech_pattern || '부드럽고 따뜻한 말투',
            emoji_usage: data.personality?.emoji_usage || '자주 사용'
        },
        relationships: {
            player: data.relationships?.player || '새로운 인연',
            background: data.relationships?.background || '첫 만남'
        },
        affection: {
            initial: data.affection?.initial || 0,
            current: data.affection?.current || data.affection?.initial || 0,
            max: data.affection?.max || 100,
            min: data.affection?.min || -100,
            history: data.affection?.history || []
        },
        created_at: now
    };
}

function createEpisode(data = {}) {
    return {
        id: data.id || `ep_${Date.now()}`,
        title: data.title || '새 에피소드',
        scenario_id: data.scenario_id || 'default_scenario',
        order: data.order || 1,
        trigger: {
            affection_min: data.trigger?.affection_min || -100,
            required_flags: data.trigger?.required_flags || [],
            previous_episodes: data.trigger?.previous_episodes || []
        },
        content: {
            initial_message: data.content?.initial_message || '새로운 대화가 시작됩니다.',
            context: data.content?.context || '일상적인 상황',
            mood: data.content?.mood || 'happy'
        },
        choices: data.choices || [],
        outcomes: {
            success_condition: data.outcomes?.success_condition || {},
            failure_condition: data.outcomes?.failure_condition || {},
            next_episodes: data.outcomes?.next_episodes || []
        }
    };
}

function createChoice(data = {}) {
    return {
        id: data.id || `choice_${Date.now()}`,
        text: data.text || '새 선택지',
        type: data.type || 'choice',
        effects: {
            affection_change: data.effects?.affection_change || 0,
            flags_add: data.effects?.flags_add || [],
            flags_remove: data.effects?.flags_remove || []
        },
        conditions: {
            min_affection: data.conditions?.min_affection || -100,
            required_flags: data.conditions?.required_flags || []
        },
        response: {
            immediate: data.response?.immediate || '',
            delayed: data.response?.delayed || '',
            ai_generated: data.response?.ai_generated || false
        }
    };
}

function createSaveData(data = {}) {
    const now = new Date().toISOString();
    return {
        player: {
            name: data.player?.name || '플레이어',
            created_at: data.player?.created_at || now,
            last_played: now,
            play_time: data.player?.play_time || 0
        },
        progress: {
            current_scenario: data.progress?.current_scenario || null,
            current_episode: data.progress?.current_episode || null,
            completed_episodes: data.progress?.completed_episodes || [],
            unlocked_scenarios: data.progress?.unlocked_scenarios || ['default_scenario']
        },
        relationships: data.relationships || {},
        choices_history: data.choices_history || [],
        flags: data.flags || [],
        settings: {
            auto_save: data.settings?.auto_save !== false,
            text_speed: data.settings?.text_speed || 50,
            sound_enabled: data.settings?.sound_enabled !== false
        }
    };
}

// ✅ 검증 함수들
DataSchemaModule.prototype.validateCharacter = function(data) {
    const errors = [];
    
    if (!data.id || typeof data.id !== 'string') {
        errors.push('캐릭터 ID가 필요합니다');
    }
    if (!data.name || typeof data.name !== 'string') {
        errors.push('캐릭터 이름이 필요합니다');
    }
    if (!data.mbti || !/^[IE][SN][TF][JP]$/.test(data.mbti)) {
        errors.push('유효한 MBTI 타입이 필요합니다');
    }
    if (typeof data.age !== 'number' || data.age < 15 || data.age > 30) {
        errors.push('나이는 15-30 사이여야 합니다');
    }
    
    return { valid: errors.length === 0, errors };
};

DataSchemaModule.prototype.validateEpisode = function(data) {
    const errors = [];
    
    if (!data.id || typeof data.id !== 'string') {
        errors.push('에피소드 ID가 필요합니다');
    }
    if (!data.title || typeof data.title !== 'string') {
        errors.push('에피소드 제목이 필요합니다');
    }
    if (typeof data.order !== 'number' || data.order < 1 || data.order > 36) {
        errors.push('에피소드 순서는 1-36 사이여야 합니다');
    }
    
    return { valid: errors.length === 0, errors };
};

DataSchemaModule.prototype.validateChoice = function(data) {
    const errors = [];
    
    if (!data.id || typeof data.id !== 'string') {
        errors.push('선택지 ID가 필요합니다');
    }
    if (!data.text || typeof data.text !== 'string') {
        errors.push('선택지 텍스트가 필요합니다');
    }
    
    return { valid: errors.length === 0, errors };
};

DataSchemaModule.prototype.validateSaveData = function(data) {
    const errors = [];
    
    if (!data.player || typeof data.player !== 'object') {
        errors.push('플레이어 정보가 필요합니다');
    }
    
    return { valid: errors.length === 0, errors };
};

// 🎮 샘플 데이터
const SAMPLE_DATA = {
    character: createCharacter({
        id: 'yuna_infp',
        name: '윤아',
        mbti: 'INFP',
        age: 20,
        personality: {
            traits: ['감성적', '창의적', '내향적', '이상주의적'],
            speech_pattern: '부드럽고 따뜻한 말투, 이모티콘 자주 사용',
            emoji_usage: '😊 😳 💕 🙈 자주 사용'
        },
        relationships: {
            player: '좋아하는 선배',
            background: '예술 전공 후배, 1년 넘게 짝사랑 중'
        },
        affection: {
            initial: -10,
            current: 15
        }
    }),
    
    episode: createEpisode({
        id: 'ep001',
        title: '어색한 아침 인사',
        scenario_id: 'hangover_confession',
        order: 1,
        content: {
            initial_message: '오빠... 어제는 정말 미안해 😳 취해서 그런 말까지 했는데...',
            context: '어제 밤 술에 취해 고백한 후 다음날 아침의 어색한 상황',
            mood: 'shy'
        }
    }),
    
    choice: createChoice({
        id: 'choice001',
        text: '괜찮다고 다정하게 말해준다',
        effects: {
            affection_change: 3
        },
        response: {
            immediate: '정말요? 다행이에요... 😊',
            ai_generated: true
        }
    }),
    
    saveData: createSaveData({
        player: {
            name: '시우'
        },
        progress: {
            current_scenario: 'hangover_confession',
            current_episode: 'ep001',
            completed_episodes: [],
            unlocked_scenarios: ['hangover_confession']
        }
    })
};

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataSchemaModule,
        CHARACTER_SCHEMA,
        EPISODE_SCHEMA, 
        CHOICE_SCHEMA,
        SAVE_DATA_SCHEMA,
        createCharacter,
        createEpisode,
        createChoice,
        createSaveData,
        SAMPLE_DATA
    };
}