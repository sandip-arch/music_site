import { create } from 'zustand';
import { authApi } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('spotify_clone_token') || null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('spotify_clone_token');
    if (!token) {
      await get().quickLogin('listener@spotify.local');
      set({ isLoading: false });
      return;
    }

    try {
      const res = await authApi.getMe();
      set({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('spotify_clone_token');
      await get().quickLogin('listener@spotify.local');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('spotify_clone_token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  quickLogin: async (email) => {
    return await get().login(email, 'password123');
  },

  register: async (name, email, password, role = 'USER') => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(name, email, password, role);
      const { token, user } = res.data;
      localStorage.setItem('spotify_clone_token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      set((state) => ({
        user: { ...state.user, ...res.data.user },
      }));
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update profile' };
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      const res = await authApi.updatePassword(currentPassword, newPassword);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update password' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await authApi.forgotPassword(email);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to send OTP' };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const res = await authApi.resetPassword(email, otp, newPassword);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to reset password' };
    }
  },

  logout: () => {
    localStorage.removeItem('spotify_clone_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user) => set({ user }),
}));
