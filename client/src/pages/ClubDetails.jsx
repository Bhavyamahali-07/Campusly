import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Search, ArrowLeft, Shield, Calendar, BookOpen } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function ClubDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await api.get(`/clubs/${id}`);
        setClub(res.data.club);
        setMembers(res.data.members || []);
      } catch (err) {
        toast.error('Failed to load club details');
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Club not found</p>
        <Link to="/clubs" className="text-blue-600 hover:underline mt-4 inline-block">Back to Clubs</Link>
      </div>
    );
  }

  // Derived filter options based on members
  const uniqueYears = [...new Set(members.map(m => m.year).filter(Boolean))];
  const uniqueBranches = [...new Set(members.map(m => m.department).filter(Boolean))];

  // Filtered members list
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
    const matchesYear = yearFilter ? member.year === yearFilter : true;
    const matchesBranch = branchFilter ? member.department === branchFilter : true;
    return matchesSearch && matchesYear && matchesBranch;
  });

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) return;
    try {
      await api.patch(`/clubs/${id}/members/${memberId}`, { action: 'remove' });
      setMembers(members.filter(m => m._id !== memberId));
      toast.success(`${memberName} removed from the club`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handlePromoteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to make ${memberName} an Admin?`)) return;
    try {
      await api.patch(`/clubs/${id}/members/${memberId}`, { action: 'promote' });
      setMembers(members.map(m => m._id === memberId ? { ...m, role: 'ADMIN' } : m));
      toast.success(`${memberName} is now an Admin`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote member');
    }
  };

  const handleDemoteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove Admin rights from ${memberName}?`)) return;
    try {
      await api.patch(`/clubs/${id}/members/${memberId}`, { action: 'demote' });
      setMembers(members.map(m => m._id === memberId ? { ...m, role: 'MEMBER' } : m));
      toast.success(`${memberName} is now a Member`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to demote member');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/clubs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Clubs
      </Link>

      {/* Club Header */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-100 to-indigo-100" />
        
        <div className="relative z-10 flex items-end gap-6 mt-16">
          {club.logo ? (
            <img src={club.logo} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white" />
          ) : (
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-white">
              {club.name[0]}
            </div>
          )}
          
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                {club.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {club.membersCount} Members
              </span>
            </div>
            <h1 className="text-3xl font-bold font-[var(--font-display)] text-gray-900">{club.name}</h1>
          </div>
        </div>

        <p className="mt-6 text-gray-600 leading-relaxed max-w-2xl">
          {club.description}
        </p>
      </div>

      {/* Members Section (Admin View) */}
      {(user?.role === 'COLLEGE_ADMIN' || user?._id === club.admin?._id) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-[var(--font-display)] text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Club Members
            </h2>
            <span className="text-sm text-gray-500">Showing {filteredMembers.length} members</span>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Branches</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          {/* Members Table */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Branch</th>
                  <th className="px-6 py-4 font-medium">Year</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No members match the filters.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img src={member.avatar} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-100" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                              {member.name[0]}
                            </div>
                          )}
                          <span className="font-medium text-sm text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <BookOpen className="w-3.5 h-3.5" />
                          {member.department || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {member.year || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          member.role === 'ADMIN' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                          {member.role === 'ADMIN' ? 'Admin' : 'Member'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {member.role !== 'ADMIN' && (
                            <>
                              <button
                                onClick={() => handlePromoteMember(member._id, member.name)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              >
                                Make Admin
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member._id, member.name)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                          {member.role === 'ADMIN' && club.admin?._id !== member._id && (
                            <button
                              onClick={() => handleDemoteMember(member._id, member.name)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                            >
                              Dismiss as Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
