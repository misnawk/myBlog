// 작성한 게시글을 서버로 보낼때 사용
import apiClient from './config';

// 작성한 글을 서버로 보내주는 API
const createPost = async (postData) => {
    console.log('📝 [POST CREATE] 포스트 생성 시작');
    console.log('📝 [POST CREATE] 요청 데이터:', {
        title: postData.title,
        category: postData.category,
        contentLength: postData.content?.length || 0,
        hasContent: !!postData.content
    });
    
    if (!postData.title || !postData.content) {
        console.error('❌ [POST CREATE] 필수 데이터 누락');
        console.error('❌ [POST CREATE] Title:', !!postData.title);
        console.error('❌ [POST CREATE] Content:', !!postData.content);
        throw new Error('제목과 내용은 필수입니다');
    }
    
    try {
        const response = await apiClient.post('/api/posts', postData);
        console.log('✅ [POST CREATE] 포스트 생성 성공');
        console.log('📋 [POST CREATE] 생성된 포스트:', {
            id: response.data.id,
            title: response.data.title,
            category: response.data.category
        });
        
        return response.data;
    } catch (error) {
        console.error('❌ [POST CREATE] 포스트 생성 실패');
        console.error('❌ [POST CREATE] Error details:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.error('❌ [POST CREATE] 인증 오류 - 로그인이 필요합니다');
        }
        
        throw error;
    }
};

export default createPost;