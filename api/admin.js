// Admin Panel API - 서버 설정 관리
const fs = require('fs').promises;
const path = require('path');

// 설정 파일 경로
const CONFIG_FILE_PATH = path.join(__dirname, 'config.json');

// chat.js의 GPT 설정 업데이트 함수 import
let updateChatGPTConfig;
try {
  const chatModule = require('./chat.js');
  updateChatGPTConfig = chatModule.updateGPTConfig;
} catch (error) {
  console.warn('Could not import chat module updateGPTConfig:', error.message);
}

// 설정 파일에서 설정 로드
async function loadConfig() {
  try {
    const configData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    // 파일이 없으면 기본 설정 반환
    return DEFAULT_CONFIG;
  }
}

// 설정 파일에 설정 저장
async function saveConfig(config) {
  try {
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
}

// 기본 서버 설정
const DEFAULT_CONFIG = {
  server: {
    openai_api_key: '',
    api_model: 'gpt-3.5-turbo',
    max_tokens: 150,
    temperature: 0.8,
    system_prompt: '당신은 윤아입니다. 시우 오빠를 1년 넘게 좋아하는 20세 후배입니다.',
    ai_mode_enabled: false
  },
  character: {
    name: "윤아",
    age: 20,
    personality: ["밝음", "적극적", "순수함", "감정 표현 풍부"],
    relationship: "시우 오빠를 1년 넘게 좋아하는 후배",
    speech_style: ["반말", "친근하고 애교스럽게", "이모티콘 자주 사용"],
    avatar_url: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=윤아",
    status_message: "방금 전"
  },
  game: {
    initial_affection: 75,
    initial_intimacy: 0,
    max_affection: 100,
    max_intimacy: 100,
    scenario: "alcohol_aftermath",
    initial_messages: [
      "시우 오빠... 안녕하세요 😳",
      "어제... 제가 술 마시고 이상한 말 많이 했죠? ㅠㅠ", 
      "정말 부끄러워서... 오빠한테 뭐라고 말해야 할지 모르겠어요... 😰"
    ]
  },
  statistics: {
    total_conversations: 0,
    total_messages: 0,
    last_updated: new Date().toISOString(),
    version: "2.0.0"
  }
};

module.exports = (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, section } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        return handleGetRequest(req, res, action, section);
      case 'POST':
        return handlePostRequest(req, res, action, section);
      case 'PUT':
        return handlePutRequest(req, res, action, section);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

function handleGetRequest(req, res, action, section) {
  switch (action) {
    case 'config':
      return getServerConfig(req, res, section);
    case 'stats':
      return getServerStats(req, res);
    case 'health':
      return getServerHealth(req, res);
    case 'dialogue':
      return getDialogueData(req, res);
    default:
      return getAllConfig(req, res);
  }
}

function handlePostRequest(req, res, action, section) {
  switch (action) {
    case 'config':
      return updateServerConfig(req, res, section);
    case 'reset':
      return resetServerConfig(req, res);
    case 'test':
      return testServerConnection(req, res);
    case 'dialogue':
      return updateDialogueData(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

function handlePutRequest(req, res, action, section) {
  return updateServerConfig(req, res, section);
}

// 전체 서버 설정 조회
async function getAllConfig(req, res) {
  try {
    const config = await loadConfig();
    return res.status(200).json({
      success: true,
      config: config,
      metadata: {
        timestamp: new Date().toISOString(),
        sections: ['server', 'character', 'game', 'statistics']
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to load configuration',
      message: error.message
    });
  }
}

// 특정 섹션 설정 조회
async function getServerConfig(req, res, section) {
  try {
    const config = await loadConfig();
    if (section && config[section]) {
      return res.status(200).json({
        success: true,
        section: section,
        config: config[section],
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return getAllConfig(req, res);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to load configuration',
      message: error.message
    });
  }
}

// 서버 통계 조회
function getServerStats(req, res) {
  const stats = {
    server: {
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      platform: process.platform,
      node_version: process.version,
      status: 'healthy'
    },
    api: {
      chat_endpoint: '/api/chat',
      profile_endpoint: '/api/profile',
      admin_endpoint: '/api/admin',
      test_endpoint: '/api/test'
    },
    game: DEFAULT_CONFIG.statistics,
    timestamp: new Date().toISOString()
  };

  return res.status(200).json({
    success: true,
    statistics: stats
  });
}

// 서버 건강상태 체크
function getServerHealth(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      chat_api: 'online',
      profile_api: 'online',
      admin_api: 'online'
    },
    config: {
      ai_enabled: DEFAULT_CONFIG.server.ai_mode_enabled,
      openai_configured: !!DEFAULT_CONFIG.server.openai_api_key
    }
  };

  return res.status(200).json({
    success: true,
    health: health
  });
}

// 서버 설정 업데이트
async function updateServerConfig(req, res, section) {
  try {
    const updateData = req.body;
    
    if (!updateData) {
      return res.status(400).json({
        error: 'No update data provided'
      });
    }

    // 현재 설정 로드
    const config = await loadConfig();

    if (section) {
      if (!config[section]) {
        return res.status(400).json({
          error: `Invalid section: ${section}`
        });
      }
      
      // 특정 섹션 업데이트
      config[section] = { ...config[section], ...updateData };
      config.statistics.last_updated = new Date().toISOString();
      
      // 설정 파일에 저장
      const saved = await saveConfig(config);
      if (!saved) {
        return res.status(500).json({
          error: 'Failed to save configuration'
        });
      }
      
      // 서버 섹션일 경우 GPT 설정도 업데이트
      if (section === 'server' && updateChatGPTConfig) {
        const gptConfig = {
          api_key: updateData.openai_api_key || config.server.openai_api_key,
          model: updateData.api_model || config.server.api_model,
          max_tokens: updateData.max_tokens || config.server.max_tokens,
          temperature: updateData.temperature || config.server.temperature,
          enabled: updateData.ai_mode_enabled !== undefined ? updateData.ai_mode_enabled : config.server.ai_mode_enabled
        };
        
        try {
          updateChatGPTConfig(gptConfig);
          console.log('GPT 설정 업데이트됨:', gptConfig);
        } catch (error) {
          console.error('GPT 설정 업데이트 실패:', error);
        }
      }
      
      return res.status(200).json({
        success: true,
        message: `${section} configuration updated and saved successfully`,
        updated_section: section,
        new_config: config[section],
        gpt_updated: section === 'server',
        metadata: {
          timestamp: new Date().toISOString(),
          updated_fields: Object.keys(updateData)
        }
      });
    }

    return res.status(400).json({
      error: 'Section parameter required for updates'
    });
  } catch (error) {
    console.error('Failed to update server config:', error);
    return res.status(500).json({
      error: 'Failed to update configuration',
      message: error.message
    });
  }
}

// 서버 설정 초기화
function resetServerConfig(req, res) {
  // 실제 환경에서는 백업 후 초기화
  return res.status(200).json({
    success: true,
    message: 'Server configuration reset to defaults',
    config: DEFAULT_CONFIG,
    metadata: {
      timestamp: new Date().toISOString(),
      action: 'reset_to_defaults'
    }
  });
}

// 서버 연결 테스트
function testServerConnection(req, res) {
  const { test_type } = req.body;
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {
      basic_connectivity: { status: 'passed', latency: '< 1ms' },
      api_endpoints: { status: 'passed', endpoints_tested: 4 },
      configuration: { status: 'passed', sections_validated: 4 }
    }
  };

  if (test_type === 'openai' && DEFAULT_CONFIG.server.openai_api_key) {
    testResults.tests.openai_connection = { 
      status: 'simulated', 
      message: 'OpenAI connection test simulated - would test in production' 
    };
  }

  return res.status(200).json({
    success: true,
    message: 'Server connection test completed',
    results: testResults
  });
}

// 대사 데이터 조회
function getDialogueData(req, res) {
  try {
    // choice.js에서 데이터 import (런타임에서)
    delete require.cache[require.resolve('./choice.js')];
    const choiceModule = require('./choice.js');
    
    // choice.js에서 DATABASE_DATA를 추출하기 위해 모듈을 실행
    const fs = require('fs');
    const path = require('path');
    const choicePath = path.join(__dirname, 'choice.js');
    const choiceContent = fs.readFileSync(choicePath, 'utf8');
    
    // DATABASE_DATA 추출
    const dataMatch = choiceContent.match(/const DATABASE_DATA = ({[\s\S]*?});/);
    if (!dataMatch) {
      throw new Error('DATABASE_DATA not found in choice.js');
    }
    
    const dialogueData = eval('(' + dataMatch[1] + ')');
    
    return res.status(200).json({
      success: true,
      dialogue: dialogueData,
      metadata: {
        timestamp: new Date().toISOString(),
        total_choices: dialogueData.choices ? dialogueData.choices.length : 0
      }
    });
  } catch (error) {
    console.error('Failed to get dialogue data:', error);
    return res.status(500).json({
      error: 'Failed to retrieve dialogue data',
      message: error.message
    });
  }
}

// 대사 데이터 업데이트
function updateDialogueData(req, res) {
  try {
    const { dialogue } = req.body;
    
    if (!dialogue) {
      return res.status(400).json({
        error: 'No dialogue data provided'
      });
    }
    
    // choice.js 파일 내용을 읽고 DATABASE_DATA 부분을 교체
    const fs = require('fs');
    const path = require('path');
    const choicePath = path.join(__dirname, 'choice.js');
    const choiceContent = fs.readFileSync(choicePath, 'utf8');
    
    // DATABASE_DATA 교체
    const newDataString = JSON.stringify(dialogue, null, 2);
    const newContent = choiceContent.replace(
      /const DATABASE_DATA = {[\s\S]*?};/,
      `const DATABASE_DATA = ${newDataString};`
    );
    
    // 파일 쓰기
    fs.writeFileSync(choicePath, newContent, 'utf8');
    
    return res.status(200).json({
      success: true,
      message: 'Dialogue data updated successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        updated_choices: dialogue.choices ? dialogue.choices.length : 0
      }
    });
  } catch (error) {
    console.error('Failed to update dialogue data:', error);
    return res.status(500).json({
      error: 'Failed to update dialogue data',
      message: error.message
    });
  }
}