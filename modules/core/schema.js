/**
 * 📊 데이터 스키마 정의 모듈 (v2.1.0)
 * - 캐릭터 데이터 구조
 * - 에피소드/시나리오 구조  
 * - 호감도 시스템 구조
 * - 저장 데이터 구조
 */

export class DataSchema {
    static version = '2.1.0';
    
    // 캐릭터 스키마
    static CHARACTER_SCHEMA = {
        id: 'string',
        name: 'string', 
        age: 'number',
        mbti: 'string',
        personality: 'string',
        relationship: 'string',
        background: 'string',
        avatar_url: 'string',
        active: 'boolean',
        dialogue_style: {
            casual: 'array',
            romantic: 'array', 
            shy: 'array'
        },
        stats: {
            total_interactions: 'number',
            max_affection_reached: 'number',
            completion_rate: 'number'
        }
    };

    // 에피소드/시나리오 스키마
    static EPISODE_SCHEMA = {
        id: 'string',
        title: 'string',
        description: 'string',
        synopsis: 'string',
        setting: 'string',
        mood: 'string',
        character_id: 'string',
        max_choices: 'number',
        dialogues: 'array',
        active: 'boolean',
        tags: 'array',
        difficulty_level: 'number',
        estimated_duration: 'number'
    };

    // 대화 스키마
    static DIALOGUE_SCHEMA = {
        id: 'string',
        episode_id: 'string',
        character_id: 'string',
        choice_number: 'number',
        dialogue: 'string',
        narration: 'string',
        emotion: 'string',
        mood_indicator: 'string',
        choices: [{
            text: 'string',
            affection_impact: 'number',
            branch_id: 'string',
            unlock_condition: 'object'
        }],
        conditions: {
            min_affection: 'number',
            required_choices: 'array',
            time_limit: 'number'
        }
    };

    // 게임 상태 스키마
    static GAME_STATE_SCHEMA = {
        currentScenario: 'object',
        currentCharacter: 'object', 
        choiceNumber: 'number',
        affection: 'number',
        messageCount: 'number',
        previousChoices: 'array',
        conversationHistory: 'array',
        totalPlaytime: 'number',
        lastSaved: 'number',
        gameMode: 'string', // 'story', 'freeChat', 'dateMode'
        flags: 'object',
        achievements: 'array'
    };

    // 저장 데이터 스키마
    static SAVE_DATA_SCHEMA = {
        save_meta: {
            version: 'string',
            slot_number: 'number',
            description: 'string',
            created_at: 'number',
            last_saved: 'number',
            save_type: 'string', // 'manual', 'auto', 'quick'
            checksum: 'string',
            file_size: 'number'
        },
        game_progress: {
            current_episode_id: 'string',
            current_character_id: 'string',
            choice_number: 'number',
            episode_progress: 'number',
            story_branch: 'string',
            narrative_phase: 'string',
            completed_episodes: 'array'
        },
        player_data: {
            name: 'string',
            total_playtime: 'number',
            sessions_played: 'number',
            favorite_character: 'string'
        },
        relationship_status: {
            character_id: 'string',
            affection: 'number',
            relationship_level: 'string',
            relationship_milestones: 'array',
            confession_status: 'string'
        },
        choice_records: 'array',
        statistics: {
            total_choices_made: 'number',
            romantic_choices: 'number',
            friendly_choices: 'number',
            best_ending_achieved: 'boolean'
        }
    };

    // 유효한 MBTI 타입들
    static VALID_MBTI_TYPES = [
        'ENFP', 'ENFJ', 'ENTP', 'ENTJ',
        'ESFP', 'ESFJ', 'ESTP', 'ESTJ', 
        'INFP', 'INFJ', 'INTP', 'INTJ',
        'ISFP', 'ISFJ', 'ISTP', 'ISTJ'
    ];

    // 감정 상태 목록
    static EMOTION_TYPES = [
        'neutral', 'happy', 'sad', 'angry', 'surprised',
        'shy', 'romantic', 'playful', 'serious', 'worried',
        'excited', 'embarrassed', 'confident', 'confused'
    ];

    // 관계 레벨 정의
    static RELATIONSHIP_LEVELS = {
        stranger: { min: 0, max: 20, label: '모르는 사이' },
        acquaintance: { min: 21, max: 40, label: '아는 사이' },
        friend: { min: 41, max: 60, label: '친구' },
        close_friend: { min: 61, max: 75, label: '절친' },
        romantic_interest: { min: 76, max: 90, label: '연인 가능성' },
        lover: { min: 91, max: 100, label: '연인' }
    };

    /**
     * 데이터 타입 검증
     */
    static validateType(value, expectedType) {
        if (expectedType === 'array') {
            return Array.isArray(value);
        }
        if (expectedType === 'object') {
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        }
        return typeof value === expectedType;
    }

