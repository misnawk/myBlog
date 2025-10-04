import React from "react";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function CommentItem({ comment, user, isLast, onMenuOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
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
                    onClick={(e) => onMenuOpen(e, comment)}
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
      {!isLast && <Divider variant="inset" component="li" />}
    </>
  );
}
