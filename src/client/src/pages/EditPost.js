import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
  Box
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { updatePost } from "../api/postApi";
import PostFormFields from "../components/post/PostFormFields";
import PostEditor from "../components/post/PostEditor";
import PostFormActions from "../components/post/PostFormActions";
import { useEditPostForm } from "../components/post/useEditPostForm";
import { useImageUpload } from "../components/post/useImageUpload";
import { useEditorHandlers } from "../components/post/useEditorHandlers";

export default function EditPost() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    id,
    title,
    setTitle,
    category,
    setCategory,
    content,
    setContent,
    pageLoading,
    isLoading,
    setIsLoading,
    snackbar,
    setSnackbar,
    quillRef,
    timerRef,
    validate,
    handleCancel
  } = useEditPostForm(user);

  const {
    imageHandler,
    replaceDataUrisInEditor
  } = useImageUpload(quillRef);

  // 에디터 이벤트 핸들러 설정
  useEditorHandlers(quillRef, replaceDataUrisInEditor);

  // 저장
  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // 1) 에디터 내 data: 이미지 → URL 치환
      await replaceDataUrisInEditor();

      // 2) 최종 HTML
      const quill = quillRef.current && quillRef.current.getEditor();
      let html = quill ? quill.root.innerHTML : content;

      console.log('처리 전 HTML:', JSON.stringify(html));
      console.log('처리 전 HTML (가독성):', html);

      const originalHtml = html;

      // 줄바꿈을 보존하면서 진짜 빈 태그만 제거
      html = html.replace(/<p>(\s|&nbsp;)*<\/p>/g, '');
      html = html.replace(/(<p><br\s*\/?><\/p>){3,}/g, '<p><br></p><p><br></p>');
      html = html.replace(/<p><br\s*\/?><\/p>$/, '');

      console.log('처리 후 HTML:', JSON.stringify(html));
      console.log('처리 후 HTML (가독성):', html);
      console.log('변경 여부:', originalHtml !== html ? '변경됨' : '변경 안됨');

      // 3) data:가 남아 있으면 저장 중단
      if (html.includes('src="data:')) {
        setIsLoading(false);
        alert("이미지 업로드 처리 중입니다. 잠시 후 다시 저장해주세요.");
        return;
      }

      await updatePost(id, { title: title.trim(), content: html, category });
      setSnackbar({
        open: true,
        message: "게시글이 성공적으로 수정되었습니다!",
        severity: "success",
      });
      timerRef.current = setTimeout(() => navigate(`/blogDetail/${id}`), 800);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.status === 403
        ? "게시글 수정 권한이 없습니다."
        : "게시글 수정에 실패했습니다.";

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/blogDetail/${id}`)}
        >
          돌아가기
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
          게시글 수정
        </Typography>

        <Stack spacing={3}>
          <PostFormFields
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
          />

          <PostEditor
            value={content}
            onChange={setContent}
            quillRef={quillRef}
            imageHandler={imageHandler}
          />

          <PostFormActions
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
            saveButtonText="수정"
          />
        </Stack>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
