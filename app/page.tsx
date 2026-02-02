"use client";

import { Editor } from "@/components/editor/Editor";
import { NoteList } from "@/components/layout/NoteList";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { UpdateNotification } from "@/components/ui/UpdateNotification";
import { MOCK_NOTEBOOKS } from "@/lib/constants/notebooks";
import { MOCK_NOTES } from "@/lib/constants/notes";
import { Note } from "@/types/note";
import { ChevronLeft, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(
    "ideas",
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    MOCK_NOTES[0].id,
  );
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);

  // Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteListOpen, setNoteListOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    );
  };

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    // On mobile, close note list and show editor when selecting a note
    if (isMobile) {
      setNoteListOpen(false);
    }
  };

  const filteredNotes =
    selectedNotebookId === "all"
      ? notes
      : notes.filter((n) => {
          if (!selectedNotebookId) return true;
          return n.notebookId === selectedNotebookId;
        });

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
          notebooks={MOCK_NOTEBOOKS}
          selectedNotebookId={selectedNotebookId}
          onSelectNotebook={(id) => {
            setSelectedNotebookId(id);
            if (isMobile) setSidebarOpen(false);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
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
        <Editor note={selectedNote} onUpdateNote={handleUpdateNote} />
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
