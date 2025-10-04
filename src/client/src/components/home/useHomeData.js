import { useState, useEffect } from "react";
import { getPosts } from "../../api/postGetApi";

export function useHomeData() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todoAlert, setTodoAlert] = useState(null);

  useEffect(() => {
    console.log(' Home 페이지 데이터 로딩 시작');
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(' 로딩 상태 설정 완료');

        console.log(' 포스트 데이터 요청 시작');
        const allPosts = await getPosts();
        console.log(' 포스트 데이터 수신 완료, 총 개수:', allPosts?.length || 0);

        // 최근 포스트 3개 선택
        const recent = allPosts.slice(0, 3);
        setRecentPosts(recent);
        console.log(' 최근 포스트 설정 완료:', recent.length);

        // 카테고리별 포스트 수 계산
        console.log(' 카테고리 분석 시작');
        const categoryCount = {};
        allPosts.forEach(post => {
          const category = post.category || '기타';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        console.log(' 카테고리 통계:', categoryCount);

        // 카테고리를 포스트 수 기준으로 정렬
        const sortedCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8); // 최대 8개까지만 표시

        setPopularCategories(sortedCategories);
        console.log(' 인기 카테고리 설정 완료:', sortedCategories.length);

        // 할일 카테고리 알림 체크
        const todoPosts = allPosts.filter(post => post.category === '할일');
        if (todoPosts.length > 0) {
          setTodoAlert({
            count: todoPosts.length,
            latestPost: todoPosts[0] // 가장 최근 할일 포스트
          });
          console.log(` 할일 알림 설정: ${todoPosts.length}개의 할일이 있습니다.`);
        }

      } catch (error) {
        console.error(' 데이터 로딩 실패:', error);
        console.error(' 에러 상세:', error.response?.data);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
        console.log(' 데이터 로딩 완료 (로딩 상태 해제)');
      }
    };

    fetchData();
  }, []);

  return {
    recentPosts,
    popularCategories,
    loading,
    error,
    todoAlert,
    setTodoAlert
  };
}
