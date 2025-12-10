import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh - temporarily disabled to prevent loops
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Temporarily disable auto-refresh to prevent infinite loops
    if (error.response?.status === 401) {
      console.log('Unauthorized - please login again');
      // Don't auto-redirect, just log the error
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
