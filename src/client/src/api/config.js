import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment ? 'http://localhost:3000' : '';

console.log('🔧 [API CONFIG] 환경 설정 초기화');
console.log('🔧 [API CONFIG] NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 [API CONFIG] isDevelopment:', isDevelopment);
console.log('🔧 [API CONFIG] baseURL:', baseURL);

const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
    (config) => {
        console.log('📤 [API REQUEST] 요청 시작');
        console.log('📤 [API REQUEST] Method:', config.method?.toUpperCase());
        console.log('📤 [API REQUEST] URL:', config.url);
        console.log('📤 [API REQUEST] Full URL:', config.baseURL + config.url);
        
        if (config.data) {
            console.log('📤 [API REQUEST] Data:', config.data);
        }
        
        if (config.params) {
            console.log('📤 [API REQUEST] Params:', config.params);
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('📤 [API REQUEST] 토큰 포함됨');
        } else {
            console.log('📤 [API REQUEST] 토큰 없음');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ [API REQUEST ERROR] 요청 설정 오류:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
    (response) => {
        console.log('📥 [API RESPONSE] 응답 성공');
        console.log('📥 [API RESPONSE] Status:', response.status);
        console.log('📥 [API RESPONSE] URL:', response.config.url);
        console.log('📥 [API RESPONSE] Data:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ [API RESPONSE ERROR] 응답 오류');
        console.error('❌ [API RESPONSE ERROR] Status:', error.response?.status);
        console.error('❌ [API RESPONSE ERROR] URL:', error.config?.url);
        console.error('❌ [API RESPONSE ERROR] Message:', error.message);
        
        if (error.response?.data) {
            console.error('❌ [API RESPONSE ERROR] Response Data:', error.response.data);
        }
        
        if (error.response?.status === 401) {
            console.warn('⚠️ [API RESPONSE ERROR] 인증 오류 - 토큰 만료 또는 무효');
            // 필요시 로그아웃 처리
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;