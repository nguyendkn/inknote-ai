# Implementation Plan: Executable Bash Code Blocks

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Executable Bash Code Blocks |
| **Date** | 2026-02-03 |
| **Status** | ✅ Implemented |
| **Priority** | High |
| **Complexity** | Medium-High |

## Description

Thêm tính năng cho phép execute bash commands trực tiếp từ code blocks trong markdown editor. Khi user insert code block với tag `bash` hoặc `shell`, sẽ hiển thị nút play để chạy command và hiển thị output.

## Research Reports

- [Electron Command Execution](./research/researcher-01-electron-command-execution.md)
- [UI/UX Executable Code Blocks](./research/researcher-02-ui-ux-executable-code-blocks.md)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ MDEditor                                                 ││
│  │  └── CodeBlockRenderer (custom)                         ││
│  │       ├── ExecutableCodeBlock                           ││
│  │       │    ├── RunButton                                ││
│  │       │    ├── OutputPanel                              ││
│  │       │    └── ConfirmDialog                            ││
│  │       └── useBashExecutor hook                          ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                   IPC Bridge (preload.ts)                   │
│                            │                                 │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                     Main Process                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ BashExecutor Service                                     ││
│  │  ├── spawn with streaming                               ││
│  │  ├── Process management                                 ││
│  │  └── Security validation                                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 1 | [Electron IPC Setup](./phase-01-electron-ipc-setup.md) | ✅ Complete | 100% |
| 2 | [UI Components](./phase-02-ui-components.md) | ✅ Complete | 100% |
| 3 | [Editor Integration](./phase-03-editor-integration.md) | ✅ Complete | 100% |
| 4 | [Security & Polish](./phase-04-security-polish.md) | ✅ Complete | 100% |

## Key Files to Modify/Create

### New Files
- `electron/bash-executor.ts` - Main process bash execution
- `components/editor/ExecutableCodeBlock.tsx` - UI component
- `components/editor/RunButton.tsx` - Play button component
- `components/editor/OutputPanel.tsx` - Output display
- `components/editor/ConfirmDialog.tsx` - Dangerous command warning
- `lib/hooks/useBashExecutor.ts` - React hook for execution
- `lib/utils/command-validator.ts` - Security validation

### Modified Files
- `electron/main.ts` - Add IPC handlers
- `electron/preload.ts` - Expose bash API
- `electron/electron.d.ts` - Type declarations
- `components/editor/Editor.tsx` - Integrate code block renderer

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Security vulnerabilities | Medium | High | Confirmation dialogs, dangerous command detection |
| Long-running commands freeze | Medium | Medium | Timeout, cancel button |
| Cross-platform issues | Low | Medium | Test on Windows/Mac/Linux |

## Success Criteria

- [x] Bash code blocks show play button on hover
- [x] Commands execute and show streaming output
- [x] Cancel button works for running commands
- [x] Dangerous commands show confirmation
- [x] Output can be copied/cleared
- [x] UI matches InkNote design system
- [ ] Works on Windows, macOS, Linux (needs testing)

---

*Created: 2026-02-03*
*Implemented: 2026-02-03*
