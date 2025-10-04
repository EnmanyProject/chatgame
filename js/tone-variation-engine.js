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
