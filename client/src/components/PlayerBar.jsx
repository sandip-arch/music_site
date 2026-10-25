import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  Maximize2,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatTime } from '../utils/formatters';

export const PlayerBar = ({ onOpenQueueModal }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackProgress,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    likedTrackIds,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
  } = usePlayerStore();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  const handleScrubberChange = (e) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
  };

  const handleScrubberCommit = (e) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
    setIsScrubbing(false);
  };

  const currentDisplayTime = isScrubbing ? scrubValue : currentTime;
  const currentTotalDuration = duration || currentTrack?.duration || 0;

  return (
    <footer className="h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between select-none z-40 fixed bottom-0 left-0 right-0">
      {/* Left: Current Track Details */}
      <div className="flex items-center gap-4 w-1/4 min-w-[180px] max-w-[320px]">
        {currentTrack ? (
          <>
            <img
              src={
                currentTrack.album?.coverArt ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
              }
              alt={currentTrack.title}
              className="w-14 h-14 rounded object-cover shadow-md flex-shrink-0"
            />
            <div className="overflow-hidden pr-2">
              <Link
                to={currentTrack.albumId ? `/album/${currentTrack.albumId}` : '#'}
                className="text-sm font-medium text-white hover:underline truncate block"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </Link>
              <Link
                to={currentTrack.artistId ? `/artist/${currentTrack.artistId}` : '#'}
                className="text-xs text-spotify-muted hover:text-white hover:underline truncate block"
              >
                {currentTrack.artist?.name || 'Unknown Artist'}
              </Link>
            </div>
            <button
              onClick={() => toggleLike(currentTrack.id)}
              className="text-spotify-muted hover:text-white hover:scale-110 transition-all p-1"
              aria-label={isLiked ? 'Unlike track' : 'Like track'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'text-spotify-green fill-spotify-green' : 'text-spotify-muted'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded bg-[#282828] flex items-center justify-center text-spotify-muted">
              <ListMusic className="w-6 h-6" />
            </div>
            <div className="text-xs text-spotify-muted">
              <p className="font-medium text-white/80">No track playing</p>
              <p>Select a track to stream</p>
            </div>
          </div>
        )}
      </div>

      {/* Center: Playback Controls & Track Scrubber */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl px-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-6">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            className={`transition-colors relative ${
              isShuffle ? 'text-spotify-green' : 'text-spotify-muted hover:text-white'
            }`}
            title="Enable shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="w-1 h-1 bg-spotify-green rounded-full absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Previous Button */}
          <button
            onClick={prevTrack}
            className="text-spotify-muted hover:text-white transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause Main Button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-all shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={nextTrack}
            className="text-spotify-muted hover:text-white transition-colors"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={toggleRepeat}
            className={`transition-colors relative ${
              repeatMode !== 'off' ? 'text-spotify-green' : 'text-spotify-muted hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="w-1 h-1 bg-spotify-green rounded-full absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
            )}
          </button>
        </div>

        {/* Scrubber Range Bar */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-spotify-muted w-10 text-right">
            {formatTime(currentDisplayTime)}
          </span>

          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max={currentTotalDuration || 100}
              step="0.1"
              value={isScrubbing ? scrubValue : currentTime}
              onMouseDown={() => setIsScrubbing(true)}
              onTouchStart={() => setIsScrubbing(true)}
              onChange={handleScrubberChange}
              onMouseUp={handleScrubberCommit}
              onTouchEnd={handleScrubberCommit}
              className="w-full h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer group-hover:h-1.5 transition-all accent-white"
              style={{
                background: `linear-gradient(to right, #1DB954 ${
                  currentTotalDuration > 0
                    ? (currentDisplayTime / currentTotalDuration) * 100
                    : 0
                }%, #4d4d4d ${
                  currentTotalDuration > 0
                    ? (currentDisplayTime / currentTotalDuration) * 100
                    : 0
                }%)`,
              }}
            />
          </div>

          <span className="text-[11px] font-mono text-spotify-muted w-10 text-left">
            {formatTime(currentTotalDuration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {/* Queue button */}
        <button
          onClick={onOpenQueueModal}
          className="text-spotify-muted hover:text-white transition-colors"
          title="Playback Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Mute/Volume Icon */}
        <button
          onClick={toggleMute}
          className="text-spotify-muted hover:text-white transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : volume < 0.5 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Volume Slider */}
        <div className="w-24 flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer hover:h-1.5 transition-all accent-white"
            style={{
              background: `linear-gradient(to right, #ffffff ${
                (isMuted ? 0 : volume) * 100
              }%, #4d4d4d ${(isMuted ? 0 : volume) * 100}%)`,
            }}
          />
        </div>
      </div>
    </footer>
  );
};

export default PlayerBar;
