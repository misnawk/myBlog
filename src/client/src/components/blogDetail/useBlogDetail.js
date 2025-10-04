import { useState, useEffect } from "react";
import { getPost } from "../../api/postGetApi";
import { getCommentsByPost } from "../../api/commentApi";

export function useBlogDetail(id) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('📖 BlogDetail 페이지 로딩 시작, ID:', id);
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('⏳ BlogDetail 로딩 상태 설정');

        const postData = await getPost(id);
        setPost(postData);
        setLikeCount(postData.likes || 0);
        console.log('✅ BlogDetail 포스트 데이터 설정 완료:', postData?.title);

        const commentsData = await getCommentsByPost(id);
        setComments(commentsData || []);
        console.log('✅ BlogDetail 댓글 데이터 설정 완료, 총 개수:', commentsData?.length || 0);
      } catch (error) {
        console.error('❌ BlogDetail 데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
        console.log('✅ BlogDetail 로딩 완료');
      }
    };

    fetchData();
  }, [id]);

  return {
    post,
    comments,
    setComments,
    isLiked,
    setIsLiked,
    likeCount,
    setLikeCount,
    loading,
    error
  };
}
