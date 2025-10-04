import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export function useBlogFilters(posts) {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);

  const postsPerPage = 6;

  // URL 쿼리 파라미터에서 카테고리 확인
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // 검색어, 카테고리, 정렬 기준에 따라 포스트 필터링
  const filteredPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];

    return posts
      .filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory =
          selectedCategory === "전체" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "latest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "popular":
            return 0; // 백엔드에 likes 필드가 없음
          case "comments":
            return 0; // 백엔드에 comments 필드가 없음
          default:
            return 0;
        }
      });
  }, [posts, searchQuery, selectedCategory, sortBy]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    page,
    filteredPosts,
    currentPosts,
    totalPages,
    handlePageChange,
  };
}
