# Deployment Handoff

This document explains how to deploy and configure the Study Helper backend on Azure.

## Current Backend Status

The backend is ready for Azure configuration. It supports:

- Azure App Service hosting
- Azure OpenAI for the AI feature
- Azure Table Storage for persistent note analysis history
- Azure App Settings for secrets and configuration

Local development still works with mock AI and local JSON storage.

## Runtime Requirements

- Node.js 20 or newer
- Start command:

```bash
npm start
```

Health check endpoint:

```http
GET /api/health
```

## Azure Resources Needed

Create these Azure resources:

- Azure App Service
- Azure Storage Account
- Azure Table Storage table named `StudyNotes`
- Azure OpenAI resource
- Azure OpenAI chat model deployment

## App Service Settings

Set these App Settings in Azure App Service.

Basic server settings:

```text
NODE_ENV=production
PORT=8080
```

Storage settings:

```text
STORAGE_PROVIDER=azure-table
AZURE_TABLES_TABLE_URL=https://<storage-account>.table.core.windows.net/StudyNotes?<sas-token>
AZURE_TABLES_PARTITION_KEY=notes
```

AI settings:

```text
AI_PROVIDER=azure-openai
AZURE_OPENAI_ENDPOINT=https://<openai-resource>.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_KEY=<secret-key>
AZURE_OPENAI_API_VERSION=<api-version>
```

Do not commit these values to GitHub.

## Azure Table Storage Setup

1. Create an Azure Storage Account.
2. Create a table named `StudyNotes`.
3. Generate a SAS token for the table.
4. The SAS token should allow the backend to:
   - add entities
   - read entities
   - query/list entities
5. Combine the table URL and SAS token:

```text
https://<storage-account>.table.core.windows.net/StudyNotes?<sas-token>
```

6. Add that full value as `AZURE_TABLES_TABLE_URL` in App Service settings.

The backend stores each note analysis as one table entity:

```text
PartitionKey: notes
RowKey: note_<uuid>
title
originalText
summary
keyPointsJson
reviewQuestionsJson
aiProvider
createdAt
```

## Azure OpenAI Setup

1. Create or use an Azure OpenAI resource.
2. Deploy a chat model.
3. Copy the endpoint, deployment name, API key, and API version.
4. Add them to App Service settings.

The backend sends the pasted study notes to Azure OpenAI and expects JSON with:

```json
{
  "summary": "Short summary",
  "keyPoints": ["Point 1", "Point 2"],
  "reviewQuestions": ["Question 1?", "Question 2?"]
}
```

## Deployment Verification

After deployment, test the health endpoint:

```bash
curl https://<app-name>.azurewebsites.net/api/health
```

Expected response should include:

```json
{
  "data": {
    "status": "ok",
    "aiProvider": "azure-openai",
    "storageProvider": "azure-table"
  }
}
```

Then test note analysis:

```bash
curl -X POST https://<app-name>.azurewebsites.net/api/notes/analyze \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Cloud Fundamentals\",\"text\":\"Cloud computing provides on-demand access to shared resources. Azure App Service can host web applications.\"}"
```

Expected result:

- HTTP 201
- `data.note.summary` exists
- `data.note.keyPoints` contains items
- `data.note.reviewQuestions` contains items
- a new row appears in the `StudyNotes` table

Then test history:

```bash
curl https://<app-name>.azurewebsites.net/api/notes
```

Expected result:

- HTTP 200
- saved notes are returned from Azure Table Storage

## Troubleshooting

If `/api/health` works but note analysis fails:

- Check `AI_PROVIDER`
- Check Azure OpenAI endpoint and deployment name
- Check `AZURE_OPENAI_API_KEY`
- Check `AZURE_OPENAI_API_VERSION`

If note analysis works but history is not saved:

- Check `STORAGE_PROVIDER`
- Check `AZURE_TABLES_TABLE_URL`
- Check that the table name is `StudyNotes`
- Check SAS token permissions

If the frontend cannot call the backend:

- Confirm the frontend is using the deployed backend URL.
- Check browser console errors.
- Check App Service logs.

## Security Notes

- Keep Azure OpenAI API key in App Service settings only.
- Keep Azure Table SAS URL in App Service settings only.
- Do not place secrets in frontend code.
- Do not commit `.env.local`.
- Use sample or non-sensitive study notes only.

## Owner Handoff

Backend owner provides:

- API code
- Azure OpenAI integration logic
- Azure Table Storage adapter
- environment variable list
- API documentation

Deployment owner provides:

- Azure resources
- App Service deployment
- App Settings
- public app URL
- final verification with real Azure services

