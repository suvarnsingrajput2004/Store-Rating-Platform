import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

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

export const ownerAPI = {
  getDashboard: async () => {
    const { data } = await authAxios.get('/owner/dashboard');
    return data;
  }
};
