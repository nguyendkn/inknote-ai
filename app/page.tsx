"use client";

import { Editor } from "@/components/editor/Editor";
import { NoteList } from "@/components/layout/NoteList";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { UpdateNotification } from "@/components/ui/UpdateNotification";
import { useNotes } from "@/lib/contexts/NotesContext";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { ChevronLeft, Menu, X } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";

export default function Home() {
  const {
    notes,
    filteredNotes,
    selectedNote,
    selectedNoteId,
    selectedNotebookId,
    isLoading,
    isSaving,
    lastSaved,
    selectNote,
    selectNotebook,
    updateNote,
  } = useNotes();

  // Calculate counts for sidebar
  const notesCount = notes.length;
  const pinnedCount = useMemo(
    () => notes.filter((n) => n.isPinned).length,
    [notes]
  );

  // Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteListOpen, setNoteListOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Local note state for editing (debounced save)
  // Use React's recommended pattern: adjust state during render
  const [localNote, setLocalNote] = useState(selectedNote);
  const [prevNoteId, setPrevNoteId] = useState(selectedNoteId);

  // Sync local note when selected note changes (during render, not in effect)
  if (selectedNoteId !== prevNoteId) {
    setPrevNoteId(selectedNoteId);
    setLocalNote(selectedNote);
  }

  // Auto-save handler
  const handleAutoSave = useCallback(
    async (note: typeof localNote) => {
      if (note && selectedNoteId) {
        await updateNote(selectedNoteId, {
          title: note.title,
          content: note.content,
          tags: note.tags,
          notebookId: note.notebookId,
          isPinned: note.isPinned,
        });
      }
    },
    [selectedNoteId, updateNote]
  );

  // Auto-save with 10 second interval (from config)
  const { forceSave } = useAutoSave(localNote, handleAutoSave, 10000, !!localNote);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setNoteListOpen(true);
      } else {
        setSidebarOpen(true);
        setNoteListOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectNote = useCallback(
    async (id: string) => {
      // Force save current note before switching
      await forceSave();
      selectNote(id);
      // On mobile, close note list and show editor when selecting a note
      if (isMobile) {
        setNoteListOpen(false);
      }
    },
    [selectNote, isMobile, forceSave]
  );

  const handleSelectNotebook = useCallback(
    (id: string | null) => {
      selectNotebook(id);
      if (isMobile) setSidebarOpen(false);
    },
    [selectNotebook, isMobile]
  );

  const handleUpdateLocalNote = useCallback(
    (updatedNote: typeof localNote) => {
      setLocalNote(updatedNote);
    },
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-white relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-50 p-2 bg-zinc-900 text-white rounded-lg shadow-lg hover:bg-zinc-800 transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Mobile Back Button (when viewing editor) */}
      {isMobile && !noteListOpen && (
        <button
          onClick={() => setNoteListOpen(true)}
          className="fixed top-3 left-3 z-40 p-2 bg-white text-slate-600 rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">Notes</span>
        </button>
      )}

      {/* Sidebar Overlay (mobile) */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`
        ${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : sidebarOpen
              ? "relative"
              : "hidden"
        }
      `}
      >
        <Sidebar
          selectedNotebookId={selectedNotebookId}
          onSelectNotebook={handleSelectNotebook}
          onOpenSettings={() => setSettingsOpen(true)}
          notesCount={notesCount}
          pinnedCount={pinnedCount}
        />
      </div>

      {/* Middle Note List */}
      <div
        className={`
        ${isMobile ? (noteListOpen ? "flex-1" : "hidden") : "w-80 shrink-0"}
      `}
      >
        <NoteList
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          selectedNotebookId={selectedNotebookId}
          onSelectNote={handleSelectNote}
          onToggleSidebar={isMobile ? () => setSidebarOpen(true) : undefined}
        />
      </div>

      {/* Right Editor */}
      <div
        className={`
        flex-1 min-w-0
        ${isMobile && noteListOpen ? "hidden" : "flex"}
      `}
      >
        <Editor
          note={localNote}
          onUpdateNote={handleUpdateLocalNote}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />
      </div>

      {/* Update Notification */}
      <UpdateNotification />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
