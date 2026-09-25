import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { ACTIVITY_TYPES, LIMITS } from '../config/constants.js';

/**
 * Track a user activity and award XP points.
 * Enforces anti-gaming daily caps.
 */
export const trackActivity = async (userId, collegeId, activityType, metadata = {}) => {
  const activityDef = ACTIVITY_TYPES[activityType];
  if (!activityDef) return null;

  // Anti-gaming: Check daily social XP cap
  const socialActions = ['POST_CREATED', 'POST_LIKED', 'COMMENT_CREATED'];
  if (socialActions.includes(activityType)) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayPoints = await Activity.aggregate([
      {
        $match: {
          user: userId,
          type: { $in: socialActions },
          createdAt: { $gte: todayStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);

    const currentDailyPoints = todayPoints[0]?.total || 0;
    if (currentDailyPoints >= LIMITS.MAX_DAILY_SOCIAL_XP) {
      return null; // Cap reached, no more social XP today
    }
  }

  // Create the activity record
  const activity = await Activity.create({
    user: userId,
    college: collegeId,
    type: activityDef.type,
    points: activityDef.points,
    metadata,
  });

  // Update user's total and weekly points
  await User.findByIdAndUpdate(userId, {
    $inc: {
      activityPoints: activityDef.points,
      weeklyPoints: activityDef.points,
    },
    lastActive: new Date(),
  });

  return activity;
};

/**
 * Reset weekly points for all users (run via cron or manually)
 */
export const resetWeeklyPoints = async () => {
  await User.updateMany({}, { weeklyPoints: 0 });
};
