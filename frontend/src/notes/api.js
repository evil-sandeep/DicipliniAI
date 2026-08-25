import { API_BASE_URL } from '../config';

const NOTES_API = `${API_BASE_URL}/api/notes`;

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ── Fetch all notes ──────────────────────────────────────
/**
 * Returns the user's full list of notes from the backend.
 * @returns {Promise<Array>} Array of note objects { _id, title, content, createdAt, updatedAt }
 */
export async function fetchAllNotes() {
  const res = await fetch(NOTES_API, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notes');
  const data = await res.json();
  return data.notes || [];
}

// ── Create a new note ────────────────────────────────────
/**
 * Creates a new note in the backend.
 * @param {{ title?: string, content?: string }} payload
 * @returns {Promise<Object>} The newly created note object.
 */
export async function createNote(payload = {}) {
  const res = await fetch(NOTES_API, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create note');
  const data = await res.json();
  return data.note;
}

// ── Update a note ────────────────────────────────────────
/**
 * Updates an existing note's title and/or content.
 * @param {string} id - The note's MongoDB _id.
 * @param {{ title?: string, content?: string }} payload
 * @returns {Promise<void>}
 */
export async function updateNote(id, payload) {
  const res = await fetch(`${NOTES_API}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update note');
}

// ── Delete a note ────────────────────────────────────────
/**
 * Deletes a note by its ID.
 * @param {string} id - The note's MongoDB _id.
 * @returns {Promise<void>}
 */
export async function deleteNote(id) {
  const res = await fetch(`${NOTES_API}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete note');
}
