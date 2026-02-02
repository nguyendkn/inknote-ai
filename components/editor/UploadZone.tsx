"use client";

import { Upload, Image as ImageIcon } from "lucide-react";
import { useCallback, useState, useRef } from "react";
import {
  validateImageFile,
  readFileAsDataURL,
} from "@/lib/utils/image-utils";

interface UploadZoneProps {
  onImageSelect: (imageDataUrl: string) => void;
  disabled?: boolean;
}

export function UploadZone({ onImageSelect, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      try {
        const dataUrl = await readFileAsDataURL(file);
        onImageSelect(dataUrl);
      } catch {
        setError("Failed to read image file");
      }
    },
    [onImageSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [disabled]
  );

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        aria-label="Upload image by dragging or clicking"
        className={`
          relative flex flex-col items-center justify-center
          w-full h-48 p-6
          border-2 border-dashed rounded-xl
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-hidden="true"
        />

        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center mb-3
            ${isDragging ? "bg-blue-100" : "bg-slate-100"}
          `}
        >
          {isDragging ? (
            <ImageIcon size={24} className="text-blue-500" />
          ) : (
            <Upload size={24} className="text-slate-400" />
          )}
        </div>

        <p className="text-sm font-medium text-slate-700 mb-1">
          {isDragging ? "Drop image here" : "Drag & drop an image"}
        </p>
        <p className="text-xs text-slate-500">
          or click to browse (JPEG, PNG, GIF, WebP - max 5MB)
        </p>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

export default UploadZone;
