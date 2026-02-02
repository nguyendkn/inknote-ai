import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import {
  checkForUpdates,
  getUpdateState,
  quitAndInstall,
  setupAutoUpdater,
} from "./updater";

const isDev = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Get package info for title
  const appName = app.getName();
  const version = app.getVersion();

  mainWindow = new BrowserWindow({
    width: 1500,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: `${appName} v${version}`,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    show: false,
  });

  // Remove menu bar completely
  mainWindow.setMenu(null);

  // Show window when ready to avoid visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  // Setup auto-updater after window is created
  setupAutoUpdater(mainWindow);
}

// IPC Handlers
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("system:get-info", async () => {
  const os = await import("os");
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    cpu: {
      usage:
        cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          return acc + ((total - cpu.times.idle) / total) * 100;
        }, 0) / cpus.length,
      cores: cpus.length,
    },
    memory: {
      usage: (usedMemory / totalMemory) * 100,
      total: totalMemory,
      used: usedMemory,
    },
  };
});

// Updater IPC Handlers
ipcMain.handle("updater:check", async () => {
  await checkForUpdates();
  return getUpdateState();
});

ipcMain.handle("updater:install", () => {
  quitAndInstall();
});

ipcMain.handle("updater:status", () => {
  return getUpdateState();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
