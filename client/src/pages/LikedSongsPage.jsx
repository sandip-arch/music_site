import React, { useEffect, useState } from 'react';
import { Heart, Play, Pause, Music2 } from 'lucide-react';
import { trackApi } from '../api/client';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { TrackTable } from '../components/TrackTable';

export const LikedSongsPage = ({ onAddToPlaylist }) => {
  const [likedTracks, setLikedTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds } = usePlayerStore();
  const { user } = useAuthStore();

  const loadLikedTracks = async () => {
    try {
      setLoading(true);
      const res = await trackApi.getLikedTracks();
      setLikedTracks(res.data);
    } catch (err) {
      console.error('Failed to load liked tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikedTracks();
  }, [user, likedTrackIds]);

  const isPlayingLiked =
    isPlaying && likedTracks.some((t) => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (likedTracks.length === 0) return;
    if (isPlayingLiked) {
      togglePlay();
    } else {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  return (
    <div className="pb-32 text-left">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-b from-indigo-900/60 via-[#181818]/60 to-transparent flex flex-col sm:flex-row items-end gap-6 pt-12">
        <div className="w-52 h-52 rounded bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center text-white shadow-2xl flex-shrink-0">
          <Heart className="w-24 h-24 fill-white" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Playlist
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            Liked Songs
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-spotify-muted pt-1">
            <span className="text-white font-bold">{user?.name || 'Listener'}</span>
            <span>•</span>
            <span>{likedTracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="px-8 py-5 flex items-center gap-6">
        <button
          onClick={handlePlayAll}
          disabled={likedTracks.length === 0}
          className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title={isPlayingLiked ? 'Pause' : 'Play all'}
        >
          {isPlayingLiked ? (
            <Pause className="w-6 h-6 fill-black" />
          ) : (
            <Play className="w-6 h-6 fill-black translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Tracks Table */}
      <div className="px-8">
        {loading ? (
          <div className="py-20 text-center text-spotify-muted">
            <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading your liked songs...</p>
          </div>
        ) : likedTracks.length === 0 ? (
          <div className="py-20 text-center text-spotify-muted space-y-2">
            <Music2 className="w-12 h-12 mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-white">Songs you like will appear here</h3>
            <p className="text-xs">Save songs by tapping the heart icon</p>
          </div>
        ) : (
          <TrackTable tracks={likedTracks} onAddToPlaylist={onAddToPlaylist} />
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;
