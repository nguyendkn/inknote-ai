"use client";

import { useState, useCallback } from "react";
import { Note } from "@/types/note";
import { Menu, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { CreateNoteModal } from "@/components/notes/CreateNoteModal";
import { DeleteNoteDialog } from "@/components/notes/DeleteNoteDialog";
import { SearchModal } from "@/components/notes/SearchModal";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  selectedNotebookId: string | null;
  onSelectNote: (id: string) => void;
  onToggleSidebar?: () => void;
}

export function NoteList({
  notes,
  selectedNoteId,
  selectedNotebookId,
  onSelectNote,
  onToggleSidebar,
}: NoteListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const formatDate = useCallback((date: Date) => {
    const diff = (new Date().getTime() - date.getTime()) / 1000 / 60; // minutes
    if (diff < 60) return `${Math.floor(diff)} minutes ago`;
    const hours = diff / 60;
    if (hours < 24) return `${Math.floor(hours)} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }, []);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, note: Note) => {
      e.stopPropagation();
      setDeleteTarget({ id: note.id, title: note.title });
    },
    []
  );

  return (
    <>
      <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full font-sans">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center text-slate-900">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="mr-3 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Menu size={18} />
              </button>
            )}
            <span className="text-base font-semibold">Notes</span>
            <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {notes.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
              title="Search notes (Cmd+K)"
            >
              <Search size={16} />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer">
              <SlidersHorizontal size={16} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
              title="New note (Cmd+N)"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Plus size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 mb-3">No notes yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
            >
              Create your first note
            </button>
          </div>
        )}

        {/* List */}
        {notes.length > 0 && (
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {notes.map((note) => {
              const isSelected = selectedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`
                    group relative px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 mb-1.5
                    ${
                      isSelected
                        ? "bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-200"
                        : "hover:bg-white hover:shadow-sm"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteClick(e, note)}
                    className="absolute right-2 top-2 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>

                  <h3
                    className={`text-sm font-semibold mb-1.5 leading-tight transition-colors duration-200 pr-8 ${
                      isSelected ? "text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {note.title || "Untitled"}
                  </h3>

                  <div className="flex items-center text-xs text-slate-400 mb-1.5 gap-1.5">
                    <span className="font-medium">
                      {formatDate(note.updatedAt)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{note.tags.length} tags</span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`[\]]/g, "").substring(0, 100)}
                    {note.content.length > 100 ? "..." : ""}
                  </p>

                  {/* Tags preview */}
                  {note.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {note.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultNotebookId={selectedNotebookId || undefined}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <DeleteNoteDialog
        isOpen={!!deleteTarget}
        noteId={deleteTarget?.id || null}
        noteTitle={deleteTarget?.title || ""}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default NoteList;
