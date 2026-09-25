import User from '../models/User.js';
import Post from '../models/Post.js';
import Club from '../models/Club.js';
import ClubMember from '../models/ClubMember.js';
import Event from '../models/Event.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import Announcement from '../models/Announcement.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { CLUB_MEMBER_STATUS, CLUB_MEMBER_ROLES } from '../config/constants.js';
import { trackActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Admin dashboard stats
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const collegeId = req.user.college._id || req.user.college;

  const [totalStudents, activeStudents, totalClubs, totalEvents, totalPosts, pendingReports, pendingClubs] =
    await Promise.all([
      User.countDocuments({ college: collegeId }),
      User.countDocuments({ college: collegeId, lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Club.countDocuments({ college: collegeId, isApproved: true }),
      Event.countDocuments({ college: collegeId }),
      Post.countDocuments({ college: collegeId, isDeleted: false }),
      Report.countDocuments({ status: 'PENDING' }),
      Club.countDocuments({ college: collegeId, isApproved: false }),
    ]);

  ApiResponse.success(res, {
    stats: {
      totalStudents,
      activeStudents,
      totalClubs,
      totalEvents,
      totalPosts,
      pendingReports,
      pendingClubs,
    },
  });
});

/**
 * @route   GET /api/v1/admin/students
 * @desc    List students (admin)
 */
export const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q, role, department } = req.query;
  const collegeId = req.user.college._id || req.user.college;

  const query = { college: collegeId };
  if (q) query.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
  if (role) query.role = role;
  if (department) query.department = department;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);

  const students = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, students, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * @route   PATCH /api/v1/admin/students/:id
 * @desc    Update student (role, suspend, etc.)
 */
export const updateStudent = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const update = {};

  if (role) update.role = role;
  if (isActive !== undefined) update.isActive = isActive;

  const student = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!student) throw ApiError.notFound('Student not found');

  ApiResponse.success(res, { student }, 'Student updated');
});

/**
 * @route   PATCH /api/v1/admin/clubs/:id/approve
 * @desc    Approve a club
 */
export const approveClub = asyncHandler(async (req, res) => {
  const club = await Club.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!club) throw ApiError.notFound('Club not found');

  ApiResponse.success(res, { club }, 'Club approved');
});

/**
 * @route   GET /api/v1/admin/reports
 * @desc    Get reports
 */
export const getReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Report.countDocuments(query);

  const reports = await Report.find(query)
    .populate('reporter', 'name avatar')
    .populate('resolvedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, reports, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * @route   PATCH /api/v1/admin/reports/:id
 * @desc    Resolve a report
 */
export const resolveReport = asyncHandler(async (req, res) => {
  const { status, resolution } = req.body;

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolution, resolvedBy: req.user._id },
    { new: true }
  );

  if (!report) throw ApiError.notFound('Report not found');

  // If action taken, handle the target
  if (status === 'ACTION_TAKEN' && report.targetType === 'POST') {
    await Post.findByIdAndUpdate(report.targetId, { isDeleted: true });
  }

  ApiResponse.success(res, { report }, 'Report resolved');
});

/**
 * @route   POST /api/v1/admin/announcements
 * @desc    Create an announcement
 */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const collegeId = req.user.college._id || req.user.college;

  const announcement = await Announcement.create({
    ...req.body,
    college: collegeId,
    author: req.user._id,
  });

  ApiResponse.created(res, { announcement }, 'Announcement published');
});

/**
 * @route   GET /api/v1/announcements
 * @desc    Get active announcements
 */
export const getAnnouncements = asyncHandler(async (req, res) => {
  const collegeId = req.user.college._id || req.user.college;

  const announcements = await Announcement.find({
    college: collegeId,
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  })
    .populate('author', 'name avatar')
    .sort({ priority: -1, createdAt: -1 })
    .limit(20);

  ApiResponse.success(res, { announcements });
});

/**
 * @route   GET /api/v1/admin/pending-clubs
 * @desc    Get clubs pending approval
 */
export const getPendingClubs = asyncHandler(async (req, res) => {
  const collegeId = req.user.college._id || req.user.college;

  const clubs = await Club.find({ college: collegeId, isApproved: false })
    .populate('admin', 'name avatar department')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, { clubs });
});

/**
 * @route   GET /api/v1/admin/notifications
 * @desc    Get admin notifications (especially club join requests) with full details
 */
