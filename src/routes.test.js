const assert = require('node:assert/strict');
const test = require('node:test');
const { validateAnalyzeRequest } = require('./routes');
const { analyzeWithMockAI } = require('./services/aiService');

test('validateAnalyzeRequest accepts title and text', () => {
  const result = validateAnalyzeRequest({
    title: ' Cloud Notes ',
    text: ' Cloud computing uses shared resources. '
  });

  assert.equal(result.title, 'Cloud Notes');
  assert.equal(result.text, 'Cloud computing uses shared resources.');
});

test('validateAnalyzeRequest rejects missing text', () => {
  assert.throws(() => validateAnalyzeRequest({ title: 'No text' }), /Text is required/);
});

test('mock AI returns study helper fields', () => {
  const result = analyzeWithMockAI({
    title: 'AI Fundamentals',
    text: 'Machine learning uses data to find patterns. Responsible AI requires fairness and privacy.'
  });

  assert.equal(typeof result.summary, 'string');
  assert.ok(result.keyPoints.length >= 1);
  assert.ok(result.reviewQuestions.length >= 1);
});
