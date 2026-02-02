"use client";

import { Search, Plus, Menu } from "lucide-react";
import { Note } from "@/types/note";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
}: NoteListProps) {
  const formatDate = (date: Date) => {
    const diff = (new Date().getTime() - date.getTime()) / 1000 / 60; // minutes
    if (diff < 60) return `${Math.floor(diff)} minutes ago`;
    const hours = diff / 60;
    if (hours < 24) return `${Math.floor(hours)} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="w-80 bg-[#FAFAFA] border-r border-gray-200 flex flex-col h-full font-sans">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-200 bg-[#FAFAFA] shrink-0">
        <div className="flex items-center text-gray-700 font-medium">
          <Menu size={18} className="mr-3 text-gray-500 md:hidden" />
          <span className="text-sm font-semibold">Notes</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-500">
          <Search size={16} className="cursor-pointer hover:text-gray-800" />
          <Plus size={18} className="cursor-pointer hover:text-gray-800" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notes.map((note) => {
          const isSelected = selectedNoteId === note.id;
          return (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`
                px-4 py-3 border-b border-gray-100 cursor-pointer group transition-colors
                ${isSelected ? "bg-[#E8E8E8]" : "hover:bg-white bg-[#FAFAFA]"}
              `}
            >
              <h3
                className={`text-sm font-bold mb-1 leading-tight ${isSelected ? "text-black" : "text-gray-700"}`}
              >
                {note.title || "Untitled"}
              </h3>

              <div className="flex items-center text-xs text-gray-500 mb-1 space-x-1">
                <span>{formatDate(note.updatedAt)}</span>
                <span>•</span>
                <span>{note.tags.length} tags</span>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {note.content.replace(/[#*`\[\]]/g, "").substring(0, 100)}...
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NoteList;
