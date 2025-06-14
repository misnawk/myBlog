import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
  Fab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import CreateIcon from "@mui/icons-material/Create";
import { useAuth } from "../contexts/AuthContext";

// 임시 포스트 데이터
const posts = [
  {
    id: 1,
    title: "React Hooks 완벽 가이드",
    excerpt:
      "React Hooks의 기본 개념부터 고급 사용법까지 알아보는 완벽 가이드입니다",
    image: "https://source.unsplash.com/random/800x600?react",
    category: "프론트엔드",
    date: "2024-03-15",
    readTime: "5분",
    likes: 42,
    comments: 12,
    tags: ["React", "JavaScript", "Hooks"],
  },
  {
    id: 2,
    title: "Node.js 성능 최적화",
    excerpt:
      "Node.js 애플리케이션의 성능을 최적화하는 다양한 방법을 소개합니다.",
    image: "https://source.unsplash.com/random/800x600?nodejs",
    category: "백엔드",
    date: "2024-03-14",
    readTime: "8분",
    likes: 35,
    comments: 8,
    tags: ["Node.js", "JavaScript", "Performance"],
  },
  {
    id: 3,
    title: "Docker 컨테이너 관리",
    excerpt:
      "Docker 컨테이너를 효율적으로 관리하는 방법과 모범 사례를 알아봅니다.",
    image: "https://source.unsplash.com/random/800x600?docker",
    category: "DevOps",
    date: "2024-03-13",
    readTime: "6분",
    likes: 28,
    comments: 5,
    tags: ["Docker", "DevOps", "Container"],
  },
  {
    id: 4,
    title: "TypeScript 타입 시스템",
    excerpt:
      "TypeScript의 타입 시스템을 깊이 있게 이해하고 활용하는 방법을 알아봅니다.",
    image: "https://source.unsplash.com/random/800x600?typescript",
    category: "프론트엔드",
    date: "2024-03-12",
    readTime: "7분",
    likes: 31,
    comments: 9,
    tags: ["TypeScript", "JavaScript", "Type System"],
  },
];

const categories = ["전체", "프론트엔드", "백엔드", "DevOps", "알고리즘"];
const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "comments", label: "댓글순" },
];

function Blog() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const postsPerPage = 6;

  // 검색어, 카테고리, 정렬 기준에 따라 포스트 필터링
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "전체" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.date) - new Date(a.date);
        case "popular":
          return b.likes - a.likes;
        case "comments":
          return b.comments - a.comments;
        default:
          return 0;
      }
    });

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

  const handlePostClick = (postId) => {
    navigate(`/blogDetail/${postId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          블로그 포스트
        </Typography>
        <Typography variant="body1" color="text.secondary">
          개발 관련 다양한 주제의 포스트를 확인하세요
        </Typography>
      </Box>

      {/* 필터 섹션 */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="포스트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={selectedCategory}
                label="카테고리"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortBy}
                label="정렬"
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* 포스트 그리드 */}
      <Grid container spacing={4}>
        {currentPosts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={post.image}
                alt={post.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Chip label={post.category} size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {post.date}
                  </Typography>
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.excerpt}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {post.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {post.readTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                      <FavoriteIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {post.likes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                      <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {post.comments}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => handlePostClick(post.id)}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                     자세히 보기
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* 플로팅 글쓰기 버튼 */}
      {isAuthenticated() && (
        <Fab
          color="primary"
          onClick={() => navigate('/create')}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: 6
            },
            transition: 'all 0.3s ease'
          }}
        >
          <CreateIcon />
        </Fab>
      )}
    </Container>
  );
}

export default Blog;
