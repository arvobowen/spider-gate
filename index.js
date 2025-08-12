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
let orbsLoadedCount = 0;
let orbsLoadResults = [];
if (fs.existsSync(orbsConfigPath)) {
  const registeredOrbs = JSON.parse(fs.readFileSync(orbsConfigPath));

  registeredOrbs.forEach(orbName => {
    try {
      const orb = require(orbName);
      if (orb && orb.path && orb.router) {
        app.use(orb.path, orb.router);
        orbsLoadedCount++;
        orbsLoadResults.push(`[success] '${orbName}' at path: ${orb.path}`);
      }
    } catch (error) {
      orbsLoadResults.push(`[error] '${orbName}' : ${error.message}`);
    }
  });
}

// Start the server
app.listen(port, () => {
  console.log(`SpiderGate server is running on http://localhost:${port}`);
  console.log(`  Orbs config path: ${orbsConfigPath}`);
  console.log(`  Orbs loaded: ${orbsLoadedCount}`);
  orbsLoadResults.forEach(orbResults => console.log(`    - ${orbResults}`));
});