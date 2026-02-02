"use client";

import { ChevronDown } from "lucide-react";

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

export function SettingsSelect({
  label,
  description,
  value,
  onChange,
  options,
  disabled = false,
}: SettingsSelectProps) {
  return (
    <div className="py-3 px-4 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <span className="text-sm font-medium text-slate-900">{label}</span>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`
              appearance-none bg-slate-50 border border-slate-200 rounded-lg
              py-2 pl-3 pr-8 text-sm text-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-colors duration-150
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-300"}
            `}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
