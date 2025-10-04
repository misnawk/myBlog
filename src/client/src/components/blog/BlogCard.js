import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { createPreview } from "../../utils/htmlUtils";

export default function BlogCard({ post, onPostClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      {post.image && (
        <CardMedia
          component="img"
          height={isMobile ? "160" : "200"}
          image={post.image}
          alt={post.title}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 0 }
          }}
        >
          <Chip
            label={post.category || '기타'}
            size={isMobile ? "small" : "medium"}
          />
          <Typography
            variant={isMobile ? "caption" : "body2"}
            color="text.secondary"
          >
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="h2"
          gutterBottom
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.2,
          }}
        >
          {post.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, sm: 3 },
            WebkitBoxOrient: "vertical",
          }}
        >
          {createPreview(post.content, isMobile ? 80 : 150)}
        </Typography>

        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", sm: "auto" }
          }}>
            <Avatar
              sx={{
                width: isMobile ? 24 : 32,
                height: isMobile ? 24 : 32,
                fontSize: isMobile ? "0.75rem" : "1rem"
              }}
            >
              {post.author?.username?.[0] || post.author?.email?.[0] || "?"}
            </Avatar>
            <Typography
              variant={isMobile ? "caption" : "body2"}
              color="text.secondary"
            >
              {post.author?.username || post.author?.email || "익명"}
            </Typography>
          </Box>
          <Button
            onClick={() => onPostClick(post.id)}
            variant="contained"
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            자세히 보기
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
