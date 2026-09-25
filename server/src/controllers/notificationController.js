import Notification from '../models/Notification.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user's notifications
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { recipient: req.user._id };
  const total = await Notification.countDocuments(query);

  const notifications = await Notification.find(query)
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  ApiResponse.paginated(
    res,
    { notifications, unreadCount },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    }
  );
});

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a notification as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  ApiResponse.success(res, null, 'Marked as read');
});

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  ApiResponse.success(res, null, 'All notifications marked as read');
});

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  ApiResponse.success(res, null, 'Notification deleted');
});
