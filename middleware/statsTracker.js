const statistics = require('../Helpers/Statistics');

// Middleware to track stats for incoming API requests
const recordRequest = (req, res, next) => {
	statistics.incrementRequestCount(req.orbConfig);
	next();
};

module.exports = {
	recordRequest
};