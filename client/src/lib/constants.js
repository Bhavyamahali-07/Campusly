// Post categories with labels and colors
export const POST_CATEGORIES = [
  { value: 'GENERAL', label: 'General', color: 'bg-surface-600' },
  { value: 'ACHIEVEMENT', label: '🏆 Achievement', color: 'bg-warning-500' },
  { value: 'PROJECT', label: '💻 Project', color: 'bg-primary-500' },
  { value: 'TALENT', label: '🎨 Talent', color: 'bg-accent-500' },
  { value: 'QUESTION', label: '❓ Question', color: 'bg-danger-500' },
  { value: 'OPPORTUNITY', label: '🚀 Opportunity', color: 'bg-success-500' },
  { value: 'CLUB', label: '🏛 Club', color: 'bg-primary-700' },
  { value: 'EVENT', label: '📅 Event', color: 'bg-accent-700' },
];

// Event status colors
export const EVENT_STATUS_COLORS = {
  DRAFT: 'text-surface-400',
  UPCOMING: 'text-accent-400',
  ONGOING: 'text-success-400',
  COMPLETED: 'text-surface-500',
  CANCELLED: 'text-danger-400',
};

// Badge icons
export const BADGE_ICONS = {
  active_student: '🔥',
  collaborator: '🤝',
  competition_winner: '🏆',
  event_champion: '🎯',
  innovator: '💡',
  creative_talent: '🎨',
  tech_contributor: '💻',
  club_leader: '🏛',
};

// Navigation items
export const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: 'Home' },
  { path: '/discover', label: 'Discover', icon: 'Compass' },
  { path: '/clubs', label: 'Clubs', icon: 'Users' },
  { path: '/events', label: 'Events', icon: 'Calendar' },
  { path: '/discussions', label: 'Discussions', icon: 'MessageSquare' },
  { path: '/leaderboard', label: 'Leaderboard', icon: 'Trophy' },
];

// Admin nav items
export const ADMIN_NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/students', label: 'Students', icon: 'GraduationCap' },
  { path: '/admin/clubs', label: 'Clubs', icon: 'Users' },
  { path: '/admin/events', label: 'Events', icon: 'Calendar' },
  { path: '/admin/reports', label: 'Reports', icon: 'Flag' },
];
