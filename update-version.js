const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, 'package.json');
const pkg = require(pkgPath);

const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const diff = now - start;
const oneDay = 1000 * 60 * 60 * 24;

// Calculate 3-digit zero-padded day of year (001-366)
const doy = String(Math.floor(diff / oneDay)).padStart(3, '0');
// 2-digit year
const year = String(now.getFullYear()).slice(-2);

// Extract the current major, minor, and patch versions from package.json
const currentMajor = pkg.version.split('.')[0] || 0;
const currentMinor = pkg.version.split('.')[1] || 0;
let currentPatch = pkg.version.split('.')[2] || 0;

// Create the new minor version based on the year and day of year
const newMinor = year + doy;

// Increment the patch version
if (currentMinor < newMinor) {
    currentPatch = 0;
} else {
    currentPatch++;
}

// Set the new package version
pkg.version = `${currentMajor}.${newMinor}.${currentPatch}`;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Version auto-updated to: ${pkg.version}`);
