import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { CATEGORIES } from "../components/categories";

// 기본 색상 팔레트
const COLOR_PALETTE = [
  "#61DAFB",
  "#68D391",
  "#9F7AEA",
  "#F56565",
  "#4299E1",
  "#ED8936",
  "#38B2AC",
  "#48BB78",
  "#3DDC84",
  "#805AD5",
  "#2D3748",
  "#D69E2E",
  "#DD6B20",
  "#319795",
  "#E53E3E",
];

function CategoryAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    color: "#61DAFB",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setLoading(true);
    // 임시로 하드코딩된 카테고리 데이터 사용
    // 추후 API 호출로 교체 예정
    setTimeout(() => {
      setCategories([...CATEGORIES]);
      setLoading(false);
    }, 500);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ ...category });
    } else {
      setEditingCategory(null);
      setFormData({
        id: "",
        name: "",
        description: "",
        color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      id: "",
      name: "",
      description: "",
      color: "#61DAFB",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // 입력 검증
    if (!formData.name.trim()) {
      showAlert("카테고리 이름을 입력해주세요.", "error");
      return;
    }

    // 중복 검사 (편집 시 자기 자신 제외)
    const isDuplicate = categories.some(
      (cat) =>
        cat.name === formData.name.trim() &&
        (!editingCategory || cat.id !== editingCategory.id)
    );

    if (isDuplicate) {
      showAlert("이미 존재하는 카테고리 이름입니다.", "error");
      return;
    }

    const categoryData = {
      ...formData,
      id: formData.id || formData.name.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    if (editingCategory) {
      // 수정
      setCategories((prev) =>
        prev.map((cat) => (cat.id === editingCategory.id ? categoryData : cat))
      );
      showAlert("카테고리가 수정되었습니다.", "success");
    } else {
      // 추가
      setCategories((prev) => [...prev, categoryData]);
      showAlert("카테고리가 추가되었습니다.", "success");
    }

    handleCloseDialog();
  };

  const handleDelete = (category) => {
    if (window.confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
      setCategories((prev) => prev.filter((cat) => cat.id !== category.id));
      showAlert("카테고리가 삭제되었습니다.", "success");
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => {
      setAlert({ show: false, message: "", severity: "success" });
    }, 3000);
  };

  const handleSaveToFile = () => {
    // 실제로는 서버 API 호출로 저장
    // 여기서는 임시로 로컬 스토리지에 저장하거나 콘솔에 출력
    console.log("저장될 카테고리 데이터:", categories);
    showAlert("카테고리 설정이 저장되었습니다.", "success");
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          카테고리 데이터를 불러오는 중...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 알림 */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            카테고리 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            블로그 카테고리를 추가, 수정, 삭제할 수 있습니다.
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 2 }}
          >
            카테고리 추가
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveToFile}
          >
            설정 저장
          </Button>
        </Box>
      </Box>

      {/* 통계 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 카테고리 수
              </Typography>
              <Typography variant="h4">{categories.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                활성 카테고리
              </Typography>
              <Typography variant="h4">{categories.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                색상 팔레트
              </Typography>
              <Typography variant="h4">{COLOR_PALETTE.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 카테고리 테이블 */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>설명</TableCell>
                <TableCell>색상</TableCell>
                <TableCell>미리보기</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium" }}
                    >
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: category.color,
                          borderRadius: "50%",
                          mr: 1,
                          border: "1px solid #ddd",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {category.color}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.name}
                      sx={{
                        backgroundColor: category.color,
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(category)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 카테고리 추가/수정 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "카테고리 수정" : "카테고리 추가"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              label="카테고리 이름"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              sx={{ mb: 3 }}
              placeholder="예: 프론트엔드"
            />

            <TextField
              label="설명"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              sx={{ mb: 3 }}
              placeholder="예: React, Vue, JavaScript 등"
            />

            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              색상 선택
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {COLOR_PALETTE.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      formData.color === color
                        ? "3px solid #000"
                        : "2px solid #ddd",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                  onClick={() => handleInputChange("color", color)}
                />
              ))}
            </Box>

            <TextField
              label="사용자 정의 색상"
              fullWidth
              variant="outlined"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
              placeholder="#61DAFB"
            />

            {/* 미리보기 */}
            <Box
              sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                미리보기
              </Typography>
              <Chip
                label={formData.name || "카테고리 이름"}
                sx={{
                  backgroundColor: formData.color,
                  color: "#fff",
                  fontWeight: "bold",
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {editingCategory ? "수정" : "추가"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CategoryAdmin;
