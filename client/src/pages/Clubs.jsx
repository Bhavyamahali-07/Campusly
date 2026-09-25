import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Filter } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Clubs() {
  const { user } = useAuthStore();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('q', search);
        if (category) params.append('category', category);
        const res = await api.get(`/clubs?${params}`);
        setClubs(res.data || []);
      } catch (err) {
        toast.error('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, [search, category]);

  const handleJoin = async (clubId) => {
    try {
      await api.post(`/clubs/${clubId}/join`);
      toast.success('Join request sent!');
      setClubs(clubs.map(c => c._id === clubId ? { ...c, isPending: true } : c));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelRequest = async (clubId) => {
    try {
      await api.post(`/clubs/${clubId}/leave`);
      toast.success('Join request cancelled');
      setClubs(clubs.map(c => c._id === clubId ? { ...c, isPending: false } : c));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900">Clubs</h1>
          <p className="text-gray-500 text-sm mt-1">Discover and join campus communities</p>
        </div>
        <Link
          to="#"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-glow"
        >
          <Plus className="w-4 h-4" />
          Create Club
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-2/3 skeleton rounded mb-3" />
              <div className="h-3 skeleton rounded mb-2" />
              <div className="h-3 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No clubs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div key={club._id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-blue-500/30 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3 mb-3">
                {club.logo ? (
                  <img src={club.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-lg font-bold text-white shadow-sm">
                    {club.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/clubs/${club._id}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {club.name}
                  </Link>
                  <p className="text-xs text-gray-500">{club.category}</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mb-4">{club.description}</p>

              <div className="flex items-center justify-end">
                {/* <span className="text-xs text-surface-500">{club.membersCount} members</span> */}

                {user?.role === 'STUDENT' && (
                  <>
                    {club.isMember ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-600 border border-green-200">Joined</span>
                    ) : club.isPending ? (
                      <button
                        onClick={() => handleCancelRequest(club._id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all border border-amber-200"
                      >
                        Cancel Request
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(club._id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-200"
                      >
                        Join
                      </button>
                    )}
                  </>
                )}
                
                {user?.role !== 'STUDENT' && (
                  <Link to={`/clubs/${club._id}`} className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                    Manage
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
