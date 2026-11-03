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

  const { user, isAuthenticated } = useAuthStore();
  const { likedTrackIds } = usePlayerStore();

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const [plRes, alRes] = await Promise.all([
        isAuthenticated ? playlistApi.getPlaylists({ mine: true }) : Promise.resolve({ data: [] }),
        albumApi.getAlbums(),
      ]);
      setPlaylists(plRes.data || []);
      setAlbums(alRes.data || []);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
    window.addEventListener('playlist-created', fetchLibrary);
    return () => window.removeEventListener('playlist-created', fetchLibrary);
  }, [user, isAuthenticated]);

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

      {loading ? (
        <div className="py-20 text-center text-spotify-muted">
          <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading your collection...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {/* Liked Songs Tile */}
          {(activeFilter === 'all' || activeFilter === 'playlists') && (
            <Link
              to="/liked"
              className="col-span-2 bg-gradient-to-br from-indigo-800 via-indigo-950 to-[#181818] p-5 rounded-lg flex flex-col justify-end min-h-[190px] relative group hover:scale-[1.02] transition-transform shadow-lg cursor-pointer"
            >
              <div className="space-y-1">
                <Heart className="w-8 h-8 fill-white text-white mb-2" />
                <h3 className="text-2xl font-black text-white">Liked Songs</h3>
                <p className="text-xs text-white/80 font-medium">
                  {likedTrackIds.length} {likedTrackIds.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </Link>
          )}

          {/* User Playlists */}
          {(activeFilter === 'all' || activeFilter === 'playlists') &&
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all duration-200 group block border border-transparent hover:border-white/5"
              >
                <div className="relative mb-4 aspect-square rounded-md overflow-hidden shadow-md">
                  <img
                    src={playlist.coverArt}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-sm text-white truncate mb-1">{playlist.name}</h3>
                <p className="text-xs text-spotify-muted truncate">
                  By {playlist.user?.name || 'You'} • {playlist._count?.tracks || 0} songs
                </p>
              </Link>
            ))}

          {/* Albums */}
          {(activeFilter === 'all' || activeFilter === 'albums') &&
            albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all duration-200 group block border border-transparent hover:border-white/5"
              >
                <div className="relative mb-4 aspect-square rounded-md overflow-hidden shadow-md">
                  <img
                    src={album.coverArt}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-sm text-white truncate mb-1">{album.title}</h3>
                <p className="text-xs text-spotify-muted truncate">
                  Album • {album.artist?.name}
                </p>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
