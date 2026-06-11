class AzureTableNoteRepository {
  constructor({ tableUrl, partitionKey = 'notes' }) {
    if (!tableUrl) {
      throw new Error('AZURE_TABLES_TABLE_URL is required when STORAGE_PROVIDER=azure-table.');
    }

    this.tableUrl = tableUrl;
    this.partitionKey = partitionKey;
  }

  async list() {
    const url = new URL(this.tableUrl);
    url.searchParams.set('$filter', `PartitionKey eq '${escapeODataString(this.partitionKey)}'`);

    const payload = await requestJson(url, {
      method: 'GET'
    });

    return (payload.value || [])
      .map(entityToNote)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async findById(id) {
    const url = buildEntityUrl(this.tableUrl, this.partitionKey, id);

    try {
      const payload = await requestJson(url, {
        method: 'GET'
      });

      return entityToNote(payload);
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }

  async create(note) {
    await requestJson(new URL(this.tableUrl), {
      method: 'POST',
      headers: {
        Prefer: 'return-no-content'
      },
      body: JSON.stringify(noteToEntity(note, this.partitionKey)),
      expectedStatuses: [201, 204]
    });

    return note;
  }
}

async function requestJson(url, { method, headers = {}, body, expectedStatuses = [200] }) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json',
      'x-ms-version': '2020-10-02',
      ...headers
    },
    body
  });

  if (!expectedStatuses.includes(response.status)) {
    const details = await response.text();
    const error = new Error(
      `Azure Table Storage request failed with status ${response.status}: ${details}`
    );
    error.statusCode = response.status;
    throw error;
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

function noteToEntity(note, partitionKey) {
  return {
    PartitionKey: partitionKey,
    RowKey: note.id,
    title: note.title,
    originalText: note.originalText,
    summary: note.summary,
    keyPointsJson: JSON.stringify(note.keyPoints),
    reviewQuestionsJson: JSON.stringify(note.reviewQuestions),
    aiProvider: note.aiProvider,
    createdAt: note.createdAt
  };
}

function entityToNote(entity) {
  return {
    id: entity.RowKey,
    title: entity.title,
    originalText: entity.originalText,
    summary: entity.summary,
    keyPoints: parseJsonArray(entity.keyPointsJson),
    reviewQuestions: parseJsonArray(entity.reviewQuestionsJson),
    aiProvider: entity.aiProvider,
    createdAt: entity.createdAt
  };
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildEntityUrl(tableUrl, partitionKey, rowKey) {
  const url = new URL(tableUrl);
  const tablePath = url.pathname.replace(/\/$/, '');
  url.pathname = `${tablePath}(PartitionKey='${escapeODataString(partitionKey)}',RowKey='${escapeODataString(rowKey)}')`;
  return url;
}

function escapeODataString(value) {
  return String(value).replace(/'/g, "''");
}

module.exports = {
  AzureTableNoteRepository,
  buildEntityUrl,
  entityToNote,
  noteToEntity
};
