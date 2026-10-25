import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Disc3, Sparkles } from 'lucide-react';
import { trackApi, playlistApi, albumApi, artistApi } from '../api/client';
import { usePlayerStore } from '../store/usePlayerStore';
import { getGreeting } from '../utils/formatters';
import { TrackTable } from '../components/TrackTable';

export const HomePage = ({ onAddToPlaylist }) => {
  const [topTracks, setTopTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tracksRes, playlistsRes, albumsRes, artistsRes] = await Promise.all([
          trackApi.getTracks({ limit: 10 }),
          playlistApi.getPlaylists(),
          albumApi.getAlbums(),
          artistApi.getArtists(),
        ]);
        setTopTracks(tracksRes.data?.data || []);
        setPlaylists(playlistsRes.data || []);
        setAlbums(albumsRes.data || []);
        setArtists(artistsRes.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTilePlay = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, topTracks);
    }
  };

  return (
    <div className="p-8 pb-32 space-y-8 text-left">
      {/* Dynamic Greeting */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {getGreeting()}
        </h1>
      </div>

      {/* Quick Play Shortcut Tiles (Top 6 Tracks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {topTracks.slice(0, 6).map((track) => {
          const isThisPlaying = currentTrack?.id === track.id && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => handleTilePlay(track)}
              className="flex items-center gap-4 bg-[#282828]/60 hover:bg-[#282828] rounded-md overflow-hidden group cursor-pointer transition-all duration-200 border border-transparent hover:border-white/10"
            >
              <img
                src={
                  track.album?.coverArt ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                }
                alt={track.title}
                className="w-16 h-16 object-cover flex-shrink-0"
              />
              <div className="flex-1 overflow-hidden pr-2">
                <p className="font-bold text-sm text-white truncate">{track.title}</p>
                <p className="text-xs text-spotify-muted truncate">{track.artist?.name}</p>
              </div>
              <button
                aria-label={`Play ${track.title}`}
                className={`w-10 h-10 mr-4 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isThisPlaying
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105'
                }`}
              >
                {isThisPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black translate-x-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Featured Playlists Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">
            Featured Playlists
          </h2>
          <span className="text-xs font-bold text-spotify-muted uppercase tracking-wider hover:underline cursor-pointer">
            Show all
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {playlists.slice(0, 5).map((playlist) => (
            <Link
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all duration-200 group block border border-transparent hover:border-white/5"
            >
              <div className="relative mb-4 aspect-square rounded-md overflow-hidden shadow-md">
                <img
                  src={
                    playlist.coverArt ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'
                  }
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-sm text-white truncate mb-1">
                {playlist.name}
              </h3>
              <p className="text-xs text-spotify-muted line-clamp-2 leading-relaxed">
                {playlist.description || `By ${playlist.user?.name || 'Spotify'}`}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Albums */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">
            Popular Albums
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {albums.slice(0, 5).map((album) => (
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
                {album.artist?.name} • {album.releaseYear}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">
            Featured Artists
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {artists.slice(0, 5).map((artist) => (
            <Link
              key={artist.id}
              to={`/artist/${artist.id}`}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all duration-200 group block text-left border border-transparent hover:border-white/5"
            >
              <div className="relative mb-4 aspect-square rounded-full overflow-hidden shadow-lg mx-auto">
                <img
                  src={
                    artist.image ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
                  }
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-sm text-white truncate mb-1 text-center">
                {artist.name}
              </h3>
              <p className="text-xs text-spotify-muted text-center capitalize">
                Artist
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Tracks Full Table */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white">Trending Streams</h2>
        <TrackTable tracks={topTracks} onAddToPlaylist={onAddToPlaylist} />
      </section>
    </div>
  );
};

export default HomePage;
