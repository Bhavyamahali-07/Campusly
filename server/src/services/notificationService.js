import Notification from '../models/Notification.js';

/**
 * Create a notification for a user.
 */
export const createNotification = async ({ recipient, sender, type, message, entityType, entityId }) => {
  // Don't notify yourself
  if (recipient.toString() === sender?.toString()) return null;

  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      data: entityType ? { entityType, entityId } : undefined,
    });

    return notification;
  } catch (error) {
    // Log but don't fail the main operation
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

/**
 * Get unread notification count for a user.
 */
export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};
