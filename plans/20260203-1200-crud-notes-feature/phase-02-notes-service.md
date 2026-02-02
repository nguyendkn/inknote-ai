# Phase 02: Notes Service (Frontend)

## Context Links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 01](phase-01-data-layer-ipc.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

Create frontend service layer to interact with Electron IPC notes API.

## Key Insights

- Need wrapper to handle browser vs Electron environment
- Date serialization required (JSON → Date objects)
- Error handling at service level

## Requirements

### Functional
- Service methods for CRUD
- Handle Date conversion
- Fallback for browser environment (dev mode)

### Non-Functional
- Type-safe API
- Async/await pattern
- Centralized error handling

## Architecture

```
Components (React)
    ↓ import
lib/services/notes-service.ts
    ↓ window.electronAPI.notes
Electron IPC
```

## Related Code Files

### Create
- `d:\Projects\markitdown\lib\services\notes-service.ts` (NEW)

### Reference
- `d:\Projects\markitdown\lib\services\gemini-service.ts` - existing pattern

## Implementation Steps

### 1. Create Notes Service

```typescript
// lib/services/notes-service.ts
import { Note, CreateNoteInput, UpdateNoteInput } from "@/types/note";

// Check if running in Electron
const isElectron = typeof window !== "undefined" && window.electronAPI;

// Convert JSON dates to Date objects
function hydrateNote(note: any): Note {
  return {
    ...note,
    updatedAt: new Date(note.updatedAt),
    createdAt: note.createdAt ? new Date(note.createdAt) : undefined,
  };
}

export async function listNotes(notebookId?: string): Promise<Note[]> {
  if (!isElectron) {
    // Fallback for browser dev mode
    const { MOCK_NOTES } = await import("@/lib/constants/notes");
    return notebookId
      ? MOCK_NOTES.filter(n => n.notebookId === notebookId)
      : MOCK_NOTES;
  }
  const notes = await window.electronAPI!.notes.list(notebookId);
  return notes.map(hydrateNote);
}

export async function getNote(id: string): Promise<Note | null> {
  if (!isElectron) {
    const { MOCK_NOTES } = await import("@/lib/constants/notes");
    return MOCK_NOTES.find(n => n.id === id) || null;
  }
  const note = await window.electronAPI!.notes.get(id);
  return note ? hydrateNote(note) : null;
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  if (!isElectron) {
    throw new Error("Create note requires Electron");
  }
  const note = await window.electronAPI!.notes.create(input);
  return hydrateNote(note);
}

export async function updateNote(
  id: string,
  data: UpdateNoteInput
): Promise<Note> {
  if (!isElectron) {
    throw new Error("Update note requires Electron");
  }
  const note = await window.electronAPI!.notes.update(id, data);
  return hydrateNote(note);
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!isElectron) {
    throw new Error("Delete note requires Electron");
  }
  return window.electronAPI!.notes.delete(id);
}

export async function searchNotes(query: string): Promise<Note[]> {
  if (!isElectron) {
    const { MOCK_NOTES } = await import("@/lib/constants/notes");
    const q = query.toLowerCase();
    return MOCK_NOTES.filter(
      n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }
  const notes = await window.electronAPI!.notes.search(query);
  return notes.map(hydrateNote);
}
```

## Todo List

- [ ] Create lib/services/notes-service.ts
- [ ] Export all CRUD functions
- [ ] Test with mock data fallback
- [ ] Test with Electron IPC

## Success Criteria

- [ ] Service compiles without errors
- [ ] Can call listNotes() and get results
- [ ] Date objects are properly hydrated
- [ ] Browser fallback works in dev mode

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| SSR issues | Check window exists before API call |
| Type mismatches | Strict typing on return values |

## Security Considerations

- No sensitive data in service layer
- All validation happens in Electron main process

## Next Steps

After completion, proceed to [Phase 03: State Management](phase-03-state-management.md).
