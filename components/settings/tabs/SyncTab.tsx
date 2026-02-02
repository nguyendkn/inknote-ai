"use client";

import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { SettingsSection } from "../ui/SettingsSection";
import { SettingsSelect } from "../ui/SettingsSelect";
import { SettingsToggle } from "../ui/SettingsToggle";

export function SyncTab() {
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState("5");
  const [syncOnMobile, setSyncOnMobile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isConnected = true;
  const lastSyncTime = "2 minutes ago";
  const storageUsed = 2.5;
  const storageTotal = 5;
  const storagePercentage = (storageUsed / storageTotal) * 100;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div>
      <SettingsSection
        title="Sync Status"
        description="Your current sync status"
      >
        <div className="py-4 px-4 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Cloud size={20} className="text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <CloudOff size={20} className="text-slate-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {isConnected ? "Connected" : "Disconnected"}
                </p>
                <p className="text-xs text-slate-500">
                  Last synced: {lastSyncTime}
                </p>
              </div>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                transition-all duration-200 cursor-pointer
                ${isSyncing ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}
              `}
            >
              <RefreshCw
                size={16}
                className={isSyncing ? "animate-spin" : ""}
              />
              {isSyncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Sync Preferences"
        description="Configure how syncing works"
      >
        <SettingsToggle
          label="Enable Sync"
          description="Keep your notes synced across devices"
          checked={syncEnabled}
          onChange={setSyncEnabled}
        />
        {syncEnabled && (
          <>
            <SettingsSelect
              label="Sync Frequency"
              description="How often to sync your notes"
              value={syncFrequency}
              onChange={setSyncFrequency}
              options={[
                { value: "manual", label: "Manual only" },
                { value: "5", label: "Every 5 minutes" },
                { value: "15", label: "Every 15 minutes" },
                { value: "60", label: "Every hour" },
              ]}
            />
            <SettingsToggle
              label="Sync on Mobile Data"
              description="Allow syncing when not on Wi-Fi"
              checked={syncOnMobile}
              onChange={setSyncOnMobile}
            />
          </>
        )}
      </SettingsSection>

      <SettingsSection title="Storage" description="Your cloud storage usage">
        <div className="py-4 px-4 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-900">
              Storage Used
            </span>
            <span className="text-sm text-slate-600">
              {storageUsed} GB of {storageTotal} GB
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {(storageTotal - storageUsed).toFixed(1)} GB available
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Cache" description="Manage local cached data">
        <div className="py-4 px-4 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-900">
                Clear Local Cache
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Remove locally cached data (notes will re-sync)
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
              Clear Cache
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
