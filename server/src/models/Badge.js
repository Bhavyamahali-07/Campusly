import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badgeId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate badges
badgeSchema.index({ user: 1, badgeId: 1 }, { unique: true });

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
