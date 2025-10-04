import React from "react";
import { Box, Button } from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";

export default function PostFormActions({
  onSave,
  onCancel,
  isLoading,
  saveButtonText = "저장"
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
      <Button
        variant="contained"
        size="large"
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? "저장 중..." : saveButtonText}
      </Button>
      <Button
        variant="outlined"
        size="large"
        color="secondary"
        startIcon={<CancelIcon />}
        onClick={onCancel}
      >
        취소
      </Button>
    </Box>
  );
}
