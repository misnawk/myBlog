import React from "react";
import { Box, Pagination, useTheme, useMediaQuery } from "@mui/material";

export default function BlogPagination({ totalPages, currentPage, onPageChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        color="primary"
        size={isMobile ? "medium" : "large"}
      />
    </Box>
  );
}
