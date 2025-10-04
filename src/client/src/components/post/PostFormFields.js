import React, { useState, useEffect } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress
} from "@mui/material";
import axios from "../../api/config";

export default function PostFormFields({
  title,
  setTitle,
  category,
  setCategory
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get('/api/category/admin');
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error("카테고리 로드 실패:", error);
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <Stack spacing={3}>
      <TextField
        label="제목"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        inputProps={{ maxLength: 30 }}
        helperText={`${title.length}/30`}
      />

      <FormControl fullWidth>
        <InputLabel>카테고리</InputLabel>
        <Select
          label="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
        >
          <MenuItem value="">
            <em>카테고리를 선택하세요</em>
          </MenuItem>
          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              로딩 중...
            </MenuItem>
          ) : (
            categories.map((c) => (
              <MenuItem key={c.id} value={c.name}>
                {c.name} ({c.postCount || 0})
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Stack>
  );
}
