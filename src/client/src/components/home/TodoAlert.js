import React from "react";
import { Box, Alert, AlertTitle, Typography, IconButton, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { AssignmentTurnedIn, Close } from "@mui/icons-material";

export default function TodoAlert({ todoAlert, onClose }) {
  if (!todoAlert) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Alert
        severity="warning"
        icon={<AssignmentTurnedIn />}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
        sx={{
          backgroundColor: '#fff3cd',
          borderLeft: '4px solid #ffc107',
          '& .MuiAlert-icon': {
            color: '#856404'
          }
        }}
      >
        <AlertTitle sx={{ color: '#856404', fontWeight: 'bold' }}>
          📝 할일이 {todoAlert.count}개 있습니다!
        </AlertTitle>
        <Typography sx={{ color: '#856404' }}>
          가장 최근 할일: "{todoAlert.latestPost?.title}" -
          <Button
            component={Link}
            to="/blog?category=할일"
            size="small"
            sx={{ ml: 1, color: '#856404', textDecoration: 'underline' }}
          >
            확인하기
          </Button>
        </Typography>
      </Alert>
    </Box>
  );
}
