import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Users, Calendar, MessageSquare, Trophy, Bell, Settings, LogOut, Shield, Menu, X, GraduationCap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { getImageUrl } from '../../lib/axios';

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/clubs', label: 'Clubs', icon: Users },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/discussions', label: 'Discussions', icon: MessageSquare },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const adminItems = [
  { path: '/admin/dashboard', label: 'Admin Panel', icon: Shield },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 flex flex-col glass border-r border-surface-800/50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-[var(--font-display)] gradient-text">Campusly</h1>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-surface-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${
                  isActive
                    ? 'text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                    : 'text-surface-400 hover:text-surface-100'
                }`
              }
            >
              {/* Active Background Gradient */}
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-90 -z-10" />
                  )}
                  {/* Hover Background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-surface-800/50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                  )}
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary-400'}`} />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="mx-3 my-3 border-t border-surface-800/50" />
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${
                      isActive
                        ? 'text-white shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                        : 'text-surface-400 hover:text-surface-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-warning-500 to-warning-600 opacity-90 -z-10" />
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-surface-800/50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                      )}
                      <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-warning-400'}`} />
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Bottom — Profile + Logout */}
        <div className="p-3 border-t border-surface-800/50">
          <NavLink
            to={`/profile/${user?._id}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-300 hover:text-white hover:bg-surface-800/50 transition-all"
          >
            {user?.avatar ? (
              <img src={getImageUrl(user.avatar)} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30" />
            ) : (
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-surface-500 truncate">{user?.department || user?.email}</p>
            </div>
          </NavLink>

          <div className="flex items-center gap-1 mt-1">
            <NavLink
              to="/settings"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
