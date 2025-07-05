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
        if(token){  
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else{
            delete axios.defaults.headers.common['Authorization'];
        }
        setIsLoading(false);
    }, [token]);

    const login = async(email, password) => {
        try{
            const response = await axios.post('/api/auth/login', {email, password});
            const { access_token, user: userData } = response.data;
            
            localStorage.setItem('token', access_token);
            setToken(access_token);
            setUser(userData);
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error('로그인 오류 상세:', error);
            console.error('서버 응답:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
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

