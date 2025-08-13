// index.js

// Import necessary modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const debug = require('./debug.js');
const log = require('./logging.js');

// SpiderGate Core Service - Main Entry Point
log.header("SpiderGate server starting up...");

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---

// Enable CORS for all routes
app.use(cors());

// Enable the debugger
app.use(debug);

// Parse JSON bodies and also store the raw body in req.rawBody for later use if needed
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Error handling middleware for malformed JSON
app.use((err, req, res, next) => {
  // Check if the error is a malformed JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    if (debug.DebugOn) {
      log.error(`Malformed JSON: ${err.message}`);
      log.debug(`Raw body: ${req.rawBody ? req.rawBody.toString() : 'No raw body available'}`);
    }
    
    // Respond with a 400 Bad Request error and a JSON message
    return res.status(400).send({
      success: false,
      message: 'Invalid JSON payload received.'
    });
  }

  // Pass any other errors to the default Express error handler
  next();
});

// Serve static files local to this core service
app.use(express.static(path.join(__dirname, 'public')));

// Serve the static landing page for the core service
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Dynamic Orb Loading ---
let orbsConfigPath;

// Check if we are in the 'development' environment
if (process.env.NODE_ENV === 'development') {
  orbsConfigPath = path.join(__dirname, 'orbs.json');
} else {
  orbsConfigPath = path.join(__dirname, '..', '..', 'orbs.json');
}

// Use an async IIFE (Immediately Invoked Function Expression) to allow looping through all
// the orbs and awaiting their initialization if they have an init function.
(async () => {
  log.info(`* Orbs config path: ${orbsConfigPath}`);
  log.info("* Loading Orbs...");

  let orbsLoadedCount = 0;

  // Load the orbs
  if (fs.existsSync(orbsConfigPath)) {
    const registeredOrbs = JSON.parse(fs.readFileSync(orbsConfigPath));

    // Use a for...of loop to handle async operations sequentially
    for (const orbName of registeredOrbs) {
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
            // Await the promise from the init function
            const response = await orb.init();
            log.message(`    - [${orbName}] ${response}`);
            log.message("    - Init() function executed successfully.");
          } else {
            log.message("    - No init() function found in orb.");
          }
          
          orbsLoadedCount++;
          log.success(`    - Successfully loaded '${orbName}' at path: '${orb.path}'.`);
        }
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          log.error(`'${orbName}' orb not found : run 'npm run link ${orbName}' to try and establish a local link.`);
        } else {
          log.error(error);
        }

        // If any orb fails to load, we set the count to -1 to indicate an error state
        orbsLoadedCount = -1;
      }
    }
  }
  if (orbsLoadedCount === -1) {
    log.error(`  [ Orbs loaded: 0 ]`);
  } else {
    log.success(`  [ Orbs loaded: ${orbsLoadedCount} ]`);
  }

  // A function to handle the shutdown
  const shutdown = () => {
    log.error(`Encountered errors while loading orbs, halting service startup.`);
    server.close(() => {
      log.info(`Server gracefully shut down.`);
      process.exit(1);
    });
  };

  // Start the server and store the server instance
  const server = app.listen(port, () => {
    if (orbsLoadedCount === -1) {
      shutdown();
    } else {
      log.info(`* SpiderGate server is running on http://localhost:${port}`);
      console.log("");
    }
  });

})(); // End of async IIFE