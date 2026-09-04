const os = require('os');
const path = require('path');
const fs = require('fs');

const createOrFindFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    return folderPath;
};

const getDataDir = (appName) => {
    const persistentFolderName = 'sg-docketsafe-updates';
    let dataDir;

    // Get dataDir based on the operating system
    if (os.platform() === 'win32') {
        // Windows: Uses the %ALLUSERSPROFILE% environment variable (Defaults to C:\ProgramData)
        // Example: C:\ProgramData\SpiderGate\sg-docketsafe-updates
        const programData = process.env.ALLUSERSPROFILE || 'C:\\ProgramData';
        dataDir = path.join(programData, appName, persistentFolderName);
    } else {
        // Linux/Ubuntu: Standard directory for persistent application data
        // Example: /var/lib/spidergate/sg-docketsafe-updates
        dataDir = path.join('/var/lib', appName.toLowerCase(), persistentFolderName.toLowerCase());
    }

    // Ensure the data directory exists and create it if it doesn't
    createOrFindFolder(dataDir);

    // Return the absolute path to the data directory
    return dataDir;
}

module.exports = {
    getDataDir
};