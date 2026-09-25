import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users, Search, ArrowLeft, Shield, Calendar, BookOpen,
  UserCheck, UserX, Eye, Filter, Download, ChevronDown,
  X, Mail, Award, Clock, BarChart3, UserPlus
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { getImageUrl } from '../lib/axios';
import { formatDistanceToNow } from 'date-fns';

function StudentProfileModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex justify-center -mt-12">
          {student.avatar ? (
            <img src={getImageUrl(student.avatar)} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg">
              {student.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-6 pt-4 text-center">
          <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{student.email}</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {student.department && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                {student.department}
              </span>
            )}
            {student.year && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                {student.year}
              </span>
            )}
          </div>
          {student.skills?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {student.skills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-700">{skill}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Link
              to={`/profile/${student._id}`}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
            >
              View Full Profile
            </Link>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileStudent, setProfileStudent] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState('members');

  // Filter states
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({ years: [], departments: [] });

  const isAdmin = user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        if (isAdmin) {
          // Use admin endpoint for richer data
          const params = new URLSearchParams();
          if (search) params.append('q', search);
          if (yearFilter) params.append('year', yearFilter);
          if (branchFilter) params.append('department', branchFilter);
          if (roleFilter) params.append('role', roleFilter);

          const [membersRes, clubRes] = await Promise.all([
            api.get(`/admin/clubs/${id}/members?${params}`),
            api.get(`/clubs/${id}`),
          ]);

          setClub(clubRes.data.club);
          setMembers(membersRes.data?.members || []);
          setFilterOptions(membersRes.data?.filterOptions || { years: [], departments: [] });

          // Fetch pending requests
          try {
            const pendingRes = await api.get(`/admin/clubs/${id}/pending-requests`);
            setPendingRequests(pendingRes.data?.requests || []);
          } catch {
            // silently fail
          }
        } else {
          const res = await api.get(`/clubs/${id}`);
          setClub(res.data.club);
          setMembers(res.data.members || []);
        }
      } catch (err) {
        toast.error('Failed to load club details');
      } finally {
        setLoading(false);
      }
    };
    fetchClubData();
  }, [id, search, yearFilter, branchFilter, roleFilter, isAdmin]);

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

  const handleAcceptRequest = async (userId, userName) => {
    try {
      await api.patch(`/admin/join-requests/${id}/${userId}`, { action: 'approve' });
      toast.success(`${userName} accepted to the club`);
      setPendingRequests(pendingRequests.filter(r => r._id !== userId));
      // Refetch members
      const membersRes = await api.get(`/admin/clubs/${id}/members`);
      setMembers(membersRes.data?.members || []);
    } catch (err) {
      toast.error(err.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (userId, userName) => {
    try {
      await api.patch(`/admin/join-requests/${id}/${userId}`, { action: 'reject' });
      toast.success(`${userName}'s request rejected`);
      setPendingRequests(pendingRequests.filter(r => r._id !== userId));
    } catch (err) {
      toast.error(err.message || 'Failed to reject request');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setYearFilter('');
    setBranchFilter('');
    setRoleFilter('');
  };

  const hasActiveFilters = search || yearFilter || branchFilter || roleFilter;

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

  // For non-admin: derive unique filters from members data
  const uniqueYears = isAdmin ? filterOptions.years : [...new Set(members.map(m => m.year).filter(Boolean))];
  const uniqueBranches = isAdmin ? filterOptions.departments : [...new Set(members.map(m => m.department).filter(Boolean))];

  // For non-admin: apply client-side filters
  const filteredMembers = isAdmin
    ? members
    : members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
        const matchesYear = yearFilter ? member.year === yearFilter : true;
        const matchesBranch = branchFilter ? member.department === branchFilter : true;
        return matchesSearch && matchesYear && matchesBranch;
      });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
              {isAdmin && pendingRequests.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 animate-pulse">
                  {pendingRequests.length} Pending
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold font-[var(--font-display)] text-gray-900">{club.name}</h1>
          </div>
        </div>

        <p className="mt-6 text-gray-600 leading-relaxed max-w-2xl">
          {club.description}
        </p>
      </div>

      {/* Admin Management Section */}
      {(isAdmin || user?._id === club.admin?._id) && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs text-gray-500">Total Members</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{club.membersCount}</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-50">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-50">
                  <UserCheck className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-50">
                  <Shield className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-xs text-gray-500">Admins</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{members.filter(m => m.role === 'ADMIN').length}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-0">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members ({filteredMembers.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === 'pending'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Pending Requests
                {pendingRequests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {pendingRequests.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters</span>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="ml-auto text-xs text-blue-600 hover:text-blue-700 transition-colors">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {uniqueBranches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Showing {filteredMembers.length} members
                  </span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 font-medium">Student</th>
                      <th className="px-6 py-4 font-medium">Department</th>
                      <th className="px-6 py-4 font-medium">Year</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500 font-medium">No members match the filters</p>
                          {hasActiveFilters && (
                            <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                              Clear filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr key={member._id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {member.avatar ? (
                                <img src={getImageUrl(member.avatar)} alt="" className="w-9 h-9 rounded-full object-cover bg-gray-100 ring-2 ring-gray-100" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-100">
                                  {member.name?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-sm text-gray-900 block">{member.name}</span>
                                {member.email && (
                                  <span className="text-[11px] text-gray-400">{member.email}</span>
                                )}
                              </div>
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
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              member.role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {member.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                              {member.role === 'ADMIN' ? 'Admin' : 'Member'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-400">
                              {member.joinedAt
                                ? formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })
                                : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setProfileStudent(member)}
                                className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                title="View Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
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

          {/* Pending Requests Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-12 text-center">
                  <UserCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No pending requests</p>
                  <p className="text-sm text-gray-400 mt-1">All join requests have been processed</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white border border-amber-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {request.avatar ? (
                        <img src={getImageUrl(request.avatar)} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-lg font-bold text-white ring-2 ring-amber-100">
                          {request.name?.[0]?.toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{request.name}</h4>
                          {request.department && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600">
                              {request.department}
                            </span>
                          )}
                          {request.year && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-600">
                              {request.year}
                            </span>
                          )}
                        </div>
                        {request.email && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.email}
                          </p>
                        )}
                        {request.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {request.skills.slice(0, 5).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-gray-100 text-gray-600">
                                {skill}
                              </span>
                            ))}
                            {request.skills.length > 5 && (
                              <span className="text-[10px] text-gray-400">+{request.skills.length - 5} more</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Requested {request.requestedAt ? formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true }) : 'recently'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(request._id, request.name)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90 transition-all shadow-md shadow-green-500/20"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id, request.name)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => setProfileStudent(request)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Student Profile Modal */}
      {profileStudent && (
        <StudentProfileModal student={profileStudent} onClose={() => setProfileStudent(null)} />
      )}
    </div>
  );
}
