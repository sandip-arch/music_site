import React from 'react';
import { X, Play, Music, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatTime } from '../utils/formatters';

export const QueueModal = ({ isOpen, onClose }) => {
  const { queue, queueIndex, currentTrack, playTrack } = usePlayerStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-[#181818] w-full max-w-md h-full p-6 shadow-2xl border-l border-white/10 flex flex-col text-left">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-spotify-green" />
            <h3 className="text-lg font-bold text-white">Playback Queue</h3>
          </div>
          <button
            onClick={onClose}
            className="text-spotify-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Now Playing */}
        <div className="mb-6">
          <p className="text-xs font-bold text-spotify-muted uppercase tracking-wider mb-2">
            Now Playing
          </p>
          {currentTrack ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <img
                src={
                  currentTrack.album?.coverArt ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                }
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-spotify-green truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-spotify-muted truncate">
                  {currentTrack.artist?.name || 'Artist'}
                </p>
              </div>
              <span className="text-xs text-spotify-muted font-mono">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-spotify-muted italic">Nothing currently playing</p>
          )}
        </div>

        {/* Next in Queue */}
        <div className="flex-1 overflow-y-auto pr-1">
          <p className="text-xs font-bold text-spotify-muted uppercase tracking-wider mb-2">
            Next Up ({Math.max(0, queue.length - 1)})
          </p>
          {queue.length <= 1 ? (
            <p className="text-xs text-spotify-muted italic py-4">No more tracks in queue</p>
          ) : (
            <div className="space-y-1.5">
              {queue.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, queue)}
                    className={`flex items-center justify-between p-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group ${
                      isCurrent ? 'bg-white/10 border-l-2 border-spotify-green' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs font-mono text-spotify-muted w-4">
                        {idx + 1}
                      </span>
                      <img
                        src={
                          track.album?.coverArt ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                        }
                        alt={track.title}
                        className="w-9 h-9 rounded object-cover flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p
                          className={`text-sm font-medium truncate ${
                            isCurrent ? 'text-spotify-green' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-spotify-muted truncate">
                          {track.artist?.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-spotify-muted font-mono">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueModal;
