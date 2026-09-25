import { useState, useEffect, useCallback } from 'react';
import { Flame, Clock, TrendingUp, Users, Calendar, Trophy, Megaphone, Sparkles, MessageSquare } from 'lucide-react';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import api from '../lib/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import PageTransition from '../components/layout/PageTransition';
import CampusScene from '../components/3d/CampusScene';
import useCountUp from '../hooks/useCountUp';

const AnimatedStat = ({ end, label }) => {
  const count = useCountUp(end, 2000);
  return (
    <>
      {count.toLocaleString()}
    </>
  );
};

const feedTabs = [
  { value: 'recent', label: 'Recent', icon: Clock },
  { value: 'popular', label: 'Popular', icon: Flame },
];

const categoryFilters = [
  { value: 'ALL', label: 'All' },
  { value: 'ACHIEVEMENT', label: '🏆 Achievement' },
  { value: 'PROJECT', label: '💻 Project' },
  { value: 'TALENT', label: '🎨 Talent' },
  { value: 'QUESTION', label: '❓ Question' },
  { value: 'OPPORTUNITY', label: '🚀 Opportunity' },
];

export default function Home() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [category, setCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [campusStats, setCampusStats] = useState({ upcomingEvents: 0, activeClubs: 0, totalDiscussions: 0 });

  const isAdmin = user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN';

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      const p = reset ? 1 : page;
      const res = await api.get(`/posts?page=${p}&sort=${sort}&category=${category}`);
      const newPosts = res.data || [];

      if (reset) {
        setPosts(newPosts);
        setPage(1);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(res.pagination?.page < res.pagination?.pages);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [sort, category, page]);

  // Fetch on mount and filter change
  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setPage(1);
    fetchPosts(true);
  }, [sort, category]);

  // Fetch sidebar data
  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const [announcementRes, leaderboardRes, statsRes] = await Promise.all([
          api.get('/announcements').catch(() => ({ data: { announcements: [] } })),
          api.get('/leaderboard/weekly?limit=5').catch(() => ({ data: { leaderboard: [] } })),
          api.get('/users/campus/stats').catch(() => ({ data: { stats: { upcomingEvents: 0, activeClubs: 0, totalDiscussions: 0 } } })),
        ]);
        setAnnouncements(announcementRes.data?.announcements || []);
        setTopStudents(leaderboardRes.data?.leaderboard || []);
        if (statsRes.data?.stats) {
          setCampusStats(statsRes.data.stats);
        }
      } catch {}
    };
    fetchSidebar();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Premium Hero Section */}
        {!isAdmin && (
          <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-200 p-8 lg:p-10 shadow-sm">
            <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none">
              <CampusScene />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-6">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-medium text-gray-700">Welcome to your dashboard</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Good morning, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
              </h1>
              <p className="text-lg text-gray-600">
                What's happening on campus today? Catch up on the latest discussions, events, and opportunities.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Upcoming Events', value: campusStats.upcomingEvents, icon: Calendar, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                { label: 'Joined Clubs', value: campusStats.activeClubs, icon: Users, color: 'text-accent-400', bg: 'bg-accent-500/10' },
                { label: 'Discussions', value: campusStats.totalDiscussions, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Campus Rank', value: user?.totalPoints || 0, icon: Trophy, color: 'text-warning-400', bg: 'bg-warning-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col hover:-translate-y-1 transition-transform duration-300 cursor-default">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {i === 3 && stat.value > 0 ? '#' : ''}
                    <AnimatedStat end={stat.value || 0} />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Sort tabs */}
          <div className="flex items-center gap-1 mb-4">
            {feedTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSort(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sort === tab.value
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 mb-5 hide-scrollbar overflow-x-auto">
            {categoryFilters.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {loading ? (
              // Skeleton loaders
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full skeleton" />
                    <div className="flex-1">
                      <div className="h-3.5 w-32 skeleton rounded mb-2" />
                      <div className="h-2.5 w-48 skeleton rounded" />
                    </div>
                  </div>
                  <div className="h-3 skeleton rounded mb-2" />
                  <div className="h-3 skeleton rounded w-2/3" />
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No posts yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
              ))
            )}

            {/* Load more */}
            {hasMore && !loading && posts.length > 0 && (
              <button
                onClick={() => { setPage((p) => p + 1); fetchPosts(); }}
                className="w-full py-3 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200 transition-all shadow-sm"
              >
                Load more posts
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar — Desktop only */}
        <div className="hidden xl:block w-80 space-y-4">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900">Announcements</h3>
              </div>
              <div className="space-y-2">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a._id} className="p-2.5 rounded-xl bg-amber-50 border-l-2 border-amber-400">
                    <p className="text-xs font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Leaders */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900">Weekly Leaders</h3>
              </div>
              <Link to="/leaderboard" className="text-xs text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="space-y-2">
              {topStudents.map((s, i) => (
                <Link
                  key={s._id}
                  to={`/profile/${s._id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-400'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                    {s.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{s.name}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{s.totalPoints} XP</span>
                </Link>
              ))}
              {topStudents.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">No activity yet this week</p>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Explore</h3>
            <div className="space-y-1">
              <Link to="/clubs" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <Users className="w-4 h-4" />
                Browse Clubs
              </Link>
              <Link to="/events" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <Calendar className="w-4 h-4" />
                Upcoming Events
              </Link>
              <Link to="/discussions" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <TrendingUp className="w-4 h-4" />
                Join Discussions
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Create Post Modal */}
      <CreatePost onPostCreated={handlePostCreated} />
    </div>
    </PageTransition>
  );
}
