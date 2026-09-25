import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Users, Calendar, FolderKanban, Trophy, Megaphone, Check, CheckCheck, X } from 'lucide-react';
import api from '../lib/axios';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

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
  CLUB_JOIN_REQUEST: 'text-blue-600 bg-blue-50',
  CLUB_MEMBER_APPROVED: 'text-green-600 bg-green-50',
  EVENT_REGISTRATION: 'text-purple-600 bg-purple-50',
  PROJECT_APPLICATION: 'text-orange-600 bg-orange-50',
  PROJECT_ACCEPTED: 'text-green-600 bg-green-50',
  ANNOUNCEMENT: 'text-orange-600 bg-orange-50',
  BADGE_EARNED: 'text-orange-600 bg-orange-50',
  LEADERBOARD: 'text-orange-600 bg-orange-50',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=50');
        setNotifications(res.data?.notifications || []);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

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
    e.preventDefault(); // Prevent navigating to the link
    e.stopPropagation(); // Prevent Link click
    try {
      await api.patch(`/clubs/${clubId}/members/${studentId}`, { action });
      toast.success(`Request ${action}ed successfully`);
      
      // Update UI: either remove notification or mark it as read
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true, message: `You ${action}ed the request.` } : n
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

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
        <div className="text-center py-16">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            const color = colorMap[n.type] || 'text-gray-500 bg-gray-100';
            let link = '#';
            if (n.type === 'CLUB_JOIN_REQUEST' && n.sender) {
              link = `/profile/${n.sender._id}`;
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
                <Link
                  to={link}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`flex items-start gap-3 p-4 rounded-xl transition-all hover:bg-gray-50 ${
                    !n.isRead ? 'bg-white shadow-sm border border-blue-100' : 'bg-white border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                    
                    {/* Actionable UI for Club Join Requests */}
                    {n.type === 'CLUB_JOIN_REQUEST' && n.sender && n.message.includes('wants to join') && !n.message.includes('ed the request') && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={(e) => handleJoinRequestAction(n.data.entityId, n.sender._id, 'approve', n._id, e)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleJoinRequestAction(n.data.entityId, n.sender._id, 'reject', n._id, e)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
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
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
