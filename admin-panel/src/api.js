import axios from 'axios';

const API_BASE_URL = 'http://localhost:9235/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✓ Authorization header set:', config.headers.Authorization.substring(0, 30) + '...');
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (userData) => {
  return api.post('/auth/signup', userData);
};

// ==================== QUESTION APIs ====================
export const createQuestion = (questionData) => {
  return api.post('/admin-panel/questions', questionData);
};

export const getAllQuestions = (params) => {
  return api.get('/admin-panel/questions', { params });
};

export const getQuestionById = (id) => {
  return api.get(`/admin-panel/questions/${id}`);
};

export const updateQuestion = (id, questionData) => {
  return api.put(`/admin-panel/questions/${id}`, questionData);
};

export const deleteQuestion = (id, permanent = false) => {
  return api.delete(`/admin-panel/questions/${id}`, { params: { permanent } });
};

export const bulkCreateQuestions = (questions) => {
  return api.post('/admin-panel/questions/bulk', { questions });
};

export const toggleVerification = (id) => {
  return api.patch(`/admin-panel/questions/${id}/verify`);
};

export const duplicateQuestion = (id) => {
  return api.post(`/admin-panel/questions/${id}/duplicate`);
};

export const searchQuestions = (searchTerm, filters = {}) => {
  return api.get('/admin-panel/questions/search', { 
    params: { 
      q: searchTerm,
      ...filters 
    } 
  });
};

export const getStatistics = () => {
  return api.get('/admin-panel/questions/statistics');
};

// ==================== MEDIA APIs ====================
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadMultipleImages = (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  return api.post('/media/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadVideo = (file) => {
  const formData = new FormData();
  formData.append('video', file);
  return api.post('/media/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteMedia = (publicId, resourceType = 'image') => {
  return api.delete('/media/delete', { params: { publicId, resourceType } });
};

export default api;
