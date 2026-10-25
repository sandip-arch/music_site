import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { PlayerBar } from './components/PlayerBar';
import { AudioEngine } from './components/AudioEngine';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { AuthModal } from './components/AuthModal';
import { QueueModal } from './components/QueueModal';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { AlbumPage } from './pages/AlbumPage';
import { ArtistPage } from './pages/ArtistPage';
import { LikedSongsPage } from './pages/LikedSongsPage';
import { StudioPage } from './pages/StudioPage';
import { ProfilePage } from './pages/ProfilePage';

import { useAuthStore } from './store/useAuthStore';
import { usePlayerStore } from './store/usePlayerStore';
import { trackApi } from './api/client';

export function App() {
  const { initAuth, user } = useAuthStore();
  const { setLikedTrackIds } = usePlayerStore();

  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Initialize Auth on boot
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Load liked track IDs when user changes
  useEffect(() => {
    if (user?.id) {
      trackApi.getLikedTracks().then((res) => {
        if (res.data) {
          setLikedTrackIds(res.data.map((t) => t.id));
        }
      }).catch(() => {});
    }
  }, [user, setLikedTrackIds]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white select-none">
      {/* Persistent Singleton Audio Engine (Persists audio across route changes) */}
      <AudioEngine />

      {/* Main App Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Content View Area */}
        <div className="flex-1 flex flex-col bg-spotify-base overflow-hidden relative">
          {/* Top Navbar */}
          <TopNav
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Scrollable Main View */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
                  />
                }
              />
              <Route
                path="/search"
                element={
                  <SearchPage
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
                  />
                }
              />
              <Route
                path="/library"
                element={
                  <LibraryPage
                    onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                  />
                }
              />
              <Route
                path="/playlist/:id"
                element={
                  <PlaylistPage
                    onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
                  />
                }
              />
              <Route
                path="/album/:id"
                element={
                  <AlbumPage
                    onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
                  />
                }
              />
              <Route
                path="/artist/:id"
                element={
                  <ArtistPage
                    onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
                  />
                }
              />
              <Route
                path="/liked"
                element={
                  <LikedSongsPage
                    onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
                  />
                }
              />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Persistent Sticky Bottom Player Bar */}
      <PlayerBar onOpenQueueModal={() => setIsQueueModalOpen(!isQueueModalOpen)} />

      {/* Modals */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      <AddToPlaylistModal
        isOpen={!!trackToAddToPlaylist}
        track={trackToAddToPlaylist}
        onClose={() => setTrackToAddToPlaylist(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <QueueModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
      />
    </div>
  );
}

export default App;
