"use client";

import { useEffect, useState, useCallback } from "react";
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

  // Check if running in Electron
  const isElectron = typeof window !== "undefined" && !!window.electronAPI?.workspace;

  // New state for workspace
  const [workspacePath, setWorkspacePath] = useState("");
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState("");

  // Load tree when workspace path changes
  const loadTree = useCallback(async (path: string) => {
    if (typeof window === "undefined" || !window.electronAPI?.workspace) return;

    setTreeLoading(true);
    setTreeError("");
    try {
      const nodes = await window.electronAPI.workspace.readTree(path);
      setTreeNodes(nodes);
    } catch (error) {
      setTreeError("Failed to read folder structure");
      console.error("Failed to load tree:", error);
    } finally {
      setTreeLoading(false);
    }
  }, []);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      if (typeof window === "undefined" || !window.electronAPI?.config) return;

      try {
        const config = await window.electronAPI.config.read();
        setWorkspacePath(config.workspace.path);
        setDefaultNotebook(config.workspace.defaultNotebook);

        // Load tree if workspace path exists
        if (config.workspace.path) {
          loadTree(config.workspace.path);
        }
      } catch (error) {
        console.error("Failed to load config:", error);
      }
    };

    loadConfig();
  }, [loadTree]);

  const handleBrowse = async (): Promise<string | null> => {
    if (typeof window === "undefined" || !window.electronAPI?.workspace?.openFolderDialog) {
      console.warn("Electron workspace API not available");
      return null;
    }
    return window.electronAPI.workspace.openFolderDialog();
  };

  const handleWorkspaceChange = async (path: string) => {
    setWorkspacePath(path);

    // Load tree for new path
    loadTree(path);

    // Save to config
    if (typeof window !== "undefined" && window.electronAPI?.config) {
      try {
        const config = await window.electronAPI.config.read();
        config.workspace.path = path;
        await window.electronAPI.config.write(config);
      } catch (error) {
        console.error("Failed to save workspace path:", error);
      }
    }
  };

  const handleDefaultNotebookChange = async (value: string) => {
    setDefaultNotebook(value);

    // Save to config
    if (typeof window !== "undefined" && window.electronAPI?.config) {
      try {
        const config = await window.electronAPI.config.read();
        config.workspace.defaultNotebook = value;
        await window.electronAPI.config.write(config);
      } catch (error) {
        console.error("Failed to save default notebook:", error);
      }
    }
  };

  return (
    <div>
      {/* Storage Location Section */}
      <SettingsSection
        title="Storage Location"
        description="Choose where your notes are saved"
      >
        {isElectron ? (
          <WorkspacePathInput
            value={workspacePath}
            onChange={handleWorkspaceChange}
            onBrowse={handleBrowse}
          />
        ) : (
          <div className="p-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg">
            Workspace configuration is only available in the desktop app.
          </div>
        )}
      </SettingsSection>

      {/* Folder Preview Section */}
      <SettingsSection
        title="Folder Preview"
        description="View your workspace folder structure"
      >
        {isElectron ? (
          <FolderTreeView
            nodes={treeNodes}
            isLoading={treeLoading}
            error={treeError}
          />
        ) : (
          <div className="p-4 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
            Folder preview is only available in the desktop app.
          </div>
        )}
      </SettingsSection>

      {/* Defaults Section */}
      <SettingsSection
        title="Defaults"
        description="Set default workspace behavior"
      >
        <SettingsSelect
          label="Default Notebook"
          description="Where new notes are created"
          value={defaultNotebook}
          onChange={handleDefaultNotebookChange}
          options={[
            { value: "inbox", label: "Inbox" },
            { value: "ideas", label: "Ideas" },
            { value: "work", label: "Work" },
            { value: "personal", label: "Personal" },
          ]}
        />
        <SettingsSelect
          label="Sort Order"
          description="Default note sorting"
          value={sortOrder}
          onChange={setSortOrder}
          options={[
            { value: "modified", label: "Last Modified" },
            { value: "created", label: "Date Created" },
            { value: "alpha", label: "Alphabetical" },
          ]}
        />
      </SettingsSection>

      {/* View Section */}
      <SettingsSection
        title="View"
        description="Customize note list appearance"
      >
        <SettingsSelect
          label="View Mode"
          description="How notes are displayed"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: "list", label: "List" },
            { value: "grid", label: "Grid" },
            { value: "compact", label: "Compact" },
          ]}
        />
        <SettingsToggle
          label="Show Previews"
          description="Display note content previews in list"
          checked={showPreviews}
          onChange={setShowPreviews}
        />
      </SettingsSection>

      {/* Confirmations Section */}
      <SettingsSection
        title="Confirmations"
        description="Control confirmation dialogs"
      >
        <SettingsToggle
          label="Confirm Delete"
          description="Ask before deleting notes"
          checked={confirmDelete}
          onChange={setConfirmDelete}
        />
      </SettingsSection>
    </div>
  );
}
