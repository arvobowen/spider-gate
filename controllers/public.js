/**
 * Summary: This file contains the controller functions for handling public-facing
 * requests, such as serving the landing page and providing statistics data.
 */

const path = require('path');
const fs = require('fs');
const statsTracker = require('../Helpers/Statistics');

// This will hold the reference to the currently loaded orbs
let loadedOrbs = [];

// Function to initialize the controller with the currently loaded orbs
const initializeController = (orbs) => {
	// Store the reference to the currently loaded orbs for later use in this controller
	loadedOrbs = orbs;
};

// Endpoint that provides statistics data
const getStats = (req, res) => {
	res.json(statsTracker.getStats(req.orbConfig));
};

// Endpoint that serves the index.html landing page with loaded orb info
const getLandingPage = (req, res) => {
	const onlineOrbs = loadedOrbs.filter(orb => orb.status === 'Online').map(orb => orb.name);
	const orbList = onlineOrbs.length > 0 ? onlineOrbs.join(', ') : '[none]';
	req.log.info(`Serving the landing page. Loaded orbs: ${orbList}`);

	// Read the index.html file
	const indexPath = path.join(__dirname, '..', 'public', 'index.html');
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
						(orb) => {
							const displayName = orb.name.split('/').pop();
							return `
			  <tr>
				<td class="p-2 text-center">
				  <span class="w-3 h-3 ${orb.status === 'Online' ? 'bg-green-400' : 'bg-red-400'} rounded-full mr-3 animate-pulse inline-block"></span>
				</td>
				<td class="p-2 text-center">
				  <span class="${orb.status === 'Online' ? 'text-green-300' : 'text-red-300'}">${orb.status === 'Online' ? 'Online' : 'Offline'}</span>
				</td>
				<td class="p-2 text-center">${displayName}</td>
				<td class="p-2 text-center">
				${orb.path === null
									? 'N/A'
									: `<a href="${orb.path}" class="text-blue-500 hover:text-blue-300 underline">${orb.path}</a>`
								}
				</td>
			  </tr>
			  `
						}
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
};

// Endpoint that serves the invalid redirect page for requests not consumed by SpiderGate or any of its orbs
const getInvalidRedirectPage = (req, res) => {
	// Serve the invalid redirect page with a 404 status code
	res.status(404).send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<!-- Automatically redirect to the root after 2 seconds -->
			<meta http-equiv="refresh" content="2;url=/" />
			<title>Page Not Found</title>
			<style>
				body { 
					background-color: #0d1117; 
					color: white; 
					font-family: 'Inter', sans-serif; 
					display: flex; 
					justify-content: center; 
					align-items: center; 
					height: 100vh; 
					margin: 0; 
				}
			</style>
		</head>
		<body>
			<h2>Invalid Page: Redirecting...</h2>
		</body>
		</html>
	`);
}

// Export the public controller endpoints
module.exports = {
	initializeController,
	getStats,
	getLandingPage,
	getInvalidRedirectPage
};