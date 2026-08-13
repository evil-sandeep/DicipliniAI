import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  iconName: { type: String },
  color: { type: String }
}, { _id: false });

const trackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  columns: [columnSchema],
  checked: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, { timestamps: true });

export default mongoose.model('Tracker', trackerSchema);
