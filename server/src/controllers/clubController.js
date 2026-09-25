import Club from '../models/Club.js';
import ClubMember from '../models/ClubMember.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { CLUB_TYPES, CLUB_MEMBER_ROLES, CLUB_MEMBER_STATUS } from '../config/constants.js';
import { trackActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { uploadFile } from '../services/uploadService.js';

/**
 * @route   POST /api/v1/clubs
 * @desc    Create a club (requires admin approval)
 */
export const createClub = asyncHandler(async (req, res) => {
  const { name, description, category, type, tags } = req.body;
  const collegeId = req.user.college._id || req.user.college;

  // Check for duplicate club name in the same college
  const existing = await Club.findOne({ name: { $regex: `^${name}$`, $options: 'i' }, college: collegeId });
  if (existing) {
    throw ApiError.conflict('A club with this name already exists');
  }

  const club = await Club.create({
    name,
    description,
    category,
    type: type || CLUB_TYPES.APPROVAL,
    tags: tags || [],
    college: collegeId,
    admin: req.user._id,
    isApproved: req.user.role === 'COLLEGE_ADMIN' || req.user.role === 'SUPER_ADMIN',
  });

  // Auto-add creator as admin member
  await ClubMember.create({
    club: club._id,
    user: req.user._id,
    role: CLUB_MEMBER_ROLES.ADMIN,
    status: CLUB_MEMBER_STATUS.ACTIVE,
  });

  ApiResponse.created(res, { club }, 'Club created successfully. Awaiting admin approval.');
});

/**
 * @route   GET /api/v1/clubs
 * @desc    List clubs
 */
export const getClubs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, q } = req.query;
  const collegeId = req.user.college._id || req.user.college;

  const query = { college: collegeId, isApproved: true, isActive: true };

  if (category) query.category = category;
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Club.countDocuments(query);

  const clubs = await Club.find(query)
    .populate('admin', 'name avatar')
    .sort({ membersCount: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Check user's membership status for each club
  const clubsWithMembership = await Promise.all(
    clubs.map(async (club) => {
      const membership = await ClubMember.findOne({ club: club._id, user: req.user._id });
      return {
        ...club.toObject(),
        isMember: membership?.status === CLUB_MEMBER_STATUS.ACTIVE,
        isPending: membership?.status === CLUB_MEMBER_STATUS.PENDING,
        memberRole: membership?.role,
      };
    })
  );

  ApiResponse.paginated(res, clubsWithMembership, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * @route   GET /api/v1/clubs/:id
 * @desc    Get club detail
 */
export const getClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id)
    .populate('admin', 'name avatar department');

  if (!club) {
    throw ApiError.notFound('Club not found');
  }

  // Get membership info
  const membership = await ClubMember.findOne({ club: club._id, user: req.user._id });

  // Get recent members
  const members = await ClubMember.find({ club: club._id, status: CLUB_MEMBER_STATUS.ACTIVE })
    .populate('user', 'name avatar department year')
    .sort({ createdAt: -1 })
    .limit(20);

  ApiResponse.success(res, {
    club,
    membership: membership || null,
    members: members.filter(m => m.user).map(m => ({ ...m.user.toObject(), role: m.role, joinedAt: m.createdAt })),
  });
});

/**
 * @route   POST /api/v1/clubs/:id/join
 * @desc    Join or request to join a club
 */
export const joinClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club || !club.isApproved) {
    throw ApiError.notFound('Club not found');
  }

  // Check if already a member
  const existing = await ClubMember.findOne({ club: club._id, user: req.user._id });
  if (existing) {
    if (existing.status === CLUB_MEMBER_STATUS.ACTIVE) {
      throw ApiError.conflict('You are already a member of this club');
    }
    if (existing.status === CLUB_MEMBER_STATUS.PENDING) {
      throw ApiError.conflict('Your membership request is pending');
    }
  }

  const isOpenClub = club.type === CLUB_TYPES.OPEN;
  const newStatus = isOpenClub ? CLUB_MEMBER_STATUS.ACTIVE : CLUB_MEMBER_STATUS.PENDING;

  let member;
  if (existing && existing.status === CLUB_MEMBER_STATUS.REJECTED) {
    existing.status = newStatus;
    member = await existing.save();
  } else {
    member = await ClubMember.create({
      club: club._id,
      user: req.user._id,
      role: CLUB_MEMBER_ROLES.MEMBER,
      status: newStatus,
    });
  }

  if (isOpenClub) {
    club.membersCount += 1;
    await club.save();

    // Track activity
    await trackActivity(req.user._id, club.college, 'CLUB_JOINED', { clubId: club._id });
  }

  // Notify club admin
  await createNotification({
    recipient: club.admin,
    sender: req.user._id,
    type: 'CLUB_JOIN_REQUEST',
    message: `${req.user.name} ${isOpenClub ? 'joined' : 'wants to join'} ${club.name}`,
    entityType: 'club',
    entityId: club._id,
  });

  ApiResponse.success(
    res,
    { member },
    isOpenClub ? 'Joined successfully!' : 'Membership request sent'
  );
});

