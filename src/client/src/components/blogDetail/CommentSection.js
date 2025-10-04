import React from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  List,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommentItem from "./CommentItem";

export default function CommentSection({
  comments,
  comment,
  setComment,
  onCommentSubmit,
  onCommentMenuOpen,
  user
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant={isMobile ? "h6" : "h6"} gutterBottom>
        댓글 ({comments.length})
      </Typography>

      {user ? (
        <Box component="form" onSubmit={onCommentSubmit} sx={{ mb: { xs: 3, md: 4 } }}>
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
      ) : (
        <Box sx={{
          mb: { xs: 3, md: 4 },
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            댓글을 작성하려면 로그인이 필요합니다.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/login')}
          >
            로그인하기
          </Button>
        </Box>
      )}

      <List sx={{ p: 0 }}>
        {comments.map((comment, index) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            user={user}
            isLast={index === comments.length - 1}
            onMenuOpen={onCommentMenuOpen}
          />
        ))}
      </List>
    </Paper>
  );
}
