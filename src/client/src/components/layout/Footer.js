import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* 블로그 정보 */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              My Blog
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              개발하면서 배운것들을하는 블로그입니다..
            </Typography>
            <Box>
              <IconButton color="inherit" component="a" href="https://github.com" target="_blank">
                <GitHubIcon />
              </IconButton>
              <IconButton color="inherit" component="a" href="https://twitter.com" target="_blank">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" component="a" href="https://linkedin.com" target="_blank">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer; 