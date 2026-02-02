"use client";

import { useCallback } from "react";
import { ConfirmDialog } from "@/components/editor/ConfirmDialog";
import { useNotes } from "@/lib/contexts/NotesContext";

interface DeleteNoteDialogProps {
  isOpen: boolean;
  noteId: string | null;
  noteTitle: string;
  onClose: () => void;
}

export function DeleteNoteDialog({
  isOpen,
  noteId,
  noteTitle,
  onClose,
}: DeleteNoteDialogProps) {
  const { deleteNote } = useNotes();

  const handleConfirm = useCallback(async () => {
    if (noteId) {
      await deleteNote(noteId);
    }
    onClose();
  }, [noteId, deleteNote, onClose]);

  return (
    <ConfirmDialog
      isOpen={isOpen}
      command={`Delete "${noteTitle || "Untitled"}"`}
      reason="This action cannot be undone. The note and all its images will be permanently deleted."
      severity="danger"
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
