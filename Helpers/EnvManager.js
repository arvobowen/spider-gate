const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Define every variable the orb absolutely needs to function securely
const REQUIRED_KEYS = [
    'PORT',
    'NODE_ENV'
];

const validateAndLoadEnv = (orbDir) => {
    const envPath = path.join(orbDir, '.env');

    // If the file doesn't exist at all, create it with empty defaults
    if (!fs.existsSync(envPath)) {
        const defaultEnv = REQUIRED_KEYS.map(key => `${key}=`).join('\n');
        fs.writeFileSync(envPath, defaultEnv, 'utf8');
        throw new Error(`No .env file found. A new one has been generated at ${envPath}. Please populate the required values.`);
    }

    // Read and parse using dotenv's battle-tested parser
    const envContent = fs.readFileSync(envPath, 'utf8');
    const parsedConfig = dotenv.parse(envContent);

    let needsWrite = false;
    let updatedContent = envContent;
    const missingOrEmpty = [];

    // Validate each required key
    REQUIRED_KEYS.forEach(key => {
        // If the key is completely absent from the file, append the template scaffold
        if (!(key in parsedConfig)) {
            updatedContent += `\n${key}=`;
            needsWrite = true;
            missingOrEmpty.push(key);
        } else if (!parsedConfig[key] || parsedConfig[key].trim() === '') {
            // Key exists in the file but has no value
            missingOrEmpty.push(key);
        }
    });

    // Self-heal the file by writing the missing keys back to disk
    if (needsWrite) {
        fs.writeFileSync(envPath, updatedContent.trim(), 'utf8');
    }

    // Fail fast if any required values are empty
    if (missingOrEmpty.length > 0) {
        throw new Error(`Unable to load orb. The following required .env variables are missing or empty: [${missingOrEmpty.join(', ')}]. Please update your .env file.`);
    }

    // If we reach here, the file is perfect. Load it into process.env!
    dotenv.config({ path: envPath });
};

module.exports = {
    validateAndLoadEnv
};