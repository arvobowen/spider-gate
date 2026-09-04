const fs = require('fs');
const path = require('path');

let statsFilePath;
const initializeStats = (config) => {
  statsFilePath = path.join(config.TRACKING_STATS_PATH, 'ApiRequests.json');

  if (stats.allTimeRequests === null) {
    stats.allTimeRequests = readStatsFromFile().allTimeRequests;
  }
};

const readStatsFromFile = () => {
  try {
    if (fs.existsSync(statsFilePath)) {
      const data = fs.readFileSync(statsFilePath);
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading stats file:', error);
  }
  return { allTimeRequests: 0 };
};

const stats = {
  sessionRequests: 0,
  startTime: new Date(),
  allTimeRequests: null
};

const writeStatsToFile = () => {
  try {
    const dataToWrite = JSON.stringify({ allTimeRequests: stats.allTimeRequests });
    fs.writeFileSync(statsFilePath, dataToWrite);
  } catch (error) {
    console.error('Error writing to stats file:', error);
  }
};

function incrementRequestCount(config) {
  initializeStats(config);

  stats.sessionRequests++;
  stats.allTimeRequests++;
  writeStatsToFile();
}

function getStats(config) {
  initializeStats(config);

  return stats;
}

module.exports = {
  incrementRequestCount,
  getStats,
};