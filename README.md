# Student Study Helper AI

Cloud + AI prototype for INTP302. The app helps students paste short course notes and receive an AI-generated summary, key points, and review questions.

## Project Status

Backend skeleton is ready for local development. It includes:

- REST API routes for note analysis and history
- mock AI mode for frontend integration before Azure credentials are available
- Azure OpenAI integration path through environment variables
- local JSON storage for early development
- Azure Table Storage adapter for cloud persistence
- design documentation in `docs/design.md`

Azure deployment still needs to be configured by the deployment owner.

## Handoff Documents

- Frontend integration: `docs/frontend-handoff.md`
- Azure deployment: `docs/deployment-handoff.md`
- Overall design: `docs/design.md`

## Local Setup

Requirements:

- Node.js 20 or newer

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the API:

```bash
npm run dev
```

The API starts at:

```text
http://localhost:3001
```

## API Routes

### Health Check

```http
GET /api/health
```

### Analyze Notes

```http
POST /api/notes/analyze
Content-Type: application/json
```

Request:

```json
{
  "title": "Cloud Fundamentals",
  "text": "Cloud computing provides on-demand access to shared computing resources..."
}
```

### List Saved Analyses

```http
GET /api/notes
```

### Get One Saved Analysis

```http
GET /api/notes/:id
```

## Environment Variables

```text
PORT=3001
NODE_ENV=development
DATA_FILE_PATH=data/notes.json
STORAGE_PROVIDER=local-json
AZURE_TABLES_TABLE_URL=
AZURE_TABLES_PARTITION_KEY=notes
AI_PROVIDER=mock
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_VERSION=
```

Use `AI_PROVIDER=mock` for local development without Azure credentials.

Use `AI_PROVIDER=azure-openai` after Azure OpenAI is configured.

Use `STORAGE_PROVIDER=local-json` for local development.

Use `STORAGE_PROVIDER=azure-table` after Azure Table Storage is configured.

## Backend Handoff for Frontend

Frontend can integrate against these endpoints:

```text
GET  /api/health
POST /api/notes/analyze
GET  /api/notes
GET  /api/notes/:id
```

The main request body for note analysis is:

```json
{
  "title": "Cloud Fundamentals",
  "text": "Paste course notes here..."
}
```

The analysis result includes:

```json
{
  "id": "note_...",
  "title": "Cloud Fundamentals",
  "originalText": "...",
  "summary": "...",
  "keyPoints": ["..."],
  "reviewQuestions": ["..."],
  "aiProvider": "mock",
  "createdAt": "2026-06-11T00:00:00.000Z"
}
```

## Azure Services Plan

Recommended services for the midterm prototype:

- Azure App Service for hosting
- Azure OpenAI for summary, key points, and review questions
- Azure Table Storage for persistent analysis history
- Azure App Settings for secrets and configuration

## Azure Table Storage Configuration

Deployment owner should create:

- Azure Storage Account
- Table named `StudyNotes`
- Table-level SAS token with read, add, update, and query/list permissions

Set these App Settings in Azure App Service:

```text
STORAGE_PROVIDER=azure-table
AZURE_TABLES_TABLE_URL=https://<account>.table.core.windows.net/StudyNotes?<sas-token>
AZURE_TABLES_PARTITION_KEY=notes
```

`AZURE_TABLES_TABLE_URL` is secret configuration. Do not commit it to GitHub or place it in frontend code.

## Azure OpenAI Configuration

Deployment owner or backend owner should create or provide:

- Azure OpenAI resource
- Deployed chat model
- Endpoint
- Deployment name
- API key
- API version

Set these App Settings in Azure App Service:

```text
AI_PROVIDER=azure-openai
AZURE_OPENAI_ENDPOINT=https://<resource-name>.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_KEY=<secret-key>
AZURE_OPENAI_API_VERSION=<api-version>
```

For local development, keep `AI_PROVIDER=mock` until real Azure credentials are available.

## Responsible AI

AI output is a study aid, not an official answer key. It may miss important details or phrase concepts incorrectly. Users should compare AI output with original course notes and instructor materials. The app should not process private student records or sensitive personal data.

## Commands

```bash
npm run dev
npm start
npm test
```
