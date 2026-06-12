function normalizeAnalysis(value) {
  return {
    summary: String(value.summary || '').trim(),
    keyPoints: Array.isArray(value.keyPoints)
      ? value.keyPoints.map((item) => String(item).trim()).filter(Boolean).slice(0, 6)
      : [],
    reviewQuestions: Array.isArray(value.reviewQuestions)
      ? value.reviewQuestions.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
      : []
  };
}

async function analyzeStudyText({ title, text }, config) {
  if (config.aiProvider === 'azure-openai') {
    return analyzeWithAzureOpenAI({ title, text }, config.azureOpenAI);
  }

  return analyzeWithMockAI({ title, text });
}

async function analyzeWithAzureOpenAI({ title, text }, azureConfig) {
  const missing = [];

  if (!azureConfig.endpoint) missing.push('AZURE_OPENAI_ENDPOINT');
  if (!azureConfig.deployment) missing.push('AZURE_OPENAI_DEPLOYMENT');
  if (!azureConfig.apiKey) missing.push('AZURE_OPENAI_API_KEY');
  if (!azureConfig.apiVersion) missing.push('AZURE_OPENAI_API_VERSION');

  if (missing.length > 0) {
    throw new Error(`Missing Azure OpenAI configuration: ${missing.join(', ')}`);
  }

  const endpoint = azureConfig.endpoint.replace(/\/$/, '');
  const deployment = encodeURIComponent(azureConfig.deployment);
  const apiVersion = encodeURIComponent(azureConfig.apiVersion);
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': azureConfig.apiKey
    },
    body: JSON.stringify({
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: 'system',
          content:
            // 'You are a study assistant. Return only valid JSON with keys summary, keyPoints, and reviewQuestions. keyPoints and reviewQuestions must be arrays of short strings.'\
            `
            You are a helpful and strict STUDY ASSISTANT.

            Your role:
              - Use simple English that make more understanding
              - Help students learn and understand academic content
              - Summarize study notes
              - Extract key points
              - Generate review questions
              - Create a roadmap if available
              - Suggest helpful learning resources (articles, documentation, tutorials)
              - Give them some links to achieve their questions

            STRICT RULES:
              1. ONLY respond to educational or learning-related topics
              2. If user asks about cheating, exam fraud, or bypassing rules:
                → REFUSE and say: "I can't help with cheating or exam misconduct, but I can help you study the topic properly."
              3. If user asks unrelated topics (food, personal life, entertainment not related to learning):
                → REFUSE and ask if they want to study and give them some recommendation study topic
              4. Never provide harmful, illegal, or unethical assistance

            OUTPUT FORMAT (must be valid JSON only):
            {
              "summary": string,
              "keyPoints": string[],
              "reviewQuestions": string[],
              "resources": string[]
            }
            If topic is valid:
            - include 1–3 learning resources (links or suggested search terms)

            If topic is invalid:
            - summary should explain refusal briefly
            - other fields should be empty arrays
          `
        },
        {
          role: 'user',
          content: `Title: ${title || 'Untitled study notes'}\n\nCourse notes:\n${text}`
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Azure OpenAI request failed with status ${response.status}: ${details}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Azure OpenAI response did not include message content.');
  }

  return normalizeAnalysis(parseJsonFromModel(content));
}

function analyzeWithMockAI({ title, text }) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const topic = title || 'these notes';
  const summarySource = sentences.slice(0, 2).join(' ');
  const summary =
    summarySource.length > 0
      ? `Summary of ${topic}: ${summarySource}`
      : `Summary of ${topic}: Review the main ideas and connect them to course examples.`;

  const keyPoints = buildKeyPoints(sentences, cleanText);
  const reviewQuestions = buildReviewQuestions(keyPoints, topic);

  return normalizeAnalysis({
    summary,
    keyPoints,
    reviewQuestions
  });
}

function buildKeyPoints(sentences, cleanText) {
  const candidates = sentences.length > 0 ? sentences : [cleanText];

  return candidates
    .slice(0, 4)
    .map((sentence) => sentence.replace(/[.!?]$/, ''))
    .filter(Boolean)
    .map((sentence) => (sentence.length > 140 ? `${sentence.slice(0, 137)}...` : sentence));
}

function buildReviewQuestions(keyPoints, topic) {
  const questions = keyPoints.slice(0, 3).map((point) => `How would you explain: ${point}?`);
  questions.push(`What is the most important idea from ${topic}?`);
  return questions;
}

function parseJsonFromModel(content) {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }

    throw new Error('AI response was not valid JSON.');
  }
}

module.exports = {
  analyzeStudyText,
  analyzeWithMockAI,
  normalizeAnalysis,
  parseJsonFromModel
};
