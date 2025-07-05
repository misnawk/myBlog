import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Chip,
    Paper,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getPost } from '../api/postGetApi';
import MarkdownRenderer from '../components/MarkdownRenderer';

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('📄 [BLOG DETAIL] 블로그 상세 페이지 컴포넌트 렌더링');
    console.log('📄 [BLOG DETAIL] URL 파라미터 ID:', id);

    useEffect(() => {
        console.log('📄 [BLOG DETAIL] useEffect 실행 - 포스트 데이터 로딩 시작');
        
        if (!id) {
            console.error('❌ [BLOG DETAIL] ID 파라미터가 없음');
            setError('포스트 ID가 필요합니다.');
            setLoading(false);
            return;
        }

        loadPost();
    }, [id]);

    const loadPost = async () => {
        console.log('📊 [BLOG DETAIL] 포스트 데이터 로딩 함수 시작');
        console.log('📊 [BLOG DETAIL] 요청할 포스트 ID:', id);
        
        setLoading(true);
        setError(null);
        
        try {
            const postData = await getPost(id);
            console.log('✅ [BLOG DETAIL] 포스트 데이터 로딩 성공');
            console.log('📋 [BLOG DETAIL] 로딩된 포스트 정보:', {
                id: postData.id,
                title: postData.title,
                category: postData.category,
                author: postData.author?.email,
                contentLength: postData.content?.length || 0,
                createdAt: postData.createdAt
            });
            
            setPost(postData);
        } catch (error) {
            console.error('❌ [BLOG DETAIL] 포스트 데이터 로딩 실패');
            console.error('❌ [BLOG DETAIL] Error:', error.message);
            console.error('❌ [BLOG DETAIL] Error status:', error.response?.status);
            
            if (error.response?.status === 404) {
                setError('포스트를 찾을 수 없습니다.');
            } else {
                setError('포스트를 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
            console.log('📄 [BLOG DETAIL] 포스트 데이터 로딩 완료');
        }
    };

    const handleBackClick = () => {
        console.log('🔙 [BLOG DETAIL] 뒤로가기 버튼 클릭');
        navigate('/blog');
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            console.warn('⚠️ [BLOG DETAIL] 날짜 문자열이 없음');
            return '날짜 없음';
        }
        
        try {
            const date = new Date(dateString);
            const formatted = date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            console.log('📅 [BLOG DETAIL] 날짜 포맷팅 성공:', formatted);
            return formatted;
        } catch (error) {
            console.error('❌ [BLOG DETAIL] 날짜 포맷팅 오류:', error);
            return '날짜 오류';
        }
    };

    console.log('📄 [BLOG DETAIL] 현재 렌더링 상태:', {
        loading,
        error: !!error,
        hasPost: !!post,
        postId: post?.id
    });

    if (loading) {
        console.log('⏳ [BLOG DETAIL] 로딩 중 표시');
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <Box textAlign="center">
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="h6">포스트를 불러오는 중...</Typography>
                    </Box>
                </Box>
            </Container>
        );
    }

    if (error) {
        console.log('❌ [BLOG DETAIL] 오류 상태 표시:', error);
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" minHeight="50vh">
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            onClick={loadPost}
                        >
                            다시 시도
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={handleBackClick}
                            startIcon={<ArrowBackIcon />}
                        >
                            목록으로
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }

    if (!post) {
        console.log('❌ [BLOG DETAIL] 포스트 데이터가 없음');
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" minHeight="50vh">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        포스트 데이터가 없습니다.
                    </Typography>
                    <Button 
                        variant="outlined" 
                        onClick={handleBackClick}
                        startIcon={<ArrowBackIcon />}
                    >
                        목록으로
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* 뒤로가기 버튼 */}
            <Button
                onClick={handleBackClick}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 3 }}
            >
                목록으로
            </Button>

            {/* 포스트 헤더 */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {post.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {post.category && (
                            <Chip 
                                label={post.category} 
                                color="primary" 
                                variant="outlined" 
                            />
                        )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                        작성자: {post.author?.email || '익명'} • {formatDate(post.createdAt)}
                    </Typography>
                </Box>
            </Paper>

            {/* 포스트 내용 */}
            <Paper sx={{ p: 4 }}>
                <MarkdownRenderer content={post.content} />
            </Paper>
        </Container>
    );
};

export default BlogDetail;
