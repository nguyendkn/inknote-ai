"use client";

import { generateNoteContent } from "@/lib/services/gemini-service";
import { Note } from "@/types/note";
import {
  Bold,
  Code,
  Eye,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  PenLine,
  Quote,
  Sparkles,
  Strikethrough,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface EditorProps {
  note: Note | undefined;
  onUpdateNote: (updatedNote: Note) => void;
}

// Toolbar button component - defined outside Editor to avoid recreation on each render
const ToolbarButton = ({
  icon: Icon,
  title,
  active = false,
}: {
  icon: React.ElementType;
  title: string;
  active?: boolean;
}) => (
  <button
    className={`
      p-2 rounded-lg transition-all duration-150 cursor-pointer
      ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
      }
    `}
    title={title}
  >
    <Icon size={16} />
  </button>
);

export function Editor({ note, onUpdateNote }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-slate-400 font-medium">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <PenLine size={28} className="text-slate-300" />
          </div>
          <p>Select a note to view</p>
        </div>
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
      <div className="px-8 pt-6 pb-2 border-b border-slate-100">
        {/* Title Input */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote({ ...note, title: e.target.value })}
          className="text-3xl font-bold text-slate-900 w-full outline-none placeholder-slate-300 bg-transparent mb-4 focus:placeholder-slate-400 transition-colors"
          placeholder="Note Title"
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
          <button className="text-xs text-slate-400 hover:text-blue-500 px-2 py-1 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-pointer font-medium">
            + Add tag
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-0.5">
            <ToolbarButton icon={Bold} title="Bold" />
            <ToolbarButton icon={Italic} title="Italic" />
            <ToolbarButton icon={Strikethrough} title="Strikethrough" />

            <div className="w-px h-5 bg-slate-200 mx-2"></div>

            <ToolbarButton icon={Heading1} title="Heading 1" />
            <ToolbarButton icon={Heading2} title="Heading 2" />

            <div className="w-px h-5 bg-slate-200 mx-2"></div>

            <ToolbarButton icon={LinkIcon} title="Link" />
            <ToolbarButton icon={List} title="List" />
            <ToolbarButton icon={ListOrdered} title="Ordered List" />

            <div className="w-px h-5 bg-slate-200 mx-2"></div>

            <ToolbarButton icon={Quote} title="Quote" />
            <ToolbarButton icon={Code} title="Code" />
            <ToolbarButton icon={ImageIcon} title="Image" />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <button
              onClick={() =>
                setViewMode(viewMode === "edit" ? "preview" : "edit")
              }
              className={`
                flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                transition-all duration-200 cursor-pointer
                ${
                  viewMode === "preview"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }
              `}
            >
              {viewMode === "edit" ? <Eye size={14} /> : <PenLine size={14} />}
              <span>{viewMode === "edit" ? "Preview" : "Edit"}</span>
            </button>

            {/* AI Button */}
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer shadow-lg shadow-purple-500/20"
            >
              <Sparkles size={14} />
              <span>AI Assist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 relative">
        {viewMode === "edit" ? (
          <textarea
            className="w-full h-full resize-none outline-none text-slate-800 font-mono text-sm leading-relaxed placeholder-slate-300"
            value={note.content}
            onChange={(e) => onUpdateNote({ ...note, content: e.target.value })}
            placeholder="Start writing..."
          />
        ) : (
          <div className="prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-code:text-pink-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-800 font-sans">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowAiModal(false)}
          />

          {/* Modal */}
          <div className="absolute top-24 right-8 w-96 bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200 rounded-2xl p-5 z-50 animate-fade-in">
            <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-3">
                <Sparkles size={16} className="text-white" />
              </div>
              Ask Gemini AI
            </h4>
            <textarea
              className="w-full text-sm border border-slate-200 rounded-xl p-3 mb-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all duration-200"
              rows={3}
              placeholder="Summarize this note, expand on a topic, or ask anything..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="text-sm bg-linear-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer font-medium shadow-lg shadow-purple-500/20"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </span>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Editor;
