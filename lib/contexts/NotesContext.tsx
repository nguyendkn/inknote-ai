"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Note, CreateNoteInput, UpdateNoteInput } from "@/types/note";
import * as notesService from "@/lib/services/notes-service";

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  selectedNotebookId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
}

type NotesAction =
  | { type: "SET_NOTES"; payload: Note[] }
  | { type: "ADD_NOTE"; payload: Note }
  | { type: "UPDATE_NOTE"; payload: Note }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SELECT_NOTE"; payload: string | null }
  | { type: "SELECT_NOTEBOOK"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LAST_SAVED"; payload: Date };

const initialState: NotesState = {
  notes: [],
  selectedNoteId: null,
  selectedNotebookId: null,
  isLoading: true,
  isSaving: false,
  error: null,
  lastSaved: null,
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case "SET_NOTES":
      return { ...state, notes: action.payload, isLoading: false };
    case "ADD_NOTE":
      return { ...state, notes: [action.payload, ...state.notes] };
    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
        selectedNoteId:
          state.selectedNoteId === action.payload ? null : state.selectedNoteId,
      };
    case "SELECT_NOTE":
      return { ...state, selectedNoteId: action.payload };
    case "SELECT_NOTEBOOK":
      return { ...state, selectedNotebookId: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_LAST_SAVED":
      return { ...state, lastSaved: action.payload };
    default:
      return state;
  }
}

interface NotesContextValue extends NotesState {
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  selectNotebook: (id: string | null) => void;
  refreshNotes: () => Promise<void>;
  selectedNote: Note | undefined;
  filteredNotes: Note[];
}

const NotesContext = createContext<NotesContextValue | null>(null);

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Load notes on mount
  const loadNotes = useCallback(async () => {
    console.log("[NotesContext] Starting to load notes...");
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      console.log("[NotesContext] Calling notesService.listNotes()...");
      const notes = await notesService.listNotes();
      console.log("[NotesContext] Loaded notes:", notes.length);
      dispatch({ type: "SET_NOTES", payload: notes });
      // Select first note if none selected
      if (notes.length > 0 && !state.selectedNoteId) {
        dispatch({ type: "SELECT_NOTE", payload: notes[0].id });
      }
    } catch (error) {
      console.error("[NotesContext] Failed to load notes:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load notes" });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.selectedNoteId]);

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNote = useCallback(async (input: CreateNoteInput): Promise<Note> => {
    try {
      const note = await notesService.createNote(input);
      dispatch({ type: "ADD_NOTE", payload: note });
      dispatch({ type: "SELECT_NOTE", payload: note.id });
      return note;
    } catch (error) {
      console.error("Failed to create note:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to create note" });
      throw error;
    }
  }, []);

  const updateNote = useCallback(async (id: string, data: UpdateNoteInput) => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const note = await notesService.updateNote(id, data);
      dispatch({ type: "UPDATE_NOTE", payload: note });
      dispatch({ type: "SET_LAST_SAVED", payload: new Date() });
    } catch (error) {
      console.error("Failed to update note:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to save note" });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      const success = await notesService.deleteNote(id);
      if (success) {
        dispatch({ type: "DELETE_NOTE", payload: id });
      } else {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete note" });
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to delete note" });
    }
  }, []);

  const selectNote = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_NOTE", payload: id });
  }, []);

  const selectNotebook = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_NOTEBOOK", payload: id });
  }, []);

  const selectedNote = state.notes.find((n) => n.id === state.selectedNoteId);

  const filteredNotes =
    state.selectedNotebookId === "all" || !state.selectedNotebookId
      ? state.notes
      : state.notes.filter((n) => n.notebookId === state.selectedNotebookId);

  return (
    <NotesContext.Provider
      value={{
        ...state,
        createNote,
        updateNote,
        deleteNote,
        selectNote,
        selectNotebook,
        refreshNotes: loadNotes,
        selectedNote,
        filteredNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within NotesProvider");
  }
  return context;
}
