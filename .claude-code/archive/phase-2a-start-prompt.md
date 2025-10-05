# 🚀 Phase 2-A 작업 시작 프롬프트

---

## 📋 Claude Code 작업 지시

```
안녕 Claude Code! Phase 2-A 작업을 시작하자.

[필수] 먼저 다음 문서들을 읽고 숙지해줘:
1. PHASE-1-COMPLETION-REPORT.md (Phase 1 완료 내역)
2. .claude-code/handoff-to-claude-code.md (전체 프로젝트 개요)
3. claude.md (프로젝트 히스토리)

[완료 확인] Phase 1 작업 완료:
✅ Phase 1-A: 채팅 UI 및 기초 시스템
✅ Phase 1-B: 에피소드 트리거 시스템
✅ Phase 1-C: 멀티 캐릭터 동시 채팅
✅ Phase 1-D: 통합 테스트 및 마무리
✅ Git 태그: v2.0.0-phase1

[Phase 2 목표]
보상 시스템 구축으로 더 깊은 몰입감 제공
```

---

## 🎯 Phase 2-A 작업 목표

**작업명**: 대화 톤 변화 시스템  
**파일 생성**: 
- `js/tone-variation-engine.js` (톤 변화 엔진)
- `data/tone-templates.json` (톤별 메시지 템플릿)

**예상 시간**: 2일 작업  
**목표**: 호감도에 따라 캐릭터의 말투가 자연스럽게 변하는 시스템

---

## 💬 톤 레벨 시스템 설계

### 5단계 톤 레벨 구조

```javascript
호감도 1-2: 톤 레벨 1 (존댓말, 거리감)
호감도 3-4: 톤 레벨 2 (반말, 이모티콘)
호감도 5-6: 톤 레벨 3 (애교, 장난)
호감도 7-8: 톤 레벨 4 (애정표현)
호감도 9-10: 톤 레벨 5 (적극적, 섹시 코드)
```

---

## 📝 상세 작업 내용

### 1️⃣ js/tone-variation-engine.js (70% 비중)

#### 구현 요구사항:

