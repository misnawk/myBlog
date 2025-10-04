import React from "react";
import { Typography, Box, Alert, CircularProgress } from "@mui/material";
import CategoryHeader from "./category/CategoryHeader";
import CategoryStats from "./category/CategoryStats";
import CategoryTable from "./category/CategoryTable";
import CategoryDialog from "./category/CategoryDialog";
import { useCategoryManagement } from "./category/useCategoryManagement";

function CategoryManagement() {
  const {
    categories,
    loading,
    openDialog,
    editingCategory,
    formData,
    alert,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleSave,
    handleDelete,
    handleSaveToFile,
  } = useCategoryManagement();

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          카테고리 데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 알림 */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <CategoryHeader
        onAddClick={() => handleOpenDialog()}
      />

      <CategoryStats
        totalCount={categories.length}
      />

      <CategoryTable
        categories={categories}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
      />

      <CategoryDialog
        open={openDialog}
        editingCategory={editingCategory}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onInputChange={handleInputChange}
      />
    </Box>
  );
}

export default CategoryManagement;
