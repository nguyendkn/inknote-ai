# Phase 02: Electron IPC Handlers

## Context Links
- **Parent Plan**: [plan.md](plan.md)
- **Previous Phase**: [phase-01-config-service.md](phase-01-config-service.md)
- **Next Phase**: [phase-03-ui-components.md](phase-03-ui-components.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Description | Thêm IPC handlers cho folder picker dialog và config management |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

1. Electron dialog.showOpenDialog() cho folder picker
2. IPC pattern hiện tại: `ipcMain.handle()` + `ipcRenderer.invoke()`
3. Preload script expose APIs qua contextBridge
4. Cần handlers cho: open folder dialog, read config, write config, read directory tree

## Requirements

### Functional
- IPC handler để mở folder picker dialog
- IPC handler để đọc config từ file
- IPC handler để ghi config vào file
- IPC handler để đọc cây thư mục của workspace

### Non-Functional
- Async operations không block UI
- Error handling với meaningful messages
- Type safety với TypeScript

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  window.electronAPI.workspace.openFolderDialog()     │   │
│  │  window.electronAPI.config.read()                    │   │
│  │  window.electronAPI.config.write(config)             │   │
│  │  window.electronAPI.workspace.readTree(path)         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │ IPC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ipcMain.handle('workspace:open-folder-dialog')      │   │
│  │  ipcMain.handle('config:read')                       │   │
│  │  ipcMain.handle('config:write')                      │   │
│  │  ipcMain.handle('workspace:read-tree')               │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ConfigService                            │   │
│  │              + fs.readdirSync (tree)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

| File | Action | Description |
|------|--------|-------------|
| `electron/main.ts` | Modify | Thêm IPC handlers |
| `electron/preload.ts` | Modify | Expose workspace & config APIs |
| `electron/electron.d.ts` | Modify | TypeScript declarations |

## Implementation Steps

### Step 1: Add IPC Handlers in main.ts

```typescript
// electron/main.ts
import { dialog } from 'electron';
import { configService } from '../lib/services/config-service';

// Folder picker dialog
ipcMain.handle('workspace:open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select Workspace Folder',
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Read config
ipcMain.handle('config:read', () => {
  return configService.getConfig();
});

// Write config
ipcMain.handle('config:write', (_event, config: AppConfig) => {
  configService.saveConfig(config);
  return true;
});

// Read directory tree
ipcMain.handle('workspace:read-tree', async (_event, dirPath: string) => {
  return readDirectoryTree(dirPath);
});

// Helper function to read directory tree
function readDirectoryTree(dirPath: string, depth = 3): TreeNode[] {
  const fs = require('fs');
  const path = require('path');

  if (depth === 0) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((entry: any) => !entry.name.startsWith('.'))
      .map((entry: any) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isDirectory: entry.isDirectory(),
        children: entry.isDirectory()
          ? readDirectoryTree(path.join(dirPath, entry.name), depth - 1)
          : undefined,
      }));
  } catch (error) {
    console.error('Failed to read directory:', error);
    return [];
  }
}
```

### Step 2: Update preload.ts

```typescript
// electron/preload.ts

// Add tree node type
interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing APIs ...

  // ===== Workspace API =====
  workspace: {
    openFolderDialog: (): Promise<string | null> =>
      ipcRenderer.invoke('workspace:open-folder-dialog'),
    readTree: (path: string): Promise<TreeNode[]> =>
      ipcRenderer.invoke('workspace:read-tree', path),
  },

  // ===== Config API =====
  config: {
    read: (): Promise<AppConfig> =>
      ipcRenderer.invoke('config:read'),
    write: (config: AppConfig): Promise<boolean> =>
      ipcRenderer.invoke('config:write', config),
  },
});
```

### Step 3: Update electron.d.ts

```typescript
// electron/electron.d.ts
interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

interface AppConfig {
  workspace: {
    path: string;
    defaultNotebook: string;
  };
  general: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

interface ElectronAPI {
  // ... existing ...

  workspace: {
    openFolderDialog: () => Promise<string | null>;
    readTree: (path: string) => Promise<TreeNode[]>;
  };

  config: {
    read: () => Promise<AppConfig>;
    write: (config: AppConfig) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

## Todo List

- [ ] Add folder picker IPC handler
- [ ] Add config read IPC handler
- [ ] Add config write IPC handler
- [ ] Add directory tree IPC handler
- [ ] Update preload.ts với workspace và config APIs
- [ ] Update electron.d.ts với type declarations
- [ ] Test IPC communication

## Success Criteria

1. ✅ Folder picker dialog mở và trả về path
2. ✅ Config được đọc từ file qua IPC
3. ✅ Config được ghi vào file qua IPC
4. ✅ Directory tree được đọc và trả về
5. ✅ TypeScript types hoạt động đúng

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dialog bị block bởi window | Medium | Sử dụng async dialog |
| Large directory tree | Medium | Limit depth, lazy loading |
| Invalid path từ user | Low | Validate path trước khi đọc |

## Security Considerations

1. **Path validation**: Chỉ cho phép absolute paths
2. **Depth limit**: Giới hạn độ sâu tree để tránh infinite recursion
3. **Hidden files**: Filter bỏ hidden files (.dotfiles)
4. **No code execution**: Chỉ đọc metadata, không execute files

## Next Steps

→ Tiếp tục với [Phase 03: UI Components](phase-03-ui-components.md)

---

*Last Updated: 2026-02-03*
