"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { X, FileText } from "lucide-react";
import { useNotes } from "@/lib/contexts/NotesContext";
import { MOCK_NOTEBOOKS } from "@/lib/constants/notebooks";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultNotebookId?: string;
}

export function CreateNoteModal({
  isOpen,
  onClose,
  defaultNotebookId,
}: CreateNoteModalProps) {
  const { createNote } = useNotes();
  const [title, setTitle] = useState("");
  const [notebookId, setNotebookId] = useState(defaultNotebookId || "inbox");
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = useCallback(() => {
    setTitle("");
    onClose();
  }, [onClose]);

  const handleCreate = useCallback(async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      await createNote({
        title: title.trim() || "Untitled",
        content: "",
        notebookId,
        tags: [],
      });
      handleClose();
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsCreating(false);
    }
  }, [createNote, title, notebookId, handleClose, isCreating]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCreate();
      } else if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleCreate, handleClose]
  );

  if (!isOpen) return null;

  // Flatten notebooks for select
  const flatNotebooks: { id: string; name: string }[] = [];
  const flattenNotebooks = (
    notebooks: typeof MOCK_NOTEBOOKS,
    prefix = ""
  ) => {
    for (const nb of notebooks) {
      flatNotebooks.push({
        id: nb.id,
        name: prefix + nb.name,
      });
      if (nb.children) {
        flattenNotebooks(nb.children, prefix + "  ");
      }
    }
  };
  flattenNotebooks(MOCK_NOTEBOOKS);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6 animate-fade-in"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">New Note</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notebook
            </label>
            <select
              value={notebookId}
              onChange={(e) => setNotebookId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white cursor-pointer"
            >
              {flatNotebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>
                  {nb.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
          >
            {isCreating ? "Creating..." : "Create Note"}
          </button>
        </div>
      </div>
    </>
  );
}
