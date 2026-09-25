import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Code, Globe, Trophy, Users, FolderKanban, Flame, Edit2, Link2 } from 'lucide-react';
import api, { getImageUrl } from '../lib/axios';
import useAuthStore from '../store/authStore';
import PostCard from '../components/feed/PostCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/posts?author=${id}&limit=10`).catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data.user);
        setPosts(postsRes.data || []);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl mb-6" />
        <div className="flex items-end gap-6 -mt-16 ml-6">
          <div className="w-28 h-28 rounded-2xl bg-gray-200 ring-4 ring-white shadow-sm" />
          <div className="pb-3">
            <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-surface-400">User not found</div>;
  }

  const completion = profile.profileCompletion || 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner */}
      <div className="h-48 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10 mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/50" />
      </div>

      {/* Profile Header */}
      <div className="px-6 -mt-16 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          {profile.avatar ? (
            <img src={getImageUrl(profile.avatar)} alt="" className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg bg-white" />
          ) : (
            <div className="w-28 h-28 rounded-2xl gradient-primary flex items-center justify-center text-4xl font-bold text-white ring-4 ring-white shadow-lg bg-white">
              {profile.name?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1 pb-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900">{profile.name}</h1>
              {profile.badges?.length > 0 && (
                <div className="flex items-center gap-1">
                  {profile.badges.slice(0, 3).map((b) => (
                    <span key={b} className="text-sm" title={b}>{
                      b === 'active_student' ? '🔥' : b === 'collaborator' ? '🤝' : b === 'competition_winner' ? '🏆' : b === 'innovator' ? '💡' : b === 'tech_contributor' ? '💻' : '⭐'
                    }</span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5 font-medium">
              {profile.department && `${profile.department}`}
              {profile.department && profile.year && ' • '}
              {profile.year && `${profile.year}`}
            </p>
          </div>

          {isOwnProfile && (
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Link>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-gray-600 mt-4 max-w-xl leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-500">{profile.activityPoints || 0}</span>
            <span className="text-gray-500 font-medium">XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            <Trophy className="w-4 h-4" />
            <span>{profile.badges?.length || 0} Badges</span>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {profile.skills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Social Links */}
        {profile.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
          <div className="flex items-center gap-3 mt-4">
            {profile.socialLinks.github && (
              <a href={profile.socialLinks.github} target="_blank" rel="noopener" className="text-gray-400 hover:text-gray-900 transition-colors" title="GitHub"><Link2 className="w-4 h-4" /></a>
            )}
            {profile.socialLinks.linkedin && (
              <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener" className="text-gray-400 hover:text-blue-600 transition-colors" title="LinkedIn"><Link2 className="w-4 h-4" /></a>
            )}
            {profile.socialLinks.twitter && (
              <a href={profile.socialLinks.twitter} target="_blank" rel="noopener" className="text-gray-400 hover:text-sky-500 transition-colors" title="Twitter"><Link2 className="w-4 h-4" /></a>
            )}
            {profile.socialLinks.portfolio && (
              <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener" className="text-gray-400 hover:text-indigo-600 transition-colors" title="Portfolio"><Globe className="w-4 h-4" /></a>
            )}
          </div>
        )}

        {/* Profile Completion (own profile only) */}
        {isOwnProfile && completion < 100 && (
          <div className="mt-5 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">Profile Completion</p>
              <span className="text-xs font-bold text-blue-600">{completion}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">Complete your profile to stand out on campus</p>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold px-2 text-gray-900">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No posts yet</p>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}
