import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster querying by board
listSchema.index({ board: 1, position: 1 });

export default mongoose.model('List', listSchema);
