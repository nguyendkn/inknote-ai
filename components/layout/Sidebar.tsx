"use client";

import { Logo } from "@/components/icons/Logo";
import { Notebook } from "@/types/notebook";
import { useNotebooks } from "@/lib/contexts/NotebooksContext";
import { CreateNotebookModal } from "@/components/notes/CreateNotebookModal";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Pin,
  Plus,
  Settings,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState, useCallback } from "react";

interface SidebarProps {
  selectedNotebookId: string | null;
  onSelectNotebook: (id: string) => void;
  onOpenSettings?: () => void;
  notesCount?: number;
  pinnedCount?: number;
}

export function Sidebar({
  selectedNotebookId,
  onSelectNotebook,
  onOpenSettings,
  notesCount = 0,
  pinnedCount = 0,
}: SidebarProps) {
  const { notebooks, isLoading, createNotebook } = useNotebooks();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateNotebook = useCallback(async (input: Parameters<typeof createNotebook>[0]) => {
    await createNotebook(input);
  }, [createNotebook]);

  const handleOpenCreateModal = useCallback((parentId: string | null = null) => {
    setCreateParentId(parentId);
    setShowCreateModal(true);
  }, []);

  const renderNotebookItem = (item: Notebook, depth: number = 0) => {
    const isExpanded = expanded[item.id];
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = selectedNotebookId === item.id;

    return (
      <div key={item.id}>
        <div
          className={`
            flex items-center px-3 py-2 cursor-pointer text-sm select-none group
            transition-all duration-200 ease-out mx-2 rounded-lg
            ${
              isSelected
                ? "bg-sidebar-active text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                : "text-zinc-400 hover:bg-sidebar-hover hover:text-zinc-200"
            }
          `}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => onSelectNotebook(item.id)}
        >
          {/* Arrow */}
          <div
            className={`
              w-5 h-5 mr-1.5 flex items-center justify-center rounded
              transition-colors duration-150
              ${hasChildren ? "hover:bg-white/10 cursor-pointer" : ""}
            `}
            onClick={(e) => hasChildren && toggleExpand(item.id, e)}
          >
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown size={14} className="text-zinc-500" />
              ) : (
                <ChevronRight size={14} className="text-zinc-500" />
              ))}
          </div>

          {/* Icon */}
          <div
            className={`mr-2.5 transition-colors duration-200 ${isSelected ? "text-accent" : "text-zinc-500 group-hover:text-zinc-400"}`}
          >
            <Folder size={16} />
          </div>

          {/* Name */}
          <span className="truncate font-medium flex-1">{item.name}</span>

          {/* Add child button on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCreateModal(item.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
            title="Thêm notebook con"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {item.children!.map((child) =>
              renderNotebookItem(child, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-sidebar flex flex-col h-full text-zinc-300 font-sans border-r border-zinc-800/50 select-none">
      {/* App Branding / Header */}
      <div className="flex items-center px-5 py-5 pb-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
          <Logo className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">
          InkNote <span className="text-blue-400 font-normal">AI</span>
        </span>
      </div>

      {/* Top Section */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-2">
        {/* Special Folders */}
        <div className="mb-4 px-2">
          <div
            className={`
              flex items-center px-3 py-2 cursor-pointer text-sm rounded-lg
              transition-all duration-200
              ${
                !selectedNotebookId || selectedNotebookId === "all"
                  ? "bg-sidebar-active text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "text-zinc-400 hover:bg-sidebar-hover hover:text-zinc-200"
              }
            `}
            onClick={() => onSelectNotebook("all")}
          >
            <FileText size={16} className="mr-2.5 text-zinc-500" />
            <span className="font-medium">All Notes</span>
            <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              {notesCount}
            </span>
          </div>
          <div
            className={`
              flex items-center px-3 py-2 cursor-pointer text-sm rounded-lg mt-1
              transition-all duration-200
              ${
                selectedNotebookId === "pinned"
                  ? "bg-sidebar-active text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "text-zinc-400 hover:bg-sidebar-hover hover:text-zinc-200"
              }
            `}
            onClick={() => onSelectNotebook("pinned")}
          >
            <Pin size={16} className="mr-2.5 text-zinc-500" />
            <span className="font-medium">Pinned Notes</span>
            <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              {pinnedCount}
            </span>
          </div>
        </div>

        {/* Notebooks Header */}
        <div className="px-4 py-2 text-xs font-semibold text-zinc-500 flex items-center justify-between uppercase tracking-wider">
          <span>Notebooks</span>
          <button
            onClick={() => handleOpenCreateModal(null)}
            className="hover:text-zinc-300 transition-colors duration-150 p-0.5 rounded hover:bg-zinc-700"
            title="Tạo notebook mới"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Notebook Tree */}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-zinc-500" />
            </div>
          ) : notebooks.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-zinc-500 text-sm mb-3">Chưa có notebook nào</p>
              <button
                onClick={() => handleOpenCreateModal(null)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1.5 mx-auto"
              >
                <Plus size={14} />
                Tạo notebook đầu tiên
              </button>
            </div>
          ) : (
            notebooks.map((nb) => renderNotebookItem(nb))
          )}
        </div>

        {/* Trash */}
        <div className="px-2 mt-4">
          <div className="flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-sidebar-hover rounded-lg text-zinc-500 hover:text-zinc-300 transition-all duration-200">
            <Trash2 size={16} className="mr-2.5" />
            <span className="font-medium">Trash</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/50">
        <div
          className="flex items-center cursor-pointer group"
          onClick={onOpenSettings}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onOpenSettings?.()}
          aria-label="Open settings"
        >
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold mr-3 shadow-lg ring-2 ring-zinc-800 group-hover:ring-zinc-700 transition-all duration-200">
            D
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-zinc-200 truncate block group-hover:text-white transition-colors duration-200">
              Dao Khoi Nguyen
            </span>
            <span className="text-xs text-zinc-500">Pro Plan</span>
          </div>
          <div className="p-1.5 rounded-lg text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-800 transition-all duration-150">
            <Settings size={16} />
          </div>
        </div>
      </div>

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNotebook}
        parentId={createParentId}
      />
    </div>
  );
}

export default Sidebar;
