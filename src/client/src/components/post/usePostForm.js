import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function usePostForm(isTokenValid) {
  const navigate = useNavigate();
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

  return {
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
  };
}
