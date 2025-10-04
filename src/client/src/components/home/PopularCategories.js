import React from "react";
import { Grid, Button, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";


export default function PopularCategories({ categories }) {
  return (
    <Paper sx={{ p: 3, mb: 6 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        인기 카테고리
      </Typography>
      {categories.length > 0 ? (
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={6} sm={3} key={category.name}>
              <Button
                component={Link}
                to={`/blog?category=${encodeURIComponent(category.name)}`}
                variant="outlined"
                fullWidth
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  py: 2
                }}
              >
                <Typography variant="h6" component="span">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.count}개의 포스트
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          카테고리가 없습니다.
        </Typography>
      )}
    </Paper>
  );
}
