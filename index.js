const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for raw body, needed by orbs
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve the static landing page
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Dynamic Orb Loading ---
const orbsConfigPath = path.join(__dirname, 'orbs.json');
if (fs.existsSync(orbsConfigPath)) {
  const registeredOrbs = JSON.parse(fs.readFileSync(orbsConfigPath));

  registeredOrbs.forEach(orbName => {
    try {
      const orb = require(orbName);
      if (orb && orb.path && orb.router) {
        app.use(orb.path, orb.router);
        console.log(`Successfully loaded orb '${orbName}' at path: ${orb.path}`);
      }
    } catch (error) {
      console.error(`Failed to load orb '${orbName}': ${error.message}`);
    }
  });
}

// Start the server
app.listen(port, () => {
  console.log(`SpiderGate server is running on http://localhost:${port}`);
});