// Node.js built-in module includes
const path = require('path');
const fs = require('fs');

// Third party module includes
const express = require('express');
const cors = require('cors');

// Utility modules
const log = require('./middleware/log');
const debug = require('./middleware/debug');
const identity = require('./middleware/identity');
const errorHandler = require('./middleware/errorHandler');
const jsonParser = require('./middleware/json');


log.header("SpiderGate server starting up...");


// Determine the data directory for persistent storage
const { getDataDir } = require('./Helpers/OS');
const dataDir = getDataDir('SpiderGate');

// Run strict environment validation FIRST. If it fails, an error is thrown and SpiderGate catches it immediately.
const { validateAndLoadEnv } = require('./Helpers/EnvManager');
validateAndLoadEnv(dataDir);


// Create an Express application
const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(log);
app.use(debug);
app.use(errorHandler);
app.use(jsonParser);


// Controllers
const publicController = require('./controllers/public');


// Services
const orbLoader = require('./services/orbLoader');


// Initialize the array to hold loaded orbs and the path to the orbs configuration file
const loadedOrbs = [];
let orbsConfigPath;


// Determine the path to the orbs configuration file based on the environment
// development: ./orbs.json
// production: ../../orbs.json
if (process.env.NODE_ENV === 'development') {
  orbsConfigPath = path.join(__dirname, 'orbs.json');
} else {
  orbsConfigPath = path.join(__dirname, '..', '..', 'orbs.json');
}



// --- STATIC FILES ---
// Serve anything in the public folder that hasn't been explicitly handled already
app.use(express.static(path.join(__dirname, 'public')));



// --- GLOBAL UMBRELLA (middleware used for all requests) ---
// Inject clean IP and origin strings into EVERY request
app.use(identity.requestOrigin);



// --- ROUTES: PUBLIC ---
// Initialize the public controller with the currently loaded orbs so the controller has a REFERENCE to the array
publicController.initializeController(loadedOrbs);
// GET / : Serve the index.html landing page explicitly passing the loadedOrbs array into the public controller
app.get('/', publicController.getLandingPage);



// --- ASYNC IIFE (Immediately Invoked Function Expression) ORB LOADER ---
// Run the async loader (for dynamic orb loading)
(async () => {
  await orbLoader.load(app, loadedOrbs, orbsConfigPath);

  // Catch all bad API endpoint requests.  If a request makes it this far, no orb claimed it.
  app.use('/', publicController.getInvalidRedirectPage);

  // Start the server and store the server instance
  const server = app.listen(port, () => {
    log.info(`* SpiderGate server is running on http://localhost:${port}`);
    console.log("");
  });

  // A function to handle the shutdown
  const shutdown = () => {
    log.error(`Encountered errors while loading orbs, halting service startup.`);
    server.close(() => {
      log.info(`Server gracefully shut down.`);
      process.exit(1);
    });
  };
})();