import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:7000' 
  : '';

axios.defaults.baseURL = baseURL;


// 요청 인터셉터 - 모든 요청에 토큰 자동 포함
axios.interceptors.request.use(
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

export default axios;