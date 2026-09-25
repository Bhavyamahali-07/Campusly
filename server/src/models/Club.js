import mongoose from 'mongoose';
import { CLUB_TYPES } from '../config/constants.js';

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Club description is required'],
      maxlength: 2000,
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CLUB_TYPES),
      default: CLUB_TYPES.APPROVAL,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    membersCount: {
      type: Number,
      default: 1,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
clubSchema.index({ college: 1, isApproved: 1 });
clubSchema.index({ category: 1 });
clubSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Club = mongoose.model('Club', clubSchema);

export default Club;
