import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if(!context){
        throw new Error('인증불가');
    }
    return context;
};

// 전역 인증 상태 관리
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log(' AuthContext 초기화, 토큰 상태:', token ? '있음' : '없음');
        if(token){  
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log(' axios 헤더에 토큰 설정 완료');
        } else{
            delete axios.defaults.headers.common['Authorization'];
            console.log(' axios 헤더에서 토큰 제거 완료');
        }
        setIsLoading(false);
        console.log(' AuthContext 로딩 완료');
    }, [token]);

    // 토큰 만료 이벤트 처리
    useEffect(() => {
        const handleTokenExpired = () => {
            console.log(' 토큰 만료 이벤트 감지 - 자동 로그아웃 처리');
            logout();
            // 3초 후 로그인 페이지로 이동 (프로덕션에서도 안전)
            setTimeout(() => {
                if (window.location.pathname !== '/login') {
                    window.location.replace('/login');
                }
            }, 3000);
        };

        window.addEventListener('tokenExpired', handleTokenExpired);
        
        return () => {
            window.removeEventListener('tokenExpired', handleTokenExpired);
        };
    }, []);

    const login = async(email, password) => {
        console.log(' 로그인 시도 시작:', email);
        try{
            const response = await axios.post('/api/auth/login', {email, password});
            const { access_token, user: userData } = response.data;
            
            console.log(' 로그인 성공, 사용자:', userData?.email);
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
        return !!token;
    }

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// AuthContext도 export
export { AuthContext };

