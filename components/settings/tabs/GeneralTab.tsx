"use client";

import { useState } from "react";
import { SettingsSection } from "../ui/SettingsSection";
import { SettingsSelect } from "../ui/SettingsSelect";
import { SettingsToggle } from "../ui/SettingsToggle";

export function GeneralTab() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [startPage, setStartPage] = useState("last");
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);

  return (
    <div>
      <SettingsSection
        title="Appearance"
        description="Customize how InkNote looks"
      >
        <SettingsSelect
          label="Theme"
          description="Choose your preferred color scheme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
        <SettingsSelect
          label="Language"
          description="Select your preferred language"
          value={language}
          onChange={setLanguage}
          options={[
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "fr", label: "Français" },
            { value: "de", label: "Deutsch" },
            { value: "vi", label: "Tiếng Việt" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Startup" description="Configure startup behavior">
        <SettingsSelect
          label="Start Page"
          description="What to show when opening the app"
          value={startPage}
          onChange={setStartPage}
          options={[
            { value: "last", label: "Last opened note" },
            { value: "home", label: "Home dashboard" },
            { value: "new", label: "New note" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Manage notification preferences"
      >
        <SettingsToggle
          label="Push Notifications"
          description="Receive notifications for updates and reminders"
          checked={notifications}
          onChange={setNotifications}
        />
        <SettingsToggle
          label="Sound Effects"
          description="Play sounds for actions"
          checked={sounds}
          onChange={setSounds}
        />
      </SettingsSection>
    </div>
  );
}
