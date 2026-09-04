const fs = require('fs');
const path = require('path');
const log = require('../middleware/log');

async function load(app, loadedOrbs, orbsConfigPath) {
    log.info(`* Orbs config path: ${orbsConfigPath}`);
    log.info("* Loading Orbs...");

    let orbsLoadedCount = 0;
    let orbErrorCount = 0;

    if (fs.existsSync(orbsConfigPath)) {
        const registeredOrbs = JSON.parse(fs.readFileSync(orbsConfigPath));

        let lastOrbName = null;
        for (const orbName of registeredOrbs) {
            lastOrbName = orbName;

            try {
                log.message(`  > Searching for orb '${orbName}'...`);
                require.resolve(orbName);
                log.message("    - Found orb module, staging it...");
                const orb = require(orbName);
                log.message("    - Orb module staged, loading it...");

                if (orb && orb.path && orb.router) {
                    app.use(orb.path, orb.router);

                    // Check if the loaded orb has an init function
                    log.message("    - Searching for init() function in orb...");
                    if (typeof orb.init === 'function') {
                        log.message("    - Found an init() function, executing...");
                        log.message("--------------------------------------------------------------------");

                        // Pass the log object into the init function using a context object then await the promise from the init function
                        const response = await orb.init({ log: log });

                        log.message("--------------------------------------------------------------------");

                        log.message(`    - [${orbName}] ${response}`);
                        log.message("    - Init() function executed successfully.");
                    } else {
                        log.message("    - No init() function found in orb.");
                    }

                    orbsLoadedCount++;
                    log.success(`    - Successfully loaded '${orbName}' at path: '${orb.path}'.`);

                    // Add the orb to the loadedOrbs array for reference later
                    loadedOrbs.push({ name: orbName, path: orb.path, status: 'Online' });
                }
            } catch (error) {
                if (error.code === 'MODULE_NOT_FOUND') {
                    // Check if the error message specifically mentions the orb's name
                    if (error.message.includes(`Cannot find module '${lastOrbName}'`)) {
                        // The orb itself is missing

                        log.error(`'${lastOrbName}' orb not found : run 'npm run link ${lastOrbName}' to try and establish a local link.`);
                    } else {
                        // The orb was found, but a dependency inside it is missing

                        // Extract the missing module name from the error message
                        let missingModule = '';
                        const match = error.message.match(/Cannot find module '([^']+)'/);
                        if (match && match[1]) {
                            missingModule = match[1];
                        }

                        // Check if the missing module is listed in the orb's package.json dependencies or devDependencies
                        let isInPackage = false;
                        if (missingModule) {
                            try {
                                const orbIndexPath = require.resolve(lastOrbName);
                                const orbPkgPath = require('path').join(require('path').dirname(orbIndexPath), 'package.json');
                                const orbPkg = JSON.parse(require('fs').readFileSync(orbPkgPath, 'utf8'));

                                if ((orbPkg.dependencies && orbPkg.dependencies[missingModule]) ||
                                    (orbPkg.devDependencies && orbPkg.devDependencies[missingModule])) {
                                    isInPackage = true;
                                }
                            } catch (pkgError) { }
                        }

                        // Extract the lines into an array once
                        const errorLines = error.message.split('\n');

                        // Provide a tip message based on whether the missing module is in the orb's package.json or not
                        const tipMsg = isInPackage
                            ? `Navigate to the '${lastOrbName}' directory and run 'npm install' to ensure all packages are downloaded.`
                            : `Navigate to the '${lastOrbName}' directory and run 'npm install ${missingModule}' to ensure the package is downloaded.`;

                        log.error(`'${lastOrbName}' failed to load due to a missing dependency.`);
                        log.error(`  > ${errorLines[0]}`);
                        log.error(`  > Tip: ${tipMsg}`);
                        log.error('');

                        // Check if there is a require stack, slice from index 1 to the end, and join with newlines
                        if (errorLines.length > 1) {
                            log.error(`${errorLines.slice(1).join('\n')}`);
                        }
                    }
                } else {
                    // Handle any other type of error (like syntax errors in the orb or your custom missing API key error)
                    log.error(`'${lastOrbName}' encountered an error during initialization:`);
                    log.error(`  > ${error.message || error}`);
                }

                // Add the orb to the loadedOrbs array for reference later
                loadedOrbs.push({ name: lastOrbName, path: null, status: 'Offline' });

                // Keep track of the count of failed orbs
                orbErrorCount++;
            }
        }
    }

    // Check for errors and log the number of loaded orbs
    if (orbErrorCount > 0 && orbsLoadedCount < 1) {
        log.error(`  [ Orbs loaded: 0, failed: ${orbErrorCount} ]`);
    } else if (orbErrorCount > 0 && orbsLoadedCount > 0) {
        log.warning(`  [ Orbs loaded: ${orbsLoadedCount}, failed: ${orbErrorCount} ]`);
    } else {
        log.success(`  [ Orbs loaded: ${orbsLoadedCount}, failed: 0 ]`);
    }
}

// Export the load function so it can be used by other modules
module.exports = {
    load
}