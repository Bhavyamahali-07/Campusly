import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, Plus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import api from '../../lib/axios';

export default function Header() {
  const { user } = useAuthStore();
  const { toggleSidebar, setCreatePostModal } = useUIStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications?limit=1');
        setUnreadCount(res.data?.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.results);
        setShowSearch(true);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalResults = searchResults
    ? Object.values(searchResults).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    : 0;

  return (
    <header className="sticky top-0 z-30 glass border-b border-surface-800/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left — Menu button + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search students, clubs, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults && setShowSearch(true)}
              className="w-full pl-10 pr-4 py-2 bg-surface-800/50 border border-surface-700/50 rounded-xl text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
            />

            {/* Search dropdown */}
            {showSearch && searchResults && totalResults > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-850 border border-surface-700/50 rounded-xl shadow-xl overflow-hidden animate-slide-down max-h-80 overflow-y-auto">
                {searchResults.students?.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-xs font-semibold text-surface-500 uppercase">Students</p>
                    {searchResults.students.map((s) => (
                      <Link
                        key={s._id}
                        to={`/profile/${s._id}`}
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-800/50 transition-all"
                      >
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                          {s.name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-surface-500">{s.department}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.clubs?.length > 0 && (
                  <div className="p-2 border-t border-surface-800">
                    <p className="px-2 py-1 text-xs font-semibold text-surface-500 uppercase">Clubs</p>
                    {searchResults.clubs.map((c) => (
                      <Link
                        key={c._id}
                        to={`/clubs/${c._id}`}
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-800/50 transition-all"
                      >
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-surface-500 ml-auto">{c.membersCount} members</p>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.events?.length > 0 && (
                  <div className="p-2 border-t border-surface-800">
                    <p className="px-2 py-1 text-xs font-semibold text-surface-500 uppercase">Events</p>
                    {searchResults.events.map((e) => (
                      <Link
                        key={e._id}
                        to={`/events/${e._id}`}
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-800/50 transition-all"
                      >
                        <p className="text-sm font-medium">{e.title}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {/* Create post button */}
          <button
            onClick={() => setCreatePostModal(true)}
            className="hidden sm:block uiverse-btn-glow w-auto ml-4"
          >
            <div className="uiverse-btn-glow-shadow"></div>
            <div className="uiverse-btn-glow-edge"></div>
            <div className="uiverse-btn-glow-front !px-4 !py-2 !text-sm">
              <Plus className="w-4 h-4" />
              Create Post
            </div>
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white bg-danger-500 rounded-full ring-2 ring-surface-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Mobile create button */}
          <button
            onClick={() => setCreatePostModal(true)}
            className="sm:hidden p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
