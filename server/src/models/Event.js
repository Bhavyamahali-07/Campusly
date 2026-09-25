import mongoose from 'mongoose';
import { EVENT_STATUS } from '../config/constants.js';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: 5000,
    },
    poster: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    time: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
    },
    registrationDeadline: {
      type: Date,
    },
    maxParticipants: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    registrationCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.UPCOMING,
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
eventSchema.index({ college: 1, date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ club: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Event = mongoose.model('Event', eventSchema);

export default Event;
