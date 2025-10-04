import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePost } from "../../api/postApi";
import { toast } from "react-toastify";

export function usePostHandlers(id, user, setSnackbar, isLiked, setIsLiked, likeCount, setLikeCount) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditPost = () => {
    navigate(`/edit/${id}`);
  };

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

  const handleLike = () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: '좋아요를 누르려면 로그인이 필요합니다.',
        severity: 'warning'
      });
      return;
    }

    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setSnackbar({
      open: true,
      message: isLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.',
      severity: 'success'
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      open: true,
      message: '링크가 클립보드에 복사되었습니다.',
      severity: 'success'
    });
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleEditPost,
    handleDeletePost,
    handleLike,
    handleShare
  };
}
