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

  // Quill 에디터가 콘텐츠를 로드한 후 불필요한 빈 줄 제거
  useEffect(() => {
    if (!pageLoading && content && quillRef.current) {
      // 에디터가 완전히 렌더링될 때까지 대기
      const timer = setTimeout(() => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        // 현재 HTML 가져오기
        const currentHtml = quill.root.innerHTML;

        // 불필요한 빈 줄 제거
        let cleanedHtml = currentHtml;

        // 모든 블록 요소 앞의 빈 p 태그 제거
        cleanedHtml = cleanedHtml.replace(/<p><br><\/p>(?=<(?:ol|ul|blockquote|pre|h[1-6])>)/g, '');

        // 변경되었다면 업데이트
        if (cleanedHtml !== currentHtml) {
          console.log('빈 줄 제거 전:', currentHtml);
          console.log('빈 줄 제거 후:', cleanedHtml);

          // 현재 커서 위치 저장
          const selection = quill.getSelection();

          // HTML 직접 업데이트
          quill.root.innerHTML = cleanedHtml;

          // 커서 위치 복원 (가능하면)
          if (selection) {
            try {
              quill.setSelection(selection);
            } catch (e) {
              // 커서 복원 실패 시 무시
            }
          }
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [pageLoading, content]);

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

        console.log('DB에서 가져온 원본 콘텐츠:', JSON.stringify(post.content));
        console.log('DB에서 가져온 원본 콘텐츠 (가독성):', post.content);

        // Quill 에디터가 자동으로 추가하는 빈 줄을 미리 제거
        let cleanedContent = post.content || "";

        // 리스트나 다른 블록 요소 바로 앞의 빈 p 태그 제거
        cleanedContent = cleanedContent.replace(/<p><br\s*\/?><\/p>(?=<(?:ol|ul|blockquote|pre|h[1-6]))/g, '');

        // p 태그와 리스트 사이의 빈 p 태그 제거
        cleanedContent = cleanedContent.replace(/(<\/p>)<p><br\s*\/?><\/p>(<(?:ol|ul)>)/g, '$1$2');

        console.log('정리 후 콘텐츠:', JSON.stringify(cleanedContent));
        console.log('정리 후 콘텐츠 (가독성):', cleanedContent);

        setContent(cleanedContent);
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
