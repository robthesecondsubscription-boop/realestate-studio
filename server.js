const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/generate', require('./api/generate'));
app.use('/api/status/:id', (req, res) => {
  req.query.id = req.params.id;
  require('./api/status/[id]')(req, res);
});

app.use(express.static(path.join(__dirname, 'build')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
