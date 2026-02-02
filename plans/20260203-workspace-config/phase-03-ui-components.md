# Phase 03: UI Components

## Context Links
- **Parent Plan**: [plan.md](plan.md)
- **Previous Phase**: [phase-02-electron-ipc.md](phase-02-electron-ipc.md)
- **Next Phase**: [phase-04-integration.md](phase-04-integration.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Description | Cập nhật WorkspaceTab với folder picker và tree view component |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

1. WorkspaceTab hiện có: defaultNotebook, sortOrder, viewMode, showPreviews, confirmDelete
2. Cần thêm: workspace path input, Browse button, tree view
3. UI primitives đã có: SettingsSection, SettingsSelect, SettingsToggle
4. Cần tạo mới: WorkspacePathInput, FolderTreeView components

## Requirements

### Functional
- Input field hiển thị workspace path hiện tại
- Button "Browse" mở folder picker dialog
- Tree view hiển thị cấu trúc thư mục workspace
- Lưu config khi user thay đổi workspace path

### Non-Functional
- Responsive UI
- Loading state khi đọc directory tree
- Error state khi path không hợp lệ
- Consistent với design system hiện tại

## Architecture

```
WorkspaceTab
├── SettingsSection (Storage Location)
│   └── WorkspacePathInput
│       ├── Input (readonly, shows path)
│       └── Button (Browse)
│
├── SettingsSection (Folder Preview)
│   └── FolderTreeView
│       ├── TreeNode (folder)
│       │   └── TreeNode (nested)
│       └── TreeNode (file)
│
└── SettingsSection (Defaults) [existing]
    └── ...existing content...
```

## Related Code Files

| File | Action | Description |
|------|--------|-------------|
| `components/settings/tabs/WorkspaceTab.tsx` | Modify | Thêm workspace path section |
| `components/settings/ui/WorkspacePathInput.tsx` | Create | Path input + Browse button |
| `components/settings/ui/FolderTreeView.tsx` | Create | Tree view component |

## Implementation Steps

### Step 1: Create WorkspacePathInput Component

```tsx
// components/settings/ui/WorkspacePathInput.tsx
"use client";

import { FolderOpen } from "lucide-react";
import { useState } from "react";

interface WorkspacePathInputProps {
  value: string;
  onChange: (path: string) => void;
  onBrowse: () => Promise<string | null>;
}

export function WorkspacePathInput({
  value,
  onChange,
  onBrowse,
}: WorkspacePathInputProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBrowse = async () => {
    setIsLoading(true);
    try {
      const selectedPath = await onBrowse();
      if (selectedPath) {
        onChange(selectedPath);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value || "No workspace selected"}
        readOnly
        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 truncate"
        title={value}
      />
      <button
        onClick={handleBrowse}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <FolderOpen size={16} />
        {isLoading ? "Opening..." : "Browse"}
      </button>
    </div>
  );
}
```

### Step 2: Create FolderTreeView Component

```tsx
// components/settings/ui/FolderTreeView.tsx
"use client";

import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
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
              <ChevronDown size={14} className="text-slate-400" />
            ) : (
              <ChevronRight size={14} className="text-slate-400" />
            )}
            <Folder size={14} className="text-amber-500" />
          </>
        ) : (
          <>
            <span className="w-[14px]" />
            <File size={14} className="text-slate-400" />
          </>
        )}
        <span className="text-slate-700 truncate">{node.name}</span>
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

export function FolderTreeView({ nodes, isLoading, error }: FolderTreeViewProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-sm text-slate-500 text-center">
        Loading folder structure...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500 text-center">
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
```

### Step 3: Update WorkspaceTab

```tsx
// components/settings/tabs/WorkspaceTab.tsx
"use client";

import { useEffect, useState } from "react";
import { SettingsSection } from "../ui/SettingsSection";
import { SettingsSelect } from "../ui/SettingsSelect";
import { SettingsToggle } from "../ui/SettingsToggle";
import { WorkspacePathInput } from "../ui/WorkspacePathInput";
import { FolderTreeView } from "../ui/FolderTreeView";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

export function WorkspaceTab() {
  // Existing state
  const [defaultNotebook, setDefaultNotebook] = useState("inbox");
  const [sortOrder, setSortOrder] = useState("modified");
  const [viewMode, setViewMode] = useState("list");
  const [showPreviews, setShowPreviews] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);

  // New state for workspace
  const [workspacePath, setWorkspacePath] = useState("");
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState("");

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Load tree when workspace path changes
  useEffect(() => {
    if (workspacePath) {
      loadTree(workspacePath);
    }
  }, [workspacePath]);

  const loadConfig = async () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      const config = await window.electronAPI.config.read();
      setWorkspacePath(config.workspace.path);
      setDefaultNotebook(config.workspace.defaultNotebook);
    }
  };

  const loadTree = async (path: string) => {
    if (typeof window === "undefined" || !window.electronAPI) return;

    setTreeLoading(true);
    setTreeError("");
    try {
      const nodes = await window.electronAPI.workspace.readTree(path);
      setTreeNodes(nodes);
    } catch (error) {
      setTreeError("Failed to read folder structure");
    } finally {
      setTreeLoading(false);
    }
  };

  const handleBrowse = async (): Promise<string | null> => {
    if (typeof window === "undefined" || !window.electronAPI) return null;
    return window.electronAPI.workspace.openFolderDialog();
  };

  const handleWorkspaceChange = async (path: string) => {
    setWorkspacePath(path);

    // Save to config
    if (typeof window !== "undefined" && window.electronAPI) {
      const config = await window.electronAPI.config.read();
      config.workspace.path = path;
      await window.electronAPI.config.write(config);
    }
  };

  return (
    <div>
      {/* NEW: Storage Location Section */}
      <SettingsSection
        title="Storage Location"
        description="Choose where your notes are saved"
      >
        <WorkspacePathInput
          value={workspacePath}
          onChange={handleWorkspaceChange}
          onBrowse={handleBrowse}
        />
      </SettingsSection>

      {/* NEW: Folder Preview Section */}
      <SettingsSection
        title="Folder Preview"
        description="View your workspace folder structure"
      >
        <FolderTreeView
          nodes={treeNodes}
          isLoading={treeLoading}
          error={treeError}
        />
      </SettingsSection>

      {/* Existing sections... */}
      <SettingsSection
        title="Defaults"
        description="Set default workspace behavior"
      >
        {/* ...existing content... */}
      </SettingsSection>

      {/* ...rest of existing sections... */}
    </div>
  );
}
```

## Todo List

- [ ] Create WorkspacePathInput component
- [ ] Create FolderTreeView component
- [ ] Create TreeNodeItem sub-component
- [ ] Update WorkspaceTab với new sections
- [ ] Add config loading on mount
- [ ] Add tree loading when path changes
- [ ] Handle web environment (non-Electron)
- [ ] Style components với Tailwind

## Success Criteria

1. ✅ Path input hiển thị workspace path hiện tại
2. ✅ Browse button mở folder picker
3. ✅ Tree view hiển thị folder structure
4. ✅ Expand/collapse folders hoạt động
5. ✅ Config được save khi thay đổi path
6. ✅ Loading và error states hiển thị đúng

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large folder structure slow | Medium | Limit depth, lazy loading |
| Non-Electron environment | Low | Check window.electronAPI |
| Long path names | Low | Truncate với ellipsis |

## Security Considerations

1. **Read-only input**: User không thể type path thủ công (chỉ Browse)
2. **No path execution**: Tree view chỉ display, không execute
3. **Sanitize display**: Escape special characters trong file names

## Next Steps

→ Tiếp tục với [Phase 04: Integration](phase-04-integration.md)

---

*Last Updated: 2026-02-03*
