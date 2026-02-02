import { spawn, ChildProcess } from "child_process";
import { BrowserWindow } from "electron";

// Types
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

interface RunningProcess {
  process: ChildProcess;
  startTime: number;
  timeoutId?: NodeJS.Timeout;
}

// Process management
const runningProcesses = new Map<string, RunningProcess>();
const DEFAULT_TIMEOUT_MS = 60000; // 60 seconds

/**
 * Execute a bash command with streaming output
 */
export function executeCommand(
  id: string,
  command: string,
  window: BrowserWindow | null,
  options: { cwd?: string; timeout?: number } = {}
): Promise<BashResult> {
  return new Promise((resolve) => {
    const { cwd = process.cwd(), timeout = DEFAULT_TIMEOUT_MS } = options;

    // Determine shell based on platform
    const isWindows = process.platform === "win32";
    const shell = isWindows ? "cmd.exe" : "/bin/bash";
    const shellArgs = isWindows ? ["/c", command] : ["-c", command];

    let stdout = "";
    let stderr = "";
    let killed = false;

    try {
      const child = spawn(shell, shellArgs, {
        cwd,
        env: process.env,
        windowsHide: true,
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        killed = true;
        child.kill("SIGTERM");
        // Force kill after 5 seconds if SIGTERM doesn't work
        setTimeout(() => {
          if (!child.killed) {
            child.kill("SIGKILL");
          }
        }, 5000);
      }, timeout);

      // Store process reference
      runningProcesses.set(id, {
        process: child,
        startTime: Date.now(),
        timeoutId,
      });

      // Stream stdout
      child.stdout?.on("data", (data: Buffer) => {
        const text = data.toString();
        stdout += text;
        if (window && !window.isDestroyed()) {
          window.webContents.send("bash:output", {
            id,
            type: "stdout",
            data: text,
          } as BashOutput);
        }
      });

      // Stream stderr
      child.stderr?.on("data", (data: Buffer) => {
        const text = data.toString();
        stderr += text;
        if (window && !window.isDestroyed()) {
          window.webContents.send("bash:output", {
            id,
            type: "stderr",
            data: text,
          } as BashOutput);
        }
      });

      // Handle process completion
      child.on("close", (code) => {
        clearTimeout(timeoutId);
        runningProcesses.delete(id);

        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr,
          killed,
        });
      });

      // Handle errors
      child.on("error", (err) => {
        clearTimeout(timeoutId);
        runningProcesses.delete(id);

        resolve({
          success: false,
          exitCode: null,
          stdout,
          stderr,
          error: err.message,
        });
      });
    } catch (err) {
      resolve({
        success: false,
        exitCode: null,
        stdout: "",
        stderr: "",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });
}

/**
 * Kill a running process by ID
 */
export function killProcess(id: string): boolean {
  const running = runningProcesses.get(id);
  if (running) {
    const { process, timeoutId } = running;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    process.kill("SIGTERM");
    // Force kill after 2 seconds
    setTimeout(() => {
      if (!process.killed) {
        process.kill("SIGKILL");
      }
    }, 2000);
    runningProcesses.delete(id);
    return true;
  }
  return false;
}

/**
 * Kill all running processes (cleanup on app quit)
 */
export function killAllProcesses(): void {
  for (const [id, running] of runningProcesses) {
    const { process, timeoutId } = running;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    process.kill("SIGKILL");
    runningProcesses.delete(id);
  }
}

/**
 * Get count of running processes
 */
export function getRunningCount(): number {
  return runningProcesses.size;
}

/**
 * Check if a process is running
 */
export function isProcessRunning(id: string): boolean {
  return runningProcesses.has(id);
}
