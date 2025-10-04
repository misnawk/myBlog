import { useCallback } from "react";
import imageUploader from "../../api/imgPostApi";

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

export function useImageUpload(quillRef) {
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
  }, [quillRef]);

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
    }
  }, [quillRef]);

  return {
    imageHandler,
    replaceDataUrisInEditor,
    dataURLtoFile
  };
}
