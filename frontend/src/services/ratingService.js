import api from './api';

export const ratingAPI = {
  submitRating: async (store_id, rating) => {
    const { data } = await api.post('/ratings', { store_id, rating });
    return data;
  },
  updateRating: async (id, rating) => {
    const { data } = await api.put(`/ratings/${id}`, { rating });
    return data;
  },
  getMyRatings: async () => {
    const { data } = await api.get('/users/my-ratings');
    return data;
  }
};
