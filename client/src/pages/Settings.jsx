import { useState } from 'react';
import { Save, User, Code, Link as LinkIcon, Shield, Mail, Check, X, Moon, Sun, Monitor } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import api, { getImageUrl } from '../lib/axios';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    department: user?.department || '',
    year: user?.year || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    socialLinks: {
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      portfolio: user?.socialLinks?.portfolio || '',
    },
  });
  const { theme, setTheme } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [emailData, setEmailData] = useState({ email: user?.email || '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const validations = {
    length: passwordData.newPassword.length >= 6,
    uppercase: /[A-Z]/.test(passwordData.newPassword),
    number: /[0-9]/.test(passwordData.newPassword),
    special: /[^A-Za-z0-9]/.test(passwordData.newPassword),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
      };

      const res = await api.put('/users/profile', payload);
      setUser(res.data.user);

      // Upload avatar if selected
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        
        const tokenStr = localStorage.getItem('auth-storage');
        let token = '';
        if (tokenStr) {
          try { token = JSON.parse(tokenStr).state.token; } catch (e) {}
        }
        
        const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
        const fetchRes = await fetch(`${baseUrl}/users/avatar`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: fd
        });
        
        if (!fetchRes.ok) {
          const errData = await fetchRes.json();
          throw new Error(errData.message || 'Failed to upload image');
        }
        
        const avatarRes = await fetchRes.json();
        setUser(avatarRes.data.user);
        setAvatarFile(null);
      }

      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validations.length || !validations.uppercase || !validations.number || !validations.special) {
      return toast.error('Please meet all password requirements');
    }
    setPasswordLoading(true);
    try {
      await api.patch('/auth/change-password', passwordData);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      const res = await api.patch('/auth/update-email', emailData);
      setUser({ ...user, email: res.data.email });
      toast.success('Email updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900 mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Profile Photo</h2>
          <div className="flex items-center gap-4">
            {avatarPreview || user?.avatar ? (
              <img src={avatarPreview || getImageUrl(user.avatar)} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-white shadow-sm">
                {user?.name?.[0]}
              </div>
            )}
            <label className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-all">
              Change Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                  <option value="">Select</option>
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>5th Year</option><option>Alumni</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Code className="w-4 h-4" /> Skills & Interests</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Skills (comma separated)</label>
              <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Python, UI/UX"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Interests (comma separated)</label>
              <input type="text" value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} placeholder="AI, Web Dev, Photography"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Social Links</h2>
          <div className="space-y-3">
            {['github', 'linkedin', 'twitter', 'portfolio'].map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{key}</label>
                <input type="url" value={formData.socialLinks[key]} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [key]: e.target.value } })}
                  placeholder={`https://${key}.com/...`}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </form>

      {/* Preferences */}
      <div className="mt-8 space-y-6">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Sun className="w-4 h-4" /> Theme Preference</h2>
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'system', icon: Monitor, label: 'System' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === t.id
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="mt-8 space-y-6">
        <form onSubmit={handleEmailSubmit} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Mail className="w-4 h-4" /> Change Email</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
              <input type="email" required value={emailData.email} onChange={(e) => setEmailData({ email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <button type="submit" disabled={emailLoading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
              {emailLoading ? 'Updating...' : 'Update Email'}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
              <input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
              <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              
              {/* Password strength checklist */}
              {passwordData.newPassword.length > 0 && (
                <div className="mt-3 space-y-1.5 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div className={`flex items-center gap-2 transition-colors ${validations.length ? 'text-green-600' : 'text-gray-400'}`}>
                    {validations.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} At least 6 characters
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${validations.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                    {validations.uppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${validations.number ? 'text-green-600' : 'text-gray-400'}`}>
                    {validations.number ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One number
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${validations.special ? 'text-green-600' : 'text-gray-400'}`}>
                    {validations.special ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One special character
                  </div>
                </div>
              )}
            </div>
            <button type="submit" disabled={passwordLoading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
