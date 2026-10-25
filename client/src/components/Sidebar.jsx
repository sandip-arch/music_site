import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  PlusSquare,
  Heart,
  Sparkles,
  ShieldCheck,
  Music2,
  Disc3,
  UserCircle,
  User,
} from 'lucide-react';
import { playlistApi } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export const Sidebar = ({ onOpenCreatePlaylist, onOpenAuthModal }) => {
  const [playlists, setPlaylists] = useState([]);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const fetchPlaylists = async () => {
    try {
      const res = await playlistApi.getPlaylists();
      setPlaylists(res.data);
    } catch (err) {
      console.error('Failed to load playlists:', err);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    window.addEventListener('playlist-created', fetchPlaylists);
    return () => window.removeEventListener('playlist-created', fetchPlaylists);
  }, [user]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
      isActive
        ? 'text-white bg-spotify-elevated font-bold'
        : 'text-spotify-muted hover:text-white hover:bg-white/5'
    }`;

  const isCreatorOrAdmin = user?.role === 'ARTIST' || user?.role === 'ADMIN';

  return (
    <aside className="w-64 bg-black flex flex-col h-full flex-shrink-0 select-none border-r border-[#1a1a1a]">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-spotify-green flex items-center justify-center text-black transition-transform group-hover:scale-105 shadow-md shadow-spotify-green/20">
            <Music2 className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            Spotify <span className="text-xs font-normal text-spotify-muted tracking-normal">Clone</span>
          </span>
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <div className="px-3 space-y-1">
        <NavLink to="/" className={navLinkClass}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={navLinkClass}>
          <Search className="w-5 h-5" />
          <span>Search</span>
        </NavLink>
        <NavLink to="/library" className={navLinkClass}>
          <Library className="w-5 h-5" />
          <span>Your Library</span>
        </NavLink>
        <NavLink to="/profile" className={navLinkClass}>
          <User className="w-5 h-5" />
          <span>My Profile</span>
        </NavLink>
      </div>

      {/* Action Section */}
      <div className="px-3 mt-6 space-y-1">
        <button
          onClick={onOpenCreatePlaylist}
          className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-semibold text-spotify-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
        >
          <div className="w-6 h-6 rounded bg-spotify-muted/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
            <PlusSquare className="w-4 h-4 text-white" />
          </div>
          <span>Create Playlist</span>
        </button>

        <NavLink
          to="/liked"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              isActive
                ? 'text-white bg-spotify-elevated'
                : 'text-spotify-muted hover:text-white hover:bg-white/5'
            }`
          }
        >
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center text-white">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <span>Liked Songs</span>
        </NavLink>

        {/* Role-Based Studio Section */}
        {isCreatorOrAdmin && (
          <NavLink
            to="/studio"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'text-white bg-spotify-elevated'
                  : 'text-spotify-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${
              user?.role === 'ADMIN' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {user?.role === 'ADMIN' ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>{user?.role === 'ADMIN' ? 'Admin Studio' : 'Artist Studio'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                user?.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {user?.role}
              </span>
            </div>
          </NavLink>
        )}
      </div>

      <div className="mx-6 my-3 border-t border-white/10" />

      {/* Playlists Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        <p className="px-2 text-xs font-bold text-spotify-muted uppercase tracking-wider mb-2">
          Playlists
        </p>
        {playlists.map((playlist) => (
          <NavLink
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            className={({ isActive }) =>
              `block px-2 py-2 text-sm truncate rounded transition-colors ${
                isActive
                  ? 'text-spotify-green font-semibold'
                  : 'text-spotify-muted hover:text-white'
              }`
            }
            title={playlist.name}
          >
            {playlist.name}
          </NavLink>
        ))}
      </div>

      {/* Role Profile Badge Footer */}
      <div className="p-3 border-t border-white/10 bg-[#090909]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
          <Link
            to="/profile"
            className="flex items-center gap-3 overflow-hidden group hover:opacity-80 transition-opacity"
            title="View Profile Settings"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover:border-spotify-green transition-colors"
            />
            <div className="truncate text-left">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Guest'}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    user?.role === 'ADMIN'
                      ? 'bg-amber-400'
                      : user?.role === 'ARTIST'
                      ? 'bg-purple-400'
                      : 'bg-spotify-green'
                  }`}
                />
                <span className="text-xs text-spotify-muted capitalize">{user?.role || 'Guest'}</span>
              </div>
            </div>
          </Link>

          <button
            onClick={onOpenAuthModal}
            className="text-xs font-bold text-spotify-green hover:underline cursor-pointer pl-2"
          >
            Switch
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
