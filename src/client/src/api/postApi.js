
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

export default createPost;