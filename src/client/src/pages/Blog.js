import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import BlogHeader from "../components/blog/BlogHeader";
import BlogFilters from "../components/blog/BlogFilters";
import BlogGrid from "../components/blog/BlogGrid";
import BlogPagination from "../components/blog/BlogPagination";
import CreatePostFab from "../components/blog/CreatePostFab";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { useBlogData } from "../components/blog/useBlogData";
import { useBlogFilters } from "../components/blog/useBlogFilters";
import axios from "../api/config";

const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "comments", label: "댓글순" },
];

function Blog() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { posts, loading, error } = useBlogData();
  const [categories, setCategories] = useState(["전체"]);

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    page,
    currentPosts,
    totalPages,
    handlePageChange,
  } = useBlogFilters(posts);

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/category/admin');
        const categoryNames = response.data.map(cat => cat.name);
        setCategories(["전체", ...categoryNames]);
      } catch (error) {
        console.error("카테고리 로드 실패:", error);
      }
    };

    fetchCategories();
  }, []);

  const handlePostClick = (postId) => {
    console.log(' Blog 포스트 클릭, ID:', postId);
    navigate(`/blogDetail/${postId}`);
  };

  if (loading) return <LoadingState message="게시글을 불러오는 중..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2 } }}>
      <BlogHeader />

      <BlogFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        sortOptions={sortOptions}
      />

      <BlogGrid posts={currentPosts} onPostClick={handlePostClick} />

      <BlogPagination
        totalPages={totalPages}
        currentPage={page}
        onPageChange={handlePageChange}
      />

      <CreatePostFab
        onClick={() => navigate('/create')}
        show={isAuthenticated()}
      />
    </Container>
  );
}

export default Blog;
