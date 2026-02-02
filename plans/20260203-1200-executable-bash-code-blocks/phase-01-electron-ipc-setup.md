# Phase 1: Electron IPC Setup

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: None (first phase)
- **Documentation**: [Electron Command Execution Research](./research/researcher-01-electron-command-execution.md)

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-03 |
| **Description** | Setup Electron main process bash execution service và IPC communication |
| **Priority** | High |
| **Implementation Status** | ⏳ Pending |
| **Review Status** | ⏳ Pending |

## Key Insights

1. Sử dụng `child_process.spawn` với `shell: true` cho streaming output
2. IPC pattern: `invoke/handle` cho request/response, `send/on` cho streaming events
3. Cần Map để track running processes và cleanup

## Requirements

- Execute bash commands từ renderer process qua IPC
- Stream stdout/stderr real-time về renderer
- Kill/cancel running processes
- Cleanup processes khi window closes

## Architecture

```
Main Process                    Renderer Process
    │                                │
    │  ← ipcMain.handle('bash:execute')
    │     spawn(command)             │
    │  → event.sender.send('bash:output')
    │  → event.sender.send('bash:output')
    │  → resolve({ code, stdout })   │
    │                                │
    │  ← ipcMain.handle('bash:kill') │
    │     process.kill()             │
    │  → resolve()                   │
```

## Related Code Files

| File | Purpose |
|------|---------|
| [electron/main.ts](../../electron/main.ts) | Add IPC handlers |
| [electron/preload.ts](../../electron/preload.ts) | Expose bash API |
| [electron/electron.d.ts](../../electron/electron.d.ts) | Add type declarations |
| `electron/bash-executor.ts` | **NEW** - Bash execution service |

## Implementation Steps

### Step 1: Create BashExecutor Service
Create `electron/bash-executor.ts`:
```typescript
import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow } from 'electron';

interface BashProcess {
  process: ChildProcess;
  startTime: number;
}

const runningProcesses = new Map<string, BashProcess>();
const TIMEOUT_MS = 60000; // 60 seconds default

export function executeCommand(
  id: string,
  command: string,
  window: BrowserWindow
): Promise<BashResult> {
  // Implementation
}

export function killProcess(id: string): boolean { }
export function killAllProcesses(): void { }
```

### Step 2: Add IPC Handlers to main.ts
```typescript
import { executeCommand, killProcess, killAllProcesses } from './bash-executor';

ipcMain.handle('bash:execute', async (event, { id, command, cwd }) => {
  return executeCommand(id, command, mainWindow);
});

ipcMain.handle('bash:kill', async (event, { id }) => {
  return killProcess(id);
});

// Cleanup on window close
app.on('before-quit', () => killAllProcesses());
```

### Step 3: Update preload.ts
```typescript
bash: {
  execute: (id: string, command: string, cwd?: string) =>
    ipcRenderer.invoke('bash:execute', { id, command, cwd }),
  kill: (id: string) =>
    ipcRenderer.invoke('bash:kill', { id }),
  onOutput: (callback: (data: BashOutput) => void) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('bash:output', handler);
    return () => ipcRenderer.removeListener('bash:output', handler);
  }
}
```

### Step 4: Update Type Declarations
Update `electron/electron.d.ts` với BashAPI types.

## Todo List

- [ ] Tạo `electron/bash-executor.ts` với spawn logic
- [ ] Add IPC handlers vào `electron/main.ts`
- [ ] Expose bash API trong `electron/preload.ts`
- [ ] Update type declarations `electron/electron.d.ts`
- [ ] Test basic command execution

## Success Criteria

- [ ] Can execute simple commands (echo, ls)
- [ ] Streaming output works (long-running npm install)
- [ ] Can kill running processes
- [ ] Cleanup works on window close
- [ ] No memory leaks from orphan processes

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Orphan processes | Cleanup on before-quit, timeout auto-kill |
| Memory leak | WeakMap or cleanup after process ends |

## Security Considerations

- Không validate commands ở phase này (Phase 4)
- Cần cwd restriction trong production

## Next Steps

After completion, proceed to [Phase 2: UI Components](./phase-02-ui-components.md)
