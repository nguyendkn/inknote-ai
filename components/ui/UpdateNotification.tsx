"use client";

import type { UpdateState } from "@/electron/electron.d";
import { AlertCircle, CheckCircle, Download, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

export function UpdateNotification() {
  const [state, setState] = useState<UpdateState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI?.updater) return;

    // Get initial status
    window.electronAPI.updater.getStatus().then(setState);

    // Subscribe to status updates
    const unsubscribe = window.electronAPI.updater.onStatus(setState);
    return unsubscribe;
  }, []);

  const handleCheckUpdate = async () => {
    if (!window.electronAPI?.updater) return;
    await window.electronAPI.updater.check();
  };

  const handleInstall = () => {
    if (!window.electronAPI?.updater) return;
    window.electronAPI.updater.install();
  };

  const handleDismiss = () => setDismissed(true);

  // Don't show in browser or when dismissed
  if (
    typeof window === "undefined" ||
    !window.electronAPI?.updater ||
    dismissed
  ) {
    return null;
  }

  // Only show for relevant states
  if (!state || state.status === "idle" || state.status === "not-available") {
    return null;
  }

  const getContent = () => {
    switch (state.status) {
      case "checking":
        return (
          <div className="update-notification checking">
            <RefreshCw className="icon spin" size={16} />
            <span>Checking for updates...</span>
          </div>
        );

      case "available":
        return (
          <div className="update-notification available">
            <Download className="icon" size={16} />
            <span>Update {state.info?.version} available - downloading...</span>
          </div>
        );

      case "downloading":
        return (
          <div className="update-notification downloading">
            <Download className="icon" size={16} />
            <div className="download-info">
              <span>Downloading update...</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${state.progress?.percent ?? 0}%` }}
                />
              </div>
              <span className="percent">
                {Math.round(state.progress?.percent ?? 0)}%
              </span>
            </div>
          </div>
        );

      case "ready":
        return (
          <div className="update-notification ready">
            <CheckCircle className="icon" size={16} />
            <span>Update {state.info?.version} ready!</span>
            <button onClick={handleInstall} className="install-btn">
              Restart to Update
            </button>
            <button onClick={handleDismiss} className="dismiss-btn">
              <X size={14} />
            </button>
          </div>
        );

      case "error":
        return (
          <div className="update-notification error">
            <AlertCircle className="icon" size={16} />
            <span>Update error: {state.error}</span>
            <button onClick={handleCheckUpdate} className="retry-btn">
              Retry
            </button>
            <button onClick={handleDismiss} className="dismiss-btn">
              <X size={14} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return <div className="update-notification-wrapper">{content}</div>;
}