export const getAdminNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, type } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { recipient: req.user._id };
  if (type) query.type = type;

  const total = await Notification.countDocuments(query);

  const notifications = await Notification.find(query)
    .populate('sender', 'name avatar department year email skills')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  // For join request notifications, also look up the current membership status
  const enrichedNotifications = await Promise.all(
    notifications.map(async (n) => {
      const notifObj = n.toObject();
      if (n.type === 'CLUB_JOIN_REQUEST' && n.data?.entityId && n.sender) {
        const membership = await ClubMember.findOne({
          club: n.data.entityId,
          user: n.sender._id,
        });
        const club = await Club.findById(n.data.entityId).select('name logo category');
        notifObj.membershipStatus = membership?.status || null;
        notifObj.clubDetails = club || null;
      }
      return notifObj;
    })
  );

  ApiResponse.paginated(
    res,
    { notifications: enrichedNotifications, unreadCount },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    }
  );
});

/**
 * @route   PATCH /api/v1/admin/join-requests/:clubId/:userId
 * @desc    Accept or reject a club join request from admin notifications
 */
export const handleJoinRequest = asyncHandler(async (req, res) => {
  const { clubId, userId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    throw ApiError.badRequest('Action must be "approve" or "reject"');
  }

  const club = await Club.findById(clubId);
  if (!club) throw ApiError.notFound('Club not found');

  const membership = await ClubMember.findOne({ club: clubId, user: userId });
  if (!membership) throw ApiError.notFound('Membership request not found');

  if (membership.status !== CLUB_MEMBER_STATUS.PENDING) {
    throw ApiError.badRequest(`Request already ${membership.status.toLowerCase()}`);
  }

  if (action === 'approve') {
    membership.status = CLUB_MEMBER_STATUS.ACTIVE;
    await membership.save();

    club.membersCount += 1;
    await club.save();

    await trackActivity(userId, club.college, 'CLUB_JOINED', { clubId: club._id });

    await createNotification({
      recipient: userId,
      sender: req.user._id,
      type: 'CLUB_MEMBER_APPROVED',
      message: `Your request to join ${club.name} has been approved!`,
      entityType: 'club',
      entityId: club._id,
    });
  } else {
    membership.status = CLUB_MEMBER_STATUS.REJECTED;
    await membership.save();

    await createNotification({
      recipient: userId,
      sender: req.user._id,
      type: 'CLUB_MEMBER_APPROVED',
      message: `Your request to join ${club.name} has been declined.`,
      entityType: 'club',
      entityId: club._id,
    });
  }

  ApiResponse.success(res, { status: membership.status }, `Request ${action}d successfully`);
});

/**
 * @route   GET /api/v1/admin/clubs/:id/members
 * @desc    Get all members of a club with filters (for admin manage view)
 */
export const getClubMembers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, q, year, department, role, status } = req.query;
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');

  // Build membership query
  const memberQuery = {
    club: club._id,
    status: status || CLUB_MEMBER_STATUS.ACTIVE,
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get all matching club memberships first
  let memberships = await ClubMember.find(memberQuery)
    .populate('user', 'name avatar department year email skills')
    .sort({ createdAt: -1 });

  // Apply user-level filters on the populated data
  let filtered = memberships.filter((m) => {
    if (!m.user) return false;
    const matchSearch = q
      ? m.user.name.toLowerCase().includes(q.toLowerCase()) ||
        m.user.email?.toLowerCase().includes(q.toLowerCase())
      : true;
    const matchYear = year ? m.user.year === year : true;
    const matchDept = department ? m.user.department === department : true;
    const matchRole = role ? m.role === role : true;
    return matchSearch && matchYear && matchDept && matchRole;
  });

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + parseInt(limit));

  // Extract unique filter options
  const allMembers = memberships.filter((m) => m.user);
  const uniqueYears = [...new Set(allMembers.map((m) => m.user.year).filter(Boolean))];
  const uniqueDepartments = [...new Set(allMembers.map((m) => m.user.department).filter(Boolean))];

  const result = paginated.map((m) => ({
    ...m.user.toObject(),
    role: m.role,
    membershipStatus: m.status,
    joinedAt: m.createdAt,
    membershipId: m._id,
  }));

  ApiResponse.paginated(
    res,
    {
      members: result,
      club: { _id: club._id, name: club.name, logo: club.logo, category: club.category, membersCount: club.membersCount },
      filterOptions: { years: uniqueYears, departments: uniqueDepartments },
    },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    }
  );
});

/**
 * @route   GET /api/v1/admin/clubs/:id/pending-requests
 * @desc    Get pending join requests for a specific club
 */
export const getClubPendingRequests = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');

  const pending = await ClubMember.find({
    club: club._id,
    status: CLUB_MEMBER_STATUS.PENDING,
  })
    .populate('user', 'name avatar department year email skills')
    .sort({ createdAt: -1 });

  const result = pending.map((m) => ({
    ...m.user.toObject(),
    role: m.role,
    membershipStatus: m.status,
    requestedAt: m.createdAt,
    membershipId: m._id,
  }));

  ApiResponse.success(res, { requests: result, club: { _id: club._id, name: club.name } });
});
