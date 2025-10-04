import React from "react";
import { Container, Typography } from "@mui/material";

export default function ErrorState({ message }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
      <Typography variant="h6" color="error">{message}</Typography>
    </Container>
  );
}