/**
 * @route   POST /api/v1/clubs/:id/leave
 * @desc    Leave a club
 */
export const leaveClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');

  const membership = await ClubMember.findOne({ club: club._id, user: req.user._id });
  if (!membership) throw ApiError.badRequest('You are not a member of this club');

  // Admin cannot leave — must transfer admin first
  if (membership.role === CLUB_MEMBER_ROLES.ADMIN) {
    throw ApiError.badRequest('Club admin cannot leave. Transfer admin role first.');
  }

  await ClubMember.deleteOne({ _id: membership._id });

  if (membership.status === CLUB_MEMBER_STATUS.ACTIVE) {
    club.membersCount = Math.max(0, club.membersCount - 1);
    await club.save();
  }

  ApiResponse.success(res, null, 'Left the club');
});

/**
 * @route   PATCH /api/v1/clubs/:id/members/:userId
 * @desc    Approve or reject a membership request (club admin)
 */
export const manageMember = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'approve' or 'reject'
  const club = await Club.findById(req.params.id);

  if (!club) throw ApiError.notFound('Club not found');

  // Check if requester is club admin
  const adminMember = await ClubMember.findOne({
    club: club._id,
    user: req.user._id,
    role: CLUB_MEMBER_ROLES.ADMIN,
    status: CLUB_MEMBER_STATUS.ACTIVE,
  });

  if (!adminMember && req.user.role !== 'COLLEGE_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw ApiError.forbidden('Only club admins can manage members');
  }

  const membership = await ClubMember.findOne({ club: club._id, user: req.params.userId });
  if (!membership) throw ApiError.notFound('Membership request not found');

  if (action === 'approve') {
    membership.status = CLUB_MEMBER_STATUS.ACTIVE;
    await membership.save();

    club.membersCount += 1;
    await club.save();

    // Track activity for the approved user
    await trackActivity(req.params.userId, club.college, 'CLUB_JOINED', { clubId: club._id });

    // Notify the user
    await createNotification({
      recipient: req.params.userId,
      sender: req.user._id,
      type: 'CLUB_MEMBER_APPROVED',
      message: `Your request to join ${club.name} has been approved!`,
      entityType: 'club',
      entityId: club._id,
    });
  } else if (action === 'reject') {
    membership.status = CLUB_MEMBER_STATUS.REJECTED;
    await membership.save();
  } else if (action === 'remove') {
    if (membership.role === CLUB_MEMBER_ROLES.ADMIN) {
      throw ApiError.badRequest('Cannot remove a club admin');
    }
    const wasActive = membership.status === CLUB_MEMBER_STATUS.ACTIVE;
    await ClubMember.deleteOne({ _id: membership._id });
    
    if (wasActive) {
      club.membersCount = Math.max(0, club.membersCount - 1);
      await club.save();
    }
  } else if (action === 'promote') {
    membership.role = CLUB_MEMBER_ROLES.ADMIN;
    await membership.save();
  } else if (action === 'demote') {
    // Only allow demotion if they are not the original creator
    if (club.admin.toString() === req.params.userId) {
      throw ApiError.badRequest('Cannot demote the original club creator');
    }
    membership.role = CLUB_MEMBER_ROLES.MEMBER;
    await membership.save();
  }

  ApiResponse.success(res, null, `Member ${action}d successfully`);
});

/**
 * @route   GET /api/v1/clubs/:id/pending
 * @desc    Get pending membership requests (club admin)
 */
export const getPendingMembers = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');

  const pending = await ClubMember.find({
    club: club._id,
    status: CLUB_MEMBER_STATUS.PENDING,
  }).populate('user', 'name avatar department year skills');

  ApiResponse.success(res, { pending });
});

/**
 * @route   PUT /api/v1/clubs/:id
 * @desc    Update club (club admin)
 */
export const updateClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');

  // Verify club admin
  const adminMember = await ClubMember.findOne({
    club: club._id,
    user: req.user._id,
    role: CLUB_MEMBER_ROLES.ADMIN,
  });

  if (!adminMember && req.user.role !== 'COLLEGE_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw ApiError.forbidden('Only club admins can update the club');
  }

  const allowedFields = ['name', 'description', 'category', 'type', 'tags'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      club[field] = req.body[field];
    }
  }

  // Handle logo upload
  if (req.file) {
    club.logo = await uploadFile(req.file);
  }

  await club.save();

  ApiResponse.success(res, { club }, 'Club updated successfully');
});
