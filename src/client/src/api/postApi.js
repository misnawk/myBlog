// 작성한 게시글을 서버로 보낼때 사용
import axios from './config';

// 작성한 글을 서버로 보내주는 API
const createPost = async (postData) => {
    console.log(' 포스트 작성 시작, 제목:', postData?.title);
    console.log(' 포스트 데이터:', postData);
    try {
        const response = await axios.post('/api/posts/write', postData);
        console.log(' 포스트 작성 성공:', response.data);
        return response.data;
    } catch (error) {
        console.error(' 포스트 작성 실패:', error);
        console.error(' 에러 상세:', error.response?.data);
        throw error;
    }
};

// 게시글 수정 API
const updatePost = async (postId, postData) => {
    console.log(' 포스트 수정 시작, ID:', postId);
    console.log(' 수정 데이터:', postData);
    try {
        const response = await axios.put(`/api/posts/${postId}`, postData);
        console.log(' 포스트 수정 성공:', response.data);
        return response.data;
    } catch (error) {
        console.error(' 포스트 수정 실패:', error);
        console.error(' 에러 상세:', error.response?.data);
        throw error;
    }
};

// 게시글 삭제 API
const deletePost = async (postId) => {
    console.log(' 포스트 삭제 시작, ID:', postId);
    try {
        const response = await axios.delete(`/api/posts/${postId}`);
        console.log(' 포스트 삭제 성공:', response.data);
        return response.data;
    } catch (error) {
        console.error(' 포스트 삭제 실패:', error);
        console.error(' 에러 상세:', error.response?.data);
        throw error;
    }
};

export default createPost;
export { updatePost, deletePost };