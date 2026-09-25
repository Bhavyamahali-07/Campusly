import DiscussionMessage from '../models/DiscussionMessage.js';
import Club from '../models/Club.js';
import ClubMember from '../models/ClubMember.js';

export const getClubMessages = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const membership = await ClubMember.findOne({ club: clubId, user: req.user._id, status: 'ACTIVE' });
    if (!membership && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'COLLEGE_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only club members can view discussions' });
    }

    const messages = await DiscussionMessage.find({ club: clubId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name avatar department');

    const total = await DiscussionMessage.countDocuments({ club: clubId });

    res.json({
      success: true,
      data: messages.reverse(), // Send in chronological order
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    next(error);
  }
};

export const postClubMessage = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { content, image } = req.body;

    if (!content?.trim() && !image) {
      return res.status(400).json({ success: false, message: 'Message content or image is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const membership = await ClubMember.findOne({ club: clubId, user: req.user._id, status: 'ACTIVE' });
    if (!membership && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'COLLEGE_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only club members can post discussions' });
    }

    const message = await DiscussionMessage.create({
      club: clubId,
      user: req.user._id,
      content: content?.trim() || '',
      image: image || '',
    });

    await message.populate('user', 'name avatar department');

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const deleteClubMessage = async (req, res, next) => {
  try {
    const { clubId, messageId } = req.params;
    
    const message = await DiscussionMessage.findOne({ _id: messageId, club: clubId });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const membership = await ClubMember.findOne({ club: clubId, user: req.user._id, status: 'ACTIVE' });
    const isClubAdmin = membership?.role === 'ADMIN';
    const isSystemAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'COLLEGE_ADMIN';
    const isSender = message.user.toString() === req.user._id.toString();

    if (!isSender && !isClubAdmin && !isSystemAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    message.content = 'This message was deleted';
    message.image = '';
    message.isDeleted = true;
    await message.save();

    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};
