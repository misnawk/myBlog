import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkdownRenderer from '../components/MarkdownRenderer';
import PostHeader from '../components/blogDetail/PostHeader';
import PostMeta from '../components/blogDetail/PostMeta';
import PostActions from '../components/blogDetail/PostActions';
import CommentSection from '../components/blogDetail/CommentSection';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { useBlogDetail } from '../components/blogDetail/useBlogDetail';
import { usePostHandlers } from '../components/blogDetail/usePostHandlers';
import { useCommentHandlers } from '../components/blogDetail/useCommentHandlers';
import { useAuth } from '../contexts/AuthContext';

export default function BlogDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Custom hooks
  const {
    post,
    comments,
    setComments,
    isLiked,
    setIsLiked,
    likeCount,
    setLikeCount,
    loading,
    error
  } = useBlogDetail(id);

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleEditPost,
    handleDeletePost,
    handleLike,
    handleShare
  } = usePostHandlers(id, user, setSnackbar, isLiked, setIsLiked, likeCount, setLikeCount);

  const {
    comment,
    setComment,
    commentMenuAnchor,
    handleCommentMenuOpen,
    handleCommentMenuClose,
    handleEditClick,
    handleDeleteClick,
    handleCommentSubmit,
    editDialogOpen,
    setEditDialogOpen,
    editComment,
    setEditComment,
    handleEditSubmit
  } = useCommentHandlers(id, comments, setComments, user, setSnackbar);

  // 현재 사용자가 게시글 작성자인지 확인
  const isAuthor = user && post && user.email === post.author?.email;

  if (loading) return <LoadingState message="로딩 중..." />;
  if (error) return <ErrorState message={error} />;
  if (!post) return <ErrorState message="포스트를 찾을 수 없습니다." />;

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
        <PostHeader
          title={post.title}
          isAuthor={isAuthor}
          onEdit={handleEditPost}
          onDelete={() => setDeleteDialogOpen(true)}
        />

        <PostMeta author={post.author} createdAt={post.createdAt} />

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

        {post.tags && (
          <Box sx={{ display: 'flex', gap: 1, mb: { xs: 2, md: 3 }, flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} size={isMobile ? "small" : "medium"} />
            ))}
          </Box>
        )}

        <PostActions
          readTime={post.readTime}
          isLiked={isLiked}
          likeCount={likeCount}
          commentCount={comments.length}
          user={user}
          onLike={handleLike}
          onShare={handleShare}
        />

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

      <CommentSection
        comments={comments}
        comment={comment}
        setComment={setComment}
        onCommentSubmit={handleCommentSubmit}
        onCommentMenuOpen={handleCommentMenuOpen}
        user={user}
      />

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
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeletePost}
        title="게시글 삭제"
        message="정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        confirmColor="error"
      />

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
