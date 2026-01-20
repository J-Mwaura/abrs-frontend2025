const express = require('express');
const path = require('path');
const app = express();

const APP_FOLDER = 'www';

app.use(express.static(path.join(__dirname, APP_FOLDER)));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, APP_FOLDER, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});
