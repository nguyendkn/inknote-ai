"use client";

import { generateNoteContent } from "@/lib/services/gemini-service";
import { Note } from "@/types/note";
import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import { PenLine, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useRef, useCallback, useMemo } from "react";
import { ImageUploadModal } from "./ImageUploadModal";
import { CodeBlockRenderer, PreBlockRenderer } from "./CodeBlockRenderer";
import { TagEditor } from "@/components/notes/TagEditor";
import { SaveIndicator } from "@/components/ui/SaveIndicator";

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Import commands
import * as commands from "@uiw/react-md-editor/commands";
import type { ICommand, TextAreaTextApi } from "@uiw/react-md-editor/commands";

interface EditorProps {
  note: Note | undefined;
  onUpdateNote: (updatedNote: Note) => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function Editor({
  note,
  onUpdateNote,
  isSaving = false,
  lastSaved = null,
}: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Ref to store editor API for inserting content
  const editorApiRef = useRef<TextAreaTextApi | null>(null);

  // Handle tag changes
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      if (note) {
        onUpdateNote({ ...note, tags, updatedAt: new Date() });
      }
    },
    [note, onUpdateNote]
  );

  // Handle image insert from modal - receives file path instead of base64
  const handleImageInsert = useCallback(
    (imagePath: string, altText: string) => {
      // Escape brackets in alt text for markdown
      const safeAltText = altText.replace(/[[\]]/g, "");
      const markdown = `![${safeAltText}](${imagePath})`;

      if (editorApiRef.current) {
        editorApiRef.current.replaceSelection(markdown);
      } else if (note) {
        // Fallback: append to content if API ref not available
        onUpdateNote({
          ...note,
          content: note.content + "\n\n" + markdown,
          updatedAt: new Date(),
        });
      }
      setShowImageModal(false);
    },
    [note, onUpdateNote]
  );

  // Create custom image command
  const customCommands = useMemo(() => {
    const createCustomImageCommand = (): ICommand => ({
      name: "image",
      keyCommand: "image",
      shortcuts: "ctrlcmd+k",
      buttonProps: { "aria-label": "Insert image", title: "Insert image" },
      icon: (
        <svg width="13" height="13" viewBox="0 0 20 20">
          <path
            fill="currentColor"
            d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"
          />
        </svg>
      ),
      execute: (_state, api) => {
        // Store API ref for later use
        editorApiRef.current = api;
        // Open custom modal instead of default behavior
        setShowImageModal(true);
      },
    });

    return {
      customImage: createCustomImageCommand(),
    };
  }, []);

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
        {/* Title + Save Status Row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <input
            type="text"
            value={note.title}
            onChange={(e) =>
              onUpdateNote({ ...note, title: e.target.value, updatedAt: new Date() })
            }
            className="text-xl md:text-2xl font-bold text-slate-900 flex-1 outline-none placeholder-slate-300 bg-transparent focus:placeholder-slate-400 transition-colors"
            placeholder="Note Title"
          />
          <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        </div>

        {/* Tags + AI Button Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <TagEditor tags={note.tags} onChange={handleTagsChange} />
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
          previewOptions={{
            components: {
              code: CodeBlockRenderer,
              pre: PreBlockRenderer,
            },
          }}
          commands={[
            // Use built-in commands but override image
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.hr,
            commands.title,
            commands.divider,
            commands.link,
            customCommands.customImage,
            commands.quote,
            commands.code,
            commands.codeBlock,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
          ]}
        />
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        noteId={note.id}
        onClose={() => setShowImageModal(false)}
        onInsert={handleImageInsert}
      />

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