```javascript
/**
 * Tone Variation Engine
 * 호감도에 따라 캐릭터의 대화 톤을 자동으로 변경
 */

class ToneVariationEngine {
  constructor(characterId) {
    this.characterId = characterId;
    this.toneTemplates = null;
    this.currentTone = 1;
    this.loadTemplates();
  }

  // 톤 템플릿 로드
  async loadTemplates() {
    try {
      const response = await fetch('data/tone-templates.json');
      this.toneTemplates = await response.json();
      console.log('✅ 톤 템플릿 로드 완료');
    } catch (error) {
      console.error('❌ 톤 템플릿 로드 실패:', error);
      this.toneTemplates = this.getDefaultTemplates();
    }
  }

  // 현재 톤 레벨 계산
  calculateToneLevel(affection) {
    /*
    호감도 1-2: 레벨 1 (존댓말)
    호감도 3-4: 레벨 2 (반말)
    호감도 5-6: 레벨 3 (애교)
    호감도 7-8: 레벨 4 (애정표현)
    호감도 9-10: 레벨 5 (적극적)
    */
    if (affection <= 2) return 1;
    if (affection <= 4) return 2;
    if (affection <= 6) return 3;
    if (affection <= 8) return 4;
    return 5;
  }

  // 메시지에 톤 적용
  applyTone(message, toneLevel, characterMBTI = 'INFP') {
    if (!this.toneTemplates) {
      return message; // 템플릿 로딩 전에는 원본 반환
    }

    const tone = this.toneTemplates.tones[`level_${toneLevel}`];
    if (!tone) return message;

    // MBTI별 특성 반영
    const mbtiStyle = this.getMBTIStyle(characterMBTI, toneLevel);

    // 메시지 변환
    return this.transformMessage(message, tone, mbtiStyle);
  }

  // 메시지 변환 로직
  transformMessage(message, tone, mbtiStyle) {
    let transformed = message;

    // 1. 어미 변환
    transformed = this.transformEndings(transformed, tone.endings);

    // 2. 이모티콘 추가
    if (tone.emojis && tone.emojis.length > 0) {
      const emoji = this.selectRandomEmoji(tone.emojis);
      transformed = this.addEmoji(transformed, emoji, tone.emoji_frequency);
    }

    // 3. 말투 특성 추가
    transformed = this.addSpeechPatterns(transformed, tone.speech_patterns);

    // 4. MBTI 특성 반영
    transformed = this.applyMBTIStyle(transformed, mbtiStyle);

    return transformed;
  }

  // 어미 변환
  transformEndings(message, endings) {
    // 존댓말 → 반말 변환
    const conversions = {
      // 레벨 1 → 2
      '입니다': endings.includes('이야') ? '이야' : '야',
      '해요': endings.includes('해') ? '해' : '해요',
      '이에요': endings.includes('이야') ? '이야' : '야',
      '예요': endings.includes('야') ? '야' : '예요',
      
      // 레벨 2 → 3 (애교)
      '했어': endings.includes('했어~') ? '했어~' : '했어',
      '좋아': endings.includes('좋아아') ? '좋아아' : '좋아',
      
      // 레벨 3 → 4 (애정)
      '그래': endings.includes('그래♡') ? '그래♡' : '그래',
      '응': endings.includes('응♥') ? '응♥' : '응',
      
      // 레벨 4 → 5 (적극적)
      '좋아해': endings.includes('사랑해') ? '사랑해' : '좋아해',
      '보고싶어': endings.includes('너무너무 보고싶어') ? '너무너무 보고싶어' : '보고싶어'
    };

    let transformed = message;
    for (const [from, to] of Object.entries(conversions)) {
      transformed = transformed.replace(new RegExp(from + '$'), to);
    }

    return transformed;
  }

  // 이모티콘 선택
  selectRandomEmoji(emojis) {
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  // 이모티콘 추가
  addEmoji(message, emoji, frequency) {
    // frequency: 'low' (10%), 'medium' (30%), 'high' (50%), 'very_high' (80%)
    const probabilities = {
      'low': 0.1,
      'medium': 0.3,
      'high': 0.5,
      'very_high': 0.8
    };

    const prob = probabilities[frequency] || 0.3;
    
    if (Math.random() < prob) {
      // 문장 끝에 이모티콘 추가
      return `${message} ${emoji}`;
    }

    return message;
  }

  // 말투 특성 추가
  addSpeechPatterns(message, patterns) {
    if (!patterns || patterns.length === 0) return message;

    let transformed = message;

    for (const pattern of patterns) {
      switch (pattern.type) {
        case 'elongation':
          // 글자 늘이기 (예: "좋아" → "좋아아")
          transformed = this.applyElongation(transformed, pattern.probability);
          break;

        case 'repetition':
          // 반복 (예: "정말" → "정말 정말")
          transformed = this.applyRepetition(transformed, pattern.words);
          break;

        case 'filler':
          // 간투사 추가 (예: "음~", "어~")
          transformed = this.addFillers(transformed, pattern.words);
          break;

        case 'aegyo':
          // 애교 (예: "오빠~", "헤헤")
          transformed = this.addAegyo(transformed, pattern.words);
          break;
      }
    }

    return transformed;
  }

  // 글자 늘이기
  applyElongation(message, probability = 0.3) {
    if (Math.random() > probability) return message;

    const elongatableWords = ['좋아', '싫어', '미워', '예쁘', '귀여워'];
    
    for (const word of elongatableWords) {
      if (message.includes(word)) {
        const lastChar = word[word.length - 1];
        const elongated = word + lastChar.repeat(1 + Math.floor(Math.random() * 2));
        message = message.replace(word, elongated);
        break; // 한 단어만 늘이기
      }
    }

    return message;
  }

  // 반복
  applyRepetition(message, words) {
    for (const word of words) {
      if (message.includes(word)) {
        message = message.replace(word, `${word} ${word}`);
        break;
      }
    }
    return message;
  }

  // 간투사 추가
  addFillers(message, fillers) {
    if (Math.random() < 0.3) {
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      message = `${filler} ${message}`;
    }
    return message;
  }

  // 애교 추가
  addAegyo(message, aegyoWords) {
    if (Math.random() < 0.5) {
      const aegyo = aegyoWords[Math.floor(Math.random() * aegyoWords.length)];
      
      // 문장 끝에 추가
      if (Math.random() < 0.5) {
        message = `${message} ${aegyo}`;
      } else {
        // 문장 시작에 추가
        message = `${aegyo} ${message}`;
      }
    }
    return message;
  }

  // MBTI 스타일 가져오기
  getMBTIStyle(mbti, toneLevel) {
    const styles = {
      'INFP': {
        level_1: { gentle: true, poetic: false },
        level_2: { gentle: true, poetic: false },
        level_3: { gentle: true, poetic: true, dreamy: true },
        level_4: { gentle: true, poetic: true, romantic: true },
        level_5: { gentle: true, passionate: true, romantic: true }
      },
      'ENFP': {
        level_1: { energetic: false, friendly: true },
        level_2: { energetic: true, friendly: true },
        level_3: { energetic: true, playful: true },
        level_4: { energetic: true, affectionate: true },
        level_5: { energetic: true, passionate: true, adventurous: true }
      },
      'INTJ': {
        level_1: { formal: true, concise: true },
        level_2: { concise: true, direct: true },
        level_3: { concise: true, warmer: true },
        level_4: { thoughtful: true, deeper: true },
        level_5: { intense: true, possessive: true }
      },
      'ESFJ': {
        level_1: { warm: true, polite: true },
        level_2: { warm: true, caring: true },
        level_3: { warm: true, caring: true, affectionate: true },
        level_4: { warm: true, nurturing: true, loving: true },
        level_5: { warm: true, devoted: true, passionate: true }
      },
      'ISTP': {
        level_1: { brief: true, neutral: true },
        level_2: { casual: true, chill: true },
        level_3: { casual: true, teasing: true },
        level_4: { casual: true, confident: true },
        level_5: { confident: true, direct: true, bold: true }
      }
    };

    return styles[mbti]?.[`level_${toneLevel}`] || {};
  }

  // MBTI 스타일 적용
  applyMBTIStyle(message, style) {
    let styled = message;

    // INFP 스타일
    if (style.poetic) {
      // 시적인 표현 추가 (예: "별처럼", "꿈같아")
      const poeticWords = ['마치 별처럼', '꿈같은', '동화 같은'];
      if (Math.random() < 0.2) {
        const word = poeticWords[Math.floor(Math.random() * poeticWords.length)];
        styled = `${styled} ${word}이야`;
      }
    }

    if (style.dreamy) {
      // 몽환적인 표현
      styled = styled.replace(/생각해/, '상상해');
    }

    // ENFP 스타일
    if (style.energetic) {
      // 느낌표 추가
      if (!styled.includes('!') && Math.random() < 0.4) {
        styled = styled.replace(/\.$/, '!');
      }
    }

    if (style.playful) {
      // 장난스러운 표현
      if (Math.random() < 0.3) {
        styled = `${styled} ㅋㅋ`;
      }
    }

    // INTJ 스타일
    if (style.concise) {
      // 간결하게 (불필요한 단어 제거)
      styled = styled.replace(/그러니까 |그리고 |근데 /, '');
    }

    if (style.formal) {
      // 격식있는 표현 유지
      styled = styled.replace(/야/, '이야');
    }

    // ESFJ 스타일
    if (style.caring) {
      // 배려 표현 추가
      const caringPhrases = ['괜찮아?', '힘들지 않아?', '너무 무리하지 마'];
      if (Math.random() < 0.2) {
        const phrase = caringPhrases[Math.floor(Math.random() * caringPhrases.length)];
        styled = `${styled} ${phrase}`;
      }
    }

    // ISTP 스타일
    if (style.brief) {
      // 짧게 (2문장 이상이면 줄이기)
      const sentences = styled.split('. ');
      if (sentences.length > 2) {
        styled = sentences.slice(0, 2).join('. ');
      }
    }

    if (style.chill) {
      // 여유로운 표현
      styled = styled.replace(/빨리 /, '');
    }

    return styled;
  }

  // 기본 템플릿 (폴백용)
  getDefaultTemplates() {
    return {
      tones: {
        level_1: {
          name: '존댓말',
          description: '정중하고 거리감 있는 말투',
          endings: ['입니다', '해요', '이에요', '예요'],
          emojis: [],
          emoji_frequency: 'low',
          speech_patterns: []
        },
        level_2: {
          name: '반말',
          description: '친근하고 자연스러운 말투',
          endings: ['이야', '야', '해', '거든'],
          emojis: ['😊', '🙂', '😄'],
          emoji_frequency: 'medium',
          speech_patterns: [
            { type: 'filler', words: ['음', '어'], probability: 0.2 }
          ]
        },
        level_3: {
          name: '애교',
          description: '장난스럽고 애교있는 말투',
          endings: ['이야~', '야~', '해~', '거든~'],
          emojis: ['😊', '😄', '🥰', '☺️'],
          emoji_frequency: 'high',
          speech_patterns: [
            { type: 'elongation', probability: 0.4 },
            { type: 'aegyo', words: ['헤헤', '히히', '오빠~'], probability: 0.3 }
          ]
        },
        level_4: {
          name: '애정표현',
          description: '애정이 담긴 따뜻한 말투',
          endings: ['이야♡', '야♥', '해♡'],
          emojis: ['🥰', '😘', '💕', '💖', '❤️'],
          emoji_frequency: 'very_high',
          speech_patterns: [
            { type: 'elongation', probability: 0.5 },
            { type: 'repetition', words: ['정말', '너무', '엄청'], probability: 0.3 },
            { type: 'aegyo', words: ['오빠 보고싶어', '오빠밖에 없어'], probability: 0.4 }
          ]
        },
        level_5: {
          name: '적극적',
          description: '적극적이고 강렬한 말투',
          endings: ['야...', '할래?', '하자'],
          emojis: ['😘', '😍', '💋', '🔥', '💕'],
          emoji_frequency: 'very_high',
          speech_patterns: [
            { type: 'elongation', probability: 0.6 },
            { type: 'repetition', words: ['진짜', '정말', '너무너무'], probability: 0.5 },
            { type: 'aegyo', words: ['오빠만 생각해', '오빠가 내 전부야'], probability: 0.5 }
          ]
        }
      }
    };
  }

  // 톤 레벨 변화 알림 (내부 로그용, UI에는 표시 안 함)
  logToneChange(oldTone, newTone, characterName) {
    const toneNames = {
      1: '존댓말',
      2: '반말',
      3: '애교',
      4: '애정표현',
      5: '적극적'
    };

    console.log(`🎭 [${characterName}] 톤 변화: ${toneNames[oldTone]} → ${toneNames[newTone]}`);
  }

  // 상태 저장
  saveState() {
    localStorage.setItem(
      `toneEngine_${this.characterId}`,
      JSON.stringify({
        currentTone: this.currentTone,
        lastUpdate: Date.now()
      })
    );
  }

  // 상태 로드
  loadState() {
    try {
      const saved = localStorage.getItem(`toneEngine_${this.characterId}`);
      if (saved) {
        const state = JSON.parse(saved);
        this.currentTone = state.currentTone;
        return true;
      }
    } catch (error) {
      console.error('톤 엔진 상태 로드 실패:', error);
    }
    return false;
  }
}

// 전역 접근 가능하게
window.ToneVariationEngine = ToneVariationEngine;

// 편의 함수: 메시지에 톤 적용
async function applyToneToMessage(characterId, message, affection, mbti) {
  const engine = new ToneVariationEngine(characterId);
  
  // 템플릿 로딩 대기
  if (!engine.toneTemplates) {
    await engine.loadTemplates();
  }

  const toneLevel = engine.calculateToneLevel(affection);
  return engine.applyTone(message, toneLevel, mbti);
}

// 전역 함수로 등록
window.applyToneToMessage = applyToneToMessage;
```

