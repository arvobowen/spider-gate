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

// Create an array of currently loaded orbs to check later on
const loadedOrbs = [];

// Serve the static landing page for the core service
app.get('/', (req, res) => {
  const onlineOrbs = loadedOrbs.filter(orb => orb.status === 'Online').map(orb => orb.name);
  const orbList = onlineOrbs.length > 0 ? onlineOrbs.join(', ') : '[none]';
  log.info(`Serving the landing page. Loaded orbs: ${orbList}`);

  // Read the index.html file
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Inject the loadedOrbs into the HTML
    const modifiedHtml = html.replace(
      '<p class="text-center"><span>[ No orbs active ]</span></p>',
      loadedOrbs.length > 0
        ? `
      <div class="rounded-xl overflow-hidden border border-blue-300">
        <table class="w-full bg-blue-950/50">
          <thead>
            <tr class="text-left">
              <th class="p-2 text-center"></th>
              <th class="p-2 text-center">Status</th>
              <th class="p-2 text-center">Orb</th>
              <th class="p-2 text-center">URL</th>
            </tr>
          </thead>
          <tbody>
            ${loadedOrbs
              .map(
                (orb) => `
              <tr>
                <td class="p-2 text-center">
                  <span class="w-3 h-3 ${orb.status === 'Online' ? 'bg-green-400' : 'bg-red-400'} rounded-full mr-3 animate-pulse inline-block"></span>
                </td>
                <td class="p-2 text-center">
                  <span class="${orb.status === 'Online' ? 'text-green-300' : 'text-red-300'}">${orb.status === 'Online' ? 'Online' : 'Offline'}</span>
                </td>
                <td class="p-2 text-center">${orb.name}</td>
                <td class="p-2 text-center">
                ${orb.path === null
                  ? 'N/A'
                  : `<a href="${orb.path}" class="text-blue-500 hover:text-blue-300 underline">${orb.path}</a>`
                }
                </td>
              </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      `
        : '<div class="flex flex-wrap gap-2"><span>[ No orbs active ]</span></div>'
    );

    res.send(modifiedHtml);
  });
});

// Serve anything in the public folder that hasn't been explicitly handled already
app.use(express.static(path.join(__dirname, 'public')));

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
  let orbError = false;

  // Load the orbs
  if (fs.existsSync(orbsConfigPath)) {
    const registeredOrbs = JSON.parse(fs.readFileSync(orbsConfigPath));

    // Use a for...of loop to handle async operations sequentially
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
            // Await the promise from the init function
            const response = await orb.init();
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
          log.error(`'${lastOrbName}' orb not found : run 'npm run link ${lastOrbName}' to try and establish a local link.`);
        } else {
          log.error(error);
        }

        // Add the orb to the loadedOrbs array for reference later
        loadedOrbs.push({ name: lastOrbName, path: null, status: 'Offline' });

        // If any orb fails to load, we set the count to -1 to indicate an error state
        orbError = true;
      }
    }
  }
  if (orbError && orbsLoadedCount < 1) {
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
    log.info(`* SpiderGate server is running on http://localhost:${port}`);
    console.log("");
  });

})(); // End of async IIFE