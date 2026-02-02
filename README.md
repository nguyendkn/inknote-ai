# InkNote AI

An AI-powered Markdown note-taking desktop application built with Next.js and Electron.

![Version](https://img.shields.io/badge/version-0.2.1-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

InkNote AI is a modern desktop note-taking application that combines the power of Markdown editing with AI-assisted content generation. Built with cutting-edge web technologies and packaged as a native desktop app.

### Key Features

- **Markdown Editor** - Full-featured editor with live preview
- **AI Assistance** - Powered by Google Gemini for smart content generation
- **Notebook Organization** - Hierarchical folders for organizing notes
- **Cross-Platform** - Available on Windows, macOS, and Linux
- **Auto Updates** - Automatic updates via GitHub releases
- **Responsive Design** - Adaptive UI for all screen sizes

## Screenshots

*Coming soon*

## Installation

### Download Pre-built Binaries

Download the latest release for your platform from [GitHub Releases](https://github.com/nguyendkn/inknote-ai/releases).

| Platform | Download |
|----------|----------|
| Windows | `InkNote-AI-Setup-x.x.x.exe` |
| macOS | `InkNote-AI-x.x.x.dmg` |
| Linux | `InkNote-AI-x.x.x.AppImage` |

### Build from Source

```bash
# Clone the repository
git clone https://github.com/nguyendkn/inknote-ai.git
cd inknote-ai

# Install dependencies
pnpm install

# Run in development mode
pnpm electron:dev

# Build for your platform
pnpm electron:build
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build Next.js for production |
| `pnpm electron:dev` | Run Electron in development mode |
| `pnpm electron:build` | Build desktop app for current platform |
| `pnpm electron:build:win` | Build for Windows |
| `pnpm electron:build:mac` | Build for macOS |
| `pnpm electron:build:linux` | Build for Linux |
| `pnpm lint` | Run ESLint |

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Project Structure

```
inknote-ai/
├── app/                # Next.js App Router pages
├── components/         # React components
│   ├── editor/         # Markdown editor
│   ├── layout/         # Sidebar, NoteList
│   ├── settings/       # Settings modal
│   └── ui/             # Shared UI components
├── electron/           # Electron main process
├── lib/                # Utilities & services
├── types/              # TypeScript definitions
└── docs/               # Documentation
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| UI | React 19 |
| Desktop | Electron 35 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| AI | Google Gemini API |
| Editor | @uiw/react-md-editor |

## Documentation

Detailed documentation is available in the [docs/](docs/) directory:

- [Project Overview & PDR](docs/project-overview-pdr.md) - Project goals, features, and requirements
- [Codebase Summary](docs/codebase-summary.md) - Project structure and dependencies
- [Code Standards](docs/code-standards.md) - Coding conventions and best practices
- [System Architecture](docs/system-architecture.md) - Architecture diagrams and design decisions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: documentation changes
style: formatting, no code change
refactor: code restructuring
test: adding tests
chore: maintenance
```

## Roadmap

- [x] Basic note CRUD operations
- [x] Markdown editing with preview
- [x] AI content generation
- [x] Desktop application packaging
- [ ] Local SQLite database
- [ ] Full-text search
- [ ] Cloud sync
- [ ] Plugin system

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Dao Khoi Nguyen**

- GitHub: [@nguyendkn](https://github.com/nguyendkn)

---

Made with ❤️ using Next.js, Electron, and Gemini AI
