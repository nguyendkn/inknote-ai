# Phase 03: State Management

## Context Links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 02](phase-02-notes-service.md)
- Research: [researcher-02-ui-state-management.md](research/researcher-02-ui-state-management.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

Implement React context and custom hooks for notes state management.

## Key Insights

- Current: all state in page.tsx with mock data
- Need: centralized state with async CRUD operations
- Pattern: Context + custom hooks (simple, scalable)

## Requirements

### Functional
- Load notes from Electron on mount
- CRUD operations with state sync
- Loading and error states
- Optimistic updates for better UX

### Non-Functional
- Minimal re-renders
- Easy to use API
- Testable

## Architecture

```
NotesProvider (Context)
    ↓ provides
useNotes() hook
    ↓ consumed by
Components (NoteList, Editor, etc.)
```

## Related Code Files

### Create
- `d:\Projects\markitdown\lib\contexts\NotesContext.tsx` (NEW)
- `d:\Projects\markitdown\lib\hooks\useNotes.ts` (NEW)

### Modify
- `d:\Projects\markitdown\app\page.tsx` - use context instead of local state
- `d:\Projects\markitdown\app\layout.tsx` - wrap with provider

## Implementation Steps

### 1. Create Notes Context

```typescript
// lib/contexts/NotesContext.tsx
"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
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
        notes: state.notes.map(n =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload),
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

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const notes = await notesService.listNotes();
      dispatch({ type: "SET_NOTES", payload: notes });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load notes" });
    }
  }

  async function createNote(input: CreateNoteInput): Promise<Note> {
    const note = await notesService.createNote(input);
    dispatch({ type: "ADD_NOTE", payload: note });
    dispatch({ type: "SELECT_NOTE", payload: note.id });
    return note;
  }

  async function updateNote(id: string, data: UpdateNoteInput) {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const note = await notesService.updateNote(id, data);
      dispatch({ type: "UPDATE_NOTE", payload: note });
      dispatch({ type: "SET_LAST_SAVED", payload: new Date() });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }

  async function deleteNote(id: string) {
    await notesService.deleteNote(id);
    dispatch({ type: "DELETE_NOTE", payload: id });
  }

  const selectNote = (id: string | null) => {
    dispatch({ type: "SELECT_NOTE", payload: id });
  };

  const selectNotebook = (id: string | null) => {
    dispatch({ type: "SELECT_NOTEBOOK", payload: id });
  };

  const selectedNote = state.notes.find(n => n.id === state.selectedNoteId);

  const filteredNotes =
    state.selectedNotebookId === "all" || !state.selectedNotebookId
      ? state.notes
      : state.notes.filter(n => n.notebookId === state.selectedNotebookId);

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
```

### 2. Create useAutoSave Hook

```typescript
// lib/hooks/useAutoSave.ts
import { useRef, useEffect, useCallback } from "react";

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastValueRef = useRef<T>(value);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      if (JSON.stringify(value) !== JSON.stringify(lastValueRef.current)) {
        await onSave(value);
        lastValueRef.current = value;
      }
    }, delay);
  }, [value, onSave, delay]);

  useEffect(() => {
    debouncedSave();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSave]);
}
```

### 3. Wrap App with Provider (layout.tsx)

```tsx
// app/layout.tsx
import { NotesProvider } from "@/lib/contexts/NotesContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotesProvider>
          {children}
        </NotesProvider>
      </body>
    </html>
  );
}
```

## Todo List

- [ ] Create lib/contexts/NotesContext.tsx
- [ ] Create lib/hooks/useAutoSave.ts
- [ ] Update app/layout.tsx to wrap with provider
- [ ] Refactor app/page.tsx to use useNotes()
- [ ] Test state updates

## Success Criteria

- [ ] Notes load on app start
- [ ] Creating note updates list immediately
- [ ] Updating note triggers auto-save
- [ ] Deleting note removes from list
- [ ] Loading/saving states visible

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Context re-renders | Use useMemo for derived state |
| Race conditions | Debounce updates, queue saves |

## Security Considerations

- No security concerns at state level
- All data validation in service layer

## Next Steps

After completion, proceed to [Phase 04: UI Components](phase-04-ui-components.md).
