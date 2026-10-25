import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Search as SearchIcon, Disc3 } from 'lucide-react';
import { searchApi } from '../api/client';
import { usePlayerStore } from '../store/usePlayerStore';
import { TrackTable } from '../components/TrackTable';

const GENRE_CARDS = [
  { name: 'Pop', color: 'from-pink-600 to-rose-500' },
  { name: 'Hip-Hop', color: 'from-orange-600 to-amber-500' },
  { name: 'Lo-Fi Chill', color: 'from-indigo-600 to-blue-500' },
  { name: 'Electronic / Synth', color: 'from-purple-600 to-violet-500' },
  { name: 'Rock & Alternative', color: 'from-red-600 to-rose-700' },
  { name: 'Ambient & Focus', color: 'from-teal-600 to-emerald-500' },
  { name: 'R&B / Soul', color: 'from-blue-600 to-cyan-500' },
  { name: 'Indie Vibes', color: 'from-amber-600 to-yellow-500' },
];

export const SearchPage = ({ searchQuery, setSearchQuery, onAddToPlaylist }) => {
  const [results, setResults] = useState({ tracks: [], artists: [], albums: [], topResult: null });
  const [loading, setLoading] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
      setResults({ tracks: [], artists: [], albums: [], topResult: null });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchApi.search(searchQuery.trim());
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasResults =
    results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <div className="p-8 pb-32 space-y-8 text-left">
      {/* Mobile/inline search fallback if TopNav isn't focused */}
      <div className="md:hidden relative w-full mb-4">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery?.(e.target.value)}
          placeholder="What do you want to play?"
          className="w-full bg-[#242424] text-white text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>

      {!searchQuery ? (
        /* Empty State: Browse Categories */
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Browse All</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRE_CARDS.map((genre) => (
              <div
                key={genre.name}
                onClick={() => setSearchQuery?.(genre.name.split(' ')[0])}
                className={`h-36 p-4 rounded-xl bg-gradient-to-br ${genre.color} cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-md group`}
              >
                <h3 className="text-lg font-bold text-white leading-tight">{genre.name}</h3>
                <div className="absolute -bottom-2 -right-3 w-20 h-20 bg-white/20 rounded-full blur-sm group-hover:scale-125 transition-transform" />
              </div>
            ))}
          </div>
        </section>
      ) : loading ? (
        <div className="py-20 text-center text-spotify-muted">
          <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Searching for "{searchQuery}"...</p>
        </div>
      ) : !hasResults ? (
        <div className="py-20 text-center text-spotify-muted space-y-2">
          <h3 className="text-lg font-bold text-white">No results found for "{searchQuery}"</h3>
          <p className="text-sm">Please make sure your words are spelled correctly or use less or different keywords.</p>
        </div>
      ) : (
        /* Search Results Grid */
        <div className="space-y-8">
          {/* Top Result + Songs Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Result Card */}
            {results.topResult && (
              <div className="lg:col-span-5 space-y-3">
                <h2 className="text-xl font-bold text-white">Top Result</h2>
                <div className="p-5 rounded-xl bg-[#181818] hover:bg-[#282828] transition-all duration-200 group relative">
                  {results.topResult.type === 'track' && (
                    <>
                      <img
                        src={
                          results.topResult.data.album?.coverArt ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'
                        }
                        alt={results.topResult.data.title}
                        className="w-24 h-24 rounded-lg object-cover mb-4 shadow-lg"
                      />
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {results.topResult.data.title}
                      </h3>
                      <p className="text-sm text-spotify-muted">
                        Song •{' '}
                        <span className="text-white hover:underline cursor-pointer">
                          {results.topResult.data.artist?.name}
                        </span>
                      </p>
                      <button
                        onClick={() => playTrack(results.topResult.data, results.tracks)}
                        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105 transition-all"
                      >
                        <Play className="w-6 h-6 fill-black translate-x-0.5" />
                      </button>
                    </>
                  )}

                  {results.topResult.type === 'artist' && (
                    <Link to={`/artist/${results.topResult.data.id}`} className="block">
                      <img
                        src={
                          results.topResult.data.image ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'
                        }
                        alt={results.topResult.data.name}
                        className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg"
                      />
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {results.topResult.data.name}
                      </h3>
                      <p className="text-sm text-spotify-muted">
                        Artist • {results.topResult.data.monthlyListeners?.toLocaleString()} monthly listeners
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Top Songs */}
            <div className={`${results.topResult ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
              <h2 className="text-xl font-bold text-white">Songs</h2>
              <div className="space-y-1">
                {results.tracks.slice(0, 4).map((track) => {
                  const isPlayingThis = currentTrack?.id === track.id && isPlaying;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, results.tracks)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <img
                            src={
                              track.album?.coverArt ||
                              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                            }
                            alt={track.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                            {isPlayingThis ? (
                              <Pause className="w-4 h-4 fill-white" />
                            ) : (
                              <Play className="w-4 h-4 fill-white translate-x-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <p
                            className={`text-sm font-semibold truncate ${
                              currentTrack?.id === track.id
                                ? 'text-spotify-green'
                                : 'text-white'
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-xs text-spotify-muted truncate">
                            {track.artist?.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-spotify-muted font-mono pr-2">
                        {Math.floor(track.duration / 60)}:
                        {(track.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Artists Row */}
          {results.artists.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    to={`/artist/${artist.id}`}
                    className="p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition-all group block text-center"
                  >
                    <img
                      src={
                        artist.image ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'
                      }
                      alt={artist.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-3 shadow"
                    />
                    <p className="font-bold text-sm text-white truncate">{artist.name}</p>
                    <p className="text-xs text-spotify-muted">Artist</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Albums Row */}
          {results.albums.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {results.albums.map((album) => (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    className="p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition-all group block"
                  >
                    <img
                      src={album.coverArt}
                      alt={album.title}
                      className="w-full aspect-square rounded-md object-cover mb-3 shadow"
                    />
                    <p className="font-bold text-sm text-white truncate">{album.title}</p>
                    <p className="text-xs text-spotify-muted truncate">{album.artist?.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All matching tracks table */}
          {results.tracks.length > 4 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">All Matching Songs</h2>
              <TrackTable tracks={results.tracks} onAddToPlaylist={onAddToPlaylist} />
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
