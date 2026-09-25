import mongoose from 'mongoose';
import { POST_CATEGORIES } from '../config/constants.js';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: 5000,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: Object.values(POST_CATEGORIES),
      default: POST_CATEGORIES.GENERAL,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ college: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ club: 1, createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ content: 'text' });

const Post = mongoose.model('Post', postSchema);

export default Post;
