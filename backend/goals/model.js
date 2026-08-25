import mongoose from 'mongoose';

/**
 * goalItemSchema
 * Represents a single goal card (short-term or monthly vision).
 */
const goalItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['short-term', 'monthly'],
      required: true,
    },
    label: { type: String, default: '' },     // e.g. "🎯 Short-term Target"
    title: { type: String, default: '' },     // e.g. "Complete 80%+ Habits This Week"
    description: { type: String, default: '' }, // supporting text
  },
  { timestamps: true }
);

/**
 * goalsSchema
 * One document per user, holds their list of goal cards.
 */
const goalsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    goals: { type: [goalItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Goals', goalsSchema);
