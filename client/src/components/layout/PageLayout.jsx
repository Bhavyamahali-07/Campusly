import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import TopNav from './TopNav';
import MobileNav from './MobileNav';

export default function PageLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans">
      {/* Top Navigation */}
      <TopNav />

      {/* Main content area */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile nav (optional if TopNav handles mobile overflow, but kept for safe fallback) */}
      <MobileNav />
    </div>
  );
}
