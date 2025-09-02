import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const data = response.data;

          if (data.success) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, data: data.data };
          } else {
            set({ isLoading: false });
            return { success: false, error: data.message };
          }
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'خطأ في الاتصال بالخادم' };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const data = response.data;

          if (data.success) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, data: data.data };
          } else {
            set({ isLoading: false });
            return { success: false, error: data.message, errors: data.errors };
          }
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'خطأ في الاتصال بالخادم' };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateProfile: async (name, email) => {
        const { token } = get();
        if (!token) return { success: false, error: 'غير مصرح' };

        set({ isLoading: true });
        try {
          const response = await api.put('/auth/profile', { name, email });
          const data = response.data;

          if (data.success) {
            set({
              user: { ...get().user, ...data.data },
              isLoading: false,
            });
            return { success: true, data: data.data };
          } else {
            set({ isLoading: false });
            return { success: false, error: data.message };
          }
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'خطأ في الاتصال بالخادم' };
        }
      },

      getProfile: async () => {
        const { token } = get();
        if (!token) return { success: false, error: 'غير مصرح' };

        set({ isLoading: true });
        try {
          const response = await api.get('/auth/profile');
          const data = response.data;

          if (data.success) {
            set({
              user: data.data,
              isLoading: false,
            });
            return { success: true, data: data.data };
          } else {
            set({ isLoading: false });
            return { success: false, error: data.message };
          }
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'خطأ في الاتصال بالخادم' };
        }
      },

      // Helper function to get auth headers
      getAuthHeaders: () => {
        const { token } = get();
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
      },
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
