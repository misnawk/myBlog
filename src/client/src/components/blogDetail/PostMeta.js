import React from "react";
import { Box, Typography, Avatar, useTheme, useMediaQuery } from "@mui/material";

export default function PostMeta({ author, createdAt }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
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
          src={author?.avatar || '/default-avatar.png'}
          sx={{
            width: isMobile ? 32 : 40,
            height: isMobile ? 32 : 40
          }}
        />
        <Box>
          <Typography variant={isMobile ? "body2" : "subtitle1"}>
            {author?.username || author?.email || '익명'}
          </Typography>
          <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
            {new Date(createdAt).toLocaleDateString('ko-KR')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
