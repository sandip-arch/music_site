import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Shield,
  Upload,
  Plus,
  Trash2,
  Music,
  Disc3,
  Users,
  BarChart3,
  Lock,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
} from 'lucide-react';
import { trackApi, albumApi, artistApi } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatNumber, formatTime } from '../utils/formatters';

export const StudioPage = () => {
  const { user, quickLogin } = useAuthStore();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track upload form state
  const [trackTitle, setTrackTitle] = useState('');
  const [trackDuration, setTrackDuration] = useState('210');
  const [trackAlbumId, setTrackAlbumId] = useState('');
  const [trackArtistId, setTrackArtistId] = useState('');
  const [trackAudioUrl, setTrackAudioUrl] = useState('');
  const [trackMsg, setTrackMsg] = useState('');

  // Album creation form state
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCover, setAlbumCover] = useState('');
  const [albumYear, setAlbumYear] = useState('2024');
  const [albumArtistId, setAlbumArtistId] = useState('');
  const [albumMsg, setAlbumMsg] = useState('');

  // Admin Search & Filter State
  const [adminSearch, setAdminSearch] = useState('');
  const [adminArtistFilter, setAdminArtistFilter] = useState('ALL');
  const [adminTypeFilter, setAdminTypeFilter] = useState('ALL'); // 'ALL' | 'ALBUM' | 'SINGLE'
  const [adminSortBy, setAdminSortBy] = useState('plays-desc');

  // Artist Category View State
  const [artistViewCategory, setArtistViewCategory] = useState('albums'); // 'albums' | 'singles'
  const [expandedAlbums, setExpandedAlbums] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, alRes, arRes] = await Promise.all([
        trackApi.getTracks({ limit: 50 }),
        albumApi.getAlbums(),
        artistApi.getArtists(),
      ]);
      setTracks(tRes.data?.data || []);
      setAlbums(alRes.data || []);
      setArtists(arRes.data || []);
      if (alRes.data.length > 0) setTrackAlbumId(alRes.data[0].id);
      if (arRes.data.length > 0) {
        setTrackArtistId(arRes.data[0].id);
        setAlbumArtistId(arRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load studio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTrack = async (e) => {
    e.preventDefault();
    try {
      setTrackMsg('');
      const payload = {
        title: trackTitle,
        duration: parseInt(trackDuration, 10),
        albumId: trackAlbumId || undefined,
        artistId: trackArtistId || undefined,
        audioUrl: trackAudioUrl || undefined,
      };

      await trackApi.createTrack(payload);
      setTrackMsg(`Track "${trackTitle}" published successfully!`);
      setTrackTitle('');
      await loadData();
    } catch (err) {
      setTrackMsg(err.response?.data?.error || 'Failed to publish track');
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    try {
      setAlbumMsg('');
      const payload = {
        title: albumTitle,
        coverArt: albumCover || undefined,
        releaseYear: parseInt(albumYear, 10),
        artistId: albumArtistId || undefined,
      };

      await albumApi.createAlbum(payload);
      setAlbumMsg(`Album "${albumTitle}" created successfully!`);
      setAlbumTitle('');
      setAlbumCover('');
      await loadData();
    } catch (err) {
      setAlbumMsg(err.response?.data?.error || 'Failed to create album');
    }
  };

  // Strictly accessible only by ADMIN
  const handleDeleteTrack = async (trackId) => {
    if (!isAdmin) {
      alert('Access denied. Deleting songs is accessible strictly only by Administrators.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this track from the platform?')) return;
    try {
      await trackApi.deleteTrack(trackId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete track');
    }
  };

  const toggleAlbumExpand = (albumId) => {
    setExpandedAlbums((prev) => ({
      ...prev,
      [albumId]: !prev[albumId],
    }));
  };

  const handleTrackPlay = (track, list) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, list);
    }
  };

  if (user?.role === 'USER') {
    return (
      <div className="p-8 pb-32 text-left max-w-3xl mx-auto space-y-6">
        <div className="p-8 rounded-2xl bg-[#1e1e1e] border border-white/10 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Creator & Admin Studio Restricted</h2>
          <p className="text-sm text-spotify-muted max-w-md mx-auto leading-relaxed">
            You are currently logged in as a standard <span className="text-spotify-green font-bold">Listener (USER)</span>. Publishing songs, releasing albums, and catalog moderation are reserved for <span className="text-purple-400 font-bold">ARTIST</span> and <span className="text-amber-400 font-bold">ADMIN</span> roles.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => quickLogin('artist@spotify.local')}
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to Artist (Luna Mirage)</span>
            </button>
            <button
              onClick={() => quickLogin('admin@spotify.local')}
              className="px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow hover:scale-105 transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Switch to Admin Controller</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  // Filtered tracks for Admin Studio
  const filteredAdminTracks = tracks
    .filter((t) => {
      if (adminSearch.trim()) {
        const query = adminSearch.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(query);
        const matchesArtist = t.artist?.name?.toLowerCase().includes(query);
        const matchesAlbum = t.album?.title?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesArtist && !matchesAlbum) return false;
      }
      if (adminArtistFilter !== 'ALL' && t.artistId !== adminArtistFilter) {
        return false;
      }
      if (adminTypeFilter === 'ALBUM' && !t.albumId) return false;
      if (adminTypeFilter === 'SINGLE' && t.albumId) return false;
      return true;
    })
    .sort((a, b) => {
      if (adminSortBy === 'plays-desc') return (b.plays || 0) - (a.plays || 0);
      if (adminSortBy === 'plays-asc') return (a.plays || 0) - (b.plays || 0);
      if (adminSortBy === 'title') return a.title.localeCompare(b.title);
      if (adminSortBy === 'duration') return b.duration - a.duration;
      return 0;
    });

  // Artist specific data
  const artistAlbums = albums.filter(
    (al) => al.artistId === user?.artistId || al.artist?.name === user?.name
  );
  const artistTracks = tracks.filter(
    (t) => t.artistId === user?.artistId || t.artist?.name === user?.name
  );
  const artistSingles = artistTracks.filter((t) => !t.albumId);

  return (
    <div className="p-8 pb-32 text-left space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-purple-400'}`} />
            <h1 className="text-3xl font-extrabold text-white">
              {isAdmin ? 'Platform Admin Console' : 'Artist Creator Studio'}
            </h1>
          </div>
          <p className="text-sm text-spotify-muted">
            {isAdmin
              ? 'Complete administrative authority over catalogue moderation, search/filter, and song deletion.'
              : `Welcome back, ${user?.name}. Manage your categorized discography, release singles or full albums.`}
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-xl border flex items-center gap-2 self-start ${
            isAdmin
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
          }`}
        >
          {isAdmin ? <Shield className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span className="text-xs font-mono font-bold uppercase">{user?.role} ACCESS</span>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <p className="text-xs font-semibold text-spotify-muted uppercase">
            {isAdmin ? 'Total Catalogue Tracks' : 'Your Tracks'}
          </p>
          <p className="text-3xl font-extrabold text-white">
            {isAdmin ? tracks.length : artistTracks.length}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <p className="text-xs font-semibold text-spotify-muted uppercase">
            {isAdmin ? 'Active Albums' : 'Your Albums'}
          </p>
          <p className="text-3xl font-extrabold text-white">
            {isAdmin ? albums.length : artistAlbums.length}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <p className="text-xs font-semibold text-spotify-muted uppercase">
            {isAdmin ? 'Registered Artists' : 'Standalone Singles'}
          </p>
          <p className="text-3xl font-extrabold text-white">
            {isAdmin ? artists.length : artistSingles.length}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <p className="text-xs font-semibold text-spotify-muted uppercase">Total Plays Logged</p>
          <p className="text-3xl font-extrabold text-spotify-green">
            {formatNumber(
              (isAdmin ? tracks : artistTracks).reduce((acc, t) => acc + (t.plays || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Creation Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Publish Track Form */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-spotify-green" />
            <h2 className="text-lg font-bold text-white">Publish New Track</h2>
          </div>

          {trackMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                trackMsg.includes('success')
                  ? 'bg-spotify-green/20 text-spotify-green border-spotify-green/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              {trackMsg}
            </div>
          )}

          <form onSubmit={handleCreateTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Track Title *
              </label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="e.g. Electric Dreams"
                required
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  value={trackDuration}
                  onChange={(e) => setTrackDuration(e.target.value)}
                  className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                  Assign Category
                </label>
                <select
                  value={trackAlbumId}
                  onChange={(e) => setTrackAlbumId(e.target.value)}
                  className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                >
                  <option value="">Standalone Single (No Album)</option>
                  {(isAdmin ? albums : artistAlbums).map((al) => (
                    <option key={al.id} value={al.id}>
                      Album: {al.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                  Assign Artist
                </label>
                <select
                  value={trackArtistId}
                  onChange={(e) => setTrackArtistId(e.target.value)}
                  className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                >
                  {artists.map((ar) => (
                    <option key={ar.id} value={ar.id}>
                      {ar.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Audio Stream Source URL
              </label>
              <input
                type="url"
                value={trackAudioUrl}
                onChange={(e) => setTrackAudioUrl(e.target.value)}
                placeholder="Optional (defaults to audio synthesizer or internal stream buffer)"
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black text-sm font-bold shadow transition-all hover:scale-[1.02]"
            >
              Publish Track
            </button>
          </form>
        </div>

        {/* Release Album Form */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Release New Album</h2>
          </div>

          {albumMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                albumMsg.includes('success')
                  ? 'bg-spotify-green/20 text-spotify-green border-spotify-green/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              {albumMsg}
            </div>
          )}

          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Album Title *
              </label>
              <input
                type="text"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="e.g. Neon Horizon Epilogue"
                required
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                  Release Year
                </label>
                <input
                  type="number"
                  value={albumYear}
                  onChange={(e) => setAlbumYear(e.target.value)}
                  className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {isAdmin ? (
                <div>
                  <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                    Artist
                  </label>
                  <select
                    value={albumArtistId}
                    onChange={(e) => setAlbumArtistId(e.target.value)}
                    className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {artists.map((ar) => (
                      <option key={ar.id} value={ar.id}>
                        {ar.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                    Artist
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full bg-[#282828]/50 text-spotify-muted text-sm rounded-lg px-3 py-2.5 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
                Cover Art URL
              </label>
              <input
                type="url"
                value={albumCover}
                onChange={(e) => setAlbumCover(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#282828] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow transition-all hover:scale-[1.02]"
            >
              Create Album
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 1: IF ADMIN - SHOW ADVANCED SEARCH & FILTER MODERATION TABLE (WITH DELETE) */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>All Tracks Moderation & Catalogue Search (Admin Only)</span>
              </h2>
              <p className="text-xs text-spotify-muted">
                Showing {filteredAdminTracks.length} of {tracks.length} tracks registered across all artists. Deleting tracks is accessible exclusively by Admin.
              </p>
            </div>
          </div>

          {/* Admin Search Bar & Filter Controls */}
          <div className="p-4 bg-[#181818] rounded-xl border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-muted pointer-events-none" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search tracks by title, artist, or album..."
                  className="w-full bg-[#282828] text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all"
                />
              </div>

              {/* Filter: Artist */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-spotify-muted flex-shrink-0" />
                <select
                  value={adminArtistFilter}
                  onChange={(e) => setAdminArtistFilter(e.target.value)}
                  className="bg-[#282828] text-white text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green cursor-pointer"
                >
                  <option value="ALL">All Artists</option>
                  {artists.map((ar) => (
                    <option key={ar.id} value={ar.id}>
                      {ar.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Release Type */}
              <select
                value={adminTypeFilter}
                onChange={(e) => setAdminTypeFilter(e.target.value)}
                className="bg-[#282828] text-white text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">All Releases</option>
                <option value="ALBUM">Album Tracks Only</option>
                <option value="SINGLE">Singles Only</option>
              </select>

              {/* Sort By */}
              <select
                value={adminSortBy}
                onChange={(e) => setAdminSortBy(e.target.value)}
                className="bg-[#282828] text-white text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green cursor-pointer w-full sm:w-auto"
              >
                <option value="plays-desc">Most Plays</option>
                <option value="plays-asc">Fewest Plays</option>
                <option value="title">Title (A-Z)</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>
          </div>

          {/* Admin Moderation Track List with WORKING DELETE */}
          <div className="bg-[#181818] rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            {filteredAdminTracks.length === 0 ? (
              <div className="py-12 text-center text-spotify-muted">
                <p className="text-sm font-semibold text-white">No tracks match your filters</p>
                <p className="text-xs mt-1">Try clearing the search query or changing filters</p>
              </div>
            ) : (
              filteredAdminTracks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => handleTrackPlay(t, filteredAdminTracks)}
                      className="w-10 h-10 rounded bg-[#282828] flex-shrink-0 flex items-center justify-center text-white group-hover:bg-spotify-green group-hover:text-black transition-colors"
                    >
                      {currentTrack?.id === t.id && isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      )}
                    </button>
                    <img
                      src={
                        t.album?.coverArt ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                      }
                      alt={t.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-white truncate">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-spotify-muted">
                        <span className="text-white/80 font-medium">{t.artist?.name}</span>
                        <span>•</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${
                            t.albumId
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {t.album?.title ? `Album: ${t.album.title}` : 'Single'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-spotify-muted">
                      {formatNumber(t.plays)} plays
                    </span>
                    <span className="text-xs font-mono text-spotify-muted">
                      {formatTime(t.duration)}
                    </span>
                    {/* WORKING DELETE BUTTON (ADMIN ONLY) */}
                    <button
                      onClick={() => handleDeleteTrack(t.id)}
                      className="p-2 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete track from platform (Admin Only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: IF ARTIST - SHOW CATEGORIZED TABS: ALBUMS vs SINGLES */}
      {!isAdmin && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Discography Management</span>
              </h2>
              <p className="text-xs text-spotify-muted">
                Easily organize and review your catalogue by Albums and Standalone Singles.
              </p>
            </div>

            {/* Category Toggle Tabs */}
            <div className="flex items-center bg-[#242424] p-1 rounded-lg">
              <button
                onClick={() => setArtistViewCategory('albums')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  artistViewCategory === 'albums'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-spotify-muted hover:text-white'
                }`}
              >
                <Disc3 className="w-3.5 h-3.5" />
                <span>Albums ({artistAlbums.length})</span>
              </button>
              <button
                onClick={() => setArtistViewCategory('singles')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  artistViewCategory === 'singles'
                    ? 'bg-spotify-green text-black shadow'
                    : 'text-spotify-muted hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Singles & EPs ({artistSingles.length})</span>
              </button>
            </div>
          </div>

          {/* Category 1: ALBUMS LIST & ACCORDIONS */}
          {artistViewCategory === 'albums' && (
            <div className="space-y-4">
              {artistAlbums.length === 0 ? (
                <div className="py-12 text-center text-spotify-muted bg-[#181818] rounded-xl border border-white/5">
                  <Disc3 className="w-10 h-10 mx-auto text-spotify-muted/50 mb-2" />
                  <p className="text-sm font-semibold text-white">No albums released yet</p>
                  <p className="text-xs">Use the "Release New Album" form above to create your first album!</p>
                </div>
              ) : (
                artistAlbums.map((album) => {
                  const albumTrackList = tracks.filter((t) => t.albumId === album.id);
                  const isExpanded = expandedAlbums[album.id];

                  return (
                    <div
                      key={album.id}
                      className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden transition-all shadow-md"
                    >
                      {/* Album Header Bar */}
                      <div
                        onClick={() => toggleAlbumExpand(album.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={album.coverArt}
                            alt={album.title}
                            className="w-14 h-14 rounded-lg object-cover shadow"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-white">{album.title}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300">
                                {album.releaseYear}
                              </span>
                            </div>
                            <p className="text-xs text-spotify-muted mt-0.5">
                              {albumTrackList.length} {albumTrackList.length === 1 ? 'song' : 'songs'} •{' '}
                              {formatTime(
                                albumTrackList.reduce((sum, t) => sum + (t.duration || 0), 0)
                              )}{' '}
                              total duration
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-spotify-muted hidden sm:inline">
                            {isExpanded ? 'Hide Tracklist' : 'View Tracklist'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-white" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-spotify-muted" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Album Tracklist */}
                      {isExpanded && (
                        <div className="border-t border-white/5 bg-[#121212]/80 divide-y divide-white/5 px-4 py-2">
                          {albumTrackList.length === 0 ? (
                            <p className="py-4 text-xs text-spotify-muted italic text-center">
                              No tracks in this album yet. Select this album when publishing a new track above!
                            </p>
                          ) : (
                            albumTrackList.map((t, idx) => (
                              <div
                                key={t.id}
                                className="py-2.5 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-colors group"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <span className="text-xs font-mono text-spotify-muted w-4">
                                    {idx + 1}
                                  </span>
                                  <button
                                    onClick={() => handleTrackPlay(t, albumTrackList)}
                                    className="w-8 h-8 rounded bg-[#282828] flex items-center justify-center text-white group-hover:bg-spotify-green group-hover:text-black transition-colors"
                                  >
                                    {currentTrack?.id === t.id && isPlaying ? (
                                      <Pause className="w-4 h-4 fill-current" />
                                    ) : (
                                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                                    )}
                                  </button>
                                  <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                                    <p className="text-xs text-spotify-muted">
                                      {formatNumber(t.plays)} plays
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <span className="text-xs font-mono text-spotify-muted">
                                    {formatTime(t.duration)}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Category 2: STANDALONE SINGLES & EPS */}
          {artistViewCategory === 'singles' && (
            <div className="bg-[#181818] rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {artistSingles.length === 0 ? (
                <div className="py-12 text-center text-spotify-muted">
                  <Music className="w-10 h-10 mx-auto text-spotify-muted/50 mb-2" />
                  <p className="text-sm font-semibold text-white">No standalone singles</p>
                  <p className="text-xs">Publish a track with "Standalone Single" to see it categorized here.</p>
                </div>
              ) : (
                artistSingles.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs font-mono text-spotify-muted w-4">{idx + 1}</span>
                      <button
                        onClick={() => handleTrackPlay(t, artistSingles)}
                        className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center text-white group-hover:bg-spotify-green group-hover:text-black transition-colors"
                      >
                        {currentTrack?.id === t.id && isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        )}
                      </button>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-white truncate">{t.title}</p>
                        <p className="text-xs text-spotify-muted">
                          Standalone Single • {formatNumber(t.plays)} plays
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-spotify-muted">
                        {formatTime(t.duration)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudioPage;
