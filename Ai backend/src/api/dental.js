import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return access_token;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const processQuery = async (question, conversationHistory = []) => {
  try {
    const response = await api.post('/query', {
      question,
      conversation_history: conversationHistory
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Query processing failed');
  }
};

export const getSchema = async () => {
  try {
    const response = await api.get('/schema');
    return response.data.schema;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch schema');
  }
}; 