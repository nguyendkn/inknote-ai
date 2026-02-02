# Phase 04: UI Components

## Context Links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 03](phase-03-state-management.md)
- Research: [researcher-02-ui-state-management.md](research/researcher-02-ui-state-management.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

Implement missing UI components for complete CRUD experience using /ui-ux-pro-max skill.

## Key Insights

- Create button exists but non-functional
- ConfirmDialog exists - reuse for delete
- Need: CreateNoteModal, TagEditor, SaveIndicator, SearchModal
- Mobile responsive patterns already established

## Requirements

### Functional
- Create new note with title, notebook selection
- Edit/add/remove tags
- Delete with confirmation
- Search notes
- Visual save status indicator

### Non-Functional
- Consistent design with existing UI
- Keyboard accessible
- Smooth animations
- Mobile responsive

## Architecture

```
UI Components
├── CreateNoteModal.tsx (NEW)
├── DeleteNoteDialog.tsx (NEW - wrapper around ConfirmDialog)
├── TagEditor.tsx (NEW)
├── SaveIndicator.tsx (NEW)
├── SearchModal.tsx (NEW)
└── NoteContextMenu.tsx (NEW)
```

## Related Code Files

### Create
- `d:\Projects\markitdown\components\notes\CreateNoteModal.tsx`
- `d:\Projects\markitdown\components\notes\DeleteNoteDialog.tsx`
- `d:\Projects\markitdown\components\notes\TagEditor.tsx`
- `d:\Projects\markitdown\components\notes\SearchModal.tsx`
- `d:\Projects\markitdown\components\ui\SaveIndicator.tsx`

### Modify
- `d:\Projects\markitdown\components\layout\NoteList.tsx` - wire create/delete/search
- `d:\Projects\markitdown\components\editor\Editor.tsx` - add TagEditor, SaveIndicator

## Implementation Steps

### 1. Create Note Modal

```tsx
// components/notes/CreateNoteModal.tsx
"use client";

import { useState } from "react";
import { X, FileText } from "lucide-react";
import { useNotes } from "@/lib/contexts/NotesContext";
import { MOCK_NOTEBOOKS } from "@/lib/constants/notebooks";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultNotebookId?: string;
}

export function CreateNoteModal({ isOpen, onClose, defaultNotebookId }: CreateNoteModalProps) {
  const { createNote, selectNote } = useNotes();
  const [title, setTitle] = useState("");
  const [notebookId, setNotebookId] = useState(defaultNotebookId || "inbox");
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const note = await createNote({
        title: title || "Untitled",
        content: "",
        notebookId,
        tags: [],
      });
      selectNote(note.id);
      onClose();
      setTitle("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">New Note</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notebook</label>
            <select
              value={notebookId}
              onChange={(e) => setNotebookId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
            >
              {MOCK_NOTEBOOKS.map((nb) => (
                <option key={nb.id} value={nb.id}>{nb.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            {isCreating ? "Creating..." : "Create Note"}
          </button>
        </div>
      </div>
    </>
  );
}
```

### 2. Delete Note Dialog

```tsx
// components/notes/DeleteNoteDialog.tsx
"use client";

import { ConfirmDialog } from "@/components/editor/ConfirmDialog";
import { useNotes } from "@/lib/contexts/NotesContext";

interface DeleteNoteDialogProps {
  isOpen: boolean;
  noteId: string | null;
  noteTitle: string;
  onClose: () => void;
}

export function DeleteNoteDialog({ isOpen, noteId, noteTitle, onClose }: DeleteNoteDialogProps) {
  const { deleteNote } = useNotes();

  const handleConfirm = async () => {
    if (noteId) {
      await deleteNote(noteId);
    }
    onClose();
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      command={`Delete "${noteTitle}"`}
      reason="This action cannot be undone. The note and all its images will be permanently deleted."
      severity="danger"
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
```

### 3. Tag Editor

```tsx
// components/notes/TagEditor.tsx
"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagEditor({ tags, onChange }: TagEditorProps) {
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addTag = () => {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
    setIsAdding(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setInput("");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="group bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
        >
          {tag}
          <button
            onClick={() => removeTag(idx)}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {isAdding ? (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder="Tag name..."
          className="text-xs px-2 py-1 border border-blue-300 rounded-lg outline-none w-24"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs text-slate-400 hover:text-blue-500 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer font-medium"
        >
          + Add tag
        </button>
      )}
    </div>
  );
}
```

### 4. Save Indicator

```tsx
// components/ui/SaveIndicator.tsx
"use client";

import { Check, Loader2, Cloud } from "lucide-react";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 size={12} className="animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600">
        <Check size={12} />
        <span>Saved</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <Cloud size={12} />
      <span>Draft</span>
    </div>
  );
}
```

### 5. Search Modal

```tsx
// components/notes/SearchModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X, FileText } from "lucide-react";
import { useNotes } from "@/lib/contexts/NotesContext";
import { searchNotes } from "@/lib/services/notes-service";
import { Note } from "@/types/note";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { selectNote } = useNotes();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const notes = await searchNotes(query);
      setResults(notes);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    selectNote(id);
    onClose();
    setQuery("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 outline-none text-sm"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query && !isSearching && (
            <div className="p-8 text-center text-slate-400 text-sm">No results found</div>
          )}
          {results.map((note) => (
            <button
              key={note.id}
              onClick={() => handleSelect(note.id)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 text-left cursor-pointer"
            >
              <FileText size={16} className="text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-900">{note.title}</div>
                <div className="text-xs text-slate-400 line-clamp-1">
                  {note.content.replace(/[#*`[\]]/g, "").substring(0, 60)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
```

### 6. Update NoteList (wire buttons)

- Import CreateNoteModal, SearchModal, DeleteNoteDialog
- Add state for modals
- Wire Plus button to open CreateNoteModal
- Wire Search button to open SearchModal
- Add context menu or delete button per note

### 7. Update Editor (integrate TagEditor, SaveIndicator)

- Replace static tags with TagEditor component
- Add SaveIndicator in header
- Wire tag changes to updateNote

## Todo List

- [ ] Create components/notes/CreateNoteModal.tsx
- [ ] Create components/notes/DeleteNoteDialog.tsx
- [ ] Create components/notes/TagEditor.tsx
- [ ] Create components/notes/SearchModal.tsx
- [ ] Create components/ui/SaveIndicator.tsx
- [ ] Update NoteList.tsx - wire modals
- [ ] Update Editor.tsx - TagEditor, SaveIndicator

## Success Criteria

- [ ] Can create new note via modal
- [ ] Can delete note with confirmation
- [ ] Can add/remove tags inline
- [ ] Can search notes by title/content
- [ ] Save indicator shows saving/saved state

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Modal focus trap | Use existing pattern from ConfirmDialog |
| Keyboard accessibility | Tab order, escape to close |

## Security Considerations

- Sanitize tag input (no scripts)
- Search query sanitization

## Next Steps

After completion, proceed to [Phase 05: Integration & Polish](phase-05-integration-polish.md).
