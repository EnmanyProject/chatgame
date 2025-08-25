const express = require('express');
const router = express.Router();

// 관리자 인증 미들웨어
const adminAuth = (req, res, next) => {
  const password = req.headers['admin-password'] || req.body.adminPassword;
  
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  next();
};

// AI 설정 전역 변수 (실제 서비스에서는 데이터베이스 사용 권장)
let aiSettings = {
  model: process.env.AI_MODEL || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.8,
  max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 150,
  system_prompt: `너는 윤아라는 20세 대학생 후배야. 창용 오빠를 1년 넘게 좋아해온 상태야.

성격 특징:
- 밝고 적극적이면서도 순수함
- 이모티콘을 자주 사용해 (ㅋㅋㅋ, ㅜㅜ, ㅎㅎ 등)
- 솔직하고 감정 표현이 풍부함
- 창용 오빠에 대한 호감을 숨기지 않음

대화 스타일:
- 반말을 사용하되 친근하고 애교스럽게
- 한국어 인터넷 문화에 익숙한 표현 사용
- 감정에 따라 다양한 이모티콘 활용
- 짧고 자연스러운 대화

현재 상황: 어제 술을 마신 후 기억이 가물가물한 창용 오빠와 대화 중

응답은 150자 이내로 간결하게 해줘.`
};

// 서버 통계
let serverStats = {
  totalRequests: 0,
  totalTokensUsed: 0,
  uniqueUsers: new Set(),
  startTime: new Date()
};

// GET /api/admin/settings - AI 설정 조회
router.get('/settings', adminAuth, (req, res) => {
  res.json({
    success: true,
    settings: aiSettings,
    stats: {
      totalRequests: serverStats.totalRequests,
      totalTokensUsed: serverStats.totalTokensUsed,
      uniqueUsers: serverStats.uniqueUsers.size,
      uptime: Date.now() - serverStats.startTime.getTime()
    }
  });
});

// POST /api/admin/settings - AI 설정 변경
router.post('/settings', adminAuth, (req, res) => {
  try {
    const { model, temperature, max_tokens, system_prompt } = req.body;

    if (model) {
      if (!['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'].includes(model)) {
        return res.status(400).json({ error: 'Invalid model selection' });
      }
      aiSettings.model = model;
    }

    if (temperature !== undefined) {
      if (temperature < 0 || temperature > 2) {
        return res.status(400).json({ error: 'Temperature must be between 0 and 2' });
      }
      aiSettings.temperature = parseFloat(temperature);
    }

    if (max_tokens !== undefined) {
      if (max_tokens < 10 || max_tokens > 1000) {
        return res.status(400).json({ error: 'Max tokens must be between 10 and 1000' });
      }
      aiSettings.max_tokens = parseInt(max_tokens);
    }

    if (system_prompt) {
      if (system_prompt.length > 2000) {
        return res.status(400).json({ error: 'System prompt too long (max 2000 characters)' });
      }
      aiSettings.system_prompt = system_prompt;
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: aiSettings
    });

  } catch (error) {
    console.error('Admin Settings Error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/admin/stats - 상세 통계 조회
router.get('/stats', adminAuth, (req, res) => {
  const uptime = Date.now() - serverStats.startTime.getTime();
  const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
  const avgRequestsPerHour = uptimeHours > 0 ? Math.round(serverStats.totalRequests / uptimeHours) : 0;

  res.json({
    success: true,
    stats: {
      totalRequests: serverStats.totalRequests,
      totalTokensUsed: serverStats.totalTokensUsed,
      uniqueUsers: serverStats.uniqueUsers.size,
      startTime: serverStats.startTime,
      uptime: uptime,
      uptimeFormatted: `${Math.floor(uptimeHours / 24)}일 ${uptimeHours % 24}시간`,
      avgRequestsPerHour: avgRequestsPerHour,
      currentSettings: aiSettings
    }
  });
});

// POST /api/admin/reset-stats - 통계 초기화
router.post('/reset-stats', adminAuth, (req, res) => {
  serverStats.totalRequests = 0;
  serverStats.totalTokensUsed = 0;
  serverStats.uniqueUsers.clear();
  serverStats.startTime = new Date();

  res.json({
    success: true,
    message: 'Statistics reset successfully'
  });
});

// 통계 업데이트 함수 (api.js에서 사용)
router.updateStats = (tokens, userId) => {
  serverStats.totalRequests++;
  serverStats.totalTokensUsed += tokens;
  if (userId) {
    serverStats.uniqueUsers.add(userId);
  }
};

module.exports = router;