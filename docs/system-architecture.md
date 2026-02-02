# System Architecture

## Overview

InkNote AI follows a hybrid desktop application architecture, combining a Next.js web application with Electron for native desktop capabilities.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Desktop Application"
        subgraph "Electron Main Process"
            EM[Main Process<br/>electron/main.ts]
            UP[Auto Updater<br/>electron/updater.ts]
            IPC[IPC Handlers]
        end

        subgraph "Electron Renderer Process"
            PL[Preload Script<br/>electron/preload.ts]

            subgraph "Next.js Application"
                NX[Next.js Runtime]

                subgraph "React UI Layer"
                    APP[App Layout]
                    SB[Sidebar]
                    NL[NoteList]
                    ED[Editor]
                    SM[Settings Modal]
                end

                subgraph "Services"
                    GS[Gemini Service]
                end
            end
        end
    end

    subgraph "External Services"
        GA[Google Gemini API]
        GH[GitHub Releases]
    end

    EM --> IPC
    IPC <--> PL
    EM --> UP
    UP <--> GH
    PL <--> NX
    GS <--> GA

    APP --> SB
    APP --> NL
    APP --> ED
    APP --> SM
    ED --> GS
```

## Component Architecture

```mermaid
graph LR
    subgraph "Page Component"
        HP[Home Page<br/>app/page.tsx]
    end

    subgraph "Layout Components"
        SB[Sidebar]
        NL[NoteList]
    end

    subgraph "Feature Components"
        ED[Editor]
        SM[SettingsModal]
        UN[UpdateNotification]
    end

    subgraph "Settings Tabs"
        PT[ProfileTab]
        GT[GeneralTab]
        ET[EditorTab]
        WT[WorkspaceTab]
        ST[SyncTab]
        PLT[PluginsTab]
    end

    HP --> SB
    HP --> NL
    HP --> ED
    HP --> SM
    HP --> UN

    SM --> PT
    SM --> GT
    SM --> ET
    SM --> WT
    SM --> ST
    SM --> PLT
```

## Data Flow

### Note Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant ED as Editor
    participant HP as Home Page
    participant NL as NoteList

    U->>ED: Edit note content
    ED->>HP: onUpdateNote(updatedNote)
    HP->>HP: setNotes(updated)
    HP->>NL: notes prop update
    HP->>ED: note prop update
    ED->>U: Re-render with new content
```

### AI Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant ED as Editor
    participant GS as Gemini Service
    participant GA as Gemini API

    U->>ED: Click "AI Assist"
    ED->>ED: Show AI Modal
    U->>ED: Enter prompt
    U->>ED: Click "Generate"
    ED->>GS: generateNoteContent(prompt, content)
    GS->>GA: API Request
    GA->>GS: Generated text
    GS->>ED: Return content
    ED->>ED: Append to note
    ED->>U: Display updated note
```

### Electron IPC Flow

```mermaid
sequenceDiagram
    participant R as Renderer
    participant PL as Preload
    participant M as Main Process
    participant OS as Operating System

    R->>PL: window.electronAPI.getAppVersion()
    PL->>M: ipcRenderer.invoke('get-app-version')
    M->>M: app.getVersion()
    M->>PL: Return version
    PL->>R: Return version

    M->>OS: Check for updates
    OS->>M: Update available
    M->>R: Send update notification
```

## Layer Architecture

### Presentation Layer

| Component | Responsibility |
|-----------|----------------|
| `app/page.tsx` | Main page, state management, layout |
| `Sidebar` | Notebook navigation, user profile |
| `NoteList` | Note listing and selection |
| `Editor` | Note editing, AI integration |
| `SettingsModal` | Application settings |

### Service Layer

| Service | Responsibility |
|---------|----------------|
| `gemini-service.ts` | AI content generation |
| `updater.ts` | Application updates |

### Data Layer

| Type | Current | Planned |
|------|---------|---------|
| Notes | In-memory state | SQLite database |
| Notebooks | Mock constants | SQLite database |
| Settings | Not persisted | Local storage / SQLite |

## Electron Architecture

### Process Model

```
┌─────────────────────────────────────────────────────┐
│                   Main Process                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   main.ts   │  │  updater.ts │  │ IPC Handlers│ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                    IPC Bridge
                         │
