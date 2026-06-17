import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated statuses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error response is 401 (unauthorized) and we are not doing login
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch an event to notify context to clean state
      window.dispatchEvent(new Event('auth-expired'));
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;
