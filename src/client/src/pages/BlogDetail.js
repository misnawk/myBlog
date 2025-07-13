import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { getPost } from '../api/postGetApi';
import { deletePost } from '../api/postApi';
import { createComment, getCommentsByPost, updateComment, deleteComment } from '../api/commentApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function BlogDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editComment, setEditComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    console.log('📖 BlogDetail 페이지 로딩 시작, ID:', id);
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('⏳ BlogDetail 로딩 상태 설정');
        
        // 개별 포스트 조회
        const postData = await getPost(id);
        setPost(postData);
        setLikeCount(postData.likes || 0);
        console.log('✅ BlogDetail 포스트 데이터 설정 완료:', postData?.title);
        
        // 댓글 데이터 조회
        const commentsData = await getCommentsByPost(id);
        setComments(commentsData || []);
        console.log('✅ BlogDetail 댓글 데이터 설정 완료, 총 개수:', commentsData?.length || 0);
        
      } catch (error) {
        console.error('❌ BlogDetail 데이터 조회 실패:', error);
        setSnackbar({
          open: true,
          message: '데이터를 불러오는데 실패했습니다.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
        console.log('✅ BlogDetail 로딩 완료');
      }
    };

    fetchData();
  }, [id]);

  // 게시글 수정 핸들러
  const handleEditPost = () => {
    navigate(`/edit/${id}`);
  };

  // 게시글 삭제 핸들러
  const handleDeletePost = async () => {
    try {
      console.log(' 게시글 삭제 시작:', id);
      await deletePost(id);
      console.log(' 게시글 삭제 성공');
      
      toast.success('게시글이 삭제되었습니다.');
      navigate('/blog');
    } catch (error) {
      console.error(' 게시글 삭제 실패:', error);
      
      if (error.response?.status === 403) {
        toast.error('게시글 삭제 권한이 없습니다.');
      } else {
        toast.error('게시글 삭제에 실패했습니다.');
      }
    }
    setDeleteDialogOpen(false);
  };

  // 현재 사용자가 게시글 작성자인지 확인
  const isAuthor = user && post && user.email === post.author?.email;

  const handleLike = () => {
    // 실제로는 API 호출로 대체
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setSnackbar({
      open: true,
      message: isLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.',
      severity: 'success'
    });
  };

  const handleShare = () => {
    // 실제로는 공유 기능 구현
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      open: true,
      message: '링크가 클립보드에 복사되었습니다.',
      severity: 'success'
    });
  };

  const handleCommentMenuOpen = (event, comment) => {
    setCommentMenuAnchor(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCommentMenuClose = () => {
    setCommentMenuAnchor(null);
    setSelectedComment(null);
  };

  const handleEditClick = () => {
    setEditComment(selectedComment.content);
    setEditDialogOpen(true);
    handleCommentMenuClose();
  };

  const handleDeleteClick = async () => {
    try {
      console.log('🗑️ 댓글 삭제 시작:', selectedComment.id);
      await deleteComment(selectedComment.id);
      
      // 상태에서 댓글 제거
      setComments(comments.filter(c => c.id !== selectedComment.id));
      handleCommentMenuClose();
      setSnackbar({
        open: true,
        message: '댓글이 삭제되었습니다.',
        severity: 'success'
      });
      console.log('✅ 댓글 삭제 완료');
    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
      setSnackbar({
        open: true,
        message: error.response?.status === 403 ? '댓글 삭제 권한이 없습니다.' : '댓글 삭제에 실패했습니다.',
        severity: 'error'
      });
      handleCommentMenuClose();
    }
  };

  const handleEditSubmit = async () => {
    try {
      console.log('✏️ 댓글 수정 시작:', selectedComment.id);
      const updatedComment = await updateComment(selectedComment.id, { content: editComment });
      
      // 상태에서 댓글 업데이트
      setComments(comments.map(c => 
        c.id === selectedComment.id 
          ? { ...c, content: editComment, updatedAt: updatedComment.updatedAt }
          : c
      ));
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: '댓글이 수정되었습니다.',
        severity: 'success'
      });
      console.log('✅ 댓글 수정 완료');
    } catch (error) {
      console.error('❌ 댓글 수정 실패:', error);
      setSnackbar({
        open: true,
        message: error.response?.status === 403 ? '댓글 수정 권한이 없습니다.' : '댓글 수정에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setSnackbar({
        open: true,
        message: '댓글 내용을 입력해주세요.',
        severity: 'warning'
      });
      return;
    }

    try {
      console.log('📝 댓글 작성 시작');
      const newComment = await createComment({
        content: comment.trim(),
        postId: parseInt(id)
      });
      
      // 새 댓글을 상태에 추가
      setComments([...comments, newComment]);
      setComment('');
      setSnackbar({
        open: true,
        message: '댓글이 작성되었습니다.',
        severity: 'success'
      });
      console.log('✅ 댓글 작성 완료');
    } catch (error) {
      console.error('❌ 댓글 작성 실패:', error);
      setSnackbar({
        open: true,
        message: error.response?.status === 401 ? '로그인이 필요합니다.' : '댓글 작성에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>로딩 중...</Typography>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>포스트를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/blog')}
        sx={{ mb: { xs: 2, md: 3 } }}
        size={isMobile ? "small" : "medium"}
      >
        목록으로 돌아가기
      </Button>

      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, md: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom
            sx={{ 
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
          >
            {post.title}
          </Typography>
          
          {/* 작성자만 수정/삭제 버튼 표시 */}
          {isAuthor && (
            <Stack 
              direction="row" 
              spacing={1}
              sx={{ 
                flexShrink: 0,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <Button
                startIcon={<EditIcon />}
                onClick={handleEditPost}
                variant="outlined"
                color="primary"
                size={isMobile ? "small" : "medium"}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                수정
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                variant="outlined"
                color="error"
                size={isMobile ? "small" : "medium"}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                삭제
              </Button>
            </Stack>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={post.author?.avatar || '/default-avatar.png'} 
              sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40 
              }} 
            />
            <Box>
              <Typography variant={isMobile ? "body2" : "subtitle1"}>
                {post.author?.username || post.author?.email || '익명'}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {post.image && (
          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <img
              src={post.image}
              alt={post.title}
              style={{ 
                width: '100%', 
                maxHeight: isMobile ? '250px' : '400px', 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: { xs: 2, md: 3 }, flexWrap: 'wrap' }}>
          {post.tags && post.tags.map((tag) => (
            <Chip key={tag} label={tag} size={isMobile ? "small" : "medium"} />
          ))}
        </Box>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 1, sm: 3 }} 
          sx={{ mb: { xs: 2, md: 3 } }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          {post.readTime && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {post.readTime}
            </Typography>
          )}
          <Button
            startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLike}
            color={isLiked ? 'secondary' : 'primary'}
            size={isMobile ? "small" : "medium"}
          >
            {likeCount}
          </Button>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {comments.length}
          </Typography>
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShare}
            size={isMobile ? "small" : "medium"}
          >
            공유하기
          </Button>
        </Stack>

        <Box sx={{ 
          '& h1, & h2, & h3': { 
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } 
          },
          '& p': { 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            lineHeight: { xs: 1.5, sm: 1.6 }
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px'
          },
          '& pre': {
            overflow: 'auto',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }
        }}>
          <MarkdownRenderer content={post.content} sx={{ mt: 3 }} />
        </Box>
      </Paper>

      {/* 댓글 섹션 */}
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant={isMobile ? "h6" : "h6"} gutterBottom>
          댓글 ({comments.length})
        </Typography>

        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: { xs: 3, md: 4 } }}>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 2 : 3}
            placeholder="댓글을 작성하세요..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
            size={isMobile ? "small" : "medium"}
          />
          <Button 
            type="submit" 
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            댓글 작성
          </Button>
        </Box>

        <List sx={{ p: 0 }}>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ px: { xs: 0, sm: 2 } }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={comment.author?.avatar || '/default-avatar.png'}
                    sx={{ 
                      width: isMobile ? 32 : 40, 
                      height: isMobile ? 32 : 40 
                    }}
                  >
                    {comment.author?.username?.charAt(0) || comment.author?.email?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography component="span" variant={isMobile ? "body2" : "subtitle2"}>
                          {comment.author?.username || comment.author?.email || '익명'}
                        </Typography>
                        {user && comment.author?.email === user.email && (
                          <Chip
                            label="작성자"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          component="span" 
                          variant={isMobile ? "caption" : "body2"} 
                          color="text.secondary" 
                          sx={{ mr: 1 }}
                        >
                          {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                        </Typography>
                        {user && comment.author?.email === user.email && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleCommentMenuOpen(e, comment)}
                          >
                            <MoreVertIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant={isMobile ? "body2" : "body1"}
                      sx={{ mt: 1, wordBreak: 'break-word' }}
                    >
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
              {index < comments.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* 댓글 메뉴 */}
      <Menu
        anchorEl={commentMenuAnchor}
        open={Boolean(commentMenuAnchor)}
        onClose={handleCommentMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} /> 수정
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} /> 삭제
        </MenuItem>
      </Menu>

      {/* 댓글 수정 다이얼로그 */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { m: { xs: 1, sm: 3 } }
        }}
      >
        <DialogTitle>댓글 수정</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 2 : 3}
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            sx={{ mt: 2 }}
            size={isMobile ? "small" : "medium"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 게시글 삭제 확인 다이얼로그 */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { m: { xs: 1, sm: 3 } }
        }}
      >
        <DialogTitle>게시글 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeletePost} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 알림 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
