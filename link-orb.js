// C:\Sandbox\spider-gate\link-orb.js

const { execSync } = require('child_process');
const path = require('path');

// Get the orb name from the command-line arguments passed to this script.
// process.argv is an array: [ 'path/to/node', 'path/to/link-orb.js', 'orb-name' ]
const orbName = process.argv[2];

if (!orbName) {
  console.error('Error: Please provide an orb name to link.');
  console.error('Usage: npm run link <orb-name>');
  process.exit(1);
}

// Get the name of the current directory (e.g., 'spider-gate')
const currentDirName = path.basename(process.cwd());
const orbDir = path.join('..', orbName);

try {
  console.log(`--- Linking Orb: ${orbName} ---`);

  // Step 1: Go to the orb directory and run 'npm link'
  console.log(`\n[Step 1/2] Creating global link for '${orbName}'...`);
  // The 'cwd' option tells execSync to run the command in the specified directory.
  execSync('npm link', { cwd: orbDir, stdio: 'inherit' });

  // Step 2: Link the orb to the current project
  console.log(`\n[Step 2/2] Linking '${orbName}' to '${currentDirName}'...`);
  // We don't need to change directory back because process.cwd() hasn't changed.
  execSync(`npm link ${orbName}`, { stdio: 'inherit' });

  console.log(`\n✅ Successfully linked '${orbName}' to '${currentDirName}'.`);

} catch (error) {
  console.error(`\n❌ Failed to link orb. Make sure the directory '../${orbName}' exists.`);
  process.exit(1);
}
