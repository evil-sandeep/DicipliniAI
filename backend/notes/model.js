import mongoose from 'mongoose';

/**
 * singleNoteSchema
 * Represents one individual note (title + content).
 * Mongoose adds `_id`, `createdAt`, `updatedAt` automatically.
 */
const singleNoteSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled Note' },
    content: { type: String, default: '' },
    lastEditedDate: { type: String, default: '' }, // YYYY-MM-DD of last edit, for diary date stamps
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