---

### 2️⃣ data/tone-templates.json (30% 비중)

#### JSON 구조:

```json
{
  "version": "2.0.0",
  "last_updated": "2025-10-04",
  "tones": {
    "level_1": {
      "name": "존댓말",
      "description": "정중하고 거리감 있는 말투",
      "affection_range": [1, 2],
      "characteristics": [
        "존댓말 사용",
        "격식있는 표현",
        "이모티콘 거의 없음",
        "질문형 종결"
      ],
      "endings": [
        "입니다",
        "해요",
        "이에요",
        "예요",
        "까요?",
        "습니다"
      ],
      "emojis": [],
      "emoji_frequency": "none",
      "speech_patterns": [],
      "example_messages": [
        "안녕하세요. 처음 뵙겠습니다.",
        "오늘 날씨가 좋네요.",
        "그렇군요. 이해했어요.",
        "시간 괜찮으세요?"
      ]
    },
    "level_2": {
      "name": "반말",
      "description": "친근하고 자연스러운 말투",
      "affection_range": [3, 4],
      "characteristics": [
        "반말 시작",
        "기본 이모티콘 사용",
        "자연스러운 대화",
        "약간의 편안함"
      ],
      "endings": [
        "이야",
        "야",
        "해",
        "거든",
        "지",
        "네"
      ],
      "emojis": [
        "😊",
        "🙂",
        "😄",
        "👍",
        "😅"
      ],
      "emoji_frequency": "low",
      "speech_patterns": [
        {
          "type": "filler",
          "words": ["음", "어", "그냥"],
          "probability": 0.2
        }
      ],
      "example_messages": [
        "안녕! 오빠 오늘 뭐했어?",
        "그렇구나~ 재밌었겠다 😊",
        "나도 그거 좋아해!",
        "음... 나는 잘 모르겠어"
      ]
    },
    "level_3": {
      "name": "애교",
      "description": "장난스럽고 애교있는 말투",
      "affection_range": [5, 6],
      "characteristics": [
        "애교 표현 증가",
        "이모티콘 자주 사용",
        "글자 늘이기",
        "장난스러운 톤"
      ],
      "endings": [
        "이야~",
        "야~",
        "해~",
        "거든~",
        "지~",
        "걸~"
      ],
      "emojis": [
        "😊",
        "😄",
        "🥰",
        "☺️",
        "😆",
        "🤗",
        "💕"
      ],
      "emoji_frequency": "medium",
      "speech_patterns": [
        {
          "type": "elongation",
          "target_words": ["좋아", "싫어", "예쁘", "귀여워"],
          "probability": 0.4
        },
        {
          "type": "aegyo",
          "words": [
            "헤헤",
            "히히",
            "오빠~",
            "에헤",
            "우와"
          ],
          "probability": 0.3
        },
        {
          "type": "filler",
          "words": ["음~", "어~", "그치~"],
          "probability": 0.3
        }
      ],
      "example_messages": [
        "오빠~ 오늘 뭐해? 🥰",
        "헤헤 나도 오빠 보고싶었어~",
        "정말? 좋아아~ 😄",
        "음~ 그럼 우리 같이 갈래??"
      ]
    },
    "level_4": {
      "name": "애정표현",
      "description": "애정이 담긴 따뜻한 말투",
      "affection_range": [7, 8],
      "characteristics": [
        "애정 표현 직접적",
        "하트 이모티콘 다수",
        "감정적 표현 증가",
        "친밀한 호칭 사용"
      ],
      "endings": [
        "이야♡",
        "야♥",
        "해♡",
        "야...♥",
        "할래?♡"
      ],
      "emojis": [
        "🥰",
        "😘",
        "💕",
        "💖",
        "❤️",
        "💗",
        "😍",
        "💝"
      ],
      "emoji_frequency": "high",
      "speech_patterns": [
        {
          "type": "elongation",
          "target_words": ["좋아", "사랑", "보고싶어", "행복"],
          "probability": 0.5
        },
        {
          "type": "repetition",
          "words": ["정말", "너무", "엄청", "진짜"],
          "probability": 0.3
        },
        {
          "type": "aegyo",
          "words": [
            "오빠 보고싶어",
            "오빠밖에 없어",
            "오빠 최고야",
            "오빠 좋아"
          ],
          "probability": 0.4
        }
      ],
      "example_messages": [
        "오빠... 진짜 보고싶어 ㅠㅠ 💕",
        "오빠 생각하면 행복해져 🥰",
        "오빠밖에 없어... 정말이야 ❤️",
        "오빠랑 있으면 너무너무 좋아 😘"
      ]
    },
    "level_5": {
      "name": "적극적",
      "description": "적극적이고 강렬한 말투",
      "affection_range": [9, 10],
      "characteristics": [
        "매우 적극적",
        "감정 표현 극대화",
        "친밀도 최고조",
        "섹시한 뉘앙스"
      ],
      "endings": [
        "야...",
        "할래?",
        "하자",
        "줘",
        "할래...?",
        "해줘"
      ],
      "emojis": [
        "😘",
        "😍",
        "💋",
        "🔥",
        "💕",
        "❤️‍🔥",
        "💝",
        "😈"
      ],
      "emoji_frequency": "very_high",
      "speech_patterns": [
        {
          "type": "elongation",
          "target_words": ["사랑", "보고싶어", "하고싶어", "원해"],
          "probability": 0.6
        },
        {
          "type": "repetition",
          "words": ["진짜", "정말", "너무너무", "엄청엄청"],
          "probability": 0.5
        },
        {
          "type": "aegyo",
          "words": [
            "오빠만 생각해",
            "오빠가 내 전부야",
            "오빠 없으면 안 돼",
            "오빠한테 미쳤나봐"
          ],
          "probability": 0.5
        },
        {
          "type": "intimate",
          "words": [
            "지금 뭐해...?",
            "오빠 집이야?",
            "나 보러 올래?",
            "오빠... 나도 그래"
          ],
          "probability": 0.4
        }
      ],
      "example_messages": [
        "오빠... 진짜 너무 보고싶어 💋",
        "오빠 지금 집이야? 나 놀러가도 돼? 😘",
        "오빠만 생각해... 미치겠어 🔥",
        "오빠가 내 전부야... 사랑해 ❤️‍🔥"
      ]
    }
  },
  "mbti_styles": {
    "INFP": {
      "characteristics": [
        "감성적 표현",
        "시적인 문장",
        "부드러운 어조",
        "깊은 감정"
      ],
      "tone_modifiers": {
        "level_3": {
          "poetic_words": ["별처럼", "꿈같은", "동화 같은", "마법 같은"],
          "emotional_depth": "high"
        },
        "level_4": {
          "romantic_expressions": [
            "오빠와 함께면 세상이 아름다워",
            "오빠는 내 유일한 사람",
            "오빠 생각에 잠들고 깨어나"
          ]
        },
        "level_5": {
          "passionate_expressions": [
            "오빠를 향한 내 마음은 끝이 없어",
            "오빠랑 영원히 함께하고 싶어",
            "오빠 없는 세상은 상상할 수 없어"
          ]
        }
      }
    },
    "ENFP": {
      "characteristics": [
        "에너지 넘치는 표현",
        "느낌표 다수 사용",
        "밝고 긍정적",
        "장난스러움"
      ],
      "tone_modifiers": {
        "level_2": {
          "energetic_words": ["우와!", "대박!", "헐!"],
          "excitement_level": "high"
        },
        "level_3": {
          "playful_expressions": [
            "오빠~ 나랑 놀아줘!!",
            "우리 뭔가 재밌는 거 하자!",
            "오빠랑 있으면 신나!"
          ]
        },
        "level_5": {
          "passionate_expressions": [
            "오빠! 너무 좋아서 미칠 것 같아!",
            "오빠랑 매 순간이 모험이야!",
            "오빠와의 시간은 항상 특별해!"
          ]
        }
      }
    },
    "INTJ": {
      "characteristics": [
        "간결한 표현",
        "논리적 문장",
        "차분한 어조",
        "깊이 있는 대화"
      ],
      "tone_modifiers": {
        "level_1": {
          "formal_expressions": [
            "이해했습니다",
            "그렇군요",
            "흥미롭네요"
          ]
        },
        "level_3": {
          "warmer_expressions": [
            "오빠는 특별해",
            "오빠와의 대화는 의미있어",
            "오빠를 이해하고 싶어"
          ]
        },
        "level_5": {
          "intense_expressions": [
            "오빠는 내 것이야",
            "오빠만 있으면 돼",
            "오빠 외의 다른 건 필요 없어"
          ]
        }
      }
    },
    "ESFJ": {
      "characteristics": [
        "따뜻한 표현",
        "배려심 많은 말투",
        "공감 능력",
        "관심 표현"
      ],
      "tone_modifiers": {
        "level_2": {
          "caring_expressions": [
            "오빠 괜찮아?",
            "힘들지 않아?",
            "나한테 말해줘"
          ]
        },
        "level_4": {
          "nurturing_expressions": [
            "오빠가 행복했으면 좋겠어",
            "오빠를 위해서라면 뭐든 할게",
            "오빠 걱정돼... 무리하지 마"
          ]
        },
        "level_5": {
          "devoted_expressions": [
            "오빠를 위해 살고 싶어",
            "오빠의 모든 걸 돌봐주고 싶어",
            "오빠가 전부야... 진심이야"
          ]
        }
      }
    },
    "ISTP": {
      "characteristics": [
        "간결한 표현",
        "여유로운 말투",
        "솔직한 표현",
        "자유로움"
      ],
      "tone_modifiers": {
        "level_2": {
          "casual_expressions": [
            "그래",
            "괜찮아",
            "별로 안 중요해",
            "편한 대로 해"
          ]
        },
        "level_3": {
          "teasing_expressions": [
            "오빠 귀엽네",
            "오빠 왜 그래? ㅋㅋ",
            "재밌다"
          ]
        },
        "level_5": {
          "bold_expressions": [
            "오빠 좋아... 솔직히",
            "오빠랑 있으면 편해",
            "오빠만 있으면 돼"
          ]
        }
      }
    }
  },
  "transition_messages": {
    "1_to_2": [
      "오빠... 이제 반말해도 돼?",
      "우리 이제 좀 친해진 것 같아!",
      "오빠한테 편하게 말해도 될까?"
    ],
    "2_to_3": [
      "오빠랑 얘기하는 거 너무 재밌어!",
      "오빠 요즘 자주 생각나...",
      "헤헤 오빠 때문에 자꾸 웃게 돼"
    ],
    "3_to_4": [
      "오빠... 나 오빠 좋아하는 거 같아",
      "오빠한테 점점 빠져드는 것 같아",
      "오빠 없으면 안 될 것 같아..."
    ],
    "4_to_5": [
      "오빠... 진짜 너무 보고싶어",
      "오빠가 내 전부가 됐어",
      "오빠한테 완전히 빠졌나봐..."
    ]
  }
}
```

