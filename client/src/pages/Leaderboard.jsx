import { useState, useEffect } from 'react';
import { Trophy, Flame, Users, Medal } from 'lucide-react';
import api from '../lib/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const tabs = [
  { value: 'weekly', label: 'This Week', icon: Flame },
  { value: 'alltime', label: 'All Time', icon: Trophy },
  { value: 'clubs', label: 'Clubs', icon: Users },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/leaderboard/${activeTab}?limit=20`);
        setLeaderboard(res.data?.leaderboard || []);
      } catch {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900">🏆 Campus Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">Top performers on campus</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loading && leaderboard.length >= 3 && activeTab !== 'clubs' && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {/* 2nd place */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-300 flex items-center justify-center text-xl font-bold text-slate-700 mb-2 shadow-sm">
              {leaderboard[1]?.name?.[0]}
            </div>
            <p className="text-sm font-medium truncate max-w-20 text-gray-900">{leaderboard[1]?.name}</p>
            <p className="text-xs text-gray-500">{leaderboard[1]?.totalPoints || leaderboard[1]?.activityPoints} XP</p>
            <div className="w-20 h-16 mt-2 rounded-t-xl bg-slate-100 flex items-center justify-center text-2xl border-t-2 border-slate-200">🥈</div>
          </div>

          {/* 1st place */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mb-2 ring-2 ring-amber-200 shadow-md">
              {leaderboard[0]?.name?.[0]}
            </div>
            <p className="text-sm font-bold truncate max-w-24 text-gray-900">{leaderboard[0]?.name}</p>
            <p className="text-xs font-bold text-amber-500">{leaderboard[0]?.totalPoints || leaderboard[0]?.activityPoints} XP</p>
            <div className="w-24 h-24 mt-2 rounded-t-xl bg-amber-50 border-t-2 border-amber-200 flex items-center justify-center text-3xl">🥇</div>
          </div>

          {/* 3rd place */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-700/20 flex items-center justify-center text-xl font-bold text-amber-800 mb-2 shadow-sm">
              {leaderboard[2]?.name?.[0]}
            </div>
            <p className="text-sm font-medium truncate max-w-20 text-gray-900">{leaderboard[2]?.name}</p>
            <p className="text-xs text-gray-500">{leaderboard[2]?.totalPoints || leaderboard[2]?.activityPoints} XP</p>
            <div className="w-20 h-12 mt-2 rounded-t-xl bg-orange-50/80 flex items-center justify-center text-2xl border-t-2 border-orange-100">🥉</div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-4 bg-gray-200 rounded" />
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1"><div className="h-3 w-32 bg-gray-200 rounded" /></div>
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No activity yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry) => (
              <Link
                key={entry._id}
                to={activeTab === 'clubs' ? `/clubs/${entry._id}` : `/profile/${entry._id}`}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-all ${
                  entry.rank <= 3 ? 'bg-gray-50/50' : ''
                }`}
              >
                <span className={`w-8 text-center font-bold text-sm ${
                  entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : entry.rank === 3 ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  {getRankDisplay(entry.rank)}
                </span>

                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                  {entry.name?.[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.name}</p>
                  <p className="text-xs text-gray-500">{entry.department || entry.category || ''}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">
                    {entry.totalPoints || entry.activityPoints || entry.totalXP || 0}
                    <span className="text-xs font-normal text-gray-400 ml-1">XP</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
