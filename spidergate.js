#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const orbsConfigPath = path.join(process.cwd(), 'orbs.json');

const addOrb = (orbName) => {
  console.log(`Attempting to install orb: ${orbName}...`);
  try {
    // 1. Install the orb from the public npm registry
    execSync(`npm install ${orbName}`, { stdio: 'inherit' });
    console.log(`Successfully installed ${orbName}.`);

    // 2. Add the orb to our config file
    const orbs = JSON.parse(fs.readFileSync(orbsConfigPath));
    if (!orbs.includes(orbName)) {
      orbs.push(orbName);
      fs.writeFileSync(orbsConfigPath, JSON.stringify(orbs, null, 2));
      console.log(`Successfully added '${orbName}' to orbs.json.`);
    } else {
      console.log(`'${orbName}' is already registered.`);
    }
  } catch (error) {
    console.error(`Failed to add orb '${orbName}':`, error.message);
  }
};

// --- Main Execution ---
const command = process.argv[2];
const orbName = process.argv[3];

if (command === 'add' && orbName) {
  addOrb(orbName);
} else {
  console.log('Usage: spidergate add <orb-package-name>');
}