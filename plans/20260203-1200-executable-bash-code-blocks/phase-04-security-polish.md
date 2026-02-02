# Phase 4: Security & Polish

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 3: Editor Integration](./phase-03-editor-integration.md)
- **Documentation**: [Electron Command Execution Research](./research/researcher-01-electron-command-execution.md)

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-03 |
| **Description** | Add security measures, confirmation dialogs, và polish UX |
| **Priority** | High |
| **Implementation Status** | ⏳ Pending |
| **Review Status** | ⏳ Pending |

## Key Insights

1. Dangerous commands cần confirmation dialog
2. Timeout protection cho long-running commands
3. Working directory restriction
4. Error messages user-friendly

## Requirements

- Confirmation dialog cho dangerous commands
- Timeout auto-kill (configurable)
- User-friendly error messages
- Keyboard shortcuts (Ctrl/Cmd+Enter to run)
- Accessibility improvements

## Architecture

```
Command Execution Flow:

User clicks Run
       ↓
Check isDangerous(command)
       ↓
   ┌───┴───┐
   │       │
 Yes      No
   │       │
   ↓       ↓
Show    Execute
Dialog  immediately
   │
User confirms?
   │
   ↓
Execute
```

## Related Code Files

| File | Purpose |
|------|---------|
| `lib/utils/command-validator.ts` | **NEW** - Dangerous command detection |
| `components/editor/ConfirmDialog.tsx` | **NEW** - Warning dialog |
| `components/editor/ExecutableCodeBlock.tsx` | Add confirmation flow |
| `electron/bash-executor.ts` | Add timeout |

## Implementation Steps

### Step 1: Create Command Validator
```typescript
// lib/utils/command-validator.ts
const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+(-rf?|--recursive)\s+[\/~]/i, reason: 'Recursive delete from root or home' },
  { pattern: /mkfs/i, reason: 'Format filesystem' },
  { pattern: /dd\s+if=/i, reason: 'Low-level disk write' },
  { pattern: /:()\{\s*:\|:&\s*\};:/i, reason: 'Fork bomb' },
  { pattern: />\s*\/dev\/(sda|nvme|hd)/i, reason: 'Direct disk write' },
  { pattern: /shutdown|reboot|poweroff/i, reason: 'System power control' },
  { pattern: /curl.*\|\s*(ba)?sh/i, reason: 'Remote script execution' },
  { pattern: /wget.*\|\s*(ba)?sh/i, reason: 'Remote script execution' },
];

export interface ValidationResult {
  isDangerous: boolean;
  reason?: string;
}

export function validateCommand(command: string): ValidationResult {
  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      return { isDangerous: true, reason };
    }
  }
  return { isDangerous: false };
}
```

### Step 2: Create ConfirmDialog Component
```tsx
// components/editor/ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  command: string;
  reason: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Design: Modal với warning icon, command preview, reason, buttons
// Colors: Yellow/orange warning theme
// Animations: Fade in, slight scale
```

### Step 3: Add Timeout to BashExecutor
```typescript
// In electron/bash-executor.ts
const TIMEOUT_MS = 60000; // 60 seconds

// Set timeout when spawning
const timeout = setTimeout(() => {
  process.kill('SIGTERM');
  // Send timeout error to renderer
}, TIMEOUT_MS);

process.on('close', () => {
  clearTimeout(timeout);
});
```

### Step 4: Keyboard Shortcuts
```tsx
// In ExecutableCodeBlock
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (isFocused) {
        handleRun();
      }
    }
  };
  // Add/remove listener
}, [isFocused]);
```

### Step 5: Accessibility Improvements
- ARIA labels cho tất cả buttons
- Focus management trong dialog
- Screen reader announcements cho status changes
- Keyboard navigation

### Step 6: Error Message Improvements
```typescript
function formatError(error: string, exitCode: number): string {
  // Map common errors to user-friendly messages
  if (error.includes('command not found')) {
    return `Command not found. Make sure it's installed and in PATH.`;
  }
  if (error.includes('permission denied')) {
    return `Permission denied. Try with appropriate permissions.`;
  }
  // etc.
}
```

## Todo List

- [ ] Tạo `lib/utils/command-validator.ts`
- [ ] Tạo `components/editor/ConfirmDialog.tsx`
- [ ] Integrate confirmation flow vào ExecutableCodeBlock
- [ ] Add timeout logic vào bash-executor.ts
- [ ] Add keyboard shortcut (Ctrl+Enter)
- [ ] Add ARIA labels và accessibility
- [ ] Add user-friendly error messages
- [ ] Final testing trên Windows/Mac/Linux

## Success Criteria

- [ ] Dangerous commands show confirmation
- [ ] Timeout kills long-running commands
- [ ] Ctrl+Enter runs focused block
- [ ] Screen reader compatible
- [ ] Error messages helpful
- [ ] Works on all platforms

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| False positives | Allow "Don't ask again" option |
| Missed dangerous commands | Conservative patterns, document limitations |

## Security Considerations

- Document that this is for local development use
- Consider adding opt-in/opt-out in settings
- Log executed commands for audit

## Next Steps

After completion:
- Update documentation
- Create demo/tutorial
- Consider future enhancements (working directory selector, environment variables)