┌─────────────────────────────────────────────────────┐
│                 Renderer Process                     │
│  ┌─────────────┐  ┌──────────────────────────────┐ │
│  │ preload.ts  │──│     Next.js Application      │ │
│  └─────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Security Model

```mermaid
graph LR
    subgraph "Renderer (Untrusted)"
        WEB[Web Content]
    end

    subgraph "Context Bridge"
        PL[Preload Script]
    end

    subgraph "Main Process (Trusted)"
        NODE[Node.js APIs]
        OS[System APIs]
    end

    WEB -->|Limited API| PL
    PL -->|Full Access| NODE
    NODE --> OS
```

**Security Features:**
- `contextIsolation: true` - Renderer can't access Node.js
- `nodeIntegration: false` - No direct Node access in renderer
- Preload script exposes only safe APIs via `contextBridge`

## State Management

### Current Approach

```typescript
// Component-level state in Home page
const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>("ideas");
const [selectedNoteId, setSelectedNoteId] = useState<string | null>(MOCK_NOTES[0].id);
const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
const [sidebarOpen, setSidebarOpen] = useState(true);
const [noteListOpen, setNoteListOpen] = useState(true);
const [isMobile, setIsMobile] = useState(false);
const [settingsOpen, setSettingsOpen] = useState(false);
```

### State Flow

```
Home Page (State Owner)
    ├── Sidebar (receives: notebooks, selectedNotebookId)
    ├── NoteList (receives: notes, selectedNoteId)
    └── Editor (receives: note, onUpdateNote callback)
```

## File System Structure

```
Application Files
├── dist-electron/          # Compiled Electron code
│   └── electron/
│       ├── main.js
│       └── preload.js
├── out/                    # Next.js static export
│   ├── index.html
│   └── _next/
└── release/                # Built installers
    ├── win-unpacked/
    └── InkNote AI Setup.exe
```

## Technology Stack Diagram

```mermaid
graph TB
    subgraph "Frontend"
        REACT[React 19]
        NEXT[Next.js 16]
        TW[Tailwind CSS 4]
        TS[TypeScript 5]
    end

    subgraph "Desktop"
        ELECTRON[Electron 35]
        BUILDER[electron-builder]
        UPDATER[electron-updater]
    end

    subgraph "Editor"
        MDEDIT[@uiw/react-md-editor]
        MDPREV[@uiw/react-markdown-preview]
    end

    subgraph "AI"
        GENAI[@google/genai]
        GEMINI[Gemini 2.0 Flash]
    end

    subgraph "Database (Planned)"
        SQLITE[better-sqlite3]
    end

    NEXT --> REACT
    REACT --> TS
    NEXT --> TW
    ELECTRON --> NEXT
    MDEDIT --> REACT
    GENAI --> GEMINI
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development"
        DEV[npm run dev]
        EDEV[npm run electron:dev]
    end

    subgraph "Build"
        BUILD[npm run build]
        EBUILD[npm run electron:build]
    end

    subgraph "Distribution"
        WIN[Windows .exe]
        MAC[macOS .dmg]
        LINUX[Linux .AppImage]
    end

    subgraph "Updates"
        GH[GitHub Releases]
    end

    DEV --> BUILD
    EDEV --> EBUILD
    BUILD --> EBUILD
    EBUILD --> WIN
    EBUILD --> MAC
    EBUILD --> LINUX
    WIN --> GH
    MAC --> GH
    LINUX --> GH
```

## Future Architecture Considerations

### Planned Improvements

1. **Database Layer**
   - SQLite for local persistence
   - Migrations system
   - Data sync abstraction

2. **State Management**
   - Consider Zustand or Jotai for complex state
   - React Query for async state

3. **Plugin System**
   - Plugin API definition
   - Sandboxed plugin execution
   - Plugin marketplace

4. **Cloud Sync**
   - Sync service abstraction
   - Conflict resolution strategy
   - Offline-first architecture

---

*Last Updated: 2026-02-02*
