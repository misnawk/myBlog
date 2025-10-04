import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost } from "../../api/postGetApi";

export function useEditPostForm(user) {
  const navigate = useNavigate();
  const { id } = useParams();

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

        // 작성자만 수정 허용
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

        console.log('📥 DB에서 가져온 원본 콘텐츠:', JSON.stringify(post.content));
        console.log('📥 DB에서 가져온 원본 콘텐츠 (가독성):', post.content);

        setContent(post.content || "");
        setPageLoading(false);
      } catch (error) {
        console.error("게시글 로딩 오류:", error);
        if (!mounted) return;
        setSnackbar({
          open: true,
          message: "게시글을 불러오는데 실패했습니다.",
          severity: "error",
        });
        setPageLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, user, navigate]);

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
    navigate(`/blogDetail/${id}`);
  };

  return {
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
  };
}
