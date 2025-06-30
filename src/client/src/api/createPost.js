
// 작성한 글을 서버로 보내주는 API
const createPost = async (postData) => {
    try{
        const response = await fetch('/api/posts', {
           method:'post',
           headers: {
            'Content-Type': 'application/json',
           },
           body: JSON.stringify(postData),
        });

        if(!response.ok){
            throw new Error('서버로 부터 응답이 없습니다.');
        }
        const data = await response.json();
        return data;

    } catch (error){
        console.error('글 작성 실패:', error);
        throw error;
    }

   
};

export default createPost;
