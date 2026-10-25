const express = require('express');
const { streamTrack } = require('../controllers/streamController');
const {
  getTracks,
  getTrackById,
  createTrack,
  deleteTrack,
  toggleLikeTrack,
  getLikedTracks,
} = require('../controllers/trackController');
const { search } = require('../controllers/searchController');
const {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
} = require('../controllers/playlistController');
const { getAlbums, getAlbumById, createAlbum } = require('../controllers/albumController');
const { getArtists, getArtistById } = require('../controllers/artistController');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  getDemoAccounts,
} = require('../controllers/authController');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

// Streaming Route (HTTP 206 Partial Content)
router.get('/tracks/stream/:id', streamTrack);

// Authentication, Profile & Password Management
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);
router.put('/auth/profile', authenticate, updateProfile);
router.put('/auth/password', authenticate, updatePassword);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/demo-accounts', getDemoAccounts);

// Search
router.get('/search', search);

// Tracks
router.get('/tracks', getTracks);
router.get('/tracks/liked', authenticate, getLikedTracks);
router.get('/tracks/:id', getTrackById);
router.post('/tracks', authenticate, authorize(['ARTIST', 'ADMIN']), createTrack);
// Deleting track: Strictly accessible only by ADMIN
router.delete('/tracks/:id', authenticate, authorize(['ADMIN']), deleteTrack);
router.post('/tracks/:id/like', authenticate, toggleLikeTrack);

// Playlists
router.get('/playlists', optionalAuth, getPlaylists);
router.post('/playlists', authenticate, createPlaylist);
router.get('/playlists/:id', optionalAuth, getPlaylistById);
router.post('/playlists/:id/tracks', authenticate, addTrackToPlaylist);
router.delete('/playlists/:id/tracks/:trackId', authenticate, removeTrackFromPlaylist);

// Albums
router.get('/albums', getAlbums);
router.get('/albums/:id', getAlbumById);
router.post('/albums', authenticate, authorize(['ARTIST', 'ADMIN']), createAlbum);

// Artists
router.get('/artists', getArtists);
router.get('/artists/:id', getArtistById);

module.exports = router;