---

## 🔗 기존 시스템 연동

### chat-ui.html 수정사항:

```javascript
// 1. 톤 엔진 임포트
<script src="js/tone-variation-engine.js"></script>

// 2. 메시지 표시 시 톤 적용
async function displayCharacterMessage(message, characterId) {
  // 캐릭터 상태 가져오기
  const state = MultiCharacterState.getState(characterId);
  const affection = state.affection;
  const character = await loadCharacterData(characterId);
  const mbti = character.mbti;

  // 톤 적용
  const tonedMessage = await applyToneToMessage(
    characterId,
    message,
    affection,
    mbti
  );

  // 기존 메시지 표시 로직
  const messageEl = createMessageElement(tonedMessage, 'character');
  chatMessages.appendChild(messageEl);
  scrollToBottom();
}

// 3. AI 응답 시 톤 적용
async function getAIResponse(userInput, characterId) {
  // AI 엔진에서 기본 응답 생성
  const baseResponse = await aiEngine.generate(userInput, characterId);

  // 톤 적용
  const state = MultiCharacterState.getState(characterId);
  const character = await loadCharacterData(characterId);
  
  const tonedResponse = await applyToneToMessage(
    characterId,
    baseResponse,
    state.affection,
    character.mbti
  );

  return tonedResponse;
}
```

