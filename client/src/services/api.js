const API_BASE = '/api';

/**
 * Fetch snippets with optional filter and search params
 */
export async function getSnippets(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.language && params.language !== 'All') query.append('language', params.language);
  if (params.search) query.append('search', params.search);

  const url = `${API_BASE}/snippets${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch snippets: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Create a new snippet
 */
export async function createSnippet(snippetData) {
  const response = await fetch(`${API_BASE}/snippets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snippetData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create snippet: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Update an existing snippet
 */
export async function updateSnippet(id, updates) {
  const response = await fetch(`${API_BASE}/snippets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update snippet: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Toggle pin status of a snippet
 */
export async function togglePinSnippet(id) {
  const response = await fetch(`${API_BASE}/snippets/${id}/pin`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to toggle pin: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Delete a snippet by id
 */
export async function deleteSnippet(id) {
  const response = await fetch(`${API_BASE}/snippets/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete snippet: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Analyze code snippet using AI endpoint (Groq llama-3.3-70b-versatile)
 */
export async function analyzeCode({ code, language }) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to analyze code: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Check backend health & database status
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Reset back to 3 seed entries
 */
export async function resetSeedData() {
  const response = await fetch(`${API_BASE}/snippets/reset-seed`, {
    method: 'POST',
  });
  return await response.json();
}
