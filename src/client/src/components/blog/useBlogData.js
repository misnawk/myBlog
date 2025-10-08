import { useState, useEffect } from "react";
import getPosts from "../../api/postGetApi";

export function useBlogData() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Blog 페이지 데이터 로딩 시작');
    const loadPosts = async () => {
      try {
        setLoading(true);
        console.log('Blog 로딩 상태 설정');

        const data = await getPosts();
        console.log('Blog 포스트 데이터 수신, 개수:', data?.length || 0);

        setPosts(Array.isArray(data) ? data : []);
        setError(null);
        console.log('Blog 포스트 상태 업데이트 완료');
      } catch (error) {
        setError('게시글을 불러오는데 실패했습니다.');
        console.error('Blog 포스트 로딩 실패:', error);
      } finally {
        setLoading(false);
        console.log('Blog 로딩 완료');
      }
    };

    loadPosts();
  }, []);

  return { posts, loading, error };
}
