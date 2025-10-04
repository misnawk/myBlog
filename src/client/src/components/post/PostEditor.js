import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Box } from "@mui/material";

export default function PostEditor({
  value,
  onChange,
  quillRef,
  imageHandler
}) {
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

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        "& .ql-toolbar": {
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px 8px 0 0"
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
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ height: 600 }}
      />
    </Box>
  );
}
