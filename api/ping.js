// 가장 간단한 API 테스트 엔드포인트
export default function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 간단한 응답
  return res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    method: req.method,
    success: true
  });
}