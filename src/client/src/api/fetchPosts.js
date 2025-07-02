const getPosts = async () => {

    try{
    const response = await fetch('api/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  
    if(!response.ok){
      throw new Error('게시글 조회 실패');
    }
  
    const data = await response.json();
    return data;
        
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      throw error;
    }
}

export default getPosts;