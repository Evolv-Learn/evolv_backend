import apiClient from './client';

export const coursesApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/courses/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/courses/${id}/`);
    return response.data;
  },
};

export const eventsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/events/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/events/${id}/`);
    return response.data;
  },
};

export const alumniApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/alumni/', { params });
    return response.data;
  },
};

export const aboutApi = {
  get: async () => {
    const response = await apiClient.get('/about-us/');
    return response.data;
  },
};
