import User from '../models/User.js';
import Post from '../models/Post.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';
import Report from '../models/Report.js';
import Announcement from '../models/Announcement.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

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
