import React from "react";
import {
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function BlogFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  sortOptions,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="포스트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size={isMobile ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={selectedCategory}
              label="카테고리"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>정렬</InputLabel>
            <Select
              value={sortBy}
              label="정렬"
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}
