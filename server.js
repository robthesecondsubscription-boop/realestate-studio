const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

// API routes
app.use('/api/generate', require('./api/generate'));
app.use('/api/status/:id', (req, res) => {
  req.query.id = req.params.id;
  require('./api/status/[id]')(req, res);
});

// Serve React build
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
