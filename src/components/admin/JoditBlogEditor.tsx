"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="admin-editor-loading">Loading editor...</div>
  ),
});

interface JoditBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function JoditBlogEditor({ value, onChange }: JoditBlogEditorProps) {
  const editor = useRef(null);
  const lastEmittedValue = useRef<string | null>(null);

  const normalizeHTMLValue = (text = "") => {
    if (!text) return "";
    return text.replace(/\u2028/g, "\n").replace(/\u2029/g, "\n\n");
  };

  const [editorValue, setEditorValue] = useState(() => normalizeHTMLValue(value));

  useEffect(() => {
    if (value === lastEmittedValue.current) return;
    setEditorValue(normalizeHTMLValue(value));
  }, [value]);

  const handleEditorChange = (content: string) => {
    const normalizedContent = normalizeHTMLValue(content);
    lastEmittedValue.current = normalizedContent;
    onChange(normalizedContent);
  };

  const config = {
    readonly: false,
    toolbar: true,
    height: 360,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_as_html" as const,
    cleanHTML: {
      removeAttributes: ["style", "class"],
      fillEmptyParagraph: false,
      removeEmptyElements: false,
    },
    uploader: {
      url: "/api/blogs/upload-image",
      format: "json" as const,
      filesVariableName: () => "file",
      isSuccess: (response: { success?: boolean }) => Boolean(response.success),
      getMessage: (response: { error?: string }) => response.error || "Upload failed",
      process: (response: { data?: { url?: string; files?: string[] } }) => ({
        files: response.data?.files?.length
          ? response.data.files
          : response.data?.url
            ? [response.data.url]
            : [],
        path: "",
        baseurl: "",
        error: response.data?.url || response.data?.files?.length ? 0 : 1,
        msg: "",
      }),
    },
  };

  return (
    <div className="admin-jodit-wrap">
      <JoditEditor
        ref={editor}
        value={editorValue}
        config={config}
        onBlur={handleEditorChange}
      />
    </div>
  );
}
