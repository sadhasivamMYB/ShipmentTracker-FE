import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust in production
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      window.dispatchEvent(new CustomEvent('auth-error', { detail: error.response.status }));
    }
    return Promise.reject(error);
  }
);
