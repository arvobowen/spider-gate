const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const orbsConfigPath = join(__dirname, 'orbs.json');
const nodemonConfigPath = join(__dirname, 'nodemon.json');

try {
    // Read the array of registered orbs
    const registeredOrbs = JSON.parse(readFileSync(orbsConfigPath, 'utf8'));

    // Initialize the base nodemon configuration
    const nodemonConfig = {
        "//": "Created by automated script generate-nodemon-watches.js to automate orb monitoring.",
        // Always watch the main SpiderGate directory
        watch: ['.'],
        // Ignore specific files and directories that don't need monitoring
        ignore: [
            "stats.json",
            "*.sqlite",
            "downloads/*",
            "cache/*",
            "node_modules/*"
        ],
        // Extensions to monitor
        ext: "js,mjs,cjs,json"
    };

    // Dynamically append the relative path for each orb
    registeredOrbs.forEach(orbName => {
        nodemonConfig.watch.push(`../${orbName}`);
    });

    // Write the compiled configuration to nodemon.json
    writeFileSync(nodemonConfigPath, JSON.stringify(nodemonConfig, null, 2), 'utf8');

    console.log(`[SpiderGate] Generated nodemon.json with ${registeredOrbs.length} orb watch paths.`);
} catch (error) {
    console.error('[SpiderGate] Failed to generate nodemon.json:', error.message);
    process.exit(1);
}