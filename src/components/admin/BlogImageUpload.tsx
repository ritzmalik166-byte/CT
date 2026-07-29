"use client";

import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { apiUpload } from "@/lib/admin-client";

interface BlogImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function BlogImageUpload({ value, onChange }: BlogImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const result = await apiUpload<{ url: string }>("/api/blogs/upload-image", file);
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleRemove() {
    onChange("");
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="admin-image-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="admin-image-upload-input"
        onChange={(event) => void handleFileSelect(event)}
      />

      {value ? (
        <div className="admin-image-upload-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Featured preview" />
          <div className="admin-image-upload-preview-actions">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Replace
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              disabled={uploading}
              onClick={handleRemove}
            >
              <Trash2 className="size-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="admin-image-upload-dropzone"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              Uploading image...
            </>
          ) : (
            <>
              <ImagePlus className="size-6" />
              <span>Click to upload featured image</span>
              <small>JPEG, PNG, WebP, or GIF — max 5MB</small>
            </>
          )}
        </button>
      )}

      <div className="admin-image-upload-url">
        <span>Or paste image URL</span>
        <input
          className="admin-input"
          value={value}
          onChange={(event) => {
            setError("");
            onChange(event.target.value);
          }}
          placeholder="https://..."
        />
      </div>

      {error ? <p className="admin-error text-sm">{error}</p> : null}
    </div>
  );
}
