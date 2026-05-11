import mongoose from 'mongoose';

const BACKGROUNDS = [
  '#6C63FF', '#FF6584', '#43E6C5', '#FFB347',
  '#4FACFE', '#00C9FF', '#a18cd1', '#f093fb',
  '#f5576c', '#4facfe', '#43e97b', '#fa709a',
];

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    background: {
      type: String,
      default: () => BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    starred: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure owner is always in members
boardSchema.pre('save', function (next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

export default mongoose.model('Board', boardSchema);
