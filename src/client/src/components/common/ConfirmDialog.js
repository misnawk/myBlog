import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  confirmColor = "primary"
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { m: { xs: 1, sm: 3 } }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
