"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export type BashStatus = "idle" | "running" | "success" | "error";

interface BashOutput {
  id: string;
  type: "stdout" | "stderr";
  data: string;
}

interface BashResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
  killed?: boolean;
}

interface UseBashExecutorReturn {
  execute: (command: string) => void;
  kill: () => void;
  status: BashStatus;
  output: string;
  exitCode: number | null;
  error: string | null;
  clear: () => void;
}

export function useBashExecutor(): UseBashExecutorReturn {
  const [status, setStatus] = useState<BashStatus>("idle");
  const [output, setOutput] = useState("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Setup output listener
  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI?.bash) {
      return;
    }

    const cleanup = window.electronAPI.bash.onOutput((data: BashOutput) => {
      if (data.id === processIdRef.current) {
        setOutput((prev) => prev + data.data);
      }
    });

    cleanupRef.current = cleanup;

    return () => {
      cleanup();
    };
  }, []);

  const execute = useCallback(async (command: string) => {
    if (typeof window === "undefined" || !window.electronAPI?.bash) {
      setError("Electron API not available");
      setStatus("error");
      return;
    }

    // Generate unique ID for this execution
    const id = uuidv4();
    processIdRef.current = id;

    // Reset state
    setOutput("");
    setExitCode(null);
    setError(null);
    setStatus("running");

    try {
      const result: BashResult = await window.electronAPI.bash.execute(
        id,
        command
      );

      if (result.killed) {
        setStatus("error");
        setError("Process was terminated");
      } else if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.error || `Exit code: ${result.exitCode}`);
      }

      setExitCode(result.exitCode);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      processIdRef.current = null;
    }
  }, []);

  const kill = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !window.electronAPI?.bash ||
      !processIdRef.current
    ) {
      return;
    }

    try {
      await window.electronAPI.bash.kill(processIdRef.current);
      setStatus("error");
      setError("Process cancelled by user");
    } catch (err) {
      console.error("Failed to kill process:", err);
    }
  }, []);

  const clear = useCallback(() => {
    setOutput("");
    setExitCode(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    execute,
    kill,
    status,
    output,
    exitCode,
    error,
    clear,
  };
}
