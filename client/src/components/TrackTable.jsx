import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart, Clock, Plus, Trash2, Volume2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatTime, formatNumber } from '../utils/formatters';

export const TrackTable = ({
  tracks = [],
  showAlbum = true,
  onAddToPlaylist,
  onDeleteTrack,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds, toggleLike } =
    usePlayerStore();
  const { user } = useAuthStore();

  const handleTrackClick = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  const isCurrentTrack = (trackId) => currentTrack?.id === trackId;

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[16px_4fr_3fr_1fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-spotify-muted uppercase tracking-wider select-none">
        <span className="text-center">#</span>
        <span>Title</span>
        {showAlbum && <span>Album</span>}
        <span className="hidden sm:inline text-right">Plays</span>
        <span className="flex items-center justify-end pr-4">
          <Clock className="w-4 h-4" />
        </span>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-transparent mt-1">
        {tracks.map((track, index) => {
          const isPlayingThis = isCurrentTrack(track.id) && isPlaying;
          const isSelectedThis = isCurrentTrack(track.id);
          const isLiked = likedTrackIds.includes(track.id);

          // Strictly accessible only by ADMIN as requested
          const canDelete = user?.role === 'ADMIN';

          return (
            <div
              key={track.id || index}
              className={`grid grid-cols-[16px_4fr_3fr_1fr_minmax(120px,1fr)] gap-4 px-4 py-2.5 rounded-md items-center text-sm group hover:bg-white/10 transition-colors ${
                isSelectedThis ? 'bg-white/10' : ''
              }`}
            >
              {/* Index or Play icon */}
              <div className="flex items-center justify-center">
                <span
                  className={`group-hover:hidden text-xs font-mono ${
                    isSelectedThis ? 'text-spotify-green font-bold' : 'text-spotify-muted'
                  }`}
                >
                  {isPlayingThis ? (
                    <Volume2 className="w-4 h-4 text-spotify-green animate-pulse" />
                  ) : (
                    index + 1
                  )}
                </span>
                <button
                  onClick={() => handleTrackClick(track)}
                  className="hidden group-hover:flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  {isPlayingThis ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Title & Artist */}
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={
                    track.album?.coverArt ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                  }
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0 shadow-sm"
                />
                <div className="overflow-hidden">
                  <p
                    onClick={() => handleTrackClick(track)}
                    className={`font-medium truncate cursor-pointer hover:underline ${
                      isSelectedThis ? 'text-spotify-green font-semibold' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </p>
                  <Link
                    to={track.artistId ? `/artist/${track.artistId}` : '#'}
                    className="text-xs text-spotify-muted hover:text-white hover:underline truncate block"
                  >
                    {track.artist?.name || 'Unknown Artist'}
                  </Link>
                </div>
              </div>

              {/* Album */}
              {showAlbum && (
                <div className="overflow-hidden">
                  <Link
                    to={track.albumId ? `/album/${track.albumId}` : '#'}
                    className="text-spotify-muted hover:text-white hover:underline text-xs truncate block"
                  >
                    {track.album?.title || 'Single'}
                  </Link>
                </div>
              )}

              {/* Plays count */}
              <div className="hidden sm:block text-right text-xs text-spotify-muted font-mono">
                {formatNumber(track.plays || 0)}
              </div>

              {/* Action Buttons & Duration */}
              <div className="flex items-center justify-end gap-3 text-xs text-spotify-muted font-mono pr-2">
                {/* Like Button */}
                <button
                  onClick={() => toggleLike(track.id)}
                  className={`transition-colors p-1 ${
                    isLiked
                      ? 'text-spotify-green'
                      : 'opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                  title={isLiked ? 'Remove from Liked' : 'Save to Liked'}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? 'fill-spotify-green' : ''}`}
                  />
                </button>

                {/* Add to Playlist Button */}
                {onAddToPlaylist && (
                  <button
                    onClick={() => onAddToPlaylist(track)}
                    className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity p-1"
                    title="Add to Playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}

                {/* Delete Button: Strictly Admin Only */}
                {canDelete && onDeleteTrack && (
                  <button
                    onClick={() => onDeleteTrack(track)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                    title="Delete track from platform (Admin Only)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Duration */}
                <span className="w-10 text-right">{formatTime(track.duration)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackTable;
