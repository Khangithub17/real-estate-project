import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Debug logging
console.log('🔧 API Configuration Debug:');
console.log('📍 REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
console.log('📍 Final API_BASE_URL:', API_BASE_URL);
console.log('📍 Expected login URL:', `${API_BASE_URL}/auth/login`);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
          break;
        
        case 403:
          // Forbidden
          toast.error('Access denied. Insufficient permissions.');
          break;
        
        case 404:
          // Not found
          toast.error('Resource not found.');
          break;
        
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.msg || err.message));
          } else {
            toast.error(data.message || 'Validation failed.');
          }
          break;
        
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
        
        default:
          // Other errors
          toast.error(data.message || 'An error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await api({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Projects API calls
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getFeatured: (params) => api.get('/projects/featured', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/projects/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/admin/stats'),
};

// Blogs API calls
export const blogsAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getPublished: (params) => api.get('/blogs/published', { params }),
  getFeatured: (params) => api.get('/blogs/featured', { params }),
  getById: (id) => api.get(`/blogs/${id}`),
  getBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  create: (data) => api.post('/blogs', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/blogs/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/blogs/${id}`),
  like: (id) => api.post(`/blogs/${id}/like`),
  getStats: () => api.get('/blogs/admin/stats'),
};

// Jobs API calls
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getActive: (params) => api.get('/jobs/active', { params }),
  getFeatured: (params) => api.get('/jobs/featured', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  getBySlug: (slug) => api.get(`/jobs/slug/${slug}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  applyTo: (id) => api.post(`/jobs/${id}/apply`),
  getStats: () => api.get('/jobs/admin/stats'),
};

// Utility functions
export const formatApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isApiError = (error) => {
  return error.response && error.response.data;
};

// File upload helper
export const createFormData = (data, fileFields = []) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (fileFields.includes(key)) {
      // Handle file fields
      if (value instanceof FileList) {
        Array.from(value).forEach(file => {
          formData.append(key, file);
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      }
    } else if (Array.isArray(value)) {
      // Handle arrays
      value.forEach(item => {
        formData.append(`${key}[]`, item);
      });
    } else if (typeof value === 'object' && value !== null) {
      // Handle objects
      formData.append(key, JSON.stringify(value));
    } else {
      // Handle primitive values
      formData.append(key, value);
    }
  });
  
  return formData;
};

// Named export for compatibility
export { api };

export default api;