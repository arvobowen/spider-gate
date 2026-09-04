/**
 * Summary: Provides a simple debugging utility for the SpiderGate server orbs (modules).
 * It can be used to control debugging output with a consistent format across all applications.
 * Provides a .enabled property to toggle debugging on and off.
 * Example:
 * const debug = require('./middleware/debug');
 * app.use(debug);
 * req.debug.enabled = process.env.DEBUG_ENABLED;
 * // CONSOLE MESSAGE: {DEBUG} Debugging enabled.
 */

const log = require('./log');

// Internal flag to track whether debugging is enabled
let _enabled = false;

// Middleware function to inject the debugging utility into the request object
const reqInjection = (req, res, next) => {
    // Inject the debugging utility into the request object if it doesn't already exist
    if (!req.debug) {
        req.debug = reqInjection;
    }

    // Log the incoming request if debugging is enabled
    if (req.debug.enabled) {
        log.debug(`{DEBUG} Received request: ${req.method} ${req.originalUrl}`);
    }

    // Pass control to the next middleware in line
    next();
};

// Define the .enabled property on the middleware function itself for direct access
Object.defineProperty(reqInjection, 'enabled', {
    get() {
        return _enabled;
    },
    set(value) {
        if (_enabled !== value) {
            _enabled = value;
            log.debug(`{DEBUG} Debugging ${value ? 'enabled' : 'disabled'}.`);
        }
    }
});

// Initialize the .enabled property with the current internal flag value
reqInjection.enabled = _enabled;

// Export the middleware function to be used in other files
module.exports = reqInjection;