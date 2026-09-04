/**
 * Summary: Provides an error handling middleware for the SpiderGate server.
 * It specifically handles malformed JSON syntax errors and responds with a 400 Bad Request.
 * Example:
 * const errorHandler = require('./middleware/errorHandler');
 * app.use(errorHandler);
 */

const log = require('./log');

// Middleware function to handle errors, specifically malformed JSON syntax errors
const reqInjection = (err, req, res, next) => {
    // Check if the error is a malformed JSON syntax error
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        if (req.debug && req.debug.enabled) {
            log.error(`Malformed JSON: ${err.message}`);
            log.debug(`Raw body: ${req.rawBody ? req.rawBody.toString() : 'No raw body available'}`);
        }

        // Respond with a 400 Bad Request error and a JSON message
        return res.status(400).send({
            success: false,
            message: 'Invalid JSON payload received.'
        });
    }

    // Pass control to the next middleware in line
    next();
};

// Export the error handling middleware function to be used in other files
module.exports = reqInjection;