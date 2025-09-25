// Import necessary modules
const log = require('./logging.js');

// Set this to true to activate logging, or false to deactivate it.
const TurnOnDebug = false;

// Feedback to the console that the debug module is active.
if (TurnOnDebug)
    log.debug(`{DEBUG} Debugging enabled.`);

// Logs incoming requests if debugging is enabled.
const requestLogger = (req, res, next) => {
    // Only log the request if debugging is turned on
    if (TurnOnDebug) {
        log.debug(`{DEBUG} Received request: ${req.method} ${req.originalUrl}`);
    }

    // Pass control to the next middleware in line
    next();
};

// Export the function to be used in other files
module.exports = requestLogger;

// Export the debug settings
module.exports.DebugOn = TurnOnDebug;