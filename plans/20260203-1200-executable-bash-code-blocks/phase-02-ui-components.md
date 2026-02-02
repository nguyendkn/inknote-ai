# Phase 2: UI Components

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 1: Electron IPC Setup](./phase-01-electron-ipc-setup.md)
- **Documentation**: [UI/UX Research](./research/researcher-02-ui-ux-executable-code-blocks.md)

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-03 |
| **Description** | Tạo UI components cho executable code blocks theo ui-ux-pro-max principles |
| **Priority** | High |
| **Implementation Status** | ⏳ Pending |
| **Review Status** | ⏳ Pending |

## Key Insights

1. Play button visible on hover, inline với code block header
2. Output panel slide-down animation, inline dưới code block
3. Match existing InkNote design: rounded corners, subtle shadows, blue accent

## Requirements

- RunButton component với states: idle, hover, running, success, error
- OutputPanel với streaming output, copy, clear, close actions
- Smooth animations (150ms-300ms transitions)
- Responsive và accessible

## Architecture

```
ExecutableCodeBlock
├── Header
│   ├── Language badge (bash)
│   └── RunButton
├── Code content
└── OutputPanel (conditional)
    ├── Output header
    │   ├── Status badge
    │   └── Actions (copy, clear, close)
    └── Output content (scrollable)
```

## Related Code Files

| File | Purpose |
|------|---------|
| `components/editor/RunButton.tsx` | **NEW** - Play/stop button |
| `components/editor/OutputPanel.tsx` | **NEW** - Output display |
| `components/editor/ExecutableCodeBlock.tsx` | **NEW** - Wrapper component |
| `lib/hooks/useBashExecutor.ts` | **NEW** - React hook |
| [app/globals.css](../../app/globals.css) | Add animations |

## Implementation Steps

### Step 1: Create useBashExecutor Hook
```typescript
// lib/hooks/useBashExecutor.ts
interface UseBashExecutorReturn {
  execute: (command: string) => void;
  kill: () => void;
  status: 'idle' | 'running' | 'success' | 'error';
  output: string;
  exitCode: number | null;
  clear: () => void;
}

export function useBashExecutor(): UseBashExecutorReturn {
  // State management, IPC calls, cleanup
}
```

### Step 2: Create RunButton Component
```tsx
// components/editor/RunButton.tsx
interface RunButtonProps {
  status: 'idle' | 'running' | 'success' | 'error';
  onRun: () => void;
  onStop: () => void;
  disabled?: boolean;
}

// Design specs:
// - Size: 28x28px
// - Border radius: 6px
// - Hover: scale(1.05), bg opacity increase
// - Running: spinner animation
// - Success: brief checkmark flash
// - Error: red tint
```

### Step 3: Create OutputPanel Component
```tsx
// components/editor/OutputPanel.tsx
interface OutputPanelProps {
  output: string;
  status: 'running' | 'success' | 'error';
  exitCode: number | null;
  onCopy: () => void;
  onClear: () => void;
  onClose: () => void;
}

// Design specs:
// - Max height: 300px, scrollable
// - Monospace font (Geist Mono or system)
// - Green left border for success
// - Red left border for error
// - Slide-down entrance animation
```

### Step 4: Create ExecutableCodeBlock Component
```tsx
// components/editor/ExecutableCodeBlock.tsx
interface ExecutableCodeBlockProps {
  code: string;
  language: string;
}

// Wraps code block with run functionality
// Shows RunButton on hover
// Manages execution state
```

### Step 5: Add CSS Animations
```css
/* app/globals.css */
@keyframes slideDown {
  from { max-height: 0; opacity: 0; }
  to { max-height: 300px; opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## UI/UX Specifications (ui-ux-pro-max)

### Color Tokens
```css
--run-idle: #64748b;          /* slate-500 */
--run-hover: #3b82f6;         /* blue-500 */
--run-active: #2563eb;        /* blue-600 */
--output-success: #22c55e;    /* green-500 */
--output-error: #ef4444;      /* red-500 */
--output-bg: #f8fafc;         /* slate-50 */
```

### Animation Timing
- Hover transitions: 150ms ease-out
- Output panel: 200ms ease-out
- Spinner: 600ms linear infinite
- Success flash: 300ms ease-out

### Spacing
- Button padding: 6px
- Output panel padding: 12px
- Gap between code and output: 0 (seamless)

## Todo List

- [ ] Tạo `lib/hooks/useBashExecutor.ts`
- [ ] Tạo `components/editor/RunButton.tsx`
- [ ] Tạo `components/editor/OutputPanel.tsx`
- [ ] Tạo `components/editor/ExecutableCodeBlock.tsx`
- [ ] Add animations vào `globals.css`
- [ ] Add type declarations nếu cần

## Success Criteria

- [ ] RunButton shows correct states
- [ ] OutputPanel displays streaming output
- [ ] Animations smooth (60fps)
- [ ] Copy/clear/close work correctly
- [ ] Responsive trên mobile
- [ ] Keyboard accessible

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Output too large | Virtual scrolling hoặc truncate |
| Animation jank | Use transform/opacity only |

## Security Considerations

- Sanitize output để tránh XSS (unlikely nhưng safe)

## Next Steps

After completion, proceed to [Phase 3: Editor Integration](./phase-03-editor-integration.md)
