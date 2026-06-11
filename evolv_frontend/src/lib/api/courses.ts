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

  getCurriculum: async (id: number) => {
    const response = await apiClient.get(`/courses/${id}/curriculum/`);
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

export const progressApi = {
  getAll: async () => {
    const response = await apiClient.get('/students/me/progress/');
    return response.data;
  },

  markComplete: async (lessonId: number, notes?: string) => {
    const response = await apiClient.post('/students/me/progress/', { lesson: lessonId, notes });
    return response.data;
  },
};

export const assignmentsApi = {
  getAll: async () => {
    const response = await apiClient.get('/students/me/assignments/');
    return response.data;
  },

  submit: async (data: { module: number; github_url: string; notes: string }) => {
    const response = await apiClient.post('/students/me/assignments/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<{ github_url: string; notes: string }>) => {
    const response = await apiClient.patch(`/students/me/assignments/${id}/`, data);
    return response.data;
  },
};

export const liveSessionsApi = {
  getAll: async () => {
    const response = await apiClient.get('/live-sessions/');
    return response.data;
  },
};
