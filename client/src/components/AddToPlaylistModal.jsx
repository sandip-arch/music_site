import React, { useEffect, useState } from 'react';
import { X, Check, Plus, Music } from 'lucide-react';
import { playlistApi } from '../api/client';

export const AddToPlaylistModal = ({ isOpen, onClose, track }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
      setStatusMessage('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const res = await playlistApi.getPlaylists();
      setPlaylists(res.data);
    } catch (err) {
      console.error('Failed to load playlists:', err);
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
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || `Failed to add track to ${playlistName}`
      );
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
          Adding: <span className="text-white font-medium">{track.title}</span>
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

        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            <p className="text-center py-6 text-xs text-spotify-muted">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-center py-6 text-xs text-spotify-muted">No playlists found</p>
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
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
