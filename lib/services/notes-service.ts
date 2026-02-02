"use client";

import { Note, CreateNoteInput, UpdateNoteInput } from "@/types/note";

// Check if running in Electron
const isElectron = typeof window !== "undefined" && window.electronAPI;
console.log("[notes-service] isElectron:", isElectron);

/**
 * Convert JSON dates to Date objects
 */
function hydrateNote(note: Note): Note {
  return {
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
  };
}

/**
 * List all notes, optionally filtered by notebook
 */
export async function listNotes(notebookId?: string): Promise<Note[]> {
  console.log("[notes-service] listNotes called, isElectron:", isElectron);
  if (!isElectron) {
    // Fallback for browser dev mode
    console.log("[notes-service] Using MOCK_NOTES fallback");
    const { MOCK_NOTES } = await import("@/lib/constants/notes");
    return notebookId
      ? MOCK_NOTES.filter((n) => n.notebookId === notebookId)
      : MOCK_NOTES;
  }

  console.log("[notes-service] Calling window.electronAPI.notes.list()");
  const notes = await window.electronAPI!.notes.list(notebookId);
  console.log("[notes-service] Got notes from IPC:", notes.length);
  return notes.map(hydrateNote);
}

/**
 * Get a single note by ID
 */
export async function getNote(id: string): Promise<Note | null> {
  if (!isElectron) {
    const { MOCK_NOTES } = await import("@/lib/constants/notes");
    return MOCK_NOTES.find((n) => n.id === id) || null;
  }

  const note = await window.electronAPI!.notes.get(id);
  return note ? hydrateNote(note) : null;
}

/**
 * Create a new note
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  if (!isElectron) {
    throw new Error("Create note requires Electron environment");
  }

  const note = await window.electronAPI!.notes.create(input);
  return hydrateNote(note);
}

/**
 * Update an existing note
 */
export async function updateNote(
  id: string,
  data: UpdateNoteInput
): Promise<Note> {
  if (!isElectron) {
    throw new Error("Update note requires Electron environment");
  }

  const note = await window.electronAPI!.notes.update(id, data);
  if (!note) {
    throw new Error(`Note not found: ${id}`);
  }
  return hydrateNote(note);
}

/**
 * Delete a note (hard delete)
 */
export async function deleteNote(id: string): Promise<boolean> {
  if (!isElectron) {
    throw new Error("Delete note requires Electron environment");
  }

  return window.electronAPI!.notes.delete(id);
}

/**
 * Search notes by query (title, content, tags)
 */
export async function searchNotes(query: string): Promise<Note[]> {
  if (!isElectron) {
    const { MOCK_NOTES } = await import("@/lib/constants/notes");
    const q = query.toLowerCase();
    return MOCK_NOTES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  const notes = await window.electronAPI!.notes.search(query);
  return notes.map(hydrateNote);
}
