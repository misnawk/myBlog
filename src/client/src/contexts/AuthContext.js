import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/config';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log('🔐 [AUTH CONTEXT] AuthProvider 초기화');

    useEffect(() => {
        console.log('🔐 [AUTH CONTEXT] 초기 인증 상태 확인 시작');
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('🔐 [AUTH CONTEXT] 저장된 토큰 존재:', !!token);
        console.log('🔐 [AUTH CONTEXT] 저장된 사용자 데이터 존재:', !!userData);
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log('✅ [AUTH CONTEXT] 사용자 데이터 복원 성공:', {
                    id: parsedUser.id,
                    email: parsedUser.email,
                    username: parsedUser.username
                });
                setUser(parsedUser);
            } catch (error) {
                console.error('❌ [AUTH CONTEXT] 사용자 데이터 파싱 실패:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else {
            console.log('ℹ️ [AUTH CONTEXT] 저장된 인증 정보 없음');
        }
        
        setLoading(false);
        console.log('🔐 [AUTH CONTEXT] 초기 인증 상태 확인 완료');
    }, []);

    const login = async (email, password) => {
        console.log('🔑 [AUTH LOGIN] 로그인 시도 시작');
        console.log('🔑 [AUTH LOGIN] 이메일:', email);
        
        try {
            const response = await apiClient.post('/api/auth/login', {
                email,
                password
            });
            
            console.log('✅ [AUTH LOGIN] 로그인 API 응답 성공');
            console.log('✅ [AUTH LOGIN] 응답 데이터:', {
                hasToken: !!response.data.access_token,
                hasUser: !!response.data.user,
                userId: response.data.user?.id,
                userEmail: response.data.user?.email
            });

            const { access_token, user: userData } = response.data;

            // 토큰과 사용자 정보 저장
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            
            console.log('✅ [AUTH LOGIN] 로그인 성공 - 사용자 정보 저장 완료');
            return { success: true, user: userData };
            
        } catch (error) {
            console.error('❌ [AUTH LOGIN] 로그인 실패');
            console.error('❌ [AUTH LOGIN] Status:', error.response?.status);
            console.error('❌ [AUTH LOGIN] Error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                console.error('❌ [AUTH LOGIN] 인증 실패 - 이메일 또는 비밀번호 확인');
            }
            
            throw error;
        }
    };

    const register = async (username, email, password) => {
        console.log('📝 [AUTH REGISTER] 회원가입 시도 시작');
        console.log('📝 [AUTH REGISTER] 사용자명:', username);
        console.log('📝 [AUTH REGISTER] 이메일:', email);
        
        try {
            const response = await apiClient.post('/api/auth/register', {
                username,
                email,
                password
            });
            
            console.log('✅ [AUTH REGISTER] 회원가입 성공');
            console.log('✅ [AUTH REGISTER] 응답:', response.data);
            
            return response.data;
            
        } catch (error) {
            console.error('❌ [AUTH REGISTER] 회원가입 실패');
            console.error('❌ [AUTH REGISTER] Status:', error.response?.status);
            console.error('❌ [AUTH REGISTER] Error:', error.response?.data || error.message);
            
            if (error.response?.status === 409) {
                console.error('❌ [AUTH REGISTER] 이미 존재하는 사용자');
            }
            
            throw error;
        }
    };

    const logout = () => {
        console.log('🚪 [AUTH LOGOUT] 로그아웃 시작');
        console.log('🚪 [AUTH LOGOUT] 현재 사용자:', user?.email);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        console.log('✅ [AUTH LOGOUT] 로그아웃 완료');
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    console.log('🔐 [AUTH CONTEXT] 현재 인증 상태:', {
        isAuthenticated: !!user,
        userEmail: user?.email,
        loading
    });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

