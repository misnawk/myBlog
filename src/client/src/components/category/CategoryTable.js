import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: 2 }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '20%' }}>
                카테고리명
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '50%' }}>
                설명
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '15%' }}>
                게시글 수
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '15%' }}>
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    등록된 카테고리가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: 'primary.main' }}
                    >
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {category.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={category.postCount || 0}
                      color={category.postCount > 0 ? "primary" : "default"}
                      size="small"
                      sx={{ fontWeight: 'bold', minWidth: 50 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(category)}
                      sx={{
                        mr: 1,
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'primary.light', color: 'white' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(category)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.light', color: 'white' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default CategoryTable;
