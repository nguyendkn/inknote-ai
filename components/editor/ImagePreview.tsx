"use client";

import { formatFileSize, getBase64Size } from "@/lib/utils/image-utils";
import { useMemo } from "react";

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  quality: number;
  format: "jpeg" | "webp";
}

interface ImagePreviewProps {
  base64Src: string;
  altText: string;
  onAltTextChange: (alt: string) => void;
  compressionStats?: CompressionStats;
}

export function ImagePreview({
  base64Src,
  altText,
  onAltTextChange,
  compressionStats,
}: ImagePreviewProps) {
  // Calculate file size from base64
  const currentSize = useMemo(() => {
    return getBase64Size(base64Src);
  }, [base64Src]);

  // Calculate savings percentage
  const savingsPercent = useMemo(() => {
    if (!compressionStats) return 0;
    return Math.round(
      (1 - compressionStats.compressedSize / compressionStats.originalSize) *
        100
    );
  }, [compressionStats]);

  // Generate markdown preview
  const markdownPreview = useMemo(() => {
    const safeAlt = altText.replace(/[[\]]/g, "");
    return `![${safeAlt || "image"}](/notes/{noteId}/YYYYMMDDHHmmss.webp)`;
  }, [altText]);

  return (
    <div className="space-y-4">
      {/* Preview Image */}
      <div className="flex justify-center p-4 bg-slate-50 rounded-xl">
        <img
          src={base64Src}
          alt={altText || "Preview"}
          className="max-h-48 max-w-full rounded-lg border border-slate-200 shadow-sm"
        />
      </div>

      {/* Alt Text Input */}
      <div>
        <label
          htmlFor="preview-alt-text"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Alt text
          <span className="text-slate-400 font-normal ml-1">
            (for accessibility)
          </span>
        </label>
        <input
          id="preview-alt-text"
          type="text"
          value={altText}
          onChange={(e) => onAltTextChange(e.target.value)}
          placeholder="Describe this image for screen readers..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          maxLength={200}
        />
        <p className="mt-1 text-xs text-slate-400">
          {altText.length}/200 characters
        </p>
      </div>

      {/* Compression Stats */}
      <div className="p-3 bg-slate-50 rounded-lg space-y-2">
        {compressionStats ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Original:</span>
              <span className="text-sm text-slate-500">
                {formatFileSize(compressionStats.originalSize)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Compressed:</span>
              <span className="text-sm font-medium text-green-600">
                {formatFileSize(compressionStats.compressedSize)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Savings:</span>
              <span className="text-sm font-medium text-green-600">
                {savingsPercent}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-200">
              <span>Format: {compressionStats.format.toUpperCase()}</span>
              <span>
                Quality: {Math.round(compressionStats.quality * 100)}%
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">File size:</span>
            <span className="text-sm font-medium text-slate-900">
              {formatFileSize(currentSize)}
            </span>
          </div>
        )}
      </div>

      {/* Markdown Preview */}
      <div>
        <p className="text-xs text-slate-500 mb-1">Markdown output:</p>
        <div className="p-3 bg-slate-900 rounded-lg overflow-x-auto">
          <code className="text-xs text-green-400 font-mono whitespace-nowrap">
            {markdownPreview}
          </code>
        </div>
      </div>
    </div>
  );
}

export default ImagePreview;
