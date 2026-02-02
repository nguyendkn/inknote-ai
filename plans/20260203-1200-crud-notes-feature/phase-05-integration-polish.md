# Phase 05: Integration & Polish

## Context Links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 04](phase-04-ui-components.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Priority | Medium |
| Implementation Status | Pending |
| Review Status | Pending |

Final integration, testing, and polish for complete CRUD feature.

## Key Insights

- Connect all components via context
- Add keyboard shortcuts
- Implement auto-save
- Test edge cases
- Mobile responsiveness verification

## Requirements

### Functional
- Full CRUD workflow end-to-end
- Auto-save with debounce
- Keyboard shortcuts (Cmd+N, Cmd+K, etc.)
- Empty states

### Non-Functional
- Smooth animations
- No jank on save
- Consistent error messages
- Accessible

## Implementation Steps

### 1. Wire page.tsx to Context

```tsx
// app/page.tsx - simplified
"use client";

import { Editor } from "@/components/editor/Editor";
import { NoteList } from "@/components/layout/NoteList";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { UpdateNotification } from "@/components/ui/UpdateNotification";
import { MOCK_NOTEBOOKS } from "@/lib/constants/notebooks";
import { useNotes } from "@/lib/contexts/NotesContext";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    filteredNotes,
    selectedNote,
    selectedNotebookId,
    isLoading,
    selectNote,
    selectNotebook,
    updateNote,
  } = useNotes();

  // UI state (keep local)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteListOpen, setNoteListOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ... rest of component uses context values
}
```

### 2. Add Keyboard Shortcuts

```typescript
// lib/hooks/useKeyboardShortcuts.ts
import { useEffect } from "react";

interface Shortcuts {
  "cmd+n"?: () => void;
  "cmd+k"?: () => void;
  "cmd+s"?: () => void;
  "cmd+backspace"?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (isMod && key === "n" && shortcuts["cmd+n"]) {
        e.preventDefault();
        shortcuts["cmd+n"]();
      }
      if (isMod && key === "k" && shortcuts["cmd+k"]) {
        e.preventDefault();
        shortcuts["cmd+k"]();
      }
      if (isMod && key === "s" && shortcuts["cmd+s"]) {
        e.preventDefault();
        shortcuts["cmd+s"]();
      }
      if (isMod && key === "backspace" && shortcuts["cmd+backspace"]) {
        e.preventDefault();
        shortcuts["cmd+backspace"]();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
```

### 3. Loading Skeleton

```tsx
// components/layout/NoteListSkeleton.tsx
export function NoteListSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-slate-100 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-full" />
        </div>
      ))}
    </div>
  );
}
```

### 4. Empty State

```tsx
// components/layout/EmptyNotes.tsx
import { FileText, Plus } from "lucide-react";

interface EmptyNotesProps {
  onCreateNote: () => void;
}

export function EmptyNotes({ onCreateNote }: EmptyNotesProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <FileText size={28} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">No notes yet</h3>
      <p className="text-sm text-slate-400 mb-4">Create your first note to get started</p>
      <button
        onClick={onCreateNote}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
      >
        <Plus size={16} />
        New Note
      </button>
    </div>
  );
}
```

### 5. Error Toast

```tsx
// components/ui/ErrorToast.tsx
import { AlertCircle, X } from "lucide-react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-slide-up">
      <AlertCircle size={18} className="text-red-500" />
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-red-100 rounded cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}
```

### 6. Test Checklist

**Create**
- [ ] Create note with title
- [ ] Create note without title (uses "Untitled")
- [ ] Create note in specific notebook
- [ ] New note appears in list
- [ ] New note is selected

**Read**
- [ ] Notes load on app start
- [ ] Select note shows in editor
- [ ] Filter by notebook works
- [ ] Search returns results

**Update**
- [ ] Edit title updates in list
- [ ] Edit content triggers auto-save
- [ ] Add/remove tags persists
- [ ] Save indicator shows status

**Delete**
- [ ] Delete shows confirmation
- [ ] Confirm deletes note
- [ ] Cancel keeps note
- [ ] Next note selected after delete

**Edge Cases**
- [ ] No notes: shows empty state
- [ ] Large content: no lag
- [ ] Rapid typing: debounced save
- [ ] Offline: graceful error
- [ ] Mobile: responsive layout

## Todo List

- [ ] Wire page.tsx to use NotesContext
- [ ] Add useKeyboardShortcuts hook
- [ ] Create NoteListSkeleton component
- [ ] Create EmptyNotes component
- [ ] Create ErrorToast component
- [ ] Add animations (slide-up, fade-in)
- [ ] Test all CRUD operations
- [ ] Test mobile responsiveness
- [ ] Fix any bugs found

## Success Criteria

- [ ] Full CRUD workflow functional
- [ ] Auto-save working with indicator
- [ ] Keyboard shortcuts work
- [ ] Empty states display correctly
- [ ] Error states handled gracefully
- [ ] Mobile layout works

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Regression in existing features | Manual testing checklist |
| Performance issues | Profile render cycles |

## Security Considerations

- All input sanitized
- File paths validated
- No XSS vectors

## Next Steps

After completion:
1. Manual QA testing
2. Fix discovered bugs
3. Update documentation
4. Consider future enhancements:
   - Notebook CRUD
   - Note pinning
   - Trash/restore
   - Export notes
