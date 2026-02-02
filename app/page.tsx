"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NoteList } from "@/components/layout/NoteList";
import { Editor } from "@/components/editor/Editor";
import { Note } from "@/types/note";
import { MOCK_NOTEBOOKS } from "@/lib/constants/notebooks";
import { MOCK_NOTES } from "@/lib/constants/notes";

export default function Home() {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(
    "ideas",
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    MOCK_NOTES[0].id,
  );
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    );
  };

  const filteredNotes =
    selectedNotebookId === "all"
      ? notes
      : notes.filter((n) => {
          if (!selectedNotebookId) return true;
          return n.notebookId === selectedNotebookId;
        });

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-white">
      {/* Left Sidebar */}
      <Sidebar
        notebooks={MOCK_NOTEBOOKS}
        selectedNotebookId={selectedNotebookId}
        onSelectNotebook={setSelectedNotebookId}
      />

      {/* Middle Note List */}
      <NoteList
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
      />

      {/* Right Editor */}
      <Editor note={selectedNote} onUpdateNote={handleUpdateNote} />
    </div>
  );
}
