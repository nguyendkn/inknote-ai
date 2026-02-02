import { contextBridge, ipcRenderer } from "electron";

// Update status types (must match updater.ts)
type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "not-available"
  | "downloading"
  | "ready"
  | "error";

interface UpdateState {
  status: UpdateStatus;
  info?: {
    version: string;
    releaseNotes?: string;
  };
  error?: string;
  progress?: {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
  };
}

// Bash execution types (must match bash-executor.ts)
interface BashOutput {
  id: string;
  type: "stdout" | "stderr";
  data: string;
}

interface BashResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
  killed?: boolean;
}

// Config types (must match types/config.ts)
interface WorkspaceConfig {
  path: string;
  defaultNotebook: string;
}

interface EditorConfig {
  autoSaveInterval: number;
}

interface GeneralConfig {
  theme: "light" | "dark" | "system";
  language: string;
}

interface AppConfig {
  workspace: WorkspaceConfig;
  editor: EditorConfig;
  general: GeneralConfig;
}

// Note types (must match types/note.ts)
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notebookId: string;
  isPinned?: boolean;
}

interface CreateNoteInput {
  title?: string;
  content?: string;
  notebookId: string;
  tags?: string[];
}

interface UpdateNoteInput {
  title?: string;
  content?: string;
  notebookId?: string;
  tags?: string[];
  isPinned?: boolean;
}

// Notebook types (must match types/notebook.ts)
interface Notebook {
  id: string;
  name: string;
  parentId?: string | null;
  iconName?: string;
  type?: "folder" | "notebook";
  children?: Notebook[];
  isExpanded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateNotebookInput {
  name: string;
  parentId?: string | null;
  iconName?: string;
  type?: "folder" | "notebook";
}

interface UpdateNotebookInput {
  name?: string;
  parentId?: string | null;
  iconName?: string;
}

// Tree node type for workspace preview
interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

// Expose protected methods to renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Platform info
  platform: process.platform,

  // App info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // ===== System API =====
  system: {
    getInfo: (): Promise<{
      cpu: { usage: number; cores: number };
      memory: { usage: number; total: number; used: number };
    }> => ipcRenderer.invoke("system:get-info"),
  },

  // ===== Updater API =====
  updater: {
    check: (): Promise<UpdateState> => ipcRenderer.invoke("updater:check"),
    install: (): Promise<void> => ipcRenderer.invoke("updater:install"),
    getStatus: (): Promise<UpdateState> => ipcRenderer.invoke("updater:status"),
    onStatus: (callback: (state: UpdateState) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, state: UpdateState) =>
        callback(state);
      ipcRenderer.on("updater:status", handler);
      return () => ipcRenderer.removeListener("updater:status", handler);
    },
  },

  // ===== Bash Executor API =====
  bash: {
    execute: (
      id: string,
      command: string,
      cwd?: string
    ): Promise<BashResult> =>
      ipcRenderer.invoke("bash:execute", { id, command, cwd }),
    kill: (id: string): Promise<boolean> =>
      ipcRenderer.invoke("bash:kill", { id }),
    onOutput: (callback: (data: BashOutput) => void): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: BashOutput
      ) => callback(data);
      ipcRenderer.on("bash:output", handler);
      return () => ipcRenderer.removeListener("bash:output", handler);
    },
  },

  // ===== Workspace API =====
  workspace: {
    openFolderDialog: (): Promise<string | null> =>
      ipcRenderer.invoke("workspace:open-folder-dialog"),
    readTree: (path: string): Promise<TreeNode[]> =>
      ipcRenderer.invoke("workspace:read-tree", path),
  },

  // ===== Config API =====
  config: {
    read: (): Promise<AppConfig> => ipcRenderer.invoke("config:read"),
    write: (config: AppConfig): Promise<boolean> =>
      ipcRenderer.invoke("config:write", config),
    getPath: (): Promise<string> => ipcRenderer.invoke("config:get-path"),
  },

  // ===== Images API =====
  images: {
    save: (
      imageData: string,
      noteId: string
    ): Promise<{
      success: boolean;
      path?: string;
      filename?: string;
      error?: string;
    }> => ipcRenderer.invoke("images:save", { imageData, noteId }),
  },

  // ===== Notes CRUD API =====
  notes: {
    list: (notebookId?: string): Promise<Note[]> =>
      ipcRenderer.invoke("notes:list", notebookId),
    get: (id: string): Promise<Note | null> =>
      ipcRenderer.invoke("notes:get", id),
    create: (input: CreateNoteInput): Promise<Note> =>
      ipcRenderer.invoke("notes:create", input),
    update: (id: string, data: UpdateNoteInput): Promise<Note | null> =>
      ipcRenderer.invoke("notes:update", { id, data }),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke("notes:delete", id),
    search: (query: string): Promise<Note[]> =>
      ipcRenderer.invoke("notes:search", query),
  },

  // ===== Notebooks CRUD API =====
  notebooks: {
    list: (): Promise<Notebook[]> =>
      ipcRenderer.invoke("notebooks:list"),
    listFlat: (): Promise<Notebook[]> =>
      ipcRenderer.invoke("notebooks:list-flat"),
    get: (id: string): Promise<Notebook | null> =>
      ipcRenderer.invoke("notebooks:get", id),
    create: (input: CreateNotebookInput): Promise<Notebook> =>
      ipcRenderer.invoke("notebooks:create", input),
    update: (id: string, data: UpdateNotebookInput): Promise<Notebook | null> =>
      ipcRenderer.invoke("notebooks:update", { id, data }),
    delete: (id: string, deleteChildren?: boolean): Promise<boolean> =>
      ipcRenderer.invoke("notebooks:delete", { id, deleteChildren }),
  },
});
