import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Users, Calendar, MessageSquare, Trophy, GraduationCap, Settings, LogOut } from 'lucide-react';
import { Stepper, StepperIndicator, StepperItem, StepperNav, StepperTitle, StepperTrigger } from '../ui/stepper';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/axios';

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/clubs', label: 'Clubs', icon: Users },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/discussions', label: 'Discussions', icon: MessageSquare },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  // activeStep is 1-indexed, match path or default to 0 to show none selected if unknown
  const activeIndex = navItems.findIndex(item => location.pathname.startsWith(item.path));
  const activeStep = activeIndex >= 0 ? activeIndex + 1 : 1;

  const handleStepChange = (step) => {
    const item = navItems[step - 1];
    if (item) {
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
        
        <Link to="/home" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.jpg" alt="Campusly" className="w-20 h-20 object-contain" />
        </Link>

        {/* Stepper Navigation */}
        <div className="w-full md:flex-1 overflow-x-auto hide-scrollbar flex justify-center items-center">
          <Stepper value={activeStep} onValueChange={handleStepChange} className="min-w-max mx-auto px-4 md:px-12">
            <StepperNav className="gap-4 md:gap-10 justify-center">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeStep === index + 1;
                return (
                  <StepperItem
                    key={index}
                    step={index + 1}
                    className="relative flex items-center min-w-[64px]"
                  >
                    <StepperTrigger className="flex flex-col items-center justify-center gap-1.5 w-full hover:bg-gray-100/50 p-2 rounded-xl transition-all">
                      <StepperIndicator className={`transition-all size-9 border-none shadow-sm ${isActive ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-4 h-4" />
                      </StepperIndicator>
                      <StepperTitle className={`text-[11px] uppercase tracking-wider font-semibold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        {item.label}
                      </StepperTitle>
                    </StepperTrigger>
                  </StepperItem>
                );
              })}
            </StepperNav>
          </Stepper>
        </div>

        {/* User Profile / Logout */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to={`/profile/${user?._id}`} className="flex items-center gap-2 group">
            {user?.avatar ? (
              <img src={getImageUrl(user.avatar)} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-500/50 transition-all" />
            ) : (
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white shadow-md">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
