import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title must be at most 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be at most 500 characters'],
    default: '',
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'done'],
      message: 'Status must be todo, in-progress, or done',
    },
    default: 'todo',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, title: 'text' });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
