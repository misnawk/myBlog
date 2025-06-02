import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:7000' 
  : '';

axios.defaults.baseURL = baseURL;
export default axios;