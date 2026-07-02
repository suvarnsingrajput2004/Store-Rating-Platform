import api from './api';

export const ownerAPI = {
  getDashboard: async () => {
    const { data } = await api.get('/owner/dashboard');
    return data;
  }
};
