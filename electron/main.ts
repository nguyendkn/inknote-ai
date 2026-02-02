import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import {
  checkForUpdates,
  getUpdateState,
  quitAndInstall,
  setupAutoUpdater,
} from "./updater";
import {
  executeCommand,
  killProcess,
  killAllProcesses,
} from "./bash-executor";
import { configService } from "./config-service";
import { notesService } from "./notes-service";
import { notebooksService } from "./notebooks-service";
import { AppConfig } from "../types/config";
import { CreateNoteInput, UpdateNoteInput } from "../types/note";
import { CreateNotebookInput, UpdateNotebookInput } from "../types/notebook";

const isDev = process.env.NODE_ENV === "development";

// Get the correct path to the static files
// In development: __dirname is dist-electron/electron
// In production (packaged): resources/app/dist-electron/electron
// Static files are in: resources/app/out (production) or out (dev)
function getStaticPath(): string {
  if (isDev) {
    // Development: files are at project root/out
    return path.join(__dirname, "../../out");
  } else {
    // Production: navigate from dist-electron/electron to out
    // __dirname = resources/app/dist-electron/electron
    // We need: resources/app/out
    return path.join(__dirname, "../../out");
  }
}

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
    // Open DevTools in development for debugging
    mainWindow.webContents.openDevTools();
  } else {
    const staticPath = getStaticPath();
    const indexPath = path.join(staticPath, "index.html");

    // Log for debugging
    console.log("Static path:", staticPath);
    console.log("Index path:", indexPath);
    console.log("Index exists:", fs.existsSync(indexPath));

    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      // Fallback: try alternative paths
      const altPaths = [
        path.join(__dirname, "../out/index.html"),
        path.join(process.resourcesPath || "", "app/out/index.html"),
        path.join(app.getAppPath(), "out/index.html"),
      ];

      let loaded = false;
      for (const altPath of altPaths) {
        console.log("Trying path:", altPath, "exists:", fs.existsSync(altPath));
        if (fs.existsSync(altPath)) {
          mainWindow.loadFile(altPath);
          loaded = true;
          break;
        }
      }

      if (!loaded) {
        console.error("Could not find index.html. Tried paths:", [indexPath, ...altPaths]);
        mainWindow.loadURL(`data:text/html,<h1>Error: Could not load application</h1><p>Index file not found</p>`);
      }
    }
  }

  // Setup auto-updater after window is created
  setupAutoUpdater(mainWindow);
}

// Helper functions for IPC handlers
interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

function readDirectoryTree(dirPath: string, depth = 3): TreeNode[] {
  if (depth === 0) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => !entry.name.startsWith("."))
      .slice(0, 50) // Limit entries to prevent performance issues
      .map((entry) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isDirectory: entry.isDirectory(),
        children: entry.isDirectory()
          ? readDirectoryTree(path.join(dirPath, entry.name), depth - 1)
          : undefined,
      }));
  } catch (error) {
    console.error("Failed to read directory:", error);
    return [];
  }
}

function generateImageFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}.webp`;
}

function base64ToBuffer(base64DataUrl: string): Buffer {
  const base64Data = base64DataUrl.split(",")[1];
  return Buffer.from(base64Data, "base64");
}

// Setup all IPC handlers - must be called after app is ready
function setupIpcHandlers(): void {
  // App info
  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });

  // System info
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

  // Bash Executor IPC Handlers
  ipcMain.handle("bash:execute", async (_event, { id, command, cwd }) => {
    return executeCommand(id, command, mainWindow, { cwd });
  });

  ipcMain.handle("bash:kill", async (_event, { id }) => {
    return killProcess(id);
  });

  // Workspace IPC Handlers
  ipcMain.handle("workspace:open-folder-dialog", async () => {
    if (!mainWindow) return null;

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select Workspace Folder",
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle("workspace:read-tree", async (_event, dirPath: string) => {
    if (!dirPath || !fs.existsSync(dirPath)) {
      return [];
    }
    return readDirectoryTree(dirPath);
  });

  // Config IPC Handlers
  ipcMain.handle("config:read", () => {
    return configService.getConfig();
  });

  ipcMain.handle("config:write", (_event, config: AppConfig) => {
    try {
      configService.saveConfig(config);
      return true;
    } catch (error) {
      console.error("Failed to save config:", error);
      return false;
    }
  });

  ipcMain.handle("config:get-path", () => {
    return configService.getConfigPath();
  });

  // Image IPC Handlers
  ipcMain.handle(
    "images:save",
    async (
      _event,
      { imageData, noteId }: { imageData: string; noteId: string }
    ) => {
      try {
        if (!imageData || !noteId) {
          return { success: false, error: "Missing imageData or noteId" };
        }

        // Get workspace path from config, or use app data path as fallback
        const config = configService.getConfig();
        const basePath =
          config?.workspace?.path || app.getPath("userData");
        const imagesDir = path.join(basePath, "notes", noteId, "images");

        // Ensure directory exists
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Generate filename and save
        const filename = generateImageFilename();
        const filePath = path.join(imagesDir, filename);
        const buffer = base64ToBuffer(imageData);
        fs.writeFileSync(filePath, buffer);

        // Return the file path
        return {
          success: true,
          path: filePath,
          filename,
        };
      } catch (error) {
        console.error("Failed to save image:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to save image",
        };
      }
    }
  );

  // ===== Notes CRUD IPC Handlers =====
  ipcMain.handle("notes:list", async (_, notebookId?: string) => {
    try {
      return await notesService.list(notebookId);
    } catch (error) {
      console.error("Failed to list notes:", error);
      return [];
    }
  });

  ipcMain.handle("notes:get", async (_, id: string) => {
    try {
      return await notesService.get(id);
    } catch (error) {
      console.error("Failed to get note:", error);
      return null;
    }
  });

  ipcMain.handle("notes:create", async (_, input: CreateNoteInput) => {
    try {
      return await notesService.create(input);
    } catch (error) {
      console.error("Failed to create note:", error);
      throw error;
    }
  });

  ipcMain.handle(
    "notes:update",
    async (_, { id, data }: { id: string; data: UpdateNoteInput }) => {
      try {
        return await notesService.update(id, data);
      } catch (error) {
        console.error("Failed to update note:", error);
        throw error;
      }
    }
  );

  ipcMain.handle("notes:delete", async (_, id: string) => {
    try {
      return await notesService.delete(id);
    } catch (error) {
      console.error("Failed to delete note:", error);
      return false;
    }
  });

  ipcMain.handle("notes:search", async (_, query: string) => {
    try {
      return await notesService.search(query);
    } catch (error) {
      console.error("Failed to search notes:", error);
      return [];
    }
  });

  // ===== Notebooks CRUD IPC Handlers =====
  ipcMain.handle("notebooks:list", async () => {
    try {
      return await notebooksService.list();
    } catch (error) {
      console.error("Failed to list notebooks:", error);
      return [];
    }
  });

  ipcMain.handle("notebooks:list-flat", async () => {
    try {
      return await notebooksService.listFlat();
    } catch (error) {
      console.error("Failed to list notebooks:", error);
      return [];
    }
  });

  ipcMain.handle("notebooks:get", async (_, id: string) => {
    try {
      return await notebooksService.get(id);
    } catch (error) {
      console.error("Failed to get notebook:", error);
      return null;
    }
  });

  ipcMain.handle("notebooks:create", async (_, input: CreateNotebookInput) => {
    try {
      return await notebooksService.create(input);
    } catch (error) {
      console.error("Failed to create notebook:", error);
      throw error;
    }
  });

  ipcMain.handle(
    "notebooks:update",
    async (_, { id, data }: { id: string; data: UpdateNotebookInput }) => {
      try {
        return await notebooksService.update(id, data);
      } catch (error) {
        console.error("Failed to update notebook:", error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    "notebooks:delete",
    async (_, { id, deleteChildren }: { id: string; deleteChildren?: boolean }) => {
      try {
        return await notebooksService.delete(id, deleteChildren ?? true);
      } catch (error) {
        console.error("Failed to delete notebook:", error);
        return false;
      }
    }
  );
}

// App lifecycle
app.whenReady().then(() => {
  // Setup IPC handlers first
  setupIpcHandlers();

  // Create the main window
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

// Cleanup running processes on quit
app.on("before-quit", () => {
  killAllProcesses();
});
