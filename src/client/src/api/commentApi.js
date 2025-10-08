import axios from './config';

// 댓글 생성
export const createComment = async (commentData) => {
    console.log('댓글 생성 시작:', commentData);
    try {
        const response = await axios.post('/api/comments', commentData);
        console.log('댓글 생성 성공:', response.data);
        return response.data;
    } catch (error) {
        console.error('댓글 생성 실패:', error);
        console.error('에러 상세:', error.response?.data);
        throw error;
    }
};

// 특정 게시글의 댓글 조회
export const getCommentsByPost = async (postId) => {
    console.log('댓글 조회 시작, 게시글 ID:', postId);
    try {
        const response = await axios.get(`/api/comments/post/${postId}`);
        console.log('댓글 조회 성공, 총 개수:', response.data?.length || 0);
        return response.data;
    } catch (error) {
        console.error('댓글 조회 실패:', error);
        console.error('에러 상세:', error.response?.data);
        throw error;
    }
};

// 댓글 수정
export const updateComment = async (commentId, commentData) => {
    console.log('댓글 수정 시작, ID:', commentId, '데이터:', commentData);
    try {
        const response = await axios.put(`/api/comments/${commentId}`, commentData);
        console.log('댓글 수정 성공:', response.data);
        return response.data;
    } catch (error) {
        console.error('댓글 수정 실패:', error);
        console.error('에러 상세:', error.response?.data);
        throw error;
    }
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
    console.log('댓글 삭제 시작, ID:', commentId);
    try {
        const response = await axios.delete(`/api/comments/${commentId}`);
        console.log('댓글 삭제 성공:', response.data);
        return response.data;
    } catch (error) {
        console.error('댓글 삭제 실패:', error);
        console.error('에러 상세:', error.response?.data);
        throw error;
    }
};

// 개별 댓글 조회
export const getComment = async (commentId) => {
    console.log('개별 댓글 조회 시작, ID:', commentId);
    try {
        const response = await axios.get(`/api/comments/${commentId}`);
        console.log('개별 댓글 조회 성공:', response.data);
        return response.data;
    } catch (error) {
        console.error('개별 댓글 조회 실패:', error);
        console.error('에러 상세:', error.response?.data);
        throw error;
    }
}; 