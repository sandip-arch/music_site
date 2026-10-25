import { create } from 'zustand';
import { trackApi } from '../api/client';

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  previousVolume: 0.8,
  isMuted: false,
  queue: [],
  queueIndex: 0,
  currentTime: 0,
  duration: 0,
  playbackProgress: 0, // 0 - 100 percentage
  isShuffle: false,
  repeatMode: 'off', // 'off' | 'all' | 'one'
  likedTrackIds: [],
  audioElement: null,

  setAudioElement: (element) => set({ audioElement: element }),

  playTrack: (track, newQueue = null) => {
    const { queue, queueIndex } = get();
    let updatedQueue = queue;
    let newIndex = queueIndex;

    if (newQueue && newQueue.length > 0) {
      updatedQueue = newQueue;
      newIndex = newQueue.findIndex((t) => t.id === track.id);
      if (newIndex === -1) {
        updatedQueue = [track, ...newQueue];
        newIndex = 0;
      }
    } else if (!queue.some((t) => t.id === track.id)) {
      updatedQueue = [...queue, track];
      newIndex = updatedQueue.length - 1;
    } else {
      newIndex = updatedQueue.findIndex((t) => t.id === track.id);
    }

    set({
      currentTrack: track,
      queue: updatedQueue,
      queueIndex: newIndex,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      playbackProgress: 0,
    });

    const audio = get().audioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.log('Audio autoplay prevented:', err));
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue, audioElement } = get();
    if (!currentTrack) {
      if (queue.length > 0) {
        get().playTrack(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      audioElement?.pause();
      set({ isPlaying: false });
    } else {
      audioElement?.play().catch(console.error);
      set({ isPlaying: true });
    }
  },

  nextTrack: () => {
    const { queue, queueIndex, isShuffle, repeatMode, playTrack } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      const audio = get().audioElement;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
      return;
    }

    let nextIndex = queueIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    const nextTrackItem = queue[nextIndex];
    if (nextTrackItem) {
      set({ queueIndex: nextIndex });
      playTrack(nextTrackItem);
    }
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime, playTrack, audioElement } = get();
    if (currentTime > 3 && audioElement) {
      audioElement.currentTime = 0;
      set({ currentTime: 0, playbackProgress: 0 });
      return;
    }

    if (queue.length === 0) return;
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrackItem = queue[prevIndex];
    if (prevTrackItem) {
      set({ queueIndex: prevIndex });
      playTrack(prevTrackItem);
    }
  },

  setVolume: (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    const audio = get().audioElement;
    if (audio) {
      audio.volume = clamped;
    }
    set({
      volume: clamped,
      isMuted: clamped === 0,
      previousVolume: clamped > 0 ? clamped : get().previousVolume,
    });
  },

  toggleMute: () => {
    const { isMuted, volume, previousVolume, audioElement } = get();
    if (isMuted) {
      const restoreVol = previousVolume || 0.8;
      if (audioElement) audioElement.volume = restoreVol;
      set({ isMuted: false, volume: restoreVol });
    } else {
      if (audioElement) audioElement.volume = 0;
      set({ isMuted: true, volume: 0, previousVolume: volume });
    }
  },

  seekTo: (seconds) => {
    const { audioElement, duration } = get();
    const clamped = Math.max(0, Math.min(seconds, duration || 0));
    if (audioElement) {
      audioElement.currentTime = clamped;
    }
    set({
      currentTime: clamped,
      playbackProgress: duration ? (clamped / duration) * 100 : 0,
    });
  },

  updateProgress: (currentTime, duration) => {
    const validDuration = duration || get().currentTrack?.duration || 0;
    set({
      currentTime,
      duration: validDuration,
      playbackProgress: validDuration ? (currentTime / validDuration) * 100 : 0,
    });
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      const modes = ['off', 'all', 'one'];
      const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
      return { repeatMode: nextMode };
    });
  },

  addToQueue: (track) => {
    set((state) => {
      if (state.queue.some((t) => t.id === track.id)) return state;
      return { queue: [...state.queue, track] };
    });
  },

  setLikedTrackIds: (ids) => set({ likedTrackIds: ids }),

  toggleLike: async (trackId) => {
    const { likedTrackIds } = get();
    const isLiked = likedTrackIds.includes(trackId);
    const updated = isLiked
      ? likedTrackIds.filter((id) => id !== trackId)
      : [...likedTrackIds, trackId];

    set({ likedTrackIds: updated });

    try {
      await trackApi.toggleLike(trackId);
    } catch (err) {
      console.error('Failed to toggle like on server:', err);
      // Revert if API failed
      set({ likedTrackIds });
    }
  },
}));
