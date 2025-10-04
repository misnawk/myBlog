import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { Add as AddIcon, Save as SaveIcon } from "@mui/icons-material";

function CategoryHeader({ onAddClick, onSaveClick }) {
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
      <Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          sx={{ mr: 2 }}
        >
          카테고리 추가
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={onSaveClick}
        >
          설정 저장
        </Button>
      </Box>
    </Box>
  );
}

export default CategoryHeader;
