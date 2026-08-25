import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Goals from './model.js';

const router = express.Router();

// All goals routes require authentication
router.use(requireAuth);

// ─────────────────────────────────────────────────────────
// GET /api/goals
// Returns all goals for the authenticated user.
// ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const doc = await Goals.findOne({ user: req.user.userId });
    res.json({ goals: doc?.goals || [] });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error fetching goals' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/goals
// Creates a new goal and returns it.
// Body: { type: 'short-term'|'monthly', label, title, description, deadline, milestones }
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { type = 'short-term', label = '', title = '', description = '', deadline, milestones = [] } = req.body;

    const doc = await Goals.findOneAndUpdate(
      { user: req.user.userId },
      { $push: { goals: { type, label, title, description, deadline, milestones } } },
      { upsert: true, new: true }
    );

    const newGoal = doc.goals[doc.goals.length - 1];
    res.status(201).json({ goal: newGoal });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error creating goal' });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/goals/:id
// Updates a specific goal's fields.
// Body: { type?, label?, title?, description?, status?, progress?, deadline?, milestones? }
// ─────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, label, title, description, status, progress, deadline, milestones } = req.body;

    const updateFields = {};
    if (type !== undefined) updateFields['goals.$.type'] = type;
    if (label !== undefined) updateFields['goals.$.label'] = label;
    if (title !== undefined) updateFields['goals.$.title'] = title;
    if (description !== undefined) updateFields['goals.$.description'] = description;
    if (status !== undefined) updateFields['goals.$.status'] = status;
    if (progress !== undefined) updateFields['goals.$.progress'] = progress;
    if (deadline !== undefined) updateFields['goals.$.deadline'] = deadline;
    if (milestones !== undefined) updateFields['goals.$.milestones'] = milestones;

    await Goals.findOneAndUpdate(
      { user: req.user.userId, 'goals._id': id },
      { $set: updateFields }
    );

    res.json({ message: 'Goal updated successfully' });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Server error updating goal' });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/goals/:id
// Deletes a specific goal by its ID.
// ─────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await Goals.findOneAndUpdate(
      { user: req.user.userId },
      { $pull: { goals: { _id: id } } }
    );

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Server error deleting goal' });
  }
});

export default router;
