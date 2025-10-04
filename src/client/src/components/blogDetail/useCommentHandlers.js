import { useState } from "react";
import { createComment, updateComment, deleteComment } from "../../api/commentApi";

export function useCommentHandlers(id, comments, setComments, user, setSnackbar) {
  const [comment, setComment] = useState('');
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editComment, setEditComment] = useState('');

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

    if (!user) {
      setSnackbar({
        open: true,
        message: '댓글을 작성하려면 로그인이 필요합니다.',
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

  return {
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
  };
}
