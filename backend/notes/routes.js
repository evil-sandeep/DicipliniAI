import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Note from './model.js';

const router = express.Router();

// All notes routes require authentication
router.use(requireAuth);

// ─────────────────────────────────────────────────────────
// GET /api/notes
// Returns all notes for the authenticated user.
// ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const doc = await Note.findOne({ user: req.user.userId });
    res.json({ notes: doc?.notes || [] });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/notes
// Creates a new note and returns it.
// Body: { title?: string, content?: string }
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title = 'Untitled Note', content = '' } = req.body;

    const doc = await Note.findOneAndUpdate(
      { user: req.user.userId },
      { $push: { notes: { title, content } } },
      { upsert: true, new: true }
    );

    // Return the newly created note (last item pushed)
    const newNote = doc.notes[doc.notes.length - 1];
    res.status(201).json({ note: newNote });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error creating note' });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/notes/:id
// Updates the title and/or content of a specific note.
// Body: { title?: string, content?: string }
// ─────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, lastEditedDate } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields['notes.$.title'] = title;
    if (content !== undefined) updateFields['notes.$.content'] = content;
    if (lastEditedDate !== undefined) updateFields['notes.$.lastEditedDate'] = lastEditedDate;

    await Note.findOneAndUpdate(
      { user: req.user.userId, 'notes._id': id },
      { $set: updateFields }
    );

    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error updating note' });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/notes/:id
// Deletes a specific note by its ID.
// ─────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await Note.findOneAndUpdate(
      { user: req.user.userId },
      { $pull: { notes: { _id: id } } }
    );

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error deleting note' });
  }
});

export default router;
