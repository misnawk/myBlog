import React from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";

function CategoryStats({ totalCount }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12}>
        <Card sx={{ boxShadow: 2, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  총 카테고리 수
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {totalCount}
                </Typography>
              </Box>
              <CategoryIcon sx={{ fontSize: 60, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default CategoryStats;
