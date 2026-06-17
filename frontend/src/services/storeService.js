import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Setup axios to use auth token
const authAxios = axios.create({
  baseURL: API_URL,
});

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const storeAPI = {
  getStores: async (params) => {
    const { data } = await authAxios.get('/stores', { params });
    return data;
  },
  getStoreById: async (id) => {
    const { data } = await authAxios.get(`/stores/${id}`);
    return data;
  }
};
