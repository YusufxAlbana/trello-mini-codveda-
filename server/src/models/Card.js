import mongoose from 'mongoose';

const labelSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  color: { type: String, default: '#6C63FF' },
});

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
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
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    labels: [labelSchema],
    completed: {
      type: Boolean,
      default: false,
    },
    coverColor: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster querying
cardSchema.index({ list: 1, position: 1 });
cardSchema.index({ board: 1 });

export default mongoose.model('Card', cardSchema);
