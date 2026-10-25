import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Music2, Disc3 } from 'lucide-react';
import { playlistApi, albumApi } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';

export const LibraryPage = ({ onOpenCreatePlaylist }) => {
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'playlists' | 'albums'

  const { user } = useAuthStore();
  const { likedTrackIds } = usePlayerStore();

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        const [plRes, alRes] = await Promise.all([
          playlistApi.getPlaylists(),
          albumApi.getAlbums(),
        ]);
        setPlaylists(plRes.data);
        setAlbums(alRes.data);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [user]);

  return (
    <div className="p-8 pb-32 space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white">Your Library</h1>
        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-sm font-bold shadow hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'all'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-white hover:bg-[#333333]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('playlists')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'playlists'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-white hover:bg-[#333333]'
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveFilter('albums')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'albums'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-white hover:bg-[#333333]'
          }`}
        >
          Albums
        </button>
      </div>

      {/* Grid of Library Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {/* Liked Songs Tile (Shown in All or Playlists) */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <Link
            to="/liked"
            className="col-span-2 sm:col-span-2 p-6 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-900 to-[#181818] hover:scale-[1.02] transition-transform duration-200 flex flex-col justify-end min-h-[180px] shadow-lg relative group"
          >
            <div className="space-y-2">
              <Heart className="w-10 h-10 fill-white text-white mb-2" />
              <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
              <p className="text-sm text-white/80">
                {likedTrackIds.length} liked {likedTrackIds.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </Link>
        )}

        {/* Playlists */}
        {(activeFilter === 'all' || activeFilter === 'playlists') &&
          playlists.map((pl) => (
            <Link
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all group block"
            >
              <img
                src={
                  pl.coverArt ||
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'
                }
                alt={pl.name}
                className="w-full aspect-square rounded-md object-cover mb-3 shadow"
              />
              <h3 className="font-bold text-sm text-white truncate mb-1">{pl.name}</h3>
              <p className="text-xs text-spotify-muted">
                Playlist • {pl.user?.name || 'Spotify'}
              </p>
            </Link>
          ))}

        {/* Albums */}
        {(activeFilter === 'all' || activeFilter === 'albums') &&
          albums.map((al) => (
            <Link
              key={al.id}
              to={`/album/${al.id}`}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all group block"
            >
              <img
                src={al.coverArt}
                alt={al.title}
                className="w-full aspect-square rounded-md object-cover mb-3 shadow"
              />
              <h3 className="font-bold text-sm text-white truncate mb-1">{al.title}</h3>
              <p className="text-xs text-spotify-muted truncate">
                Album • {al.artist?.name}
              </p>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default LibraryPage;
