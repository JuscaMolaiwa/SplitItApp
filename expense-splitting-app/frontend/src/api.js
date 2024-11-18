import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your backend's URL
});

// Add a request interceptor for JWT authentication
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;