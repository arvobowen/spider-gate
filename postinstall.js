const fs = require('fs');
const path = require('path');

// Use process.cwd() to get the root of the project where npm install was run
const orbsConfigPath = path.join(process.cwd(), 'orbs.json');

if (!fs.existsSync(orbsConfigPath)) {
  console.log("No 'orbs.json' file found. Creating a default one...");
  fs.writeFileSync(orbsConfigPath, JSON.stringify([], null, 2));
  console.log("Successfully created 'orbs.json'.");
}
