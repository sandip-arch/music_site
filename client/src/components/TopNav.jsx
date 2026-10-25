import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search as SearchIcon, Shield, Sparkles, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { getGreeting } from '../utils/formatters';

export const TopNav = ({ onOpenAuthModal, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isSearchPage = location.pathname === '/search';

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
    <header className="h-16 px-8 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-30 border-b border-white/5 transition-all">
      {/* Navigation history arrows + Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="Go forward"
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic greeting on Home, or Search Input on Search route */}
        {isSearchPage ? (
          <div className="relative w-full max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              placeholder="What do you want to play?"
              className="w-full bg-[#242424] text-white text-sm rounded-full pl-10 pr-4 py-2.5 placeholder-spotify-muted focus:outline-none focus:ring-2 focus:ring-white transition-all"
              autoFocus
            />
          </div>
        ) : (
          <div className="hidden md:flex items-center text-sm font-medium text-spotify-muted">
            <span className="text-white/60 font-medium">{getGreeting()}, </span>
            <span className="text-white ml-1 font-semibold">{user?.name || 'Listener'}</span>
          </div>
        )}
      </div>

      {/* Role Badge and User Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher Button */}
        <button
          onClick={onOpenAuthModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(
            user?.role
          )} hover:scale-105 transition-all cursor-pointer shadow-sm`}
          title="Click to switch role or view credentials"
        >
          {user?.role === 'ADMIN' ? (
            <Shield className="w-3.5 h-3.5" />
          ) : user?.role === 'ARTIST' ? (
            <Sparkles className="w-3.5 h-3.5" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
          <span>Role: {user?.role || 'USER'}</span>
        </button>

        {/* Profile Link Button */}
        <Link
          to="/profile"
          className="flex items-center gap-2 bg-black/60 hover:bg-[#282828] p-1 pr-3 rounded-full cursor-pointer transition-colors border border-white/10 group"
          title="Account Profile & Settings"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user?.name || 'User'}
            className="w-7 h-7 rounded-full object-cover group-hover:scale-105 transition-transform"
          />
          <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden sm:inline">
            Profile
          </span>
        </Link>
      </div>
    </header>
  );
};

export default TopNav;
