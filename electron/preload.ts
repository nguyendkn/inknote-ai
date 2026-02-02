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
});
