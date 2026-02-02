"use client";

import { useState } from "react";
import { SettingsSection } from "../ui/SettingsSection";
import { SettingsSelect } from "../ui/SettingsSelect";
import { SettingsToggle } from "../ui/SettingsToggle";

export function WorkspaceTab() {
  const [defaultNotebook, setDefaultNotebook] = useState("inbox");
  const [sortOrder, setSortOrder] = useState("modified");
  const [viewMode, setViewMode] = useState("list");
  const [showPreviews, setShowPreviews] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);

  return (
    <div>
      <SettingsSection
        title="Defaults"
        description="Set default workspace behavior"
      >
        <SettingsSelect
          label="Default Notebook"
          description="Where new notes are created"
          value={defaultNotebook}
          onChange={setDefaultNotebook}
          options={[
            { value: "inbox", label: "Inbox" },
            { value: "ideas", label: "Ideas" },
            { value: "work", label: "Work" },
            { value: "personal", label: "Personal" },
          ]}
        />
        <SettingsSelect
          label="Sort Order"
          description="Default note sorting"
          value={sortOrder}
          onChange={setSortOrder}
          options={[
            { value: "modified", label: "Last Modified" },
            { value: "created", label: "Date Created" },
            { value: "alpha", label: "Alphabetical" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="View"
        description="Customize note list appearance"
      >
        <SettingsSelect
          label="View Mode"
          description="How notes are displayed"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: "list", label: "List" },
            { value: "grid", label: "Grid" },
            { value: "compact", label: "Compact" },
          ]}
        />
        <SettingsToggle
          label="Show Previews"
          description="Display note content previews in list"
          checked={showPreviews}
          onChange={setShowPreviews}
        />
      </SettingsSection>

      <SettingsSection
        title="Confirmations"
        description="Control confirmation dialogs"
      >
        <SettingsToggle
          label="Confirm Delete"
          description="Ask before deleting notes"
          checked={confirmDelete}
          onChange={setConfirmDelete}
        />
      </SettingsSection>
    </div>
  );
}
