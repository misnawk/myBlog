// src/pages/CreatePost.js
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import createPost from "../api/postApi";
import imageUploader from "../api/imgPostApi";
import { CATEGORIES } from "../components/categories";
import { useAuth } from "../contexts/AuthContext";

// dataURL -> File (붙여넣기 안전망)
function dataURLtoFile(dataUrl, filename = "paste.png") {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], filename, { type: mime });
}

export default function CreatePost() {
  const navigate = useNavigate();
  const { isTokenValid } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const quillRef = useRef(null);
  const timerRef = useRef(null);

  // 인증 확인
  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/login", {
        replace: true,
        state: { message: "글쓰기 권한이 없습니다. 로그인해주세요." },
      });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTokenValid, navigate]);

  // 툴바 이미지 업로드 핸들러 (스크롤 복원 포함)
  const imageHandler = useCallback(() => {
    const currentScrollY = window.scrollY;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) {
        setTimeout(() => window.scrollTo(0, currentScrollY), 0);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        setTimeout(() => window.scrollTo(0, currentScrollY), 0);
        return;
      }

      try {
        const url = await imageUploader(file);
        const editor = quillRef.current && quillRef.current.getEditor();
        if (!editor) {
          setTimeout(() => window.scrollTo(0, currentScrollY), 0);
          return;
        }
        const range = editor.getSelection(true) || {
          index: editor.getLength(),
        };
        editor.insertEmbed(range.index, "image", url, "user");

        setTimeout(() => {
          window.scrollTo(0, currentScrollY);
          editor.setSelection(range.index + 1, 0, "silent");
        }, 100);
      } catch (e) {
        console.error(e);
        alert("이미지 업로드 실패");
        setTimeout(() => window.scrollTo(0, currentScrollY), 0);
      }
    };

    input.click();
  }, []);

  // Delta 내부 data: 이미지들을 업로드 URL로 치환
  const replaceDataUrisInEditor = useCallback(async () => {
    const quill = quillRef.current && quillRef.current.getEditor();
    if (!quill) return;

    const contents = quill.getContents();
    const ops = contents.ops || [];
    const cache = {}; // 같은 base64 중복 업로드 방지
    let changed = false;

    for (const op of ops) {
      const img = op && op.insert && op.insert.image;
      if (img && typeof img === "string" && img.startsWith("data:")) {
        const dataUrl = img;
        let url = cache[dataUrl];
        if (!url) {
          const file = dataURLtoFile(dataUrl);
          url = await imageUploader(file);
          cache[dataUrl] = url;
        }
        op.insert.image = url;
        changed = true;
      }
    }

    if (changed) {
      const sel = quill.getSelection();
      quill.setContents(contents, "silent");
      if (sel) quill.setSelection(sel);
      // React state 동기화
      setContent(quill.root.innerHTML);
    }
  }, []);

  // 붙여넣기/드롭 가로채기 + base64 안전망
  useEffect(() => {
    const quill = quillRef.current && quillRef.current.getEditor();
    if (!quill) return;
    const editorEl = quill.container.querySelector(".ql-editor");
    if (!editorEl) return;

    // 붙여넣기: 이미지가 있으면 기본 동작 막고 업로드→URL 삽입 (+텍스트도 같이 붙여넣기)
    const onPaste = async (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const images = items.filter((i) => i.type && i.type.startsWith("image/"));
      if (images.length === 0) return;

      e.preventDefault();
      const range = quill.getSelection(true) || { index: quill.getLength() };

      // 이미지 처리
      for (const it of images) {
        const file = it.getAsFile();
        if (!file) continue;
        try {
          const url = await imageUploader(file);
          quill.insertEmbed(range.index, "image", url, "user");
          quill.setSelection(range.index + 1);
        } catch (err) {
          console.error(err);
          alert("이미지 업로드 실패");
        }
      }

      // 이미지 이외의 텍스트가 있으면 함께 삽입
      const text = e.clipboardData.getData("text/plain");
      if (text) {
        const insertAt = quill.getSelection(true)?.index ?? quill.getLength();
        quill.insertText(insertAt, (images.length ? "\n" : "") + text, "user");
        quill.setSelection(insertAt + text.length + (images.length ? 1 : 0));
      }
    };

    // 드래그앤드롭: 이미지만 처리 (텍스트 DnD는 기본 동작 유지)
    const onDrop = async (e) => {
      const files = Array.from(e.dataTransfer?.files || []);
      const images = files.filter((f) => f.type && f.type.startsWith("image/"));
      if (images.length === 0) return;

      e.preventDefault();
      let range = quill.getSelection(true) || { index: quill.getLength() };

      for (const file of images) {
        try {
          const url = await imageUploader(file);
          quill.insertEmbed(range.index, "image", url, "user");
          range.index += 1;
          quill.setSelection(range.index);
        } catch (err) {
          console.error(err);
          alert("이미지 업로드 실패");
        }
      }
    };

    // 혹시 data:가 들어오면 즉시 업로드/치환
    const onTextChange = async (delta, _oldDelta, source) => {
      if (source !== "user") return;
      const hasDataUri = (delta.ops || []).some(
        (op) =>
          op.insert &&
          op.insert.image &&
          typeof op.insert.image === "string" &&
          op.insert.image.startsWith("data:")
      );
      if (hasDataUri) {
        await replaceDataUrisInEditor();
      }
    };

    editorEl.addEventListener("paste", onPaste);
    editorEl.addEventListener("drop", onDrop);
    quill.on("text-change", onTextChange);

    return () => {
      editorEl.removeEventListener("paste", onPaste);
      editorEl.removeEventListener("drop", onDrop);
      quill.off("text-change", onTextChange);
    };
  }, [replaceDataUrisInEditor]);

  // Quill 설정 (미니멀)
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          ["blockquote", "code-block", "code"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "script",
      "blockquote",
      "code-block",
      "code",
      "color",
      "background",
      "align",
      "link",
      "image",
    ],
    []
  );

  // 검증
  const validate = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요");
      return false;
    }
    if (!category) {
      alert("카테고리를 선택해주세요");
      return false;
    }
    const plain = content.replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      alert("내용을 입력해주세요");
      return false;
    }
    return true;
  };

  // 저장
  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // 1) 에디터 내 data: 이미지 → URL 치환
      await replaceDataUrisInEditor();

      // 2) 최종 HTML
      const quill = quillRef.current && quillRef.current.getEditor();
      const html = quill ? quill.root.innerHTML : content;

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

  // 취소
  const handleCancel = () => {
    const hasContent =
      title || category || content.replace(/<[^>]*>/g, "").trim().length > 0;

    if (
      hasContent &&
      !window.confirm("작성 중인 내용이 있습니다. 취소할까요?")
    ) {
      return;
    }
    navigate("/");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
          새 글 작성
        </Typography>

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

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
              "& .ql-editor": {
                "& .ql-code-block": {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "4px",
                  padding: "16px",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "14px",
                  lineHeight: "1.5",
                  margin: "16px 0",
                },
                "& code": {
                  backgroundColor: "#f1f3f4",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "13px",
                },
                "& blockquote": {
                  borderLeft: "4px solid #007bff",
                  paddingLeft: "16px",
                  margin: "16px 0",
                  fontStyle: "italic",
                  color: "#6c757d",
                },
              },
            }}
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              style={{ height: 600 }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "저장 중..." : "저장"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="secondary"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              취소
            </Button>
          </Box>
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
