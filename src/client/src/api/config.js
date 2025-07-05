import axios from 'axios';
import { toast } from 'react-toastify';

// 모든 axios 요청에 대한 기본 URL 설정
const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:7000' 
  : '';
console.log(baseURL);
axios.defaults.baseURL = baseURL;

// 토큰 만료 처리 함수
const handleTokenExpired = () => {
  // 로컬 스토리지에서 토큰 제거
  localStorage.removeItem('token');
  
  // 사용자에게 알림 표시
  toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  // 커스텀 이벤트 발생 (React Router가 처리하도록)
  window.dispatchEvent(new CustomEvent('tokenExpired'));
};

// 요청 인터셉터 - 모든 요청에 토큰 자동 포함
axios.interceptors.request.use(
  (config) => {
    console.log(`API 요청 시작: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('요청 데이터:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' 토큰 포함됨');
    } else {
      console.log(' 토큰 없음');
    }
    return config;
  },
  (error) => {
    console.error(' 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axios.interceptors.response.use(
  (response) => {
    console.log(` API 응답 성공: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log(' 응답 데이터:', response.data);
    console.log(' 응답 상태:', response.status);
    return response;
  },
  (error) => {
    console.error(` API 응답 실패: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error(' 에러 응답:', error.response?.data);
    console.error(' 에러 상태:', error.response?.status);
    console.error(' 전체 에러:', error);
    
    // 토큰 만료 또는 인증 오류 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 로그인 페이지가 아닌 경우에만 토큰 만료 처리
      if (!window.location.pathname.includes('/login')) {
        handleTokenExpired();
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;