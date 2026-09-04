/**
 * Summary: Provides a JSON parsing middleware for the SpiderGate server.
 * It captures the raw body of incoming JSON requests for further processing.
 * Example:
 * const jsonParser = require('./middleware/json');
 * app.use(jsonParser);
 */

const express = require('express');

// Middleware function to parse JSON requests and capture the raw body
const reqInjection = express.json({
    // Capture the raw body of the incoming request for further processing
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
});

// Export the JSON parsing middleware function to be used in other files
module.exports = reqInjection;