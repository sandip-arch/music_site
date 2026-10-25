import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { playlistApi } from '../api/client';

export const CreatePlaylistModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverArt, setCoverArt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Playlist name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await playlistApi.createPlaylist({
        name: name.trim(),
        description: description.trim(),
        coverArt: coverArt.trim() || undefined,
      });

      window.dispatchEvent(new Event('playlist-created'));
      if (onCreated) onCreated(res.data);
      setName('');
      setDescription('');
      setCoverArt('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl border border-white/10 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-spotify-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Create Playlist</h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/20 text-red-300 text-xs border border-red-500/40">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              className="w-full bg-[#3e3e3e] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a catchy description"
              rows="3"
              className="w-full bg-[#3e3e3e] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-spotify-muted uppercase mb-1">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              value={coverArt}
              onChange={(e) => setCoverArt(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#3e3e3e] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black text-sm font-bold shadow transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
