# Phase 01: Data Layer & IPC Handlers

## Context Links
- Parent: [plan.md](plan.md)
- Research: [researcher-01-electron-ipc-storage.md](research/researcher-01-electron-ipc-storage.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Priority | Critical |
| Implementation Status | Pending |
| Review Status | Pending |

Create file-based storage layer and IPC handlers for notes CRUD operations.

## Key Insights

- Config service pattern exists - extend for notes
- Images already use `{workspace}/notes/{noteId}/images/` structure
- better-sqlite3 installed but unused (reserve for search index)

## Requirements

### Functional
- Store notes as `.md` files with `meta.json` for metadata
- Generate UUID for new notes
- Support workspace path from config
- CRUD operations via IPC

### Non-Functional
- Async file operations (non-blocking)
- Error handling with meaningful messages
- Path validation to prevent traversal attacks

## Architecture

```
Renderer (React)
    ↓ IPC invoke
Preload (contextBridge)
    ↓
Main Process
    ↓
NoteService (electron/notes-service.ts)
    ↓
File System
```

## Related Code Files

### Create
- `d:\Projects\markitdown\electron\notes-service.ts` (NEW)
- `d:\Projects\markitdown\types\note.ts` (MODIFY - add CreateNoteInput, UpdateNoteInput)

### Modify
- `d:\Projects\markitdown\electron\main.ts` - add IPC handlers
- `d:\Projects\markitdown\electron\preload.ts` - expose notes API
- `d:\Projects\markitdown\electron\electron.d.ts` - type declarations

## Implementation Steps

### 1. Extend Note Types (types/note.ts)

```typescript
export interface CreateNoteInput {
  title?: string;
  content?: string;
  notebookId: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  notebookId?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface NoteMetadata {
  id: string;
  title: string;
  tags: string[];
  notebookId: string;
  isPinned: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
```

### 2. Create Notes Service (electron/notes-service.ts)

```typescript
class NotesService {
  private getNotesDir(): string;
  private getNoteDir(noteId: string): string;

  // CRUD
  async list(notebookId?: string): Promise<Note[]>;
  async get(id: string): Promise<Note | null>;
  async create(input: CreateNoteInput): Promise<Note>;
  async update(id: string, input: UpdateNoteInput): Promise<Note>;
  async delete(id: string): Promise<boolean>;

  // Utils
  async search(query: string): Promise<Note[]>;
  async exists(id: string): Promise<boolean>;
}
```

### 3. Add IPC Handlers (electron/main.ts)

```typescript
// Notes CRUD
ipcMain.handle("notes:list", async (_event, notebookId?: string) => {...});
ipcMain.handle("notes:get", async (_event, id: string) => {...});
ipcMain.handle("notes:create", async (_event, input: CreateNoteInput) => {...});
ipcMain.handle("notes:update", async (_event, { id, data }) => {...});
ipcMain.handle("notes:delete", async (_event, id: string) => {...});
ipcMain.handle("notes:search", async (_event, query: string) => {...});
```

### 4. Expose in Preload (electron/preload.ts)

```typescript
notes: {
  list: (notebookId?: string) => ipcRenderer.invoke("notes:list", notebookId),
  get: (id: string) => ipcRenderer.invoke("notes:get", id),
  create: (input: CreateNoteInput) => ipcRenderer.invoke("notes:create", input),
  update: (id: string, data: UpdateNoteInput) => ipcRenderer.invoke("notes:update", { id, data }),
  delete: (id: string) => ipcRenderer.invoke("notes:delete", id),
  search: (query: string) => ipcRenderer.invoke("notes:search", query),
}
```

### 5. Update Type Declarations (electron/electron.d.ts)

Add notes API to ElectronAPI interface.

## Todo List

- [ ] Create types/note.ts extensions
- [ ] Create electron/notes-service.ts
- [ ] Add IPC handlers in electron/main.ts
- [ ] Expose API in electron/preload.ts
- [ ] Update electron/electron.d.ts
- [ ] Test create/read/update/delete operations

## Success Criteria

- [ ] Can create note and see `.md` + `meta.json` in workspace
- [ ] Can read note back with correct content
- [ ] Can update note content and metadata
- [ ] Can delete note and files are removed
- [ ] Errors are handled gracefully

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| File corruption | Write to temp file, then rename |
| Concurrent writes | Simple file lock or debounce |
| Missing workspace | Fallback to userData path |

## Security Considerations

- Validate noteId is UUID format
- Sanitize file paths
- No user input in file paths directly

## Next Steps

After completion, proceed to [Phase 02: Notes Service](phase-02-notes-service.md) for frontend service layer.
