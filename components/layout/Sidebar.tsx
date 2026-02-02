"use client";

import { Logo } from "@/components/icons/Logo";
import { Notebook } from "@/types/notebook";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  notebooks: Notebook[];
  selectedNotebookId: string | null;
  onSelectNotebook: (id: string) => void;
}

export function Sidebar({
  notebooks,
  selectedNotebookId,
  onSelectNotebook,
}: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "awesome-saas": true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
            {item.icon ? item.icon : <Folder size={16} />}
          </div>

          {/* Name */}
          <span className="truncate font-medium">{item.name}</span>
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
              100
            </span>
          </div>
          <div className="flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-sidebar-hover rounded-lg text-zinc-400 hover:text-zinc-200 transition-all duration-200 mt-1">
            <Pin size={16} className="mr-2.5 text-zinc-500" />
            <span className="font-medium">Pinned Notes</span>
            <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              1
            </span>
          </div>
        </div>

        {/* Notebooks Header */}
        <div className="px-4 py-2 text-xs font-semibold text-zinc-500 flex items-center justify-between uppercase tracking-wider">
          <span>Notebooks</span>
          <Plus
            size={14}
            className="cursor-pointer hover:text-zinc-300 transition-colors duration-150"
          />
        </div>

        {/* Notebook Tree */}
        <div className="mb-6">
          {notebooks.map((nb) => renderNotebookItem(nb))}
        </div>

        {/* Trash */}
        <div className="px-2 mt-4">
          <div className="flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-sidebar-hover rounded-lg text-zinc-500 hover:text-zinc-300 transition-all duration-200">
            <Trash2 size={16} className="mr-2.5" />
            <span className="font-medium">Trash</span>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-6 px-4">
          <div className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
            Status
          </div>
          <div className="flex items-center py-1.5 text-sm text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 shadow-lg shadow-emerald-500/30"></span>
            Active (10)
          </div>
          <div className="flex items-center py-1.5 text-sm text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2.5 shadow-lg shadow-amber-500/30"></span>
            On Hold (6)
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/50">
        <div className="flex items-center cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold mr-3 shadow-lg shadow-purple-500/20 ring-2 ring-zinc-800 group-hover:ring-zinc-700 transition-all duration-200">
            D
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-zinc-200 truncate block group-hover:text-white transition-colors duration-200">
              Dao Khoi Nguyen
            </span>
            <span className="text-xs text-zinc-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
