import React, { useState, useEffect } from 'react';
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
  Paper,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { getPosts } from '../api/postGetApi';
import { createPreview } from '../utils/htmlUtils';



function Home() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 모든 포스트 가져오기
        const allPosts = await getPosts();
        
        // 최근 포스트 3개 선택
        const recent = allPosts.slice(0, 3);
        setRecentPosts(recent);
        
        // 카테고리별 포스트 수 계산
        const categoryCount = {};
        allPosts.forEach(post => {
          const category = post.category || '기타';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
        // 카테고리를 포스트 수 기준으로 정렬
        const sortedCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8); // 최대 8개까지만 표시
        
        setPopularCategories(sortedCategories);
        
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          데이터를 불러오는 중...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 히어로 섹션 */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          개발 블로그
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          배운것을 기록하기 위한 기술 블로그
        </Typography>
        <Button
          component={Link}
          to="/blog"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          포스트 보기
        </Button>
      </Box>

      {/* 최근 포스트 섹션 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          최근 포스트
        </Typography>
        {recentPosts.length > 0 ? (
          <Grid container spacing={4}>
            {recentPosts.map((post) => (
              <Grid item xs={12} md={4} key={post.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  {post.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={post.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip 
                      label={post.category || '기타'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h5" component="h3" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {createPreview(post.content, 100)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        작성자: {post.author?.email || '익명'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      to={`/blogDetail/${post.id}`}
                      variant="outlined"
                      fullWidth
                    >
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            아직 작성된 포스트가 없습니다.
          </Typography>
        )}
      </Box>

      {/* 카테고리 섹션 */}
      <Paper sx={{ p: 3, mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          인기 카테고리
        </Typography>
        {popularCategories.length > 0 ? (
          <Grid container spacing={2}>
            {popularCategories.map((category) => (
              <Grid item xs={6} sm={3} key={category.name}>
                <Button
                  component={Link}
                  to={`/blog?category=${encodeURIComponent(category.name)}`}
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    py: 2
                  }}
                >
                  <Typography variant="h6" component="span">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count}개의 포스트
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            카테고리가 없습니다.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default Home; 