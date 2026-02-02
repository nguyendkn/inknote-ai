# Codebase Summary

## Overview

InkNote AI is a hybrid desktop application that combines Next.js for the web UI layer with Electron for native desktop capabilities. The codebase follows modern React patterns with TypeScript for type safety.

## Project Structure

```
markitdown/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles & Tailwind imports
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main application page
│
├── components/             # React components
│   ├── editor/             # Editor-related components
│   │   └── Editor.tsx      # Main Markdown editor
│   ├── icons/              # Custom icon components
│   │   └── Logo.tsx        # Application logo
│   ├── layout/             # Layout components
│   │   ├── NoteList.tsx    # Note list panel
│   │   └── Sidebar.tsx     # Navigation sidebar
│   ├── settings/           # Settings modal components
│   │   ├── tabs/           # Individual setting tabs
│   │   │   ├── EditorTab.tsx
│   │   │   ├── GeneralTab.tsx
│   │   │   ├── PluginsTab.tsx
│   │   │   ├── ProfileTab.tsx
│   │   │   ├── SyncTab.tsx
│   │   │   └── WorkspaceTab.tsx
│   │   ├── ui/             # Settings UI primitives
│   │   │   ├── SettingsSection.tsx
│   │   │   ├── SettingsSelect.tsx
│   │   │   ├── SettingsToggle.tsx
│   │   │   ├── WorkspacePathInput.tsx
│   │   │   └── FolderTreeView.tsx
│   │   └── SettingsModal.tsx
│   └── ui/                 # Shared UI components
│       └── UpdateNotification.tsx
│
├── electron/               # Electron main process
│   ├── main.ts             # Main process entry point
│   ├── preload.ts          # Preload script (context bridge)
│   ├── updater.ts          # Auto-update functionality
│   └── electron.d.ts       # Electron type declarations
│
├── lib/                    # Shared utilities & services
│   ├── constants/          # Static data & mock data
│   │   ├── notebooks.tsx   # Mock notebook data
│   │   └── notes.tsx       # Mock note data
│   └── services/           # Backend services
│       └── gemini-service.ts   # Gemini AI integration
│
├── types/                  # TypeScript type definitions
│   ├── note.ts             # Note interface
│   └── notebook.ts         # Notebook interface
│
├── design-system/          # Design system documentation
│   └── inknote-ai/         # InkNote-specific designs
│
├── public/                 # Static assets
│   ├── icon.ico            # Windows icon
│   ├── icon.icns           # macOS icon
│   └── icon.png            # Linux icon
│
├── dist-electron/          # Compiled Electron code
├── release/                # Built application packages
├── .next/                  # Next.js build output
└── node_modules/           # Dependencies
```

## Key Directories

### `/app` - Next.js App Router

Contains the application's pages and layouts using Next.js 16 App Router:

- **`layout.tsx`**: Root layout with Geist fonts and metadata
- **`page.tsx`**: Main application page with three-panel layout

### `/components` - React Components

Organized by feature and responsibility:

| Directory | Purpose |
|-----------|---------|
| `editor/` | Markdown editor with AI integration |
| `icons/` | Custom SVG icon components |
| `layout/` | Application layout (Sidebar, NoteList) |
| `settings/` | Settings modal and configuration tabs |
| `ui/` | Shared UI primitives |

### `/electron` - Desktop Runtime

Electron-specific code for the desktop application:

| File | Purpose |
|------|---------|
| `main.ts` | Creates browser window, handles IPC |
| `preload.ts` | Exposes safe APIs to renderer |
| `updater.ts` | GitHub-based auto-update system |
| `config-service.ts` | Config file (configs.ini) management |
| `electron.d.ts` | Electron type declarations |

### `/lib` - Utilities & Services

Shared code and backend services:

| Directory | Purpose |
|-----------|---------|
| `constants/` | Mock data for notebooks and notes |
| `services/` | External service integrations (Gemini AI) |

### `/types` - Type Definitions

TypeScript interfaces for core data structures:

| File | Exports |
|------|---------|
| `note.ts` | `Note` interface, `ViewMode` enum |
| `notebook.ts` | `Notebook` interface |
| `config.ts` | `AppConfig`, `WorkspaceConfig`, `GeneralConfig` interfaces |

## Entry Points

### Web Application
- **Development**: `npm run dev` → `http://localhost:3000`
- **Entry**: [app/layout.tsx](app/layout.tsx) → [app/page.tsx](app/page.tsx)

### Electron Application
- **Development**: `npm run electron:dev`
- **Entry**: [electron/main.ts](electron/main.ts)

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.5 | React framework |
| `react` | 19.2.3 | UI library |
| `electron` | 35.7.5 | Desktop runtime |
| `@google/genai` | 1.39.0 | Gemini AI SDK |
| `@uiw/react-md-editor` | 4.0.11 | Markdown editor |
| `lucide-react` | 0.563.0 | Icon library |
| `better-sqlite3` | 12.6.2 | SQLite database |
| `uuid` | 13.0.0 | Unique ID generation |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | Type checking |
| `tailwindcss` | Utility-first CSS |
| `eslint` | Code linting |
| `electron-builder` | Application packaging |

## Build & Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build Next.js for production |
| `npm run electron:dev` | Start Electron in development |
| `npm run electron:build` | Build desktop app for current platform |
| `npm run electron:build:win` | Build for Windows |
| `npm run electron:build:mac` | Build for macOS |
| `npm run electron:build:linux` | Build for Linux |

## State Management

Currently using React's built-in state management:

- **Local State**: `useState` for component state
- **Props Drilling**: Data passed through component hierarchy
- **Server Actions**: Next.js server actions for AI calls

## Data Flow

```
User Input → Component State → Props → Child Components
                ↓
           Server Action (gemini-service.ts)
                ↓
           External API (Gemini)
                ↓
           Response → State Update → Re-render
```

---

*Last Updated: 2026-02-03*
