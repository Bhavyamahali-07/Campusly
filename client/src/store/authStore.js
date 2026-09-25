import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Register
      register: async (data) => {
        const res = await api.post('/auth/register', data);
        set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
        return res;
      },

      // Login
      login: async (data) => {
        const res = await api.post('/auth/login', data);
        set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
        return res;
      },

      // Logout
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          // ignore
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      // Check auth (on app load)
      checkAuth: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Update user locally
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
