import { API_BASE_URL } from '../config';

const NOTES_API = `${API_BASE_URL}/api/notes`;

const getToken = () => localStorage.getItem('token');

/**
 * Fetches the user's saved notepad content from the backend.
 * @returns {Promise<string>} The notepad content string.
 */
export async function fetchNotes() {
  const res = await fetch(NOTES_API, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch notes');
  const data = await res.json();
  return data.content || '';
}

/**
 * Saves the user's notepad content to the backend.
 * @param {string} content - The notepad text to save.
 * @returns {Promise<void>}
 */
export async function saveNotes(content) {
  const res = await fetch(NOTES_API, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to save notes');
}
