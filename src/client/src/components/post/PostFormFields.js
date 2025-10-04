import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from "@mui/material";
import { CATEGORIES } from "../categories";

export default function PostFormFields({
  title,
  setTitle,
  category,
  setCategory
}) {
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
        >
          <MenuItem value="">
            <em>카테고리를 선택하세요</em>
          </MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c.id} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
