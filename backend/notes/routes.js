import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Note from './model.js';

const router = express.Router();

// All notes routes require authentication
router.use(requireAuth);

/**
 * GET /api/notes
 * Returns the authenticated user's notepad content.
 */
router.get('/', async (req, res) => {
  try {
    const note = await Note.findOne({ user: req.user.userId });
    res.json({ content: note?.content || '' });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});

/**
 * PUT /api/notes
 * Saves (upserts) the authenticated user's notepad content.
 * Body: { content: string }
 */
router.put('/', async (req, res) => {
  try {
    const { content } = req.body;

    await Note.findOneAndUpdate(
      { user: req.user.userId },
      { content: content ?? '' },
      { upsert: true, new: true }
    );

    res.json({ message: 'Notes saved successfully' });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ message: 'Server error saving notes' });
  }
});

export default router;
