import React from "react";
import { Container, Typography } from "@mui/material";

export default function LoadingState({ message = "불러오는 중..." }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
      <Typography variant="h6">{message}</Typography>
    </Container>
  );
}
