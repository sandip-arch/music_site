import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Clock, Music2, Share2, MoreHorizontal } from 'lucide-react';
import { playlistApi } from '../api/client';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatTime } from '../utils/formatters';
import { TrackTable } from '../components/TrackTable';

export const PlaylistPage = ({ onAddToPlaylist }) => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const playlistTracks = playlist?.tracks?.map((pt) => pt.track).filter(Boolean) || [];
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

  const handleDeleteTrackFromPlaylist = async (track) => {
    try {
      await playlistApi.removeTrack(id, track.id);
      loadPlaylist();
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  };

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
          className="w-52 h-52 object-cover rounded shadow-2xl flex-shrink-0"
        />

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-sm text-spotify-muted max-w-xl leading-relaxed">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-spotify-muted pt-1">
            <span className="text-white font-bold">{playlist.user?.name || 'Spotify'}</span>
            <span>•</span>
            <span>{playlistTracks.length} songs</span>
            <span>•</span>
            <span>{formatTotalTime(playlist.totalDuration || 0)}</span>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="px-8 py-5 flex items-center gap-6">
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

      {/* Tracks Table */}
      <div className="px-8">
        {playlistTracks.length === 0 ? (
          <div className="py-16 text-center text-spotify-muted space-y-2">
            <Music2 className="w-10 h-10 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-white">This playlist is empty</p>
            <p className="text-xs">Find songs and add them using the '+' button</p>
          </div>
        ) : (
          <TrackTable
            tracks={playlistTracks}
            onAddToPlaylist={onAddToPlaylist}
            onDeleteTrack={handleDeleteTrackFromPlaylist}
          />
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
