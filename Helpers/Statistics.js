const fs = require('fs');
const path = require('path');

const statsFilePath = path.join(process.env.TRACKING_STATS_PATH, 'ApiRequests.json');

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
  allTimeRequests: readStatsFromFile().allTimeRequests,
};

const writeStatsToFile = () => {
  try {
    const dataToWrite = JSON.stringify({ allTimeRequests: stats.allTimeRequests });
    fs.writeFileSync(statsFilePath, dataToWrite);
  } catch (error) {
    console.error('Error writing to stats file:', error);
  }
};

function incrementRequestCount() {
  stats.sessionRequests++;
  stats.allTimeRequests++;
  writeStatsToFile();
}

function getStats() {
  return stats;
}

module.exports = {
  incrementRequestCount,
  getStats,
};