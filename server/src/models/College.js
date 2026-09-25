import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: [true, 'College code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    emailDomain: {
      type: String,
      required: [true, 'Email domain is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    settings: {
      registrationEnabled: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      allowClubCreation: { type: Boolean, default: true },
      maxClubsPerStudent: { type: Number, default: 5 },
    },
  },
  {
    timestamps: true,
  }
);

const College = mongoose.model('College', collegeSchema);

export default College;
