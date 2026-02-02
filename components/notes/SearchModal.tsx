"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const notes = await searchNotes(query);
        setResults(notes);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleClose = useCallback(() => {
    setQuery("");
    setResults([]);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (id: string) => {
      selectNote(id);
      handleClose();
    },
    [selectNote, handleClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex].id);
      }
    },
    [handleClose, results, selectedIndex, handleSelect]
  );

  const formatDate = useMemo(
    () => (date: Date) => {
      const diff = (Date.now() - date.getTime()) / 1000 / 60;
      if (diff < 60) return `${Math.floor(diff)}m ago`;
      const hours = diff / 60;
      if (hours < 24) return `${Math.floor(hours)}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    },
    []
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 outline-none text-sm bg-transparent"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={14} className="text-slate-400" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {isSearching && (
            <div className="p-4 text-center text-slate-400 text-sm">
              Searching...
            </div>
          )}

          {!isSearching && results.length === 0 && query && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No results found for "{query}"
            </div>
          )}

          {!isSearching && !query && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Type to search notes...
            </div>
          )}

          {results.map((note, index) => (
            <button
              key={note.id}
              onClick={() => handleSelect(note.id)}
              className={`w-full px-4 py-3 flex items-start gap-3 text-left cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <FileText
                size={16}
                className={`mt-0.5 shrink-0 ${
                  index === selectedIndex ? "text-blue-500" : "text-slate-400"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-medium truncate ${
                    index === selectedIndex ? "text-blue-700" : "text-slate-900"
                  }`}
                >
                  {note.title || "Untitled"}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{formatDate(note.updatedAt)}</span>
                  {note.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="truncate">{note.tags.slice(0, 2).join(", ")}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-500 line-clamp-1 mt-1">
                  {note.content.replace(/[#*`[\]]/g, "").substring(0, 80)}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 flex items-center gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px]">↑↓</kbd>{" "}
            Navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px]">Enter</kbd>{" "}
            Select
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px]">Esc</kbd>{" "}
            Close
          </span>
        </div>
      </div>
    </>
  );
}
