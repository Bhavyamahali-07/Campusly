import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never returned by default
    },
    securityQuestion: {
      type: String,
      required: true,
    },
    securityAnswer: {
      type: String,
      required: true,
      select: false, // Ensure it's not returned by default
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni', ''],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    activityPoints: {
      type: Number,
      default: 0,
    },
    weeklyPoints: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    profileCompletion: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: true, // Auto-verified in dev; set to false for prod with email verification
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ college: 1, role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ name: 'text', skills: 'text', department: 'text' });
userSchema.index({ activityPoints: -1 });
userSchema.index({ weeklyPoints: -1 });

// Hash password and security answer before save
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(12);
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  if (this.isModified('securityAnswer')) {
    // lowercase the answer before hashing for case-insensitive comparison
    const answer = this.securityAnswer.toLowerCase().trim();
    this.securityAnswer = await bcrypt.hash(answer, salt);
  }
  
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compare security answer method
userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  const answer = candidateAnswer.toLowerCase().trim();
  return bcrypt.compare(answer, this.securityAnswer);
};

// Calculate profile completion
userSchema.methods.calcProfileCompletion = function () {
  const fields = [
    { key: 'name', weight: 15 },
    { key: 'department', weight: 15 },
    { key: 'year', weight: 10 },
    { key: 'bio', weight: 15 },
    { key: 'skills', weight: 15, isArray: true },
    { key: 'interests', weight: 10, isArray: true },
    { key: 'avatar', weight: 10 },
    { key: 'socialLinks', weight: 10, isObject: true },
  ];

  let completion = 0;
  for (const field of fields) {
    if (field.isArray) {
      if (this[field.key]?.length > 0) completion += field.weight;
    } else if (field.isObject) {
      if (this[field.key] && Object.values(this[field.key].toObject?.() || this[field.key]).some(v => v)) {
        completion += field.weight;
      }
    } else {
      if (this[field.key]) completion += field.weight;
    }
  }

  return completion;
};

// Update profile completion before save
userSchema.pre('save', function (next) {
  this.profileCompletion = this.calcProfileCompletion();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
