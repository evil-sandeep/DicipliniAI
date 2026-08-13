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
      return res.json({ columns: [], checked: {} });
    }

    res.json({
      columns: trackerData.columns,
      checked: Object.fromEntries(trackerData.checked) // Convert Map to Object
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tracker data' });
  }
});

// PUT (update) user's tracker data
router.put('/', async (req, res) => {
  try {
    const { columns, checked } = req.body;
    
    // Convert checked object to Map format for Mongoose
    const checkedMap = new Map(Object.entries(checked || {}));

    let trackerData = await Tracker.findOne({ user: req.user.userId });

    if (trackerData) {
      trackerData.columns = columns;
      trackerData.checked = checkedMap;
      await trackerData.save();
    } else {
      trackerData = new Tracker({
        user: req.user.userId,
        columns,
        checked: checkedMap
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
