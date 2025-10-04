import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

function CategoryStats({ totalCount, activeCount }) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              총 카테고리 수
            </Typography>
            <Typography variant="h4">{totalCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              활성 카테고리
            </Typography>
            <Typography variant="h4">{activeCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default CategoryStats;
