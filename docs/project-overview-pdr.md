# Project Overview & Product Development Requirements (PDR)

## Project Information

| Field | Value |
|-------|-------|
| **Project Name** | InkNote AI |
| **Version** | 0.2.1 |
| **Author** | Dao Khoi Nguyen |
| **Repository** | nguyendkn/inknote-ai |

## Project Overview

InkNote AI is an AI-powered Markdown note-taking desktop application built with modern web technologies. It combines the power of Electron for desktop deployment with Next.js for a performant React-based UI, and integrates Google's Gemini AI for intelligent content generation.

### Vision

To provide a seamless, intelligent note-taking experience that leverages AI to help users write, organize, and enhance their notes more efficiently.

### Target Users

- **Knowledge Workers**: Professionals who need to organize ideas, meeting notes, and research
- **Writers & Content Creators**: Users who write in Markdown and benefit from AI assistance
- **Developers**: Technical users who prefer Markdown for documentation
- **Students & Researchers**: Users who need to organize and expand on study materials

## Key Features

### Core Functionality

| Feature | Description | Status |
|---------|-------------|--------|
| **Markdown Editor** | Full-featured Markdown editor with live preview | ✅ Implemented |
| **Notebook Organization** | Hierarchical notebook/folder structure for notes | ✅ Implemented |
| **AI Content Generation** | Gemini AI integration for content assistance | ✅ Implemented |
| **Responsive Design** | Adaptive UI for different screen sizes | ✅ Implemented |
| **Auto Updates** | Automatic application updates via GitHub releases | ✅ Implemented |
| **Settings Management** | Comprehensive settings modal with multiple tabs | ✅ Implemented |

### AI Capabilities

- **Content Generation**: Generate new content based on prompts
- **Note Summarization**: Summarize existing note content
- **Content Expansion**: Expand on topics within notes
- **Smart Writing Assistance**: Contextual AI suggestions

### User Interface

- **Three-Panel Layout**: Sidebar → Note List → Editor
- **Dark Sidebar**: Modern dark theme for navigation
- **Light Editor**: Clean, distraction-free editing experience
- **Mobile Responsive**: Collapsible panels for mobile devices

## Product Requirements

### Functional Requirements

#### FR-001: Note Management
- Users can create, read, update, and delete notes
- Notes contain title, content (Markdown), tags, and metadata
- Notes are organized within notebooks

#### FR-002: Notebook Organization
- Hierarchical folder/notebook structure
- Expandable/collapsible notebook tree
- "All Notes" and "Pinned Notes" quick access

#### FR-003: Markdown Editing
- Live preview mode
- Full Markdown syntax support
- Tag management per note

#### FR-004: AI Integration
- Gemini AI content generation
- Context-aware prompts using current note content
- Modal-based AI interaction

#### FR-005: Desktop Application
- Cross-platform support (Windows, macOS, Linux)
- Auto-update functionality
- System tray integration

### Non-Functional Requirements

#### NFR-001: Performance
- Application should load within 3 seconds
- Editor should handle notes up to 10,000 words without lag
- AI responses should appear within 5 seconds

#### NFR-002: Security
- Context isolation enabled in Electron
- Node integration disabled for renderer
- Secure preload script pattern

#### NFR-003: Usability
- Intuitive three-panel layout
- Keyboard shortcuts for common actions
- Responsive design for various screen sizes

#### NFR-004: Maintainability
- TypeScript for type safety
- Component-based architecture
- Clear separation of concerns

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Desktop Runtime** | Electron 35 |
| **Styling** | Tailwind CSS 4 |
| **Language** | TypeScript 5 |
| **Markdown Editor** | @uiw/react-md-editor |
| **AI Integration** | Google Gemini API (@google/genai) |
| **Database** | better-sqlite3 (planned) |
| **Icons** | Lucide React |
| **Package Manager** | pnpm |

## Roadmap

### Phase 1: MVP (Current)
- [x] Basic note CRUD operations
- [x] Notebook organization
- [x] Markdown editing with preview
- [x] AI content generation
- [x] Desktop application packaging
- [x] Auto-update system

### Phase 2: Enhanced Features (Planned)
- [ ] Local SQLite database for persistence
- [ ] Full-text search across notes
- [ ] Tag-based filtering
- [ ] Export to PDF/HTML
- [ ] Cloud sync integration

### Phase 3: Advanced Features (Future)
- [ ] Real-time collaboration
- [ ] Plugin system
- [ ] Custom themes
- [ ] Advanced AI features (summarization, translation)
- [ ] Version history for notes

## Success Metrics

| Metric | Target |
|--------|--------|
| Application Load Time | < 3 seconds |
| Editor Response Time | < 100ms |
| AI Generation Time | < 5 seconds |
| Crash Rate | < 0.1% |
| User Satisfaction | > 4.5/5 stars |

---

*Last Updated: 2026-02-02*
