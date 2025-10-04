import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";

function CategoryDialog({
  open,
  editingCategory,
  formData,
  onClose,
  onSave,
  onInputChange,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingCategory ? "카테고리 수정" : "카테고리 추가"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            label="카테고리 이름"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            sx={{ mb: 3 }}
            placeholder="예: 프론트엔드"
          />

          <TextField
            label="설명"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder="예: React, Vue, JavaScript 등"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          취소
        </Button>
        <Button onClick={onSave} variant="contained" startIcon={<SaveIcon />}>
          {editingCategory ? "수정" : "추가"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryDialog;
