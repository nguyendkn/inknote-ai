# Research Report: UI Components & State Management

## Current UI Component Inventory

### Editor Components (components/editor/)
| Component | Purpose | Status |
|-----------|---------|--------|
| Editor.tsx | Main markdown editor | Exists, functional |
| CodeBlockRenderer.tsx | Syntax highlighting | Exists |
| ConfirmDialog.tsx | Confirmation modal | Exists, reusable |
| ExecutableCodeBlock.tsx | Run code blocks | Exists |
| ImageUploadModal.tsx | Upload/crop images | Exists |
| ImageCropper.tsx | Crop image | Exists |
| ImagePreview.tsx | Preview image | Exists |
| ResizeControls.tsx | Image resize | Exists |
| UploadZone.tsx | Drag-drop upload | Exists |
| RunButton.tsx | Execute code | Exists |
| OutputPanel.tsx | Code output | Exists |

### Layout Components (components/layout/)
| Component | Purpose | Status |
|-----------|---------|--------|
| Sidebar.tsx | Notebook navigation | Exists |
| NoteList.tsx | Note list panel | Exists |

### Settings Components (components/settings/)
- SettingsModal.tsx with tabs: General, Editor, Workspace, Profile, Plugins, Sync

## State Management Approach (app/page.tsx)

```typescript
// Current state - all in page.tsx
const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>("ideas");
const [selectedNoteId, setSelectedNoteId] = useState<string | null>(MOCK_NOTES[0].id);
const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
const [sidebarOpen, setSidebarOpen] = useState(true);
const [noteListOpen, setNoteListOpen] = useState(true);
const [isMobile, setIsMobile] = useState(false);
const [settingsOpen, setSettingsOpen] = useState(false);
```

**Problems**:
- All state lifted to page level
- Mock data, no persistence
- No loading/error states
- No optimistic updates

## Missing UI Components for CRUD

### Create Note
- [ ] CreateNoteButton (in NoteList header - exists but non-functional)
- [ ] CreateNoteModal or inline form
- [ ] Notebook selector

### Read Note
- [x] NoteList.tsx - displays notes
- [x] Editor.tsx - displays content
- [ ] Search functionality (button exists, not wired)
- [ ] Filter/sort controls

### Update Note
- [x] Title editing (inline in Editor)
- [x] Content editing (MDEditor)
- [ ] Tag management (add/remove/edit tags)
- [ ] Auto-save indicator
- [ ] Last saved timestamp

### Delete Note
- [ ] DeleteNoteButton (context menu or button)
- [ ] Delete confirmation dialog (can reuse ConfirmDialog)
- [ ] Undo delete toast

## Recommended State Management

### Option 1: React Context + useReducer (Simple)
```typescript
// contexts/NotesContext.tsx
interface NotesState {
  notes: Note[];
  notebooks: Notebook[];
  selectedNoteId: string | null;
  selectedNotebookId: string | null;
  isLoading: boolean;
  error: string | null;
}
```

### Option 2: Custom Hooks (Recommended)
```typescript
// hooks/useNotes.ts
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD operations
  const createNote = async (data: CreateNoteInput) => {...};
  const updateNote = async (id: string, data: UpdateNoteInput) => {...};
  const deleteNote = async (id: string) => {...};

  return { notes, isLoading, createNote, updateNote, deleteNote };
}
```

## Component Integration Points

1. **NoteList.tsx**
   - Add `onCreateNote` prop
   - Add `onDeleteNote` prop (context menu)
   - Wire up search button
   - Add loading skeleton

2. **Editor.tsx**
   - Add save status indicator
   - Implement tag CRUD
   - Add delete button in header

3. **Sidebar.tsx**
   - Add create notebook functionality
   - Add notebook context menu (rename, delete)

## Key Findings

- UI shell exists, CRUD logic missing
- ConfirmDialog can be reused for delete confirmation
- Mobile responsiveness already handled
- No loading states or error handling
- Tags are displayed but not editable

## Unresolved Questions

1. Where to place "New Note" button? (NoteList header or floating action)
2. Should delete be in context menu or visible button?
3. Auto-save interval or manual save?
