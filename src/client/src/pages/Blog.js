import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Chip,
    TextField,
    InputAdornment,
    Button,
    Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getPosts } from '../api/postGetApi';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();
    const postsPerPage = 6;

    console.log('📚 [BLOG PAGE] 블로그 페이지 컴포넌트 렌더링');

    useEffect(() => {
        console.log('📚 [BLOG PAGE] useEffect 실행 - 데이터 로딩 시작');
        loadPosts();
    }, []);

    useEffect(() => {
        console.log('📚 [BLOG PAGE] URL 파라미터 확인');
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            console.log('📚 [BLOG PAGE] URL에서 카테고리 설정:', categoryFromUrl);
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        console.log('📚 [BLOG PAGE] 필터링 조건 변경 - 포스트 필터링 시작');
        console.log('📚 [BLOG PAGE] 검색어:', searchTerm);
        console.log('📚 [BLOG PAGE] 선택된 카테고리:', selectedCategory);
        
        filterPosts();
        setCurrentPage(1); // 필터링 시 첫 페이지로 이동
    }, [posts, searchTerm, selectedCategory]);

    const loadPosts = async () => {
        console.log('📊 [BLOG PAGE] 포스트 데이터 로딩 시작');
        setLoading(true);
        setError(null);
        
        try {
            const data = await getPosts();
            console.log('✅ [BLOG PAGE] 포스트 데이터 로딩 성공');
            console.log('📊 [BLOG PAGE] 총 포스트 수:', data?.length || 0);
            
            setPosts(data || []);
            
            // 카테고리 추출
            const uniqueCategories = [...new Set(data?.map(post => post.category).filter(Boolean))];
            console.log('🏷️ [BLOG PAGE] 추출된 카테고리:', uniqueCategories);
            setCategories(uniqueCategories);
            
        } catch (error) {
            console.error('❌ [BLOG PAGE] 포스트 데이터 로딩 실패');
            console.error('❌ [BLOG PAGE] Error:', error.message);
            setError('포스트를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            console.log('📚 [BLOG PAGE] 데이터 로딩 완료');
        }
    };

    const filterPosts = () => {
        console.log('🔍 [BLOG PAGE] 포스트 필터링 시작');
        
        let filtered = posts;
        
        // 카테고리 필터링
        if (selectedCategory) {
            filtered = filtered.filter(post => post.category === selectedCategory);
            console.log('🏷️ [BLOG PAGE] 카테고리 필터링 결과:', filtered.length);
        }
        
        // 검색어 필터링
        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            console.log('🔍 [BLOG PAGE] 검색어 필터링 결과:', filtered.length);
        }
        
        console.log('✅ [BLOG PAGE] 최종 필터링 결과:', filtered.length);
        setFilteredPosts(filtered);
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        console.log('🔍 [BLOG PAGE] 검색어 변경:', value);
        setSearchTerm(value);
    };

    const handleCategoryChange = (category) => {
        console.log('🏷️ [BLOG PAGE] 카테고리 변경:', category);
        setSelectedCategory(category === selectedCategory ? '' : category);
    };

    const handlePageChange = (event, value) => {
        console.log('📄 [BLOG PAGE] 페이지 변경:', value);
        setCurrentPage(value);
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
            console.error('❌ [BLOG PAGE] 날짜 포맷팅 오류:', error);
            return '날짜 오류';
        }
    };

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    console.log('📚 [BLOG PAGE] 렌더링 상태:', {
        loading,
        error: !!error,
        totalPosts: posts.length,
        filteredPosts: filteredPosts.length,
        currentPage,
        totalPages,
        currentPostsCount: currentPosts.length
    });

    if (loading) {
        console.log('⏳ [BLOG PAGE] 로딩 중 표시');
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <Typography variant="h6">포스트를 불러오는 중...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        console.log('❌ [BLOG PAGE] 오류 상태 표시:', error);
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" minHeight="50vh">
                    <Typography variant="h6" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={loadPosts}
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
            <Typography variant="h4" component="h1" gutterBottom>
                블로그 포스트
            </Typography>

            {/* 검색 및 필터 섹션 */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="포스트 검색..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                {/* 카테고리 필터 */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                        label="전체"
                        onClick={() => handleCategoryChange('')}
                        color={selectedCategory === '' ? 'primary' : 'default'}
                        variant={selectedCategory === '' ? 'filled' : 'outlined'}
                    />
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            onClick={() => handleCategoryChange(category)}
                            color={selectedCategory === category ? 'primary' : 'default'}
                            variant={selectedCategory === category ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>
            </Box>

            {/* 포스트 목록 */}
            {currentPosts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm || selectedCategory ? '검색 결과가 없습니다.' : '포스트가 없습니다.'}
                    </Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {currentPosts.map((post) => (
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

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default Blog;
