import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip
} from "@mui/material";
import { Link } from "react-router-dom";
import { createPreview } from "../../utils/htmlUtils";

export default function RecentPosts({ posts }) {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        최근 포스트
      </Typography>
      {posts.length > 0 ? (
        <Grid container spacing={4}>
          {posts.map((post) => (
            <Grid item xs={12} md={4} key={post.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                {post.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip
                    label={post.category || '기타'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h5" component="h3" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {createPreview(post.content, 100)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      작성자: {post.author?.email || '익명'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to={`/blogDetail/${post.id}`}
                    variant="outlined"
                    fullWidth
                  >
                    자세히 보기
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          아직 작성된 포스트가 없습니다.
        </Typography>
      )}
    </Box>
  );
}
