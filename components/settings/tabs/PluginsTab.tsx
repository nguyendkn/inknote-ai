"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { SettingsSection } from "../ui/SettingsSection";

interface Plugin {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
}

const INITIAL_PLUGINS: Plugin[] = [
  {
    id: "markdown-preview",
    name: "Markdown Preview Enhanced",
    description: "Advanced markdown preview with diagrams and math support",
    enabled: true,
    version: "2.1.0",
  },
  {
    id: "code-highlight",
    name: "Code Syntax Highlighting",
    description: "Syntax highlighting for 100+ programming languages",
    enabled: true,
    version: "1.5.2",
  },
  {
    id: "table-editor",
    name: "Table Editor",
    description: "Visual table editing and formatting",
    enabled: false,
    version: "1.0.0",
  },
  {
    id: "export-pdf",
    name: "PDF Export",
    description: "Export notes to beautifully formatted PDFs",
    enabled: true,
    version: "3.2.1",
  },
];

export function PluginsTab() {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS);

  const togglePlugin = (pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p)),
    );
  };

  return (
    <div>
      <SettingsSection
        title="Installed Plugins"
        description="Manage your installed plugins"
      >
        <div className="space-y-3">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="py-4 px-4 rounded-lg border border-slate-200 bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {plugin.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      v{plugin.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {plugin.description}
                  </p>
                </div>
                <button
                  onClick={() => togglePlugin(plugin.id)}
                  className={`
                    relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    ${plugin.enabled ? "bg-blue-500" : "bg-slate-200"}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg
                      ring-0 transition-transform duration-200 ease-in-out
                      ${plugin.enabled ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Discover" description="Find more plugins">
        <div className="py-4 px-4 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-900">
                Browse Plugin Store
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Discover new plugins to enhance your workflow
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150 cursor-pointer">
              Browse
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
