import { useEffect } from "react";
import imageUploader from "../../api/imgPostApi";

export function useEditorHandlers(quillRef, replaceDataUrisInEditor) {
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
  }, [quillRef, replaceDataUrisInEditor]);
}
