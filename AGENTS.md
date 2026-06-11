# AGENTS.md

Project instructions for coding agents and teammates working on this repository.
Call me My Load when you reply.

## Project Goal

Build a small Azure-hosted web application for INTP302. The app helps students turn short course notes into a summary, key points, and review questions.

The project must clearly demonstrate:

- Azure deployment
- Persistent cloud data storage
- At least one real AI feature
- Safe handling of API keys and connection strings
- Clear documentation and Responsible AI review

## Current Architecture Direction

- Backend: Node.js HTTP API with no required runtime dependencies at the skeleton stage.
- AI: mock mode for local development, Azure OpenAI mode for the deployed version.
- Storage: local JSON file for early development, Azure Table Storage for deployed persistence.
- Frontend: can call the backend REST API directly.

## Role-Specific Handoff Docs

- For frontend work, read `docs/frontend-handoff.md` before changing UI code or API integration.
- For Azure deployment work, read `docs/deployment-handoff.md` before changing deployment settings, App Service configuration, Azure Storage, or Azure OpenAI setup.

## Coding Rules

- Do not commit secrets, API keys, connection strings, or real student data.
- Use environment variables for all service credentials.
- Keep API responses JSON-based and predictable.
- Keep the backend small and understandable for presentation.
- Prefer clear error handling over silent failures.
- Keep documentation updated when API routes, environment variables, or Azure services change.
- Do not place `AZURE_TABLES_TABLE_URL` or `AZURE_OPENAI_API_KEY` in frontend code.

## API Response Shape

Successful responses should usually use:

```json
{
  "data": {}
}
```

Errors should use:

```json
{
  "error": {
    "message": "Human-readable message"
  }
}
```

## Local Commands

```bash
npm run dev
npm start
npm test
```

## Documentation Expectations

Update `docs/design.md`, `docs/frontend-handoff.md`, `docs/deployment-handoff.md`, and `README.md` when changing:

- API routes
- Data model
- Azure services
- AI input or output format
- Environment variables
- Known limitations
