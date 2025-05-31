import axios from '../api/config';

export const verifyToken = async () =>{
    try{
        const token = localStorage.getItem('token');
        console.log("토큰 값:", token);
        
        if(!token){
            return false;
        }   
        
        console.log("토큰 검증 시작");
        const response = await axios.get('/api/auth/verify',{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("=== 서버 응답 디버깅 ===");
        console.log("response 전체:", response);
        console.log("response.data:", response.data);
        console.log("response.status:", response.status);
        console.log("response.data.valid:", response.data.valid);
        console.log("========================");
        return response.data.valid;        
    
    }catch(error){
        console.error('토큰 검증 실패', error);
        return false;
    }
}