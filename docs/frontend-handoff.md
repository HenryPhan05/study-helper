# Frontend Handoff

This document explains how the frontend can connect to the Study Helper backend.

## Current Backend Status

The backend is ready for frontend integration. Local development uses:

- mock AI output
- local JSON storage
- no Azure credentials required

This means the frontend can be built and tested before Azure deployment is finished.

## Start the Backend Locally

Requirements:

- Node.js 20 or newer

Create local environment file:

```bash
cp .env.example .env.local
```

Start the backend:

```bash
npm run dev
```

Default backend URL:

```text
http://localhost:3001
```

## API Base URL

For local frontend development:

```text
http://localhost:3001
```

After deployment, replace this with the Azure App Service URL provided by the deployment owner.

## Response Format

Successful responses use:

```json
{
  "data": {}
}
```

Error responses use:

```json
{
  "error": {
    "message": "Human-readable message"
  }
}
```

Frontend should show `error.message` to the user when a request fails.

## Endpoints

### Health Check

Use this to check if the backend is running.

```http
GET /api/health
```

Example response:

```json
{
  "data": {
    "status": "ok",
    "aiProvider": "mock",
    "storageProvider": "local-json",
    "timestamp": "2026-06-11T00:00:00.000Z"
  }
}
```

### Analyze Study Notes

Use this when the user submits notes.

```http
POST /api/notes/analyze
Content-Type: application/json
```

Request body:

```json
{
  "title": "Cloud Fundamentals",
  "text": "Cloud computing provides on-demand access to shared computing resources..."
}
```

Validation rules:

- `text` is required
- `title` is optional
- `text` must be 6000 characters or fewer

Example response:

```json
{
  "data": {
    "note": {
      "id": "note_123",
      "title": "Cloud Fundamentals",
      "originalText": "Cloud computing provides on-demand access to shared computing resources...",
      "summary": "Summary of Cloud Fundamentals: Cloud computing provides...",
      "keyPoints": [
        "Cloud computing provides on-demand access to shared resources",
        "Azure App Service can host web applications"
      ],
      "reviewQuestions": [
        "How would you explain cloud computing?",
        "What is the most important idea from Cloud Fundamentals?"
      ],
      "aiProvider": "mock",
      "createdAt": "2026-06-11T00:00:00.000Z"
    }
  }
}
```

Recommended UI behavior:

- Disable the submit button while loading.
- Show the summary first.
- Show key points as a list.
- Show review questions as a list.
- Show a small label such as `AI-generated study aid`.
- Show a clear error message if the backend returns an error.

### List Saved Analyses

Use this for the history panel or previous notes list.

```http
GET /api/notes
```

Example response:

```json
{
  "data": {
    "notes": [
      {
        "id": "note_123",
        "title": "Cloud Fundamentals",
        "summary": "Summary of Cloud Fundamentals: Cloud computing provides...",
        "keyPointCount": 2,
        "reviewQuestionCount": 2,
        "aiProvider": "mock",
        "createdAt": "2026-06-11T00:00:00.000Z"
      }
    ]
  }
}
```

Recommended UI behavior:

- Display latest analyses first.
- Show title, summary preview, created date, and counts.
- When a user selects an item, call `GET /api/notes/:id`.

### Get One Saved Analysis

Use this when the user opens one history item.

```http
GET /api/notes/:id
```

Example:

```http
GET /api/notes/note_123
```

Example response:

```json
{
  "data": {
    "note": {
      "id": "note_123",
      "title": "Cloud Fundamentals",
      "originalText": "...",
      "summary": "...",
      "keyPoints": ["..."],
      "reviewQuestions": ["..."],
      "aiProvider": "mock",
      "createdAt": "2026-06-11T00:00:00.000Z"
    }
  }
}
```

## Suggested Frontend Views

- Notes input form
- Current analysis result
- Saved analysis history
- Selected analysis detail

## Frontend Notes

- Do not call Azure OpenAI directly from the frontend.
- Do not store API keys or SAS URLs in frontend code.
- The backend handles AI and storage.
- During local development, mock AI output is expected and acceptable.
- The final deployed app should show the Azure backend URL instead of localhost.

