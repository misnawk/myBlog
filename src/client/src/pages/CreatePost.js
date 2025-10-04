import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Paper, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import createPost from "../api/postApi";
import PostFormFields from "../components/post/PostFormFields";
import PostEditor from "../components/post/PostEditor";
import PostFormActions from "../components/post/PostFormActions";
import { usePostForm } from "../components/post/usePostForm";
import { useImageUpload } from "../components/post/useImageUpload";
import { useEditorHandlers } from "../components/post/useEditorHandlers";

export default function CreatePost() {
  const navigate = useNavigate();
  const { isTokenValid } = useAuth();

  const {
    title,
    setTitle,
    category,
    setCategory,
    content,
    setContent,
    isLoading,
    setIsLoading,
    snackbar,
    setSnackbar,
    quillRef,
    timerRef,
    validate,
    handleCancel
  } = usePostForm(isTokenValid);

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

      // 디버깅: 처리 전 HTML 확인
      console.log('🔍 처리 전 HTML:', JSON.stringify(html));
      console.log('🔍 처리 전 HTML (가독성):', html);

      const originalHtml = html;

      // 줄바꿈을 보존하면서 진짜 빈 태그만 제거
      // 1. 완전히 빈 p 태그만 제거 (공백이나 &nbsp;만 있는 경우)
      html = html.replace(/<p>(\s|&nbsp;)*<\/p>/g, '');

      // 2. 연속된 빈 줄바꿈만 제거 (3개 이상 연속된 경우만)
      html = html.replace(/(<p><br\s*\/?><\/p>){3,}/g, '<p><br></p><p><br></p>');

      // 3. 문서 끝의 불필요한 빈 줄 하나만 제거
      html = html.replace(/<p><br\s*\/?><\/p>$/, '');

      // 디버깅: 처리 후 HTML 확인
      console.log('✅ 처리 후 HTML:', JSON.stringify(html));
      console.log('✅ 처리 후 HTML (가독성):', html);
      console.log('🔄 변경 여부:', originalHtml !== html ? '변경됨' : '변경 안됨');

      // 3) data:가 남아 있으면 저장 중단
      if (html.includes('src="data:')) {
        setIsLoading(false);
        alert("이미지 업로드 처리 중입니다. 잠시 후 다시 저장해주세요.");
        return;
      }

      await createPost({ title: title.trim(), content: html, category });
      setSnackbar({
        open: true,
        message: "게시글이 성공적으로 저장되었습니다! 🎉",
        severity: "success",
      });
      timerRef.current = setTimeout(() => navigate("/"), 800);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "게시글 저장에 실패했습니다. 😢",
        severity: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
          새 글 작성
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
