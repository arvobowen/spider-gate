const requestOrigin = (req, res, next) => {
    const userAgent = req.get('User-Agent') || 'N/A';
    const referer = req.get('Referer') || 'N/A';

    // Grab the raw IP from the proxy header or the direct request
    const forwardedFor = req.get('X-Forwarded-For');
    let rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.ip || '127.0.0.1');

    // STRICT IPv4 ENFORCEMENT
    if (rawIp === '::1') rawIp = '127.0.0.1'; // Convert pure IPv6 localhost
    if (rawIp.includes('::ffff:')) rawIp = rawIp.replace('::ffff:', ''); // Strip IPv4-mapped IPv6 prefix

    // INJECTION 1: Attach the strictly formatted IPv4 address
    req.ipv4Address = rawIp;

    let originString = `Client IP: ${rawIp}`;

    if (userAgent.startsWith('GitHub-Hookshot/')) {
        originString += ' | Source: GitHub Webhook';
    } else if (referer && (referer.includes('/docs/') || referer.endsWith('/docs'))) {
        originString += ` | Source: Swagger UI (${referer})`;
    } else {
        originString += ` | Source: Web Browser (${referer})`;
    }

    // INJECTION 2: Attach your formatted string for easy logging
    req.requestOrigin = originString;

    // Pass control to the next middleware/controller
    next();
};

module.exports = {
    requestOrigin
};