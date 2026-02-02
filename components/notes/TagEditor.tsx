"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagEditor({ tags, onChange }: TagEditorProps) {
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addTag = useCallback(() => {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
    setIsAdding(false);
  }, [input, tags, onChange]);

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag();
      } else if (e.key === "Escape") {
        setIsAdding(false);
        setInput("");
      } else if (e.key === "Backspace" && !input && tags.length > 0) {
        // Remove last tag on backspace if input is empty
        removeTag(tags.length - 1);
      }
    },
    [addTag, input, tags.length, removeTag]
  );

  const handleBlur = useCallback(() => {
    if (input.trim()) {
      addTag();
    } else {
      setIsAdding(false);
    }
  }, [input, addTag]);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="group bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors hover:bg-blue-100"
        >
          {tag}
          <button
            onClick={() => removeTag(idx)}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-blue-800"
            aria-label={`Remove tag ${tag}`}
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
          onBlur={handleBlur}
          placeholder="Tag name..."
          className="text-xs px-2.5 py-1 border border-blue-300 rounded-lg outline-none w-28 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs text-slate-400 hover:text-blue-500 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer font-medium transition-colors"
        >
          + Add tag
        </button>
      )}
    </div>
  );
}
