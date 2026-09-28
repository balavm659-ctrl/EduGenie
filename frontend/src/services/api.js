/**
 * EduGenie API Service
 * Centralized API caller with automatic token injection and error handling.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('edugenie_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If uploading form data, delete content-type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clean up and redirect to login if not already there
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
      localStorage.removeItem('edugenie_token');
      localStorage.removeItem('edugenie_user');
      window.location.href = '/login';
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || (typeof data === 'string' ? data : 'An unexpected error occurred');
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Health
  checkHealth: () => request('/api/health'),

  // Auth
  register: (payload) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (payload) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getMe: () => request('/api/auth/me'),
  completeOnboarding: (payload) => request('/api/auth/onboarding', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateProfile: (payload) => request('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  // AI Modules
  askQuestion: (payload) => request('/api/qa', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  explainConcept: (payload) => request('/api/explain', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  generateQuiz: (payload) => request('/api/quiz', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  submitQuiz: (payload) => request('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getQuizById: (id) => request(`/api/quiz/${id}`),
  summarizeText: (payload) => request('/api/summarize', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  uploadAndSummarize: (formData) => request('/api/summarize/upload', {
    method: 'POST',
    body: formData,
  }),
  generateLearningPath: (payload) => request('/api/learn/path', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getLearningPaths: () => request('/api/learn/paths'),
  getLearningPathDetail: (id) => request(`/api/learn/path/${id}`),
  updatePathProgress: (id, progress, completedItem) => {
    let url = `/api/learn/path/${id}/progress?progress=${progress}`;
    if (completedItem) url += `&completed_item=${encodeURIComponent(completedItem)}`;
    return request(url, { method: 'PUT' });
  },
  getRecommendations: () => request('/api/learn/recommendations'),

  // Chat Conversations
  getChats: (page = 1, limit = 20, search = '') => 
    request(`/api/chats?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  createChat: () => request('/api/chats', { method: 'POST' }),
  getChatDetail: (id) => request(`/api/chats/${id}`),
  renameChat: (id, title) => request(`/api/chats/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  }),
  deleteChat: (id) => request(`/api/chats/${id}`, { method: 'DELETE' }),

  // Progress & Dashboard
  getDashboard: () => request('/api/dashboard'),
  getProgress: () => request('/api/progress'),
  getActivity: (page = 1, limit = 20, type = '') => 
    request(`/api/activity?page=${page}&limit=${limit}&activity_type=${type}`),
  getBadges: () => request('/api/badges'),
  getStreak: () => request('/api/streak'),

  // Saved Items
  getSavedItems: (type = 'all', search = '') => 
    request(`/api/saved?item_type=${type}&search=${encodeURIComponent(search)}`),
  saveItem: (payload) => request('/api/saved', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  deleteSavedItem: (id) => request(`/api/saved/${id}`, { method: 'DELETE' }),
};
