const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const log = require('../middleware/log');

// Define every variable the orb absolutely needs to function securely
const REQUIRED_KEYS = [
    'PORT',
    'NODE_ENV',
    'TRACKING_STATS_PATH'
];

const validateAndLoadEnv = (dir) => {
    const envPath = path.join(dir, '.env');

    // Log the directory being used for the .env file
    log.info(`Validating and loading .env from directory: ${dir}`);

    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log.info(`Directory did not exist. Created directory at: ${dir}`);
    }

    // If the file doesn't exist at all, create it with empty defaults
    if (!fs.existsSync(envPath)) {
        log.info(`.env file did not exist. Creating a new one at: ${envPath}`);
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

    // Return the parsed configuration for potential further use
    // This would be only THIS app's runtime environment
    return parsedConfig;
};

module.exports = {
    validateAndLoadEnv
};