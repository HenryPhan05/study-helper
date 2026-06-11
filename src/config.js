const path = require('node:path');

function getConfig() {
  return {
    port: Number(process.env.PORT || 3001),
    nodeEnv: process.env.NODE_ENV || 'development',
    dataFilePath: process.env.DATA_FILE_PATH || path.join('data', 'notes.json'),
    storageProvider: process.env.STORAGE_PROVIDER || 'local-json',
    azureTables: {
      tableUrl: process.env.AZURE_TABLES_TABLE_URL || '',
      partitionKey: process.env.AZURE_TABLES_PARTITION_KEY || 'notes'
    },
    aiProvider: process.env.AI_PROVIDER || 'mock',
    azureOpenAI: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || ''
    }
  };
}

module.exports = { getConfig };
