const assert = require('node:assert/strict');
const test = require('node:test');
const {
  buildEntityUrl,
  entityToNote,
  noteToEntity
} = require('./azureTableNoteRepository');

test('noteToEntity serializes array fields for Azure Table Storage', () => {
  const entity = noteToEntity(
    {
      id: 'note_1',
      title: 'Cloud Notes',
      originalText: 'Original text',
      summary: 'Short summary',
      keyPoints: ['Point 1'],
      reviewQuestions: ['Question 1?'],
      aiProvider: 'mock',
      createdAt: '2026-06-11T00:00:00.000Z'
    },
    'notes'
  );

  assert.equal(entity.PartitionKey, 'notes');
  assert.equal(entity.RowKey, 'note_1');
  assert.equal(entity.keyPointsJson, '["Point 1"]');
});

test('entityToNote restores stored Azure Table Storage entity', () => {
  const note = entityToNote({
    RowKey: 'note_1',
    title: 'Cloud Notes',
    originalText: 'Original text',
    summary: 'Short summary',
    keyPointsJson: '["Point 1"]',
    reviewQuestionsJson: '["Question 1?"]',
    aiProvider: 'mock',
    createdAt: '2026-06-11T00:00:00.000Z'
  });

  assert.equal(note.id, 'note_1');
  assert.deepEqual(note.keyPoints, ['Point 1']);
  assert.deepEqual(note.reviewQuestions, ['Question 1?']);
});

test('buildEntityUrl keeps SAS query and adds entity path', () => {
  const url = buildEntityUrl(
    'https://example.table.core.windows.net/StudyNotes?sv=token&sig=secret',
    'notes',
    'note_1'
  );

  assert.equal(
    url.toString(),
    "https://example.table.core.windows.net/StudyNotes(PartitionKey='notes',RowKey='note_1')?sv=token&sig=secret"
  );
});