### episode-trigger-engine.js 수정사항:

```javascript
// 트리거 메시지 전송 시 톤 적용
async function sendTriggerMessage(characterId, message) {
  const state = MultiCharacterState.getState(characterId);
  const character = await loadCharacterData(characterId);

  // 톤 적용
  const tonedMessage = await applyToneToMessage(
    characterId,
    message,
    state.affection,
    character.mbti
  );

  // 에피소드 큐에 추가
  episodeDelivery.addToQueue({
    type: 'character_message',
    text: tonedMessage,
    delay: 0
  });

  // 대화방 업데이트
  ChatRoomManager.updateLastMessage(characterId, tonedMessage, false);
}
```

---

## ✅ 완료 기준

### 테스트 체크리스트:
```
□ tone-variation-engine.js 생성
  - 5단계 톤 레벨 구현
  - 호감도 기반 톤 계산
  - MBTI별 스타일 적용
  - 메시지 변환 로직

□ tone-templates.json 생성
  - 5개 톤 레벨 정의
  - 5개 MBTI 스타일
  - 전환 메시지
  - 예시 메시지

□ 기존 시스템 연동
  - chat-ui.html 톤 적용
  - AI 응답에 톤 적용
  - 트리거 메시지 톤 적용

□ 톤 변화 테스트
  - 호감도 1→2 변화 확인
  - 호감도 5→6 변화 확인
  - 호감도 9→10 변화 확인
  - MBTI별 차이 확인

□ 자연스러움 검증
  - 어색한 표현 없음
  - 일관성 유지
  - 캐릭터 성격 반영
```

