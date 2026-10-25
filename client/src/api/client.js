import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_clone_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('spotify_clone_token');
      if (token && error.config.url !== '/auth/login' && error.config.url !== '/auth/register') {
        localStorage.removeItem('spotify_clone_token');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
  getMe: () => api.get('/auth/me'),
  getDemoAccounts: () => api.get('/auth/demo-accounts'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (currentPassword, newPassword) => api.put('/auth/password', { currentPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
};

export const trackApi = {
  getTracks: (params) => api.get('/tracks', { params }),
  getTrackById: (id) => api.get(`/tracks/${id}`),
  createTrack: (trackData) => api.post('/tracks', trackData),
  deleteTrack: (id) => api.delete(`/tracks/${id}`),
  toggleLike: (id) => api.post(`/tracks/${id}/like`),
  getLikedTracks: () => api.get('/tracks/liked'),
};

export const searchApi = {
  search: (q) => api.get('/search', { params: { q } }),
};

export const playlistApi = {
  getPlaylists: () => api.get('/playlists'),
  getPlaylistById: (id) => api.get(`/playlists/${id}`),
  createPlaylist: (data) => api.post('/playlists', data),
  addTrack: (playlistId, trackId) => api.post(`/playlists/${playlistId}/tracks`, { trackId }),
  removeTrack: (playlistId, trackId) => api.delete(`/playlists/${playlistId}/tracks/${trackId}`),
};

export const albumApi = {
  getAlbums: () => api.get('/albums'),
  getAlbumById: (id) => api.get(`/albums/${id}`),
  createAlbum: (data) => api.post('/albums', data),
};

export const artistApi = {
  getArtists: () => api.get('/artists'),
  getArtistById: (id) => api.get(`/artists/${id}`),
};

export default api;
