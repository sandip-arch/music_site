import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { API_BASE_URL } from '../api/client';

export const AudioEngine = () => {
  const audioRef = useRef(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    setAudioElement,
    updateProgress,
    nextTrack,
    repeatMode,
  } = usePlayerStore();

  // Register the audio element in the store once mounted
  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  // Handle source changes when currentTrack updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Use our HTTP 206 Partial Content streaming endpoint
    const streamUrl = `${API_BASE_URL}/tracks/stream/${currentTrack.id}`;
    
    // Only update src if it differs to prevent reloading audio unnecessarily
    if (audio.src !== streamUrl) {
      audio.src = streamUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Playback initiation note:', err.message);
        });
      }
    }
  }, [currentTrack]);

  // Synchronize play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch((err) => console.warn('Play error:', err.message));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Synchronize volume and mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    updateProgress(audio.currentTime, audio.duration || currentTrack?.duration || 0);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.duration && !isNaN(audio.duration)) {
      updateProgress(audio.currentTime, audio.duration);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    } else {
      nextTrack();
    }
  };

  return (
    <audio
      ref={audioRef}
      id="spotify-audio-player"
      preload="auto"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onError={(e) => {
        console.warn('Audio stream element error:', e);
      }}
    />
  );
};

export default AudioEngine;
