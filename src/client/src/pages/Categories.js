import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Alert
} from '@mui/material';
import { getPosts } from '../api/postGetApi';

const Categories = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    console.log('🏷️ [CATEGORIES PAGE] 카테고리 페이지 컴포넌트 렌더링');

    useEffect(() => {
        console.log('🏷️ [CATEGORIES PAGE] useEffect 실행 - 데이터 로딩 시작');
        loadPosts();
    }, []);

    useEffect(() => {
        console.log('🏷️ [CATEGORIES PAGE] URL 파라미터 확인');
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            console.log('🏷️ [CATEGORIES PAGE] URL에서 카테고리 설정:', categoryFromUrl);
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    const loadPosts = async () => {
        console.log('📊 [CATEGORIES PAGE] 포스트 데이터 로딩 시작');
        setLoading(true);
        setError(null);
        
        try {
            const data = await getPosts();
            console.log('✅ [CATEGORIES PAGE] 포스트 데이터 로딩 성공');
            console.log('📊 [CATEGORIES PAGE] 총 포스트 수:', data?.length || 0);
            
            setPosts(data || []);
            
            // 카테고리 추출 및 통계 계산
            const categoryStats = {};
            data?.forEach(post => {
                if (post.category) {
                    categoryStats[post.category] = (categoryStats[post.category] || 0) + 1;
                }
            });
            
            const categoryList = Object.entries(categoryStats).map(([name, count]) => ({
                name,
                count
            }));
            
            console.log('🏷️ [CATEGORIES PAGE] 카테고리 통계:', categoryStats);
            console.log('🏷️ [CATEGORIES PAGE] 카테고리 목록:', categoryList);
            
            setCategories(categoryList);
            
        } catch (error) {
            console.error('❌ [CATEGORIES PAGE] 포스트 데이터 로딩 실패');
            console.error('❌ [CATEGORIES PAGE] Error:', error.message);
            setError('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            console.log('🏷️ [CATEGORIES PAGE] 데이터 로딩 완료');
        }
    };

    const handleCategoryChange = (event, newValue) => {
        console.log('🏷️ [CATEGORIES PAGE] 카테고리 탭 변경:', newValue);
        setSelectedCategory(newValue);
        
        // URL 파라미터 업데이트
        if (newValue === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category: newValue });
        }
    };

    const getFilteredPosts = () => {
        if (selectedCategory === 'all') {
            console.log('🔍 [CATEGORIES PAGE] 전체 포스트 반환:', posts.length);
            return posts;
        }
        
        const filtered = posts.filter(post => post.category === selectedCategory);
        console.log('🔍 [CATEGORIES PAGE] 필터링된 포스트:', filtered.length);
        return filtered;
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
            console.error('❌ [CATEGORIES PAGE] 날짜 포맷팅 오류:', error);
            return '날짜 오류';
        }
    };

    const filteredPosts = getFilteredPosts();

    console.log('🏷️ [CATEGORIES PAGE] 렌더링 상태:', {
        loading,
        error: !!error,
        totalPosts: posts.length,
        categoriesCount: categories.length,
        selectedCategory,
        filteredPostsCount: filteredPosts.length
    });

    if (loading) {
        console.log('⏳ [CATEGORIES PAGE] 로딩 중 표시');
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <Typography variant="h6">데이터를 불러오는 중...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        console.log('❌ [CATEGORIES PAGE] 오류 상태 표시:', error);
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" minHeight="50vh">
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button 
                        variant="contained" 
                        onClick={loadPosts}
                    >
                        다시 시도
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                카테고리별 포스트
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                관심 있는 카테고리를 선택하여 포스트를 확인해보세요.
            </Typography>

            {/* 카테고리 탭 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs 
                    value={selectedCategory} 
                    onChange={handleCategoryChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab 
                        label={`전체 (${posts.length})`} 
                        value="all" 
                    />
                    {categories.map((category) => (
                        <Tab
                            key={category.name}
                            label={`${category.name} (${category.count})`}
                            value={category.name}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* 포스트 목록 */}
            {filteredPosts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        {selectedCategory === 'all' 
                            ? '아직 포스트가 없습니다.' 
                            : `'${selectedCategory}' 카테고리에 포스트가 없습니다.`
                        }
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredPosts.map((post) => (
                        <Grid item xs={12} md={6} key={post.id}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
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
                                                color: 'inherit' 
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
        </Container>
    );
};

export default Categories; 