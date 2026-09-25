import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Users, Calendar, FolderKanban, Trophy, Megaphone, Check, CheckCheck, X, UserCheck, UserX, Eye, Filter, ChevronDown, Shield } from 'lucide-react';
import api from '../lib/axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { getImageUrl } from '../lib/axios';

const iconMap = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  CLUB_APPROVAL: Users,
  CLUB_JOIN_REQUEST: Users,
  CLUB_MEMBER_APPROVED: Users,
  EVENT_REGISTRATION: Calendar,
  PROJECT_APPLICATION: FolderKanban,
  PROJECT_ACCEPTED: FolderKanban,
  ANNOUNCEMENT: Megaphone,
  BADGE_EARNED: Trophy,
  LEADERBOARD: Trophy,
};

const colorMap = {
  LIKE: 'text-red-600 bg-red-50',
  COMMENT: 'text-purple-600 bg-purple-50',
  CLUB_APPROVAL: 'text-blue-600 bg-blue-50',
  CLUB_JOIN_REQUEST: 'text-amber-600 bg-amber-50',
  CLUB_MEMBER_APPROVED: 'text-green-600 bg-green-50',
  EVENT_REGISTRATION: 'text-purple-600 bg-purple-50',
  PROJECT_APPLICATION: 'text-orange-600 bg-orange-50',
  PROJECT_ACCEPTED: 'text-green-600 bg-green-50',
  ANNOUNCEMENT: 'text-orange-600 bg-orange-50',
  BADGE_EARNED: 'text-orange-600 bg-orange-50',
  LEADERBOARD: 'text-orange-600 bg-orange-50',
};

const filterTabs = [
  { value: 'all', label: 'All' },
  { value: 'CLUB_JOIN_REQUEST', label: 'Join Requests' },
  { value: 'CLUB_APPROVAL', label: 'Club Approvals' },
  { value: 'LIKE', label: 'Likes' },
  { value: 'COMMENT', label: 'Comments' },
];

function StudentProfileModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-12">
          {student.avatar ? (
            <img
              src={getImageUrl(student.avatar)}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg">
              {student.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 pt-4 text-center">
          <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{student.email}</p>

          <div className="flex items-center justify-center gap-3 mt-4">
            {student.department && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                {student.department}
              </span>
            )}
            {student.year && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                {student.year}
              </span>
            )}
          </div>

          {student.skills?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {student.skills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              to={`/profile/${student._id}`}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
            >
              View Full Profile
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [profileStudent, setProfileStudent] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  const isAdmin = user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let res;
        if (isAdmin) {
          const params = new URLSearchParams({ limit: '50' });
          if (activeFilter !== 'all') params.append('type', activeFilter);
          res = await api.get(`/admin/notifications?${params}`);
        } else {
          res = await api.get('/notifications?limit=50');
        }
        setNotifications(res.data?.notifications || []);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchNotifications();
  }, [activeFilter, isAdmin]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleJoinRequestAction = async (clubId, studentId, action, notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const key = `${notificationId}-${action}`;
    if (processingIds.has(key)) return;

    setProcessingIds(prev => new Set(prev).add(key));
    try {
      if (isAdmin) {
        await api.patch(`/admin/join-requests/${clubId}/${studentId}`, { action });
      } else {
        await api.patch(`/clubs/${clubId}/members/${studentId}`, { action });
      }
      toast.success(`Request ${action === 'approve' ? 'accepted' : 'rejected'} successfully`);

      setNotifications(notifications.map(n =>
        n._id === notificationId
          ? {
              ...n,
              isRead: true,
              membershipStatus: action === 'approve' ? 'ACTIVE' : 'REJECTED',
              _actionTaken: action,
            }
          : n
      ));
    } catch (err) {
      toast.error(err.message || `Failed to ${action} request`);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleViewProfile = (sender, e) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileStudent(sender);
  };

  const isJoinRequestActionable = (n) => {
    if (n.type !== 'CLUB_JOIN_REQUEST') return false;
    if (!n.sender || !n.data?.entityId) return false;
    if (n._actionTaken) return false;
    // For admin enriched notifications, check membershipStatus
    if (n.membershipStatus && n.membershipStatus !== 'PENDING') return false;
    // For basic notifications, check message
    if (!n.membershipStatus && !n.message.includes('wants to join')) return false;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900">Notifications</h1>
            {isAdmin && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin View — manage join requests
              </p>
            )}
          </div>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs (admin only) */}
      {isAdmin && (
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto hide-scrollbar pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.value
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-3 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-2.5 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeFilter !== 'all' ? 'Try changing the filter' : 'You\'re all caught up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            const color = colorMap[n.type] || 'text-gray-500 bg-gray-100';
            const actionable = isJoinRequestActionable(n);
            const wasApproved = n._actionTaken === 'approve' || n.membershipStatus === 'ACTIVE';
            const wasRejected = n._actionTaken === 'reject' || n.membershipStatus === 'REJECTED';
            const isProcessing = processingIds.has(`${n._id}-approve`) || processingIds.has(`${n._id}-reject`);

            let link = '#';
            if (n.type === 'CLUB_JOIN_REQUEST' && n.sender) {
              link = '#'; // Don't navigate, use inline actions
            } else if (n.data?.entityType === 'post') {
              link = `/home`;
            } else if (n.data?.entityType === 'club') {
              link = `/clubs/${n.data.entityId}`;
            } else if (n.data?.entityType === 'event') {
              link = `/events/${n.data.entityId}`;
            } else if (n.data?.entityType === 'discussion') {
              link = `/discussions`;
            }

            return (
              <div key={n._id} className="relative">
                <div
                  onClick={() => {
                    if (!n.isRead) markRead(n._id);
                    if (link !== '#') navigate(link);
                  }}
                  className={`flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer ${
                    !n.isRead
                      ? 'bg-white shadow-md border border-blue-100 hover:shadow-lg'
                      : 'bg-white border border-gray-100 hover:bg-gray-50'
                  } ${n.type === 'CLUB_JOIN_REQUEST' && actionable ? 'ring-1 ring-amber-200/50' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Sender info for join requests */}
                    {n.type === 'CLUB_JOIN_REQUEST' && n.sender && (
                      <div className="flex items-center gap-2 mb-1.5">
                        {n.sender.avatar ? (
                          <img
                            src={getImageUrl(n.sender.avatar)}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-[10px] font-bold text-white">
                            {n.sender.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-gray-700">{n.sender.name}</span>
                        {n.sender.department && (
                          <span className="text-[10px] text-gray-400">• {n.sender.department}</span>
                        )}
                        {n.sender.year && (
                          <span className="text-[10px] text-gray-400">• {n.sender.year}</span>
                        )}
                      </div>
                    )}

                    <p className={`text-sm leading-snug ${!n.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {n.message}
                    </p>

                    {/* Club name badge for join requests */}
                    {n.type === 'CLUB_JOIN_REQUEST' && n.clubDetails && (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-600">
                          <Users className="w-3 h-3" />
                          {n.clubDetails.name}
                          {n.clubDetails.category && <span className="text-blue-400">• {n.clubDetails.category}</span>}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>

                    {/* Action buttons for actionable join requests */}
                    {actionable && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={(e) => handleJoinRequestAction(n.data.entityId, n.sender._id, 'approve', n._id, e)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90 transition-all shadow-md shadow-green-500/20 disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleJoinRequestAction(n.data.entityId, n.sender._id, 'reject', n._id, e)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={(e) => handleViewProfile(n.sender, e)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Profile
                        </button>
                      </div>
                    )}

                    {/* Status badge for already processed join requests */}
                    {n.type === 'CLUB_JOIN_REQUEST' && !actionable && (wasApproved || wasRejected) && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                          wasApproved
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : 'bg-red-50 text-red-500 border border-red-200'
                        }`}>
                          {wasApproved ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          {wasApproved ? 'Accepted' : 'Rejected'}
                        </span>
                        {n.sender && (
                          <button
                            onClick={(e) => handleViewProfile(n.sender, e)}
                            className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Profile
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right-side actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 mt-1 ml-2">
                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markRead(n._id);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(n._id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Profile Modal */}
      {profileStudent && (
        <StudentProfileModal student={profileStudent} onClose={() => setProfileStudent(null)} />
      )}
    </div>
  );
}
