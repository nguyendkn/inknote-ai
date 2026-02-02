"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { useBashExecutor } from "@/lib/hooks/useBashExecutor";
import { validateCommand } from "@/lib/utils/command-validator";
import { RunButton } from "./RunButton";
import { OutputPanel } from "./OutputPanel";
import { ConfirmDialog } from "./ConfirmDialog";

interface ExecutableCodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function ExecutableCodeBlock({
  code,
  language,
  className,
}: ExecutableCodeBlockProps) {
  const [showOutput, setShowOutput] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValidation, setPendingValidation] = useState<{
    reason: string;
    severity: "warning" | "danger";
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const { execute, kill, status, output, exitCode, error, clear } =
    useBashExecutor();

  // Keyboard shortcut: Ctrl/Cmd + Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (isFocused && status !== "running") {
          e.preventDefault();
          initiateRun();
        }
      }
    };

    if (isFocused) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, status]);

  const initiateRun = useCallback(() => {
    const validation = validateCommand(code);

    if (validation.isDangerous) {
      setPendingValidation({
        reason: validation.reason || "This command may be dangerous",
        severity: validation.severity || "warning",
      });
      setShowConfirm(true);
    } else {
      executeCommand();
    }
  }, [code]);

  const executeCommand = useCallback(() => {
    setShowOutput(true);
    setShowConfirm(false);
    setPendingValidation(null);
    execute(code);
  }, [code, execute]);

  const handleConfirmCancel = useCallback(() => {
    setShowConfirm(false);
    setPendingValidation(null);
  }, []);

  const handleStop = useCallback(() => {
    kill();
  }, [kill]);

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  const handleClose = useCallback(() => {
    setShowOutput(false);
    if (status === "idle") {
      clear();
    }
  }, [status, clear]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Check if focus is moving outside the container
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  }, []);

  const showRunButton = isHovered || isFocused || status === "running" || showOutput;

  return (
    <>
      <div
        ref={containerRef}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        role="region"
        aria-label={`Executable ${language} code block`}
      >
        {/* Code Block Container */}
        <div
          className={`
            relative rounded-lg overflow-hidden
            ${showOutput ? "rounded-b-none" : ""}
            ${isFocused ? "ring-2 ring-blue-500/50" : ""}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800 text-slate-300">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-slate-400" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {language}
              </span>
              {isFocused && (
                <span className="text-[10px] text-slate-500 ml-2">
                  Ctrl+Enter to run
                </span>
              )}
            </div>

            {/* Run Button - visible on hover or when running */}
            <div
              className={`
                transition-opacity duration-150
                ${showRunButton ? "opacity-100" : "opacity-0"}
              `}
            >
              <RunButton
                status={status}
                onRun={initiateRun}
                onStop={handleStop}
              />
            </div>
          </div>

          {/* Code Content */}
          <pre className="p-4 bg-slate-900 overflow-x-auto">
            <code className={`${className || ""} text-sm font-mono text-slate-100`}>
              {code}
            </code>
          </pre>
        </div>

        {/* Output Panel */}
        {showOutput && (
          <OutputPanel
            output={output}
            status={status}
            exitCode={exitCode}
            error={error}
            onClear={handleClear}
            onClose={handleClose}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        command={code}
        reason={pendingValidation?.reason || ""}
        severity={pendingValidation?.severity || "warning"}
        onConfirm={executeCommand}
        onCancel={handleConfirmCancel}
      />
    </>
  );
}
