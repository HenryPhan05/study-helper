const API_BASE_URL = resolveApiBaseUrl();

const analyzeForm = document.querySelector('#analyze-form');
const titleInput = document.querySelector('#title');
const notesInput = document.querySelector('#notes');
const submitButton = document.querySelector('#submit-btn');
const refreshButton = document.querySelector('#refresh-btn');
const formError = document.querySelector('#form-error');
const charCount = document.querySelector('#char-count');
const historyList = document.querySelector('#history-list');
const historyEmpty = document.querySelector('#history-empty');
const statusPill = document.querySelector('#status-pill');
const providerPill = document.querySelector('#provider-pill');
const resultTitle = document.querySelector('#result-title');
const resultMeta = document.querySelector('#result-meta');
const summaryText = document.querySelector('#summary-text');
const keyPointsList = document.querySelector('#key-points');
const reviewQuestionsList = document.querySelector('#review-questions');

let activeNoteId = null;

initialize();

function resolveApiBaseUrl() {
  const { protocol, hostname, port, origin } = window.location;

  if (protocol === 'file:') {
    return 'http://localhost:3001';
  }

  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '3001') {
    return 'http://localhost:3001';
  }

  return origin;
}

function initialize() {
  notesInput.addEventListener('input', updateCharacterCount);
  analyzeForm.addEventListener('submit', handleAnalyzeSubmit);
  refreshButton.addEventListener('click', () => {
    loadHistory();
  });

  updateCharacterCount();
  checkHealth();
  loadHistory();
}

function updateCharacterCount() {
  charCount.textContent = `${notesInput.value.length} / 6000`;
}

async function checkHealth() {
  try {
    const payload = await apiRequest('/api/health', { method: 'GET' });
    const { aiProvider, storageProvider } = payload.data;
    statusPill.textContent = 'Backend online';
    statusPill.style.color = '#2f8f5f';
    providerPill.textContent = `AI: ${aiProvider} | Storage: ${storageProvider}`;
  } catch (error) {
    statusPill.textContent = 'Backend unavailable';
    statusPill.style.color = '#b84833';
    providerPill.textContent = 'Check API server';
  }
}

async function handleAnalyzeSubmit(event) {
  event.preventDefault();
  clearError();

  const title = titleInput.value.trim();
  const text = notesInput.value.trim();

  if (!text) {
    showError('Please add some study notes before analyzing.');
    return;
  }

  if (text.length > 6000) {
    showError('Study notes must be 6000 characters or fewer.');
    return;
  }

  setSubmittingState(true);

  try {
    const payload = await apiRequest('/api/notes/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, text })
    });

    const note = payload.data.note;
    activeNoteId = note.id;
    renderNote(note);
    notesInput.value = '';
    updateCharacterCount();
    await loadHistory();
  } catch (error) {
    showError(error.message);
  } finally {
    setSubmittingState(false);
  }
}

async function loadHistory() {
  try {
    const payload = await apiRequest('/api/notes', { method: 'GET' });
    renderHistory(payload.data.notes || []);
  } catch (error) {
    historyList.innerHTML = '';
    historyEmpty.textContent = 'Unable to load history right now.';
    historyEmpty.style.display = 'block';
  }
}

function renderHistory(notes) {
  historyList.innerHTML = '';

  if (!notes.length) {
    historyEmpty.textContent = 'No analyses yet. Create your first one.';
    historyEmpty.style.display = 'block';
    return;
  }

  historyEmpty.style.display = 'none';

  for (const note of notes) {
    const item = document.createElement('li');
    item.className = 'history-item';
    if (note.id === activeNoteId) {
      item.classList.add('active');
    }

    item.innerHTML = `
      <h4>${escapeHtml(note.title)}</h4>
      <p>${escapeHtml((note.summary || '').slice(0, 90))}${note.summary && note.summary.length > 90 ? '...' : ''}</p>
      <div class="meta-row">
        <span>${new Date(note.createdAt).toLocaleString()}</span>
        <span>${note.keyPointCount} points</span>
        <span>${note.reviewQuestionCount} questions</span>
      </div>
    `;

    item.addEventListener('click', () => loadNoteById(note.id));
    historyList.appendChild(item);
  }
}

async function loadNoteById(noteId) {
  clearError();

  try {
    const payload = await apiRequest(`/api/notes/${encodeURIComponent(noteId)}`, {
      method: 'GET'
    });
    activeNoteId = noteId;
    renderNote(payload.data.note);
    await loadHistory();
  } catch (error) {
    showError(error.message);
  }
}

function renderNote(note) {
  resultTitle.textContent = note.title || 'Untitled Study Notes';
  resultMeta.textContent = `${new Date(note.createdAt).toLocaleString()} | ${note.aiProvider}`;
  summaryText.classList.remove('placeholder');
  summaryText.textContent = note.summary || 'No summary available.';

  renderBulletList(keyPointsList, note.keyPoints, 'No key points available.');
  renderBulletList(reviewQuestionsList, note.reviewQuestions, 'No review questions available.');
}

function renderBulletList(target, values, emptyMessage) {
  target.innerHTML = '';

  if (!Array.isArray(values) || !values.length) {
    const li = document.createElement('li');
    li.textContent = emptyMessage;
    li.className = 'placeholder';
    target.appendChild(li);
    return;
  }

  for (const value of values) {
    const li = document.createElement('li');
    li.textContent = value;
    target.appendChild(li);
  }
}

function setSubmittingState(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? 'Analyzing...' : 'Analyze Notes';
}

function showError(message) {
  formError.textContent = message || 'Something went wrong.';
}

function clearError() {
  formError.textContent = '';
}

async function apiRequest(path, init) {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || 'Request failed.';
    throw new Error(message);
  }

  return payload;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