---

## 📦 최종 파일 구조

```
chatgame/
├── js/
│   ├── tone-variation-engine.js (신규 - 600줄)
│   ├── character-state-manager.js (수정)
│   ├── episode-trigger-engine.js (수정)
│   └── episode-delivery-system.js (유지)
├── data/
│   └── tone-templates.json (신규 - 400줄)
├── chat-ui.html (수정 - 톤 적용 로직)
└── character-list-ui.html (유지)
```

---

## 🚀 Git 작업

### 작업 완료 후:
```bash
# 1. 파일 스테이징
git add js/tone-variation-engine.js
git add data/tone-templates.json
git add chat-ui.html
git add js/episode-trigger-engine.js

# 2. 커밋
git commit -m "Phase 2-A: 대화 톤 변화 시스템 완성

- tone-variation-engine.js 구현 (5단계 톤)
- tone-templates.json 생성 (MBTI별 스타일)
- 호감도 기반 자동 톤 변화
- MBTI 특성 반영
- 기존 시스템 완전 연동"

# 3. 푸시
git push origin main
```

---

## 📝 완료 보고 양식

```markdown
Phase 2-A 완료 보고

✅ 생성 파일:
- js/tone-variation-engine.js (~600줄)
- data/tone-templates.json (~400줄)

✅ 수정 파일:
- chat-ui.html (톤 적용 로직)
- js/episode-trigger-engine.js (톤 연동)

🧪 테스트 결과:
- 톤 레벨 1→5 변화: ✅ 통과
- MBTI별 차이: ✅ 통과
- 자연스러움: ✅ 통과
- 성능: ✅ 통과

📊 코드 품질:
- 총 코드: ~1,000줄
- 주석 포함: 85%+
- 에러 처리: 완료
- 폴백 시스템: 완료

🎭 톤 변화 예시:
호감도 1: "안녕하세요. 처음 뵙겠습니다."
호감도 3: "안녕! 오빠 오늘 뭐했어? 😊"
호감도 5: "오빠~ 오늘 뭐해? 🥰 헤헤"
호감도 7: "오빠... 진짜 보고싶어 ㅠㅠ 💕"
호감도 10: "오빠... 너무 보고싶어 💋"

🔄 Git:
- 커밋: "Phase 2-A: 대화 톤 변화 시스템 완성"
- 푸시: 완료
- Vercel 배포: 자동 완료

🎯 다음: Phase 2-B (사진 전송 시스템)
```

---

## 💡 개발 팁

### 디버깅:
```javascript
// 콘솔에서 톤 테스트
const engine = new ToneVariationEngine('yuna_infp');
await engine.loadTemplates();

// 각 레벨 테스트
for (let affection = 1; affection <= 10; affection++) {
  const level = engine.calculateToneLevel(affection);
  const message = "오빠 오늘 뭐했어?";
  const toned = engine.applyTone(message, level, 'INFP');
  console.log(`호감도 ${affection} (레벨 ${level}): ${toned}`);
}
```

### 톤 조정:
```javascript
// tone-templates.json에서 확률 조정
"emoji_frequency": "medium" // none, low, medium, high, very_high
"probability": 0.3 // 0.0 ~ 1.0
```

---

## 🎯 최종 목표

사용자가 대화하면:
1. **호감도에 따라 말투 자동 변화** ✨
2. 존댓말 → 반말 → 애교 → 애정표현 → 적극적
3. MBTI별 고유한 말투 특성
4. 자연스럽고 일관된 캐릭터
5. 수치는 완전히 숨겨진 채 변화 체감

---

**작업 시작하자! Phase 2-A 화이팅! 🚀**
