# Research Report: Electron IPC & File Storage

## Current IPC Handlers (electron/main.ts)

| Handler | Purpose |
|---------|---------|
| `get-app-version` | Returns app version |
| `system:get-info` | CPU/memory stats |
| `updater:check/install/status` | Auto-update |
| `bash:execute/kill` | Command execution |
| `workspace:open-folder-dialog` | Select workspace folder |
| `workspace:read-tree` | Read directory tree |
| `config:read/write/get-path` | App configuration |
| `images:save` | Save images to note folder |

## Exposed Window APIs (electron/preload.ts)

```typescript
window.electronAPI = {
  platform, getAppVersion,
  system: { getInfo },
  updater: { check, install, getStatus, onStatus },
  bash: { execute, kill, onOutput },
  workspace: { openFolderDialog, readTree },
  config: { read, write, getPath },
  images: { save }
}
```

## File Storage Mechanism

- **Config file**: `configs.ini` (INI format) next to executable
- **Images**: `{workspace}/notes/{noteId}/images/{timestamp}.webp`
- **Notes**: Currently mock data only - NO file persistence

## Note Data Structure (types/note.ts)

```typescript
interface Note {
  id: string;
  title: string;
  content: string;  // Markdown
  tags: string[];
  updatedAt: Date;
  notebookId: string;
  isPinned?: boolean;
}
```

## Recommended CRUD IPC Interface

```typescript
// Notes API
notes: {
  list: (notebookId?: string) => Promise<Note[]>,
  get: (id: string) => Promise<Note | null>,
  create: (data: CreateNoteInput) => Promise<Note>,
  update: (id: string, data: UpdateNoteInput) => Promise<Note>,
  delete: (id: string) => Promise<boolean>,
  search: (query: string) => Promise<Note[]>
}

// Notebooks API (optional)
notebooks: {
  list: () => Promise<Notebook[]>,
  create: (name: string, parentId?: string) => Promise<Notebook>,
  update: (id: string, data: Partial<Notebook>) => Promise<Notebook>,
  delete: (id: string) => Promise<boolean>
}
```

## Proposed File Structure

```
{workspace}/
├── notes/
│   ├── {noteId}/
│   │   ├── note.md          # Note content
│   │   ├── meta.json        # Note metadata
│   │   └── images/          # Embedded images
│   └── ...
├── notebooks.json           # Notebook structure
└── index.json               # Search index (optional)
```

## Security Considerations

1. **Path traversal**: Validate all file paths
2. **File size limits**: Prevent memory issues
3. **Sanitize note IDs**: Use UUID, not user input
4. **Backup before delete**: Consider soft delete
5. **Async file operations**: Non-blocking I/O

## Key Findings

- No note persistence currently - using MOCK_NOTES
- Config service exists - can extend pattern for notes
- Image saving already uses note-based folder structure
- better-sqlite3 is installed but unused

## Unresolved Questions

1. Use SQLite (installed) or flat files for notes?
2. Should notes be stored as .md files (portable) or JSON?
3. Full-text search implementation: SQLite FTS5 or simple grep?
