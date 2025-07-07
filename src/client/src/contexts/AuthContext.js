import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if(!context){
        throw new Error('인증불가');
    }
    return context;
};

// JWT 토큰에서 사용자 정보 추출 (한글 지원)
const getUserFromToken = (token) => {
    try {
        if (!token) return null;
        
        // JWT 토큰 구조: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error(' 잘못된 JWT 토큰 형식');
            return null;
        }
        
        // Base64 URL 디코딩
        let payload = parts[1];
        
        // Base64 URL을 일반 Base64로 변환
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        
        // 패딩 추가
        while (payload.length % 4) {
            payload += '=';
        }
        
        // 한글 지원을 위한 안전한 디코딩
        const binaryString = atob(payload);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const decoded = new TextDecoder('utf-8').decode(bytes);
        const payloadData = JSON.parse(decoded);
        
        console.log(' 토큰에서 사용자 정보 추출:', payloadData);
        
        return {
            id: payloadData.id,
            email: payloadData.email,
            username: payloadData.username,
            exp: payloadData.exp // 만료 시간 추가
        };
    } catch (error) {
        console.error(' 토큰 파싱 실패:', error);
        // 폴백: 간단한 방법으로 시도
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log(' 폴백 파싱 성공:', payload);
            return {
                id: payload.id,
                email: payload.email,
                username: payload.username,
                exp: payload.exp
            };
        } catch (fallbackError) {
            console.error(' 폴백 파싱도 실패:', fallbackError);
            return null;
        }
    }
};

// 토큰 만료 체크 함수 추가
const isTokenExpired = (token) => {
    try {
        if (!token) return true;
        
        const userInfo = getUserFromToken(token);
        if (!userInfo || !userInfo.exp) return true;
        
        // exp는 초 단위, Date.now()는 밀리초 단위
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = userInfo.exp < currentTime;
        
        console.log(' 토큰 만료 체크:', {
            현재시간: currentTime,
            만료시간: userInfo.exp,
            만료여부: isExpired
        });
        
        return isExpired;
    } catch (error) {
        console.error(' 토큰 만료 체크 실패:', error);
        return true; // 에러 시 만료된 것으로 처리
    }
};

// 전역 인증 상태 관리
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(' AuthContext 초기화, 토큰 상태:', token ? '있음' : '없음');
        
        if(token){  
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log(' axios 헤더에 토큰 설정 완료');
            
            // 토큰에서 사용자 정보 복원
            const userFromToken = getUserFromToken(token);
            if (userFromToken) {
                setUser(userFromToken);
                console.log(' 토큰에서 사용자 정보 복원 완료:', userFromToken.email, userFromToken.username);
            }
        } else{
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            console.log(' axios 헤더에서 토큰 제거 완료');
        }
        setIsLoading(false);
        console.log(' AuthContext 로딩 완료');
    }, [token]);

    // 토큰 만료 이벤트 처리
    useEffect(() => {
        const handleTokenExpired = () => {
            console.log(' 토큰 만료 이벤트 감지 - 자동 로그아웃 처리');
            
            // 사용자에게 알럿 표시
            toast.error('⚠️ 로그인 세션이 만료되었습니다.\n잠시 후 로그인 페이지로 이동합니다.');
            
            logout();
            
            // React Router navigate 사용
            setTimeout(() => {
                if (window.location.pathname !== '/login') {
                    navigate('/login', { replace: true });
                }
            }, 3000);
        };

        window.addEventListener('tokenExpired', handleTokenExpired);
        
        return () => {
            window.removeEventListener('tokenExpired', handleTokenExpired);
        };
    }, [navigate]);

    const login = async(email, password) => {
        console.log(' 로그인 시도 시작:', email);
        try{
            const response = await axios.post('/api/auth/login', {email, password});
            const { access_token, user: userData } = response.data;
            
            console.log(' 로그인 성공, 사용자:', userData?.email, userData?.username);
            localStorage.setItem('token', access_token);
            setToken(access_token);
            setUser(userData);
            console.log(' 토큰 저장 및 상태 업데이트 완료');
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error(' 로그인 오류 상세:', error);
            console.error(' 서버 응답:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        console.log(' 로그아웃 시작');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        console.log(' 로그아웃 완료');
    };

    const isAuthenticated = () => {
        return !!token && !isTokenExpired(token);
    }

    // 토큰 유효성 체크 (만료 시간 포함)
    const isTokenValid = () => {
        if (!token) {
            console.log(' 토큰이 없음');
            return false;
        }
        
        if (isTokenExpired(token)) {
            console.log(' 토큰이 만료됨 - 사용자 알림 및 자동 로그아웃 처리');
            
            // 사용자에게 알럿 표시
            toast.error('⚠️ 로그인 세션이 만료되었습니다.\n잠시 후 로그인 페이지로 이동합니다.');
            
            logout();
            
            // React Router navigate 사용
            setTimeout(() => {
                if (window.location.pathname !== '/login') {
                    navigate('/login', { replace: true });
                }
            }, 3000);
            
            return false;
        }
        
        console.log(' 토큰이 유효함');
        return true;
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
        isTokenValid,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// AuthContext도 export
export { AuthContext };

