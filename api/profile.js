// 프로필 관리 API
const DEFAULT_PROFILE = {
  name: "윤아",
  avatar: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=윤아",
  status: "방금 전",
  online: true
};

module.exports = (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // 프로필 정보 반환
    return res.status(200).json({
      success: true,
      profile: DEFAULT_PROFILE,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    // 프로필 업데이트 (향후 확장 가능)
    const { name, avatar, status } = req.body || {};
    
    const updatedProfile = {
      ...DEFAULT_PROFILE,
      ...(name && { name }),
      ...(avatar && { avatar }),
      ...(status && { status })
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
      metadata: {
        timestamp: new Date().toISOString(),
        updated_fields: Object.keys(req.body || {})
      }
    });
  }

  return res.status(405).json({
    error: 'Method not allowed',
    message: 'Only GET, POST, PUT methods are supported'
  });
};