import api from './api';

const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log in an existing user
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Log out a user
   */
  logout: async () => {
    // Optional call to backend logout endpoint
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed or session already cleared:', err);
    }
  },

  /**
   * Get user profile details
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Change/update password
   */
  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  }
};

export default authService;
