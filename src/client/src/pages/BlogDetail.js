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
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    console.log(' BlogDetail 페이지 로딩 시작, ID:', id);
    const fetchPost = async () => {
      try {
        setLoading(true);
        console.log(' BlogDetail 로딩 상태 설정');
        
        // 개별 포스트 조회
        const postData = await getPost(id);
        setPost(postData);
        setLikeCount(postData.likes || 0);
        console.log(' BlogDetail 포스트 데이터 설정 완료:', postData?.title);
        
        // 관련 포스트 기능은 현재 사용하지 않음

        // 임시 댓글 데이터 (실제로는 댓글 API에서 가져와야 함)
     
      } catch (error) {
        console.error(' BlogDetail 포스트 조회 실패:', error);
        setSnackbar({
          open: true,
          message: '포스트를 불러오는데 실패했습니다.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
        console.log(' BlogDetail 로딩 완료');
      }
    };

    fetchPost();
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

  const handleDeleteClick = () => {
    // 실제로는 API 호출로 대체
    setComments(comments.filter(c => c.id !== selectedComment.id));
    handleCommentMenuClose();
    setSnackbar({
      open: true,
      message: '댓글이 삭제되었습니다.',
      severity: 'success'
    });
  };

  const handleEditSubmit = () => {
    // 실제로는 API 호출로 대체
    setComments(comments.map(c => 
      c.id === selectedComment.id 
        ? { ...c, content: editComment }
        : c
    ));
    setEditDialogOpen(false);
    setSnackbar({
      open: true,
      message: '댓글이 수정되었습니다.',
      severity: 'success'
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: "현재 사용자",
        avatar: "https://source.unsplash.com/random/100x100?portrait3",
        content: comment,
        date: new Date().toLocaleString(),
        isAuthor: true,
      };
      setComments([...comments, newComment]);
      setComment('');
      setSnackbar({
        open: true,
        message: '댓글이 작성되었습니다.',
        severity: 'success'
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/blog')}
        sx={{ mb: 3 }}
      >
        목록으로 돌아가기
      </Button>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          
          {/* 작성자만 수정/삭제 버튼 표시 */}
          {isAuthor && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<EditIcon />}
                onClick={handleEditPost}
                variant="outlined"
                color="primary"
              >
                수정
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                variant="outlined"
                color="error"
              >
                삭제
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar src={post.author?.avatar || '/default-avatar.png'} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle1">{post.author?.username || post.author?.email || '익명'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </Typography>
          </Box>
        </Box>

        {post.image && (
          <Box sx={{ mb: 3 }}>
            <img
              src={post.image}
              alt={post.title}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {post.tags && post.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'center' }}>
          {post.readTime && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {post.readTime}
            </Typography>
          )}
          <Button
            startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLike}
            color={isLiked ? 'secondary' : 'primary'}
          >
            {likeCount}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {comments.length}
          </Typography>
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            공유하기
          </Button>
        </Box>

        <MarkdownRenderer content={post.content} sx={{ mt: 3 }} />
      </Paper>

      {/* 댓글 섹션 */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          댓글 ({comments.length})
        </Typography>

        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="댓글을 작성하세요..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            댓글 작성
          </Button>
        </Box>

        <List>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={comment.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography component="span" variant="subtitle2">
                          {comment.author}
                        </Typography>
                        {comment.isAuthor && (
                          <Chip
                            label="작성자"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          {comment.date}
                        </Typography>
                        {comment.isAuthor && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleCommentMenuOpen(e, comment)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={comment.content}
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
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>댓글 수정</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            sx={{ mt: 2 }}
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
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
