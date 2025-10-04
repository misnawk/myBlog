import React from "react";
import { Fab, useTheme, useMediaQuery } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";

export default function CreatePostFab({ onClick, show }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!show) return null;

  return (
    <Fab
      color="primary"
      onClick={onClick}
      size={isMobile ? "medium" : "large"}
      sx={{
        position: 'fixed',
        bottom: { xs: 16, sm: 32 },
        right: { xs: 16, sm: 32 },
        boxShadow: 3,
        '&:hover': {
          transform: 'scale(1.1)',
          boxShadow: 6
        },
        transition: 'all 0.3s ease'
      }}
    >
      <CreateIcon />
    </Fab>
  );
}
