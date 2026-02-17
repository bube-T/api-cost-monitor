import axios from 'axios';

// Base API client — all requests go through here
const api = axios.create({
  baseURL: '/api', // Proxied to http://localhost:3000/api by Vite
  headers: { 'Content-Type': 'application/json' }
});

// Automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If backend returns 401 (unauthorized), clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  getMe: () =>
    api.get('/auth/me'),
};

export default api;
