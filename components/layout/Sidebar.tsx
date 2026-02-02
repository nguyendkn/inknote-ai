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
            flex items-center px-3 py-1.5 cursor-pointer text-sm select-none group
            ${isSelected ? "bg-sidebar-active text-white" : "text-gray-400 hover:bg-sidebar-hover hover:text-gray-200"}
          `}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => onSelectNotebook(item.id)}
        >
          {/* Arrow */}
          <div
            className="w-4 h-4 mr-1 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            onClick={(e) => hasChildren && toggleExpand(item.id, e)}
          >
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              ))}
          </div>

          {/* Icon */}
          <div className="mr-2">
            {item.icon ? item.icon : <Folder size={16} />}
          </div>

          {/* Name */}
          <span className="truncate">{item.name}</span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {item.children!.map((child) =>
              renderNotebookItem(child, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-sidebar flex flex-col h-full text-gray-300 font-sans border-r border-black select-none">
      {/* App Branding / Header */}
      <div className="flex items-center px-5 py-5 pb-2 mb-2">
        <Logo className="w-6 h-6 mr-3 text-accent" />
        <span className="font-bold text-lg tracking-tight text-white">
          InkNote <span className="text-accent font-light">AI</span>
        </span>
      </div>

      {/* Top Section */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-2">
        {/* Special Folders */}
        <div className="mb-4">
          <div
            className={`flex items-center px-3 py-1.5 cursor-pointer text-sm hover:bg-sidebar-hover mx-2 rounded-md ${!selectedNotebookId ? "bg-sidebar-active text-white" : "text-gray-300"}`}
            onClick={() => onSelectNotebook("all")}
          >
            <FileText size={16} className="mr-2" />
            <span>All Notes (100)</span>
          </div>
          <div className="flex items-center px-3 py-1.5 cursor-pointer text-sm hover:bg-sidebar-hover mx-2 rounded-md text-gray-300">
            <Pin size={16} className="mr-2" />
            <span>Pinned Notes (1)</span>
          </div>
        </div>

        {/* Notebooks Header */}
        <div className="px-4 py-1 text-xs font-semibold text-gray-500 flex items-center justify-between uppercase tracking-wider mb-1">
          <span>Notebooks</span>
          <Plus size={14} className="cursor-pointer hover:text-gray-300" />
        </div>

        {/* Notebook Tree */}
        <div className="mb-6">
          {notebooks.map((nb) => renderNotebookItem(nb))}
        </div>

        {/* Trash */}
        <div className="px-2 mt-4">
          <div className="flex items-center px-3 py-1.5 cursor-pointer text-sm hover:bg-sidebar-hover rounded-md text-gray-400">
            <Trash2 size={16} className="mr-2" />
            <span>Trash</span>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-6 px-4">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Status
          </div>
          <div className="flex items-center py-1.5 text-sm text-gray-300">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2 border border-green-600"></span>
            Active (10)
          </div>
          <div className="flex items-center py-1.5 text-sm text-gray-300">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2 border border-orange-600"></span>
            On Hold (6)
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700 bg-sidebar-hover/30">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full border border-gray-600 mr-3 bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            D
          </div>
          <span className="text-sm font-medium text-gray-200">
            Dao Khoi Nguyen
          </span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
