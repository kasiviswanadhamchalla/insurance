import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization and custom user gateway headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ins_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const userStr = localStorage.getItem('ins_current_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      // Map username/email to gateway headers
      config.headers['X-User-Name'] = u.email || u.username;

      // Map frontend role format to backend ROLE format
      let beRole = 'ROLE_USER';
      if (u.role === 'SYSTEM_ADMIN') beRole = 'ROLE_ADMIN';
      else if (u.role === 'CLAIM_OFFICER') beRole = 'ROLE_PROCESSOR';
      else if (u.role === 'CLAIM_MANAGER') beRole = 'ROLE_MANAGER';
      else if (u.role === 'AUDITOR') beRole = 'ROLE_AUDITOR';
      config.headers['X-User-Roles'] = beRole;
    } catch (e) {
      console.error('Failed to parse current user context', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
