const http = require('node:http');
const { loadLocalEnv } = require('./loadEnv');
const { getConfig } = require('./config');
const { createRouter } = require('./routes');
const aiService = require('./services/aiService');
const { createNoteRepository } = require('./storage/createNoteRepository');

loadLocalEnv();

function createApp(config = getConfig()) {
  const noteRepository = createNoteRepository(config);
  const router = createRouter({
    config,
    noteRepository,
    aiService
  });

  return http.createServer(router);
}

if (require.main === module) {
  const config = getConfig();
  const server = createApp(config);

  server.listen(config.port, () => {
    console.log(`Study Helper API listening on http://localhost:${config.port}`);
    console.log(`AI provider: ${config.aiProvider}`);
    console.log(`Storage provider: ${config.storageProvider}`);
  });
}

module.exports = { createApp };
