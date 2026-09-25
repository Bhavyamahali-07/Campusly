import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Users, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const items = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: null, label: 'Create', icon: Plus, isCreate: true },
  { path: '/clubs', label: 'Clubs', icon: Users },
];

export default function MobileNav() {
  const { user } = useAuthStore();
  const { setCreatePostModal } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden glass border-t border-surface-800/50">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, i) =>
          item.isCreate ? (
            <button
              key={i}
              onClick={() => setCreatePostModal(true)}
              className="flex flex-col items-center justify-center gap-0.5 -mt-5"
            >
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </button>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                  isActive ? 'text-primary-400' : 'text-surface-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          )
        )}

        {/* Profile */}
        <NavLink
          to={`/profile/${user?._id}`}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
              isActive ? 'text-primary-400' : 'text-surface-500'
            }`
          }
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
