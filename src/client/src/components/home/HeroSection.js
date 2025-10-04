import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <Box sx={{ mb: 6, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        개발 블로그
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        배운것을 기록하기 위한 기술 블로그
      </Typography>
      <Button
        component={Link}
        to="/blog"
        variant="contained"
        size="large"
        sx={{ mt: 2 }}
      >
        포스트 보기
      </Button>
    </Box>
  );
}
