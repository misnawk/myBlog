import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

function CategoryHeader({ onAddClick }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          카테고리 관리
        </Typography>
        <Typography variant="body2" color="text.secondary">
          블로그 카테고리를 추가, 수정, 삭제할 수 있습니다.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
      >
        카테고리 추가
      </Button>
    </Box>
  );
}

export default CategoryHeader;
