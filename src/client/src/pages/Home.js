import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import { getPosts } from '../api/postGetApi';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('🏠 [HOME PAGE] 홈 페이지 컴포넌트 렌더링');

    useEffect(() => {
        console.log('🏠 [HOME PAGE] useEffect 실행 - 데이터 로딩 시작');
        loadData();
    }, []);

    const loadData = async () => {
        console.log('📊 [HOME PAGE] 데이터 로딩 함수 시작');
        setLoading(true);
        setError(null);
        
        try {
            console.log('📚 [HOME PAGE] 포스트 데이터 요청');
            const postsData = await getPosts();
            
            console.log('✅ [HOME PAGE] 포스트 데이터 로딩 성공');
            console.log('📊 [HOME PAGE] 로딩된 포스트 수:', postsData?.length || 0);
            
            if (postsData && postsData.length > 0) {
                console.log('📋 [HOME PAGE] 첫 번째 포스트 샘플:', {
                    id: postsData[0].id,
                    title: postsData[0].title,
                    category: postsData[0].category
                });
            }
            
            setPosts(postsData || []);
            
            // 카테고리 추출
            const uniqueCategories = [...new Set(postsData?.map(post => post.category).filter(Boolean))];
            console.log('🏷️ [HOME PAGE] 추출된 카테고리:', uniqueCategories);
            setCategories(uniqueCategories);
            
        } catch (error) {
            console.error('❌ [HOME PAGE] 데이터 로딩 실패');
            console.error('❌ [HOME PAGE] Error:', error.message);
            setError('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            console.log('🏠 [HOME PAGE] 데이터 로딩 완료');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '날짜 없음';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('❌ [HOME PAGE] 날짜 포맷팅 오류:', error);
            return '날짜 오류';
        }
    };

    console.log('🏠 [HOME PAGE] 렌더링 상태:', {
        loading,
        error: !!error,
        postsCount: posts.length,
        categoriesCount: categories.length
    });

    if (loading) {
        console.log('⏳ [HOME PAGE] 로딩 중 표시');
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <Typography variant="h6">데이터를 불러오는 중...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        console.log('❌ [HOME PAGE] 오류 상태 표시:', error);
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" minHeight="50vh">
                    <Typography variant="h6" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={loadData}
                        sx={{ mt: 2 }}
                    >
                        다시 시도
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    환영합니다!
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    개발에 대한 정보를 공유하는 공간입니다.
                </Typography>
            </Box>

            {/* 카테고리 섹션 */}
            {categories.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        카테고리
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                component={Link}
                                to={`/categories?category=${encodeURIComponent(category)}`}
                                clickable
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* 최근 포스트 섹션 */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    최근 포스트
                </Typography>
                
                {posts.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                        아직 포스트가 없습니다.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {posts.slice(0, 6).map((post) => (
                            <Grid item xs={12} md={6} key={post.id}>
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
                                        <Typography variant="h6" component="h2" gutterBottom>
                                            <Link 
                                                to={`/blog/${post.id}`}
                                                style={{ 
                                                    textDecoration: 'none', 
                                                    color: 'inherit',
                                                    '&:hover': { color: 'primary.main' }
                                                }}
                                            >
                                                {post.title}
                                            </Link>
                                        </Typography>
                                        
                                        {post.category && (
                                            <Chip 
                                                label={post.category} 
                                                size="small" 
                                                color="primary" 
                                                sx={{ mb: 1 }}
                                            />
                                        )}
                                        
                                        <Typography variant="body2" color="text.secondary">
                                            {post.author?.email || '익명'} • {formatDate(post.createdAt)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                
                {posts.length > 6 && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Button 
                            component={Link} 
                            to="/blog" 
                            variant="outlined" 
                            size="large"
                        >
                            더 많은 포스트 보기
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Home; 