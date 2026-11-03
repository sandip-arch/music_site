import React, { useEffect, useState } from 'react';
import { X, Check, Plus, FolderPlus, LogIn } from 'lucide-react';
import { playlistApi } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export const AddToPlaylistModal = ({ isOpen, onClose, track, onOpenAuthModal }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Quick inline create playlist state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        loadPersonalPlaylists();
      }
      setStatusMessage('');
      setErrorMessage('');
      setIsCreatingNew(false);
      setNewPlaylistName('');
    }
  }, [isOpen, isAuthenticated]);

  const loadPersonalPlaylists = async () => {
    try {
      setLoading(true);
      const res = await playlistApi.getPlaylists({ mine: true });
      setPlaylists(res.data || []);
    } catch (err) {
      console.error('Failed to load user playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    if (!track) return;
    try {
      setErrorMessage('');
      await playlistApi.addTrack(playlistId, track.id);
      setStatusMessage(`Added "${track.title}" to "${playlistName}"!`);
      window.dispatchEvent(new Event('playlist-created'));
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || `Failed to add track to ${playlistName}`
      );
    }
  };

  const handleQuickCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !track) return;

    try {
      setCreatingLoading(true);
      setErrorMessage('');
      // 1. Create playlist
      const createRes = await playlistApi.createPlaylist({
        name: newPlaylistName.trim(),
        description: `Created for ${track.title}`,
      });
      const newPlaylist = createRes.data;

      // 2. Add track to new playlist
      await playlistApi.addTrack(newPlaylist.id, track.id);
      window.dispatchEvent(new Event('playlist-created'));

      setStatusMessage(`Created "${newPlaylist.name}" and added "${track.title}"!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to create playlist');
    } finally {
      setCreatingLoading(false);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#282828] w-full max-w-sm rounded-xl p-5 shadow-2xl border border-white/10 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-spotify-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Add to Playlist</h3>
        <p className="text-xs text-spotify-muted truncate mb-4">
          Song: <span className="text-white font-medium">{track.title}</span>
        </p>

        {statusMessage && (
          <div className="mb-3 p-2.5 rounded bg-spotify-green/20 text-spotify-green text-xs border border-spotify-green/30 flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded bg-red-500/20 text-red-300 text-xs border border-red-500/40">
            {errorMessage}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-xs text-spotify-muted">
              Log in to create and manage your personal playlists.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuthModal) onOpenAuthModal();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spotify-green text-black font-bold text-xs hover:scale-105 transition-transform"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          </div>
        ) : (
          <>
            {/* Quick Create Playlist Bar */}
            {isCreatingNew ? (
              <form onSubmit={handleQuickCreateAndAdd} className="mb-3 space-y-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="New Playlist Name..."
                  className="w-full bg-[#3e3e3e] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                  autoFocus
                  required
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-3 py-1 rounded text-xs text-spotify-muted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingLoading || !newPlaylistName.trim()}
                    className="px-3 py-1 rounded bg-spotify-green text-black font-bold text-xs disabled:opacity-50"
                  >
                    {creatingLoading ? 'Creating...' : 'Create & Add'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-spotify-green mb-3 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Create New Playlist</span>
              </button>
            )}

            {/* Existing Personal Playlists List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {loading ? (
                <p className="text-center py-6 text-xs text-spotify-muted">Loading your playlists...</p>
              ) : playlists.length === 0 ? (
                <p className="text-center py-6 text-xs text-spotify-muted">
                  You don't have any playlists yet. Click "+ Create New Playlist" above!
                </p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/10 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={playlist.coverArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                        alt={playlist.name}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white group-hover:text-spotify-green truncate">
                          {playlist.name}
                        </p>
                        <p className="text-[11px] text-spotify-muted">
                          {playlist._count?.tracks || 0} tracks
                        </p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-spotify-muted group-hover:text-white" />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
