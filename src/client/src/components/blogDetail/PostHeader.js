import React from "react";
import { Box, Typography, Button, Stack, useTheme, useMediaQuery } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PostHeader({ title, isAuthor, onEdit, onDelete }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      mb: { xs: 2, md: 3 },
      flexDirection: { xs: 'column', sm: 'row' },
      gap: { xs: 2, sm: 0 }
    }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="h1"
        gutterBottom
        sx={{
          lineHeight: 1.2,
          wordBreak: 'break-word'
        }}
      >
        {title}
      </Typography>

      {isAuthor && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Button
            startIcon={<EditIcon />}
            onClick={onEdit}
            variant="outlined"
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            수정
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            variant="outlined"
            color="error"
            size={isMobile ? "small" : "medium"}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            삭제
          </Button>
        </Stack>
      )}
    </Box>
  );
}
