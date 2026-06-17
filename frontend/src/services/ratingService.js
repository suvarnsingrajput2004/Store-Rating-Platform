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

export const ratingAPI = {
  submitRating: async (store_id, rating) => {
    const { data } = await authAxios.post('/ratings', { store_id, rating });
    return data;
  },
  updateRating: async (id, rating) => {
    const { data } = await authAxios.put(`/ratings/${id}`, { rating });
    return data;
  },
  getMyRatings: async () => {
    const { data } = await authAxios.get('/users/my-ratings');
    return data;
  }
};