    /**
     * 스키마에 따른 데이터 검증
     */
    static validate(data, schema, path = '') {
        const errors = [];
        
        if (!data || typeof data !== 'object') {
            return { valid: false, errors: ['데이터가 객체가 아닙니다'] };
        }

        for (const [key, expectedType] of Object.entries(schema)) {
            const currentPath = path ? `${path}.${key}` : key;
            const value = data[key];

            // 필수 필드 체크 (undefined 허용하지 않음)
            if (value === undefined) {
                errors.push(`필수 필드 누락: ${currentPath}`);
                continue;
            }

            // 중첩 객체 처리
            if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
                if (typeof value === 'object' && value !== null) {
                    const nestedValidation = this.validate(value, expectedType, currentPath);
                    errors.push(...nestedValidation.errors);
                } else {
                    errors.push(`잘못된 객체 타입: ${currentPath}`);
                }
                continue;
            }

            // 배열 스키마 처리
            if (Array.isArray(expectedType) && expectedType.length > 0) {
                if (!Array.isArray(value)) {
                    errors.push(`배열이어야 함: ${currentPath}`);
                    continue;
                }
                
                // 배열 요소 검증
                const elementSchema = expectedType[0];
                value.forEach((item, index) => {
                    if (typeof elementSchema === 'object') {
                        const itemValidation = this.validate(item, elementSchema, `${currentPath}[${index}]`);
                        errors.push(...itemValidation.errors);
                    } else if (!this.validateType(item, elementSchema)) {
                        errors.push(`배열 요소 타입 오류: ${currentPath}[${index}] (기대: ${elementSchema})`);
                    }
                });
                continue;
            }

            // 기본 타입 검증
            if (!this.validateType(value, expectedType)) {
                errors.push(`타입 오류: ${currentPath} (기대: ${expectedType}, 실제: ${typeof value})`);
            }

            // 특별한 검증 규칙들
            this.validateSpecialRules(key, value, currentPath, errors);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 특별한 검증 규칙들
     */
    static validateSpecialRules(key, value, path, errors) {
        switch (key) {
            case 'mbti':
                if (typeof value === 'string' && !this.VALID_MBTI_TYPES.includes(value.toUpperCase())) {
                    errors.push(`유효하지 않은 MBTI 타입: ${path} (${value})`);
                }
                break;
                
            case 'emotion':
                if (typeof value === 'string' && !this.EMOTION_TYPES.includes(value)) {
                    errors.push(`유효하지 않은 감정 타입: ${path} (${value})`);
                }
                break;
                
            case 'affection':
                if (typeof value === 'number' && (value < 0 || value > 100)) {
                    errors.push(`호감도 범위 오류: ${path} (0-100 범위여야 함)`);
                }
                break;
                
            case 'age':
                if (typeof value === 'number' && (value < 18 || value > 50)) {
                    errors.push(`나이 범위 오류: ${path} (18-50 범위여야 함)`);
                }
                break;
        }
    }

    /**
     * 기본 데이터 생성
     */
    static createDefault(type, overrides = {}) {
        const defaults = {
            gameState: {
                currentScenario: null,
                currentCharacter: null,
                choiceNumber: 0,
                affection: 75,
                messageCount: 0,
                previousChoices: [],
                conversationHistory: [],
                totalPlaytime: 0,
                lastSaved: Date.now(),
                gameMode: 'story',
                flags: {},
                achievements: []
            },
            
            character: {
                id: '',
                name: '',
                age: 20,
                mbti: 'INFP',
                personality: '',
                relationship: '',
                background: '',
                avatar_url: '',
                active: true,
                dialogue_style: {
                    casual: [],
                    romantic: [],
                    shy: []
                },
                stats: {
                    total_interactions: 0,
                    max_affection_reached: 0,
                    completion_rate: 0
                }
            },
            
            episode: {
                id: '',
                title: '',
                description: '',
                synopsis: '',
                setting: '',
                mood: 'neutral',
                character_id: '',
                max_choices: 36,
                dialogues: [],
                active: true,
                tags: [],
                difficulty_level: 1,
                estimated_duration: 15
            },
            
            saveData: {
                save_meta: {
                    version: this.version,
                    slot_number: 1,
                    description: '새로운 저장',
                    created_at: Date.now(),
                    last_saved: Date.now(),
                    save_type: 'manual',
                    checksum: '',
                    file_size: 0
                },
                game_progress: {
                    current_episode_id: '',
                    current_character_id: '',
                    choice_number: 0,
                    episode_progress: 0,
                    story_branch: 'main',
                    narrative_phase: 'introduction',
                    completed_episodes: []
                },
                player_data: {
                    name: 'Player',
                    total_playtime: 0,
                    sessions_played: 1,
                    favorite_character: ''
                },
                relationship_status: {
                    character_id: '',
                    affection: 75,
                    relationship_level: 'friend',
                    relationship_milestones: [],
                    confession_status: 'none'
                },
                choice_records: [],
                statistics: {
                    total_choices_made: 0,
                    romantic_choices: 0,
                    friendly_choices: 0,
                    best_ending_achieved: false
                }
            }
        };
        
        const defaultData = defaults[type];
        if (!defaultData) {
            throw new Error(`알 수 없는 기본 데이터 타입: ${type}`);
        }

        // 깊은 병합 수행
        return this.deepMerge(defaultData, overrides);
    }

    /**
     * 깊은 객체 병합
     */
    static deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * 관계 레벨 계산
     */
    static getRelationshipLevel(affection) {
        for (const [level, range] of Object.entries(this.RELATIONSHIP_LEVELS)) {
            if (affection >= range.min && affection <= range.max) {
                return { level, label: range.label, ...range };
            }
        }
        return { level: 'unknown', label: '알 수 없음', min: 0, max: 0 };
    }

    /**
     * 체크섬 생성 (저장 데이터 무결성 검증용)
     */
    static generateChecksum(data) {
        const jsonString = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32비트로 변환
        }
        return Math.abs(hash).toString(16);
    }
}

// Node.js 호환성
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataSchema };
}

export default DataSchema;