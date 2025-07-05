import React, { useState, useEffect } from 'react';
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
  Button,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getPosts } from '../api/postGetApi';

// 카테고리 설명 매핑
const categoryDescriptions = {
  '프론트': 'React, Vue, Angular 등 프론트엔드 개발 관련 포스트',
  '백엔드': 'Node.js, Spring, Django 등 백엔드 개발 관련 포스트',
  '데이터베이스': 'MySQL, PostgreSQL, MongoDB 등 데이터베이스 관련 포스트',
  '보안': '웹 보안, 네트워크 보안 등 보안 관련 포스트',
  '네트워크': '네트워크 프로토콜, 인프라 등 네트워크 관련 포스트',
  '모의해킹': '모의해킹, 취약점 분석 등 해킹 관련 포스트',
  '인공지능': 'AI, 머신러닝, 딥러닝 등 인공지능 관련 포스트',
  '기타': '기타 개발 관련 포스트'
};

function Categories() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabLabels, setTabLabels] = useState(['전체']);

  useEffect(() => {
    console.log(' Categories 페이지 데이터 로딩 시작');
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log(' Categories 로딩 상태 설정');
        
        // 모든 포스트 가져오기
        const allPosts = await getPosts();
        console.log(' Categories 포스트 데이터 수신, 개수:', allPosts?.length || 0);
        
        // 카테고리별 포스트 수 계산 및 태그 수집
        const categoryData = {};
        allPosts.forEach(post => {
          const categoryName = post.category || '기타';
          
          if (!categoryData[categoryName]) {
            categoryData[categoryName] = {
              name: categoryName,
              postCount: 0,
              tags: new Set(),
              posts: []
            };
          }
          
          categoryData[categoryName].postCount++;
          categoryData[categoryName].posts.push(post);
          
          // 태그가 있다면 추가 (임시로 카테고리 기반 태그 생성)
          if (post.tags) {
            post.tags.forEach(tag => categoryData[categoryName].tags.add(tag));
          }
        });
        
        // 카테고리 데이터 변환
        const categoriesArray = Object.values(categoryData).map((cat, index) => ({
          id: index + 1,
          name: cat.name,
          description: categoryDescriptions[cat.name] || `${cat.name} 관련 포스트`,
          postCount: cat.postCount,
          tags: Array.from(cat.tags).slice(0, 5), // 최대 5개 태그만 표시
          posts: cat.posts
        }));
        
        // 포스트 수 기준으로 정렬
        categoriesArray.sort((a, b) => b.postCount - a.postCount);
        
        setCategories(categoriesArray);
        setFilteredCategories(categoriesArray);
        console.log(' Categories 카테고리 데이터 설정 완료, 개수:', categoriesArray.length);
        
        // 탭 라벨 설정
        const labels = ['전체', ...categoriesArray.map(cat => cat.name)];
        setTabLabels(labels);
        console.log(' Categories 탭 라벨 설정 완료:', labels);
        
      } catch (error) {
        console.error(' Categories 데이터 로딩 실패:', error);
        setError('카테고리 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
        console.log(' Categories 로딩 완료');
      }
    };

    fetchCategories();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    
    if (newValue === 0) {
      // 전체 탭
      setFilteredCategories(categories);
    } else {
      // 특정 카테고리 탭
      const selectedCategory = tabLabels[newValue];
      setFilteredCategories(categories.filter(cat => cat.name === selectedCategory));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          카테고리 데이터를 불러오는 중...
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          카테고리
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          관심 있는 주제별로 포스트를 찾아보세요
        </Typography>
      </Box>

      {tabLabels.length > 1 && (
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Paper>
      )}

      {filteredCategories.length > 0 ? (
        <Grid container spacing={4}>
          {filteredCategories.map((category) => (
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
                  {category.tags.length > 0 && (
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
                  )}
                  <Button
                    component={Link}
                    to={`/blog?category=${encodeURIComponent(category.name)}`}
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
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            아직 카테고리가 없습니다.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            첫 번째 포스트를 작성해보세요!
          </Typography>
          <Button
            component={Link}
            to="/create"
            variant="contained"
            sx={{ mt: 2 }}
          >
            포스트 작성하기
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Categories; 