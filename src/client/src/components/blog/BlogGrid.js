import React from "react";
import { Grid, useTheme, useMediaQuery } from "@mui/material";
import BlogCard from "./BlogCard";

export default function BlogGrid({ posts, onPostClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container spacing={isMobile ? 2 : 4}>
      {posts.map((post) => (
        <Grid item xs={12} md={6} key={post.id}>
          <BlogCard post={post} onPostClick={onPostClick} />
        </Grid>
      ))}
    </Grid>
  );
}
