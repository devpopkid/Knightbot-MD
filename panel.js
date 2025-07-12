const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('panel'));

app.get('/messages', (req, res) => {
  const data = fs.existsSync('./panel/messages.json')
    ? fs.readFileSync('./panel/messages.json')
    : '[]';
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Panel running: http://localhost:${PORT}`);
});
