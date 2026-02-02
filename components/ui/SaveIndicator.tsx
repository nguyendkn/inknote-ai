"use client";

import { Check, Loader2, Cloud } from "lucide-react";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 size={12} className="animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    const formatTime = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);

      if (diffSec < 5) return "Just saved";
      if (diffSec < 60) return `Saved ${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Saved ${diffMin}m ago`;
      return `Saved at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    };

    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600">
        <Check size={12} />
        <span>{formatTime(lastSaved)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <Cloud size={12} />
      <span>Draft</span>
    </div>
  );
}
