"use client";

import { ChevronRight, ChevronDown, Folder, File, Loader2 } from "lucide-react";
import { useState } from "react";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

interface FolderTreeViewProps {
  nodes: TreeNode[];
  isLoading?: boolean;
  error?: string;
}

function TreeNodeItem({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 1);

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 px-2 hover:bg-slate-100 rounded cursor-pointer text-sm"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => node.isDirectory && setIsExpanded(!isExpanded)}
      >
        {node.isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            ) : (
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
            )}
            <Folder size={14} className="text-amber-500 shrink-0" />
          </>
        ) : (
          <>
            <span className="w-[14px] shrink-0" />
            <File size={14} className="text-slate-400 shrink-0" />
          </>
        )}
        <span className="text-slate-700 truncate" title={node.name}>
          {node.name}
        </span>
      </div>

      {node.isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTreeView({
  nodes,
  isLoading,
  error,
}: FolderTreeViewProps) {
  if (isLoading) {
    return (
      <div className="p-6 text-sm text-slate-500 text-center flex items-center justify-center gap-2 border border-slate-200 rounded-lg bg-slate-50">
        <Loader2 size={16} className="animate-spin" />
        Loading folder structure...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-500 text-center border border-red-200 rounded-lg bg-red-50">
        {error}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="p-6 text-sm text-slate-500 text-center border border-slate-200 rounded-lg bg-slate-50">
        No workspace selected or folder is empty
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto bg-white">
      {nodes.map((node) => (
        <TreeNodeItem key={node.path} node={node} />
      ))}
    </div>
  );
}
