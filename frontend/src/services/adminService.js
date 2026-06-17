import api from './api';

const adminService = {
  /**
   * Fetch admin dashboard metrics and widgets data
   */
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // --- USER CRUD OPERATIONS ---

  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // --- STORE CRUD OPERATIONS ---

  getStores: async (params) => {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },

  getStoreById: async (id) => {
    const response = await api.get(`/admin/stores/${id}`);
    return response.data;
  },

  createStore: async (storeData) => {
    const response = await api.post('/admin/stores', storeData);
    return response.data;
  },

  updateStore: async (id, storeData) => {
    const response = await api.put(`/admin/stores/${id}`, storeData);
    return response.data;
  },

  deleteStore: async (id) => {
    const response = await api.delete(`/admin/stores/${id}`);
    return response.data;
  }
};

export default adminService;
