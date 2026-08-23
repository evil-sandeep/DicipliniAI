import express from 'express';
import Tracker from '../models/Tracker.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all tracker routes
router.use(requireAuth);

// GET user's tracker data
router.get('/', async (req, res) => {
  try {
    let trackerData = await Tracker.findOne({ user: req.user.userId });
    
    // If no tracker data exists yet, return empty defaults
    if (!trackerData) {
      return res.json({ columns: [], checked: {}, todos: [], monthlyBudget: 0, expenses: [] });
    }

    res.json({
      columns: trackerData.columns,
      checked: Object.fromEntries(trackerData.checked || new Map()), // Convert Map to Object
      todos: trackerData.todos || [],
      monthlyBudget: trackerData.monthlyBudget || 0,
      expenses: trackerData.expenses || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tracker data' });
  }
});

// PUT (update) user's tracker data
router.put('/', async (req, res) => {
  try {
    const { columns, checked, todos, monthlyBudget, expenses } = req.body;
    
    // Convert checked object to Map format for Mongoose
    const checkedMap = new Map(Object.entries(checked || {}));

    let trackerData = await Tracker.findOne({ user: req.user.userId });

    if (trackerData) {
      if (columns !== undefined) trackerData.columns = columns;
      if (checked !== undefined) trackerData.checked = checkedMap;
      if (todos !== undefined) trackerData.todos = todos;
      if (monthlyBudget !== undefined) trackerData.monthlyBudget = monthlyBudget;
      if (expenses !== undefined) trackerData.expenses = expenses;
      await trackerData.save();
    } else {
      trackerData = new Tracker({
        user: req.user.userId,
        columns: columns || [],
        checked: checkedMap,
        todos: todos || [],
        monthlyBudget: monthlyBudget || 0,
        expenses: expenses || []
      });
      await trackerData.save();
    }

    res.json({ message: 'Tracker data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving tracker data' });
  }
});

export default router;
