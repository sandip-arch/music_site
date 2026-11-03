import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Music2,
  Plus,
  Check,
  Trash2,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { playlistApi, trackApi } from '../api/client';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatTime } from '../utils/formatters';
import { TrackTable } from '../components/TrackTable';

export const PlaylistPage = ({ onAddToPlaylist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & add tracks within playlist
  const [searchQuery, setSearchQuery] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [addingTrackId, setAddingTrackId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { user } = useAuthStore();

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const res = await playlistApi.getPlaylistById(id);
      setPlaylist(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTracks = async () => {
    try {
      setLoadingTracks(true);
      const res = await trackApi.getTracks({ limit: 50 });
      setAllTracks(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load available tracks:', err);
    } finally {
      setLoadingTracks(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
    loadAvailableTracks();
  }, [id]);

  const playlistTracks = playlist?.tracks?.map((pt) => pt.track).filter(Boolean) || [];
  const playlistTrackIds = new Set(playlistTracks.map((t) => t.id));

  const isOwner =
    user &&
    playlist &&
    (playlist.userId === user.id || (!playlist.userId && user.role === 'ADMIN'));

  const isPlayingCurrentPlaylist =
    isPlaying && playlistTracks.some((t) => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (playlistTracks.length === 0) return;
    if (isPlayingCurrentPlaylist) {
      togglePlay();
    } else {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  const handleAddTrack = async (track) => {
    try {
      setAddingTrackId(track.id);
      await playlistApi.addTrack(id, track.id);
      await loadPlaylist();
      window.dispatchEvent(new Event('playlist-created')); // Updates counts in sidebar
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add track');
    } finally {
      setAddingTrackId(null);
    }
  };

  const handleDeleteTrackFromPlaylist = async (track) => {
    try {
      await playlistApi.removeTrack(id, track.id);
      await loadPlaylist();
      window.dispatchEvent(new Event('playlist-created'));
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`)) {
      return;
    }
    try {
      setDeleteLoading(true);
      await playlistApi.deletePlaylist(id);
      window.dispatchEvent(new Event('playlist-created'));
      navigate('/library');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete playlist');
      setDeleteLoading(false);
    }
  };

  // Filter available tracks to recommend or add
  const filteredAvailableTracks = allTracks.filter((track) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = track.title?.toLowerCase().includes(q);
    const artistMatch = track.artist?.name?.toLowerCase().includes(q);
    const albumMatch = track.album?.title?.toLowerCase().includes(q);
    return titleMatch || artistMatch || albumMatch;
  });

  if (loading) {
    return (
      <div className="py-32 text-center text-spotify-muted">
        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading playlist...</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="p-12 text-center text-spotify-muted space-y-3">
        <h2 className="text-xl font-bold text-white">Playlist Not Found</h2>
        <p className="text-sm">{error || 'This playlist might be private or removed.'}</p>
        <Link to="/" className="inline-block mt-4 text-spotify-green hover:underline text-sm font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  const formatTotalTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs} hr ${remMins} min`;
    }
    return `${mins} min`;
  };

  return (
    <div className="pb-32 text-left">
      {/* Hero Banner with Gradient Header */}
      <div className="p-8 bg-gradient-to-b from-emerald-900/40 via-[#181818]/60 to-transparent flex flex-col sm:flex-row items-end gap-6 pt-12">
        <img
          src={
            playlist.coverArt ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'
          }
          alt={playlist.name}
          className="w-48 h-48 sm:w-52 sm:h-52 object-cover rounded shadow-2xl flex-shrink-0"
        />

        <div className="space-y-2 flex-1 overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight truncate">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-sm text-spotify-muted max-w-xl leading-relaxed">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-spotify-muted pt-1 flex-wrap">
            <span className="text-white font-bold">{playlist.user?.name || 'Spotify'}</span>
            <span>•</span>
            <span>{playlistTracks.length} songs</span>
            <span>•</span>
            <span>{formatTotalTime(playlist.totalDuration || 0)}</span>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={handlePlayAll}
            disabled={playlistTracks.length === 0}
            className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title={isPlayingCurrentPlaylist ? 'Pause' : 'Play all'}
          >
            {isPlayingCurrentPlaylist ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black translate-x-0.5" />
            )}
          </button>
        </div>

        {isOwner && (
          <button
            onClick={handleDeletePlaylist}
            disabled={deleteLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-spotify-muted hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Delete this playlist"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Playlist</span>
          </button>
        )}
      </div>

      {/* Tracks Table */}
      <div className="px-8">
        {playlistTracks.length === 0 ? (
          <div className="py-12 text-center text-spotify-muted space-y-2 border border-dashed border-white/10 rounded-xl my-4 p-8">
            <Music2 className="w-10 h-10 mx-auto opacity-40 text-spotify-green" />
            <p className="text-base font-bold text-white">This playlist is currently empty</p>
            <p className="text-xs text-spotify-muted max-w-sm mx-auto">
              Find your favorite songs below and click <span className="text-white font-semibold">"Add"</span> to build your tracklist.
            </p>
          </div>
        ) : (
          <TrackTable
            tracks={playlistTracks}
            onAddToPlaylist={onAddToPlaylist}
            onDeleteTrack={isOwner ? handleDeleteTrackFromPlaylist : null}
            deleteTooltip="Remove from this playlist"
          />
        )}
      </div>

      {/* Add Songs to Playlist Section (Visible to Playlist Owner) */}
      {isOwner && (
        <section className="mt-14 px-8 pt-8 border-t border-white/10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-spotify-green" />
                <span>Add songs to this playlist</span>
              </h2>
              <p className="text-xs text-spotify-muted mt-1">
                Search songs from the music library or pick from recommendations.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-spotify-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, artist, or album..."
                className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white text-xs rounded-full pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-muted hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Recommended/Search Tracks */}
          <div className="space-y-2">
            {loadingTracks ? (
              <p className="text-xs text-spotify-muted py-6 text-center">Loading catalogue...</p>
            ) : filteredAvailableTracks.length === 0 ? (
              <p className="text-xs text-spotify-muted py-6 text-center">No matching songs found.</p>
            ) : (
              filteredAvailableTracks.slice(0, 10).map((track) => {
                const alreadyInPlaylist = playlistTrackIds.has(track.id);
                const isAdding = addingTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0 pr-4">
                      <img
                        src={
                          track.album?.coverArt ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                        }
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-spotify-muted truncate">
                          {track.artist?.name || 'Unknown Artist'} • {track.album?.title || 'Single'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs text-spotify-muted font-mono hidden sm:inline">
                        {formatTime(track.duration)}
                      </span>

                      {alreadyInPlaylist ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-spotify-muted select-none">
                          <Check className="w-3.5 h-3.5 text-spotify-green" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddTrack(track)}
                          disabled={isAdding}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow"
                        >
                          {isAdding ? (
                            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default PlaylistPage;
