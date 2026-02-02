"use client";

import {
  Cloud,
  FolderOpen,
  Puzzle,
  Settings,
  Type,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EditorTab } from "./tabs/EditorTab";
import { GeneralTab } from "./tabs/GeneralTab";
import { PluginsTab } from "./tabs/PluginsTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { SyncTab } from "./tabs/SyncTab";
import { WorkspaceTab } from "./tabs/WorkspaceTab";

type TabId =
  | "profile"
  | "general"
  | "editor"
  | "workspace"
  | "sync"
  | "plugins";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "profile", label: "Profile", icon: <User size={18} /> },
  { id: "general", label: "General", icon: <Settings size={18} /> },
  { id: "editor", label: "Editor", icon: <Type size={18} /> },
  { id: "workspace", label: "Workspace", icon: <FolderOpen size={18} /> },
  { id: "sync", label: "Sync", icon: <Cloud size={18} /> },
  { id: "plugins", label: "Plugins", icon: <Puzzle size={18} /> },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const user = {
    name: "Dao Khoi Nguyen",
    email: "nguyen@example.com",
    plan: "Pro",
    avatarInitial: "D",
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} />;
      case "general":
        return <GeneralTab />;
      case "editor":
        return <EditorTab />;
      case "workspace":
        return <WorkspaceTab />;
      case "sync":
        return <SyncTab />;
      case "plugins":
        return <PluginsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[85vh] max-h-175 bg-white rounded-2xl shadow-2xl flex overflow-hidden mx-4">
        {/* Left Sidebar - Tab Navigation */}
        <div className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          {/* Header */}
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          </div>

          {/* Tab List */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-150 cursor-pointer
                      ${
                        activeTab === tab.id
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }
                    `}
                  >
                    <span
                      className={
                        activeTab === tab.id ? "text-white" : "text-slate-400"
                      }
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">
              InkNote AI v1.0.0
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Content Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150 cursor-pointer"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
