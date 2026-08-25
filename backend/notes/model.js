import mongoose from 'mongoose';

/**
 * Note Schema
 * Each user gets one Notes document (upsert pattern).
 * The `content` field stores the full notepad text.
 */
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one notepad per user
    },
    content: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
