import axios from './config';


// 모든 게시글 가져올때 사용하는 API
const getPosts = async () => {
    try{
      const response = await axios.get('/api/posts/postAll');
      return response.data;
        
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      throw error;
    }
}

// 개별 게시글 가져올때 사용하는 API
const getPost = async (id) => {
    try{
      const response = await axios.get(`/api/posts/${id}`);
      return response.data;
        
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      throw error;
    }
}

export { getPosts, getPost };
export default getPosts;