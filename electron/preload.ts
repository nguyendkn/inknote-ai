import { contextBridge, ipcRenderer } from "electron";

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
});
