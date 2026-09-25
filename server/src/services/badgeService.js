import Badge from '../models/Badge.js';
import Activity from '../models/Activity.js';
import Post from '../models/Post.js';
import EventRegistration from '../models/EventRegistration.js';
import ClubMember from '../models/ClubMember.js';
import User from '../models/User.js';
import { BADGE_DEFINITIONS } from '../config/constants.js';
import { createNotification } from './notificationService.js';

/**
 * Check and award badges based on user activity.
 * Called after significant actions.
 */
export const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  for (const badge of BADGE_DEFINITIONS) {
    // Skip if user already has this badge
    if (user.badges.includes(badge.id)) continue;

    const earned = await checkBadgeRule(userId, badge.id);
    if (earned) {
      await Badge.create({
        user: userId,
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { badges: badge.id },
      });

      await createNotification({
        recipient: userId,
        type: 'BADGE_EARNED',
        message: `You earned the ${badge.name} badge! ${badge.description}`,
        entityType: 'badge',
        entityId: userId,
      });
    }
  }
};

/**
 * Check if a specific badge rule is satisfied.
 */
const checkBadgeRule = async (userId, badgeId) => {
  switch (badgeId) {
    case 'tech_contributor': {
      const postCount = await Post.countDocuments({ author: userId, isDeleted: false });
      return postCount >= 50;
    }
    case 'creative_talent': {
      const talentPosts = await Post.countDocuments({ author: userId, category: 'TALENT', isDeleted: false });
      return talentPosts >= 10;
    }
    case 'event_champion': {
      const attended = await EventRegistration.countDocuments({ user: userId, status: 'ATTENDED' });
      return attended >= 10;
    }
    case 'active_student': {
      // Check for 7 consecutive days of activity
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activities = await Activity.aggregate([
        { $match: { user: userId, createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
      ]);
      return activities.length >= 7;
    }
    case 'club_leader': {
      const adminClubs = await ClubMember.find({ user: userId, role: 'ADMIN', status: 'ACTIVE' }).populate('club');
      return adminClubs.some(m => m.club?.membersCount >= 50);
    }
    default:
      return false;
  }
};
