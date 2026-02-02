"use client";

import { useState } from "react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Sparkles,
  Eye,
  PenLine,
} from "lucide-react";
import { Note } from "@/types/note";
import { generateNoteContent } from "@/lib/services/gemini-service";
import ReactMarkdown from "react-markdown";

interface EditorProps {
  note: Note | undefined;
  onUpdateNote: (updatedNote: Note) => void;
}

export function Editor({ note, onUpdateNote }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-400">
        Select a note to view
      </div>
    );
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);

    try {
      const newContent = await generateNoteContent(aiPrompt, note.content);

      onUpdateNote({
        ...note,
        content: note.content + "\n\n" + newContent,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("AI generation failed:", error);
    }

    setIsGenerating(false);
    setShowAiModal(false);
    setAiPrompt("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white font-sans min-w-0">
      {/* Note Header / Meta */}
      <div className="px-8 pt-6 pb-2">
        {/* Title Input */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote({ ...note, title: e.target.value })}
          className="text-3xl font-bold text-gray-900 w-full outline-none placeholder-gray-300 bg-transparent mb-4"
          placeholder="Note Title"
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              {tag}
            </span>
          ))}
          <button className="text-xs text-gray-400 hover:text-gray-600 px-1">
            + Add tag
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
          <div className="flex items-center space-x-1 text-gray-400">
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Strikethrough"
            >
              <span className="line-through text-xs font-serif font-bold px-1">
                S
              </span>
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Link"
            >
              <LinkIcon size={16} />
            </button>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="List"
            >
              <List size={16} />
            </button>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Ordered List"
            >
              <ListOrdered size={16} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Quote"
            >
              <Quote size={16} />
            </button>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Code"
            >
              <Code size={16} />
            </button>
            <button
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Image"
            >
              <ImageIcon size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <button
              onClick={() =>
                setViewMode(viewMode === "edit" ? "preview" : "edit")
              }
              className="flex items-center space-x-1 text-xs font-medium text-gray-500 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-200"
            >
              {viewMode === "edit" ? <Eye size={14} /> : <PenLine size={14} />}
              <span>{viewMode === "edit" ? "Preview" : "Edit"}</span>
            </button>

            {/* AI Button */}
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center space-x-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
            >
              <Sparkles size={14} />
              <span>AI Assist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 relative">
        {viewMode === "edit" ? (
          <textarea
            className="w-full h-full resize-none outline-none text-gray-800 font-mono text-sm leading-relaxed"
            value={note.content}
            onChange={(e) => onUpdateNote({ ...note, content: e.target.value })}
            placeholder="Start writing..."
          />
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:text-gray-800 font-sans">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="absolute top-20 right-8 w-80 bg-white shadow-xl border border-gray-200 rounded-lg p-4 z-10 animate-fade-in">
          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
            <Sparkles size={14} className="text-purple-500 mr-2" />
            Ask Gemini
          </h4>
          <textarea
            className="w-full text-sm border border-gray-300 rounded p-2 mb-2 focus:border-purple-500 outline-none"
            rows={3}
            placeholder="Summarize this note, or write a paragraph about..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAiModal(false)}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isGenerating ? "Thinking..." : "Generate"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Editor;
