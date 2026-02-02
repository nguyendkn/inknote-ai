"use client";

import { generateNoteContent } from "@/lib/services/gemini-service";
import { Note } from "@/types/note";
import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import { PenLine, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorProps {
  note: Note | undefined;
  onUpdateNote: (updatedNote: Note) => void;
}

export function Editor({ note, onUpdateNote }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);

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
      {/* Note Header */}
      <div className="px-4 md:px-6 pt-4 pb-3 border-b border-slate-100 shrink-0">
        {/* Title Input */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote({ ...note, title: e.target.value })}
          className="text-xl md:text-2xl font-bold text-slate-900 w-full outline-none placeholder-slate-300 bg-transparent mb-3 focus:placeholder-slate-400 transition-colors"
          placeholder="Note Title"
        />

        {/* Tags + AI Button Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 flex-1">
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

          {/* AI Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer shadow-lg shadow-purple-500/20 shrink-0"
          >
            <Sparkles size={14} />
            <span>AI Assist</span>
          </button>
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="flex-1 overflow-hidden" data-color-mode="light">
        <MDEditor
          value={note.content}
          onChange={(value) =>
            onUpdateNote({
              ...note,
              content: value || "",
              updatedAt: new Date(),
            })
          }
          height="100%"
          preview="live"
          hideToolbar={false}
          enableScroll={true}
          visibleDragbar={false}
          className="border-none! shadow-none!"
          style={{
            height: "100%",
          }}
        />
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
