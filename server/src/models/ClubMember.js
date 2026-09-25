import mongoose from 'mongoose';
import { CLUB_MEMBER_ROLES, CLUB_MEMBER_STATUS } from '../config/constants.js';

const clubMemberSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(CLUB_MEMBER_ROLES),
      default: CLUB_MEMBER_ROLES.MEMBER,
    },
    status: {
      type: String,
      enum: Object.values(CLUB_MEMBER_STATUS),
      default: CLUB_MEMBER_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate memberships
clubMemberSchema.index({ club: 1, user: 1 }, { unique: true });
clubMemberSchema.index({ club: 1, status: 1 });
clubMemberSchema.index({ user: 1, status: 1 });

const ClubMember = mongoose.model('ClubMember', clubMemberSchema);

export default ClubMember;
