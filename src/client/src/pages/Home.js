import React from 'react';
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
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';

// 임시 포스트 데이터
const recentPosts = [
  {
    id: 1,
    title: 'React Hooks 완벽 가이드',
    excerpt: 'React Hooks의 기본 개념부터 고급 사용법까지 알아보는 완벽 가이드입니다.',
    image: 'https://source.unsplash.com/random/800x600?react',
    category: '프론트엔드',
    date: '2024-03-15',
    readTime: '5분',
    likes: 42,
    comments: 12
  },
  {
    id: 2,
    title: 'Node.js 성능 최적화',
    excerpt: 'Node.js 애플리케이션의 성능을 최적화하는 다양한 방법을 소개합니다.',
    image: 'https://source.unsplash.com/random/800x600?nodejs',
    category: '백엔드',
    date: '2024-03-14',
    readTime: '8분',
    likes: 35,
    comments: 8
  },
  {
    id: 3,
    title: 'Docker 컨테이너 관리',
    excerpt: 'Docker 컨테이너를 효율적으로 관리하는 방법과 모범 사례를 알아봅니다.',
    image: 'https://source.unsplash.com/random/800x600?docker',
    category: 'DevOps',
    date: '2024-03-13',
    readTime: '6분',
    likes: 28,
    comments: 5
  }
];

const popularCategories = [
  { name: '프론트엔드', count: 12 },
  { name: '백엔드', count: 8 },
  { name: 'DevOps', count: 5 },
  { name: '알고리즘', count: 15 },
  { name: '데이터베이스', count: 10 },
  { name: '머신러닝', count: 7 },
  { name: '딥러닝', count: 5 },
  { name: '빅데이터', count: 3 },
  { name: '보안', count: 1 },
  { name: '네트워크', count: 1 }
];

// 임시 댓글 데이터
const recentComments = [
  {
    id: 1,
    author: '김개발',
    content: '정말 유용한 글이네요! 특히 React Hooks 부분이 도움이 많이 되었습니다.',
    postTitle: 'React Hooks 완벽 가이드',
    date: '2024-03-15'
  },
  {
    id: 2,
    author: '이코딩',
    content: 'Node.js 성능 최적화 팁이 실무에서 바로 적용할 수 있어서 좋았습니다.',
    postTitle: 'Node.js 성능 최적화',
    date: '2024-03-14'
  },
  {
    id: 3,
    author: '박개발',
    content: 'Docker 컨테이너 관리에 대한 내용이 체계적으로 정리되어 있네요.',
    postTitle: 'Docker 컨테이너 관리',
    date: '2024-03-13'
  }
];

// 임시 태그 데이터
const popularTags = [
  { name: 'React', count: 25 },
  { name: 'JavaScript', count: 20 },
  { name: 'Node.js', count: 18 },
  { name: 'TypeScript', count: 15 },
  { name: 'Docker', count: 12 },
  { name: 'AWS', count: 10 },
  { name: 'Python', count: 8 },
  { name: 'Database', count: 7 }
];

function Home() {
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
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={post.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip 
                    label={post.category}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h5" component="h3" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {post.excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {post.readTime}
                    </Typography>
                    <FavoriteIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {post.likes}
                    </Typography>
                    <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {post.comments}
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
      </Box>

      {/* 카테고리 섹션 */}
      <Paper sx={{ p: 3, mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          인기 카테고리
        </Typography>
        <Grid container spacing={2}>
          {popularCategories.map((category) => (
            <Grid item xs={6} sm={3} key={category.name}>
              <Button
                component={Link}
                to={`/category/${category.name}`}
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
      </Paper>

      {/* 최근 댓글과 태그 클라우드 섹션 */}
      <Grid container spacing={4}>
        {/* 최근 댓글 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              최근 댓글
            </Typography>
            <List>
              {recentComments.map((comment) => (
                <React.Fragment key={comment.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>{comment.author[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {comment.author}님이 {comment.postTitle}에 댓글을 남겼습니다
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {comment.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 태그 클라우드 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              인기 태그
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {popularTags.map((tag) => (
                <Chip
                  key={tag.name}
                  label={`${tag.name} (${tag.count})`}
                  component={Link}
                  to={`/tag/${tag.name}`}
                  clickable
                  sx={{
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home; 