# Code Standards & Structure Guidelines

## Overview

This document defines the coding standards, conventions, and best practices for the InkNote AI codebase.

## File & Folder Structure

### Directory Organization

```
Feature-based organization with shared utilities:

components/
├── feature-name/           # Feature-specific components
│   ├── FeatureComponent.tsx
│   └── SubComponent.tsx
├── layout/                 # Layout components
├── ui/                     # Shared UI primitives
└── icons/                  # Icon components
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `SettingsModal.tsx` |
| **Hooks** | camelCase with `use` prefix | `useNotes.ts` |
| **Utilities** | camelCase | `formatDate.ts` |
| **Types** | PascalCase | `Note.ts` |
| **Constants** | SCREAMING_SNAKE_CASE | `MOCK_NOTES` |
| **Directories** | kebab-case | `settings-modal/` |

## TypeScript Standards

### Type Definitions

```typescript
// ✅ Use interfaces for object shapes
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: Date;
  notebookId: string;
  isPinned?: boolean;  // Optional properties with ?
}

// ✅ Use enums for fixed sets of values
export enum ViewMode {
  EDIT = "EDIT",
  PREVIEW = "PREVIEW",
}

// ✅ Use type for unions or complex types
type TabId = "profile" | "general" | "editor" | "workspace";
```

### Component Props

```typescript
// ✅ Define props interface inline or separately
interface EditorProps {
  note: Note | undefined;
  onUpdateNote: (updatedNote: Note) => void;
}

export function Editor({ note, onUpdateNote }: EditorProps) {
  // ...
}
```

### Generic Types

```typescript
// ✅ Use generics for reusable utilities
const [expanded, setExpanded] = useState<Record<string, boolean>>({});
```

## React Patterns

### Component Structure

```typescript
"use client"; // Client component directive (if needed)

// 1. Imports (external → internal → types → styles)
import { useState, useEffect } from "react";
import { SomeComponent } from "@/components/ui";
import { Note } from "@/types/note";
import styles from "./Component.module.css";

// 2. Type definitions
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// 3. Component definition
export function Component({ prop1, prop2 = 0 }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState(false);

  // 3b. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3c. Handlers
  const handleClick = () => {
    // ...
  };

  // 3d. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 4. Default export (if needed)
export default Component;
```

### Hooks Guidelines

```typescript
// ✅ Use useCallback for event handlers passed to children
const handleKeyDown = useCallback(
  (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  },
  [onClose]
);

// ✅ Use useEffect for side effects
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
```

### Dynamic Imports

```typescript
// ✅ Use dynamic imports for SSR-incompatible components
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
```

## Styling Standards

### Tailwind CSS

```tsx
// ✅ Use template literals for conditional classes
<div
  className={`
    flex items-center px-3 py-2 rounded-lg text-sm
    transition-all duration-200
    ${isSelected
      ? "bg-blue-500 text-white shadow-md"
      : "text-slate-600 hover:bg-slate-100"
    }
  `}
>
```

### Custom CSS Variables

```css
/* globals.css */
:root {
  --sidebar-bg: #18181b;
  --sidebar-hover: rgba(255, 255, 255, 0.05);
  --sidebar-active: rgba(59, 130, 246, 0.9);
}
```

### Responsive Design

```tsx
// ✅ Mobile-first approach
<div className="px-4 md:px-6 pt-4 pb-3">
  {/* Base: px-4, Medium+: px-6 */}
</div>

// ✅ Conditional rendering for mobile
{isMobile && (
  <button onClick={() => setSidebarOpen(!sidebarOpen)}>
    <Menu size={20} />
  </button>
)}
```

## Server Actions

### Gemini Service Pattern

```typescript
"use server";

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateNoteContent(
  prompt: string,
  currentContent: string,
  modelName: string = "gemini-2.0-flash"
): Promise<string> {
  // Validate API key
  if (!apiKey) {
    return "Error: API Key is missing.";
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "(Error generating content.)";
  }
}
```

## Electron Patterns

### Main Process

```typescript
// ✅ Security best practices
mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,      // Isolate renderer context
    nodeIntegration: false,      // Disable Node in renderer
  },
});
```

### IPC Communication

```typescript
// Main process - handle IPC
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

// Preload - expose safe APIs
contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
```

## Import Aliases

```typescript
// ✅ Use @ alias for absolute imports
import { Editor } from "@/components/editor/Editor";
import { Note } from "@/types/note";
import { MOCK_NOTES } from "@/lib/constants/notes";
```

## Error Handling

```typescript
// ✅ Try-catch with meaningful error messages
try {
  const response = await ai.models.generateContent({...});
  return response.text || "";
} catch (error) {
  console.error("Gemini API Error:", error);
  return "(Error generating content. Please check your API key.)";
}
```

## Code Quality Tools

### ESLint Configuration

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Git Commit Standards

### Conventional Commits

```
<type>(<scope>): <subject>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Formatting, no code change
- refactor: Code restructuring
- test:     Adding tests
- chore:    Maintenance

Examples:
feat(editor): add AI content generation
fix(sidebar): correct notebook expansion state
docs(readme): update installation instructions
```

## Best Practices Summary

1. **Type Safety**: Always use TypeScript types/interfaces
2. **Component Size**: Keep components focused and under 200 lines
3. **Naming**: Use descriptive, consistent naming
4. **Imports**: Group and order imports logically
5. **Security**: Follow Electron security best practices
6. **Accessibility**: Include ARIA labels and keyboard support
7. **Performance**: Use dynamic imports for heavy components
8. **Error Handling**: Always handle errors gracefully

---

*Last Updated: 2026-02-02*
