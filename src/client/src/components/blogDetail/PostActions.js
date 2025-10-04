import React from "react";
import { Stack, Typography, Button, useTheme, useMediaQuery } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";

export default function PostActions({
  readTime,
  isLiked,
  likeCount,
  commentCount,
  user,
  onLike,
  onShare
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 3 }}
      sx={{ mb: { xs: 2, md: 3 } }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
    >
      {readTime && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {readTime}
        </Typography>
      )}
      <Button
        startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        onClick={onLike}
        color={isLiked ? 'secondary' : 'primary'}
        size={isMobile ? "small" : "medium"}
        disabled={!user}
        title={!user ? '좋아요를 누르려면 로그인이 필요합니다' : ''}
      >
        {likeCount}
      </Button>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
        {commentCount}
      </Typography>
      <Button
        startIcon={<ShareIcon />}
        onClick={onShare}
        size={isMobile ? "small" : "medium"}
      >
        공유하기
      </Button>
    </Stack>
  );
}
