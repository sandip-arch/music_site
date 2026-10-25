import React, { useState } from 'react';
import { User, Camera, KeyRound, Shield, Sparkles, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SpotifyRobot&backgroundColor=1db954',
];

export const ProfilePage = () => {
  const { user, updateProfile, updatePassword } = useAuthStore();

  // Profile info state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);

    const res = await updateProfile({
      name: name.trim(),
      avatarUrl: avatarUrl.trim(),
    });

    setProfileLoading(false);
    if (res.success) {
      setProfileMsg({ text: 'Profile picture and details updated successfully!', type: 'success' });
    } else {
      setProfileMsg({ text: res.error || 'Failed to update profile', type: 'error' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMsg({ text: 'New password must be at least 6 characters long', type: 'error' });
      return;
    }

    setPassLoading(true);
    const res = await updatePassword(currentPassword, newPassword);
    setPassLoading(false);

    if (res.success) {
      setPassMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassMsg({ text: res.error || 'Failed to update password', type: 'error' });
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ARTIST':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-spotify-green/20 text-spotify-green border-spotify-green/40';
    }
  };

  return (
    <div className="p-8 pb-32 max-w-4xl mx-auto space-y-8 text-left">
      {/* Profile Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-white/10">
        <div className="relative group">
          <img
            src={avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
            alt={user?.name || 'User Avatar'}
            className="w-32 h-32 rounded-full object-cover shadow-2xl border-2 border-white/20 group-hover:border-spotify-green transition-all"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-spotify-muted">
            Profile & Settings
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {user?.name || 'Listener'}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${getRoleBadgeStyle(
                user?.role
              )} flex items-center gap-1.5`}
            >
              {user?.role === 'ADMIN' ? (
                <Shield className="w-3.5 h-3.5" />
              ) : user?.role === 'ARTIST' ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span>{user?.role} ACCOUNT</span>
            </span>
            <span className="text-xs text-spotify-muted font-mono">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Edit Profile Details & Picture */}
        <div className="bg-[#181818] rounded-2xl p-6 border border-white/10 space-y-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-spotify-green" />
            <h2 className="text-lg font-bold text-white">Edit Profile Details</h2>
          </div>

          {profileMsg.text && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-spotify-green/20 text-spotify-green border-spotify-green/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Profile Picture URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>

            {/* Curated Presets Picker */}
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-2">
                Or Select an Avatar Preset:
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Preset ${idx + 1}`}
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition-all hover:scale-110 flex-shrink-0 ${
                      avatarUrl === preset
                        ? 'border-spotify-green scale-105'
                        : 'border-transparent hover:border-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#282828]/50 text-spotify-muted text-sm rounded-lg px-3 py-2.5 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black text-sm font-bold shadow transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Section 2: Change Password */}
        <div className="bg-[#181818] rounded-2xl p-6 border border-white/10 space-y-5 shadow-xl">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Update Password</h2>
          </div>

          {passMsg.text && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                passMsg.type === 'success'
                  ? 'bg-spotify-green/20 text-spotify-green border-spotify-green/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              {passMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Current Password *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Re-type new password"
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-2.5 rounded-full bg-white hover:bg-white/90 text-black text-sm font-bold shadow transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
