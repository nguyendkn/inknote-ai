"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  command: string;
  reason: string;
  severity: "warning" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  command,
  reason,
  severity,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    confirmButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = severity === "danger";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-md
          bg-white rounded-xl shadow-2xl
          border-2 ${isDanger ? "border-red-200" : "border-amber-200"}
          z-50 animate-fade-in
          overflow-hidden
        `}
      >
        {/* Header */}
        <div
          className={`
            flex items-center gap-3 px-5 py-4
            ${isDanger ? "bg-red-50" : "bg-amber-50"}
          `}
        >
          <div
            className={`
              flex items-center justify-center w-10 h-10 rounded-full
              ${isDanger ? "bg-red-100" : "bg-amber-100"}
            `}
          >
            <AlertTriangle
              size={20}
              className={isDanger ? "text-red-600" : "text-amber-600"}
            />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className={`font-semibold ${isDanger ? "text-red-900" : "text-amber-900"}`}
            >
              {isDanger ? "Dangerous Command" : "Warning"}
            </h3>
            <p
              id="confirm-dialog-desc"
              className={`text-sm ${isDanger ? "text-red-700" : "text-amber-700"}`}
            >
              {reason}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Command Preview */}
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600 mb-2">This command will be executed:</p>
          <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-sm font-mono overflow-x-auto max-h-32">
            {command}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer
              ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/50"
                  : "bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500/50"
              }
            `}
          >
            Run Anyway
          </button>
        </div>
      </div>
    </>
  );
}
