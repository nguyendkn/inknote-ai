export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "not-available"
  | "downloading"
  | "ready"
  | "error";

export interface UpdateState {
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

// Bash execution types
export interface BashOutput {
  id: string;
  type: "stdout" | "stderr";
  data: string;
}

export interface BashResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
  killed?: boolean;
}

// Config types
export interface WorkspaceConfig {
  path: string;
  defaultNotebook: string;
}

export interface EditorConfig {
  autoSaveInterval: number;
}

export interface GeneralConfig {
  theme: "light" | "dark" | "system";
  language: string;
}

export interface AppConfig {
  workspace: WorkspaceConfig;
  editor: EditorConfig;
  general: GeneralConfig;
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notebookId: string;
  isPinned?: boolean;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  notebookId: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  notebookId?: string;
  tags?: string[];
  isPinned?: boolean;
}

// Notebook types
export interface Notebook {
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

export interface CreateNotebookInput {
  name: string;
  parentId?: string | null;
  iconName?: string;
  type?: "folder" | "notebook";
}

export interface UpdateNotebookInput {
  name?: string;
  parentId?: string | null;
  iconName?: string;
}

// Tree node for workspace preview
export interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

export interface ElectronAPI {
  platform: NodeJS.Platform;
  getAppVersion: () => Promise<string>;

  system: {
    getInfo: () => Promise<{
      cpu: { usage: number; cores: number };
      memory: { usage: number; total: number; used: number };
    }>;
  };

  updater: {
    check: () => Promise<UpdateState>;
    install: () => Promise<void>;
    getStatus: () => Promise<UpdateState>;
    onStatus: (callback: (state: UpdateState) => void) => () => void;
  };

  bash: {
    execute: (id: string, command: string, cwd?: string) => Promise<BashResult>;
    kill: (id: string) => Promise<boolean>;
    onOutput: (callback: (data: BashOutput) => void) => () => void;
  };

  workspace: {
    openFolderDialog: () => Promise<string | null>;
    readTree: (path: string) => Promise<TreeNode[]>;
  };

  config: {
    read: () => Promise<AppConfig>;
    write: (config: AppConfig) => Promise<boolean>;
    getPath: () => Promise<string>;
  };

  images: {
    save: (
      imageData: string,
      noteId: string
    ) => Promise<{
      success: boolean;
      path?: string;
      filename?: string;
      error?: string;
    }>;
  };

  notes: {
    list: (notebookId?: string) => Promise<Note[]>;
    get: (id: string) => Promise<Note | null>;
    create: (input: CreateNoteInput) => Promise<Note>;
    update: (id: string, data: UpdateNoteInput) => Promise<Note | null>;
    delete: (id: string) => Promise<boolean>;
    search: (query: string) => Promise<Note[]>;
  };

  notebooks: {
    list: () => Promise<Notebook[]>;
    listFlat: () => Promise<Notebook[]>;
    get: (id: string) => Promise<Notebook | null>;
    create: (input: CreateNotebookInput) => Promise<Notebook>;
    update: (id: string, data: UpdateNotebookInput) => Promise<Notebook | null>;
    delete: (id: string, deleteChildren?: boolean) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
