"use client";

import { Lock, Unlock, RotateCcw } from "lucide-react";
import { useCallback } from "react";

interface ResizeControlsProps {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  lockAspect: boolean;
  maxWidth: number;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onLockChange: (locked: boolean) => void;
  onMaxWidthChange: (maxW: number) => void;
  onReset: () => void;
}

export function ResizeControls({
  width,
  height,
  originalWidth,
  originalHeight,
  lockAspect,
  maxWidth,
  onWidthChange,
  onHeightChange,
  onLockChange,
  onMaxWidthChange,
  onReset,
}: ResizeControlsProps) {
  const aspectRatio = originalWidth / originalHeight;

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newWidth = parseInt(e.target.value) || 0;
      onWidthChange(newWidth);

      if (lockAspect && newWidth > 0) {
        onHeightChange(Math.round(newWidth / aspectRatio));
      }
    },
    [lockAspect, aspectRatio, onWidthChange, onHeightChange]
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHeight = parseInt(e.target.value) || 0;
      onHeightChange(newHeight);

      if (lockAspect && newHeight > 0) {
        onWidthChange(Math.round(newHeight * aspectRatio));
      }
    },
    [lockAspect, aspectRatio, onWidthChange, onHeightChange]
  );

  return (
    <div className="p-4 bg-slate-50 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Resize Options</h4>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Reset to original size"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Width */}
        <div className="flex-1">
          <label
            htmlFor="resize-width"
            className="block text-xs text-slate-500 mb-1"
          >
            Width (px)
          </label>
          <input
            id="resize-width"
            type="number"
            min={1}
            max={4000}
            value={width}
            onChange={handleWidthChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        {/* Lock Button */}
        <button
          onClick={() => onLockChange(!lockAspect)}
          className={`
            mt-5 p-2 rounded-lg transition-colors cursor-pointer
            ${
              lockAspect
                ? "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-500 hover:bg-slate-300"
            }
          `}
          aria-label={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
          title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
        >
          {lockAspect ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

        {/* Height */}
        <div className="flex-1">
          <label
            htmlFor="resize-height"
            className="block text-xs text-slate-500 mb-1"
          >
            Height (px)
          </label>
          <input
            id="resize-height"
            type="number"
            min={1}
            max={4000}
            value={height}
            onChange={handleHeightChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Max Width for Display */}
      <div>
        <label
          htmlFor="max-width"
          className="block text-xs text-slate-500 mb-1"
        >
          Max display width (px) - for markdown rendering
        </label>
        <input
          id="max-width"
          type="number"
          min={100}
          max={2000}
          value={maxWidth}
          onChange={(e) => onMaxWidthChange(parseInt(e.target.value) || 800)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
      </div>

      {/* Info */}
      <div className="text-xs text-slate-400">
        Original: {originalWidth} × {originalHeight}px
      </div>
    </div>
  );
}

export default ResizeControls;
