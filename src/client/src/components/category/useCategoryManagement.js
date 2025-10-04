import { useState, useEffect } from "react";
import axios from "../../api/config";

export function useCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {

    try{
      const response = await axios.get('/api/category/admin');
      console.log("카테고리 로드 성공", response.data);
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("카테고리 로드 실패", error);
    }

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
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showAlert("카테고리 이름을 입력해주세요.", "error");
      return;
    }

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
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    try {
      if (editingCategory) {
        // 수정
        await axios.put('/api/category/update', {
          id: editingCategory.id,
          ...categoryData
        });
        showAlert("카테고리가 수정되었습니다.", "success");
      } else {
        // 생성
        await axios.post('/api/category/create', categoryData);
        showAlert("카테고리가 추가되었습니다.", "success");
      }

      // 목록 새로고침
      await loadCategories();
      handleCloseDialog();
    } catch (error) {
      console.error("카테고리 저장 실패:", error);
      showAlert("카테고리 저장에 실패했습니다.", "error");
    }
  };

  const handleDelete = async (category) => {
    if (window.confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
      try {
        await axios.delete('/api/category/delete', {
          data: { id: category.id }
        });
        showAlert("카테고리가 삭제되었습니다.", "success");

        // 목록 새로고침
        await loadCategories();
      } catch (error) {
        console.error("카테고리 삭제 실패:", error);
        showAlert("카테고리 삭제에 실패했습니다.", "error");
      }
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => {
      setAlert({ show: false, message: "", severity: "success" });
    }, 3000);
  };

  const handleSaveToFile = () => {
    console.log("저장될 카테고리 데이터:", categories);
    showAlert("카테고리 설정이 저장되었습니다.", "success");
  };

  return {
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
  };
}
