"use client";

import { useState } from "react";
import { SettingsSection } from "../ui/SettingsSection";
import { SettingsSelect } from "../ui/SettingsSelect";
import { SettingsToggle } from "../ui/SettingsToggle";

export function EditorTab() {
  const [fontFamily, setFontFamily] = useState("inter");
  const [fontSize, setFontSize] = useState("15");
  const [lineHeight, setLineHeight] = useState("1.75");
  const [spellCheck, setSpellCheck] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  return (
    <div>
      <SettingsSection
        title="Typography"
        description="Customize editor text appearance"
      >
        <SettingsSelect
          label="Font Family"
          description="Choose a font for the editor"
          value={fontFamily}
          onChange={setFontFamily}
          options={[
            { value: "inter", label: "Inter" },
            { value: "system", label: "System Default" },
            { value: "mono", label: "Monospace" },
            { value: "serif", label: "Serif" },
          ]}
        />
        <SettingsSelect
          label="Font Size"
          description="Adjust text size"
          value={fontSize}
          onChange={setFontSize}
          options={[
            { value: "13", label: "Small (13px)" },
            { value: "15", label: "Medium (15px)" },
            { value: "17", label: "Large (17px)" },
            { value: "19", label: "Extra Large (19px)" },
          ]}
        />
        <SettingsSelect
          label="Line Height"
          description="Space between lines"
          value={lineHeight}
          onChange={setLineHeight}
          options={[
            { value: "1.5", label: "Compact" },
            { value: "1.75", label: "Normal" },
            { value: "2", label: "Relaxed" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Editing" description="Configure editing behavior">
        <SettingsToggle
          label="Spell Check"
          description="Highlight spelling errors"
          checked={spellCheck}
          onChange={setSpellCheck}
        />
        <SettingsToggle
          label="Auto Save"
          description="Automatically save changes"
          checked={autoSave}
          onChange={setAutoSave}
        />
        <SettingsToggle
          label="Word Wrap"
          description="Wrap long lines"
          checked={wordWrap}
          onChange={setWordWrap}
        />
      </SettingsSection>

      <SettingsSection title="Display" description="Editor display options">
        <SettingsToggle
          label="Line Numbers"
          description="Show line numbers in the editor"
          checked={lineNumbers}
          onChange={setLineNumbers}
        />
      </SettingsSection>
    </div>
  );
}
