import mongoose from 'mongoose';

/**
 * singleNoteSchema
 * Represents one individual note (title + content).
 * Mongoose adds `_id`, `createdAt`, `updatedAt` automatically.
 */
const noteBlockSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },   // 'YYYY-MM-DD'
    text: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    editedAt: { type: Date, default: null },
  },
  { _id: false }
);

const singleNoteSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled Note' },
    content: { type: String, default: '' },   // kept for backward compat
    blocks: { type: [noteBlockSchema], default: [] }, // timestamped day blocks
  },
  { timestamps: true }
);

/**
 * noteSchema
 * One document per user — contains an array of their notes.
 */
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notes: { type: [singleNoteSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
