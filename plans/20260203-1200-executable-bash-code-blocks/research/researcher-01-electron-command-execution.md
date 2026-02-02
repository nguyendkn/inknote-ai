# Research: Electron Command Execution

## Overview
Research về cách execute bash commands an toàn trong Electron apps.

## 1. Electron IPC Communication Pattern

### Main Process (trusted)
```typescript
// electron/main.ts
import { spawn, ChildProcess } from 'child_process';

const runningProcesses = new Map<string, ChildProcess>();

ipcMain.handle('bash:execute', async (event, { id, command }) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [], {
      shell: true,
      cwd: process.cwd()
    });

    runningProcesses.set(id, child);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
      event.sender.send('bash:output', { id, type: 'stdout', data: data.toString() });
    });

    child.stderr.on('data', (data) => {
      stderr += data;
      event.sender.send('bash:output', { id, type: 'stderr', data: data.toString() });
    });

    child.on('close', (code) => {
      runningProcesses.delete(id);
      resolve({ code, stdout, stderr });
    });

    child.on('error', (err) => {
      runningProcesses.delete(id);
      reject(err);
    });
  });
});

ipcMain.handle('bash:kill', async (event, { id }) => {
  const process = runningProcesses.get(id);
  if (process) {
    process.kill('SIGTERM');
    runningProcesses.delete(id);
  }
});
```

### Preload Script (context bridge)
```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  bash: {
    execute: (id: string, command: string) =>
      ipcRenderer.invoke('bash:execute', { id, command }),
    kill: (id: string) =>
      ipcRenderer.invoke('bash:kill', { id }),
    onOutput: (callback: (data: BashOutput) => void) => {
      const handler = (_event, data) => callback(data);
      ipcRenderer.on('bash:output', handler);
      return () => ipcRenderer.removeListener('bash:output', handler);
    }
  }
});
```

## 2. spawn vs exec Comparison

| Feature | spawn | exec |
|---------|-------|------|
| Output | Streaming | Buffered |
| Large output | Tốt | Giới hạn buffer |
| Long-running | Phù hợp | Không phù hợp |
| Cancel | Dễ kill | Dễ kill |

**Recommendation**: Sử dụng `spawn` với `shell: true` để:
- Stream output real-time
- Handle long-running commands
- Dễ dàng kill process

## 3. Security Best Practices

### Dangerous Commands Detection
```typescript
const DANGEROUS_PATTERNS = [
  /rm\s+(-rf?|--recursive)\s+[\/~]/i,  // rm -rf /
  /mkfs/i,                               // Format disk
  /dd\s+if=/i,                           // Disk operations
  /:(){ :|:& };:/,                       // Fork bomb
  />\s*\/dev\/(sda|nvme|hd)/i,          // Write to disk
  /shutdown|reboot|poweroff/i,           // System power
  /chmod\s+777/i,                        // Insecure permissions
  /curl.*\|\s*(ba)?sh/i,                 // Pipe to shell
];

function isDangerous(command: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(command));
}
```

### Sandboxing Options
1. **Working Directory**: Giới hạn cwd cho user workspace
2. **Timeout**: Kill process sau N giây
3. **User Confirmation**: Dialog cho dangerous commands

## 4. Error Handling

```typescript
interface BashResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: string;
  killed?: boolean;
}
```

## 5. Process Management

- Map lưu running processes theo ID
- Cleanup khi window close
- Timeout auto-kill sau 60s (configurable)

## Key Findings

1. **IPC Pattern**: invoke/handle + send/on cho streaming
2. **spawn tốt hơn exec** cho use case này
3. **Security**: Cần confirmation dialog cho dangerous commands
4. **Streaming**: Real-time output qua IPC events

## Citations

- Electron IPC: https://www.electronjs.org/docs/latest/tutorial/ipc
- Node.js child_process: https://nodejs.org/api/child_process.html
