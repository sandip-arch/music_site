import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { albumApi } from '../api/client';
import { usePlayerStore } from '../store/usePlayerStore';
import { TrackTable } from '../components/TrackTable';

export const AlbumPage = ({ onAddToPlaylist }) => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        setLoading(true);
        const res = await albumApi.getAlbumById(id);
        setAlbum(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load album');
      } finally {
        setLoading(false);
      }
    };
    loadAlbum();
  }, [id]);

  const albumTracks = album?.tracks || [];
  const isPlayingCurrentAlbum =
    isPlaying && albumTracks.some((t) => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (albumTracks.length === 0) return;
    if (isPlayingCurrentAlbum) {
      togglePlay();
    } else {
      playTrack(albumTracks[0], albumTracks);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-spotify-muted">
        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading album...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="p-12 text-center text-spotify-muted space-y-3">
        <h2 className="text-xl font-bold text-white">Album Not Found</h2>
        <Link to="/" className="text-spotify-green hover:underline text-sm font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 text-left">
      {/* Header Banner */}
      <div className="p-8 bg-gradient-to-b from-blue-900/40 via-[#181818]/60 to-transparent flex flex-col sm:flex-row items-end gap-6 pt-12">
        <img
          src={album.coverArt}
          alt={album.title}
          className="w-52 h-52 object-cover rounded shadow-2xl flex-shrink-0"
        />

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Album
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            {album.title}
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-spotify-muted pt-1">
            <Link
              to={`/artist/${album.artistId}`}
              className="text-white font-bold hover:underline"
            >
              {album.artist?.name}
            </Link>
            <span>•</span>
            <span>{album.releaseYear}</span>
            <span>•</span>
            <span>{albumTracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="px-8 py-5 flex items-center gap-6">
        <button
          onClick={handlePlayAll}
          disabled={albumTracks.length === 0}
          className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title={isPlayingCurrentAlbum ? 'Pause' : 'Play all'}
        >
          {isPlayingCurrentAlbum ? (
            <Pause className="w-6 h-6 fill-black" />
          ) : (
            <Play className="w-6 h-6 fill-black translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Tracks Table */}
      <div className="px-8">
        <TrackTable
          tracks={albumTracks}
          showAlbum={false}
          onAddToPlaylist={onAddToPlaylist}
        />
      </div>
    </div>
  );
};

export default AlbumPage;
