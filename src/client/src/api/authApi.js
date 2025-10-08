import axios from './config';

// 인증 코드 발송
export const sendVerificationCode = async (email) => {
  try {
    console.log('인증 코드 발송 요청:', email);
    const response = await axios.post('/api/auth/send-verification-code', { email });
    console.log('인증 코드 발송 성공');
    return response.data;
  } catch (error) {
    console.error('인증 코드 발송 실패:', error);
    throw error;
  }
};

// 이메일 인증 코드 검증
export const verifyEmail = async (email, code) => {
  try {
    console.log('이메일 인증 코드 검증 요청:', email);
    const response = await axios.post('/api/auth/verify-email', { email, code });
    console.log('이메일 인증 성공');
    return response.data;
  } catch (error) {
    console.error('이메일 인증 실패:', error);
    throw error;
  }
};

// 회원가입
export const register = async (userData) => {
  try {
    console.log('회원가입 요청:', userData.username, userData.email);
    const response = await axios.post('/api/auth/register', userData);
    console.log('회원가입 성공');
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

// 로그인
export const login = async (loginData) => {
  try {
    console.log('로그인 요청:', loginData.email);
    const response = await axios.post('/api/auth/login', loginData);
    console.log('로그인 성공');
    return response.data;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
}; 