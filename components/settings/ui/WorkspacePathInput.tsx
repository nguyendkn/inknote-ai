"use client";

import { FolderOpen, Loader2 } from "lucide-react";
import { useState } from "react";

interface WorkspacePathInputProps {
  value: string;
  onChange: (path: string) => void;
  onBrowse: () => Promise<string | null>;
}

export function WorkspacePathInput({
  value,
  onChange,
  onBrowse,
}: WorkspacePathInputProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBrowse = async () => {
    setIsLoading(true);
    try {
      const selectedPath = await onBrowse();
      if (selectedPath) {
        onChange(selectedPath);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value || "No workspace selected"}
        readOnly
        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 truncate cursor-default"
        title={value || "No workspace selected"}
      />
      <button
        onClick={handleBrowse}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FolderOpen size={16} />
        )}
        {isLoading ? "Opening..." : "Browse"}
      </button>
    </div>
  );
}
