# Student Study Helper for Course Notes - Design

## 1. Project Summary

Student Study Helper is a small web application that helps students study from short course notes. A student pastes notes into the app, and the backend uses an AI service to generate a concise summary, key points, and review questions. The app stores each analysis so the student can review previous study sessions.

This midterm version focuses on a small, working Cloud + AI prototype.

## 2. Problem Statement

Students often have long or messy course notes and limited time to review them. They need a quick way to identify the most important ideas and create simple practice questions before a quiz, test, or class discussion.

## 3. Target Users

- College students reviewing class notes
- Students preparing for quizzes or midterms
- Team members who want a simple study aid built from course material

## 4. Midterm Scope

The midterm version should include:

- A form where users paste short course notes
- A backend API that receives the text
- An AI feature that returns:
  - summary
  - key points
  - review questions
- Persistent storage for note analysis history
- A basic UI that displays the AI result and previous analyses
- Deployment to Azure

Out of scope for the midterm:

- User accounts
- Real student records
- Full LMS integration
- Long document ingestion
- Automated grading

## 5. Backend API

### `GET /api/health`

Checks whether the backend is running.

### `POST /api/notes/analyze`

Receives study text, calls the AI service, stores the result, and returns the saved note analysis.

Example request:

```json
{
  "title": "Cloud Fundamentals Notes",
  "text": "Cloud computing provides on-demand access to shared computing resources..."
}
```

Example response:

```json
{
  "data": {
    "note": {
      "id": "note_...",
      "title": "Cloud Fundamentals Notes",
      "originalText": "...",
      "summary": "...",
      "keyPoints": ["..."],
      "reviewQuestions": ["..."],
      "createdAt": "2026-06-11T00:00:00.000Z"
    }
  }
}
```

### `GET /api/notes`

Returns saved analyses for the history list.

### `GET /api/notes/:id`

Returns one saved analysis.

## 6. Data Model

```json
{
  "id": "note_...",
  "title": "Cloud Fundamentals Notes",
  "originalText": "Original pasted note text",
  "summary": "AI-generated summary",
  "keyPoints": ["Important point 1", "Important point 2"],
  "reviewQuestions": ["Question 1?", "Question 2?"],
  "aiProvider": "mock | azure-openai",
  "createdAt": "ISO timestamp"
}
```

## 7. Azure Services Plan

Recommended midterm deployment:

- Hosting: Azure App Service
- AI: Azure OpenAI or an instructor-approved Azure AI service
- Storage: Azure Table Storage
- Configuration: Azure App Settings for API keys and connection strings
- Repository: GitHub

Backend storage is configurable:

- Local development: `STORAGE_PROVIDER=local-json`
- Azure deployment: `STORAGE_PROVIDER=azure-table`

For Azure Table Storage, the deployment owner should create a table named `StudyNotes` and configure `AZURE_TABLES_TABLE_URL` as a secret App Setting. The backend uses this table to save the original note text, summary, key points, review questions, AI provider, and created timestamp.

## 8. Architecture Flow

1. User enters course notes in the frontend.
2. Frontend sends notes to `POST /api/notes/analyze`.
3. Backend validates the input.
4. Backend calls the AI provider.
5. AI provider returns summary, key points, and review questions.
6. Backend stores the original text and AI result in local JSON during development or Azure Table Storage in deployment.
7. Backend returns the saved analysis to the frontend.
8. User can view analysis history through `GET /api/notes`.

## 9. AI Feature

AI input:

- Short course note text pasted by the user
- Optional title

AI output:

- Summary
- Key points
- Review questions

The local skeleton uses mock AI output so the frontend can be built before Azure credentials are available. The deployed version should use Azure OpenAI or another approved Azure AI service.

Azure OpenAI configuration:

```text
AI_PROVIDER=azure-openai
AZURE_OPENAI_ENDPOINT=https://<resource-name>.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_KEY=<secret-key>
AZURE_OPENAI_API_VERSION=<api-version>
```

The API key must be stored in `.env.local` for local testing or Azure App Settings for deployment. It must not be committed to GitHub.

## 10. Responsible AI Review

Fairness:

The AI may produce better results for clear English notes than for notes with grammar issues, mixed languages, or highly technical vocabulary.

Reliability and Safety:

AI-generated summaries and questions may miss important details or include inaccurate wording. Students should review the original notes and not rely only on AI output.

Privacy and Security:

The app should use sample or non-sensitive notes only. API keys and connection strings must stay in environment variables or Azure App Settings.

Inclusiveness:

The UI should use clear labels, readable contrast, and simple language. Future versions can support multilingual notes.

Transparency:

The app should tell users that the summary and questions are AI-generated study aids.

Accountability:

The student remains responsible for checking the output against course material. The AI should support studying, not replace learning or instructor guidance.

## 11. Future Agentic AI Extension

For the final project, this can become an agent-based study assistant:

- The agent can ask follow-up quiz questions.
- The agent can track weak topics across saved notes.
- The agent can create a study plan from stored analyses.
- The agent can call approved tools such as calendar reminders or progress tracking.
- Optional IoT extension: a simple study environment sensor could track noise or focus conditions and let the agent suggest better study times.

## 12. Risks and Limitations

- Azure OpenAI access may require setup time or instructor approval.
- AI output quality depends on the quality and length of the pasted notes.
- The midterm version should avoid real private student data.
- Cloud deployment and environment variables must be tested before presentation day.
