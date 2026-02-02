# Phase 04: Integration

## Context Links
- **Parent Plan**: [plan.md](plan.md)
- **Previous Phase**: [phase-03-ui-components.md](phase-03-ui-components.md)
- **Dependencies**: Phase 01, 02, 03

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Description | Tích hợp workspace path vào file operations của ứng dụng |
| Priority | Medium |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

1. Hiện tại app dùng mock data (MOCK_NOTES, MOCK_NOTEBOOKS)
2. Khi có workspace, notes sẽ được lưu thành files trong workspace
3. Cần tích hợp với Editor component để save files vào workspace
4. Cần tạo cấu trúc thư mục theo notebooks

## Requirements

### Functional
- Khi tạo note mới → save vào workspace/notebook_name/
- Khi edit note → update file trong workspace
- Load notes từ workspace khi app khởi động
- Tạo folder structure theo notebooks

### Non-Functional
- Backward compatible với mock data khi chưa có workspace
- Atomic file writes
- Handle file conflicts

## Architecture

```
Workspace Folder Structure:
workspace/
├── inbox/
│   ├── note-1.md
│   └── note-2.md
├── ideas/
│   ├── note-3.md
│   └── note-4.md
├── work/
│   └── note-5.md
└── personal/
    └── note-6.md
```

### File Naming Convention
```
{note-id}.md
Example: 550e8400-e29b-41d4-a716-446655440000.md
```

### Note File Format
```markdown
---
id: 550e8400-e29b-41d4-a716-446655440000
title: My Note Title
createdAt: 2026-02-03T10:30:00.000Z
updatedAt: 2026-02-03T11:45:00.000Z
tags: [tag1, tag2]
---

Note content here...
```

## Related Code Files

| File | Action | Description |
|------|--------|-------------|
| `lib/services/note-service.ts` | Create | Note CRUD operations với filesystem |
| `electron/main.ts` | Modify | Thêm IPC handlers cho note operations |
| `electron/preload.ts` | Modify | Expose note APIs |
| `app/page.tsx` | Modify | Integrate với note service |

## Implementation Steps

### Step 1: Create Note Service

```typescript
// lib/services/note-service.ts (runs in main process)
import fs from 'fs';
import path from 'path';
import { Note } from '@/types/note';

export class NoteService {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  setWorkspacePath(workspacePath: string): void {
    this.workspacePath = workspacePath;
  }

  // Parse frontmatter from markdown file
  private parseNote(filePath: string): Note | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

      if (!frontmatterMatch) return null;

      const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
      const noteContent = frontmatterMatch[2];

      return {
        id: frontmatter.id,
        title: frontmatter.title,
        content: noteContent,
        createdAt: new Date(frontmatter.createdAt),
        updatedAt: new Date(frontmatter.updatedAt),
        tags: frontmatter.tags || [],
      };
    } catch (error) {
      console.error('Failed to parse note:', error);
      return null;
    }
  }

  // Load all notes from workspace
  loadNotes(notebookId: string): Note[] {
    const notebookPath = path.join(this.workspacePath, notebookId);

    if (!fs.existsSync(notebookPath)) {
      fs.mkdirSync(notebookPath, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(notebookPath)
      .filter(f => f.endsWith('.md'));

    return files
      .map(f => this.parseNote(path.join(notebookPath, f)))
      .filter((n): n is Note => n !== null);
  }

  // Save note to workspace
  saveNote(note: Note, notebookId: string): void {
    const notebookPath = path.join(this.workspacePath, notebookId);

    if (!fs.existsSync(notebookPath)) {
      fs.mkdirSync(notebookPath, { recursive: true });
    }

    const filePath = path.join(notebookPath, `${note.id}.md`);
    const content = this.serializeNote(note);

    fs.writeFileSync(filePath, content, 'utf-8');
  }

  // Delete note from workspace
  deleteNote(noteId: string, notebookId: string): void {
    const filePath = path.join(this.workspacePath, notebookId, `${noteId}.md`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private serializeNote(note: Note): string {
    return `---
id: ${note.id}
title: ${note.title}
createdAt: ${note.createdAt.toISOString()}
updatedAt: ${note.updatedAt.toISOString()}
tags: [${note.tags.join(', ')}]
---

${note.content}`;
  }

  private parseFrontmatter(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (value.startsWith('[') && value.endsWith(']')) {
          result[key] = value.slice(1, -1).split(',').map(s => s.trim());
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }
}
```

### Step 2: Add IPC Handlers

```typescript
// electron/main.ts - add these handlers
import { NoteService } from '../lib/services/note-service';

let noteService: NoteService | null = null;

// Initialize note service when workspace is set
ipcMain.handle('notes:init', (_event, workspacePath: string) => {
  noteService = new NoteService(workspacePath);
  return true;
});

ipcMain.handle('notes:load', (_event, notebookId: string) => {
  if (!noteService) return [];
  return noteService.loadNotes(notebookId);
});

ipcMain.handle('notes:save', (_event, note: Note, notebookId: string) => {
  if (!noteService) return false;
  noteService.saveNote(note, notebookId);
  return true;
});

ipcMain.handle('notes:delete', (_event, noteId: string, notebookId: string) => {
  if (!noteService) return false;
  noteService.deleteNote(noteId, notebookId);
  return true;
});
```

### Step 3: Update Preload

```typescript
// electron/preload.ts - add notes API
notes: {
  init: (workspacePath: string): Promise<boolean> =>
    ipcRenderer.invoke('notes:init', workspacePath),
  load: (notebookId: string): Promise<Note[]> =>
    ipcRenderer.invoke('notes:load', notebookId),
  save: (note: Note, notebookId: string): Promise<boolean> =>
    ipcRenderer.invoke('notes:save', note, notebookId),
  delete: (noteId: string, notebookId: string): Promise<boolean> =>
    ipcRenderer.invoke('notes:delete', noteId, notebookId),
},
```

### Step 4: Integrate in App

```typescript
// app/page.tsx - integrate with note service
useEffect(() => {
  const initWorkspace = async () => {
    if (typeof window === 'undefined' || !window.electronAPI) return;

    const config = await window.electronAPI.config.read();
    if (config.workspace.path) {
      await window.electronAPI.notes.init(config.workspace.path);
      const notes = await window.electronAPI.notes.load(selectedNotebookId);
      setNotes(notes);
    }
  };

  initWorkspace();
}, [selectedNotebookId]);
```

## Todo List

- [ ] Create note-service.ts với CRUD operations
- [ ] Implement frontmatter parser
- [ ] Add IPC handlers cho note operations
- [ ] Update preload.ts với notes API
- [ ] Integrate trong app/page.tsx
- [ ] Handle fallback to mock data
- [ ] Test file operations
- [ ] Handle file conflicts

## Success Criteria

1. ✅ Notes được load từ workspace folder
2. ✅ Notes được save vào workspace folder
3. ✅ Folder structure theo notebooks
4. ✅ Frontmatter format đúng
5. ✅ Fallback to mock data khi chưa có workspace

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss khi save fail | Critical | Backup before write, atomic writes |
| Corrupt frontmatter | High | Validate before save |
| Large workspace slow | Medium | Pagination, lazy loading |

## Security Considerations

1. **Path traversal**: Validate notebook/note IDs không chứa `..`
2. **File overwrite**: Confirm trước khi overwrite
3. **Permissions**: Check write permission trước khi save

## Next Steps

- Sau khi hoàn thành 4 phases, có thể mở rộng:
  - Cloud sync với workspace
  - Multiple workspaces support
  - Workspace templates

---

*Last Updated: 2026-02-03*
