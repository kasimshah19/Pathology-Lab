import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Request interceptor — attach token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto logout on 401 & format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = { ...error };
    customError.message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Use backend message if available
      if (data && data.message) {
        customError.message = data.message;
      } else if (status === 401) {
        customError.message = 'Your session has expired. Please log in again.';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        customError.message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        customError.message = 'The requested resource could not be found.';
      } else if (status === 400) {
        customError.message = data.message || 'Invalid data provided. Please check your input.';
      } else if (status >= 500) {
        customError.message = 'Server error. Our team has been notified. Please try again later.';
      }
    } else if (error.request) {
      customError.message = 'Network error. Please check your internet connection.';
    }

    // Overwrite the error response message so catching code can just read err.message
    if (error.response && error.response.data) {
       error.response.data.message = customError.message;
    } else {
       error.message = customError.message;
    }
    
    return Promise.reject(error);
  }
);

export default api;
