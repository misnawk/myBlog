import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

export default function BlogHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
        블로그 포스트
      </Typography>
      <Typography variant="body1" color="text.secondary">
        개발 관련 다양한 주제의 포스트를 확인하세요
      </Typography>
    </Box>
  );
}
