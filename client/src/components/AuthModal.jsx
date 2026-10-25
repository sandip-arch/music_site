import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, Shield, LogIn, UserPlus, CheckCircle2, Mail, KeyRound, Clock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const AuthModal = ({ isOpen, onClose }) => {
  const { user, quickLogin, login, register, logout, forgotPassword, resetPassword, isLoading, error } = useAuthStore();
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'login' | 'register' | 'forgot-otp' | 'reset-password'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regRole, setRegRole] = useState('USER');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Forgot password OTP flow state
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(300); // 5 minutes (300s)
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState('');

  // 5-minute countdown timer effect
  useEffect(() => {
    let timer;
    if (activeTab === 'reset-password' && otpSecondsLeft > 0) {
      timer = setInterval(() => {
        setOtpSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTab, otpSecondsLeft]);

  if (!isOpen) return null;

  const handleQuickSwitch = async (targetEmail) => {
    setFormError('');
    setFormSuccess('');
    const res = await quickLogin(targetEmail);
    if (res.success) {
      onClose();
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    const res = await login(email, password);
    if (res.success) {
      onClose();
    } else {
      setFormError(res.error || 'Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    const res = await register(name, email, password, regRole);
    if (res.success) {
      onClose();
    } else {
      setFormError(res.error || 'Registration failed');
    }
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmittingOtp(true);

    const res = await forgotPassword(resetEmail);
    setIsSubmittingOtp(false);

    if (res.success) {
      setOtpSecondsLeft(300); // Reset 5-minute timer
      setDemoOtpHint(res.data?.demoOtp || '');
      setFormSuccess('A 6-digit OTP has been sent via Nodemailer to ' + resetEmail);
      setActiveTab('reset-password');
    } else {
      setFormError(res.error || 'Failed to send OTP code');
    }
  };

  // Step 2: Verify OTP and set new password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (newPassword !== confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (otpSecondsLeft <= 0) {
      setFormError('OTP code has expired (5-minute validity). Please request a new code.');
      return;
    }

    setIsSubmittingOtp(true);
    const res = await resetPassword(resetEmail, otpCode, newPassword);
    setIsSubmittingOtp(false);

    if (res.success) {
      setFormSuccess('Password reset successfully! You can now sign in.');
      setEmail(resetEmail);
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setActiveTab('login');
      }, 1500);
    } else {
      setFormError(res.error || 'Invalid or expired OTP code');
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="bg-[#1f1f1f] w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/10 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-spotify-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-spotify-green animate-pulse" />
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'forgot-otp' || activeTab === 'reset-password'
                ? 'Password Reset & OTP Recovery'
                : 'Role-Based Access Control (RBAC)'}
            </h2>
          </div>
          <p className="text-xs text-spotify-muted">
            {activeTab === 'forgot-otp' || activeTab === 'reset-password'
              ? 'Secure 5-minute email OTP verification powered by Nodemailer.'
              : 'Seamlessly switch permissions: Listener (USER), Creator (ARTIST), or Moderator (ADMIN).'}
          </p>
        </div>

        {/* Status Alerts */}
        {formSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-spotify-green/20 text-spotify-green text-xs border border-spotify-green/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-300 text-xs border border-red-500/40">
            {formError}
          </div>
        )}

        {/* Currently Active User Banner */}
        {user && activeTab !== 'forgot-otp' && activeTab !== 'reset-password' && (
          <div className="mb-5 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  {user.name}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : user.role === 'ARTIST'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-spotify-green/20 text-spotify-green border border-spotify-green/30'
                    }`}
                  >
                    {user.role}
                  </span>
                </p>
                <p className="text-xs text-spotify-muted font-mono">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Tab Headers */}
        {activeTab !== 'forgot-otp' && activeTab !== 'reset-password' ? (
          <div className="flex border-b border-white/10 mb-5">
            <button
              onClick={() => { setActiveTab('quick'); setFormError(''); }}
              className={`pb-2.5 px-4 text-xs font-bold transition-colors ${
                activeTab === 'quick'
                  ? 'text-spotify-green border-b-2 border-spotify-green'
                  : 'text-spotify-muted hover:text-white'
              }`}
            >
              1-Click Role Switch
            </button>
            <button
              onClick={() => { setActiveTab('login'); setFormError(''); }}
              className={`pb-2.5 px-4 text-xs font-bold transition-colors ${
                activeTab === 'login'
                  ? 'text-spotify-green border-b-2 border-spotify-green'
                  : 'text-spotify-muted hover:text-white'
              }`}
            >
              Custom Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setFormError(''); }}
              className={`pb-2.5 px-4 text-xs font-bold transition-colors ${
                activeTab === 'register'
                  ? 'text-spotify-green border-b-2 border-spotify-green'
                  : 'text-spotify-muted hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setActiveTab('login'); setFormError(''); setFormSuccess(''); }}
            className="flex items-center gap-2 text-xs font-semibold text-spotify-muted hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        )}

        {/* Tab 1: 1-Click Role Switcher */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            <div
              onClick={() => handleQuickSwitch('listener@spotify.local')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between ${
                user?.role === 'USER'
                  ? 'bg-spotify-green/10 border-spotify-green'
                  : 'bg-[#282828] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-spotify-green/20 text-spotify-green flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Listener Account</h4>
                    <span className="text-[10px] bg-spotify-green/20 text-spotify-green font-mono font-bold px-1.5 py-0.5 rounded">
                      USER
                    </span>
                  </div>
                  <p className="text-xs text-spotify-muted">
                    Full playback, HTTP 206 streaming, create playlists & save liked tracks.
                  </p>
                </div>
              </div>
              {user?.role === 'USER' && (
                <CheckCircle2 className="w-5 h-5 text-spotify-green flex-shrink-0" />
              )}
            </div>

            <div
              onClick={() => handleQuickSwitch('artist@spotify.local')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between ${
                user?.role === 'ARTIST'
                  ? 'bg-purple-500/10 border-purple-500'
                  : 'bg-[#282828] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Luna Mirage (Artist)</h4>
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 font-mono font-bold px-1.5 py-0.5 rounded">
                      ARTIST
                    </span>
                  </div>
                  <p className="text-xs text-spotify-muted">
                    Access Creator Studio, categorized albums/singles, release music, analytics.
                  </p>
                </div>
              </div>
              {user?.role === 'ARTIST' && (
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              )}
            </div>

            <div
              onClick={() => handleQuickSwitch('admin@spotify.local')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between ${
                user?.role === 'ADMIN'
                  ? 'bg-amber-500/10 border-amber-500'
                  : 'bg-[#282828] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Admin Controller</h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-spotify-muted">
                    Full authority, delete songs (Admin only), catalogue search & moderation.
                  </p>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-spotify-muted uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || 'listener@spotify.local');
                    setFormError('');
                    setFormSuccess('');
                    setActiveTab('forgot-otp');
                  }}
                  className="text-xs text-spotify-green hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black text-sm font-bold shadow transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Tab 3: Registration with Role Selection */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name / Artist Alias"
                required
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Role
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              >
                <option value="USER">Listener (USER)</option>
                <option value="ARTIST">Music Creator (ARTIST)</option>
                <option value="ADMIN">System Administrator (ADMIN)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black text-sm font-bold shadow transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        {/* Tab 4: Forgot Password - Step 1: Request 5-Min OTP */}
        {activeTab === 'forgot-otp' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#282828] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-spotify-green">
                <Mail className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Reset via Email OTP</h3>
              </div>
              <p className="text-xs text-spotify-muted leading-relaxed">
                Enter your account email. We will send a secure 6-digit OTP verification code via Nodemailer, valid for <strong>5 minutes</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Account Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="e.g. listener@spotify.local"
                required
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingOtp}
              className="w-full py-2.5 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black text-sm font-bold shadow transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmittingOtp ? 'Sending OTP Code...' : 'Send 6-Digit OTP'}
            </button>
          </form>
        )}

        {/* Tab 5: Forgot Password - Step 2: Verify OTP & Set New Password */}
        {activeTab === 'reset-password' && (
          <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#282828] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-spotify-muted">Verification code sent to:</p>
                <p className="text-sm font-bold text-white font-mono">{resetEmail}</p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{formatTimer(otpSecondsLeft)}</span>
              </div>
            </div>

            {demoOtpHint && (
              <div className="p-2 rounded bg-white/5 border border-white/10 text-[11px] text-spotify-green font-mono flex items-center justify-between">
                <span>Dev Preview OTP Code: <strong>{demoOtpHint}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtpHint)}
                  className="underline hover:text-white"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Enter 6-Digit OTP Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full bg-[#2d2d2d] text-center text-xl font-mono tracking-widest text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green"
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
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
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
                placeholder="Re-type new password"
                required
                minLength={6}
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSubmittingOtp}
                className="text-xs text-spotify-muted hover:text-white underline"
              >
                Resend OTP
              </button>
              <button
                type="submit"
                disabled={isSubmittingOtp || otpSecondsLeft <= 0}
                className="flex-1 py-2.5 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black text-sm font-bold shadow transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmittingOtp ? 'Verifying...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
