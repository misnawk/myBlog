import axios from './config';


// 모든 게시글 가져올때 사용하는 API
const getPosts = async () => {
    console.log(' 모든 게시글 조회 시작');
    try{
      const response = await axios.get('/api/posts/postAll');
      console.log(' 게시글 조회 성공, 개수:', response.data?.length || 0);
      return response.data;
        
    } catch (error) {
      console.error(' 게시글 조회 실패:', error);
      console.error(' 에러 상세:', error.response?.data);
      throw error;
    }
}

// 개별 게시글 가져올때 사용하는 API
const getPost = async (id) => {
    console.log(` 개별 게시글 조회 시작, ID: ${id}`);
    try{
      const response = await axios.get(`/api/posts/${id}`);
      console.log(' 개별 게시글 조회 성공:', response.data?.title);
      return response.data;
        
    } catch (error) {
      console.error(` 개별 게시글 조회 실패, ID: ${id}`, error);
      console.error(' 에러 상세:', error.response?.data);
      throw error;
    }
}

export { getPosts, getPost };
export default getPosts;