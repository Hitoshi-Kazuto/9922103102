import axios from 'axios';

const API_BASE_URL = 'http://localhost:5173';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export const fetchTopUsers = async () => {
  try {
    const response = await api.get('/users');
    return response;
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }
};

export const fetchPopularPosts = async () => {
  try {
    const response = await api.get('/posts?type=popular');
    return response;
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    throw error;
  }
};

export const fetchLatestPosts = async () => {
  try {
    const response = await api.get('/posts?type=latest');
    return response;
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    throw error;
  }
}; 