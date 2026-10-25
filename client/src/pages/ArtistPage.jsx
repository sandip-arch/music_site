import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, CheckCircle2, Disc } from 'lucide-react';
import { artistApi } from '../api/client';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatNumber } from '../utils/formatters';
import { TrackTable } from '../components/TrackTable';

export const ArtistPage = ({ onAddToPlaylist }) => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  useEffect(() => {
    const loadArtist = async () => {
      try {
        setLoading(true);
        const res = await artistApi.getArtistById(id);
        setArtist(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load artist');
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, [id]);

  const artistTracks = artist?.tracks || [];
  const isPlayingArtist =
    isPlaying && artistTracks.some((t) => t.id === currentTrack?.id);

  const handlePlayArtist = () => {
    if (artistTracks.length === 0) return;
    if (isPlayingArtist) {
      togglePlay();
    } else {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-spotify-muted">
        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading artist...</p>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="p-12 text-center text-spotify-muted space-y-3">
        <h2 className="text-xl font-bold text-white">Artist Not Found</h2>
        <Link to="/" className="text-spotify-green hover:underline text-sm font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 text-left">
      {/* Hero Banner with Artist Image */}
      <div
        className="relative h-80 flex flex-col justify-end p-8 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(18,18,18,0.9)), url(${
            artist.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200'
          })`,
        }}
      >
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
            <span>Verified Artist</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            {artist.name}
          </h1>
          <p className="text-sm font-medium text-white/90">
            {formatNumber(artist.monthlyListeners)} monthly listeners
          </p>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="px-8 py-5 flex items-center gap-6">
        <button
          onClick={handlePlayArtist}
          disabled={artistTracks.length === 0}
          className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title={isPlayingArtist ? 'Pause' : 'Play artist'}
        >
          {isPlayingArtist ? (
            <Pause className="w-6 h-6 fill-black" />
          ) : (
            <Play className="w-6 h-6 fill-black translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Popular Tracks Table */}
      <div className="px-8 space-y-4 mb-10">
        <h2 className="text-xl font-bold text-white">Popular</h2>
        <TrackTable tracks={artistTracks} onAddToPlaylist={onAddToPlaylist} />
      </div>

      {/* Discography / Albums Grid */}
      {artist.albums && artist.albums.length > 0 && (
        <div className="px-8 space-y-4 mb-10">
          <h2 className="text-xl font-bold text-white">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {artist.albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all group block"
              >
                <img
                  src={album.coverArt}
                  alt={album.title}
                  className="w-full aspect-square rounded-md object-cover mb-3 shadow"
                />
                <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                <p className="text-xs text-spotify-muted">
                  {album.releaseYear} • Album
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bio Section */}
      {artist.bio && (
        <div className="px-8 space-y-3">
          <h2 className="text-xl font-bold text-white">About</h2>
          <div className="bg-[#181818] p-6 rounded-xl border border-white/5 max-w-2xl">
            <p className="text-sm text-spotify-muted leading-relaxed whitespace-pre-line">
              {artist.bio}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistPage;
