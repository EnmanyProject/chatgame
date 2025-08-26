module.exports = function handler(req, res) {
  return res.status(200).json({ 
    message: 'Test successful!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}