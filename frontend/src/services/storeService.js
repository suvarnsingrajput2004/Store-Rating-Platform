import api from './api';

export const storeAPI = {
  getStores: async (params) => {
    const { data } = await api.get('/stores', { params });
    return data;
  },
  getStoreById: async (id) => {
    const { data } = await api.get(`/stores/${id}`);
    return data;
  }
};
