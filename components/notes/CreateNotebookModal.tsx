"use client";

import { useState, useCallback } from "react";
import { X, Folder, FolderOpen } from "lucide-react";
import { CreateNotebookInput } from "@/types/notebook";

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateNotebookInput) => Promise<void>;
  parentId?: string | null;
}

export function CreateNotebookModal({
  isOpen,
  onClose,
  onCreate,
  parentId,
}: CreateNotebookModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"folder" | "notebook">("folder");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        setError("Tên không được để trống");
        return;
      }

      setIsCreating(true);
      setError(null);

      try {
        await onCreate({
          name: name.trim(),
          type,
          parentId: parentId || null,
        });
        setName("");
        setType("folder");
        onClose();
      } catch (err) {
        console.error("Failed to create notebook:", err);
        setError("Không thể tạo notebook");
      } finally {
        setIsCreating(false);
      }
    },
    [name, type, parentId, onCreate, onClose]
  );

  const handleClose = useCallback(() => {
    if (!isCreating) {
      setName("");
      setType("folder");
      setError(null);
      onClose();
    }
  }, [isCreating, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Tạo Notebook Mới
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Name Input */}
          <div className="mb-5">
            <label
              htmlFor="notebook-name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Tên
            </label>
            <input
              id="notebook-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Nhập tên notebook..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
              autoFocus
              disabled={isCreating}
            />
          </div>

          {/* Type Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Loại
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("folder")}
                disabled={isCreating}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  type === "folder"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                } disabled:opacity-50`}
              >
                <Folder
                  size={20}
                  className={type === "folder" ? "text-blue-500" : ""}
                />
                <span className="font-medium">Folder</span>
              </button>
              <button
                type="button"
                onClick={() => setType("notebook")}
                disabled={isCreating}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  type === "notebook"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                } disabled:opacity-50`}
              >
                <FolderOpen
                  size={20}
                  className={type === "notebook" ? "text-blue-500" : ""}
                />
                <span className="font-medium">Notebook</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
