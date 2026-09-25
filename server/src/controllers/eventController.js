import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { trackActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { uploadFile } from '../services/uploadService.js';

/**
 * @route   POST /api/v1/events
 * @desc    Create an event
 */
export const createEvent = asyncHandler(async (req, res) => {
  const collegeId = req.user.college._id || req.user.college;
  const eventData = {
    ...req.body,
    organizer: req.user._id,
    college: collegeId,
  };

  if (req.file) {
    eventData.poster = await uploadFile(req.file);
  }

  const event = await Event.create(eventData);
  await event.populate('organizer', 'name avatar');

  ApiResponse.created(res, { event }, 'Event created successfully');
});

/**
 * @route   GET /api/v1/events
 * @desc    List events
 */
export const getEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, club, upcoming } = req.query;
  const collegeId = req.user.college._id || req.user.college;

  const query = { college: collegeId };

  if (status) {
    query.status = status;
  } else if (upcoming === 'true') {
    query.date = { $gte: new Date() };
    query.status = { $in: ['UPCOMING', 'ONGOING'] };
  }

  if (club) query.club = club;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Event.countDocuments(query);

  const events = await Event.find(query)
    .populate('organizer', 'name avatar')
    .populate('club', 'name logo')
    .sort({ date: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Check registration status for current user
  const eventsWithRegistration = await Promise.all(
    events.map(async (event) => {
      const registration = await EventRegistration.findOne({
        event: event._id,
        user: req.user._id,
      });
      return {
        ...event.toObject(),
        isRegistered: !!registration,
        registrationStatus: registration?.status,
      };
    })
  );

  ApiResponse.paginated(res, eventsWithRegistration, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event detail
 */
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name avatar department')
    .populate('club', 'name logo');

  if (!event) throw ApiError.notFound('Event not found');

  const registration = await EventRegistration.findOne({
    event: event._id,
    user: req.user._id,
  });

  // Get attendees
  const attendees = await EventRegistration.find({ event: event._id, status: { $ne: 'CANCELLED' } })
    .populate('user', 'name avatar')
    .limit(50);

  ApiResponse.success(res, {
    event,
    isRegistered: !!registration,
    registrationStatus: registration?.status,
    attendees: attendees.map(a => a.user),
  });
});

/**
 * @route   POST /api/v1/events/:id/register
 * @desc    Register for an event
 */
export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) throw ApiError.notFound('Event not found');

  if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
    throw ApiError.badRequest('This event is no longer accepting registrations');
  }

  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
    throw ApiError.badRequest('Registration deadline has passed');
  }

  if (event.maxParticipants > 0 && event.registrationCount >= event.maxParticipants) {
    throw ApiError.badRequest('Event is full');
  }

  // Check for existing registration
  const existing = await EventRegistration.findOne({ event: event._id, user: req.user._id });
  if (existing) {
    if (existing.status === 'CANCELLED') {
      existing.status = 'REGISTERED';
      await existing.save();
    } else {
      throw ApiError.conflict('You are already registered for this event');
    }
  } else {
    await EventRegistration.create({
      event: event._id,
      user: req.user._id,
    });
  }

  event.registrationCount += 1;
  await event.save();

  // Track activity
  await trackActivity(req.user._id, event.college, 'EVENT_REGISTERED', { eventId: event._id });

  // Notify organizer
  await createNotification({
    recipient: event.organizer,
    sender: req.user._id,
    type: 'EVENT_REGISTRATION',
    message: `${req.user.name} registered for ${event.title}`,
    entityType: 'event',
    entityId: event._id,
  });

  ApiResponse.success(res, null, 'Registered successfully');
});

/**
 * @route   DELETE /api/v1/events/:id/register
 * @desc    Cancel event registration
 */
export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await EventRegistration.findOne({
    event: req.params.id,
    user: req.user._id,
  });

  if (!registration) throw ApiError.notFound('Registration not found');

  registration.status = 'CANCELLED';
  await registration.save();

  await Event.findByIdAndUpdate(req.params.id, { $inc: { registrationCount: -1 } });

  ApiResponse.success(res, null, 'Registration cancelled');
});

/**
 * @route   PATCH /api/v1/events/:id
 * @desc    Update event
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');

  // Only organizer or admin can update
  if (event.organizer.toString() !== req.user._id.toString()
    && req.user.role !== 'COLLEGE_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw ApiError.forbidden('Only the organizer can update this event');
  }

  const allowedFields = ['title', 'description', 'date', 'time', 'location', 'status', 'maxParticipants', 'tags', 'isOnline', 'meetingLink'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
    }
  }

  if (req.file) {
    event.poster = await uploadFile(req.file);
  }

  await event.save();

  ApiResponse.success(res, { event }, 'Event updated');
});
