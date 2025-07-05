import apiClient from './config';

export const getPosts = async () => {
    console.log('📚 [POST API] 전체 포스트 조회 시작');
    
    try {
        const response = await apiClient.get('/api/posts');
        console.log('✅ [POST API] 전체 포스트 조회 성공');
        console.log('📊 [POST API] 조회된 포스트 수:', response.data?.length || 0);
        
        if (response.data && response.data.length > 0) {
            console.log('📋 [POST API] 첫 번째 포스트 샘플:', {
                id: response.data[0].id,
                title: response.data[0].title,
                category: response.data[0].category,
                author: response.data[0].author?.email
            });
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ [POST API] 전체 포스트 조회 실패');
        console.error('❌ [POST API] Error details:', error.response?.data || error.message);
        throw error;
    }
};

export const getPost = async (id) => {
    console.log('📄 [POST API] 개별 포스트 조회 시작');
    console.log('📄 [POST API] 요청 ID:', id);
    
    if (!id) {
        console.error('❌ [POST API] ID가 제공되지 않음');
        throw new Error('포스트 ID가 필요합니다');
    }
    
    try {
        const response = await apiClient.get(`/api/posts/${id}`);
        console.log('✅ [POST API] 개별 포스트 조회 성공');
        console.log('📋 [POST API] 조회된 포스트:', {
            id: response.data.id,
            title: response.data.title,
            category: response.data.category,
            author: response.data.author?.email,
            contentLength: response.data.content?.length || 0
        });
        
        return response.data;
    } catch (error) {
        console.error('❌ [POST API] 개별 포스트 조회 실패');
        console.error('❌ [POST API] 요청 ID:', id);
        console.error('❌ [POST API] Error details:', error.response?.data || error.message);
        throw error;
    }
};