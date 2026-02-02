"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Hook for auto-saving with debounce
 * @param value - The value to save
 * @param onSave - Callback to save the value
 * @param delay - Debounce delay in milliseconds (default: 10000ms = 10s)
 * @param enabled - Whether auto-save is enabled
 */
export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delay: number = 10000,
  enabled: boolean = true
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValueRef = useRef<string>(JSON.stringify(value));
  const currentValueRef = useRef<T>(value);
  const onSaveRef = useRef(onSave);
  const isMountedRef = useRef(true);

  // Keep refs up to date
  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const saveIfChanged = useCallback(async () => {
    if (!isMountedRef.current) return;

    const currentValue = JSON.stringify(currentValueRef.current);
    if (currentValue !== lastSavedValueRef.current) {
      try {
        await onSaveRef.current(currentValueRef.current);
        lastSavedValueRef.current = currentValue;
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveIfChanged, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Save immediately on cleanup if there are pending changes
      const currentValue = JSON.stringify(currentValueRef.current);
      if (currentValue !== lastSavedValueRef.current) {
        onSaveRef.current(currentValueRef.current).catch((err) => {
          console.error("Auto-save on cleanup failed:", err);
        });
        lastSavedValueRef.current = currentValue;
      }
    };
  }, [value, saveIfChanged, delay, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Force save function (for manual save)
  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveIfChanged();
  }, [saveIfChanged]);

  return { forceSave };
}
