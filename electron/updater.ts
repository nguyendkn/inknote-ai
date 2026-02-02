import { app, BrowserWindow } from "electron";
import log from "electron-log";
import type { UpdateInfo } from "electron-updater";

// Update status types
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
  info?: UpdateInfo;
  error?: string;
  progress?: {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
  };
}

let currentState: UpdateState = { status: "idle" };
let mainWindow: BrowserWindow | null = null;
let autoUpdaterInstance: typeof import("electron-updater").autoUpdater | null = null;

// Lazy load autoUpdater to avoid errors in development
async function getAutoUpdater() {
  if (!autoUpdaterInstance) {
    const { autoUpdater } = await import("electron-updater");
    autoUpdaterInstance = autoUpdater;
    autoUpdaterInstance.logger = log;
  }
  return autoUpdaterInstance;
}

// Send update status to renderer
function sendStatusToWindow(state: UpdateState): void {
  currentState = state;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updater:status", state);
  }
}

// Setup auto-updater events
export function setupAutoUpdater(window: BrowserWindow): void {
  mainWindow = window;

  // Don't setup auto-updater in development
  if (!app.isPackaged) {
    log.info("Skipping auto-updater setup in development mode");
    return;
  }

  // Setup updater asynchronously
  setupUpdaterEvents();
}

async function setupUpdaterEvents(): Promise<void> {
  try {
    const autoUpdater = await getAutoUpdater();

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("checking-for-update", () => {
      sendStatusToWindow({ status: "checking" });
    });

    autoUpdater.on("update-available", (info: UpdateInfo) => {
      sendStatusToWindow({ status: "available", info });
    });

    autoUpdater.on("update-not-available", (info: UpdateInfo) => {
      sendStatusToWindow({ status: "not-available", info });
    });

    autoUpdater.on("download-progress", (progress) => {
      sendStatusToWindow({
        status: "downloading",
        progress: {
          percent: progress.percent,
          bytesPerSecond: progress.bytesPerSecond,
          transferred: progress.transferred,
          total: progress.total,
        },
      });
    });

    autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
      sendStatusToWindow({ status: "ready", info });
    });

    autoUpdater.on("error", (error: Error) => {
      sendStatusToWindow({ status: "error", error: error.message });
    });

    // Check for updates on startup (after a short delay)
    setTimeout(() => {
      checkForUpdates();
    }, 3000);
  } catch (error) {
    log.error("Failed to setup auto-updater:", error);
  }
}

// Check for updates manually
export async function checkForUpdates(): Promise<void> {
  if (!app.isPackaged) {
    log.info("Skipping update check in development mode");
    return;
  }

  try {
    const autoUpdater = await getAutoUpdater();
    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error("Error checking for updates:", error);
  }
}

// Quit and install update
export async function quitAndInstall(): Promise<void> {
  if (!app.isPackaged) {
    return;
  }

  try {
    const autoUpdater = await getAutoUpdater();
    autoUpdater.quitAndInstall(false, true);
  } catch (error) {
    log.error("Error quitting and installing:", error);
  }
}

// Get current update state
export function getUpdateState(): UpdateState {
  return currentState;
}
