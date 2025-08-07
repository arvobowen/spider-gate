const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (like your index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// The root route sends the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`SpiderGate server is running on http://localhost:${port}`);
});