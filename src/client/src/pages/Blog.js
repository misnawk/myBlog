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
  useTheme,
  useMediaQuery,
  Avatar,
  Stack,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CreateIcon from "@mui/icons-material/Create";
import { useAuth } from "../contexts/AuthContext";
import getPosts from "../api/postGetApi"
import { useEffect } from "react";
import { createPreview } from "../utils/htmlUtils";
import { CATEGORIES, CATEGORY_NAMES } from "../components/categories";

const categories = ["전체", ...CATEGORY_NAMES];
const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "comments", label: "댓글순" },
];

function Blog() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]); // API에서 가져올 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const postsPerPage = 6;

  // URL 쿼리 파라미터에서 카테고리 확인
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // API에서 게시글 목록 가져오기
  useEffect(() => {
    console.log(' Blog 페이지 데이터 로딩 시작');
    const loadPosts = async () => {
      try {
        setLoading(true);
        console.log(' Blog 로딩 상태 설정');
        
        const data = await getPosts();
        console.log(' Blog 포스트 데이터 수신, 개수:', data?.length || 0);

        
        setPosts(Array.isArray(data) ? data : []);
        setError(null);
        console.log(' Blog 포스트 상태 업데이트 완료');

      } catch (error) {
        setError('게시글을 불러오는데 실패했습니다.');
        console.error(' Blog 포스트 로딩 실패:', error);
      } finally {
        setLoading(false);
        console.log(' Blog 로딩 완료');
      }
    };

    loadPosts();
  }, []);

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6">게시글을 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러 발생 시 표시
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  // 검색어, 카테고리, 정렬 기준에 따라 포스트 필터링
  const filteredPosts = Array.isArray(posts) ? posts
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
    }) : [];

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
    console.log(' Blog 포스트 클릭, ID:', postId);
    navigate(`/blogDetail/${postId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
          블로그 포스트
        </Typography>
        <Typography variant="body1" color="text.secondary">
          개발 관련 다양한 주제의 포스트를 확인하세요
        </Typography>
      </Box>

      {/* 필터 섹션 */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="포스트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size={isMobile ? "small" : "medium"}
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
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
      <Grid container spacing={isMobile ? 2 : 4}>
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
              {post.image && (
                <CardMedia
                  component="img"
                  height={isMobile ? "160" : "200"}
                  image={post.image}
                  alt={post.title}
                  sx={{ objectFit: "cover" }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 1, sm: 0 }
                  }}
                >
                  <Chip 
                    label={post.category || '기타'} 
                    size={isMobile ? "small" : "medium"}
                  />
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                  >
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h2" 
                  gutterBottom
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.2,
                  }}
                >
                  {post.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  paragraph
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: { xs: 2, sm: 3 },
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {createPreview(post.content, isMobile ? 80 : 150)}
                </Typography>
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1,
                    width: { xs: "100%", sm: "auto" }
                  }}>
                    <Avatar 
                      sx={{ 
                        width: isMobile ? 24 : 32, 
                        height: isMobile ? 24 : 32,
                        fontSize: isMobile ? "0.75rem" : "1rem"
                      }}
                    >
                      {post.author?.username?.[0] || post.author?.email?.[0] || "?"}
                    </Avatar>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      color="text.secondary"
                    >
                      {post.author?.username || post.author?.email || "익명"}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => handlePostClick(post.id)}
                    variant="contained"
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
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
            size={isMobile ? "medium" : "large"}
          />
        </Box>
      )}

      {/* 플로팅 글쓰기 버튼 */}
      {isAuthenticated() && (
        <Fab
          color="primary"
          onClick={() => navigate('/create')}
          size={isMobile ? "medium" : "large"}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 32 },
            right: { xs: 16, sm: 32 },
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
