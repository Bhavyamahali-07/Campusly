// User roles
export const ROLES = {
  STUDENT: 'STUDENT',
  CLUB_ADMIN: 'CLUB_ADMIN',
  COLLEGE_ADMIN: 'COLLEGE_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

// Post categories
export const POST_CATEGORIES = {
  GENERAL: 'GENERAL',
  ACHIEVEMENT: 'ACHIEVEMENT',
  PROJECT: 'PROJECT',
  TALENT: 'TALENT',
  QUESTION: 'QUESTION',
  OPPORTUNITY: 'OPPORTUNITY',
  CLUB: 'CLUB',
  EVENT: 'EVENT',
};

// Club types
export const CLUB_TYPES = {
  OPEN: 'OPEN',
  APPROVAL: 'APPROVAL',
};

// Club member roles
export const CLUB_MEMBER_ROLES = {
  MEMBER: 'MEMBER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
};

// Club member status
export const CLUB_MEMBER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
};

// Event status
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Project status
export const PROJECT_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Application status
export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

// Announcement categories
export const ANNOUNCEMENT_CATEGORIES = {
  IMPORTANT: 'IMPORTANT',
  GENERAL: 'GENERAL',
  EXAM: 'EXAM',
  HOLIDAY: 'HOLIDAY',
  PLACEMENT: 'PLACEMENT',
  WORKSHOP: 'WORKSHOP',
  SCHOLARSHIP: 'SCHOLARSHIP',
  COMPETITION: 'COMPETITION',
  DEADLINE: 'DEADLINE',
};

// Announcement priority
export const ANNOUNCEMENT_PRIORITY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

// Activity types with point values
export const ACTIVITY_TYPES = {
  POST_CREATED: { type: 'POST_CREATED', points: 5 },
  POST_LIKED: { type: 'POST_LIKED', points: 1 },
  COMMENT_CREATED: { type: 'COMMENT_CREATED', points: 3 },
  CLUB_JOINED: { type: 'CLUB_JOINED', points: 10 },
  EVENT_REGISTERED: { type: 'EVENT_REGISTERED', points: 10 },
  EVENT_ATTENDED: { type: 'EVENT_ATTENDED', points: 20 },
  PROJECT_CREATED: { type: 'PROJECT_CREATED', points: 25 },
  PROJECT_JOINED: { type: 'PROJECT_JOINED', points: 15 },
  CONTEST_PARTICIPATED: { type: 'CONTEST_PARTICIPATED', points: 30 },
  ACHIEVEMENT_EARNED: { type: 'ACHIEVEMENT_EARNED', points: 50 },
};

// Notification types
export const NOTIFICATION_TYPES = {
  LIKE: 'LIKE',
  COMMENT: 'COMMENT',
  CLUB_APPROVAL: 'CLUB_APPROVAL',
  CLUB_JOIN_REQUEST: 'CLUB_JOIN_REQUEST',
  CLUB_MEMBER_APPROVED: 'CLUB_MEMBER_APPROVED',
  EVENT_REGISTRATION: 'EVENT_REGISTRATION',
  PROJECT_APPLICATION: 'PROJECT_APPLICATION',
  PROJECT_ACCEPTED: 'PROJECT_ACCEPTED',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  BADGE_EARNED: 'BADGE_EARNED',
  LEADERBOARD: 'LEADERBOARD',
};

// Report types
export const REPORT_TYPES = {
  POST: 'POST',
  COMMENT: 'COMMENT',
  USER: 'USER',
};

// Report status
export const REPORT_STATUS = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  DISMISSED: 'DISMISSED',
  ACTION_TAKEN: 'ACTION_TAKEN',
};

// Anti-gaming limits
export const LIMITS = {
  MAX_DAILY_SOCIAL_XP: 100,
  MAX_POSTS_PER_DAY: 10,
  MAX_LIKES_PER_HOUR: 30,
  MAX_COMMENTS_PER_HOUR: 20,
  LIKE_COOLDOWN_SECONDS: 2,
};

// Badge definitions
export const BADGE_DEFINITIONS = [
  { id: 'active_student', name: '🔥 Active Student', description: 'Active for 7 consecutive days', icon: '🔥' },
  { id: 'collaborator', name: '🤝 Collaborator', description: 'Joined 3 projects', icon: '🤝' },
  { id: 'competition_winner', name: '🏆 Competition Winner', description: 'Won a competition', icon: '🏆' },
  { id: 'event_champion', name: '🎯 Event Champion', description: 'Attended 10 events', icon: '🎯' },
  { id: 'innovator', name: '💡 Innovator', description: 'Created 5 projects', icon: '💡' },
  { id: 'creative_talent', name: '🎨 Creative Talent', description: 'Posted 10 talent showcases', icon: '🎨' },
  { id: 'tech_contributor', name: '💻 Tech Contributor', description: 'Made 50 posts', icon: '💻' },
  { id: 'club_leader', name: '🏛 Club Leader', description: 'Admin of a club with 50+ members', icon: '🏛' },
];
