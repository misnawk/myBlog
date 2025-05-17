import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';

// 임시 카테고리 데이터
const categories = [
  {
    id: 1,
    name: '프론트엔드',
    description: 'React, Vue, Angular 등 프론트엔드 개발 관련 포스트',
    postCount: 12,
    tags: ['React', 'JavaScript', 'CSS', 'HTML']
  },
  {
    id: 2,
    name: '백엔드',
    description: 'Node.js, Spring, Django 등 백엔드 개발 관련 포스트',
    postCount: 8,
    tags: ['Node.js', 'Java', 'Python', 'Database']
  },
  {
    id: 3,
    name: 'DevOps',
    description: 'Docker, Kubernetes, CI/CD 등 DevOps 관련 포스트',
    postCount: 5,
    tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
  },
  {
    id: 4,
    name: '알고리즘',
    description: '자료구조, 알고리즘 문제 풀이 및 설명',
    postCount: 15,
    tags: ['Algorithm', 'Data Structure', 'Problem Solving']
  }
];

function Categories() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          카테고리
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          관심 있는 주제별로 포스트를 찾아보세요
        </Typography>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="전체" />
          <Tab label="프론트엔드" />
          <Tab label="백엔드" />
          <Tab label="DevOps" />
          <Tab label="알고리즘" />
        </Tabs>
      </Paper>

      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} key={category.id}>
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
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h2">
                    {category.name}
                  </Typography>
                  <Chip 
                    label={`${category.postCount}개의 포스트`}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {category.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {category.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Button
                  component={Link}
                  to={`/category/${category.id}`}
                  variant="outlined"
                  fullWidth
                >
                  포스트 보기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Categories; 