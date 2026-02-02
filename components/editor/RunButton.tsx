"use client";

import { Play, Square, Loader2, Check, AlertCircle } from "lucide-react";
import { BashStatus } from "@/lib/hooks/useBashExecutor";

interface RunButtonProps {
  status: BashStatus;
  onRun: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function RunButton({
  status,
  onRun,
  onStop,
  disabled = false,
}: RunButtonProps) {
  const isRunning = status === "running";

  const handleClick = () => {
    if (isRunning) {
      onStop();
    } else {
      onRun();
    }
  };

  const getIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 size={14} className="animate-spin" />;
      case "success":
        return <Check size={14} />;
      case "error":
        return <AlertCircle size={14} />;
      default:
        return <Play size={14} className="ml-0.5" />;
    }
  };

  const getButtonStyles = () => {
    const baseStyles = `
      flex items-center justify-center
      w-7 h-7 rounded-md
      transition-all duration-150 ease-out
      focus:outline-none focus:ring-2 focus:ring-blue-500/50
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    switch (status) {
      case "running":
        return `${baseStyles} bg-orange-100 text-orange-600 hover:bg-orange-200 cursor-pointer`;
      case "success":
        return `${baseStyles} bg-green-100 text-green-600`;
      case "error":
        return `${baseStyles} bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer`;
      default:
        return `${baseStyles} bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 hover:scale-105 cursor-pointer`;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "running":
        return "Stop execution (click to cancel)";
      case "success":
        return "Execution completed successfully";
      case "error":
        return "Execution failed (click to retry)";
      default:
        return "Run command";
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={getButtonStyles()}
      title={getTitle()}
      aria-label={getTitle()}
    >
      {isRunning ? (
        <Square size={12} className="fill-current" />
      ) : (
        getIcon()
      )}
    </button>
  );
}
