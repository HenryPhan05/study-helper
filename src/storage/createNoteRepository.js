const { AzureTableNoteRepository } = require('./azureTableNoteRepository');
const { LocalJsonNoteRepository } = require('./noteRepository');

function createNoteRepository(config) {
  if (config.storageProvider === 'azure-table') {
    return new AzureTableNoteRepository(config.azureTables);
  }

  return new LocalJsonNoteRepository(config.dataFilePath);
}

module.exports = { createNoteRepository };
