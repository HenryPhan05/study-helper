const crypto = require('node:crypto');
const { readJsonBody, sendError, sendJson } = require('./utils/http');

const MAX_NOTE_LENGTH = 6000;

function createRouter({ config, noteRepository, aiService }) {
  return async function route(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    try {
      if (req.method === 'GET' && url.pathname === '/api/health') {
        sendJson(res, 200, {
          data: {
            status: 'ok',
            aiProvider: config.aiProvider,
            storageProvider: config.storageProvider,
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/notes/analyze') {
        const body = await readJsonBody(req);
        const input = validateAnalyzeRequest(body);
        const analysis = await aiService.analyzeStudyText(input, config);
        const now = new Date().toISOString();

        const note = await noteRepository.create({
          id: `note_${crypto.randomUUID()}`,
          title: input.title || 'Untitled Study Notes',
          originalText: input.text,
          summary: analysis.summary,
          keyPoints: analysis.keyPoints,
          reviewQuestions: analysis.reviewQuestions,
          aiProvider: config.aiProvider,
          createdAt: now
        });

        sendJson(res, 201, {
          data: {
            note
          }
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/notes') {
        const notes = await noteRepository.list();
        sendJson(res, 200, {
          data: {
            notes: notes.map(toNoteListItem)
          }
        });
        return;
      }

      const noteMatch = url.pathname.match(/^\/api\/notes\/([^/]+)$/);
      if (req.method === 'GET' && noteMatch) {
        const note = await noteRepository.findById(noteMatch[1]);

        if (!note) {
          sendError(res, 404, 'Note analysis was not found.');
          return;
        }

        sendJson(res, 200, {
          data: {
            note
          }
        });
        return;
      }

      sendError(res, 404, 'Route was not found.');
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message =
        statusCode === 500 ? 'Something went wrong while processing the request.' : error.message;

      if (statusCode === 500) {
        console.error(error);
      }

      sendError(res, statusCode, message);
    }
  };
}

function validateAnalyzeRequest(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!text) {
    const error = new Error('Text is required.');
    error.statusCode = 400;
    throw error;
  }

  if (text.length > MAX_NOTE_LENGTH) {
    const error = new Error(`Text must be ${MAX_NOTE_LENGTH} characters or fewer.`);
    error.statusCode = 400;
    throw error;
  }

  return {
    title: title.slice(0, 120),
    text
  };
}

function toNoteListItem(note) {
  return {
    id: note.id,
    title: note.title,
    summary: note.summary,
    keyPointCount: note.keyPoints.length,
    reviewQuestionCount: note.reviewQuestions.length,
    aiProvider: note.aiProvider,
    createdAt: note.createdAt
  };
}

module.exports = {
  createRouter,
  validateAnalyzeRequest
};
