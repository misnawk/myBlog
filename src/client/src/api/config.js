import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:7000'  // 🔥 NestJS 서버 포트
  : '';

axios.defaults.baseURL = baseURL;
console.log("🔧 axios baseURL 설정:", baseURL);

export default axios;