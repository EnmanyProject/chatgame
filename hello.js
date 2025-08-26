module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    message: 'Hello from root level API!',
    timestamp: new Date().toISOString() 
  });
}