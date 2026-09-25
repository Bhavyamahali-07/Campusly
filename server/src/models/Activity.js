import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ college: 1, createdAt: -1 });
activitySchema.index({ user: 1, type: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
