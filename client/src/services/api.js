import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  getOnlineUsers: () => api.get('/users/online')
};

export const conversationAPI = {
  getConversations: () => api.get('/conversations'),
  createConversation: (participantId) => api.post('/conversations', { participantId }),
  getConversation: (id) => api.get(`/conversations/${id}`)
};

export const messageAPI = {
  getMessages: (conversationId, page = 1, limit = 50) =>
    api.get(`/messages/${conversationId}`, { params: { page, limit } }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (messageId) => api.patch(`/messages/${messageId}/read`)
};

export default api;