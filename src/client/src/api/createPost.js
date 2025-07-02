import axios from './config';

// 작성한 글을 서버로 보내주는 API
const createPost = async (postData) => {
    try {
        const response = await axios.post('/api/posts', postData);
        return response.data;
    } catch (error) {
        console.error('글 작성 실패:', error);
        throw error;
    }
};

export default createPost;