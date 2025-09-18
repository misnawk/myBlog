// src/pages/EditPost.js
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
  CircularProgress,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

import { updatePost } from "../api/postApi";
import { getPost } from "../api/postGetApi";
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

// 스크롤 상태 저장/복원 유틸 (창 + Quill 컨테이너)
function makeScrollRestorer(quill) {
  const winY = window.scrollY;
  const container = quill?.container?.querySelector(".ql-container");
  const contTop = container ? container.scrollTop : null;

  return () => {
    if (container && contTop != null) container.scrollTop = contTop;
    window.scrollTo(0, winY);
  };
}

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const quillRef = useRef(null);
  const timerRef = useRef(null);

  // 기존 포스트 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const post = await getPost(id);
        if (!mounted) return;

        // 작성자만 수정 허용 (원하면 제거 가능)
        if (user && post?.author?.email && user.email !== post.author.email) {
          setSnackbar({
            open: true,
            message: "게시글 수정 권한이 없습니다.",
            severity: "error",
          });
          navigate(`/blogDetail/${id}`);
          return;
        }

        setTitle(post.title || "");
        setCategory(post.category || "");
        
        // 디버깅: DB에서 가져온 원본 콘텐츠 확인
        console.log('📥 DB에서 가져온 원본 콘텐츠:', JSON.stringify(post.content));
        
        // ReactQuill에 설정하기 전에 미리 정리
        let cleanContent = post.content || "";
        
        // 태그 사이의 불필요한 공백 제거 (ReactQuill 로드 전에 미리 처리)
        const protectedBlocks = [];
        
        // 1. 코드 블록 보호
        cleanContent = cleanContent.replace(/(<pre[^>]*>[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/gi, (match, block) => {
          const placeholder = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
          protectedBlocks.push(block);
          return placeholder;
        });
        
        // 2. 줄바꿈을 보존하면서 처리
        // 완전히 빈 태그만 제거 (줄바꿈은 유지)
        cleanContent = cleanContent
          .replace(/<p>(\s|&nbsp;)*<\/p>/g, '') // 공백만 있는 p 태그
          .replace(/(<p><br\s*\/?><\/p>){3,}/g, '<p><br></p><p><br></p>') // 3개 이상 연속된 빈 줄만 제한
          .trim();
        
        // 3. 코드 블록 복원
        protectedBlocks.forEach((block, index) => {
          cleanContent = cleanContent.replace(`__PROTECTED_BLOCK_${index}__`, block);
        });
        
        console.log('🧹 정리된 콘텐츠:', JSON.stringify(cleanContent));
        
        setContent(cleanContent); // 정리된 HTML을 에디터에 설정
      } catch (e) {
        console.error(e);
        setSnackbar({
          open: true,
          message: "게시글을 불러오는 데 실패했습니다.",
          severity: "error",
        });
        navigate("/blog");
      } finally {
        setPageLoading(false);
      }
    })();
    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, navigate, user]);

  // 툴바 이미지 업로드 (점프 방지)
  const imageHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    const restore = makeScrollRestorer(quill);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) {
        requestAnimationFrame(restore);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        requestAnimationFrame(restore);
        return;
      }

      try {
        const url = await imageUploader(file);
        const editor = quillRef.current?.getEditor();
        if (!editor) {
          requestAnimationFrame(restore);
          return;
        }
        const range = editor.getSelection() || { index: editor.getLength() };
        editor.insertEmbed(range.index, "image", url, "user");
        editor.setSelection(range.index + 1, 0, "silent");

        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 0);
        });
      } catch (e) {
        console.error(e);
        alert("이미지 업로드 실패");
        requestAnimationFrame(restore);
      }
    };

    input.click();
  }, []);

  // Delta 내부 data: 이미지들을 업로드 URL로 치환 (점프 방지 포함)
  const replaceDataUrisInEditor = useCallback(async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const restore = makeScrollRestorer(quill);
    const contents = quill.getContents();
    const ops = contents.ops || [];
    const cache = {};
    let changed = false;

    for (const op of ops) {
      const img = op?.insert?.image;
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
      if (sel) quill.setSelection(sel, "silent");

      requestAnimationFrame(() => {
        restore();
        setTimeout(restore, 0);
      });

      setContent(quill.root.innerHTML);
    }
  }, []);

  // 붙여넣기/드롭 가로채기 + base64 안전망 (점프 방지 포함)
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const editorEl = quill.container.querySelector(".ql-editor");
    if (!editorEl) return;

    const onPaste = async (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const images = items.filter((i) => i.type && i.type.startsWith("image/"));
      if (images.length === 0) return;

      const restore = makeScrollRestorer(quill);

      e.preventDefault();
      const range = quill.getSelection() || { index: quill.getLength() };
      let insertAt = range.index;

      try {
        for (const it of images) {
          const file = it.getAsFile();
          if (!file) continue;
          const url = await imageUploader(file);
          quill.insertEmbed(insertAt, "image", url, "user");
          insertAt += 1;
        }

        // 텍스트도 있으면 이어서 삽입
        const text = e.clipboardData.getData("text/plain");
        if (text) {
          if (images.length) {
            quill.insertText(insertAt, "\n", "user");
            insertAt += 1;
          }
          quill.insertText(insertAt, text, "user");
          insertAt += text.length;
        }

        quill.setSelection(insertAt, 0, "silent");

        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 0);
        });
      } catch (err) {
        console.error(err);
        alert("이미지 업로드 실패");
        requestAnimationFrame(restore);
      }
    };

    const onDrop = async (e) => {
      const files = Array.from(e.dataTransfer?.files || []);
      const images = files.filter((f) => f.type && f.type.startsWith("image/"));
      if (images.length === 0) return;

      const restore = makeScrollRestorer(quill);

      e.preventDefault();
      let range = quill.getSelection() || { index: quill.getLength() };
      let insertAt = range.index;

      try {
        for (const file of images) {
          const url = await imageUploader(file);
          quill.insertEmbed(insertAt, "image", url, "user");
          insertAt += 1;
        }
        quill.setSelection(insertAt, 0, "silent");

        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 0);
        });
      } catch (err) {
        console.error(err);
        alert("이미지 업로드 실패");
        requestAnimationFrame(restore);
      }
    };

    const onTextChange = async (delta, _oldDelta, source) => {
      if (source !== "user") return;
      const hasDataUri = (delta.ops || []).some(
        (op) =>
          op?.insert?.image &&
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
    const quill = quillRef.current?.getEditor();
    const html = quill ? quill.root.innerHTML : content;
    const plain = html.replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      alert("내용을 입력해주세요");
      return false;
    }
    return true;
  };

  // 저장(업데이트)
  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await replaceDataUrisInEditor();

      const quill = quillRef.current?.getEditor();
      let html = quill ? quill.root.innerHTML : content;
      
      // 디버깅: 처리 전 HTML 확인
      console.log('🔍 처리 전 HTML:', JSON.stringify(html));
      
      // ReactQuill에서 생성되는 불필요한 줄바꿈 제거 (더 강력한 방법)
      const originalHtml = html;
      
      // 코드 블록을 보호하면서 태그 사이 공백 제거
      const protectedBlocks = [];
      
      // 1. 코드 블록들을 임시로 저장
      html = html.replace(/(<pre[^>]*>[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/gi, (match, block) => {
        const placeholder = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
        protectedBlocks.push(block);
        return placeholder;
      });
      
      // 2. 줄바꿈을 보존하면서 진짜 빈 태그만 제거
      html = html
        .replace(/<p>(\s|&nbsp;)*<\/p>/g, '') // 공백만 있는 빈 p 태그 제거
        .replace(/<div>(\s|&nbsp;)*<\/div>/g, '') // 공백만 있는 빈 div 태그 제거
        .replace(/(<p><br\s*\/?><\/p>){3,}/g, '<p><br></p><p><br></p>') // 3개 이상 연속된 빈 줄만 제한
        .replace(/<p><br\s*\/?><\/p>$/, '') // 문서 마지막의 빈 줄 하나만 제거
        .trim();
      
      // 3. 코드 블록 복원
      protectedBlocks.forEach((block, index) => {
        html = html.replace(`__PROTECTED_BLOCK_${index}__`, block);
      });
      
      // 디버깅: 처리 후 HTML 확인
      console.log('✅ 처리 후 HTML:', JSON.stringify(html));
      console.log('🔄 변경 여부:', originalHtml !== html ? '변경됨' : '변경 안됨');

      if (html.includes('src="data:')) {
        setIsLoading(false);
        alert("이미지 업로드 처리 중입니다. 잠시 후 다시 저장해주세요.");
        return;
      }

      await updatePost(id, {
        title: title.trim(),
        content: html,
        category,
      });

      setSnackbar({
        open: true,
        message: "게시글이 성공적으로 수정되었습니다! 🎉",
        severity: "success",
      });
      timerRef.current = setTimeout(() => navigate(`/blogDetail/${id}`), 800);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "게시글 수정에 실패했습니다. 😢",
        severity: "error",
      });
      setIsLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    navigate(`/blogDetail/${id}`);
  };

  if (pageLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 8, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/blogDetail/${id}`)}
        sx={{ mb: 2 }}
      >
        게시글로 돌아가기
      </Button>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
          게시글 수정
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
              overflow: "visible",
              "& .ql-toolbar": {
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: "#fafafa"
              },
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
              preserveWhitespace
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
              {isLoading ? "수정 중..." : "수정 완료"}
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
