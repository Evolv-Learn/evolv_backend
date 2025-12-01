import apiClient from './client';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  email_sent?: boolean;
}

export interface LoginResponse {
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/register/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login/', data);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/profile/');
    return response.data;
  },
};
