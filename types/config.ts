/**
 * Workspace configuration
 */
export interface WorkspaceConfig {
  path: string;
  defaultNotebook: string;
}

/**
 * Editor configuration
 */
export interface EditorConfig {
  autoSaveInterval: number; // in milliseconds
}

/**
 * General application configuration
 */
export interface GeneralConfig {
  theme: "light" | "dark" | "system";
  language: string;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  workspace: WorkspaceConfig;
  editor: EditorConfig;
  general: GeneralConfig;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: AppConfig = {
  workspace: {
    path: "",
    defaultNotebook: "inbox",
  },
  editor: {
    autoSaveInterval: 10000, // 10 seconds
  },
  general: {
    theme: "system",
    language: "en",
  },
};
