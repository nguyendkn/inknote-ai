"use client";

import { Copy, Trash2, X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useCallback, useRef, useEffect } from "react";
import { BashStatus } from "@/lib/hooks/useBashExecutor";

interface OutputPanelProps {
  output: string;
  status: BashStatus;
  exitCode: number | null;
  error: string | null;
  onClear: () => void;
  onClose: () => void;
}

export function OutputPanel({
  output,
  status,
  exitCode,
  error,
  onClear,
  onClose,
}: OutputPanelProps) {
  const outputRef = useRef<HTMLPreElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [output]);

  const getStatusBadge = () => {
    switch (status) {
      case "running":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
            <Loader2 size={12} className="animate-spin" />
            Running...
          </span>
        );
      case "success":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
            <CheckCircle size={12} />
            Exit: {exitCode ?? 0}
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
            <XCircle size={12} />
            {exitCode !== null ? `Exit: ${exitCode}` : "Error"}
          </span>
        );
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case "running":
        return "border-l-orange-400";
      case "success":
        return "border-l-green-400";
      case "error":
        return "border-l-red-400";
      default:
        return "border-l-slate-300";
    }
  };

  const displayContent = error && !output ? error : output || "No output";

  return (
    <div
      className={`
        mt-0 border-t-0 rounded-b-lg overflow-hidden
        bg-slate-50 border border-slate-200 border-l-4
        ${getBorderColor()}
        animate-slideDown
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100/50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Output
          </span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            title="Copy output"
            aria-label="Copy output"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            title="Clear output"
            aria-label="Clear output"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
            title="Close output panel"
            aria-label="Close output panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Output Content */}
      <pre
        ref={outputRef}
        className={`
          p-3 text-xs font-mono leading-relaxed
          max-h-[300px] overflow-auto
          whitespace-pre-wrap break-words
          ${error && !output ? "text-red-600" : "text-slate-700"}
        `}
      >
        {displayContent}
      </pre>
    </div>
  );
}
