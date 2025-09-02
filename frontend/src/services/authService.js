import api from '../utils/api';

export const authService = {
  // Login user
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  // Register user
  register: async (name, email, password) => {
    return api.post('/auth/register', { name, email, password });
  },

  // Get user profile
  getProfile: async () => {
    return api.get('/auth/profile');
  },

  // Update user profile
  updateProfile: async (name, email) => {
    return api.put('/auth/profile', { name, email });
  },
};
